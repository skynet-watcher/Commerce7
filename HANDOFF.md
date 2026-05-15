# Developer handoff — Commerce7 integration

This document orients a new engineer on **what exists today**, **how to run it**, and **sensible next steps**. Treat the live Commerce7 developer site as canonical; local copies are for speed and search.

**Full single-document handoff (print / share):** **[`docs/FULL-DEV-HANDOFF.md`](docs/FULL-DEV-HANDOFF.md)**

### Team: read in this order

1. **[`docs/FULL-DEV-HANDOFF.md`](docs/FULL-DEV-HANDOFF.md)** — **complete** handoff (build order, sandbox vs not, links) — or this shorter **`HANDOFF.md`**  
2. **[`docs/STACK.md`](docs/STACK.md)** — Node, pnpm, `apps/api` / `apps/web`  
3. **[`docs/EXECUTION-PLAYBOOK.md`](docs/EXECUTION-PLAYBOOK.md)** — spec → ADC → build order  
4. **[`docs/plans/V1-RISK-STRESS-TEST-PLAN.md`](docs/plans/V1-RISK-STRESS-TEST-PLAN.md)** — **V1: stress-test each function; tracker T1–T11; kill criteria**  
5. **[`docs/plans/CUSTOMER-INSIGHTS-MVP.md`](docs/plans/CUSTOMER-INSIGHTS-MVP.md)** — API-backed insights baseline  
6. **[`docs/plans/PERSONALIZATION-ANALYTICS-ARCHITECTURE.md`](docs/plans/PERSONALIZATION-ANALYTICS-ARCHITECTURE.md)** — storefront collector + Full App reports  
7. **[`docs/README.md`](docs/README.md)** — mirrored Commerce7 guides index  
8. **[`docs/KICKOFF-TOMORROW.md`](docs/KICKOFF-TOMORROW.md)** — access / first hour  

`main` on GitHub should always contain these; **clone/pull before starting**.

---

## 1. Repository

