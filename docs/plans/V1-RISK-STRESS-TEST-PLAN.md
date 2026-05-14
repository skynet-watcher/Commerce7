# V1 risk stress-test plan — robust analytics, minimal CS burden

**Goal:** In **one V1 cycle**, prove or disprove each risky part of the architecture **in isolation**, with **written pass/fail** and **kill criteria** (when to stop investing in a brittle path).

**Constraint:** We **cannot** ship a theme-fragile, DOM-selector-based product. If a capability depends on undocumented storefront hooks, V1 must **surface that as a binary outcome**: official contract from Commerce7 / merchant vs **do not build**.

---

## 1. What “robust” means (non-negotiables)

| # | Principle | V1 proof |
|---|------------|----------|
| R1 | **No cross-tenant data** | Automated test + manual spot-check on 2 tenants |
| R2 | **Order truth reconciles** | Daily rollup vs C7-sourced orders within agreed tolerance |
| R3 | **Idempotent ingestion** | Same webhook/event replayed does not double-count |
| R4 | **Breakage is detectable** | Health checks + synthetic probes; alert within X hours |
| R5 | **No secret in browser** | Secret scan + arch review |
| R6 | **Instrumented surfaces are contract-based** | Stable IDs or official events — **not** undocumented CSS selectors in prod |

**Maintainability tracker:** For each stress test below, fill **Pass / Fail / Waived** and link evidence (log snippet, PR, ticket). If **Fail** touches R1–R6, V1 **blocks** on mitigation or scope cut.

---

## 2. Tracker (copy to your PM tool or keep in this file)

| ID | Function under test | Owner | Target date | Result (P/F/W) | Evidence link | Kill? (Y/N) |
|----|---------------------|-------|-------------|----------------|---------------|-------------|
| T1 | API auth + tenant isolation | | | | | |
| T2 | Cursor sync scale + rate behavior | | | | | |
| T3 | Webhook ingest + idempotency | | | | | |
| T4 | Webhook failure / ops behavior | | | | | |
| T5 | Admin Report JWT auth + RBAC | | | | | |
| T6 | Event collector abuse & forgery | | | | | |
| T7 | Storefront event **contract** (C7 / theme) | | | | | |
| T8 | Session → order join accuracy | | | | | |
| T9 | Attribution vs REST “source of truth” | | | | | |
| T10 | Privacy / data minimization boundary | | | | | |
| T11 | Full App / ADC review path (if needed) | | | | | |

**Kill = Y:** Stop building that approach for GA; document pivot (e.g. “admin-only aggregates, no click claims” or “blocked on Commerce7 official events”).

---

## 3. Stress tests — **one function at a time**

Run in order where possible: **backend correctness before storefront**.

### T1 — API authentication and tenant isolation

| Item | Detail |
|------|--------|
| **Risk** | Cross-tenant leak; misconfigured Basic Auth |
| **Test** | Two sandbox tenants **A** and **B**. From backend, call same endpoint (e.g. `GET /v1/order?limit=1`) with `tenant: A` then `tenant: B`. Attempt **cross-read** (B secret with A tenant header) and confirm **401/403** or empty/error per C7 behavior. |
| **Pass** | No data from tenant B visible when querying as A; logs show tenant on every request |
| **Fail** | Any cross-tenant bleed |
| **Kill** | **Y** — halt until fixed; no further tests |

Reference: `docs/developer/api/commerce7-apis.md` (Basic Auth + `tenant` header).

---

### T2 — Cursor-based sync at stress (scale + operational limits)

| Item | Detail |
|------|--------|
| **Risk** | 100 pg/min limits on page pagination; slow backfills; runaway cost |
| **Test** | On **largest** sandbox tenant available: full **cursor** walk of **orders** (and **customers** if in scope). Record: wall time, request count, 429s, memory. Optionally compare to **bounded date filter** (`orderPaidDate`) for same period. |
| **Pass** | Completes within agreed SLO; **no** reliance on `page` > 100 for core objects |
| **Fail** | Timeouts, sustained 429 without backoff, or forced to use throttled page pagination for core facts |
| **Kill** | **Partial** — keep cursor path only; cap “full history” product scope until infra scales |

Reference: `docs/developer/api/commerce7-apis.md` (pagination + rate limits).

---

### T3 — Webhook ingestion: correctness + idempotency

| Item | Detail |
|------|--------|
| **Risk** | Duplicate processing; lost updates |
| **Test** | Trigger **Order** webhook (or replay **captured payload** in dev). Send **same payload twice** with same `id`/version. Verify DB/event log: **one** logical application. |
| **Pass** | Idempotent by order id + `updatedAt` or C7 version field |
| **Fail** | Double revenue or duplicate downstream events |
| **Kill** | **Y** — fix before any “trust me” analytics |

Reference: `docs/developer/app-platform/app-apis-webhooks.md`.

---

### T4 — Webhook **failure** behavior (operational reality)

| Item | Detail |
|------|--------|
| **Risk** | 48h disable; silent data loss |
| **Test** | Point webhook to endpoint that returns **500** for N hours (in sandbox only). Document: when email fires, when disabled. Practice restore path (**recreate** webhook per docs). Validate **reconciliation**: missed events recoverable via **GET** backfill or webhook log API if used. |
| **Pass** | Runbook written; RTO within agreed window; reconciliation path tested once |
| **Fail** | No way to detect gap or recover |
| **Kill** | **Y** for “real-time only” claims — add batch reconciliation as mandatory |

