#!/usr/bin/env node
/**
 * seed-demo-data.mjs
 * Seeds the in-memory analytics store with realistic storefront events for the demo.
 *
 * Usage:
 *   node scripts/seed-demo-data.mjs
 *   C7_API_BASE=http://localhost:3001 C7_TENANT_ID=demo-winery node scripts/seed-demo-data.mjs
 */

const apiBase = (process.env.C7_API_BASE ?? "http://localhost:3001").replace(/\/+$/, "");
const tenantId = process.env.C7_TENANT_ID ?? "sandbox-eric-jacobsen1";
const runId = `demo-${Date.now()}`;

let passed = 0;
let failed = 0;

async function post(label, path, body) {
  try {
    const res = await fetch(`${apiBase}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => null);
    if (res.ok) {
      passed++;
    } else {
      failed++;
      console.error(`  FAIL ${label} (${res.status})`, json);
    }
    return json;
  } catch (err) {
    failed++;
    console.error(`  FAIL ${label}`, err.message);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Cart Carrot events — 4 distinct carrots with blockTitle + recommendedProductSku
// ─────────────────────────────────────────────────────────────────────────────
// | Title               | Wine                    | Imp | Clicks | Adds |
// |---------------------|-------------------------|-----|--------|------|
// | You may also like   | Chardonnay Reserve 2022 | 180 |     52 |   28 |  ATC 15.6%
// | Club members love   | Cabernet 2020           |  95 |     41 |   22 |  ATC 23.2%  ← winner
// | Pairs well with     | Pinot Noir 2021         | 140 |     18 |    6 |  ATC  4.3%
// | Recently restocked  | Rosé 2023               |  87 |      9 |    2 |  ATC  2.3%  ← laggard
// Totals: 502 imp, 120 clicks, 58 adds  |  Overall ATC 11.6%
// ─────────────────────────────────────────────────────────────────────────────

const CARROTS = [
  {
    blockTitle: "You may also like",
    recommendedProductSku: "CHARD-RES-750",
    recommendedProductTitle: "Chardonnay Reserve 2022",
    impressions: 180,
    clicks: 52,
    adds: 28,
  },
  {
    blockTitle: "Club members love",
    recommendedProductSku: "CAB-750",
    recommendedProductTitle: "Cabernet 2020",
    impressions: 95,
    clicks: 41,
    adds: 22,
  },
  {
    blockTitle: "Pairs well with",
    recommendedProductSku: "PINOT-750",
    recommendedProductTitle: "Pinot Noir 2021",
    impressions: 140,
    clicks: 18,
    adds: 6,
  },
  {
    blockTitle: "Recently restocked",
    recommendedProductSku: "ROSE-750",
    recommendedProductTitle: "Rosé 2023",
    impressions: 87,
    clicks: 9,
    adds: 2,
  },
];

console.log(`\nSeeding Cart Carrot events (4 carrots) for tenant "${tenantId}"…`);

for (const [ci, carrot] of CARROTS.entries()) {
  const base = { surface: "cart_carrot", blockTitle: carrot.blockTitle, recommendedProductSku: carrot.recommendedProductSku, recommendedProductTitle: carrot.recommendedProductTitle };

  for (let i = 0; i < carrot.impressions; i++) {
    await post(`${carrot.blockTitle} impression ${i + 1}`, "/v1/events", {
      tenantId,
      clientEventId: `${runId}-cc${ci}-imp-${i}`,
      name: "impression",
      properties: { ...base, sessionId: `${runId}-cc${ci}-sess-${i}` },
    });
  }
  for (let i = 0; i < carrot.clicks; i++) {
    await post(`${carrot.blockTitle} click ${i + 1}`, "/v1/events", {
      tenantId,
      clientEventId: `${runId}-cc${ci}-click-${i}`,
      name: "click",
      properties: { ...base, sessionId: `${runId}-cc${ci}-sess-${i}` },
    });
  }
  for (let i = 0; i < carrot.adds; i++) {
    await post(`${carrot.blockTitle} add_to_cart ${i + 1}`, "/v1/events", {
      tenantId,
      clientEventId: `${runId}-cc${ci}-atc-${i}`,
      name: "add_to_cart",
      properties: { ...base, sessionId: `${runId}-cc${ci}-sess-${i}` },
    });
  }
  console.log(`  ✓ ${carrot.blockTitle}: ${carrot.impressions} imp / ${carrot.clicks} clicks / ${carrot.adds} adds`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Personalization block events — 2 distinct blocks with blockTitle
// ─────────────────────────────────────────────────────────────────────────────
// | blockTitle           | Impressions | Clicks | Adds |
// |----------------------|-------------|--------|------|
// | Wine Club Sign-Up    |          95 |     38 |   18 |  ATC 18.9%  ← winner
// | Reserve Allocation   |          72 |     14 |    4 |  ATC  5.6%
// ─────────────────────────────────────────────────────────────────────────────

const PB_BLOCKS = [
  { blockTitle: "Wine Club Sign-Up", impressions: 95, clicks: 38, adds: 18 },
  { blockTitle: "Reserve Allocation", impressions: 72, clicks: 14, adds: 4 },
];

console.log(`Seeding Personalization block events (2 blocks) for tenant "${tenantId}"…`);

for (const [bi, block] of PB_BLOCKS.entries()) {
  const base = { surface: "personalization_block", blockTitle: block.blockTitle };

  for (let i = 0; i < block.impressions; i++) {
    await post(`${block.blockTitle} impression ${i + 1}`, "/v1/events", {
      tenantId,
      clientEventId: `${runId}-pb${bi}-imp-${i}`,
      name: "impression",
      properties: { ...base, sessionId: `${runId}-pb${bi}-sess-${i}` },
    });
  }
  for (let i = 0; i < block.clicks; i++) {
    await post(`${block.blockTitle} click ${i + 1}`, "/v1/events", {
      tenantId,
      clientEventId: `${runId}-pb${bi}-click-${i}`,
      name: "click",
      properties: { ...base, sessionId: `${runId}-pb${bi}-sess-${i}` },
    });
  }
  for (let i = 0; i < block.adds; i++) {
    await post(`${block.blockTitle} add_to_cart ${i + 1}`, "/v1/events", {
      tenantId,
      clientEventId: `${runId}-pb${bi}-atc-${i}`,
      name: "add_to_cart",
      properties: { ...base, sessionId: `${runId}-pb${bi}-sess-${i}` },
    });
  }
  console.log(`  ✓ ${block.blockTitle}: ${block.impressions} imp / ${block.clicks} clicks / ${block.adds} adds`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Site baseline — session_start + unattributed purchases
// ─────────────────────────────────────────────────────────────────────────────
// 3500 session_start events = realistic DTC winery monthly traffic
// 40 unattributed purchases = organic orders with no surface interaction
//
// These give the dashboard a denominator for site-average conversion:
//   site avg = (attributed purchases + unattributed) / total sessions
//            = (surface purchases + 40) / 3500  ≈ 8-9%
//
// Surface conversion (~38%) vs site avg (~9%) = clear 4x lift signal.
// ─────────────────────────────────────────────────────────────────────────────

console.log(`Seeding site baseline (session_start × 3500 in parallel batches)…`);

const SESSIONS = 3500;
const BATCH = 100;

async function postSilent(path, body) {
  try {
    const res = await fetch(`${apiBase}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) passed++;
    else failed++;
  } catch {
    failed++;
  }
}