| Item | Value |
|------|--------|
| **GitHub** | [https://github.com/skynet-watcher/Commerce7](https://github.com/skynet-watcher/Commerce7) |
| **Default branch** | `main` |
| **Local path (Eric’s machine)** | `/Users/eric/commerce7-plugin` — use your own clone path |

---

## 2. Product intent (fill in)

The business requirements should live in a copy of **`docs/PROJECT-BRIEF-TEMPLATE.md`** (or your ticket system). If that copy does not exist yet, schedule a short session with the PM or client and complete **§1–§3** (outcome, access, workflows) before large refactors.

---

## 3. Architecture in this repo

| Path | Role |
|------|------|
| **`apps/api`** | **Node + TypeScript + Hono** — intended for OAuth callbacks, webhook receivers, and server-side calls to `api.commerce7.com`. Listens on **`PORT`** (default **3001**). Loads **repo-root `.env`**. |
| **`apps/web`** | **Next.js 16** + React 19 + Tailwind — intended for any merchant-facing or Admin extension UI. Dev server default **http://localhost:3000**. |
| **`docs/developer/`** | **Mirrored** Commerce7 guides (Markdown), grouped by topic. **Not** the legal source of truth. |
| **`scripts/fetch_docs.py`** | Regenerates **`docs/developer/`** and **`docs/README.md`** from the public hub. |
| **`.env.example`** | Template for secrets and URLs — **never commit** a filled `.env`. |

**Already implemented (V1 backbone):**

- API: `GET /health`, `GET /`, **`GET /oauth/callback`** (stub: persists raw query when **`oauth_sessions`** store is wired and `tenantId` is present).
- API: **`POST /webhooks/commerce7`** — Zod body, **idempotent** deliveries; **`PgWebhookDeliveryStore`** when **`DATABASE_URL`** is set (run **`pnpm --filter @commerce7/api db:migrate`**). Optional **HTTP Basic** gate when **`WEBHOOK_BASIC_USER`** + **`WEBHOOK_BASIC_PASSWORD`** are both set (ADC “Advanced”).
- API: **`POST /sync/orders`** — cursor sync using **`MockCommerce7Client`** or **`HttpCommerce7Client`** (`COMMERCE7_CLIENT_ID` + **`COMMERCE7_CLIENT_SECRET`**; optional **`COMMERCE7_USE_MOCK=1`** to force mock). **`sync_state`** + optional **`synced_orders`** persistence. Optional **`INTERNAL_API_TOKEN`** — when set, requires **`Authorization: Bearer …`** on **sync / reconcile / analytics / app-sync**.
- API: **`POST /reconcile/orders`** — compares **`synced_orders`** count to a fresh full API walk (needs Postgres order persistence + HTTP client).
- API: **`POST /v1/app-sync`** — validated proxy to Commerce7 **[App Sync](https://developer.commerce7.com/docs/app-apis-webhooks#2-app-sync)** (`POST /app-sync`); same optional **`INTERNAL_API_TOKEN`** Bearer gate as sync/reconcile/analytics. Registered only when **`sync`** (Commerce7 client) is configured.
- API: **`POST /v1/events`** — idempotent analytics sink (**`tenantId` + `clientEventId`**, 64KB max); optional **`INTERNAL_API_TOKEN`** Bearer gate.
- API: **`GET /v1/account/user`** — proxies Commerce7 **[GET /account/user](https://developer.commerce7.com/docs/authenticate-app)** for Admin extension **`account`** (or storefront **`appToken`**) JWT validation. Query **`tenantId`**, header **`Authorization`** = token string from Commerce7 (often **raw JWT**, not necessarily `Bearer …`). **Not** gated by **`INTERNAL_API_TOKEN`**. Requires **`sync`** client (same as other C7 routes in this app).
- API: **`POST /lifecycle/install`** and **`POST /lifecycle/uninstall`** — targets for Commerce7 ADC **Install URL** / **Uninstall URL** (JSON or form body); persisted in **`app_installs`**. Optional **`LIFECYCLE_BASIC_USER`** + **`LIFECYCLE_BASIC_PASSWORD`** (ADC Installation security).
- Web: **Next.js Integration console** at **`apps/web`** (`/` and **`/app`**) — exercise health, extension JWT validation, sync/reconcile (with operator token), webhooks. See **`docs/SANDBOX-TOMORROW.md`**. Run **`pnpm dev:all`**. Local env: **`apps/web/.env.example`**.

**Not production-complete (next):**

- Commerce7-specific **webhook signing** if Basic is not used; **extension UI** / hardening beyond **`GET /v1/account/user`** gateway; scheduled reconciliation / broker per brief. See **`docs/IMPLEMENTATION-LOG.md`**. (**`INTERNAL_API_TOKEN`** already gates operator-only routes when configured.)

Background reading for ordering work: **`docs/EXECUTION-PLAYBOOK.md`**.

---

## Progress without Commerce7 sandbox

If **sandbox, tenant, or App Development Center access** is not available yet, you are **not stuck**. Expect roughly **40–60% of engineering** to still move if the product brief is clear.

**You can still do:**

- **Spec and mapping** — Fill **`docs/PROJECT-BRIEF-TEMPLATE.md`**, complete **`docs/EXECUTION-PLAYBOOK.md`** §0–§1 using mirrored guides under **`docs/developer/`** and **`docs/README.md`**.
- **Repo and infra** — Dependencies, logging, DB schema, deployment skeleton, error handling, config validation (`apps/api` / `apps/web`).
- **Non-Commerce7 integrations** — Any third-party APIs, internal services, batch logic; unit tests with fixtures.
- **OAuth plumbing** — Routes, state/CSRF, session storage, redirects — with **mocked** token responses until real Commerce7 OAuth is available.
- **Webhook plumbing** — HTTP handler, parsing, idempotency, queues — using **fake payloads** or samples from docs; final **signature verification** needs real ADC secrets.
- **Extension UI** — Build **`apps/web`** against **mock** tenant/user/JWT context; swap in real Commerce7 context once installs work.

**You cannot complete without access:**

- ADC app setup, redirect URLs, API permissions, webhook subscriptions, **test installs**.
- **Real** OAuth token exchange and **authenticated** `api.commerce7.com` calls.
- **Production-accurate** webhook signing verification and end-to-end “event in C7 → your app → side effect” validation.

**Suggested no-access sequence:** own your data model and core workflows first; put Commerce7 behind a **small client interface** (e.g. `Commerce7Client`) and implement a **mock adapter** for local dev. Unblock the team with a flag such as `COMMERCE7_MOCK=1` if useful.

More detail: **`docs/EXECUTION-PLAYBOOK.md`** — **§3 When sandbox access is delayed**.

---

## 4. Machine setup

### Required

1. **Node.js** — Prefer **Homebrew Node** so the version matches the team. Put it first on `PATH`:

   ```bash
   export PATH="/usr/local/bin:$PATH"
   node -v   # expect v20+; repo tested with Node 26
   ```

2. **pnpm** — `npm install -g pnpm` (or use Corepack). The repo pins **`packageManager`** in root **`package.json`**.

3. **Install dependencies** (from repo root):

   ```bash
   cd /path/to/Commerce7
   pnpm install
   ```

### Strongly recommended for Commerce7 OAuth

- **ngrok** (or Cloudflare Tunnel) so you have a **stable HTTPS URL** for redirect URIs registered in the App Development Center.

  ```bash
  ngrok version
  ngrok config add-authtoken <token>   # once per machine
  ```

### Optional

- **Python 3** + `pip install -r requirements-docs.txt` if you need to **refresh** mirrored docs.

---

## 5. Environment variables

1. Copy **`/.env.example` → `/.env`** at the **repository root** (same directory as **`pnpm-workspace.yaml`**).
2. `apps/api` resolves `.env` from that root (see **`apps/api/src/env.ts`**).
3. When OAuth is wired, **`OAUTH_REDIRECT_URL`** must **exactly** match what is configured in Commerce7’s App Development Center (often an ngrok URL during development).
4. **`COMMERCE7_CLIENT_ID`** / **`COMMERCE7_CLIENT_SECRET`** come from the ADC — store in a team secret manager when you leave local-only development.

---

## 6. Day-to-day commands

From repo root (`PATH` with Homebrew Node first):

```bash
pnpm dev          # API only — http://localhost:3001
pnpm dev:web      # Next.js — http://localhost:3000
pnpm typecheck    # TypeScript across workspaces
pnpm build        # Production builds (where defined)
```

Quick API check:

```bash
curl -s http://localhost:3001/health
```

---

## 7. Documentation map

| Document | Purpose |
|-----------|---------|
| **[`docs/STACK.md`](docs/STACK.md)** | Why Node / Hono / Next / ngrok |
| **[`docs/EXECUTION-PLAYBOOK.md`](docs/EXECUTION-PLAYBOOK.md)** | Spec → ADC → build order |
| **[`docs/KICKOFF-TOMORROW.md`](docs/KICKOFF-TOMORROW.md)** | Access and first-hour checklist |
| **[`docs/README.md`](docs/README.md)** | Index of **all** mirrored Commerce7 guide pages |
| **[`docs/developer/SOURCE.md`](docs/developer/SOURCE.md)** | Attribution + how to refresh mirrors |

High-signal Commerce7 topics for most apps (mirrored paths):

- **Auth / API** — `docs/developer/app-platform/authenticate-app.md`, `docs/developer/api/commerce7-apis.md`
- **Webhooks** — `docs/developer/app-platform/webhooks.md`
- **Extensions** — `docs/developer/app-platform/app-extensions.md`
- **Test installs** — `docs/developer/app-platform/test-your-app.md`

Refresh mirrors:

```bash
python3 -m pip install -r requirements-docs.txt
python3 scripts/fetch_docs.py
```

---

## 8. Git workflow (suggestion)

- **Feature branches** off `main`; open **PRs** for review.
- **Stay current:** `git checkout main && git pull origin main` before starting new work or branching.
- **Do not commit** `.env`, `node_modules`, or `apps/web/.next` (see `.gitignore`).
- **CI:** merging requires a green run — **typecheck**, **test**, **build** on every PR (`.github/workflows/ci.yml`). Use **`pnpm install`** so `pnpm-lock.yaml` stays valid (`--frozen-lockfile` in CI).
- After merging, **`git push origin main`** is usually already done via the GitHub merge button; otherwise push from your machine per your team’s release process.
---

## 9. Known quirks

- Some mirrored pages share duplicate **titles** on the hub; use the **file path** and **Source** URL in each Markdown file to disambiguate.
- **`docs/developer/app-platform/configure-your-app-version.md`** is a **404 stub** — the slug still appeared in hub navigation; verify on the live site if you need that content.
- **`ui-component-library`** is **Storybook** in the browser — see the note in that mirrored file; it cannot be fully captured as static Markdown.

---

## 10. Suggested first sprint (technical)

Order minimizes rework (aligns with **`docs/EXECUTION-PLAYBOOK.md`**):

1. Confirm **ADC app** + **sandbox tenant** + **minimum API scopes** with stakeholders.
2. Implement **OAuth token exchange** and **persistent tenant/install mapping** in **`apps/api`**.
3. Prove **one Commerce7 read and one write** with real credentials.
4. Add **webhook** endpoint + **signature verification** + idempotent handling.
5. Only then invest heavily in **`apps/web`** or async jobs.

---

## 11. Questions?

- **Commerce7 behavior / policy** — official docs and support channels via [developer.commerce7.com](https://developer.commerce7.com/docs/app-development-center).
- **This repo’s structure** — **`docs/STACK.md`** and code comments in **`apps/api/src/index.ts`**.

---

*Last updated to match repo layout at handoff time; bump this section when onboarding materials change.*
