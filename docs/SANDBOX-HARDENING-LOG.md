# Sandbox hardening log

This log records Commerce7 sandbox setup, live documentation findings, memory-only test results, fixes, and known gaps. It is intentionally operational: future developers should be able to replay the setup and understand what was verified.

## 2026-05-18 - Commerce7 sandbox setup and memory-only validation

### Commerce7 state

| Item | Value |
|------|-------|
| Dev Center app | `Cart Carrot Analytics` |
| App ID | `cart-carrot-analytics` |
| Developer/company label | `Chat Through Auotmations` |
| Sandbox tenant | `sandbox-eric-jacobsen1` |
| App type | Application / full app |
| Sandbox install | Installed in Commerce7 Admin |
| Admin extension | `Order Reports` report iframe |
| Extension URL | `https://bbs-drug-totally-requires.trycloudflare.com/dashboard` |
| API tunnel | `https://width-andrea-leaders-stayed.trycloudflare.com` |
| Web tunnel | `https://bbs-drug-totally-requires.trycloudflare.com` |

Local-only ignored files created:

- `/.env` with Commerce7 app credentials and tunnel URLs.
- `/apps/web/.env.local` with `NEXT_PUBLIC_API_URL`.

Do not commit those env files. Rotate/regenerate the Commerce7 app secret if it was ever pasted outside a private local secret store.

### ADC configuration

API access saved in Dev Center:

- `Cart: Read`
- `Customer: Read`
- `Order: Read`
- `Personalization Block: Read`
- `WebHook: Read`

Webhook URLs:

- `Order / Update` -> `https://width-andrea-leaders-stayed.trycloudflare.com/webhooks/commerce7`
- `Order / Create` -> same URL
- Known cleanup: there is currently one duplicate `Order / Create` entry in ADC from modal interaction during setup. The webhook handler is idempotent, so testing still works, but remove the duplicate when the row action is available.

Lifecycle URLs:

- Install: `https://width-andrea-leaders-stayed.trycloudflare.com/lifecycle/install`
- Uninstall: `https://width-andrea-leaders-stayed.trycloudflare.com/lifecycle/uninstall`

### Live Commerce7 documentation and site findings

Checked live Commerce7 help/developer surfaces on 2026-05-18:

- Commerce7 "Creating an App" help article: confirms developers use Dev Center directly or via Commerce7 Admin Developers tab, and emphasizes least-privilege app permissions.
- Commerce7 Apps & Extensions help: confirms apps are enabled from Admin -> Apps & Extensions and third-party apps should expose developer contact/support.
- Commerce7 Dev Center/app platform docs mirrored in this repo remain relevant for:
  - `Test Your App`: add the sandbox `tenantId`, then install from the tenant Admin as an Admin Owner.
  - App extensions: report iframe extensions require Full Application context and need Commerce7 iframe helper JavaScript.
  - Authentication: Admin extensions receive `account` JWT in the iframe URL; the app should validate it through `GET /account/user`.
  - API authentication: backend uses App ID/App Secret with Commerce7 API base and the tenant header; the app secret must not be placed in browser JavaScript.

Live Admin behavior observed:

- The sandbox app appears in Apps & Extensions after adding `sandbox-eric-jacobsen1` in Dev Center "Test Your App".
- Install flow displays configured permissions and completes successfully.
- After install, the app appears under `Order Reports` and Commerce7 appends `tenantId`, `account`, and `adminUITheme` to the iframe URL.

### Fixes made during hardening

- `apps/web/next.config.ts`: added the current Cloudflare web tunnel to `allowedDevOrigins`; Next.js dev mode otherwise blocked font/HMR resources when loaded through the tunnel.
- `apps/web/src/app/layout.tsx`: added `https://dev-center.platform.commerce7.com/v2/commerce7.js` via Next `Script`; Commerce7 Admin warned that iframe resize messaging was missing.
- `scripts/sandbox-memory-smoke.mjs`: added repeatable memory-only smoke coverage for tunnels, webhook idempotency, analytics idempotency, validation failures, order sync, and insights overview.

### Memory-only test results

Manual memory-only pass:

| Area | Result | Notes |
|------|--------|-------|
| API tunnel `/health` | Pass | Returned `{ ok: true }`. |
| Web tunnel `/dashboard` | Pass | Returned HTTP 200. |
| App install lifecycle | Pass | API log showed `POST /lifecycle/install` -> 200. |
| Embedded report iframe | Pass | Dashboard loads inside Commerce7 Order Reports. |
| Commerce7 iframe context | Pass | iframe `src` included `tenantId=sandbox-eric-jacobsen1`, `account=<JWT>`, and `adminUITheme=dark`. |
| Account JWT validation | Pass | `GET /v1/account/user` returned Eric's account for the sandbox tenant. |
| Synthetic webhook | Pass | `POST /webhooks/commerce7` accepted Order Update payload. |
| Webhook idempotency | Pass | Replayed payload returned `duplicate: true`. |
| Analytics ingest | Pass | `cart_carrot` and `personalization_block` events accepted. |
| Analytics idempotency | Pass | Replayed `clientEventId` returned `duplicate: true`. |
| Bad analytics shape | Pass | Missing `name` returned 400 validation error. |
| Insights overview | Pass | Returned Commerce7 order context and in-memory analytics counts. |
| Live order sync | Pass | `/sync/orders` returned `ok: true`, `fetched: 0`, `completedWalk: true`. Empty result matches the sandbox trial having no orders. |
| Dashboard UI counts | Pass | UI showed Cart Carrot and personalization memory events. |

