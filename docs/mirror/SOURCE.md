# Documentation mirror

The Markdown files in this directory are **automated exports** of the public
[Commerce7 Developer](https://developer.commerce7.com/) guides for convenient
local search while building an app or integration.

- **Canonical source:** [https://developer.commerce7.com/docs/app-development-center](https://developer.commerce7.com/docs/app-development-center)
- **Copyright:** Content is owned by Commerce7; redistribution may be subject
  to their terms. Prefer the live site for authoritative, up-to-date docs.

Refresh the mirror:

```bash
python3 -m pip install -r requirements-docs.txt
python3 scripts/fetch_docs.py
```

See `manifest.json` for fetch time and per-page status.
