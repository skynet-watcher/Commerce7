import { describe, expect, it } from "vitest";

import { MockCommerce7Client } from "../c7/mock-client.js";
import { createApp } from "../create-app.js";
import { loadEnv } from "../env.js";
import { InMemorySyncStateStore } from "../sync/sync-state.js";
import { InMemoryWebhookDeliveryStore } from "../webhook/store.js";

describe("POST /v1/app-sync", () => {
  it("forwards validated body to Commerce7 client", async () => {
    const c7 = MockCommerce7Client.twoPageDemo();
    const app = createApp({
      env: loadEnv(),
      webhookStore: new InMemoryWebhookDeliveryStore(),
      sync: { client: c7, syncState: new InMemorySyncStateStore() },
    });

    const res = await app.request("http://localhost/v1/app-sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenantId: "acme",
        objectType: "Order",
        objectId: "ord-1",
        status: "Error",
        issues: ["warehouse delay"],
        actions: [{ httpType: "Get", url: "https://example.com/fix", label: "Resolve" }],
      }),
    });
    expect(res.status).toBe(200);
    expect(c7.appSyncCalls).toHaveLength(1);
    expect(c7.appSyncCalls[0]).toEqual({
      tenantId: "acme",
      body: {
        objectType: "Order",
        objectId: "ord-1",
        status: "Error",
        issues: ["warehouse delay"],
        actions: [{ httpType: "Get", url: "https://example.com/fix", label: "Resolve" }],
      },
    });
  });

  it("returns 404 or no route when sync not configured", async () => {
    const app = createApp({
      env: loadEnv(),
      webhookStore: new InMemoryWebhookDeliveryStore(),
    });
    const res = await app.request("http://localhost/v1/app-sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenantId: "t",
        objectType: "Order",
        objectId: "o",
        status: "Success",
      }),
    });
    expect(res.status).toBe(404);
  });
});