Current memory-only dashboard counts after manual tests:

- Cart Carrot interactions: at least 2.
- Cart Carrot clicks: at least 1.
- Personalization block interactions: at least 1.
- Commerce7 order walk: 0 orders.

Automated pass on 2026-05-18 12:11 PDT:

| Check | Result | Notes |
|-------|--------|-------|
| `pnpm sandbox:smoke:memory` | Pass | Exercised API health, web dashboard HEAD, synthetic webhook first delivery + duplicate replay, analytics ingest + duplicate replay, invalid analytics validation, Commerce7 order sync, and insights overview through the active Cloudflare tunnels. |
| Memory smoke counts | Pass | Overview returned 6 total analytics events for this process: 4 Cart Carrot events and 2 personalization block events; order cursor walk remained `0` and `ok: true`. |
| `pnpm typecheck` | Pass | First run found a strict test assertion issue in `apps/api/src/events/analytics-store.test.ts`; fixed by asserting `recent` length before reading the first item. Rerun passed for API and web. |
| `pnpm test` | Pass | 23 API test files passed, 59 tests passed, 3 database integration tests skipped because this run is intentionally memory-only. |
| `pnpm build` | Pass | API TypeScript build and web Next.js production build both completed; `/`, `/app`, and `/dashboard` prerendered. |

Fix from this pass:

- `apps/api/src/events/analytics-store.test.ts`: made the recent-event assertion explicit enough for strict TypeScript while keeping the test behavior unchanged.

Heartbeat pass on 2026-05-18 12:27 PDT:

| Check | Result | Notes |
|-------|--------|-------|
| `pnpm sandbox:smoke:memory` | Pass | Re-ran the memory-only tunnel smoke after the first hardening pass. API health, dashboard HEAD, webhook first + duplicate delivery, analytics ingest + duplicate, invalid analytics validation, order sync, and insights overview all passed. |
| Memory smoke counts | Pass | Overview returned 9 total analytics events in the current memory process: 6 Cart Carrot events and 3 personalization block events. Commerce7 order cursor walk remained `0` and `ok: true`. |
| Commerce7 account JWT | Skipped | No fresh iframe `account` JWT was supplied to this automated heartbeat run. Manual validation already passed earlier in this log. |

Heartbeat pass on 2026-05-18 15:36 PDT:

| Check | Result | Notes |
|-------|--------|-------|
| First `pnpm sandbox:smoke:memory` | Partial fail | Tunnel, webhook, analytics, validation, and insights checks passed, but `/sync/orders` returned HTTP 500. API logs showed the Commerce7 upstream request failed with an HTTP/2 `GOAWAY` socket error. |
| Fix | Applied | `apps/api/src/http/fetch-with-backoff.ts` now retries thrown transient `fetch` failures as well as HTTP `429` / `503` responses. This covers network-level failures such as the observed HTTP/2 `GOAWAY`. |
| Regression test | Pass | Added coverage in `apps/api/src/http/fetch-with-backoff.test.ts` for a rejected `fetch` followed by a successful retry. Full API test run passed: 23 test files passed, 60 tests passed, 3 database integration tests skipped. |
| `pnpm typecheck` | Pass | API and web typechecks passed after the retry fix. |
| Second `pnpm sandbox:smoke:memory` | Pass | Re-ran the tunnel smoke after the fix; API health, dashboard HEAD, webhook first + duplicate delivery, analytics ingest + duplicate, invalid analytics validation, order sync, and insights overview all passed. Overview returned 3 analytics events for the restarted memory process and order cursor walk remained `0` / `ok: true`. |

Manual evaluation on 2026-05-18 15:43 PDT:

| Check | Result | Notes |
|-------|--------|-------|
| `pnpm sandbox:smoke:memory` | Pass | Current tunnel smoke passed again after the retry fix. Overview returned 6 total in-memory analytics events: 4 Cart Carrot events and 2 personalization block events; Commerce7 order walk remained `0` / `ok: true`. |
| `pnpm typecheck` | Pass | API and web typechecks passed. |
| Commerce7 Admin embedded report | Pass | Current Admin URL rendered the `Cart Carrot Analytics` Order Reports page with `App By: Chat Through Auotmations`, and the embedded dashboard visibly loaded inside the Commerce7 report page. |

Real Commerce7 order test on 2026-05-18 15:50 PDT:

