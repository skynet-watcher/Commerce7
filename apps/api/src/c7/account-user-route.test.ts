import { describe, expect, it } from "vitest";

import { MockCommerce7Client } from "./mock-client.js";
import { createApp } from "../create-app.js";
import { loadEnv } from "../env.js";
import { InMemorySyncStateStore } from "../sync/sync-state.js";
import { InMemoryWebhookDeliveryStore } from "../webhook/store.js";

describe("GET /v1/account/user", () => {
  it("proxies to Commerce7 client with tenant + Authorization", async () => {
    const c7 = MockCommerce7Client.twoPageDemo();
    const app = createApp({
      env: loadEnv(),
      webhookStore: new InMemoryWebhookDeliveryStore(),
      sync: { client: c7, syncState: new InMemorySyncStateStore() },
    });

    const res = await app.request(
      "http://localhost/v1/account/user?tenantId=wine-shop",
      {
        headers: { Authorization: "eyJ.mock.jwt" },
      },
    );
    expect(res.status).toBe(200);
    const j = (await res.json()) as { firstName: string };
    expect(j.firstName).toBe("Mock");
    expect(c7.accountUserCalls).toEqual([
      { tenantId: "wine-shop", authorization: "eyJ.mock.jwt" },
    ]);
  });

  it("returns Commerce7-style 401 body from mock", async () => {
    const c7 = MockCommerce7Client.twoPageDemo();
    const app = createApp({
      env: loadEnv(),
      webhookStore: new InMemoryWebhookDeliveryStore(),
      sync: { client: c7, syncState: new InMemorySyncStateStore() },
    });

    const res = await app.request(
      "http://localhost/v1/account/user?tenantId=t",
      { headers: { Authorization: "mock-401" } },
    );
    expect(res.status).toBe(401);
    const j = (await res.json()) as { type: string };
    expect(j.type).toBe("unauthorized");
  });

  it("400 without tenantId or Authorization", async () => {
    const app = createApp({
      env: loadEnv(),
      webhookStore: new InMemoryWebhookDeliveryStore(),
      sync: {
        client: MockCommerce7Client.twoPageDemo(),
        syncState: new InMemorySyncStateStore(),
      },
    });

    const noTenant = await app.request("http://localhost/v1/account/user", {
      headers: { Authorization: "x" },
    });
    expect(noTenant.status).toBe(400);

    const noAuth = await app.request("http://localhost/v1/account/user?tenantId=a");
    expect(noAuth.status).toBe(400);
  });

  it("404 when sync not configured", async () => {
    const app = createApp({
      env: loadEnv(),
      webhookStore: new InMemoryWebhookDeliveryStore(),
    });
    const res = await app.request(
      "http://localhost/v1/account/user?tenantId=a",
      { headers: { Authorization: "b" } },
    );
    expect(res.status).toBe(404);
  });
});