for (let batch = 0; batch < SESSIONS; batch += BATCH) {
  const end = Math.min(batch + BATCH, SESSIONS);
  await Promise.all(
    Array.from({ length: end - batch }, (_, j) => {
      const i = batch + j;
      return postSilent("/v1/events", {
        tenantId,
        clientEventId: `${runId}-session-${i}`,
        name: "session_start",
        properties: { sessionId: `${runId}-site-sess-${i}` },
      });
    })
  );
  process.stdout.write(`\r  ${Math.min(end, SESSIONS)} / ${SESSIONS}`);
}
console.log();

console.log(`Seeding unattributed purchases (organic orders without surface interaction)…`);
for (let i = 0; i < 40; i++) {
  await postSilent("/v1/events", {
    tenantId,
    clientEventId: `${runId}-organic-purchase-${i}`,
    name: "purchase",
    properties: { orderId: `order-organic-${runId}-${i}` },
    // no surface property → counted in site total, not attributed to any surface
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────

const totalCcImp = CARROTS.reduce((s, c) => s + c.impressions, 0);
const totalCcClicks = CARROTS.reduce((s, c) => s + c.clicks, 0);
const totalCcAdds = CARROTS.reduce((s, c) => s + c.adds, 0);

const totalPbImp = PB_BLOCKS.reduce((s, b) => s + b.impressions, 0);
const totalPbClicks = PB_BLOCKS.reduce((s, b) => s + b.clicks, 0);
const totalPbAdds = PB_BLOCKS.reduce((s, b) => s + b.adds, 0);

console.log(`\n✓ Seed complete: ${passed} events recorded, ${failed} failed`);
console.log(`\nExpected dashboard metrics for tenant "${tenantId}":`);
console.log(`  Cart Carrot         : ${totalCcImp} imp / ${totalCcClicks} clicks / ${totalCcAdds} adds (ATC ${Math.round((totalCcAdds / totalCcImp) * 100)}%)`);
console.log(`  Personalization     : ${totalPbImp} imp / ${totalPbClicks} clicks / ${totalPbAdds} adds (ATC ${Math.round((totalPbAdds / totalPbImp) * 100)}%)`);
console.log(`  Site avg conversion : ~9%  (40 unattributed purchases / 3500 sessions)`);
console.log(`\nOpen the dashboard:`);
console.log(`  http://localhost:3000/dashboard?tenantId=${encodeURIComponent(tenantId)}`);

if (failed > 0) {
  console.error(`\n⚠ ${failed} events failed. Is the API running at ${apiBase}?`);
  process.exit(1);
}
