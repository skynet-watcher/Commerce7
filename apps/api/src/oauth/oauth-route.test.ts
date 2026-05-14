import { describe, expect, it } from "vitest";

import { createApp } from "../create-app.js";
import { loadEnv } from "../env.js";
import { InMemoryOAuthSessionStore } from "./oauth-store.js";
import { InMemoryWebhookDeliveryStore } from "../webhook/store.js";

describe("GET /oauth/callback", () => {
  it("persists stub when tenantId present", async () => {
    const store = new InMemoryOAuthSessionStore();
    const app = createApp({
      env: loadEnv(),
      webhookStore: new InMemoryWebhookDeliveryStore(),
      oauth: { store },
    });
    const res = await app.request(
      "http://localhost/oauth/callback?tenantId=wine&code=abc&error=",
    );
    expect(res.status).toBe(200);
    const row = await store.getStub("wine");
    expect(row?.code).toBe("abc");
  });
});