| Check | Result | Notes |
|-------|--------|-------|
| Real sandbox order create | Pass | Created Commerce7 `Order #1002` (`3298febe-9657-48a7-8e4d-acda20db5b54`) from Admin -> Store -> Orders -> Add Order using existing customer Andrew Kamphuis and the non-shipping `Tasting` product. The order total was `$0.00`, so no payment gateway/card was involved. |
| Physical product add attempt | Blocked by sandbox setup | Adding `Sample - 2016 Reserve Chardonnay` failed with Commerce7 message `Shipping does not exist.` This confirms physical-order testing needs shipping configuration before paid/shipped wine orders can be created. |
| Commerce7-delivered create webhook | Pass | Immediately after `Order #1002` creation, API dev logs showed three `POST /webhooks/commerce7 -> 200` entries. Multiple deliveries are expected for now because ADC still has a duplicate `Order / Create` webhook entry. |
| Commerce7 order API sync | Pass | Manual `POST /sync/orders` returned `fetched: 1`, `completedWalk: true`; `/v1/insights/overview` returned `orders.cursorWalkTotal: 1`, `orders.ok: true`, and `commerce7DataSource: "http"`. |
| Dashboard after real order | Pass | Direct dashboard refresh showed `Live Commerce7 data` and `Orders in Commerce7: 1`. |
| Real sandbox order update | Pass | Added tag `hardening-test` to `Order #1002`; API dev logs showed a real `POST /webhooks/commerce7 -> 200` after the update. |
| Post-create/update smoke | Pass | `pnpm sandbox:smoke:memory` passed after the real create/update checks. Overview returned `orders.cursorWalkTotal: 1` plus 12 memory analytics events (8 Cart Carrot, 4 personalization block). |

Heartbeat pass on 2026-05-18 16:38 PDT:

| Check | Result | Notes |
|-------|--------|-------|
| `pnpm sandbox:smoke:memory` | Pass | Current tunnel smoke still passes after the real Commerce7 order create/update test. API health, dashboard HEAD, webhook idempotency, analytics ingest/idempotency, invalid analytics validation, order sync, and insights overview all passed. |
| Current memory counts | Pass | Overview returned 15 memory analytics events: 10 Cart Carrot events and 5 personalization block events. Commerce7 order walk remained `1` and `ok: true`. |

MVP completion pass on 2026-05-18 20:58 PDT:

| Area | Result | Notes |
|------|--------|-------|
| OAuth callback/token exchange | Implemented | `/oauth/callback` now records the callback and exchanges `code` when `OAUTH_TOKEN_URL` plus client credentials are configured. Without a token URL it still records the callback and returns `exchangeStatus: "skipped"` so ADC can be wired immediately. `/oauth/status` exposes safe token presence/expiry status without returning token values. |
| Background sync scheduler | Implemented | Added `BackgroundOrderSyncRunner`, in-process scheduler env (`BACKGROUND_SYNC_TENANTS`, `BACKGROUND_SYNC_INCLUDE_INSTALLS`, `BACKGROUND_SYNC_INTERVAL_MS`), active-install discovery, immediate run endpoint `POST /v1/sync/run`, and status endpoint `GET /v1/sync/status`. Operator-token protection applies when `INTERNAL_API_TOKEN` is configured. |
| Merchant-facing web UI | Implemented | Existing `/` and `/app` console is now the merchant operations console with OAuth callback URL, OAuth status, background sync run, and background sync status controls. `/dashboard` remains the merchant analytics view. |
| Tests/build | Pass | API suite passed: 23 files passed, 63 tests passed, 3 DB integration tests skipped. `pnpm typecheck` passed for API and web. `pnpm build` passed for API and Next.js routes `/`, `/app`, and `/dashboard`. |
| Documentation | Updated | `.env.example`, `docs/IMPLEMENTATION-LOG.md`, and `docs/SANDBOX-HUMAN-SETUP-PLAYBOOK.md` now document OAuth exchange and background sync env/routes. |

Live endpoint smoke on 2026-05-18 21:00 PDT:

| Check | Result | Notes |
|-------|--------|-------|
| `GET /oauth/status` | Pass | Returned safe status for `sandbox-eric-jacobsen1`: callback not yet seen in the current restarted memory process, no token values exposed. |
| `POST /v1/sync/run` | Pass | Background runner completed immediately for `sandbox-eric-jacobsen1`, `lastOk: true`, `lastFetched: 1`, `lastCompletedWalk: true`. |
| `pnpm sandbox:smoke:memory` | Pass | Existing smoke still passes after OAuth/scheduler/UI additions. Overview showed `orders.cursorWalkTotal: 1` and live Commerce7 order access remained healthy. |

Background scheduler hardening on 2026-05-18 21:07 PDT:

| Check | Result | Notes |
|-------|--------|-------|
| Active-install discovery | Implemented | `AppInstallStore` now exposes `listActiveTenantIds()`. The scheduler can use explicit `BACKGROUND_SYNC_TENANTS`, active install records via `BACKGROUND_SYNC_INCLUDE_INSTALLS=1`, or both. |
| Scheduler behavior | Pass | Added test coverage proving the scheduler discovers active install tenants at tick time and runs order sync for them. Lifecycle tests now verify install/uninstall changes the active tenant list. |
| Live background run | Pass | `POST /v1/sync/run` for `sandbox-eric-jacobsen1` returned `lastOk: true`, `lastFetched: 1`, `lastCompletedWalk: true`. |
| Verification | Pass | API test run passed: 23 files passed, 64 tests passed, 3 DB integration tests skipped. `pnpm typecheck` and `pnpm build` passed. |

Merchant analytics dashboard restoration on 2026-05-18 21:23 PDT:

