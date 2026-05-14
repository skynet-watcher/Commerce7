#!/usr/bin/env python3
"""
Download Commerce7 developer guides from developer.commerce7.com (ReadMe hub)
into docs/developer/<category>/ as Markdown, with cross-links rewritten to
relative paths. For offline reference; see docs/developer/SOURCE.md.
"""

from __future__ import annotations

import html
import json
import os
import re
import ssl
import time
import urllib.error
import urllib.request
from collections import deque
from datetime import datetime, timezone
from pathlib import Path

BASE = "https://developer.commerce7.com"
REPO_ROOT = Path(__file__).resolve().parent.parent
DEV_DOCS = REPO_ROOT / "docs" / "developer"
USER_AGENT = "Commerce7PluginDocsMirror/1.0 (+local dev; contact repo owner)"

# Every known public /docs slug grouped for navigation (unknown slugs → resources/)
SLUG_CATEGORY: dict[str, str] = {
    # Getting started
    "announcements": "getting-started",
    "commerce7-developer-docs": "getting-started",
    "app-development-center": "getting-started",
    "create-an-app": "getting-started",
    "creating-an-app": "getting-started",
    # Building & running an app
    "authenticate-app": "app-platform",
    "test-your-app": "app-platform",
    "app-extensions": "app-platform",
    "app-apis-webhooks": "app-platform",
    "webhooks": "app-platform",
    "app-sync": "app-platform",
    "custom-app-data": "app-platform",
    "installs": "app-platform",
    # App Store lifecycle
    "create-yourapp-listing": "app-store",
    "marketing-your-app": "app-store",
    "pricing": "app-store",
    "getting-paid": "app-store",
    "submit-publish-your-app": "app-store",
    "releasing-a-new-version": "app-store",
    "app-security-policy": "app-store",
    # API concepts
    "commerce7-apis": "api",
    "api-versioning": "api",
    # REST resource reference (domain entities)
    "client-settings": "resources",
    "club-memberships": "resources",
    "clubs": "resources",
    "collections": "resources",
    "coupons": "resources",
    "customer-addresses": "resources",
    "customer-credit-cards": "resources",
    "customers": "resources",
    "departments": "resources",
    "fulfillment": "resources",
    "gift-cards": "resources",
    "inventory": "resources",
    "inventory-location": "resources",
    "notes": "resources",
    "orders": "resources",
    "products": "resources",
    "promotions": "resources",
    "reservation-types": "resources",
    "reservations": "resources",
    "shipping": "resources",
    "tags": "resources",
    "taxes": "resources",
    "vendors": "resources",
    "wine-appellations": "resources",
    "wine-varietals": "resources",
    # Community & account
    "partner-slack-community-guidelines": "community",
    "your-team": "community",
    # Discovered via in-page links (BFS)
    "apps": "app-platform",
    "managing-your-app": "community",
    "configure-your-app-version": "app-platform",
    "get-your-app-ready-to-publish": "app-store",
    "ui-component-library": "app-platform",
    # Version-suffixed entity guides (same topic family as base slugs)
    "products-1": "resources",
    "orders-1": "resources",
    "inventory-1": "resources",
    "customers-1": "resources",
    "clubs-1": "resources",
    "reservations-2": "resources",
}

DISCOVER_SEEDS = [
    "/",
    "/docs/app-development-center",
]

CATEGORY_ORDER = [
    ("getting-started", "Getting started"),
    ("app-platform", "App platform"),
    ("app-store", "App Store"),
    ("api", "API overview"),
    ("resources", "API resources (by entity)"),
    ("community", "Community & account"),
]


