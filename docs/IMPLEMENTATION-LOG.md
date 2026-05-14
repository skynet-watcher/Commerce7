# Implementation log (incremental build)

Components are delivered **one at a time**: implement → **`pnpm test`** → **commit & push** → update this file.

| # | Component | Status | Tests / notes |
|---|-----------|--------|----------------|
| 1 | **Webhook schema + idempotency** — Zod `commerce7WebhookBodySchema`, `deriveWebhookIdempotencyKey()` | Done | `apps/api/src/webhook/schema.test.ts`, `idempotency.test.ts` |
| 2 | **Webhook HTTP handler + in-memory dedupe store** | Done | `apps/api/src/create-app.ts`, `webhook/store.ts`, `route.test.ts` |
| 3 | **Postgres `webhook_deliveries` + `PgWebhookDeliveryStore`** | Done | `apps/api/migrations/`, `db:migrate`, `pg-route.integration.test.ts` (needs `TEST_DATABASE_URL`) |
| 4 | **`Commerce7Client` mock + sync cursor** | Pending | — |

See also: [`FULL-DEV-HANDOFF.md`](FULL-DEV-HANDOFF.md) Phase A sequence.

### Manual smoke (`POST /webhooks/commerce7`)

```bash
pnpm dev:api
curl -s -X POST http://localhost:3001/webhooks/commerce7 \
  -H 'Content-Type: application/json' \
  -d '{"object":"Order","action":"Update","payload":{"id":"o1","updatedAt":"2024-01-01T00:00:00.000Z"},"tenantId":"demo"}'
```

### Full V1 automation

```bash
pnpm v1:pipeline   # typecheck → migrate (if env) → test → build
```

Details: [`docs/V1-BUILD-SEQUENCE.md`](V1-BUILD-SEQUENCE.md). CI mirrors this with Postgres (see `.github/workflows/ci.yml`).
