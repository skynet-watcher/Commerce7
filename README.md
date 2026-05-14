# Commerce7 plugin / app starter

Local workspace for building a [Commerce7](https://www.commerce7.com/) app or
integration using the [App Development Center](https://developer.commerce7.com/docs/app-development-center).

**Execution:** When you know what app you are building, start with **[`docs/EXECUTION-PLAYBOOK.md`](docs/EXECUTION-PLAYBOOK.md)** — phased checklist from spec → ADC → build order → validation.

**Before a new project lands:** **[`docs/KICKOFF-TOMORROW.md`](docs/KICKOFF-TOMORROW.md)** (access, env, first hour). Capture requirements with **[`docs/PROJECT-BRIEF-TEMPLATE.md`](docs/PROJECT-BRIEF-TEMPLATE.md)**. Copy **[`.env.example`](.env.example)** to `.env` (gitignored) when you have credentials.

- **DB (local):** `docker compose up -d` — Postgres 16 on port **5432** (see `docker-compose.yml`).
- **V1 automation:** `pnpm v1:pipeline` — typecheck, optional migrate, test, build ([`docs/V1-BUILD-SEQUENCE.md`](docs/V1-BUILD-SEQUENCE.md)).

**Stacks & tooling:** **[`docs/STACK.md`](docs/STACK.md)** — Node 20+ (see `.nvmrc`), pnpm, Hono API, Next.js UI, ngrok. Run **`pnpm install`** then **`pnpm dev`** / **`pnpm dev:web`**.

**Onboarding:** **[`docs/FULL-DEV-HANDOFF.md`](docs/FULL-DEV-HANDOFF.md)** (full) · **[`HANDOFF.md`](HANDOFF.md)** (short).

**Incremental implementation status:** **[`docs/IMPLEMENTATION-LOG.md`](docs/IMPLEMENTATION-LOG.md)**.

**Product planning:** **[`docs/plans/CUSTOMER-INSIGHTS-MVP.md`](docs/plans/CUSTOMER-INSIGHTS-MVP.md)** (Insights MVP + REST research), **[`docs/plans/PERSONALIZATION-ANALYTICS-ARCHITECTURE.md`](docs/plans/PERSONALIZATION-ANALYTICS-ARCHITECTURE.md)** (click-level + Admin reports), **[`docs/plans/V1-RISK-STRESS-TEST-PLAN.md`](docs/plans/V1-RISK-STRESS-TEST-PLAN.md)** (stress tests + robustness tracker).

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

1. **Tooling:** `export PATH="/usr/local/bin:$PATH"` then `pnpm install` (see **`docs/STACK.md`**).
2. Request or use a Commerce7 sandbox (see developer docs).
3. Create an app in the App Development Center; configure APIs, webhooks, and
   extension surfaces you need.
4. Implement OAuth / app authentication in **`apps/api`** per
   [`docs/developer/app-platform/authenticate-app.md`](docs/developer/app-platform/authenticate-app.md).
5. Add or adjust **`apps/web`** for any Admin extension UI.

## Git & GitHub

| Item | Detail |
|------|--------|
| **Repository** | [github.com/skynet-watcher/Commerce7](https://github.com/skynet-watcher/Commerce7) |
| **Default branch** | `main` |
| **Clone** | `git clone https://github.com/skynet-watcher/Commerce7.git` |

**Day-to-day workflow**

1. **Sync:** `git checkout main && git pull origin main`
2. **Branch:** `git checkout -b feature/your-topic`
3. **Commit** with a clear message; keep `.env` and build artifacts out of commits (see `.gitignore`).
4. **Open a PR** into `main`. CI runs **install → typecheck → test → build** (see `.github/workflows/ci.yml`); fix failures before merge.
5. **After merge**, other contributors run `git pull` on `main`. Maintainers can push directly when appropriate:

```bash
git push origin main
```

**Lockfile:** use **`pnpm install`** so `pnpm-lock.yaml` stays consistent; CI uses `pnpm install --frozen-lockfile`.
## License

The **scraped documentation** remains property of Commerce7. Any **original code**
you add to this repository is yours to license as you choose.
