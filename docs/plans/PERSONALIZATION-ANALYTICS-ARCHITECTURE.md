# Personalization & cart analytics — how click-level tracking can work with Commerce7

The public **Commerce7 developer docs** in this repo describe **REST APIs**, **webhooks**, and **app extensions** (Admin and Frontend V2). They do **not** document **“Cart Carrot”**, **“personalization blocks”**, or a first-party **storefront analytics** pipe by name. Below is a **workable architecture** that fits what *is* documented, plus **explicit gaps** to close with Commerce7 or merchants.

---

## 1. Doc-backed constraints you must design around

### 1.1 In-Admin dashboards = **Full Application**, not Integration-only

Extensions (pages, reports, iframes in Admin) are **not available** to integration-only apps.

```8:9:docs/developer/app-platform/app-extensions.md
**App extensions are available for full applications only. If you 're building an integration only app, you won't see this area.**
```

So the CS-friendly “**live in Commerce7 UI**” requirement implies shipping a **Full Application** (at least for merchants who need embedded reports), even if most compute lives on your infrastructure.

### 1.2 Admin / storefront extension surfaces

**Admin** supports **Report** extensions (iframe URLs under Order / Finance / Customer / Club / Inventory report areas).

```26:27:docs/developer/app-platform/app-extensions.md
  * **Report**: Adds a report to one of Commerce7's existing report categories.  
Location options: Order Report, Finance Report, Customer Report, Club Report, Inventory Report
```

**Frontend V2 (shopper site)** allows **Page** (Frontend Profile) and **iFrame** slots on receipt and customer dashboard — **not** the main PLP/PDP/cart canvas.

```57:59:docs/developer/app-platform/app-extensions.md
**Frontend V2 (online store)**
  * Page: Frontend Profile
  * iFrame: Frontend Receipt Primary, Frontend Receipt Secondary, Frontend Dashboard Primary, Frontend Dashboard Secondary.
```

So: **native product listing + cart + cart carrot** are **outside** the documented iframe extension slots. Click tracking there is **not** delivered by “drop in an extension URL” alone.

### 1.3 Authenticating users in embedded pages

Admin passes **`account`** JWT in the URL; **frontend** passes **`appToken`** instead. Your backend verifies by calling `GET https://api.commerce7.com/v1/account/user` with `Authorization` + `tenant` header.

```12:20:docs/developer/app-platform/authenticate-app.md
If your app makes a request from its extension inside Commerce7, Commerce7 will pass a JWT Token as an account variable in the URL. (If your app displays on a frontend website as opposed to inside of the Commerce7 Admin, you'll receive an "appToken" in place of the "account" parameter.)
...
  * Take that account token (or appToken if using Frontend) and send it back to us by making a GET request.  
**`GET`** `https://api.commerce7.com/v1/account/user`
```

Use this for **who can view the analytics report** in Admin.

### 1.4 Optional: stash attribution payloads on C7 objects (`appData`)

Your app can attach JSON under `appData` on several object types when **writing** via API — useful for **storing last-known campaign id** or **experiment variant**, not for raw click streams.

```12:14:docs/developer/app-platform/custom-app-data.md
To add app data to an object in Commerce7, when you create or update the object via Commerce7 APIs you can include the additional `appData` node.
**Available object types**  
`['Order', 'Cart', 'Customer', 'Customer Address', 'Club Membership', 'Product', 'Reservation']`
```

---

## 2. Reference architecture: three telemetry layers

Think of click-level personalization analytics as **three layers**. You will almost certainly need **more than REST polling** for layer B.

### Layer A — **Operational truth (server-side)**

- **Webhooks** (order created/updated, customer, cart if available) → your collector normalizes events.
- **REST** for backfill, reconciliation, and dimensions (products, promotions) using **cursor pagination** where applicable (see `docs/developer/api/commerce7-apis.md`).

**What it gives you:** revenue, conversions, funnel **outcomes**.  
**What it does *not* give you:** impression/click on a specific carrot or block unless that information is **also** sent in Layer B or encoded into order/cart metadata.

### Layer B — **Storefront behavior (client-side instrumentation)**  *(this is the “whole point” for clicks)*

You need a **first-party browser pipeline** on the merchant’s **Frontend V2** storefront:

1. **Lightweight JS snippet** (hosted by you, versioned) injected into the storefront theme — *merchant or agency installs it* (same class of work as GTM unless Commerce7 provides a global injection point — **not described in our mirrored docs**).
2. Snippet responsibilities:
   - Generate or resume a **stable anonymous `sessionId`** (first-party cookie or `localStorage` + rotation rules).
   - Emit structured events: `impression`, `click`, `add_to_cart`, `checkout_started`, etc.
   - Payload includes at minimum: `tenantId`, `timestamp`, `eventType`, `surface` (e.g. `cart_carrot`, `personalization_block`), `elementId` / `campaignId` / **stable DOM/data attributes** your team agrees on with implementations.
   - **POST** to **`https://your-collector.example/events`** (your `apps/api` or edge). **Never** put Commerce7 App Secret in this JS (doc warns secrets are backend-only).

```39:40:docs/developer/api/commerce7-apis.md
> **Do not** place your **App Secret Key** in your javascript as this can be found by other users. Your key must be added through your backend files.
```

3. **Link session → customer/order** when:
   - Shopper logs in (if you can read a **non-secret** customer token or ID exposed to the page — **verify with Commerce7**), **or**
   - **`order` webhook** arrives: join on `cartId` / session correlation if you stored `sessionId` → `cartId` client-side and/or server-side.

