# Execution playbook — from “we know the app” to shipping

Use this when the product idea is settled and you want a **repeatable path** to implementation. Fill the templates once, then work top to bottom.

---

## 0. Lock the product spec (30–60 minutes)

Answer in writing so scope does not drift.

| Question | Your answer |
|----------|-------------|
| **Who uses it** | Admin, staff, or end customer? |
| **Job to be done** | One sentence: what outcome do they get? |
| **Primary workflow** | e.g. “On order paid → sync to X”, “Club signup → create record in Y” |
| **Data you read** | Orders, customers, clubs, inventory, … |
| **Data you write** | Same list + custom app data? |
| **Where it shows in Commerce7** | Standalone nav, Actions menu, nowhere (integration-only), … |
| **Triggers** | User action only, or events (webhooks) too? |
| **Tenancy** | One client, few clients (private app), or public App Store? |

**Decision:** If only one or two wineries → private **test mode** app is enough; App Store steps can wait. See [developer/getting-started/app-development-center.md](developer/getting-started/app-development-center.md).

---

## 1. Map Commerce7 capabilities (15–30 minutes)

Cross-check your spec against **what the platform exposes**.

1. **API surface** — [developer/api/commerce7-apis.md](developer/api/commerce7-apis.md), [developer/api/api-versioning.md](developer/api/api-versioning.md).
2. **Resources you touch** — use [docs/README.md](README.md) → *API resources* for entity guides (orders, customers, products, …).
3. **App-only behavior** — extensions, installs, sync, custom data: [developer/app-platform/app-extensions.md](developer/app-platform/app-extensions.md), [developer/app-platform/app-apis-webhooks.md](developer/app-platform/app-apis-webhooks.md), [developer/app-platform/custom-app-data.md](developer/app-platform/custom-app-data.md), [developer/app-platform/installs.md](developer/app-platform/installs.md), [developer/app-platform/app-sync.md](developer/app-platform/app-sync.md).
4. **Events** — [developer/app-platform/webhooks.md](developer/app-platform/webhooks.md).
5. **UI embed** — Storybook / components (live only): [developer/app-platform/ui-component-library.md](developer/app-platform/ui-component-library.md).

**Output of this step:** a bullet list: *endpoints + webhooks + extension type(s) + OAuth scopes implied by those APIs.*

---

## 2. App Development Center (ADC) checklist

Do this **before** writing significant backend code so you do not rework auth and URLs.

- [ ] Sandbox / developer access — [developer/getting-started/commerce7-developer-docs.md](developer/getting-started/commerce7-developer-docs.md).
- [ ] Create app (or open existing) — [developer/getting-started/create-an-app.md](developer/getting-started/create-an-app.md) and [developer/getting-started/creating-an-app.md](developer/getting-started/creating-an-app.md) (same topic; compare if titles differ on site).
- [ ] Register redirect URLs, app URL, and any extension routes per **App Extensions** guide.
- [ ] Enable only the **API modules / permissions** you listed in §1.
- [ ] Register **webhooks** you need; note signing/verification from the webhooks doc.
- [ ] If UI inside Admin: configure extension type and test with **test installs** — [developer/app-platform/test-your-app.md](developer/app-platform/test-your-app.md).

---

## 3. When sandbox access is delayed

You can keep the project moving **before** Commerce7 sandbox, tenant, or ADC access exists.

**Safe to advance (~40–60% of typical effort if the brief is solid):**

| Area | What to do |
|------|------------|
| **Spec** | Finish §0–§1 in this playbook; use [PROJECT-BRIEF-TEMPLATE.md](PROJECT-BRIEF-TEMPLATE.md). |
| **Your stack** | DB, jobs, logging, `apps/api` / `apps/web` structure, CI, deployment stubs. |
| **Other systems** | Any non–Commerce7 APIs and domain logic — test with fixtures. |
| **OAuth shape** | Callback route, state, cookie/session — unit test with **mocked** token responses. |
| **Webhooks shape** | POST handler, idempotency, queue — use synthetic JSON; finalize **HMAC/signature** checks when ADC provides secrets. |
| **Admin UI** | Pages and components with **mock** tenant/user context. |

**Blocked until access exists:**

- ADC: app, redirect URLs, scopes, webhook subscriptions, **test installs**.
- **Real** OAuth exchange and live **API** calls to `api.commerce7.com`.
- **End-to-end** validation of webhooks from Commerce7.

**Pattern:** Define a narrow **`Commerce7Client`** (or port interface) + **mock implementation** for local development; swap in HTTP + real auth once credentials land. Optional env flag e.g. `COMMERCE7_MOCK=1`.

See also **[`HANDOFF.md`](../HANDOFF.md)** — *Progress without Commerce7 sandbox*.

---

## 4. Recommended build order

Order minimizes blocked time (auth and tenancy first; fancy UI last).

1. **Auth** — [developer/app-platform/authenticate-app.md](developer/app-platform/authenticate-app.md): token exchange, refresh, storing tokens per tenant/install.
2. **Tenant model** — Map Commerce7 **tenant / install** to your DB (one row per install, or per client, depending on app type).
3. **Happy-path API** — One read + one write against the riskiest resource (the one that drives your workflow).
4. **Webhooks** — Subscribe in ADC; implement handler + idempotency + verify signatures.
5. **Background jobs** — Retries, rate limits, **App Sync** if you expose data back to C7 UI — [developer/app-platform/app-sync.md](developer/app-platform/app-sync.md).
6. **Admin UX** — Iframe/extension surfaces last, when APIs are stable.
7. **Security review** — [developer/app-store/app-security-policy.md](developer/app-store/app-security-policy.md) (especially before wider rollout).

---

## 5. Validate before “done”

- [ ] **Test mode** with a real sandbox install — [developer/app-platform/test-your-app.md](developer/app-platform/test-your-app.md).
- [ ] Webhook delivery in staging (replay / dead-letter strategy).
- [ ] If shipping publicly: listing, pricing, submission — [developer/app-store/create-yourapp-listing.md](developer/app-store/create-yourapp-listing.md), [developer/app-store/submit-publish-your-app.md](developer/app-store/submit-publish-your-app.md), [developer/app-store/pricing.md](developer/app-store/pricing.md), [developer/app-store/getting-paid.md](developer/app-store/getting-paid.md).

---

## 6. One-line “definition of done” per phase

| Phase | Done when |
|------|-----------|
| Spec | All rows in §0 filled; stakeholders agree |
| C7 mapping | Every data flow has an API/webhook + doc link |
| ADC | App runs end-to-end in sandbox with test install |
| MVP | Auth + one critical workflow + monitoring |
| Scale | Webhooks reliable, errors observable, security doc satisfied |

---

**Refresh local docs:** `python3 scripts/fetch_docs.py` from repo root (after `pip install -r requirements-docs.txt`). **Canonical:** [developer.commerce7.com](https://developer.commerce7.com/docs/app-development-center).
