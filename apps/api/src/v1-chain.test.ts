import { describe, expect, it } from "vitest";

import { MockCommerce7Client } from "./c7/mock-client.js";
import { createApp } from "./create-app.js";
import { loadEnv } from "./env.js";
import { InMemorySyncStateStore } from "./sync/sync-state.js";
import { InMemoryWebhookDeliveryStore } from "./webhook/store.js";

/**
 * Cross-surface smoke: each new segment should keep this green (health + sync cursors + webhooks).
 */
describe("V1 interconnection (in-memory)", () => {
  it("health → order sync (2 steps) → webhook → duplicate retry", async () => {
    const store = new InMemoryWebhookDeliveryStore();
    const syncState = new InMemorySyncStateStore();
    const env = loadEnv();
    const app = createApp({
      env,
      webhookStore: store,
      sync: {
        client: MockCommerce7Client.twoPageDemo(),
        syncState,
      },
    });

    const health = await app.request("http://localhost/health");
    expect(health.status).toBe(200);
    const healthJson = (await health.json()) as { ok: boolean };
    expect(healthJson.ok).toBe(true);

    const syncBody = { tenantId: "v1-tenant" };
    const sy1 = await app.request("http://localhost/sync/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(syncBody),
    });
    expect(sy1.status).toBe(200);
    expect(((await sy1.json()) as { completedWalk: boolean }).completedWalk).toBe(false);

    const sy2 = await app.request("http://localhost/sync/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(syncBody),
    });
    expect(sy2.status).toBe(200);
    expect(((await sy2.json()) as { completedWalk: boolean }).completedWalk).toBe(true);

    const body = {
      object: "Order",
      action: "Update",
      payload: { id: "o-chain", updatedAt: "2024-06-01T00:00:00.000Z" },
      tenantId: "v1-tenant",
    };
    const r1 = await app.request("http://localhost/webhooks/commerce7", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    expect(r1.status).toBe(200);
    expect(((await r1.json()) as { duplicate: boolean }).duplicate).toBe(false);

    const r2 = await app.request("http://localhost/webhooks/commerce7", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    expect(r2.status).toBe(200);
    expect(((await r2.json()) as { duplicate: boolean }).duplicate).toBe(true);
    expect(store.size()).toBe(1);
  });
});