Without this layer (or without Commerce7 giving you **official DOM hooks / dataLayer events** for Cart Carrot and personalization blocks), you **cannot** honestly claim **click-level** analytics for those surfaces.

### Layer C — **Presentation in Commerce7 Admin**

- **Report extension** iframes load your SPA; URL carries `account` JWT; your backend verifies and returns HTML/JS for **aggregates** (funnels, CTR, revenue attributed under your rules).
- Requires **Full Application** + extension config (`commerce7.js` + `commerce7.css` per extension docs).

```146:153:docs/developer/app-platform/app-extensions.md
## 
Report
  1. To add a Report, after clicking **Add Extension** , for **Location** , select one of the following: Order Report, Finance Report, Customer Report, Club Report, Inventory Report.
...
  4. Add in a **Page iFrame URL** and optionally set **iFrame Height**. A scrollbar will display if the height exceeds this.
...
  6. On your page, you'll need to include the following Commerce7 javascript. It will allow the iFrame and the Commerce7 platform to communicate sizes properly.  
`<script type="text/javascript" src="https://dev-center.platform.commerce7.com/v2/commerce7.js"></script>`
```

---

## 3. “Cart carrot” and “personalization blocks” specifically

Because these are **product features**, not API primitives in the mirror:

| Approach | Pros | Cons |
|---------|------|------|
| **Official Commerce7 events / data attributes** (from C7 PM/engineering) | Stable selectors, supported | Requires **partnership**; not in public doc set we mirrored |
| **Contract with merchant theme** (data-attributes on rendered blocks) | Testable per client | Fragile across theme versions |
| **Heuristic DOM selectors** | Fast POC | High break risk, support burden |
| **Infer from orders only** (promo lines, tags, collections) | No storefront JS | **Not** click-level; attribution is weak |

**Plan:** treat storefront instrumentation as **versioned SDK + schema**; negotiate **stable IDs** for each block/carrot instance with Commerce7 or the merchant.

### 3.5 This monorepo: event sink + dashboard

The codebase includes a **browser → API event sink** and a **standalone dashboard** so you can rehearse Cart Carrot / personalization analytics before Commerce7 **Report** extensions exist:

| Piece | Behavior |
|-------|----------|
| **Ingest** | `POST /v1/events` — include **`properties.surface`**: `cart_carrot` or `personalization_block`; use **`name`** for funnel steps (`impression`, `click`, `add_to_cart`, `purchase`, …). Contract notes: `apps/api/src/events/analytics-contract.ts`. |
| **Aggregates** | `GET /v1/insights/overview?tenantId=` — per-surface totals, Cart Carrot / personalization slices, store-wide counts for purchase-like **`name`** values. **Session → order attribution** (“did this carrot cause the sale?”) is **not** computed in this endpoint; it still requires webhook + correlation id work described in Layer A/B above. |
| **UI** | Next.js **`/dashboard`** — reads the overview JSON; **`/`** / **`/app`** remain the operator Integration console. |

API table and implementation rows: **`docs/IMPLEMENTATION-LOG.md`**.

---

## 4. Attribution model (example)

Define explicitly (product + legal):

1. **Click window** — e.g. click → order paid within 7/14/30 days.
2. **Priority** — last-touch vs linear; how to handle multiple personalization exposures.
3. **Identity** — anonymous session until login/checkout; **GDPR/CCPA** consent for marketing analytics if required.

Technically: store **event stream** (cheap object storage or OLAP-friendly DB), roll up nightly + real-time counters for the Admin iframe.

---

## 5. What to ask Commerce7 (checklist)

Questions not answerable from mirrored docs alone:

1. Is there a **supported** way to inject analytics JS on **all** Frontend V2 pages (not only iframe slots)?
2. Do **Cart Carrot** and **personalization blocks** emit **data attributes**, **analytics hooks**, or **`postMessage`** via `commerce7.js`?
3. Can checkout expose a **non-sensitive** correlation id (cart/session) to the snippet for webhook join?
4. Any **rate limits** or **policies** for high-volume event ingest from browsers?
5. For **Full Application**: minimum viable extension set for App Store review while you still offer backend-only features.

---

## 6. How this relates to the Customer Insights MVP

- **REST + webhooks** remain the backbone for **truth on money and orders**.
- **Personalization analytics** adds **Layer B (snippet)** + **Full App report extensions** for CS.
- Expect **two workstreams**: storefront SDK + Admin reporting app.

---

## 7. Doc references (this repo)

| Topic | Path |
|--------|------|
| Extensions & Full App requirement | `docs/developer/app-platform/app-extensions.md` |
| `account` / `appToken` auth | `docs/developer/app-platform/authenticate-app.md` |
| API auth (backend) | `docs/developer/api/commerce7-apis.md` |
| Webhooks | `docs/developer/app-platform/app-apis-webhooks.md` |
| App data on orders/carts | `docs/developer/app-platform/custom-app-data.md` |
| Cursor pagination / rate limits | `docs/developer/api/commerce7-apis.md` |

---

*Architecture note: confirm storefront instrumentation details with Commerce7 and pilot merchants before promising click-level metrics at scale.*

**V1 validation:** **[`V1-RISK-STRESS-TEST-PLAN.md`](V1-RISK-STRESS-TEST-PLAN.md)** — per-function stress tests, kill criteria, and maintainability tracker.
