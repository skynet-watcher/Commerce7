# Proposal: Scan → Recommend → Confirm (synthesis)
**Author:** Alex  
**Date:** 2026-06-18  
**Status:** SUPERSEDED — 2026-07-09. This proposal round was explored without knowledge of the sandbox-validated Cart Carrot Analytics build (see `docs/SANDBOX-HARDENING-LOG.md`, `/dashboard`). Kept for reference; the scan-before-recommend idea may inform future strategy features.  
**Synthesises:** `e387956`, `b13bc9f` (Alex #1), `30fcbe8` (Chad)

---

## What each proposal got right

| Proposal | The thing worth keeping |
|---|---|
| `e387956` (workspace) | Editable pre-filled form gives intermediate users confidence they understand what they're deploying |
| `b13bc9f` (Alex #1) | Explicit confirm step before the API call; analytics as a separate route; three-state recommendation model |
| `30fcbe8` (Chad) | **Setup scan** before recommending; free shipping carrot as the primary play; fallback when no promotion exists; pre-flight checklist; customer journey map for personalization |

Chad's setup scan is the sharpest new idea across the three. Neither earlier proposal asked "what does this tenant already have?" before recommending. Getting that answer first changes everything — you can show a relevant recommendation instead of a generic one, and you avoid pushing something the winery already has or that conflicts with their existing setup.

---

## The synthesis: four steps, not one screen

```
[1] Scan       [2] Recommend      [3] Confirm        [4] Done
 ─────────────  ─────────────────  ─────────────────  ─────────
 Call C7 API   Show one strategy  Read-only review   Success +
 Check what    with pre-filled    No editing here    link to C7
 already       form (editable)    "This is what      admin item
 exists        + pre-flight       will be created"
               checklist
```

Steps 1 and 4 are automatic. The operator makes decisions at step 2 (optionally edit the pre-filled form) and step 3 (confirm before the API call goes out).

---

## Step 1 — Setup scan (automatic, not a screen)

When the operator opens the app, run a lightweight read against the C7 API before rendering the recommendation:

- Does a free shipping promotion exist? (If yes, primary recommendation is the free shipping carrot.)
- Are there existing Cart Carrots? (If yes, avoid duplicating.)
- Is there club data / club membership > 0? (Informs which conditions are available.)
- Are there any Personalization Blocks configured?

Surface the scan results as a **sidebar card**: "What we found" — same layout as Chad's proposal. Not buried, but not the focus either.

```
┌──────────────────────────────────┐
│  What we found                   │
│  ─────────────────────────────   │
│  Cart Carrots    None set up     │
│  Free shipping   Promotion found │
│  Club data       Available       │
│  PB blocks       None set up     │
└──────────────────────────────────┘
```

The scan result drives which recommendation appears in step 2.

---

## Step 2 — Recommend (the workspace)

Show **one recommendation**. Not two side-by-side. The primary recommendation is chosen by a simple decision tree:

```
Has free shipping promotion?
  YES → recommend free shipping Cart Carrot (bottle-count threshold)
  NO  → recommend Dynamic Product Upsell Cart Carrot (no promotion required)
Has club data?
  Add club-member incentive as a secondary option in the sidebar
Has neither CC nor PB?
  Add customer journey quick-start section (personalization plan from Chad)
```

### Primary card

Mirrors Chad's layout: Commerce7 feature / location / type on the left, editable pre-filled form on the right.

Pre-filled fields (editable):
- Title (e.g., "Free shipping nudge — 1 bottle away")
- Shopper message (editable textarea)
- Conditions — shown explicitly in plain English, not as abstract fields:
  > "Cart Item Count is greater than or equal to 1 AND Cart Item Count is less than or equal to 5"
- Sort order

**Pre-flight checklist** (from Chad — keep it):
- [ ] Confirm bottle threshold with the winery (usually 6 or 12)
- [ ] Confirm free shipping promotion is active
- [ ] Confirm cart count conditions can be created in this tenant's plan

Two buttons: **"Review and confirm →"** (takes to step 3) and **"Adjust copy"** (stays on this screen, focuses the textarea). No push button on this screen.

### Fallback card (sidebar)

If the primary recommendation's pre-conditions don't hold (no free shipping promotion, no club data), show the fallback inline in the sidebar — Chad's Dynamic Product Upsell. One button: "Use this instead →" which swaps the primary card content and re-runs the pre-flight checklist for the fallback.

---

## Step 3 — Confirm (separate screen, no editing)

From Alex #1: do not push directly from the workspace. The confirm screen is a read-only summary of exactly what will be created in Commerce7.

```
┌──────────────────────────────────────────────────────┐
│  Confirm                                             │
│                                                      │
│  We will create this Cart Carrot:                    │
│                                                      │
│  Feature      Cart Carrot                            │
│  Type         General Content                        │
│  Location     Top of Side Cart                       │
│  Title        Free shipping nudge — 1 bottle away    │
│  Message      "Add 1 more bottle to get free         │
│               shipping on your order."               │
│  Conditions   Cart count ≥ 1 AND ≤ 5                 │
│                                                      │
│  [  Confirm and push to Commerce7  ]  [  Go back  ] │
│                                                      │
│  You can edit or pause this any time in your         │
│  Commerce7 admin.                                    │
└──────────────────────────────────────────────────────┘
```

The "you can edit this in your C7 admin" note is important — it removes the anxiety of committing to something permanent.

Confirm calls `POST /v1/strategies/apply`.

---

## Step 4 — Done

Success state on the confirm screen: "Created. You can view and edit it in Commerce7 admin →" with a direct link to the new Cart Carrot object.

If the C7 push fails: show the error and offer "Copy setup steps" — a plain-English instruction list they can follow manually in C7 Admin (Chad's API action string, formatted as steps). This is the fallback if C7 doesn't expose a push API for this object type.

---

## Personalization — customer journey quick-start

From Chad: when no Personalization Blocks are configured, surface a customer journey quick-start section below the primary recommendation. This is the piece Chad got right that neither earlier proposal had.

Map Commerce7's templates to the lifecycle:

| Audience | Goal | Commerce7 approach |
|---|---|---|
| Anonymous visitor | Welcome + orient | General content block on product pages |
| First-time buyer | Repeat purchase | Product recommendation based on first order |
| Repeat buyer | Club conversion | Show club benefits and join CTA |
| Club member | Shipment engagement | Upcoming shipment or customise reminder |

Do not make the winery understand targeting logic. The app generates the block options, copy, and conditions. The section ends with a "Generate personalization plan →" button that produces a handoff doc for their designer or agency.

---

## Analytics

From Alex #1: not on the same page, not a `<details>` block. A separate route linked from the header. "See your data →" takes them to `/app/analytics` which contains the existing surface performance table, carrot detail, funnel, and attribution health — unchanged.

The default experience never shows analytics. Analytics exist for operators who want to understand what's driving the recommendation.

---

## Three-state recommendation engine (from Alex #1)

The backend logic that drives steps 1–2:

| State | What the tenant has | Primary recommendation |
|---|---|---|
| 0 — no data | No CC, no PB, no analytics | Free shipping carrot (if promo exists) or Dynamic Product Upsell |
| 1 — has data | Analytics events but no CC/PB deployed | Same as state 0, but the reasoning cites their own data |
| 2 — active | CC or PB deployed, has performance data | Specific optimisation: pause the lowest performer, add a second placement, or swap product |

State 0 and 1 produce the same recommendation UI. State 2 produces a different card with an "Optimise" framing and the specific underperforming element called out.

---

## What this does not change

- Backend infrastructure (webhooks, order sync, `analytics_events`) — untouched
- Integration console — untouched
- Analytics content (`/app/analytics`) — existing tables moved here unchanged

---

## Open dependency

Cart Carrot and Personalization Block **write** access via C7 API needs to be confirmed. The step 3 confirm screen already has a graceful fallback (copy setup steps as plain text) if the push API is unavailable. But confirming this in sandbox should happen before step 3 is wired.

---

## Build order

1. `GET /v1/scan/:tenantId` — reads C7 for promotions, existing carrots, club data, PB blocks
2. `GET /v1/recommendations/:tenantId` — uses scan result to return single recommendation object
3. Step 1+2 UI: scan sidebar + workspace card, wired to both endpoints (no push yet)
4. Move analytics to `/app/analytics`, link from header
5. Confirm C7 push API in sandbox
6. Step 3 UI + `POST /v1/strategies/apply`
7. Step 4 success/error states + plain-text fallback
8. State 2 optimisation logic in recommendation engine
9. Personalization quick-start section + plan generator

---

*Do not build from this document. Eric reviews all three proposals and decides direction.*
