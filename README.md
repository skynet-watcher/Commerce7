# Commerce7 plugin / app starter

Local workspace for building a [Commerce7](https://www.commerce7.com/) app or
integration using the [App Development Center](https://developer.commerce7.com/docs/app-development-center).

**Execution:** When you know what app you are building, start with **[`docs/EXECUTION-PLAYBOOK.md`](docs/EXECUTION-PLAYBOOK.md)** — phased checklist from spec → ADC → build order → validation.

**Before a new project lands:** **[`docs/KICKOFF-TOMORROW.md`](docs/KICKOFF-TOMORROW.md)** (access, env, first hour). Capture requirements with **[`docs/PROJECT-BRIEF-TEMPLATE.md`](docs/PROJECT-BRIEF-TEMPLATE.md)**. Copy **`/.env.example`** to `.env` (gitignored) when you have credentials.

## Commerce7 documentation (offline mirror)

Guide pages from the developer hub are mirrored under **`docs/developer/`** by
topic, with a generated index at **[`docs/README.md`](docs/README.md)**.

Regenerate with:

```bash
python3 -m pip install -r requirements-docs.txt
python3 scripts/fetch_docs.py
```

Always treat [developer.commerce7.com](https://developer.commerce7.com/) as the
source of truth.

## Next steps for your plugin

1. Request or use a Commerce7 sandbox (see developer docs).
2. Create an app in the App Development Center; configure APIs, webhooks, and
   extension surfaces you need.
3. Implement OAuth / app authentication per
   [`docs/developer/app-platform/authenticate-app.md`](docs/developer/app-platform/authenticate-app.md)
   (mirrored from the upstream guide).
4. Add your application code (this repo is intentionally minimal until you pick
   a stack).

## Publish to GitHub

This folder is a git repository on your machine at `/Users/eric/commerce7-plugin`.
The GitHub CLI (`gh`) is installed here, but you are not logged in yet. To create
the repo under your account and push:

```bash
gh auth login
cd /Users/eric/commerce7-plugin
gh repo create commerce7-plugin --public --source=. --remote=origin --push
```

Use another name instead of `commerce7-plugin` if you prefer. If the remote already exists, run `git remote remove origin` first or pass a different remote name.

## License

The **scraped documentation** remains property of Commerce7. Any **original code**
you add to this repository is yours to license as you choose.
