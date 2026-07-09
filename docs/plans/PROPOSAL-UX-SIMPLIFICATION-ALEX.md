# Proposal: Three-Step Deployment Flow
**Author:** Alex  
**Date:** 2026-06-18  
**Status:** PROPOSAL — do not implement without Eric's review  
**Competing with:** commit `e387956` ("proposal: simplify customer strategy workflow")

---

## The disagreement

The existing proposal (`e387956`) builds a **strategy workspace**: one featured recommendation with an editable message, date picker, test-length selector, and a push button. Analytics are collapsed into a `<details>` block below.

That is still too much for an unsophisticated winery. A textarea full of pre-filled copy, two date fields, and a dropdown are still decisions. An unsophisticated operator will hesitate at "should I change the message?" and close the tab.

This proposal argues for eliminating decisions entirely from the default path, not just reducing them.

---

## The core bet

The existing proposal bets that wineries will engage with a workspace if it is simple enough.

This proposal bets that **wineries should not need to understand what they are doing to get a result.** The app makes one specific recommendation, pre-fills every field to a defensible default, and asks only for a single confirmation click. There is no message to edit, no date to set, and no analytics to interpret before acting.

---

## What this looks like: three screens, not one

### Screen 1 — `/app` (the only screen most users ever see)

```
┌──────────────────────────────────────────────────────┐
│  Your next move                                      │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │  ADD A CART CARROT                             │  │
│  │                                                │  │
│  │  "Club members love" · Cabernet 2020           │  │
│  │  Cart page · All shoppers                      │  │
│  │                                                │  │
│  │  Why: your add-to-cart rate is strong but      │  │
│  │  purchases aren't following. This is the       │  │
│  │  highest-performing first carrot across        │  │
│  │  similar wineries.                             │  │
│  │                                                │  │
│  │  [  Set this up →  ]                           │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  See the numbers behind this  ↗                      │
└──────────────────────────────────────────────────────┘
```

- **One card.** One recommendation. One button.
- No analytics visible by default.
- "See the numbers behind this" is a link to Screen 3, not a collapsed section. It is out of the way for users who don't want it, reachable for users who do.
- The card content is fully pre-determined by the backend — the operator sees exactly what will be deployed, but is not asked to edit it.

---

### Screen 2 — `/app/confirm` (the confirmation step)

Reached only by clicking "Set this up →".

```
┌──────────────────────────────────────────────────────┐
│  Confirm                                             │
│                                                      │
│  We will create this Cart Carrot in Commerce7:       │
│                                                      │
│  Title        Club members love                      │
│  Wine          Cabernet 2020                         │
│  Placement    Cart page                              │
│  Audience     All shoppers                           │
│  Start        Today                                  │
│                                                      │
│  [  Confirm and deploy  ]    [  Go back  ]           │
│                                                      │
│  You can edit or pause this at any time in           │
│  your Commerce7 admin.                               │
└──────────────────────────────────────────────────────┘
```

- Read-only summary. Nothing to edit.
- The message "You can edit or pause this at any time in your Commerce7 admin" removes anxiety about committing.
- Single confirm click calls `POST /v1/strategies/apply`.

---

### Screen 3 — `/app/analytics` (opt-in only)

The full analytics content from the current `customer/page.tsx` — surface performance table, Cart Carrot by title, personalization block detail, funnel, attribution health. Unchanged from today.

Reached only from the "See the numbers" link on Screen 1. Never shown by default.

---

## How it differs from the existing proposal (`e387956`)

| | Existing proposal | This proposal |
|---|---|---|
| Default view | Workspace with editable fields | One card, one button |
| Message editing | Textarea, editable | Not exposed |
| Date/duration | User sets start date + length | Defaulted to "today" |
| Analytics visibility | Collapsed `<details>` on same page | Separate route, never shown by default |
| Decisions required | 2–3 (message, date, length) | 0 (just confirm) |
| Confirmation step | No — push button is on the workspace | Yes — explicit confirm before deploy |
| First-time users | Sidebar card with separate flow | Same flow, recommendation adapts |

---

## The "first state" case

When a tenant has no analytics data and has never deployed Cart Carrot or a Personalization Block:

Screen 1 shows the same layout, but the card reads:

> **START HERE**  
> "Club members love" · Cabernet 2020  
> Cart page · All shoppers  
>  
> Why: this is the proven starting point for wineries that are new to Cart Carrot. It requires no prior data and typically produces results within two weeks.

The copy changes. The layout, confirmation flow, and API call are identical. No separate "first state" UI branch to maintain.

---

## Backend: what this requires

### `GET /v1/recommendations/:tenantId`

Returns one recommendation object. Not two — one. The highest-value next action.

```ts
{
  type: "cart_carrot" | "personalization_block",
  title: string,         // "Club members love"
  product: string,       // "Cabernet 2020"
  placement: string,     // "Cart page"
  audience: string,      // "All shoppers"
  reasoning: string,     // one sentence shown to the operator
  config: object         // opaque payload passed to /v1/strategies/apply
}
```

Logic:
1. No analytics events → return hardcoded best-practice starter (Cart Carrot, "Club members love")
2. Has events, CC not deployed → return analytics-derived Cart Carrot recommendation
3. CC deployed, PB not deployed → return PB recommendation
4. Both deployed → return whichever has the weaker performance + a specific suggested change

One recommendation at a time forces prioritisation and keeps the UI simple.

### `POST /v1/strategies/apply`

Takes `{ tenantId, config }`, pushes to Commerce7 API.

**Open dependency:** C7 confirmed in the meeting that pushing to Cart Carrot and PB via API is possible. The exact endpoint names and required ADC scopes need to be confirmed in sandbox before this is built.

---

## What this does not change

- The analytics content itself (`customer/page.tsx` tables and funnel) — moved to Screen 3 unchanged.
- The backend infrastructure (webhooks, order sync, analytics events) — untouched.
- The integration console — untouched.

---

## Risks and tradeoffs

**Risk:** Some operators may want to review and edit the recommendation before deploying. This flow does not let them.  
**Mitigation:** The confirmation screen is explicit about what will be created. The note "you can edit this in Commerce7 admin" covers post-deploy adjustment.

**Risk:** A single-recommendation model means the backend must prioritise well. Bad prioritisation = operators always see the wrong thing.  
**Mitigation:** Start with deterministic rules (not ML). The rules are easy to audit and adjust.

**Risk:** The confirm step adds a click vs. the existing proposal's single push button.  
**Mitigation:** The confirm step is intentional. Deploying to a live winery storefront without confirmation is the higher risk.

---

## Build order

1. `GET /v1/recommendations/:tenantId` — static "first state" response only (no analytics logic yet)
2. Screen 1 (`/app`) wired to that endpoint — replace the current `customer/page.tsx`
3. Screen 2 (`/app/confirm`) — static confirm page, button calls `POST /v1/strategies/apply` (returns mock success for now)
4. Screen 3 (`/app/analytics`) — move existing analytics content here, link from Screen 1
5. Confirm C7 push API in sandbox, wire real `POST /v1/strategies/apply`
6. Analytics-derived recommendation logic in `GET /v1/recommendations/:tenantId`

---

*Do not build from this document. Eric reviews both proposals and decides direction.*