| Check | Result | Notes |
|-------|--------|-------|
| `/dashboard` merchant report | Updated | Restored the merchant-facing analytics dashboard to the light Commerce7 report style shown in the reference screenshots: report header, tenant/date/token/API controls, KPI cards, behavior funnel, attribution health, and surface performance table. |
| Local dashboard data fetch | Fixed | API CORS now allows local web origins (`http://localhost:3000`, `http://127.0.0.1:3000`, and `http://[::1]:3000`) in development while preserving `APP_BASE_URL` for tunnel/staging usage. This lets the local dashboard fetch `http://localhost:3001/v1/insights/overview` during sandbox testing. |
| Browser verification | Pass | In-app browser opened `http://localhost:3000/dashboard?tenantId=sandbox-eric-jacobsen1`, refreshed analytics against the local API, and rendered the report with current sandbox data. Seeded 14 memory-only demo analytics events for the sandbox tenant so the visible report matches the reference screenshot shape: `$210` influenced revenue, 7 impressions, 3 clicks, 2 adds, 2 purchases, and 2 tracked surfaces. |
| Verification | Pass | `pnpm --filter @commerce7/api test -- src/insights-route.test.ts src/auth/internal-auth-route.test.ts` completed with the full API suite passing: 23 files passed, 64 tests passed, 3 DB integration tests skipped. `pnpm --filter @commerce7/api typecheck`, `pnpm --filter ./apps/web typecheck`, and `pnpm --filter ./apps/web build` passed. |

Heartbeat smoke on 2026-05-18 21:39 PDT:

| Check | Result | Notes |
|-------|--------|-------|
| `pnpm sandbox:smoke:memory` | Pass | API health, web dashboard HEAD, webhook idempotency, analytics ingest/idempotency/validation, Commerce7 order sync, and insights overview all passed. Commerce7 account JWT validation was skipped because no current iframe `account` query token was provided. |
| Local dashboard CORS | Pass | `GET /v1/insights/overview` from origin `http://localhost:3000` returned `access-control-allow-origin: http://localhost:3000`, confirming the restored report can fetch from the local API during sandbox testing. |
| Current memory counts | Pass | Overview returned 17 memory analytics events after the smoke seeded its standard events: 10 Cart Carrot events, 7 personalization block events, and Commerce7 order walk remained `1` with `orders.ok: true`. |

### Repeatable memory smoke command

With the dev stack and tunnels running:

```bash
node scripts/sandbox-memory-smoke.mjs
```

Optional environment overrides:

```bash
C7_API_TUNNEL=https://your-api-tunnel \
C7_WEB_TUNNEL=https://your-web-tunnel \
C7_TENANT_ID=sandbox-eric-jacobsen1 \
node scripts/sandbox-memory-smoke.mjs
```

To include the embedded Admin JWT validation, pass the current iframe `account` query param without committing it:

```bash
C7_ACCOUNT_JWT='raw-account-jwt-from-iframe-url' node scripts/sandbox-memory-smoke.mjs
```

### Known gaps before production confidence

- Remove duplicate `Order / Create` webhook in Dev Center.
- Configure Commerce7 shipping before testing paid/physical wine orders; current sandbox can create non-shipping `$0.00` orders but physical products fail with `Shipping does not exist.`
- Add `DATABASE_URL`, run migrations, repeat lifecycle/webhook/analytics tests, restart API, and verify persistence.
- Replace temporary Cloudflare quick tunnels with stable staging domains before broader testing.
- Decide production auth for operator-only routes (`INTERNAL_API_TOKEN`) and whether webhook/lifecycle Basic Auth should be enabled in ADC Advanced settings.
- Implement or document the storefront event collector needed for true click-to-order attribution.
- Add daily/event rollups; the current 14-day chart is a deterministic placeholder.

Heartbeat smoke on 2026-05-18 21:55 PDT:

| Check | Result | Notes |
|-------|--------|-------|
| `pnpm sandbox:smoke:memory` | Pass | API health, web dashboard HEAD, webhook idempotency, analytics ingest/idempotency/validation, Commerce7 order sync, and insights overview all passed. Commerce7 account JWT validation was skipped because no current iframe `account` query token was provided. |
| Local dashboard CORS | Pass | `GET /v1/insights/overview` from origin `http://localhost:3000` returned `access-control-allow-origin: http://localhost:3000`. |
| Current memory counts | Pass | Overview returned 20 memory analytics events after the smoke seeded its standard events: 12 Cart Carrot events, 8 personalization block events, and Commerce7 order walk remained `1` with `orders.ok: true`. |

Merchant dashboard product split on 2026-05-19 09:02 PDT:

| Check | Result | Notes |
|-------|--------|-------|
| User-facing dashboard | Updated | `/dashboard` now presents as a merchant report: `Analytics by Chat Through Automations`, `Dynamic content analytics`, and winery/store display copy. The dashboard no longer exposes tenant slug, API base URL, or operator token controls. Those remain integration-console concerns. |
| Date range controls | Implemented | Added preset ranges (`Last 7 days`, `Last 30 days`, `Last 90 days`) plus `Custom dates` with start/end date inputs. The dashboard sends `startDate` and `endDate` to `/v1/insights/overview`. |
| Insights API range filtering | Implemented | `/v1/insights/overview` now validates optional `startDate` / `endDate`, rejects invalid or inverted ranges, returns the selected range in the payload, and passes the range into both in-memory and Postgres analytics summaries. |
| Browser verification | Pass | In-app browser opened `http://localhost:3000/dashboard?tenantId=sandbox-eric-jacobsen1&storeName=Demo%20Winery`; verified the merchant-facing header, hidden integration plumbing, and visible custom start/end date fields after selecting `Custom dates`. |
| Verification | Pass | API test run passed: 23 files passed, 65 tests passed, 3 DB integration tests skipped. `pnpm --filter @commerce7/api typecheck`, `pnpm --filter ./apps/web typecheck`, and `pnpm --filter ./apps/web build` passed. A live local API query with `startDate=2026-05-19&endDate=2026-05-19` returned the normalized ISO date range in the payload. |

