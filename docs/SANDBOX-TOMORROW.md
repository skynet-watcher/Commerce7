# Sandbox testing (tomorrow checklist)

Use this when the Commerce7 **sandbox** tenant and **App Development Center** app are wired to your machine or a tunnel.

**Human-only ADC / install / roles:** **[`SANDBOX-HUMAN-SETUP-PLAYBOOK.md`](SANDBOX-HUMAN-SETUP-PLAYBOOK.md)** — full URLs, permissions, and every Commerce7 console step this repo cannot perform for you.

**Current sandbox hardening record:** **[`SANDBOX-HARDENING-LOG.md`](SANDBOX-HARDENING-LOG.md)** — live Commerce7 setup, tunnel URLs used, documentation findings, memory-only smoke results, and known gaps.

## 1. Run both servers

From the repo root:

```bash
pnpm install
pnpm dev:all
```

- **API** (Hono): default [http://localhost:3001](http://localhost:3001)  
- **Web** (Integration console): [http://localhost:3000](http://localhost:3000) — **Cart Carrot / personalization dashboard:** [http://localhost:3000/dashboard](http://localhost:3000/dashboard)  

Equivalent with two terminals: `pnpm dev:api` and `pnpm dev:web`.

## 2. Environment

**API** (repo root `.env` — see [.env.example](../.env.example)):

- `COMMERCE7_CLIENT_ID` / `COMMERCE7_CLIENT_SECRET` for live sandbox API calls (or `COMMERCE7_USE_MOCK=1` for UI-only smoke).
- `DATABASE_URL` if you want Postgres-backed webhooks/sync (optional for a quick pass).
- `INTERNAL_API_TOKEN` optional — if set, paste the same value into the Integration console (and **`/dashboard`** connection settings) under **Operator token** / access token for **sync**, **reconcile**, **POST `/v1/events`**, **POST `/v1/app-sync`**, and **`GET /v1/insights/overview`**.
- `APP_BASE_URL` should include your **web** origin (e.g. `https://your-ngrok.ngrok-free.app`) so the browser can call the API without CORS errors. Using `*` is looser but fine for dev tunnels.

**Web** (`apps/web/.env.local` — copy [apps/web/.env.example](../apps/web/.env.example)):

- `NEXT_PUBLIC_API_URL` — must be a URL the **browser** can reach.  
  - Local: omit or `http://localhost:3001`  
  - Tunnel: `https://your-api-ngrok-url` (not `localhost`)

## 3. ADC / extension URL

In your app version’s extension settings, set the URL to either:

- `https://<your-web-tunnel>/` **or**
- `https://<your-web-tunnel>/app` (same UI)

Commerce7 will append `tenantId`, `account` (JWT), and related query params. The **Integration console** reads them and prefills **Validate session**.

## 4. What to click (happy path)

1. **API health** — confirms the API is up.  
2. **Validate session** — confirms extension JWT against `GET /v1/account/user` (needs `tenant` + JWT).  
3. **Sync orders (one batch)** — needs operator token if `INTERNAL_API_TOKEN` is set.  
4. **Sample webhook** — no operator token; posts a demo payload to `POST /webhooks/commerce7`.

## 5. Tunneling

Typical pattern: two ngrok (or similar) fronts — one for **:3000** (web), one for **:3001** (API). Align `NEXT_PUBLIC_API_URL`, `APP_BASE_URL`, and any ADC callback URLs with those hosts.

## 6. Production note

Do not commit filled `.env` / `.env.local`. The operator token field stores only in **browser localStorage** for convenience during QA.

## 7. Memory-only smoke command

With both servers and tunnels running, run the repeatable sandbox smoke:

```bash
node scripts/sandbox-memory-smoke.mjs
```

Set `C7_API_TUNNEL`, `C7_WEB_TUNNEL`, and `C7_TENANT_ID` when using different tunnel hosts or tenants. This smoke intentionally uses in-memory stores unless `DATABASE_URL` is set.
