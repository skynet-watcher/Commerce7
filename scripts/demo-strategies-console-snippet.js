/**
 * demo-strategies-console-snippet.js
 *
 * Paste the block below into the browser console while the dashboard is open at:
 *   http://localhost:3000/dashboard?tenantId=sandbox-eric-jacobsen1
 *
 * What it does:
 *   Plants two "running strategies" in localStorage that look like they've been
 *   live for 5–7 days, with a lower baseline snapshot and meaningful improvement
 *   in add-to-cart rate (+9 pts) so the dashboard shows "Early result is improving."
 *
 * To reset / clear:
 *   localStorage.removeItem('c7-sandbox-accepted-experiments'); location.reload();
 */

// ─── paste from here ──────────────────────────────────────────────────────────

(function seedDemoStrategies() {
  const tenantId   = "sandbox-eric-jacobsen1";
  const rangeStart = "2026-04-19";   // 30-day range start shown on the dashboard
  const rangeEnd   = "2026-05-19";   // today

  // Baseline snapshot — what metrics looked like when each strategy was started.
  // Lower adds/clicks (0.53 add rate) vs current (0.62) gives a clean +9 pt lift.
  const sharedBaseline = {
    totalEvents:    1718,
    impressions:     959,
    clicks:          380,
    adds:            201,   // 201/380 = 0.529 add rate  →  current 0.616  →  delta +0.087 ✓
    purchases:       146,
    revenue:       15330,   // 146 × $105
    addRate:        0.529,
    conversionRate: 0.384,
  };

  const now = new Date();
  const daysAgo = (n) => new Date(now - n * 86_400_000).toISOString();
  const daysFrom = (iso, n) => new Date(new Date(iso).getTime() + n * 86_400_000).toISOString();

  const experiments = [
    {
      // Strategy 1 — started 7 days ago, review window is today
      id:               `${tenantId}:protect-cart_carrot:${rangeStart}:${rangeEnd}`,
      tenantId,
      insightId:        "protect-cart_carrot",
      observation:      "Cart Carrot is producing a strong early revenue signal per 1,000 views.",
      suggestion:       "Give Cart Carrot one more high-traffic placement for the next test window.",
      confidence:       "High",
      basedOn:          "Based on 146 observed purchases and 1,718 shopper events.",
      rangeLabel:       "Last 30 days",
      startedAt:        daysAgo(7),
      reviewAt:         daysFrom(daysAgo(7), 7),   // review = today
      testLengthDays:   7,
      reviewReason:     "Based on your current activity, we suggest 7 days. That should produce about 700 shopper events and 63 observed purchases, which is enough for a directional read.",
      expectedEvents:   700,
      expectedPurchases: 63,
      baseline:         sharedBaseline,
    },
    {
      // Strategy 2 — started 5 days ago, review window in 2 days
      id:               `${tenantId}:protect-personalization_block:${rangeStart}:${rangeEnd}`,
      tenantId,
      insightId:        "protect-personalization_block",
      observation:      "Personalization blocks are producing a strong early revenue signal per 1,000 views.",
      suggestion:       "Keep this placement running and send it more traffic before changing the offer.",
      confidence:       "High",
      basedOn:          "Based on 146 observed purchases and 1,718 shopper events.",
      rangeLabel:       "Last 30 days",
      startedAt:        daysAgo(5),
      reviewAt:         daysFrom(daysAgo(5), 7),   // review = in 2 days
      testLengthDays:   7,
      reviewReason:     "Based on your current activity, we suggest 7 days. That should produce about 500 shopper events and 44 observed purchases, which is enough for a directional read.",
      expectedEvents:   500,
      expectedPurchases: 44,
      baseline:         sharedBaseline,
    },
  ];

  localStorage.setItem("c7-sandbox-accepted-experiments", JSON.stringify(experiments));
  console.log("✓ Demo strategies seeded. Reloading…");
  location.reload();
})();

// ─── paste to here ────────────────────────────────────────────────────────────
