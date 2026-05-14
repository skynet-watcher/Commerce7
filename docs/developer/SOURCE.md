# Documentation mirror

The Markdown files under `docs/developer/` are **automated exports** of the
public [Commerce7 Developer](https://developer.commerce7.com/) guides. They are
grouped by topic (getting started, app platform, API resources, etc.) for easier navigation in this repo.

- **Canonical source:** [developer.commerce7.com](https://developer.commerce7.com/docs/app-development-center)
- **Copyright:** Content is owned by Commerce7; redistribution may be subject to their terms. Prefer the live site for authoritative, up-to-date documentation.

## Refresh

```bash
python3 -m pip install -r requirements-docs.txt
python3 scripts/fetch_docs.py
```

Outputs:

- Pages under `docs/developer/<category>/`
- `manifest.json` — fetch time and per-page metadata
- `docs/README.md` — generated table of contents

The public hub currently exposes **Guides** only (no separate OpenAPI reference section on the site).
