# Customer Insights MVP — plan & Commerce7 documentation research

**Shape:** Standalone dashboard (not embedded in Commerce7 Admin initially) backed by **read-heavy** use of Commerce7 REST APIs.  
**Goal:** De-risk Commerce7 app patterns (ADC, install per tenant, Basic Auth + `tenant` header, pagination) while delivering spreadsheet-adjacent value (orders, customers, clubs, simple aggregates).

**As implemented in this repo today:** a standalone **Next.js `/dashboard`** reads **`GET /v1/insights/overview`**, driven mostly by **`POST /v1/events`** payloads tagged with **`properties.surface`** (`cart_carrot`, `personalization_block`) for dynamic-merchandising funnels—see **`docs/plans/PERSONALIZATION-ANALYTICS-ARCHITECTURE.md`** §3.5. Broader **spreadsheet-style insights** (orders, customers, clubs) straight from Commerce7 REST remain the roadmap described below; delivered components and API paths are tracked in **`docs/IMPLEMENTATION-LOG.md`**.

---

## 1. Resolved from Commerce7 developer docs (in-repo mirror)

### 1.1 App type for “no Admin UI yet”

Docs describe an **Integration** app: no user-facing surface inside Commerce7, still **listed** (if public) and receives **API + webhook access** after install.

```11:14:docs/developer/getting-started/create-an-app.md
     2. **Integration:** Users cannot see or interact with the app inside Commerce7, but the integration will be listed in the App Store, and it will give you access to all APIs and webhooks. The app works behind the scenes once it's been installed.
     3. **Private App** or Integration: Once your app is published, it will not be available to the public on the App Store. You can enter in the tenant ID to one or more clients to grant them access to see and install the app.
```

**MVP choice:** **Integration** (or **Private Integration** if only specific wineries). Matches “our own URL for the dashboard” without App Extensions.

---

### 1.2 Authentication (server-side only)

For installed apps, every API request uses **Basic Auth**: username = **app ID**, password = **App Secret Key**, plus **`tenant`** header = tenant slug (e.g. `spectrawinery`).

```36:45:docs/developer/api/commerce7-apis.md
## 
App or integration
For every API request, you'll authenticate using Basic Auth with the username as your app's ID and the password your "App Secret Key".
...
  4. Then you'll pass the `tenantID` for the client. This is the first part of the URL when you are logged in. For example, in `https://spectrawinery.admin.platform.commerce7.com`, the tenant ID is `spectrawinery`.
```

**Insight:** Standalone UI talks **only to your backend**; backend holds the secret. No Commerce7 JWT / extension user auth required for MVP.

---

### 1.3 Base URL & versioning

REST base: `https://api.commerce7.com/v1/{endpoint}`.

```19:24:docs/developer/api/commerce7-apis.md
# 
Endpoint
API| Base URL  
---|---  
REST| `https://api.commerce7.com/v1/{endpoint}`  
```

Treat responses as **forward-compatible** (ignore unknown fields); breaking changes are communicated and may involve new API versions.

```8:9:docs/developer/api/api-versioning.md
Commerce7 considers additive changes as non-breaking. Apps and integrations should be built to accept new attributes in responses and then decide when to consume the new values as needed.
```

---

### 1.4 Pagination (critical for “insights” backfills)

**Page style:** `?page=` and `?limit=` (1–50); response includes `total`. **After 100 pages**, pagination throttles to **1 request / 60s**.

**Cursor style:** `?cursor=start` then follow `cursor` until empty. Documented for **`/v1/order`**, **`/v1/customer`**, **`/v1/product`**, club membership, cart, reservation, note, trash — **no rate limits** on cursor pagination per overview.

```67:97:docs/developer/api/commerce7-apis.md
# 
Pagination
...
## 
Standard
  * GET requests for lists have a limit of **50 records per page**.
  * After 100 pages, pagination is limited to 1 request per 60 seconds.
...
## 
Cursor
Several endpoints allow you to use our new cursor based pagination. These endpoints have no rate limits.
...
  * `/v1/order`
  * `/v1/club-membership`
  * `/v1/customer`
```

**MVP rule:** Use **cursor** for full tenant syncs (orders, customers, memberships); reserve page style for small UI lists.

---

### 1.5 Rate limits

**100 requests / minute per tenant** for standard usage; page pagination beyond 100 pages hits the 1/min throttle. Prefer cursor for large lists.

```155:158:docs/developer/api/commerce7-apis.md
# 
Rate limiting
API rate limits are 100 requests per minute, per tenant (client account).
  * Page style pagination is limited to 100 pages maximum at the standard rate limit. Greater than 100 pages is rate limited to 1 page per 60 seconds. Page style pagination should only be used for endpoints with mostly static data that will never have more than 10 pages of data OR for apps with a UI that needs to list data with page numbers (up to 10 pages).
  * Integrations retrieving data for core data objects, like customers, orders, and club memberships should use cursor based pagination, which has no rate limits and much better response times.
```

---

### 1.6 Data semantics for metrics

- **Money:** amounts in **cents** in API.
- **Dates:** **UTC**, typically ISO datetime.

```141:144:docs/developer/api/commerce7-apis.md
# 
Data formatting
  * **Currency** amounts are stored in Commerce7 in cents. eg. If you pass in a request to update a product price to $100.00 the amount should be passed as 10000.
  * **Dates** are all stored in UTC time and most are in ISO datetime format.
```

---

### 1.7 Which APIs to request in ADC

App versions grant **per-endpoint** access; request **Read** only where possible. Relevant categories for Customer Insights typically include:

- **Order** (revenue, AOV, channel, time series)
- **Customer** (segments, LTV-related fields via list filters / nested `orderInformation` where returned)
- **Club**, **Club Membership** (retention, club mix)
- **Product** (optional — top SKUs, requires heavier sync)
- **WebHook** (optional object — to subscribe to events)

List from:

```32:60:docs/developer/app-platform/app-apis-webhooks.md
  2. Search for the endpoint you need. Available endpoints are:


  * `Cart`
  * `Club`
