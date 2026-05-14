# V1 build sequence

This is the **ordered checklist** the team uses while delivering V1: each segment should be **built → unit/integration tested → wired to prior segments → documented** before moving on.

## Automated pipeline

From the repo root:

```bash
pnpm v1:pipeline
```

This runs (see `scripts/v1-pipeline.sh`):

1. **`pnpm typecheck`** — all workspaces.  
2. **`pnpm --filter @commerce7/api db:migrate`** — runs only if **`TEST_DATABASE_URL`** or **`DATABASE_URL`** is set (applies SQL under `apps/api/migrations/`).  
3. **`pnpm test`** — includes Postgres integration tests when **`TEST_DATABASE_URL`** is set (same pattern as CI).  
4. **`pnpm build`**.

**CI** (`.github/workflows/ci.yml`) mirrors this on **Node 20** with a **Postgres 16** service and **`TEST_DATABASE_URL`** set so **webhook** and **`sync_state`** integration tests run every PR.

## Segment order (see also `docs/IMPLEMENTATION-LOG.md`)

| Order | Deliverable | Interconnection smoke |
|-------|-------------|------------------------|
| 1 | Webhook Zod schema + idempotency | Unit tests only |
| 2 | `POST /webhooks/commerce7` + in-memory dedupe | `src/v1-chain.test.ts` + route tests |
| 3 | `webhook_deliveries` table + `PgWebhookDeliveryStore` | `pg-route.integration.test.ts` + `v1-chain` |
| 4 | **`Commerce7Client` + `MockCommerce7Client` + `sync_state` + `POST /sync/orders`** | Extended `v1-chain.test.ts`, `sync/*.test.ts`, `pg-sync-state.integration.test.ts` |
| *Next* | HTTP `Commerce7Client` (Basic Auth + `tenant`) + sandbox | Phase B |

## Local Postgres (optional)

```bash
docker compose up -d
export DATABASE_URL=postgresql://commerce7:commerce7@localhost:5432/commerce7_app_dev
export TEST_DATABASE_URL="$DATABASE_URL"
pnpm --filter @commerce7/api db:migrate
pnpm test
```

## Node version

Use **Node 20 LTS** for `next build` and CI (see root `.nvmrc`). Newer Node lines may print a **`module.register()` deprecation** during Next.js builds until upstream switches to `registerHooks`.
