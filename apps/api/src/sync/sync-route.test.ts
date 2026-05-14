import { describe, expect, it } from "vitest";

import { MockCommerce7Client } from "../c7/mock-client.js";
import { createApp } from "../create-app.js";
import { loadEnv } from "../env.js";
import { InMemorySyncStateStore } from "./sync-state.js";
import { InMemoryWebhookDeliveryStore } from "../webhook/store.js";

describe("POST /sync/orders", () => {
  it("runs one cursor batch", async () => {
    const app = createApp({
      env: loadEnv(),
      webhookStore: new InMemoryWebhookDeliveryStore(),
      sync: {
        client: MockCommerce7Client.twoPageDemo(),
        syncState: new InMemorySyncStateStore(),
      },
    });

    const res = await app.request("http://localhost/sync/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId: "t-sync" }),
    });
    expect(res.status).toBe(200);
    const j = (await res.json()) as { fetched: number; completedWalk: boolean; persistedCursor: string | null };
    expect(j.fetched).toBe(2);
    expect(j.completedWalk).toBe(false);
    expect(j.persistedCursor).toBe("page-2");
  });

  it("returns 400 without tenantId", async () => {
    const app = createApp({
      env: loadEnv(),
      webhookStore: new InMemoryWebhookDeliveryStore(),
      sync: {
        client: MockCommerce7Client.twoPageDemo(),
        syncState: new InMemorySyncStateStore(),
      },
    });
    const res = await app.request("http://localhost/sync/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });
});
