import { describe, expect, it } from "vitest";
import { createHmac } from "node:crypto";

import { createApp } from "../create-app.js";
import { loadEnv } from "../env.js";
import { InMemoryWebhookDeliveryStore } from "../webhook/store.js";

describe("POST /webhooks/commerce7", () => {
  it("stores first delivery and marks duplicate on retry", async () => {
    const store = new InMemoryWebhookDeliveryStore();
    const env = loadEnv();
    const app = createApp({ env, webhookStore: store });

    const body = {
      object: "Order",
      action: "Update",
      payload: { id: "o1", updatedAt: "2024-01-01T00:00:00.000Z" },
      tenantId: "tenant-a",
    };

    const res1 = await app.request("http://localhost/webhooks/commerce7", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    expect(res1.status).toBe(200);
    const j1 = (await res1.json()) as { duplicate: boolean; idempotencyKey: string };
    expect(j1.duplicate).toBe(false);
    expect(store.size()).toBe(1);

    const res2 = await app.request("http://localhost/webhooks/commerce7", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    expect(res2.status).toBe(200);
    const j2 = (await res2.json()) as { duplicate: boolean; idempotencyKey: string };
    expect(j2.duplicate).toBe(true);
    expect(j2.idempotencyKey).toBe(j1.idempotencyKey);
    expect(store.size()).toBe(1);
  });

  it("returns 400 for invalid JSON", async () => {
    const app = createApp({ env: loadEnv(), webhookStore: new InMemoryWebhookDeliveryStore() });
    const res = await app.request("http://localhost/webhooks/commerce7", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 for missing tenantId", async () => {
    const app = createApp({ env: loadEnv(), webhookStore: new InMemoryWebhookDeliveryStore() });
    const res = await app.request("http://localhost/webhooks/commerce7", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ object: "Order", action: "Update", payload: {} }),
    });
    expect(res.status).toBe(400);
  });

  it("isolates same order id across tenants", async () => {
    const store = new InMemoryWebhookDeliveryStore();
    const env = loadEnv();
    const app = createApp({ env, webhookStore: store });
    const payload = { id: "o1", updatedAt: "2024-01-01T00:00:00.000Z" };

    await app.request("http://localhost/webhooks/commerce7", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ object: "Order", action: "Update", payload, tenantId: "a" }),
    });
    await app.request("http://localhost/webhooks/commerce7", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ object: "Order", action: "Update", payload, tenantId: "b" }),
    });

    expect(store.size()).toBe(2);
  });

  it("requires configured webhook signature before parsing", async () => {
    const store = new InMemoryWebhookDeliveryStore();
    const secret = "webhook-secret";
    const app = createApp({
      env: loadEnv(),
      webhookStore: store,
      webhookSignature: {
        secret,
        headerName: "x-commerce7-signature",
        algorithm: "sha256",
      },
    });
    const raw = JSON.stringify({
      object: "Order",
      action: "Update",
      payload: { id: "o1", updatedAt: "2024-01-01T00:00:00.000Z" },
      tenantId: "tenant-a",
    });
    const signature = createHmac("sha256", secret).update(raw, "utf8").digest("hex");

    const denied = await app.request("http://localhost/webhooks/commerce7", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: raw,
    });
    expect(denied.status).toBe(401);

    const accepted = await app.request("http://localhost/webhooks/commerce7", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-commerce7-signature": `sha256=${signature}`,
      },
      body: raw,
    });
    expect(accepted.status).toBe(200);
    expect(store.size()).toBe(1);
  });
});
