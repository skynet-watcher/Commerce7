import type { Commerce7Client } from "../c7/types.js";
import { listAllOrderRefs } from "../c7/walk-orders.js";
import type { AnalyticsEventStore } from "../events/analytics-schema.js";

export type InsightsOverviewPayload = {
  tenantId: string;
  generatedAt: string;
  range: {
    startDate: string | null;
    endDate: string | null;
  };
  commerce7DataSource: "mock" | "http";
  orders: {
    cursorWalkTotal: number | null;
    ok: boolean;
    error: string | null;
  };
  analytics: Awaited<ReturnType<AnalyticsEventStore["summarizeTenant"]>>;
  illustrative: {
    label: string;
    dailyOrders: { day: string; count: number }[];
  };
  notes: string[];
};

/** Deterministic “nice enough” placeholder series until sandbox-backed revenue metrics exist. */
export function illustrativeDailyOrders(tenantId: string): { day: string; count: number }[] {
  const days = 14;
  const out: { day: string; count: number }[] = [];
  const now = new Date();
  let seed = 0;
  for (let i = 0; i < tenantId.length; i++) {
    seed += tenantId.charCodeAt(i);
  }
  for (let d = days - 1; d >= 0; d--) {
    const dt = new Date(now);
    dt.setUTCDate(dt.getUTCDate() - d);
    const day = dt.toISOString().slice(0, 10);
    const count = 8 + ((seed + d * 17) % 18);
    out.push({ day, count });
  }
  return out;
}

export async function buildInsightsOverview(opts: {
  tenantId: string;
  client: Commerce7Client;
  analytics: AnalyticsEventStore;
  commerce7DataSource: "mock" | "http";
  range?: { startDate?: Date | undefined; endDate?: Date | undefined };
}): Promise<InsightsOverviewPayload> {
  const { tenantId, client, analytics, commerce7DataSource, range } = opts;
  const notes: string[] = [
    "Tag storefront events with `properties.surface`: `cart_carrot` for Cart Carrot, `personalization_block` for personalization / dynamic content blocks.",
    "Use event `name` for the funnel step: `impression`, `click`, `add_to_cart`, then `purchase` / `order_completed` / `checkout_completed` for conversion-style signals.",
    "Orders shown here come from a Commerce7 order API walk. Answering “did this Cart Carrot click lead to an order?” still requires joining sessions to orders (webhooks + your correlation IDs)—that join is not computed in this response yet.",
    "The 14-day chart is still a deterministic placeholder until daily aggregates are backed by real event rollups.",
  ];

  let orders: InsightsOverviewPayload["orders"];
  try {
    const refs = await listAllOrderRefs(client, tenantId);
    orders = { cursorWalkTotal: refs.length, ok: true, error: null };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    orders = { cursorWalkTotal: null, ok: false, error: msg };
    notes.push("Order walk failed — check API credentials, tenant slug, and network.");
  }

  const analyticsSummary = await analytics.summarizeTenant(tenantId, range);

  return {
    tenantId,
    generatedAt: new Date().toISOString(),
    range: {
      startDate: range?.startDate?.toISOString() ?? null,
      endDate: range?.endDate?.toISOString() ?? null,
    },
    commerce7DataSource,
    orders,
    analytics: analyticsSummary,
    illustrative: {
      label: "Sample dynamic-merchandising trend (placeholder)",
      dailyOrders: illustrativeDailyOrders(tenantId),
    },
    notes,
  };
}