def http_get(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    ctx = ssl.create_default_context()
    with urllib.request.urlopen(req, timeout=90, context=ctx) as resp:
        return resp.read().decode("utf-8", errors="replace")


def slugs_from_html(html_doc: str) -> set[str]:
    found = set(
        re.findall(
            r'href="(/docs/[a-zA-Z0-9][a-zA-Z0-9_\-]*)"',
            html_doc,
        )
    )
    return {s.rstrip("/") for s in found}


def page_url(path: str) -> str:
    return BASE + "/" if path == "/" else BASE + path


def discover_all_slugs() -> list[str]:
    queue: deque[str] = deque(DISCOVER_SEEDS)
    fetched: set[str] = set()
    doc_slugs: set[str] = set()

    while queue:
        path = queue.popleft()
        if path in fetched:
            continue
        fetched.add(path)
        url = page_url(path)
        print(f"Discover: {url}")
        try:
            body = http_get(url)
        except urllib.error.HTTPError as e:
            print(f"  skip (HTTP {e.code})")
            continue
        for slug in slugs_from_html(body):
            doc_slugs.add(slug)
            if slug not in fetched:
                queue.append(slug)
        time.sleep(0.15)

    return sorted(doc_slugs)


def slug_to_filename(slug: str) -> str:
    name = slug.removeprefix("/docs/").strip("/") or "index"
    return re.sub(r"[^a-zA-Z0-9._-]+", "_", name) + ".md"


def category_for_slug(slug: str) -> str:
    key = slug.removeprefix("/docs/").strip("/")
    cat = SLUG_CATEGORY.get(key)
    if not cat:
        print(f"WARN: slug {slug!r} has no category; using resources/")
        return "resources"
    return cat


def extract_rdmd_html(page: str) -> tuple[str, str]:
    title_m = re.search(r"<title>([^<]*)</title>", page)
    title = html.unescape(title_m.group(1).strip()) if title_m else ""

    m = re.search(r'<div[^>]*data-testid="RDMD"[^>]*>', page)
    if not m:
        return title, ""
    start = m.end()
    depth = 1
    i = start
    n = len(page)
    while i < n and depth > 0:
        lt = page.find("<", i)
        if lt == -1:
            break
        if page.startswith("<!--", lt):
            end = page.find("-->", lt)
            i = end + 3 if end != -1 else n
            continue
        if page.startswith("</div", lt):
            depth -= 1
            gt = page.find(">", lt)
            i = gt + 1 if gt != -1 else n
            if depth == 0:
                return title, page[start:lt]
            continue
        tag = re.match(r"<(div|section|article)\b", page[lt:])
        if tag:
            depth += 1
        i = lt + 1
    return title, ""


def strip_noise_inner(inner: str) -> str:
    inner = re.sub(r"<style[^>]*>.*?</style>", "", inner, flags=re.DOTALL | re.I)
    return inner


def html_to_markdown(inner_html: str) -> str:
    try:
        import html2text
    except ImportError:
        raise SystemExit(
            "Install html2text: python3 -m pip install -r requirements-docs.txt"
        )
    h = html2text.HTML2Text()
    h.ignore_links = False
    h.body_width = 0
    h.single_line_break = True
    return h.handle(inner_html)


def slug_key(slug: str) -> str:
    return slug.removeprefix("/docs/").strip("/")


def build_slug_paths(slugs: list[str]) -> dict[str, Path]:
    """Map /docs/foo -> relative Path docs/developer/category/foo.md from REPO_ROOT."""
    out: dict[str, Path] = {}
    for slug in slugs:
        cat = category_for_slug(slug)
        fn = slug_to_filename(slug)
        out[slug] = Path("docs") / "developer" / cat / fn
    return out


def relative_md_link(from_file: Path, to_repo_path: Path) -> str:
    rel = os.path.relpath(to_repo_path, from_file.parent)
    return rel.replace("\\", "/")


def rewrite_doc_links(md: str, from_repo_file: Path, slug_paths: dict[str, Path]) -> str:
    """Point /docs/... and absolute Commerce7 /docs URLs to local files."""

    link_re = re.compile(
        r"\]\((?:https://developer\.commerce7\.com)?(/docs/[a-zA-Z0-9][a-zA-Z0-9_\-]*)"
        r"(?:\?[^)]*)?\)"
    )

    def repl_path(m: re.Match) -> str:
        slug = m.group(1).rstrip("/")
        if slug not in slug_paths:
            return m.group(0)
        target = REPO_ROOT / slug_paths[slug]
        if target.resolve() == from_repo_file.resolve():
            return m.group(0)
        r = relative_md_link(from_repo_file, target)
        return f"]({r})"

    return link_re.sub(repl_path, md)


def cleanup_stale_pages(slug_paths: dict[str, Path]) -> None:
    """Remove *.md in category folders that are not part of the latest crawl."""
    targets = {(REPO_ROOT / p).resolve() for p in slug_paths.values()}
    for cat, _ in CATEGORY_ORDER:
        d = DEV_DOCS / cat
        if not d.is_dir():
            continue
        for f in d.glob("*.md"):
            if f.resolve() not in targets:
                f.unlink()


def write_manifest(slugs: list[str], pages: list[dict]) -> None:
    manifest = {
        "fetched_at_utc": datetime.now(timezone.utc).isoformat(),
        "source_site": BASE,
        "discovery_seeds": DISCOVER_SEEDS,
        "page_count": len(pages),
        "pages": pages,
    }
    (DEV_DOCS / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")


def write_index(pages: list[dict]) -> None:
    by_cat: dict[str, list[dict]] = {}
    for p in pages:
        if not p.get("ok"):
            continue
        by_cat.setdefault(p["category"], []).append(p)

    lines = [
        "# Commerce7 developer documentation (local mirror)",
        "",
        f"**Canonical site:** [{BASE}]({BASE}/docs/app-development-center)",
        "",
        "Pages below are an offline export for quick lookup. Prefer the live site",
        "for the latest content.",
        "",
        "## Contents by section",
        "",
    ]
    for cat_id, title in CATEGORY_ORDER:
        items = sorted(by_cat.get(cat_id, []), key=lambda x: x["title"].lower())
        if not items:
            continue
        lines.append(f"### {title} (`{cat_id}/`)")
        lines.append("")
        for p in items:
            rel = p["path_from_docs"]
            lines.append(f"- [{p['title']}]({rel})")
        lines.append("")

    lines.append("---\n")
    lines.append("*Regenerate with `python3 scripts/fetch_docs.py`*\n")
    (REPO_ROOT / "docs" / "README.md").write_text("\n".join(lines), encoding="utf-8")

    dev_readme = [
        "# Developer docs mirror",
        "",
        "See the [documentation index](../README.md) for a full table of contents.",
        "",
        "- `manifest.json` — fetch metadata and paths",
        "- `SOURCE.md` — attribution and refresh instructions",
        "",
    ]
    (DEV_DOCS / "README.md").write_text("\n".join(dev_readme), encoding="utf-8")


def main() -> None:
    # Remove previous flat mirror if present (legacy layout)
    legacy = REPO_ROOT / "docs" / "mirror"
    if legacy.is_dir():
        for child in legacy.iterdir():
            if child.is_file():
                child.unlink()
        try:
            legacy.rmdir()
        except OSError:
            pass

    DEV_DOCS.mkdir(parents=True, exist_ok=True)
    for cat, _ in CATEGORY_ORDER:
        (DEV_DOCS / cat).mkdir(exist_ok=True)

    print("Discovering all /docs pages…")
    slugs = discover_all_slugs()
    if not slugs:
        raise SystemExit("No /docs slugs discovered.")

    slug_paths = build_slug_paths(slugs)
    pages: list[dict] = []

    for k, slug in enumerate(slugs):
        url = f"{BASE}{slug}"
        cat = category_for_slug(slug)
        fn = slug_to_filename(slug)
        repo_relpath = Path("docs") / "developer" / cat / fn
        out_file = REPO_ROOT / repo_relpath

        print(f"[{k + 1}/{len(slugs)}] {url}")
        try:
            page = http_get(url)
        except urllib.error.HTTPError as e:
            note = f"**Mirror error:** `{e}` (this URL may have moved or been removed).\n\n**Try:** [{url}]({url})\n"
            if e.code == 404:
                note = (
                    "This page returned **404 Not Found** while mirroring. "
                    "It may still be linked from other guides but no longer exists "
                    "under this slug.\n\n"
                    f"**URL:** [{url}]({url})\n"
                )
            title_guess = slug_key(slug).replace("-", " ").title()
            header_lines = [
                f"# {title_guess}",
                "",
                f"**Source:** [{url}]({url})",
                "",
                f"**Section:** {cat.replace('-', ' ')}",
                "",
                "---",
                "",
            ]
            out_file.write_text("\n".join(header_lines) + note, encoding="utf-8")
            pages.append(
                {
                    "slug": slug,
                    "url": url,
                    "title": title_guess,
                    "category": cat,
                    "file": fn,
                    "path_from_docs": f"developer/{cat}/{fn}",
                    "ok": True,
                    "degraded": True,
                    "error": str(e),
                }
            )
            continue

        title, inner = extract_rdmd_html(page)
        if not inner:
            print(f"  WARN: no RDMD body for {slug}")
        inner = strip_noise_inner(inner)
        if not inner.strip():
            low = page.lower()
            if "storybook" in low and "@storybook/core" in low:
                md = (
                    "Commerce7 embeds **Storybook** here. It is a client-rendered app, "
                    "so it cannot be fully represented as static Markdown in this mirror.\n\n"
                    f"**Browse components (live):** [{url}]({url})\n"
                )
            else:
                md = (
                    "_No standard guide body was found for this page (layout may differ)._ "
                    "Use the live page for full content.\n\n"
                    f"**Open:** [{url}]({url})\n"
                )
        else:
            md = html_to_markdown(inner).strip()
        md = rewrite_doc_links(md, out_file, slug_paths)

        header_lines = [
            f"# {title}",
            "",
            f"**Source:** [{url}]({url})",
            "",
            f"**Section:** {cat.replace('-', ' ')}",
            "",
            "---",
            "",
        ]
        out_file.write_text("\n".join(header_lines) + md + "\n", encoding="utf-8")
        pages.append(
            {
                "slug": slug,
                "url": url,
                "title": title,
                "category": cat,
                "file": fn,
                "path_from_docs": f"developer/{cat}/{fn}",
                "ok": True,
            }
        )
        time.sleep(0.35)

    cleanup_stale_pages(slug_paths)
    write_manifest(slugs, pages)
    write_index(pages)
    ok = sum(1 for p in pages if p.get("ok"))
    print(f"Done. Wrote {ok}/{len(slugs)} pages under {DEV_DOCS}")


if __name__ == "__main__":
    main()