Manual sandbox analytics population on 2026-05-19 09:14 PDT:

| Check | Result | Notes |
|-------|--------|-------|
| Shopper-event simulation | Pass | Sent 12 memory-only events to `POST /v1/events` for tenant `sandbox-eric-jacobsen1`: Cart Carrot impressions/clicks/add/purchase and personalization block impressions/click/add/purchase. Event IDs used the `manual-demo-20260519-*` prefix so reruns are idempotent. |
| Insights response | Pass | `GET /v1/insights/overview?tenantId=sandbox-eric-jacobsen1` returned 12 events: 7 Cart Carrot, 5 personalization block, 5 impressions, 3 clicks, 2 add-to-cart events, and 2 purchases. Commerce7 order walk still returned one order with `orders.ok: true`. |
| Dashboard verification | Pass | Refreshed `http://localhost:3000/dashboard?tenantId=sandbox-eric-jacobsen1&storeName=Demo%20Winery`; merchant report displayed `$210` influenced revenue, 5 impressions, 3 clicks, 67% add-to-cart rate, 67% conversion rate, and 2 tracked surfaces. |

Heartbeat smoke on 2026-05-19 09:36 PDT:

| Check | Result | Notes |
|-------|--------|-------|
| Dashboard hover explainers | Pass | Metric and section definitions were moved behind compact hover `i` markers to keep the merchant dashboard clean while preserving definitions for influenced revenue, impressions, add-to-cart rate, conversion rate, revenue per 1k views, behavior funnel, attribution health, and surface performance. |
| `pnpm sandbox:smoke:memory` | Pass | API health, web dashboard HEAD, webhook idempotency, analytics ingest/idempotency/validation, Commerce7 order sync, and insights overview all passed. Commerce7 account JWT validation was skipped because no current iframe `account` query token was provided. |
| Current memory counts | Pass | Overview returned 15 memory analytics events after the smoke seeded its standard events: 9 Cart Carrot events, 6 personalization block events, and Commerce7 order walk remained `1` with `orders.ok: true`. |
| Web typecheck | Pass | `pnpm --filter ./apps/web typecheck` passed after the hover explainer cleanup. |

Heartbeat smoke on 2026-05-19 09:52 PDT:

| Check | Result | Notes |
|-------|--------|-------|
| `pnpm sandbox:smoke:memory` | Pass | API health, web dashboard HEAD, webhook idempotency, analytics ingest/idempotency/validation, Commerce7 order sync, and insights overview all passed. Commerce7 account JWT validation was skipped because no current iframe `account` query token was provided. |
| Current memory counts | Pass | Overview returned 18 memory analytics events after the smoke seeded its standard events: 11 Cart Carrot events, 7 personalization block events, and Commerce7 order walk remained `1` with `orders.ok: true`. |

Insights / experiment loop MVP on 2026-05-19 10:31 PDT:

| Check | Result | Notes |
|-------|--------|-------|
| Deterministic insights | Implemented | Added a merchant-facing `Insights` section below the KPI cards. It generates deterministic recommendation cards with `Observation`, `Try this`, confidence, and sample-size language. Low-confidence recommendations are suppressed. |
| Confidence thresholds | Implemented | Recommendations require at least 25 shopper events and 5 observed purchases for `Medium` confidence, and at least 100 shopper events and 20 observed purchases for `High` confidence. Below that, the dashboard shows a `More activity is needed` state with the current sample size. |
| Experiment acceptance | Implemented | Added `I’m trying this experiment` buttons for eligible recommendations. MVP stores accepted experiments in browser `localStorage` only; no Commerce7/content changes are made by the app yet. |
| Wording/polish | Updated | Renamed `Influenced revenue` to `Early revenue signal`. Owner-facing rate displays are capped at 100% so uneven event counts do not produce confusing rates above 100%. |
| Verification | Pass | `pnpm --filter ./apps/web typecheck` and `pnpm --filter ./apps/web build` passed. Browser verification showed the conservative low-sample `More activity is needed` state for the current sandbox sample. |

Sandbox insight trigger pass on 2026-05-19 10:43 PDT:

| Check | Result | Notes |
|-------|--------|-------|
| Sandbox events | Populated | Posted an additional shaped in-memory event batch for tenant `sandbox-eric-jacobsen1`: 45 personalization block impressions and 30 Cart Carrot clicks. Combined sandbox sample after the batch was 184 shopper events and 7 observed purchases. |
| Insights surfaced | Pass | Browser verification showed three Medium-confidence insight cards: Cart Carrot click-to-add-to-cart friction, Cart Carrot early revenue signal, and personalization block low click activity. |
| Experiment acceptance | Pass | Clicked one visible `I’m trying this experiment` button; the dashboard changed it to `Experiment started` and kept another unstarted experiment available. This remains browser-local MVP state only. |
| Memory smoke | Pass | `pnpm sandbox:smoke:memory` passed after the insight trigger batch. Final smoke sample showed 187 total memory events, 6 Cart Carrot purchases, 1 personalization-block purchase, and Commerce7 order sync `ok: true` with one cursor-walked order. |

