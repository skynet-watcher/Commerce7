import { describe, expect, it } from "vitest";

import { MockCommerce7Client } from "./c7/mock-client.js";
import { createApp } from "./create-app.js";
import { loadEnv } from "./env.js";
import { InMemoryAnalyticsEventStore } from "./events/analytics-store.js";
import { InMemoryStrategyStore } from "./strategies/store.js";
import { InMemorySyncStateStore } from "./sync/sync-state.js";
import { InMemoryWebhookDeliveryStore } from "./webhook/store.js";

function buildApp(overrides?: { internalApiToken?: string }) {
  const c7 = MockCommerce7Client.twoPageDemo();
  const analytics = new InMemoryAnalyticsEventStore();
  const strategies = new InMemoryStrategyStore();
  const app = createApp({
    env: loadEnv(),
    webhookStore: new InMemoryWebhookDeliveryStore(),
    sync: { client: c7, syncState: new InMemorySyncStateStore() },
    analytics: { store: analytics },
    strategies: { store: strategies },
    internalApiToken: overrides?.internalApiToken,
  });
  return { app, c7, analytics, strategies };
}

async function ingest(app: ReturnType<typeof buildApp>["app"], tenantId: string, name: string, n: number) {
  for (let i = 0; i < n; i++) {
    const res = await app.request("http://localhost/v1/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId, clientEventId: `${name}-${i}-${Math.random()}`, name }),
    });
    expect(res.status).toBe(200);
  }
}

describe("POST /v1/strategies", () => {
  it("creates a strategy without an offer and snapshots the baseline", async () => {
    const { app, c7 } = buildApp();
    await ingest(app, "acme", "impression", 3);
    await ingest(app, "acme", "click", 2);

    const res = await app.request("http://localhost/v1/strategies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenantId: "acme",
        title: "Free shipping reminder",
        message: "Two more bottles and shipping is on us.",
      }),
    });
    expect(res.status).toBe(201);
    const json = (await res.json()) as {
      strategy: { id: string; baseline: { impressions: number; clicks: number }; testDays: number };
      verdict: { headline: string };
      promotionError: string | null;
    };
    expect(json.strategy.baseline.impressions).toBe(3);
    expect(json.strategy.baseline.clicks).toBe(2);
    expect(json.strategy.testDays).toBe(14);
    expect(json.verdict.headline).toBe("Still gathering results");
    expect(json.promotionError).toBeNull();
    expect(c7.promotionCalls).toHaveLength(0);
  });

  it("creates a Commerce7 promotion for the offer with endDate = review date", async () => {
    const { app, c7 } = buildApp();

    const res = await app.request("http://localhost/v1/strategies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenantId: "acme",
        title: "Perfect pairing",
        message: "Add our Rosé and take 10% off the pair.",
        offer: { kind: "percent", value: 10 },
        testDays: 14,
      }),
    });
    expect(res.status).toBe(201);
    const json = (await res.json()) as {
      strategy: { promotionId: string | null; reviewAt: string };
      promotionError: string | null;
    };
    expect(json.promotionError).toBeNull();
    expect(json.strategy.promotionId).toBe("promo_mock_1");

    expect(c7.promotionCalls).toHaveLength(1);
    const call = c7.promotionCalls[0]!;
    expect(call.tenantId).toBe("acme");
    expect(call.input.productDiscountType).toBe("Percentage Off");
    expect(call.input.productDiscount).toBe(10);
    expect(call.input.status).toBe("Enabled");
    // Auto-expiry: the promotion must end exactly when the test window ends.
    expect(call.input.endDate).toBe(json.strategy.reviewAt);
  });

  it("maps a free-shipping offer to a shipping discount", async () => {
    const { app, c7 } = buildApp();
    const res = await app.request("http://localhost/v1/strategies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenantId: "acme",
        title: "Free shipping reminder",
        message: "Two more bottles and shipping is on us.",
        offer: { kind: "free-shipping" },
      }),
    });
    expect(res.status).toBe(201);
    const shipCall = c7.promotionCalls[0]!;
    expect(shipCall.input.shippingDiscountType).toBe("Percentage Off");
    expect(shipCall.input.shippingDiscount).toBe(100);
    expect(shipCall.input.productDiscountType).toBe("No Discount");
  });

  it("rejects discounts past the integrity cap", async () => {
    const { app } = buildApp();
    const res = await app.request("http://localhost/v1/strategies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenantId: "acme",
        title: "Everything must go",
        message: "Half price on everything.",
        offer: { kind: "percent", value: 50 },
      }),
    });
    expect(res.status).toBe(400);
  });

  it("keeps the strategy but reports promotionError when the C7 push fails", async () => {
    const { app, c7 } = buildApp();
    c7.createPromotion = async () => {
      throw new Error("C7 down");
    };
    const res = await app.request("http://localhost/v1/strategies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenantId: "acme",
        title: "Perfect pairing",
        message: "Add our Rosé and take 10% off the pair.",
        offer: { kind: "percent", value: 10 },
      }),
    });
    expect(res.status).toBe(201);
    const json = (await res.json()) as {
      strategy: { promotionId: string | null };
      promotionError: string | null;
    };
    expect(json.strategy.promotionId).toBeNull();
    expect(json.promotionError).toContain("C7 down");
  });

  it("honours the internal Bearer gate", async () => {
    const { app } = buildApp({ internalApiToken: "secret" });
    const res = await app.request("http://localhost/v1/strategies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId: "acme", title: "t", message: "m" }),
    });
    expect(res.status).toBe(401);
  });
});

