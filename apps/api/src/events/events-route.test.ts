import { describe, expect, it } from "vitest";

import { createApp } from "../create-app.js";
import { loadEnv } from "../env.js";
import { InMemoryAnalyticsEventStore } from "./analytics-store.js";
import { InMemoryWebhookDeliveryStore } from "../webhook/store.js";

describe("POST /v1/events", () => {
  it("accepts event and rejects oversized body", async () => {
    const app = createApp({
      env: loadEnv(),
      webhookStore: new InMemoryWebhookDeliveryStore(),
      analytics: { store: new InMemoryAnalyticsEventStore() },
    });
    const res = await app.request("http://localhost/v1/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenantId: "t",
        clientEventId: "e1",
        name: "click",
      }),
    });
    expect(res.status).toBe(200);

    const big = JSON.stringify({
      tenantId: "t",
      clientEventId: "e2",
      name: "x",
      properties: { pad: "x".repeat(70_000) },
    });
    const res413 = await app.request("http://localhost/v1/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: big,
    });
    expect(res413.status).toBe(413);
  });
});
