# Implementation log (incremental build)

Components are delivered **one at a time**: implement → **`pnpm test`** → **commit & push** → update this file.

| # | Component | Status | Tests / notes |
|---|-----------|--------|----------------|
| 1 | **Webhook schema + idempotency** | Done | `webhook/schema.test.ts`, `idempotency.test.ts` |
| 2 | **Webhook HTTP + dedupe store** | Done | `webhook/route.test.ts`, `pg-route.integration.test.ts` |
| 3 | **Postgres persistence** (`webhook_deliveries`, `sync_state`, …) | Done | `db:migrate`, migrations `001`–`005` |
| 4 | **Mock `Commerce7Client` + cursor sync** | Done | `c7/mock-client.test.ts`, `sync/run-order-sync.test.ts` |
| 5 | **HTTP `Commerce7Client`** (Basic Auth + `tenant`, 429 backoff) | Done | `c7/http-client.test.ts`, `http/fetch-with-backoff.test.ts`, `c7/create-client.test.ts` |
| 6 | **`synced_orders` + `OrderRefPersistence`** | Done | `sync/order-persistence.ts`, `run-order-sync` persist option |
| 7 | **`POST /reconcile/orders`** (T9 precursor) | Done | `sync/reconcile.ts`, `reconcile.test.ts`, `sync-route.test.ts` |
| 8 | **`POST /v1/events`** (idempotent analytics sink, 64KB limit) | Done | `events/*`, `events-route.test.ts` |
| 9 | **OAuth callback stub + `oauth_sessions`** | Done | `oauth/*`, `oauth-route.test.ts` |
| 10 | **Optional webhook Basic Auth** (ADC Advanced) | Done | `webhook/basic-auth.ts`, `basic-auth-route.test.ts` |
| 11 | **End-to-end smoke** | Done | `v1-chain.test.ts` |
| 12 | **Postgres V1 integration** | Done | `pg-v1.integration.test.ts` (needs `TEST_DATABASE_URL`) |

**Still not production-complete (see `HANDOFF.md`):** real OAuth **token exchange**, Commerce7-specific **webhook signing** (if not using Basic Auth), cron/broker for scheduled reconciliation, reporting UI.

See also: [`FULL-DEV-HANDOFF.md`](FULL-DEV-HANDOFF.md) Phase A/B sequence.

### API quick reference

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Liveness |
| GET | `/oauth/callback` | Stores query stub when `oauth` store wired and `tenantId` present |
| POST | `/webhooks/commerce7` | Commerce7 webhook envelope |
| POST | `/sync/orders` | `{ tenantId }` — one Commerce7 cursor batch |
| POST | `/reconcile/orders` | `{ tenantId }` — `synced_orders` count vs fresh API walk |
| POST | `/v1/events` | `{ tenantId, clientEventId, name, properties? }` — idempotent analytics |

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