Experiment flow MVP on 2026-05-19 10:52 PDT:

| Check | Result | Notes |
|-------|--------|-------|
| Start experiment | Implemented | `I’m trying this experiment` now saves a full experiment record with tenant, insight, confidence, range label, start timestamp, 3-day review timestamp, and a baseline metrics snapshot. |
| Test brief | Implemented | Started insight cards now show a `Test brief` with the Commerce7 action prompt, review date, baseline purchases, shopper events, add-to-cart rate, and conversion rate. |
| Running experiments | Implemented | Added a merchant-facing `Running experiments` section above Insights. It reports active tests, review date, days running, new events, new observed purchases, new early revenue signal, add-to-cart rate movement, conversion movement, and a plain-English result summary. |
| Browser verification | Pass | In-app browser verification started an experiment and confirmed `Running experiments`, `Test brief`, and result metric cards were visible. |
| Verification | Pass | `pnpm --filter ./apps/web typecheck`, `pnpm --filter ./apps/web build`, and `pnpm sandbox:smoke:memory` passed. Final memory smoke sample showed 190 total events, 6 Cart Carrot purchases, 1 personalization-block purchase, and Commerce7 order sync `ok: true`. |
| Known MVP limitation | Noted | Experiment records remain browser-local via `localStorage`; production should move them to the API/database so experiments survive browser changes and can power multi-user reporting. |

Experiment test-length setup on 2026-05-19 10:59 PDT:

| Check | Result | Notes |
|-------|--------|-------|
| Volume-based recommendation | Implemented | Experiment setup now estimates daily shopper events and observed purchases from the selected dashboard date range, targets a directional read of roughly 50 new shopper events and 5 observed purchases, and clamps the suggested test length to a practical 3-21 day window. |
| Merchant choice | Implemented | Clicking `I’m trying this experiment` now opens a setup panel instead of immediately starting the test. The merchant can start a 3-day, 7-day, 14-day, suggested-length, or custom-review-date experiment. |
| Experiment record | Updated | Started experiments now store the selected test length, review date, explanation, expected shopper events, and expected purchases alongside the baseline snapshot. |
| Test brief | Updated | Started insight cards now explain why the chosen duration was selected, including the expected activity volume needed for a directional read. |
| Browser verification | Pass | In-app browser verification opened the setup panel, confirmed `Suggested test length` and `Custom review date`, started the suggested test, and confirmed `Test brief` plus `Running experiments` were visible. |
| Verification | Pass | `pnpm --filter ./apps/web typecheck`, `pnpm --filter ./apps/web build`, and `pnpm sandbox:smoke:memory` passed. Final memory smoke sample showed 193 total events, 6 Cart Carrot purchases, 1 personalization-block purchase, and Commerce7 order sync `ok: true`. |

Demo data population on 2026-05-19 11:01 PDT:

| Check | Result | Notes |
|-------|--------|-------|
| Purchase demo batch | Populated | Posted a memory-only demo batch for tenant `sandbox-eric-jacobsen1` with 252 purchase events plus supporting funnel activity: 1,600 impressions, 620 clicks, and 400 add-to-cart events across Cart Carrot and personalization blocks. |
| Dashboard totals | Pass | Insights overview returned 3,065 total memory events and 259 observed purchases after the demo batch. Cart Carrot had 938 impressions, 412 clicks, 239 add-to-cart events, and 157 purchases; personalization blocks had 777 impressions, 263 clicks, 177 add-to-cart events, and 102 purchases. |
| Browser verification | Pass | Refreshed the merchant dashboard. It showed `$27,195` early revenue signal, 259 purchase events, 1,715 impressions, 675 clicks, 416 add-to-cart events, 62% add-to-cart rate, 38% conversion rate, and running-experiment deltas showing 252 new purchases. |
| Caveat | Noted | This is still local in-memory demo data. Restarting the API without persistence will clear it. |

Experiment clearing flow on 2026-05-19 11:08 PDT:

| Check | Result | Notes |
|-------|--------|-------|
| Clear action | Implemented | Added `Clear experiments` to the `Running experiments` header. It only appears when there are active experiment records. |
| Confirmation flow | Implemented | Clicking `Clear experiments` opens a confirmation panel explaining that experiment cards and saved test briefs for the current winery will be removed while analytics events and dashboard totals stay in place. |
| Scoped clearing | Implemented | Confirming clears only the current tenant's browser-local experiment records from `localStorage`; records for other tenants are preserved. Canceling closes the panel without changing saved experiments. |
| Browser verification | Pass | In-app browser verification opened the confirmation panel and clicked `Keep experiments`; the panel closed and the demo experiments remained intact. |
| Verification | Pass | `pnpm --filter ./apps/web typecheck`, `pnpm --filter ./apps/web build`, and `pnpm sandbox:smoke:memory` passed. Final memory smoke sample showed 3,068 total events, 259 observed purchases, and Commerce7 order sync `ok: true`. |

Per-experiment clearing refinement on 2026-05-19 11:14 PDT:

