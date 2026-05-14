# Stacks we optimize for

Commerce7 work usually needs **HTTPS callbacks** (OAuth), **webhooks** (HTTP + signature verification), and sometimes an **Admin iframe UI**. This repo is set up for that shape.

## Default (installed here)

| Layer | Choice | Why |
|--------|---------|-----|
| **Runtime** | **Node.js 26** (Homebrew `/usr/local/bin/node`) | Ecosystem, JSON/HMAC, long-running server |
| **Language** | **TypeScript** | Safer refactors across API + UI |
| **Package manager** | **pnpm 10** workspaces | Fast installs, one lockfile |
| **API / webhooks** | **`apps/api`** — [Hono](https://hono.dev/) on `@hono/node-server` | Small surface, easy routes for `/oauth/callback` + `/webhooks/*` |
| **Admin / marketing UI** | **`apps/web`** — **Next.js 16** (App Router, React 19, Tailwind 4) | Natural fit for extension pages, SSR, env separation |
| **Config** | **Zod** + **dotenv** | Parse and validate env before boot |
| **Tunnel** | **ngrok** (Homebrew) | Public HTTPS URL for ADC redirect while developing |
| **Docs mirror** | **Python 3** + `scripts/fetch_docs.py` | Already used for local Commerce7 guides |

## Commands

From the repo root (use Homebrew Node: `export PATH="/usr/local/bin:$PATH"` if your shell picks another `node`):

```bash
pnpm install          # after clone or dependency changes
pnpm dev              # API only → http://localhost:3001
pnpm dev:web          # Next.js → http://localhost:3000
pnpm typecheck        # all workspaces that define typecheck
pnpm build            # all packages that define build
```

Copy env template: `cp .env.example .env` and set `PORT=3001` for the API (default in code) plus Commerce7 keys when you have them.

## When to diverge

- **Integration-only script** — a small **Python** or **Bun** script is fine; keep using this repo for docs + ADC notes.
- **Heavy background jobs** — add **Redis + a worker** (BullMQ, Graphile Worker, etc.) beside `apps/api` when you outgrow inline handlers.
- **Mobile** — out of scope here; API stays the source of truth.

## Security note

We bumped **Next.js to 16.2.6** to pick up patched releases (avoid deprecated 15.3.1 with known advisories). Re-run `pnpm --filter web add next@latest eslint-config-next@latest` periodically.
