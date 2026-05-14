# Commerce7 plugin / app starter

Local workspace for building a [Commerce7](https://www.commerce7.com/) app or
integration using the [App Development Center](https://developer.commerce7.com/docs/app-development-center).

## Commerce7 documentation (offline mirror)

Guide pages from the developer hub are mirrored under `docs/mirror/` as Markdown.
Regenerate them with:

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
3. Implement OAuth / app authentication per `docs/mirror/authenticate-app.md`
   (from the upstream guide).
4. Add your application code (this repo is intentionally minimal until you pick
   a stack).

## License

The **scraped documentation** remains property of Commerce7. Any **original code**
you add to this repository is yours to license as you choose.