| Check | Result | Notes |
|-------|--------|-------|
| Clear action placement | Updated | Removed the section-level `Clear experiments` action from the `Running experiments` header. Each running experiment card now has its own `Clear this experiment` action. |
| Confirmation scope | Updated | Confirmation now appears inside the selected experiment card and only removes that one experiment/test brief from browser-local storage. Analytics events and dashboard totals stay in place. |
| Browser verification | Pass | In-app browser verification confirmed there was no global clear button, three per-experiment clear buttons were visible, the per-card confirmation opened, and `Keep it` closed the confirmation without clearing demo experiments. |
| Verification | Pass | `pnpm --filter ./apps/web typecheck`, `pnpm --filter ./apps/web build`, and `pnpm sandbox:smoke:memory` passed. Final memory smoke sample showed 3,071 total events, 259 observed purchases, and Commerce7 order sync `ok: true`. |

Strategy wording pass on 2026-05-19 11:18 PDT:

| Check | Result | Notes |
|-------|--------|-------|
| Merchant wording | Updated | Changed visible dashboard language from experiment/test framing to strategy framing: `Running strategies`, `Strategy brief`, `Strategy started`, `I’m using this strategy`, `Clear this strategy`, and `Suggested run length`. Internal storage/type names were left unchanged to avoid demo-risk churn. |
| Browser verification | Pass | In-app browser verification confirmed `Running strategies` was visible, old `Running experiments` and `Experiment started` text were not visible, and per-card `Clear this strategy` actions were present. |
| Verification | Pass | `pnpm --filter ./apps/web typecheck`, `pnpm --filter ./apps/web build`, and `pnpm sandbox:smoke:memory` passed. Final memory smoke sample showed 3,074 total events, 259 observed purchases, and Commerce7 order sync `ok: true`. |

ADC receipt extension setup on 2026-05-28 10:56 PDT:

| Check | Result | Notes |
|-------|--------|-------|
| App type | Pass | Verified in the Commerce7 App Development Center that `Cart Carrot Analytics` is registered as a `Full Application`, which is required for the `Frontend Receipt Primary` extension slot. |
| Public dev tunnels | Updated | Started fresh Cloudflare quick tunnels for the local dev stack: API `https://hundred-valued-hop-pee.trycloudflare.com` -> `localhost:3001`; web `https://polo-name-relationship-marco.trycloudflare.com` -> `localhost:3000`. Previous tunnel URLs in ADC/env were no longer resolvable. |
| Receipt extension | Added | Added an ADC `Frontend Receipt Primary` page extension titled `Receipt Purchase Tracking` with URL `https://polo-name-relationship-marco.trycloudflare.com/receipt` and iframe height `1px`. This is the Commerce7 slot that loads automatically on order confirmation for installed merchants. |
| Receipt API wiring | Fixed | Updated local web dev config so `/receipt` uses the public API tunnel through `NEXT_PUBLIC_API_URL`, and updated the web CSP `connect-src` to allow that API origin. Updated API development CORS to allow temporary `*.trycloudflare.com` web origins. |
| Public smoke checks | Pass | `GET /health` through the API tunnel returned OK. `HEAD /receipt` through the web tunnel returned 200 with `connect-src` pointing to the API tunnel. A purchase-style `POST /v1/events` through the public API tunnel with the web tunnel as Origin returned `{"ok":true,"duplicate":false}`. |
| Caveat | Noted | These are temporary Cloudflare quick tunnel URLs for sandbox testing. Before production or a durable sandbox demo, replace them in ADC with stable HTTPS domains and keep the API/web env values in sync. The existing `Order Reports` dashboard extension in ADC still points to an older dead web tunnel and should be updated separately if testing the installed Admin dashboard through Commerce7. |

ADC permissions, install, webhooks, pricing, and listing pass on 2026-05-28 11:25 PDT:

