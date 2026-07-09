import { describe, expect, it } from "vitest";

import { InMemoryAnalyticsEventStore } from "./analytics-store.js";

describe("InMemoryAnalyticsEventStore.summarizeTenant", () => {
  it("groups Cart Carrot, personalization blocks, surfaces, and conversion-like names", async () => {
    const store = new InMemoryAnalyticsEventStore();
    const tenant = "t1";
    const post = async (clientEventId: string, name: string, properties?: Record<string, unknown>) => {
      await store.record({
        tenantId: tenant,
        clientEventId,
        body: { tenantId: tenant, clientEventId, name, properties },
      });
    };

    await post("a", "impression", { surface: "cart_carrot", elementId: "c1" });
    await post("b", "click", { surface: "cart_carrot", elementId: "c1" });
    await post("c", "add_to_cart", { surface: "cart_carrot", elementId: "c1" });
    await post("d", "click", { surface: "personalization_block", blockId: "hero" });
    await post("e", "purchase", { surface: "cart_carrot", orderId: "o1" });

    const s = await store.summarizeTenant(tenant);
    expect(s.totalEvents).toBe(5);
    expect(s.cartCarrot.total).toBe(4);
    expect(s.cartCarrot.byEventName.add_to_cart).toBe(1);
    expect(s.cartCarrot.byEventName.click).toBe(1);
    expect(s.personalizationBlock.total).toBe(1);
    expect(s.personalizationBlock.byEventName.click).toBe(1);
    expect(s.bySurface.cart_carrot).toBe(4);
    expect(s.bySurface.personalization_block).toBe(1);
    expect(s.conversionLikeEvents).toBe(1);
    expect(s.recent).toHaveLength(5);
    expect(s.recent[0]?.surface).toBeDefined();
  });

  it("builds cartCarrotBreakdown with blockTitle data when blockTitle is present", async () => {
    const store = new InMemoryAnalyticsEventStore();
    const tenant = "t2";
    const post = async (clientEventId: string, name: string, properties?: Record<string, unknown>) => {
      await store.record({
        tenantId: tenant,
        clientEventId,
        body: { tenantId: tenant, clientEventId, name, properties },
      });
    };

    // Carrot A: "You may also like" — 3 impressions, 2 clicks, 1 add
    const carrotA = { surface: "cart_carrot", blockTitle: "You may also like", recommendedProductSku: "CHARD-750", recommendedProductTitle: "Chardonnay 2022" };
    await post("a1", "impression", carrotA);
    await post("a2", "impression", carrotA);
    await post("a3", "impression", carrotA);
    await post("a4", "click", carrotA);
    await post("a5", "click", carrotA);
    await post("a6", "add_to_cart", carrotA);

    // Carrot B: "Pairs well with" — 2 impressions, 1 click, 0 adds
    const carrotB = { surface: "cart_carrot", blockTitle: "Pairs well with", recommendedProductSku: "PINOT-750", recommendedProductTitle: "Pinot Noir 2021" };
    await post("b1", "impression", carrotB);
    await post("b2", "impression", carrotB);
    await post("b3", "click", carrotB);

    const s = await store.summarizeTenant(tenant);
    expect(s.cartCarrotBreakdown.hasBlockTitleData).toBe(true);
    expect(s.cartCarrotBreakdown.rows).toHaveLength(2);

    // Sorted by ATC rate desc: A = 1/3 ≈ 33%, B = 0/2 = 0%
    const [first, second] = s.cartCarrotBreakdown.rows;
    expect(first?.blockTitle).toBe("You may also like");
    expect(first?.recommendedSku).toBe("CHARD-750");
    expect(first?.recommendedTitle).toBe("Chardonnay 2022");
    expect(first?.byEventName.impression).toBe(3);
    expect(first?.byEventName.click).toBe(2);
    expect(first?.byEventName.add_to_cart).toBe(1);
    expect(second?.blockTitle).toBe("Pairs well with");
    expect(second?.byEventName.add_to_cart).toBeUndefined();
  });

  it("builds cartCarrotBreakdown with hasBlockTitleData=false when no blockTitle is sent", async () => {
    const store = new InMemoryAnalyticsEventStore();
    const tenant = "t3";
    const post = async (clientEventId: string, name: string, properties?: Record<string, unknown>) => {
      await store.record({
        tenantId: tenant,
        clientEventId,
        body: { tenantId: tenant, clientEventId, name, properties },
      });
    };

    // Cart Carrot events without blockTitle (legacy/unupgraded collector)
    await post("x1", "impression", { surface: "cart_carrot", blockId: "old-id" });
    await post("x2", "click", { surface: "cart_carrot", blockId: "old-id" });
    await post("x3", "add_to_cart", { surface: "cart_carrot", blockId: "old-id" });

    const s = await store.summarizeTenant(tenant);
    expect(s.cartCarrotBreakdown.hasBlockTitleData).toBe(false);
    expect(s.cartCarrotBreakdown.rows).toHaveLength(1);
    expect(s.cartCarrotBreakdown.rows[0]?.blockTitle).toBe("unknown");
    expect(s.cartCarrotBreakdown.rows[0]?.byEventName.impression).toBe(1);
    expect(s.cartCarrotBreakdown.rows[0]?.byEventName.add_to_cart).toBe(1);
  });
});
