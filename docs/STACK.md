# Stacks we optimize for

Commerce7 work usually needs **HTTPS callbacks**, **webhooks** (HTTP + signature verification), and sometimes an **Admin iframe UI**. This repo is set up for that shape.

## Default (installed here)

| Layer | Choice | Why |
|--------|---------|-----|
| **Runtime** | **Node.js 26** (Homebrew `/usr/local/bin/node`) | Ecosystem, JSON/HMAC, long-running server |
| **Language** | **TypeScript** | Safer refactors across API + UI |
| **Package manager** | **pnpm 10** workspaces | Fast installs, one lockfile |
| **Application database** | **PostgreSQL** (required — see below) | Multi-tenant production, JSONB, migrations without SQLite→PG rewrite |
| **API / webhooks** | **`apps/api`** — [Hono](https://hono.dev/) on `@hono/node-server` | Small surface for `/oauth/callback` + `/webhooks/*` + collectors |
| **Admin / marketing UI** | **`apps/web`** — **Next.js** (App Router, React 19, Tailwind 4) | Extension pages, SSR; **exact version pinned in `apps/web/package.json`** |
| **Config** | **Zod** + **dotenv** | Parse and validate env before boot |
| **Tunnel** | **ngrok** (Homebrew) | Public HTTPS URL for ADC redirects in dev |
| **Docs mirror** | **Python 3** + `scripts/fetch_docs.py` | Local Commerce7 guides |

### Database decision (locked)

- **Use PostgreSQL everywhere** the app persists tenant data (events, webhooks, sync state, rollups, installs).
- **Local dev:** Docker Compose, Postgres.app, or a shared dev instance — not file-based SQLite, to avoid schema/migration drift before prod.
- **`DATABASE_URL`** in repo-root `.env` (see `.env.example`).

## Next.js version

The **source of truth** is **`apps/web/package.json`** (and `pnpm-lock.yaml`).  
This repo currently pins **Next 16.x** with **`eslint-config-next`** aligned to that release. As of **May 2026**, **Next.js 16** is the current stable major on npm (if an external audit predates that release, treat `package.json` as authoritative).  
When onboarding or auditing, run `pnpm --filter web exec node -e "console.log(require('next/package.json').version)"`.  
Upgrade deliberately: `pnpm --filter web add next@<version> eslint-config-next@<version>` and re-run `pnpm build`.

## Commands

From the repo root (use Homebrew Node: `export PATH="/usr/local/bin:$PATH"` if your shell picks another `node`):

```bash
pnpm install          # after clone or dependency changes
pnpm dev              # API only → http://localhost:3001
pnpm dev:web          # Next.js → http://localhost:3000
pnpm typecheck        # all workspaces that define typecheck
pnpm build            # all packages that define build
pnpm test             # when wired (see FULL-DEV-HANDOFF.md testing section)
```

Copy env template: `cp .env.example .env` and set `PORT=3001`, `DATABASE_URL`, and Commerce7 keys when you have them.

## API sync: rate limits & 429 handling (normative)

Commerce7 documents **100 requests / minute / tenant** for standard API traffic (`docs/developer/api/commerce7-apis.md`). Implementations **must**:

1. **Throttle** outbound C7 requests (token bucket or sliding window) **below** the documented cap to leave headroom.
2. On **HTTP 429** (or retryable 5xx): **exponential backoff with jitter**, cap retries, **persist cursor / watermark before sleep** so a crash does not lose position.
3. Prefer **cursor-based** pagination for large exports; never rely on uncapped parallel page fetches.

## Production deployment (baseline story)

Until a dedicated `docker-compose.prod.yml` or IaC exists, assume:

| Piece | Default direction |
|--------|-------------------|
| **`apps/api`** | Container (Docker) on **Fly.io**, **Railway**, **Render**, or cloud **ECS/Cloud Run** — needs always-on HTTP for webhooks |
| **`apps/web`** | **Vercel** or same provider as API behind a path/hostname |
| **Postgres** | Managed **RDS / Neon / Supabase / Crunchy** — not co-located on a single VM without backups |
| **Secrets** | Provider secret store or **1Password / Doppler** — **never** production secrets only in `.env` on disk |
| **CI** | **GitHub Actions**: `pnpm install`, `pnpm typecheck`, `pnpm test`, `pnpm build` on PR |

Adjust per client infra; document changes in PR when this diverges.

## When to diverge

- **Integration-only script** — small **Python** / **Bun** utility is fine alongside this repo.
- **Heavy jobs** — add **Redis + worker** when sync/report work exceeds API process capacity.
- **Mobile** — out of scope; API remains source of truth.
