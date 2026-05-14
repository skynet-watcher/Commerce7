import { describe, expect, it } from "vitest";

import { MockCommerce7Client } from "../c7/mock-client.js";
import { createApp } from "../create-app.js";
import { loadEnv } from "../env.js";
import { InMemoryAnalyticsEventStore } from "../events/analytics-store.js";
import { InMemoryOrderRefPersistence } from "../sync/order-persistence.js";
import { InMemorySyncStateStore } from "../sync/sync-state.js";
import { InMemoryWebhookDeliveryStore } from "../webhook/store.js";

describe("internal Bearer gate", () => {
  it("returns 401 for sync, reconcile, and events when token configured and header missing", async () => {
    const app = createApp({
      env: loadEnv(),
      webhookStore: new InMemoryWebhookDeliveryStore(),
      internalApiToken: "operator-secret",
      sync: {
        client: MockCommerce7Client.twoPageDemo(),
        syncState: new InMemorySyncStateStore(),
        orderPersistence: new InMemoryOrderRefPersistence(),
      },
      reconcileEnabled: true,
      analytics: { store: new InMemoryAnalyticsEventStore() },
    });

    const sync = await app.request("http://localhost/sync/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId: "t" }),
    });
    expect(sync.status).toBe(401);

    const rec = await app.request("http://localhost/reconcile/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId: "t" }),
    });
    expect(rec.status).toBe(401);

    const ev = await app.request("http://localhost/v1/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenantId: "t",
        clientEventId: "e1",
        name: "x",
      }),
    });
    expect(ev.status).toBe(401);
  });

  it("allows sync when Bearer matches", async () => {
    const app = createApp({
      env: loadEnv(),
      webhookStore: new InMemoryWebhookDeliveryStore(),
      internalApiToken: "operator-secret",
      sync: {
        client: MockCommerce7Client.twoPageDemo(),
        syncState: new InMemorySyncStateStore(),
      },
    });

    const res = await app.request("http://localhost/sync/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer operator-secret",
      },
      body: JSON.stringify({ tenantId: "t" }),
    });
    expect(res.status).toBe(200);
  });
});
