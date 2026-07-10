# Implementation log (incremental build)

Components are delivered **one at a time**: implement → **`pnpm test`** → **commit & push** → update this file.

| # | Component | Status | Tests / notes |
|---|-----------|--------|----------------|
| 1 | **Webhook schema + idempotency** | Done | `webhook/schema.test.ts`, `idempotency.test.ts` |
| 2 | **Webhook HTTP + dedupe store** | Done | `webhook/route.test.ts`, `pg-route.integration.test.ts` |
| 3 | **Postgres persistence** (`webhook_deliveries`, `sync_state`, …) | Done | `db:migrate`, migrations `001`–`006` |
| 4 | **Mock `Commerce7Client` + cursor sync** | Done | `c7/mock-client.test.ts`, `sync/run-order-sync.test.ts` |
| 5 | **HTTP `Commerce7Client`** (Basic Auth + `tenant`, 429 backoff) | Done | `c7/http-client.test.ts`, `http/fetch-with-backoff.test.ts`, `c7/create-client.test.ts` |
| 6 | **`synced_orders` + `OrderRefPersistence`** | Done | `sync/order-persistence.ts`, `run-order-sync` persist option |
| 7 | **`POST /reconcile/orders`** (T9 precursor) | Done | `sync/reconcile.ts`, `reconcile.test.ts`, `sync-route.test.ts` |
| 8 | **`POST /v1/events`** (idempotent analytics sink, 64KB limit) | Done | `events/*`, `events-route.test.ts` |
| 9 | **OAuth callback + optional token exchange + `oauth_sessions`** | Done | `oauth/*`, `token-exchange.ts`, `oauth-route.test.ts` |
| 10 | **Optional webhook Basic Auth** (ADC Advanced) | Done | `webhook/basic-auth.ts`, `basic-auth-route.test.ts` |
| 11 | **End-to-end smoke** | Done | `v1-chain.test.ts` |
| 12 | **Postgres V1 integration** | Done | `pg-v1.integration.test.ts` (needs `TEST_DATABASE_URL`) |
| 13 | **`POST /lifecycle/install` / `uninstall`** (ADC Install/Uninstall URL) | Done | `lifecycle/*`, `lifecycle-route.test.ts`, `pg-v1` |
| 14 | **Optional internal Bearer** on sync / reconcile / **POST** analytics & app-sync / **`GET /v1/insights/overview`** | Done | `auth/internal-bearer.ts`, `internal-auth-route.test.ts` |
| 15 | **`POST /v1/app-sync`** (push status to Commerce7 Admin on an object) | Done | `c7/app-sync-schema.ts`, `http-client.ts`, `app-sync-route.test.ts`, `v1-chain` |
| 16 | **`GET /v1/account/user`** (proxy extension `account` / `appToken` JWT) | Done | `account-user-route.test.ts`, `http-client.test.ts`, `v1-chain` |
| 17 | **Integration console UI** (`apps/web`, `/` + `/app`) | Done | Manual sandbox QA — [`SANDBOX-TOMORROW.md`](SANDBOX-TOMORROW.md) |
| 18 | **Analytics by `properties.surface` + `GET /v1/insights/overview` + Cart Carrot / personalization dashboard** (`/dashboard`) | Done | `events/analytics-contract.ts`, `events/analytics-store.ts`, `insights/*`, `insights-route.test.ts`, `events/analytics-store.test.ts`, `apps/web/src/app/dashboard`, `v1-chain` |
| 19 | **Background order sync runner + merchant controls** | Done | `sync/background-scheduler.ts`, `GET /v1/sync/status`, `POST /v1/sync/run`, explicit tenant env, active-install discovery, `sync-route.test.ts`, `integration-console.tsx` |
| 20 | **Production gates + scheduled reconcile** | Done | Configurable HMAC webhook verifier (`webhook/signature.test.ts`), production env guards, active-install reconcile worker (`reconcile-scheduler.test.ts`), Next.js security headers |
| 21 | **Winery marketing assistant** (`/assistant`) | Done | Merchant-facing checkup → recommendation → results flow (`apps/web/src/components/winery-assistant.tsx`); 8-strategy catalog grouped by goal with a browse-all library (recommendation-forward, user can start any play directly); message editable at confirm; make-your-own-play builder (goal/audience/placement/offer); optional discounts per play (percent or free shipping, auto-ending at the review date — future POST /promotion in Commerce7); live insights with sample-data fallback; strategies persist in localStorage; `?demo=1` seeds a client-demo strategy; verified in browser light/dark + mobile |
| 22 | **Strategies API — offer → C7 promotion with auto-expiry + honest verdicts** | Done | `POST /v1/strategies` (creates a Commerce7 promotion via `POST /promotion` with `endDate` = review date when an offer is present; strategy survives a failed push with `promotionError`), `GET /v1/strategies` (server-computed before/after verdicts from `analytics_events` baselines), `POST /v1/strategies/:id/end` (ends early and ends the promotion), migration `007_strategies.sql`, `strategies-route.test.ts` (9 tests), assistant UI pushes on start and ends on remove ("Live — discount active" chip) |

**Still not production-complete (see `HANDOFF.md`):** hosted durable scheduler / queue, encrypted token storage, end-to-end confirmation of webhook security settings in ADC, and hardened extension UI beyond the current dashboard/console. Admin extension auth: gateway **`GET /v1/account/user`** proxies Commerce7 **`GET /account/user`** — pass the **same `Authorization` value** your iframe received (often the **raw JWT**, not `Bearer …`; see authenticate-app doc).

