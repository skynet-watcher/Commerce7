# Implementation log (incremental build)

Components are delivered **one at a time**: implement → **`pnpm test`** → **commit & push** → update this file.

| # | Component | Status | Tests / notes |
|---|-----------|--------|----------------|
| 1 | **Webhook schema + idempotency** — Zod `commerce7WebhookBodySchema`, `deriveWebhookIdempotencyKey()` | Done | `apps/api/src/webhook/schema.test.ts`, `idempotency.test.ts` |
| 2 | **Webhook HTTP handler + in-memory dedupe store** | Done | `apps/api/src/create-app.ts`, `webhook/store.ts`, `route.test.ts` |
| 3 | **Postgres persistence for `webhook_deliveries`** | Pending | — |

See also: [`FULL-DEV-HANDOFF.md`](FULL-DEV-HANDOFF.md) Phase A sequence.

### Manual smoke (`POST /webhooks/commerce7`)

```bash
pnpm dev:api
curl -s -X POST http://localhost:3001/webhooks/commerce7 \
  -H 'Content-Type: application/json' \
  -d '{"object":"Order","action":"Update","payload":{"id":"o1","updatedAt":"2024-01-01T00:00:00.000Z"},"tenantId":"demo"}'
```

Repeat the same `curl`; second response should have `"duplicate": true`.
