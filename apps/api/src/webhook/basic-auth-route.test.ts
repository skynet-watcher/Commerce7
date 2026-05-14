import { describe, expect, it } from "vitest";

import { MockCommerce7Client } from "../c7/mock-client.js";
import { createApp } from "../create-app.js";
import { loadEnv } from "../env.js";
import { InMemorySyncStateStore } from "../sync/sync-state.js";
import { InMemoryWebhookDeliveryStore } from "./store.js";

describe("POST /webhooks/commerce7 webhook basic auth", () => {
  const auth = "Basic " + Buffer.from("hookuser:hookpass", "utf8").toString("base64");

  it("returns 401 without Authorization when gate configured", async () => {
    const app = createApp({
      env: loadEnv(),
      webhookStore: new InMemoryWebhookDeliveryStore(),
      webhookBasicAuth: { user: "hookuser", password: "hookpass" },
      sync: {
        client: MockCommerce7Client.twoPageDemo(),
        syncState: new InMemorySyncStateStore(),
      },
    });
    const res = await app.request("http://localhost/webhooks/commerce7", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        object: "Order",
        action: "Update",
        payload: { id: "o1", updatedAt: "2024-01-01T00:00:00.000Z" },
        tenantId: "t",
      }),
    });
    expect(res.status).toBe(401);
  });

  it("accepts valid basic auth", async () => {
    const app = createApp({
      env: loadEnv(),
      webhookStore: new InMemoryWebhookDeliveryStore(),
      webhookBasicAuth: { user: "hookuser", password: "hookpass" },
      sync: {
        client: MockCommerce7Client.twoPageDemo(),
        syncState: new InMemorySyncStateStore(),
      },
    });
    const res = await app.request("http://localhost/webhooks/commerce7", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: auth,
      },
      body: JSON.stringify({
        object: "Order",
        action: "Update",
        payload: { id: "o1", updatedAt: "2024-01-01T00:00:00.000Z" },
        tenantId: "t",
      }),
    });
    expect(res.status).toBe(200);
  });
});