**Webhook security:** Commerce7 mirrored docs in this repo document ADC “Advanced” HTTP Basic. The API also supports configurable HMAC verification for environments that expose a signing secret/header. Production boot requires **either** webhook Basic Auth or **`WEBHOOK_SIGNATURE_SECRET`**, plus **`INTERNAL_API_TOKEN`** for operator routes.

See also: [`FULL-DEV-HANDOFF.md`](FULL-DEV-HANDOFF.md) Phase A/B sequence.

### API quick reference

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Liveness |
| GET | `/v1/account/user` | `?tenantId=` + **`Authorization`** — proxies Commerce7 **`GET /account/user`** (extension JWT; **not** gated by `INTERNAL_API_TOKEN`); requires `sync` / client wired |
| GET | `/oauth/callback` | Stores callback query when `oauth` store wired and `tenantId` present; exchanges `code` if `OAUTH_TOKEN_URL` + client credentials are configured |
| GET | `/oauth/status` | `?tenantId=` — token/session status without exposing token values (Bearer if `INTERNAL_API_TOKEN` set) |
| POST | `/webhooks/commerce7` | Commerce7 webhook envelope |
| POST | `/lifecycle/install` | Commerce7 **Install URL** — JSON or form body; `tenantId` + installer + client settings (passthrough `raw`) |
| POST | `/lifecycle/uninstall` | Commerce7 **Uninstall URL** — `{ tenantId }` |
| POST | `/sync/orders` | `{ tenantId }` — one Commerce7 cursor batch (`Authorization: Bearer` if `INTERNAL_API_TOKEN` set) |
| GET | `/v1/sync/status` | `?tenantId=` optional — background sync runner state (Bearer if configured) |
| POST | `/v1/sync/run` | `{ tenantId }` — merchant-facing immediate background sync run (Bearer if configured) |
| POST | `/reconcile/orders` | `{ tenantId }` — `synced_orders` count vs fresh API walk (Bearer if configured) |
| POST | `/v1/app-sync` | `tenantId` + ADC app-sync fields — forwards to Commerce7 **`POST /app-sync`** (Bearer if `INTERNAL_API_TOKEN` set); requires `sync` / client wired |
| GET | **`/v1/insights/overview`** | **`?tenantId=`** — Cart Carrot / personalization aggregates from **`/v1/events`** (by `properties.surface`), order-walk context, conversion-like event counts; **session→order attribution not computed here**. Bearer if `INTERNAL_API_TOKEN` set; requires **`sync`** + **`analytics`** stores |
| POST | `/v1/events` | `{ tenantId, clientEventId, name, properties? }` — idempotent analytics (Bearer if configured). Tag Cart Carrot / blocks with **`properties.surface`**: `cart_carrot` \| `personalization_block`; use **`name`** for funnel steps (`click`, `add_to_cart`, `purchase`, …). See `events/analytics-contract.ts`. |

### Scheduled reconcile worker

Set `ENABLE_SCHEDULED_RECONCILE=1` to run the in-process worker from `apps/api/src/index.ts`.
It lists active installs from `app_installs`, runs order sync batches for each tenant, and then runs the existing reconcile check.
Tune `RECONCILE_INTERVAL_MS` and `RECONCILE_MAX_SYNC_BATCHES_PER_TENANT` for production load. Use an external cron/queue instead if your hosting platform does not keep API processes warm.

### Extension JWT (`GET /v1/account/user`)

Commerce7 passes an **`account`** (Admin) or **`appToken`** (storefront) query param. Your UI should call this API with **`Authorization`** set to that token value and **`tenantId`** matching the tenant. See [User Authentication](https://developer.commerce7.com/docs/authenticate-app).

```bash
curl -s "http://localhost:3001/v1/account/user?tenantId=your-tenant" \
  -H "Authorization: PASTE_RAW_JWT_FROM_ACCOUNT_QUERY_PARAM"
```

### Manual smoke (`POST /v1/app-sync`)

Requires app credentials (`COMMERCE7_CLIENT_ID` / `COMMERCE7_CLIENT_SECRET`) and a real `tenantId` / `objectId` in Commerce7. If **`INTERNAL_API_TOKEN`** is not set, omit the **`Authorization`** header.

```bash
curl -s -X POST http://localhost:3001/v1/app-sync \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_INTERNAL_TOKEN' \
  -d '{"tenantId":"your-tenant","objectType":"Order","objectId":"<uuid>","status":"Success"}'
```

### Manual smoke (`POST /webhooks/commerce7`)

```bash
pnpm dev:api
curl -s -X POST http://localhost:3001/webhooks/commerce7 \
  -H 'Content-Type: application/json' \
  -d '{"object":"Order","action":"Update","payload":{"id":"o1","updatedAt":"2024-01-01T00:00:00.000Z"},"tenantId":"demo"}'
```

### Manual smoke (`POST /sync/orders` — mock or live client)

With **`COMMERCE7_CLIENT_ID`** + **`COMMERCE7_CLIENT_SECRET`** set (and `COMMERCE7_USE_MOCK` not `1`), the server uses **`HttpCommerce7Client`** against `COMMERCE7_API_BASE`.

### Full V1 automation

```bash
pnpm v1:pipeline   # typecheck → migrate (if env) → test → build
```

Details: [`docs/V1-BUILD-SEQUENCE.md`](V1-BUILD-SEQUENCE.md). CI mirrors with Postgres (`.github/workflows/ci.yml`).

### Fixture sample

Cursor-shaped order list: `apps/api/fixtures/order-list-cursor-page.json` (mirrors `orders` API; see mirrored developer docs).
