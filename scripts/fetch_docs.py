#!/usr/bin/env python3
"""
Download Commerce7 developer guides from developer.commerce7.com (ReadMe hub)
into docs/mirror/ as Markdown. For personal offline reference; copyright remains
with Commerce7 — see docs/mirror/SOURCE.md
"""

from __future__ import annotations

import html
import json
import re
import ssl
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

BASE = "https://developer.commerce7.com"
INDEX_PAGE = f"{BASE}/docs/app-development-center"
OUT_DIR = Path(__file__).resolve().parent.parent / "docs" / "mirror"
USER_AGENT = "Commerce7PluginDocsMirror/1.0 (+local dev; contact repo owner)"


def http_get(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    ctx = ssl.create_default_context()
    with urllib.request.urlopen(req, timeout=90, context=ctx) as resp:
        return resp.read().decode("utf-8", errors="replace")


def discover_slugs_from_hub(html_doc: str) -> list[str]:
    paths = set(
        re.findall(
            r'href="(/docs/[a-zA-Z0-9][a-zA-Z0-9_\-]*)"',
            html_doc,
        )
    )
    return sorted(paths)


def extract_rdmd_html(page: str) -> tuple[str, str]:
    """Return (title, inner_html) for data-testid=\"RDMD\" region."""
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
        # count opening div/section/article (read nested blocks inside RDMD)
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
            "Install html2text: pip3 install html2text\n"
            "Or: python3 -m pip install --user html2text"
        )
    h = html2text.HTML2Text()
    h.ignore_links = False
    h.body_width = 0
    h.single_line_break = True
    return h.handle(inner_html)


def write_manifest(slugs: list[str], results: list[dict]) -> None:
    manifest = {
        "fetched_at_utc": datetime.now(timezone.utc).isoformat(),
        "source": INDEX_PAGE,
        "page_count": len(results),
        "pages": results,
    }
    (OUT_DIR / "manifest.json").write_text(
        json.dumps(manifest, indent=2), encoding="utf-8"
    )


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    print("Fetching hub index…")
    hub_html = http_get(INDEX_PAGE)
    slugs = discover_slugs_from_hub(hub_html)
    if not slugs:
        raise SystemExit("No /docs/ slugs found in hub HTML.")

    results = []
    for k, slug in enumerate(slugs):
        url = f"{BASE}{slug}"
        name = slug.removeprefix("/docs/").strip("/") or "index"
        safe = re.sub(r"[^a-zA-Z0-9._-]+", "_", name) + ".md"
        path = OUT_DIR / safe

        print(f"[{k + 1}/{len(slugs)}] {url}")
        try:
            page = http_get(url)
        except urllib.error.HTTPError as e:
            results.append(
                {"slug": slug, "url": url, "file": safe, "ok": False, "error": str(e)}
            )
            continue

        title, inner = extract_rdmd_html(page)
        inner = strip_noise_inner(inner)
        md = html_to_markdown(inner).strip()
        header = f"# {title}\n\n**Source:** {url}\n\n---\n\n"
        path.write_text(header + md + "\n", encoding="utf-8")
        results.append({"slug": slug, "url": url, "file": safe, "ok": True, "title": title})
        time.sleep(0.35)

    write_manifest(slugs, results)
    ok = sum(1 for r in results if r.get("ok"))
    print(f"Done. Wrote {ok}/{len(slugs)} pages under {OUT_DIR}")


if __name__ == "__main__":
    main()
