# Implementation log (incremental build)

Components are delivered **one at a time**: implement → **`pnpm test`** → **commit & push** → update this file.

| # | Component | Status | Tests / notes |
|---|-----------|--------|----------------|
| 1 | **Webhook schema + idempotency** — Zod `commerce7WebhookBodySchema`, `deriveWebhookIdempotencyKey()` | Done | `apps/api/src/webhook/schema.test.ts`, `idempotency.test.ts` |
| 2 | **Webhook HTTP handler + in-memory dedupe store** | Done | `apps/api/src/create-app.ts`, `webhook/store.ts`, `route.test.ts` |
| 3 | **Postgres `webhook_deliveries` + `PgWebhookDeliveryStore`** | Done | `apps/api/migrations/`, `db:migrate`, `pg-route.integration.test.ts` (needs `TEST_DATABASE_URL`) |
| 4 | **`Commerce7Client` mock + `sync_state` + `POST /sync/orders`** | Done | `apps/api/src/c7/*`, `sync/*`, migration `002_sync_state.sql`, `v1-chain.test.ts` |
| 5 | **HTTP `Commerce7Client` (Basic Auth + tenant)** | Pending | Phase B |

See also: [`FULL-DEV-HANDOFF.md`](FULL-DEV-HANDOFF.md) Phase A sequence.

### Manual smoke (`POST /webhooks/commerce7`)

```bash
pnpm dev:api
curl -s -X POST http://localhost:3001/webhooks/commerce7 \
  -H 'Content-Type: application/json' \
  -d '{"object":"Order","action":"Update","payload":{"id":"o1","updatedAt":"2024-01-01T00:00:00.000Z"},"tenantId":"demo"}'
```

### Manual smoke (`POST /sync/orders` — mock client, cursor batches)

```bash
pnpm dev:api
curl -s -X POST http://localhost:3001/sync/orders \
  -H 'Content-Type: application/json' \
  -d '{"tenantId":"demo"}'
```

Call twice: first response has `"completedWalk": false` and `"persistedCursor": "page-2"`; second finishes the mock catalog walk (`"completedWalk": true`).

### Full V1 automation

```bash
pnpm v1:pipeline   # typecheck → migrate (if env) → test → build
```

Details: [`docs/V1-BUILD-SEQUENCE.md`](V1-BUILD-SEQUENCE.md). CI mirrors this with Postgres (see `.github/workflows/ci.yml`).
