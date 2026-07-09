# Deploy guide — Cart Carrot Analytics

Two services to host. Both live in this repo.

---

## Service 1 — Web / Docs (`apps/web`)

**Host: Vercel** (free tier is fine)

1. Go to [vercel.com](https://vercel.com) → **Add New Project** → import `skynet-watcher/Commerce7`
2. Set **Root Directory** → `apps/web`
3. Framework will auto-detect as **Next.js**
4. Under **Environment Variables**, add one variable:
   ```
   NEXT_PUBLIC_API_URL = https://[your-api-url-from-step-2-below]
   ```
   (You'll come back and set this after deploying the API. Leave it blank for now and redeploy once you have the API URL.)
5. Click **Deploy**

Vercel gives you a URL like `https://cart-carrot.vercel.app`. You can point a custom domain at it later.

**What lives here:**
- `/` → redirects to `/docs/getting-started`
- `/docs/*` → setup guides for merchants
- `/receipt` → the purchase tracking iFrame (critical — C7 loads this automatically on every order confirmation)

---

## Service 2 — API (`apps/api`)

**Host: Railway** (simplest option for Node + Postgres together)

### Step A — Provision a database

1. Go to [railway.app](https://railway.app) → **New Project** → **Provision PostgreSQL**
2. Once it's running, click it → **Connect** tab → copy the **DATABASE_URL** (the full `postgresql://...` string)

### Step B — Deploy the API

1. In the same Railway project, click **New** → **GitHub Repo** → select `skynet-watcher/Commerce7`
2. Set **Root Directory** → `apps/api`
3. Railway will detect the `package.json`. Set:
   - **Build command:** `pnpm install && pnpm build`
   - **Start command:** `node dist/index.js`
4. Under **Variables**, add all of the following:

   | Variable | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `DATABASE_URL` | *(paste from Step A)* |
   | `APP_BASE_URL` | `https://[your-railway-api-url]` *(set after first deploy)* |
   | `OAUTH_REDIRECT_URL` | `https://[your-railway-api-url]/oauth/callback` |
   | `COMMERCE7_CLIENT_ID` | *(from ADC — see below)* |
   | `COMMERCE7_CLIENT_SECRET` | *(from ADC — see below)* |
   | `INTERNAL_API_TOKEN` | *(generate a random string, e.g. `openssl rand -hex 32`)* |
   | `LIFECYCLE_BASIC_USER` | *(pick a username, e.g. `c7lifecycle`)* |
   | `LIFECYCLE_BASIC_PASSWORD` | *(generate a random string)* |
   | `BACKGROUND_SYNC_INCLUDE_INSTALLS` | `1` |

5. Click **Deploy**

### Step C — Run database migrations

After the API is deployed and the `DATABASE_URL` is set:

In Railway, open the API service → **Shell** tab (or use the Railway CLI), and run:
```
pnpm db:migrate
```

This creates the tables. Only needs to run once (and again after future schema changes).

---

## After both services are up

### Go back and finish the Vercel env var

In Vercel → your project → **Settings** → **Environment Variables**:
```
NEXT_PUBLIC_API_URL = https://[your-railway-api-url]
```
Then **Redeploy** (Deployments → Redeploy latest).

---

## ADC registrations

Once you have URLs for both services, register the following in the Commerce7 App Development Center:

| ADC field | Value |
|---|---|
| **App type** | Full Application *(not Integration — required for receipt iFrame)* |
| **Frontend Receipt Primary URL** | `https://[vercel-url]/receipt` |
| **OAuth Redirect URI** | `https://[railway-api-url]/oauth/callback` |
| **Install URL** | `https://[railway-api-url]/lifecycle/install` |
| **Uninstall URL** | `https://[railway-api-url]/lifecycle/uninstall` |
| **Webhook URL** | `https://[railway-api-url]/webhooks/commerce7` |
| **Website / Support URL** | `https://[vercel-url]/docs/getting-started` |

After saving the ADC app, copy the **Client ID** and **Client Secret** and add them to Railway as `COMMERCE7_CLIENT_ID` and `COMMERCE7_CLIENT_SECRET`, then redeploy the API.

---

## Checklist

- [ ] API deployed and `/health` (or any route) returns 200
- [ ] `pnpm db:migrate` has run successfully
- [ ] `COMMERCE7_CLIENT_ID` and `COMMERCE7_CLIENT_SECRET` set in Railway
- [ ] Web deployed and `https://[vercel-url]/receipt` loads a blank page (no error)
- [ ] ADC Frontend Receipt Primary URL registered
- [ ] Test: place a sandbox order → confirm a purchase event appears in the database

---

## Questions

Email eric.a.f.jacobsen@gmail.com
