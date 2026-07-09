# Sandbox setup — human-only checklist (for the developer)

This document lists everything **a person with Commerce7 access** must do locally: account permissions, App Development Center (ADC) configuration, tenant install, tunnels, and secrets. It complements **[`SANDBOX-TOMORROW.md`](SANDBOX-TOMORROW.md)** (run the app) and **[`EXECUTION-PLAYBOOK.md`](EXECUTION-PLAYBOOK.md)** §2 (ADC checklist).

**The AI/coding agent cannot:** log into Commerce7, create tenants, configure ADC, or click Install for you.

---

## 1. URLs and consoles (bookmark these)

| What | URL | Notes |
|------|-----|--------|
| **App Development Center** | [https://dev-center.platform.commerce7.com/](https://dev-center.platform.commerce7.com/) | Create/edit app, versions, API modules, webhooks, install URLs, extension URLs, **Test your app** tenant list. |
| **Commerce7 Admin (generic)** | [https://admin.platform.commerce7.com/](https://admin.platform.commerce7.com/) | Login; then you land on a tenant. |
| **Commerce7 Admin (per tenant)** | `https://<tenantId>.admin.platform.commerce7.com/` | `<tenantId>` is the **first segment** of the admin URL (your sandbox slug). |
| **App Store / Apps in Admin** | [https://admin.platform.commerce7.com/app](https://admin.platform.commerce7.com/app) | **Apps & Extensions** — where the client **Install**s your app after **Test mode** grants access. |
| **Public developer docs** | [https://developer.commerce7.com/docs/app-development-center](https://developer.commerce7.com/docs/app-development-center) | Canonical; always check live site for updates. |
| **REST API base** | `https://api.commerce7.com/v1` | Your backend calls this with **Basic Auth** (app id + secret) + **`tenant`** header after install. |
| **App Partner program** (optional sandbox path) | [https://www.commerce7.com/partners-developer-apply](https://www.commerce7.com/partners-developer-apply) | Some teams receive a **sandbox account** via partner onboarding—confirm with your org. |

**In-repo mirror** (offline / search): `docs/developer/` and index [`docs/README.md`](README.md). Refresh: `python3 scripts/fetch_docs.py` (see [`KICKOFF-TOMORROW.md`](KICKOFF-TOMORROW.md)).

---

## 2. Access and roles you must have

- [ ] **Dev Center login** — can open **ADC** and edit **your app**.
- [ ] **Sandbox tenant** — a Commerce7 client you are allowed to test on.
- [ ] **Admin Owner** on that tenant (or someone who can **Install** apps for you).  
  - **Install requires Admin Owner** per Commerce7 docs (mirrored: [`docs/developer/app-platform/test-your-app.md`](developer/app-platform/test-your-app.md)).
- [ ] If the tenant is **owned by someone else:** you may need a **Partner** (or equivalent) user invited on **their** tenant before you can add their `tenantId` in ADC **Test your app**.

---

## 3. Know your `tenantId`

1. Log into **Commerce7 Admin** for the sandbox store.
2. Look at the browser URL: `https://**spectrawinery**.admin.platform.commerce7.com/...` → **`tenantId` = `spectrawinery`** (example).
3. You will paste this value into **ADC → Test your app** and use it in API calls / this repo’s Integration console and **`/dashboard`**.

---

## 4. App Development Center (ADC) — configure the app

Log in at **Dev Center** (table in §1). Open **your app** (or create one — see [**Create an App**](developer/getting-started/create-an-app.md) in the mirror).

Work through **each app version** you use for sandbox:

### 4.1 Copy credentials into your secrets store (not chat, not git)

- **App ID** → maps to repo env **`COMMERCE7_CLIENT_ID`**.
- **App Secret Key** → **`COMMERCE7_CLIENT_SECRET`**.
- Store in **1Password / team vault / ADC-only note**; developer copies into **local** `/.env` only.

### 4.2 API modules / permissions

- In the version settings, enable only the **endpoints (modules)** you need (Order, Customer, Webhook, etc.).
- Cross-check with **`docs/EXECUTION-PLAYBOOK.md`** §1 and product brief.
- Deep reference: mirrored [**APIs & Webhooks**](developer/app-platform/app-apis-webhooks.md).

### 4.3 Webhooks (if used)

- Register the **public HTTPS URL** of your API’s webhook route.  
- **This repo:** `POST /webhooks/commerce7` → e.g. `https://<your-api-host>/webhooks/commerce7`.
- Optional **HTTP Basic** on that route: set **`WEBHOOK_BASIC_USER`** + **`WEBHOOK_BASIC_PASSWORD`** in `.env` and configure the same in ADC if “Advanced” auth is used.
- Behavior and envelope: [`docs/developer/app-platform/webhooks.md`](developer/app-platform/webhooks.md).

### 4.4 Install & Uninstall URLs (lifecycle)

Commerce7 will **POST** to these when the app is installed or removed.

- **This repo:**  
  - `POST /lifecycle/install`  
  - `POST /lifecycle/uninstall`  
- Example: `https://<your-api-host>/lifecycle/install` and `https://<your-api-host>/lifecycle/uninstall`.
- Optional Basic auth: **`LIFECYCLE_BASIC_USER`** + **`LIFECYCLE_BASIC_PASSWORD`** in `.env` if ADC “Installation security” requires it.

### 4.5 Extension / iframe URL (only if you use in-Admin or embedded UI)

- Point to your **web** app’s **HTTPS** URL. This repo’s operator UI can be **`/`** or **`/app`** (same Integration console).
- Example: `https://<your-web-host>/app`  
- Commerce7 will append query params such as **`tenantId`**, **`account`** (JWT).  
- Extensions require a **Full Application** for some surfaces — see [`docs/plans/PERSONALIZATION-ANALYTICS-ARCHITECTURE.md`](plans/PERSONALIZATION-ANALYTICS-ARCHITECTURE.md) and mirrored [**App Extensions**](developer/app-platform/app-extensions.md).

### 4.6 OAuth / redirect URLs (when you wire real OAuth)

- Must **exactly** match what is registered in ADC — see playbook §2 and mirrored OAuth/app docs when you implement Phase B.

### 4.7 **Test your app** (grant sandbox tenant access)

Mirrored guide: [**Test Your App**](developer/app-platform/test-your-app.md).

1. In **ADC → your app version → Test your app**, enter the sandbox **`tenantId`**, click **Add**.
2. That tenant’s admins can then see the **unpublished** app in **Admin → Apps & Extensions**.
3. Install from **Commerce7 Admin** (§5).

> **Important:** Changes made while testing apply like a published app for that tenant—Commerce7 recommends validating on a **sandbox** first.

---

## 5. Install the app on the sandbox tenant

1. Open **Commerce7 Admin** for the sandbox: `https://<tenantId>.admin.platform.commerce7.com/`.
2. Go to **Apps** / **Apps & Extensions** — [direct pattern](https://admin.platform.commerce7.com/app) after login (mirrored docs use this path).
3. Find **your app** (unpublished list when **Test your app** includes this `tenantId`).
4. Click **Install** — user must be **Admin Owner**.

**Uninstall / reinstall:** use Admin UI or trigger **Uninstall URL** per ADC; this repo persists uninstalls when **`POST /lifecycle/uninstall`** is called.

---

## 6. Public HTTPS endpoints for local development (you must provide)

Commerce7 cannot call `http://localhost`. The developer must expose:

| Service | Local port (default) | Public URL pattern | Used for |
|---------|----------------------|--------------------|----------|
| **API** (`apps/api`) | `3001` | `https://<api-tunnel-host>` | Webhooks, lifecycle, browser may call API via `NEXT_PUBLIC_API_URL`. |
| **Web** (`apps/web`) | `3000` | `https://<web-tunnel-host>` | ADC extension URL; serves `/`, `/app`, **`/dashboard`**. |

Common tools: **ngrok**, **Cloudflare Tunnel**, etc. **Two** fronts are typical (one for API, one for web).

**Developer must set:**

- Repo root **`.env`**: **`APP_BASE_URL`** = origin that the **browser** uses for the **web** app (often the `https://<web-tunnel-host>`), for CORS.
- **`apps/web/.env.local`**: **`NEXT_PUBLIC_API_URL`** = `https://<api-tunnel-host>` (no trailing issues—trim in UI if needed).

Details: **[`SANDBOX-TOMORROW.md`](SANDBOX-TOMORROW.md)** §2, §5.

---

## 7. Local env (developer copies values you approved)

From repo root (see **`.env.example`**):

- **`COMMERCE7_CLIENT_ID`**, **`COMMERCE7_CLIENT_SECRET`** — from ADC.
- **`COMMERCE7_API_BASE`** — default `https://api.commerce7.com/v1` unless Commerce7 gives a different base for a special environment.
- **`INTERNAL_API_TOKEN`** (optional) — if set, **same** token must be entered in the Integration console / **`/dashboard`** “operator” / access token field for gated routes.
- **`DATABASE_URL`** (optional) — Postgres for durable webhooks/sync; run **`pnpm --filter @commerce7/api db:migrate`** when needed.
- **`COMMERCE7_USE_MOCK=1`** — only for **offline** dev without C7; **turn off** for real sandbox API.
- **`OAUTH_TOKEN_URL`** (optional) — enables `/oauth/callback` to exchange `code` for tokens server-side; otherwise callback records the code and reports `exchangeStatus: "skipped"`.
- **`OAUTH_CLIENT_ID` / `OAUTH_CLIENT_SECRET`** (optional) — override Commerce7 app credentials for token exchange if Commerce7 gives separate OAuth credentials.
- **`BACKGROUND_SYNC_TENANTS`** (optional) — comma-separated tenantIds for the in-process background order sync scheduler.
- **`BACKGROUND_SYNC_INCLUDE_INSTALLS=1`** (optional) — scheduler also discovers active installs from `app_installs`; use with `DATABASE_URL` for durable multi-tenant scheduling.
- **`BACKGROUND_SYNC_INTERVAL_MS`** (optional) — scheduler cadence, default 15 minutes.

Run: **`pnpm dev:all`** from repo root ([`SANDBOX-TOMORROW.md`](SANDBOX-TOMORROW.md) §1).

---

## 8. Smoke verification (human + developer)

| Step | Where | Success criterion |
|------|--------|-------------------|
| API up | Browser or `curl` to `/health` | JSON `ok: true`. |
| JWT / extension | Integration console **Validate session** with `tenantId` + JWT from URL | **`GET /v1/account/user`** returns 200 (see [`IMPLEMENTATION-LOG.md`](IMPLEMENTATION-LOG.md)). |
| Operator actions | Sync / reconcile / events / app-sync / insights | Only if **`INTERNAL_API_TOKEN`** matches. |
| OAuth callback | ADC callback URL -> **`/oauth/callback`** | Callback is recorded; when `OAUTH_TOKEN_URL` is configured, token metadata is stored server-side. |
| Background sync | Merchant console **Run background sync now** or scheduler | **`/v1/sync/status`** shows latest run state; order count updates in dashboard. |
| Webhook | Trigger real event or ADC test (if available) | **`POST /webhooks/commerce7`** returns 200, idempotent on replay. |
| Install recorded | Your DB or logs | **`POST /lifecycle/install`** hit when app installed (if URL configured). |

Full API list: **[`docs/IMPLEMENTATION-LOG.md`](IMPLEMENTATION-LOG.md)** — “API quick reference”.

---

## 9. If something fails

- **401 from Commerce7 API** — wrong **App ID/Secret**, wrong **`tenant`** header, or app **not installed** on that tenant / missing API permission.
- **CORS in browser** — **`APP_BASE_URL`** must allow the **web** origin; see [`SANDBOX-TOMORROW.md`](SANDBOX-TOMORROW.md).
- **Webhooks never hit** — ADC URL typo, tunnel down, or wrong path (**must** be **`/webhooks/commerce7`** for this codebase).
- **Extension blank** — wrong **extension URL**, or `NEXT_PUBLIC_API_URL` still pointing at localhost while iframe is on HTTPS.

Paste **redacted** request/response (no secrets) into a ticket or chat for engineering help.

---

## 10. Related repo documents (read order for new dev)

1. **[`HANDOFF.md`](../HANDOFF.md)** — architecture + what is implemented.  
2. **[`docs/SANDBOX-TOMORROW.md`](SANDBOX-TOMORROW.md)** — run API + web + env + clicks.  
3. **[`docs/KICKOFF-TOMORROW.md`](KICKOFF-TOMORROW.md)** — access + machine prep.  
4. **[`docs/EXECUTION-PLAYBOOK.md`](EXECUTION-PLAYBOOK.md)** — product mapping + ADC §2.  
5. **[`docs/IMPLEMENTATION-LOG.md`](IMPLEMENTATION-LOG.md)** — exact routes and behavior.  
6. **[`docs/plans/PERSONALIZATION-ANALYTICS-ARCHITECTURE.md`](plans/PERSONALIZATION-ANALYTICS-ARCHITECTURE.md)** — Cart Carrot / collector / Full App reporting context.

---

*Last aligned with repo routes and env names as of the file’s addition. Prefer live Commerce7 docs for ADC UI labels that change over time.*
