import { describe, expect, it } from "vitest";

import { MockCommerce7Client } from "../c7/mock-client.js";
import { createApp } from "../create-app.js";
import { loadEnv } from "../env.js";
import { InMemoryAnalyticsEventStore } from "../events/analytics-store.js";
import { InMemoryOAuthSessionStore } from "../oauth/oauth-store.js";
import { BackgroundOrderSyncRunner } from "../sync/background-scheduler.js";
import { InMemoryOrderRefPersistence } from "../sync/order-persistence.js";
import { InMemorySyncStateStore } from "../sync/sync-state.js";
import { InMemoryWebhookDeliveryStore } from "../webhook/store.js";

describe("internal Bearer gate", () => {
  it("returns 401 for operator routes when token configured; GET /v1/account/user still allowed with C7 JWT", async () => {
    const c7 = MockCommerce7Client.twoPageDemo();
    const syncState = new InMemorySyncStateStore();
    const app = createApp({
      env: loadEnv(),
      webhookStore: new InMemoryWebhookDeliveryStore(),
      internalApiToken: "operator-secret",
      sync: {
        client: c7,
        syncState,
        orderPersistence: new InMemoryOrderRefPersistence(),
      },
      reconcileEnabled: true,
      analytics: { store: new InMemoryAnalyticsEventStore() },
      oauth: { store: new InMemoryOAuthSessionStore() },
      backgroundSync: {
        runner: new BackgroundOrderSyncRunner({ client: c7, syncState }),
      },
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

    const appSync = await app.request("http://localhost/v1/app-sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenantId: "t",
        objectType: "Order",
        objectId: "o1",
        status: "Success",
      }),
    });
    expect(appSync.status).toBe(401);

    const insights = await app.request("http://localhost/v1/insights/overview?tenantId=t");
    expect(insights.status).toBe(401);

    const oauthStatus = await app.request("http://localhost/oauth/status?tenantId=t");
    expect(oauthStatus.status).toBe(401);

    const syncStatus = await app.request("http://localhost/v1/sync/status?tenantId=t");
    expect(syncStatus.status).toBe(401);

    const syncRun = await app.request("http://localhost/v1/sync/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId: "t" }),
    });
    expect(syncRun.status).toBe(401);

    const accountUser = await app.request("http://localhost/v1/account/user?tenantId=t", {
      headers: { Authorization: "c7-extension-jwt" },
    });
    expect(accountUser.status).toBe(200);
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

    const syncPost = await app.request("http://localhost/v1/app-sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer operator-secret",
      },
      body: JSON.stringify({
        tenantId: "t",
        objectType: "Order",
        objectId: "o-sync",
        status: "Success",
      }),
    });
    expect(syncPost.status).toBe(200);
  });
});