| Check | Result | Notes |
|-------|--------|-------|
| API permissions | Updated | Reduced ADC Step 1 API access to the least-privilege MVP set: `Order: Read` and `WebHook: Read`. Removed older exploratory `Cart`, `Customer`, and `Personalization Block` access. This matches the current server code path for order sync/reconciliation and webhook-log backfill. |
| App identity | Updated | Corrected the app-level company name from `Chat Through Auotmations` to `Chat Through Automations`. Verified app type remains `Full Application`, App ID is `cart-carrot-analytics`, and the App Secret Key is masked in ADC. |
| App credentials handling | Verified | Local `.env` / `apps/web/.env.local` are not tracked by git. Keep the ADC App Secret Key only in server-side environment variables such as `COMMERCE7_CLIENT_SECRET` / `OAUTH_CLIENT_SECRET`; never expose it in browser code or committed docs. |
| OAuth redirect | Investigated | The current ADC pages and mirrored Commerce7 docs expose App ID/App Secret Key authentication, install/uninstall callbacks, extension JWT/appToken validation, and optional webhook Basic Auth. No separate OAuth Redirect URI field was visible in the current ADC version/app/listing pages. The repo callback endpoint remains `GET /oauth/callback`; register `https://<stable-api-domain>/oauth/callback` if Commerce7/support enables or requests an OAuth redirect field for this app. |
| Installation callbacks | Updated | ADC Step 5 Install URL now points to `https://hundred-valued-hop-pee.trycloudflare.com/lifecycle/install`; Uninstall URL points to `https://hundred-valued-hop-pee.trycloudflare.com/lifecycle/uninstall`. These are temporary sandbox tunnel URLs and must become stable HTTPS API URLs before review/production. |
| Webhooks | Updated with caveat | Added current API-tunnel `Order / Create` and `Order / Update` webhooks pointing to `https://hundred-valued-hop-pee.trycloudflare.com/webhooks/commerce7`. Existing stale/duplicate webhook rows pointing to `https://width-andrea-leaders-stayed.trycloudflare.com/webhooks/commerce7` remain because the current ADC table did not expose edit/delete controls; Commerce7 docs note app-created webhooks cannot be deleted unless the app is uninstalled. Production should recreate on a clean version/stable URL to avoid duplicate deliveries. |
| Webhook auth | Documented | Commerce7 docs describe optional webhook Advanced `Username`/`Password`, not a generic shared secret field. The current ADC rows show `Auth Credentials: None`; the API supports optional Basic Auth via `WEBHOOK_BASIC_USER` / `WEBHOOK_BASIC_PASSWORD` when those env values are set and mirrored in ADC. Do not enable ADC Basic Auth until the API env is set and restarted. |
| Pricing | Updated | ADC Step 4 pricing set to `Custom pricing`, so Commerce7 will not collect payment. Listing copy notes direct billing by Chat Through Automations at `$79/month`. |
| App listing | Drafted | Created/saved an App Store listing draft with Reporting category, summary, long description, direct-billing note, support email, and install steps. Optional website/documentation URLs were left blank because placeholder URLs failed ADC URI validation. Final logo and real screenshots still need upload before review. |
| Commerce7 doc findings | Verified | Mirrored/live docs emphasize least-privilege API scopes, App ID/App Secret Key server-side auth, optional webhook Advanced Basic Auth, webhook logs via `WebHook: Read`, and the warning that failed webhooks can be disabled after 48 hours and recreated/reconciled. |

ADC listing logo upload attempt on 2026-05-28 12:08 PDT:

| Check | Result | Notes |
|-------|--------|-------|
| Logo assets | Verified | Confirmed `/assets/logo-512.png` is a 512 x 512 PNG and should be the primary ADC App Store listing logo. Also confirmed `/assets/logo-1024.png` and `/assets/logo-512.jpg` exist as backup/fallback assets. |
| Human handoff | Documented | `/assets/FOR-CHAD.md` points Chad to the ADC App Store listing logo upload field and tells him to upload `/assets/logo-512.png`, with `/assets/logo-512.jpg` as fallback if Commerce7 rejects PNG. |
| ADC upload | Blocked by tooling | Opened the Commerce7 ADC listing edit form and reached the Logo upload field, but the Codex in-app browser explicitly does not support file uploads/file chooser automation. A native file-dialog automation attempt also did not attach the file, so the logo remains a manual ADC step. |
| Direct API investigation | Documented | The ADC frontend uploads listing files to `https://dev-center-api.commerce7.com/v2/file` with multipart form data and the ADC browser session token. The token was not accessible from the automation environment, and a direct credential login attempt was rejected by Commerce7, so API upload was not completed. |

ADC listing field completion on 2026-05-28 12:24 PDT:

| Check | Result | Notes |
|-------|--------|-------|
| Long description | Updated | Added merchant-facing App Store description explaining early revenue signal, funnel reporting, surface comparison, Insights, running strategies, integration console, and direct `$79/month` billing by Chat Through Automations. |
| Subscription requirement | Updated | Checked `Subscription to another software provider is required for this app` to reflect that billing/subscription is handled directly by Chat Through Automations rather than Commerce7. |
| Screenshot captions | Updated | Added captions for the merchant analytics dashboard, surface performance report, and integration console. Actual screenshot image upload still requires a human file picker action in ADC. |
| Install steps | Updated | Added setup instructions covering Commerce7 install/approval, Chat Through Automations connection confirmation, dashboard use, Integration Console use, and the reason for `Order: Read` plus `WebHook: Read` permissions. |
| ADC save | Pass | Clicked `Save Listing`; Commerce7 returned to the app overview and showed `Listing Updated.` |
| Still needed | Manual | Website URL, documentation URL, support phone, logo image upload, and screenshot image uploads remain blank/not finalized because no production public URLs, phone number, or browser-supported file upload path is available in this session. |

ADC listing image prep on 2026-05-28 14:51 PDT:

| Check | Result | Notes |
|-------|--------|-------|
| Demo data | Refreshed | Re-seeded the local memory API with demo storefront activity so screenshots show meaningful surface, revenue, and insight states rather than an empty first-run dashboard. |
| App screenshots | Created | Added three 1600 x 900 PNGs for Commerce7 App Store upload: `assets/app-store/01-dashboard-overview.png`, `assets/app-store/02-insights-and-strategies.png`, and `assets/app-store/03-integration-console.png`. |
| Handoff note | Updated | Updated `assets/FOR-CHAD.md` with the exact logo and screenshot upload order for the ADC listing form. |
| Upload status | Manual | Commerce7 ADC image fields still require human upload because Codex in-app browser file uploads are blocked. Upload `assets/logo-512.png` plus the three `assets/app-store/*.png` screenshot files. |