Reference: webhook disable note in `docs/developer/app-platform/app-apis-webhooks.md`.

---

### T5 — Admin Report iframe: JWT verification and authorization

| Item | Detail |
|------|--------|
| **Risk** | Broken auth; staff sees wrong tenant |
| **Test** | Load Report iframe as **User1** (tenant A). Capture URL token. Attempt reuse against **User2** / tenant B from outside normal flow if possible. Always verify **`GET /v1/account/user`** server-side. Confirm **non-admin** role cannot see sensitive aggregates (if product requires). |
| **Pass** | Server rejects invalid/expired tokens; UI never trusts client-only claims |
| **Fail** | Any report data without verified tenant + user |
| **Kill** | **Y** — no in-Admin GA until fixed |

Reference: `docs/developer/app-platform/authenticate-app.md`.

---

### T6 — Public event collector: abuse and forgery

| Item | Detail |
|------|--------|
| **Risk** | Spam/fake events; cost blow-up |
| **Test** | Hit collector with **unsigned** flood; with **wrong** tenant key; with oversized payloads. Measure throttle behavior. If using **signed beacons**, verify signature mismatch rejected. |
| **Pass** | Stable under abuse test budget; clear 401/429; no DB thrash |
| **Fail** | Unbounded ingestion or easy forgery |
| **Kill** | **Y** for public endpoint without auth strategy — ship **signed** or **mTLS**-lite pattern |

---

### T7 — Storefront click / block telemetry: **contract test** (brittleness gate)

| Item | Detail |
|------|--------|
| **Risk** | DOM selectors break weekly; unsustainable CS |
| **Test (choose one track)** | **Track A (preferred):** Commerce7 (or merchant) provides **documented** `data-analytics-*` attributes, `postMessage` schema, or official event bus — implement **only** against that doc. **Track B (fallback):** Merchant agrees **single frozen theme** + written contract; run **visual regression** or DOM snapshot test in CI **against staging**. **Track C (reject):** Ad-hoc selectors on production theme with no owner. |
| **Pass** | **Track A or B** with automated breakage test (weekly synthetic: “send test event from X block”) |
| **Fail** | **Track C** or tests flaky > X% |
| **Kill** | **Y** for click-level **product claims**. Pivot to **order-level** attribution only until Track A exists |

This is the **main CS sustainability gate.**

---

### T8 — Session → order join accuracy

| Item | Detail |
|------|--------|
| **Risk** | Wrong attribution; angry merchants |
| **Test** | Scripted journeys: **guest checkout**, **login before cart**, **login after cart**, **clear cookies mid-flow**. Compare attributed orders vs known ground truth in sandbox. |
| **Pass** | Meets agreed accuracy table (e.g. ≥ 95% on defined scenarios) **or** product disclaims scenarios |
| **Fail** | Systematic wrong joins |
| **Kill** | **Partial** — narrow marketing claims; surface “unattributed” bucket prominently |

---

### T9 — Attribution reconciliation vs REST source of truth

| Item | Detail |
|------|--------|
| **Risk** | Dashboard shows revenue that doesn’t match C7 |
| **Test** | Nightly job: sum **converted attributed revenue** vs **C7 order totals** (same window, same filters). Tolerance **T** bps — **document**. |
| **Pass** | Within **T**; explainable remainder |
| **Fail** | Persistent drift > **T** |
| **Kill** | **Y** for publishing dashboard as “financial truth” — downgrade to “directional” until fixed |

---

### T10 — Privacy / minimization boundary

| Item | Detail |
|------|--------|
| **Risk** | Compliance; merchant trust |
| **Test** | Data inventory: list fields stored per event. **Red team**: “can we delete user X?” “retention?” Third-party sub-processors list. |
| **Pass** | Written policy + minimal fields; delete path tested |
| **Fail** | Collecting raw URL query strings with PII by default |
| **Kill** | **Y** for GA in regulated merchants — scope down |

---

### T11 — Full Application / ADC path (if CS requires in-Admin)

| Item | Detail |
|------|--------|
| **Risk** | Review delays; permission scope rejection |
| **Test** | Early **dry run**: list minimal APIs + **Report** extension; submit **intended** scope to C7 partner contact **before** full build. |
| **Pass** | Written OK or gap list |
| **Fail** | “Cannot approve app with X” |
| **Kill** | **Partial** — standalone dashboard first; Admin later |

Reference: `docs/developer/app-platform/app-extensions.md` (Full Application required for extensions).

---

## 4. V1 scope recommendation (time-boxed)

**Week 0–1:** T1, T2, T3, T5 (skeleton), T9 skeleton on **orders only** (no clicks).  
**Week 2:** T4, T6, T11 discovery.  
**Week 3:** **T7** — binary outcome on **official vs contract vs kill click claims**.  
**Week 4:** T8, finalize T9, T10.

**Exit criteria for “green light” long-run build:**

- T1, T3, T5, T9 **Pass**
- **T7 Pass on Track A or B** — else **no click-level GA**; order-level only
- Tracker complete with evidence

---

## 5. Doc links (this repo)

| Topic | Path |
|--------|------|
| Personalization architecture | `docs/plans/PERSONALIZATION-ANALYTICS-ARCHITECTURE.md` |
| Insights / REST baseline | `docs/plans/CUSTOMER-INSIGHTS-MVP.md` |
| Execution order | `docs/EXECUTION-PLAYBOOK.md` |

---

*Living document: update dates and tracker as V1 runs.*
