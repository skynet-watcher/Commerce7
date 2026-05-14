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
| 8 | [`docs/KICKOFF-TOMORROW.md`](KICKOFF-TOMORROW.md) | Access checklist |

**Before coding:** copy [`.env.example`](../.env.example) → `.env` at repo root (never commit `.env`).

---

## 2. Repository layout

| Path | Purpose |
|------|---------|
| **`apps/api`** | Hono + TypeScript. **`PORT`** default **3001**. Loads **repo-root `.env`**. Placeholders: health, OAuth callback stub, webhook stub. |
| **`apps/web`** | Next.js 16 + React 19 + Tailwind. Dev **http://localhost:3000**. Stock starter page. |
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

### Phase A — Before sandbox (or day 0)

Goal: **interfaces, storage, ingestion** without live Commerce7.

1. Define **`Commerce7Client`** (interface) + **`MockCommerce7Client`** + fixtures under `apps/api/fixtures/` (JSON shapes from `docs/developer/resources/*.md`).
2. Add **database** (Postgres or SQLite): migrations for `events`, `webhook_deliveries`, `sync_state` (cursor per tenant/resource).
3. Implement **`POST /.../events`** (Zod-validated analytics events): idempotency, size limits — exercise **T6** (abuse) locally.
4. Harden **`POST /webhooks/commerce7`**: parse, persist raw payload, **idempotent** on order id + `updatedAt`; signature verify **stub** until ADC secret.
5. **Sync runner** (job or route): calls client → mock returns paginated data → persist **`sync_state.cursor`**.
6. **Reconciliation stub**: compare rollup from fixtures vs mock orders — wires **T9** before real data.
7. **Logging**: tenant id on every request path that will be multi-tenant.
8. **T7 gate (written):** document that production click tracking uses **only** Commerce7/merchant **contracts** (e.g. `data-analytics-*`), not ad-hoc CSS selectors.

### Phase B — First day with sandbox

1. ADC: create app version; enable **Read** on **Order**, **Customer** (and **WebHook** if using pushes). Choose **Integration** vs **Full Application** (extensions require Full App — see `docs/developer/app-platform/app-extensions.md`).
2. **T1:** Two-tenant isolation checks (see V1 plan).
3. Replace mock with **HTTP `Commerce7Client`**: Basic Auth (app id + secret), `tenant` header per `docs/developer/api/commerce7-apis.md`.
4. **First live call:** `GET https://api.commerce7.com/v1/order?limit=1` then **cursor** sync.
5. Point webhook URL (ngrok) at handler; validate **T3/T4**.

### Phase C — Analytics product paths

- **Order/customer insights:** cursor sync + dashboards + CSV; nightly **T9** reconciliation vs C7 order totals.
- **Click-level personalization:** requires **browser collector** + contract with C7 or theme; Admin reporting needs **Report extension** + JWT verify per `authenticate-app.md` — see personalization architecture doc.

---

## 5. Commerce7 API essentials (from mirrored docs)

- **Base:** `https://api.commerce7.com/v1/{endpoint}`
- **App auth:** Basic Auth — username = app id, password = App Secret; header **`tenant`** = tenant slug.
- **Pagination:** Prefer **cursor** (`?cursor=start`, …) for orders/customers/products — **no** doc’d rate limit on cursor; page pagination **50**/page, **>100 pages** throttled to **1/min**.
- **Rate limit:** **100 req/min/tenant** (standard).
- **Money:** cents; **dates:** UTC ISO.
- **Webhooks:** can be **disabled after 48h** failure — recreate + reconcile via `web-hook-log` / backfill per app-apis-webhooks doc.

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
- **Do not commit:** `.env`, `node_modules/**`, `apps/web/.next`
- Workflow: feature branches + PRs; merge to `main`; `git push origin main`

---

## 9. Known doc mirror quirks

- Duplicate **titles** on some mirrored pages — use file path + **Source** URL in each `.md`.
- `configure-your-app-version` mirror is a **404 stub**.
- `ui-component-library` is live **Storybook** only.

---

## 10. License / attribution

Mirrored Commerce7 text remains **Commerce7’s**. Original code in this repo is yours to license.

---

*Consolidated handoff — keep in sync when major process changes. Last updated with repo push.*
