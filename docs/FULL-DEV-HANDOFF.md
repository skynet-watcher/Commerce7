# Full developer handoff — Commerce7 monorepo

**Canonical repo:** [https://github.com/skynet-watcher/Commerce7](https://github.com/skynet-watcher/Commerce7) · branch **`main`**  
**Live Commerce7 docs:** [https://developer.commerce7.com/docs/app-development-center](https://developer.commerce7.com/docs/app-development-center) (always wins over mirrored copies in this repo)

This file is the **single consolidated handoff** for engineers joining the project. Shorter entry points: [`HANDOFF.md`](../HANDOFF.md) (subset), [`README.md`](../README.md).

---

## 1. Read in this order

| # | Document | Why |
|---|----------|-----|
| 1 | [`HANDOFF.md`](../HANDOFF.md) | Quick orientation |
| 2 | [`docs/STACK.md`](STACK.md) | Node, pnpm, `apps/api` / `apps/web` |
| 3 | [`docs/EXECUTION-PLAYBOOK.md`](EXECUTION-PLAYBOOK.md) | Spec → ADC → build order |
| 4 | **`docs/plans/V1-RISK-STRESS-TEST-PLAN.md`** | Stress tests **T1–T11**, kill criteria, **maintainability tracker** — run before scaling |
| 5 | **`docs/plans/CUSTOMER-INSIGHTS-MVP.md`** | REST-backed insights / API research |
| 6 | **`docs/plans/PERSONALIZATION-ANALYTICS-ARCHITECTURE.md`** | Click-level collector + Full App Admin reports |
| 7 | [`docs/README.md`](README.md) | Index of mirrored Commerce7 guides |
| 8 | [`docs/IMPLEMENTATION-LOG.md`](IMPLEMENTATION-LOG.md) | **What is built vs planned** (incremental checklist) |
| 9 | [`docs/V1-BUILD-SEQUENCE.md`](V1-BUILD-SEQUENCE.md) | **CI + `pnpm v1:pipeline`** order, Postgres test DB, segment checklist |
| 10 | [`docs/KICKOFF-TOMORROW.md`](KICKOFF-TOMORROW.md) | Access checklist |

**Before coding:** copy [`.env.example`](../.env.example) → `.env` at repo root (never commit `.env`).

---

## 2. Repository layout

| Path | Purpose |
|------|---------|
| **`apps/api`** | Hono — **`/health`**, **`/webhooks/commerce7`**, **`/lifecycle/*`**, **`/sync/orders`**, **`/reconcile/orders`**, **`/v1/app-sync`**, **`/v1/events`**, **`/oauth/callback`**. See **`docs/IMPLEMENTATION-LOG.md`**. |
| **`apps/web`** | Next.js (App Router) + React 19 + Tailwind — **exact release** in `apps/web/package.json` / lockfile (as of repo date, Next **16.x** is current stable on npm). Dev **http://localhost:3000**. Stock starter page. |
| **`docs/developer/**`** | Mirrored Commerce7 guides (by topic). Regenerate: `python3 scripts/fetch_docs.py` |
| **`docs/plans/**`** | Product/engineering plans (Insights, personalization arch, V1 stress tests) |
| **`scripts/fetch_docs.py`** | Pulls public hub docs into `docs/developer/` |

---

## 3. Machine setup & commands

```bash
export PATH="/usr/local/bin:$PATH"   # prefer Homebrew Node over IDE-bundled node
cd /path/to/Commerce7
pnpm install
pnpm dev          # API → http://localhost:3001
pnpm dev:web      # Web → http://localhost:3000
pnpm typecheck
pnpm test
pnpm build
curl -s http://localhost:3001/health
```

**ngrok (OAuth / webhooks in dev):** `ngrok config add-authtoken <token>` then tunnel to API port.

**Doc mirror refresh (optional):**

```bash
python3 -m pip install -r requirements-docs.txt
python3 scripts/fetch_docs.py
```

---

## 4. Build sequence (recommended)

### Phase A — Before sandbox (~3–7 engineer-days; adjust for team size)

**Target:** interfaces, storage, and ingestion **without** live Commerce7. Time-box reviews so this phase does not silently stretch (“Phase A” should not mean “indefinite mock phase”).

1. Define **`Commerce7Client`** (interface) + **`MockCommerce7Client`** + fixtures under `apps/api/fixtures/` (JSON shapes from `docs/developer/resources/*.md`).
2. Add **PostgreSQL** only (locked — see [`STACK.md`](STACK.md)): migrations for `events`, `webhook_deliveries`, `sync_state` (cursor per tenant/resource), and **`tenant_installs`** / **`oauth_sessions`** (or equivalent) for per-tenant OAuth state if the product uses user-level OAuth in iframe/admin flows.
3. **Auth model (write it down before Phase B):**
   - **Server-to-server REST:** Basic Auth (app id + App Secret) + **`tenant`** header — credentials are **global to the app** in env; isolation is by **tenant** on every request.
   - **OAuth (install/admin UI):** store **per-tenant** (or per-install) tokens in Postgres: `access_token`, `refresh_token` (encrypted at rest), `expires_at`, `tenant` slug; implement **refresh before expiry** and a **clear re-auth path** when refresh fails. Do not conflate this with Basic Auth for bulk API sync.
4. Implement **`POST /.../events`** (Zod-validated analytics events): idempotency, size limits — exercise **T6** (abuse) locally.
5. Harden **`POST /webhooks/commerce7`**: parse, persist raw payload, **idempotent** on order id + `updatedAt`; signature verify **stub** until ADC secret.
6. **Sync runner** (job or route): calls client → mock returns paginated data → persist **`sync_state.cursor`**. **429 / backoff:** normative rules in [`STACK.md`](STACK.md) (throttle below cap, exponential backoff + jitter, persist cursor before sleep).
7. **Reconciliation stub:** compare rollup from fixtures vs mock orders — wires **T9** before real data (logical predecessor to Phase B job).
8. **Logging**: tenant id on every request path that will be multi-tenant.
9. **T7 gate (written):** document that production click tracking uses **only** Commerce7/merchant **contracts** (e.g. `data-analytics-*`), not ad-hoc CSS selectors.

### Phase B — First sandbox week (~5–10 engineer-days after ADC access)

1. **ADC — app version (not the broken mirror path):** use the live **App Development Center** at **[https://dev-center.platform.commerce7.com](https://dev-center.platform.commerce7.com)**. In-repo `docs/developer/.../configure-your-app-version.md` is a **404 stub** — follow **Creating an app**, **App APIs & Webhooks**, and version UI there; cite screenshots or internal runbook if you need offline steps.
2. ADC: create app version; enable **Read** on **Order**, **Customer** (and **WebHook** if using pushes). Choose **Integration** vs **Full Application** (extensions require Full App — see `docs/developer/app-platform/app-extensions.md`).
3. **T1:** Two-tenant isolation checks (see V1 plan).
4. Replace mock with **HTTP `Commerce7Client`**: Basic Auth (app id + secret), `tenant` header per `docs/developer/api/commerce7-apis.md`.
5. **First live call:** `GET https://api.commerce7.com/v1/order?limit=1` then **cursor** sync (with 429 policy from [`STACK.md`](STACK.md)).
6. Point webhook URL (ngrok) at handler; validate **T3/T4**.
7. **Reconciliation job (real deliverable, not a stub):** scheduled worker or cron (e.g. nightly + on-demand) that **re-pulls** order totals / cursor windows from Commerce7, compares to local aggregates, **alarms on drift**, and **re-seeds** after webhook outage (Commerce7 may disable webhooks after prolonged failure). Wire evidence to **T9** in the V1 tracker.

### Phase C — Post-V1 / product-dependent (not a committed timeline)

Phase C is **not** sequenced like A/B until the product explicitly commits to personalization or report extensions.

- **Order/customer insights:** mostly delivered in Phase B; ongoing reconciliation above.
- **Click-level personalization:** needs **browser collector** + contract with C7 or theme; Admin reporting needs **Report extension** + JWT verify per `authenticate-app.md` — see **`docs/plans/PERSONALIZATION-ANALYTICS-ARCHITECTURE.md`**. If this is **not** on the roadmap, state that in writing and treat Phase C as **out of scope** for V1.

---

## 4b. Testing & CI (not optional)

- **Unit / module tests:** **Vitest** in `apps/api` (`pnpm --filter @commerce7/api test`). Add tests alongside new modules (Zod parsers, idempotency helpers, sync cursor math).
- **Integration:** exercise webhook + sync against **mock** client in Phase A; add HTTP-level tests against the running app when stable.
- **Stress gates:** **T1–T11** in `docs/plans/V1-RISK-STRESS-TEST-PLAN.md` are **release criteria**, not a substitute for automated tests.
- **CI:** `.github/workflows/ci.yml` — **Node 20**, **Postgres 16** service, `pnpm install`, **typecheck**, **test**, **build** on PRs; extend with web lint when the UI grows.

---

## 5. Commerce7 API essentials (from mirrored docs)

- **Base:** `https://api.commerce7.com/v1/{endpoint}`
- **App auth:** Basic Auth — username = app id, password = App Secret; header **`tenant`** = tenant slug.
- **Pagination:** Prefer **cursor** (`?cursor=start`, …) for orders/customers/products — **no** doc’d rate limit on cursor; page pagination **50**/page, **>100 pages** throttled to **1/min**.
- **Rate limit:** **100 req/min/tenant** (standard).
- **Money:** cents; **dates:** UTC ISO.
- **Webhooks:** can be **disabled after 48h** failure — recreate + reconcile via `web-hook-log` / backfill per app-apis-webhooks doc (Phase B **reconciliation job** is the operational backstop).

Primary references: `docs/developer/api/commerce7-apis.md`, `docs/developer/app-platform/app-apis-webhooks.md`.

---

## 6. Robustness & V1 validation

Do **not** scale click-level claims without passing **T7** (contract-based instrumentation) in `docs/plans/V1-RISK-STRESS-TEST-PLAN.md`.

Non-negotiables (summary): **no cross-tenant leaks**, **idempotent webhooks**, **no app secret in browser**, **reconcile** dashboard money to REST orders, **detect** collector/storefront breakage.

Fill tracker table **T1–T11** in that doc with owner, date, Pass/Fail, evidence.

---

## 7. Risks (architecture)

- **Brittle DOM** for storefront events → **kill** or narrow product claims until official hooks.
- **Attribution** disputes → define windows and methodology in writing.
- **Webhook gaps** → reconciliation job mandatory.
- **JWT / Report iframes** → always verify server-side with `GET /v1/account/user`.
- **Privacy** → minimize fields; retention and delete path.

---

## 8. Git & secrets

- **Remote:** `origin` → `https://github.com/skynet-watcher/Commerce7.git`
- **Default branch:** `main` — `git clone`, then `git pull origin main` before new feature branches.
- **Do not commit:** `.env`, `node_modules/**`, `apps/web/.next`
- **Workflow:** feature branches + PRs into `main`; **CI** (`.github/workflows/ci.yml`) must pass: `pnpm install --frozen-lockfile`, `pnpm typecheck`, `pnpm test` (includes DB integration when `TEST_DATABASE_URL` is set), `pnpm build`.
- Keep **`pnpm-lock.yaml`** in sync: run **`pnpm install`** locally after dependency changes; do not hand-edit the lockfile.

---

## 9. Known doc mirror quirks

- Duplicate **titles** on some mirrored pages — use file path + **Source** URL in each `.md`.
- `configure-your-app-version` mirror is a **404 stub** — for **real** ADC steps, use **[https://dev-center.platform.commerce7.com](https://dev-center.platform.commerce7.com)** and hub pages under [App Development Center](https://developer.commerce7.com/docs/app-development-center).
- `ui-component-library` is live **Storybook** only.

---

## 10. License / attribution

Mirrored Commerce7 text remains **Commerce7’s**. Original code in this repo is yours to license.

---

*Consolidated handoff — keep in sync when major process changes. Last updated with repo push.*
