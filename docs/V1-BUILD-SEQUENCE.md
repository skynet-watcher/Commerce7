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

**CI** (`.github/workflows/ci.yml`) mirrors this on **Node 20** with a **Postgres 16** service and **`TEST_DATABASE_URL`** so **webhook**, **`sync_state`**, **`synced_orders`**, **`analytics_events`**, and **`oauth_sessions`** integration tests can run every PR.

## Segment order (see also `docs/IMPLEMENTATION-LOG.md`)

| Order | Deliverable | Interconnection smoke |
|------|-------------|------------------------|
| 1 | Webhook Zod schema + idempotency | Unit tests |
| 2 | `POST /webhooks/commerce7` + stores | `v1-chain.test.ts` |
| 3 | Postgres tables + migrations | Integration tests with `TEST_DATABASE_URL` |
| 4 | Mock / HTTP `Commerce7Client` + `sync_state` | `create-client.test.ts`, `http-client.test.ts` |
| 5 | `synced_orders` + sync persistence | `run-order-sync.test.ts` |
| 6 | `POST /reconcile/orders` | `reconcile.test.ts`, `sync-route.test.ts` |
| 7 | `POST /v1/events` | `events-route.test.ts`, `v1-chain` |
| 8 | OAuth stub + `oauth_sessions` | `oauth-route.test.ts`, `v1-chain` |
| 9 | Webhook optional Basic Auth | `basic-auth-route.test.ts` |
| *Next (prod hardening)* | Token exchange, signing, scheduled jobs, authz on internal routes | — |

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