describe("GET /v1/strategies", () => {
  it("lists strategies with verdicts computed from activity since baseline", async () => {
    const { app } = buildApp();
    await ingest(app, "acme", "impression", 5);

    const createRes = await app.request("http://localhost/v1/strategies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId: "acme", title: "Nudge", message: "m" }),
    });
    expect(createRes.status).toBe(201);

    // Post-baseline activity: enough clicks + purchases for a real read,
    // with a clearly higher add-to-cart rate than the (empty-rate) baseline.
    await ingest(app, "acme", "click", 25);
    await ingest(app, "acme", "add_to_cart", 10);
    await ingest(app, "acme", "purchase", 4);

    const res = await app.request("http://localhost/v1/strategies?tenantId=acme");
    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      strategies: { verdict: { headline: string; since: { clicks: number; purchases: number } } }[];
    };
    expect(json.strategies).toHaveLength(1);
    const first = json.strategies[0]!;
    expect(first.verdict.since.clicks).toBe(25);
    expect(first.verdict.since.purchases).toBe(4);
    expect(first.verdict.headline).toBe("Working well");
  });
});

describe("POST /v1/strategies/:id/end", () => {
  it("ends the strategy and ends its Commerce7 promotion", async () => {
    const { app, c7 } = buildApp();
    const createRes = await app.request("http://localhost/v1/strategies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenantId: "acme",
        title: "Pairing",
        message: "m",
        offer: { kind: "percent", value: 10 },
      }),
    });
    const created = (await createRes.json()) as { strategy: { id: string } };

    const res = await app.request(`http://localhost/v1/strategies/${created.strategy.id}/end`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId: "acme" }),
    });
    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      strategy: { status: string };
      verdict: { headline: string };
      promotionError: string | null;
    };
    expect(json.strategy.status).toBe("ended");
    expect(json.verdict.headline).toBe("Ended");
    expect(json.promotionError).toBeNull();
    expect(c7.endPromotionCalls).toHaveLength(1);
    expect(c7.endPromotionCalls[0]!.promotionId).toBe("promo_mock_1");
  });

  it("404s for an unknown strategy", async () => {
    const { app } = buildApp();
    const res = await app.request("http://localhost/v1/strategies/nope/end", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId: "acme" }),
    });
    expect(res.status).toBe(404);
  });
});
