# Implementation log (incremental build)

Components are delivered **one at a time**: implement → **`pnpm test`** → **commit & push** → update this file.

| # | Component | Status | Tests / notes |
|---|-----------|--------|----------------|
| 1 | **Webhook schema + idempotency** — Zod `commerce7WebhookBodySchema`, `deriveWebhookIdempotencyKey()` | Done | `apps/api/src/webhook/schema.test.ts`, `idempotency.test.ts` |
| 2 | **Webhook HTTP handler + in-memory dedupe store** | Pending | — |
| 3 | **Postgres persistence for `webhook_deliveries`** | Pending | — |

See also: [`FULL-DEV-HANDOFF.md`](FULL-DEV-HANDOFF.md) Phase A sequence.