...
  * `Customer`
...
  * `Order`
...
  * `Product`
```

Order list supports **server-side filters** (e.g. paid date range, channel), reducing how much you pull for a given report window:

```595:620:docs/developer/resources/orders.md
# 
List orders
**`GET`** `/order`
**Optional query parameters**  
...
  * `/order?channel=Web&orderPaidDate=gte:2021-01-01` lists all web orders with a paid date greater than January 1, 2021.
  * `/order?orderPaidDate=btw:2021-01-01|2021-02-01` lists all orders with a paid date between January 1, 2021 and February 1, 2021.
...
`orderPaidDate=n`| Date and time that the order payment was completed
...
`channel=n`| For a specific channel:
```

Customer list supports filters such as **`orderCount`**, **`lifetimeValue`**, **`createdAt`** (exact semantics in doc tables):

```241:255:docs/developer/resources/customers.md
# 
List customers
**`GET`** `/customer`
**Optional query parameters**  
...
Example: `/customer?q=andrew&orderCount=gt:1` lists customers with the name of Andrew and an order count greater than 1
Param| Description  
---|---  
`q=n`| Customer name  
...
`lifetimeValue=n`| Lifetime value  
`orderCount=n`| Number of orders per customer
...
`createdAt=n`| Contact record creation
```

---

### 1.8 Webhooks (optional MVP+)

Webhooks POST JSON to your URL; failures notify contact email; **48h failures disable** the webhook (must recreate).

```74:88:docs/developer/app-platform/app-apis-webhooks.md
## 
Add webhook events
...
  3. Enter the **URL**. When the action occurs in Commerce7, this URL will receive a JSON POST with the full object.
...
If for whatever reason the webhook event fails, you'll receive a notification to the "Contact Email" that you added to your app settings.
> ℹ️
> If your webhook event fails for 48 hours, it will be disabled. Once a webhook fails it cannot be enabled again and will need to be recreated.
```

**MVP:** Scheduled **cursor** full/incremental sync may be enough; webhooks reduce lag but add **reliability work** (retries, DLQ, alerting).

---

## 2. What the public docs do *not* fully specify (treat as discovery in sandbox)

| Gap | Why it matters for Insights MVP | What to do |
|-----|----------------------------------|------------|
| **Exact JSON shape variance** | Nested `order` line items, refunds, flags — affect revenue rollups | Prototype against sandbox; snapshot fixtures; unit-test parsers |
| **`Query` API** | Listed in ADC as an endpoint — mirror does not spell out SQL-like reporting | If Product wants “saved report” parity, ask C7 / experiment in sandbox with Read access |
| **Customer `orderInformation` on list vs get** | Aggregates may differ by endpoint | Compare list vs GET `/customer/{id}` in sandbox |
| **App Store vs private install** | Affects timeline, billing, listing copy | Decide early with stakeholders |
| **Historical backfill time** | Large tenants: wall-clock for first sync | Engineer throttling + progress UI; use cursor |

---

## 3. MVP scope recommendation (engineering)

### Phase A — “Hello C7” (de-risk)

- ADC: **Integration** app, **Read** on Order + Customer (+ Club Membership if in brief).
- One **test install** on sandbox tenant.
- Backend: health check + one **cursor** pull (e.g. orders) + dump count/total to logs.
- Standalone page: “last sync status” + **no charts**.

### Phase B — “Spreadsheet replacement lite”

- Persist sync watermark (`updatedAt` / cursor state per resource).
- **Dashboards:** revenue by period (from orders), simple customer segments (reuse list filters or compute from synced rows).
- **CSV export** for parity with spreadsheet users.
- Respect **100 req/min** / cursor discipline; **retry + backoff** on 429 if encountered.

### Phase C — “Fresher data” (optional)

- Subscribe to **Order** / **Customer** webhooks → enqueue incremental updates.
- Operational runbooks for **webhook 48h disable** behavior.

---

## 4. Relationship to click-level personalization analytics

The **REST + webhook** approach here covers **order/customer truth** and spreadsheet-style insights. **Click-level** “cart carrot” / personalization block metrics need a **browser collector** and usually a **Full Application** with **Report** extensions for in-Admin dashboards — see **`docs/plans/PERSONALIZATION-ANALYTICS-ARCHITECTURE.md`**.

If the product is *only* personalization analytics, you still use Layer A (orders/webhooks) for **conversion proof**, but Layer B (storefront JS) is non-optional for **CTR / impressions**.

## 5. Out of scope for *Insights-only* MVP (narrow definition)

- **Commerce7 Admin iframe** — optional deferral if you ship standalone first; CS-facing reporting later via Full App + Report extensions.

---

## 6. Doc index (mirrored in this repo)

| Topic | Path |
|--------|------|
| API overview | `docs/developer/api/commerce7-apis.md` |
| Versioning | `docs/developer/api/api-versioning.md` |
| App types & secret | `docs/developer/getting-started/create-an-app.md` |
| ADC API/webhook config | `docs/developer/app-platform/app-apis-webhooks.md` |
| Orders | `docs/developer/resources/orders.md` |
| Customers | `docs/developer/resources/customers.md` |
| Club memberships | `docs/developer/resources/club-memberships.md` |
| Execution order | `docs/EXECUTION-PLAYBOOK.md` |

Refresh mirrors: `python3 scripts/fetch_docs.py` (after `pip install -r requirements-docs.txt`).

---

*Planning artifact for Customer Insights MVP; refine with product after sandbox access.*
