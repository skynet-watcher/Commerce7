import { describe, expect, it } from "vitest";

import { MockCommerce7Client } from "./c7/mock-client.js";
import { createApp } from "./create-app.js";
import { loadEnv } from "./env.js";
import { InMemoryAnalyticsEventStore } from "./events/analytics-store.js";
import { InMemorySyncStateStore } from "./sync/sync-state.js";
import { InMemoryWebhookDeliveryStore } from "./webhook/store.js";

describe("GET /v1/insights/overview", () => {
  it("requires tenantId", async () => {
    const app = createApp({
      env: loadEnv(),
      webhookStore: new InMemoryWebhookDeliveryStore(),
      sync: {
        client: MockCommerce7Client.twoPageDemo(),
        syncState: new InMemorySyncStateStore(),
      },
      analytics: { store: new InMemoryAnalyticsEventStore() },
    });
    const res = await app.request("http://localhost/v1/insights/overview");
    expect(res.status).toBe(400);
  });

  it("rejects missing bearer when INTERNAL_API_TOKEN is set", async () => {
    const app = createApp({
      env: loadEnv(),
      webhookStore: new InMemoryWebhookDeliveryStore(),
      internalApiToken: "overview-test-token",
      sync: {
        client: MockCommerce7Client.twoPageDemo(),
        syncState: new InMemorySyncStateStore(),
      },
      analytics: { store: new InMemoryAnalyticsEventStore() },
    });
    const res = await app.request("http://localhost/v1/insights/overview?tenantId=t");
    expect(res.status).toBe(401);
  });

  it("returns overview when authorized", async () => {
    const app = createApp({
      env: loadEnv(),
      webhookStore: new InMemoryWebhookDeliveryStore(),
      internalApiToken: "overview-ok",
      sync: {
        client: MockCommerce7Client.twoPageDemo(),
        syncState: new InMemorySyncStateStore(),
      },
      analytics: { store: new InMemoryAnalyticsEventStore() },
    });
    const res = await app.request("http://localhost/v1/insights/overview?tenantId=demo-tenant", {
      headers: { Authorization: "Bearer overview-ok" },
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      tenantId: string;
      orders: { cursorWalkTotal: number; ok: boolean };
      analytics: { totalEvents: number };
      illustrative: { dailyOrders: { day: string; count: number }[] };
    };
    expect(body.tenantId).toBe("demo-tenant");
    expect(body.orders.ok).toBe(true);
    expect(body.orders.cursorWalkTotal).toBe(3);
    expect(body.analytics.totalEvents).toBe(0);
    expect(body.illustrative.dailyOrders).toHaveLength(14);
  });

  it("validates and returns custom date range", async () => {
    const app = createApp({
      env: loadEnv(),
      webhookStore: new InMemoryWebhookDeliveryStore(),
      sync: {
        client: MockCommerce7Client.twoPageDemo(),
        syncState: new InMemorySyncStateStore(),
      },
      analytics: { store: new InMemoryAnalyticsEventStore() },
    });

    const res = await app.request(
      "http://localhost/v1/insights/overview?tenantId=demo-tenant&startDate=2026-05-01&endDate=2026-05-15",
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      range: { startDate: string | null; endDate: string | null };
    };
    expect(body.range.startDate).toBe("2026-05-01T00:00:00.000Z");
    expect(body.range.endDate).toBe("2026-05-15T23:59:59.999Z");

    const inverted = await app.request(
      "http://localhost/v1/insights/overview?tenantId=demo-tenant&startDate=2026-05-15&endDate=2026-05-01",
    );
    expect(inverted.status).toBe(400);
  });
});
