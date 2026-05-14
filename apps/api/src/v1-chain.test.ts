import { describe, expect, it } from "vitest";

import { MockCommerce7Client } from "./c7/mock-client.js";
import { createApp } from "./create-app.js";
import { loadEnv } from "./env.js";
import { InMemoryAnalyticsEventStore } from "./events/analytics-store.js";
import { InMemoryAppInstallStore } from "./lifecycle/install-store.js";
import { InMemoryOAuthSessionStore } from "./oauth/oauth-store.js";
import { InMemoryOrderRefPersistence } from "./sync/order-persistence.js";
import { InMemorySyncStateStore } from "./sync/sync-state.js";
import { InMemoryWebhookDeliveryStore } from "./webhook/store.js";

/**
 * Cross-surface smoke: health → lifecycle → account user → sync → reconcile → app-sync → analytics → oauth → webhooks.
 */
describe("V1 interconnection (in-memory)", () => {
  it("full Phase-A style path", async () => {
    const store = new InMemoryWebhookDeliveryStore();
    const syncState = new InMemorySyncStateStore();
    const orderPersistence = new InMemoryOrderRefPersistence();
    const analyticsStore = new InMemoryAnalyticsEventStore();
    const oauthStore = new InMemoryOAuthSessionStore();
    const installStore = new InMemoryAppInstallStore();
    const env = loadEnv();
    const tenant = "v1-tenant-chain";
    const c7 = MockCommerce7Client.twoPageDemo();

    const app = createApp({
      env,
      webhookStore: store,
      sync: {
        client: c7,
        syncState,
        orderPersistence,
      },
      reconcileEnabled: true,
      analytics: { store: analyticsStore },
      oauth: { store: oauthStore },
      lifecycle: { store: installStore },
    });

    const health = await app.request("http://localhost/health");
    expect(health.status).toBe(200);

    const life = await app.request("http://localhost/lifecycle/install", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenantId: tenant,
        firstName: "R",
        lastName: "L",
        email: "r@example.com",
      }),
    });
    expect(life.status).toBe(200);
    expect((await installStore.getInstall(tenant))?.uninstalledAt).toBeNull();

    const acct = await app.request(
      `http://localhost/v1/account/user?tenantId=${encodeURIComponent(tenant)}`,
      { headers: { Authorization: "iframe-account-jwt" } },
    );
    expect(acct.status).toBe(200);
    expect(c7.accountUserCalls).toEqual([
      { tenantId: tenant, authorization: "iframe-account-jwt" },
    ]);

    const syncBody = { tenantId: tenant };
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
    expect(await orderPersistence.countOrders(tenant)).toBe(3);

    const rec = await app.request("http://localhost/reconcile/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(syncBody),
    });
    expect(rec.status).toBe(200);
    expect(((await rec.json()) as { match: boolean }).match).toBe(true);

    const appSync = await app.request("http://localhost/v1/app-sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenantId: tenant,
        objectType: "Order",
        objectId: "o-chain",
        status: "Success",
      }),
    });
    expect(appSync.status).toBe(200);
    expect(c7.appSyncCalls).toEqual([
      {
        tenantId: tenant,
        body: { objectType: "Order", objectId: "o-chain", status: "Success" },
      },
    ]);

    const ev = await app.request("http://localhost/v1/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenantId: tenant,
        clientEventId: "evt-1",
        name: "page_view",
        properties: { path: "/" },
      }),
    });
    expect(ev.status).toBe(200);
    expect(((await ev.json()) as { duplicate: boolean }).duplicate).toBe(false);

    const evDup = await app.request("http://localhost/v1/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenantId: tenant,
        clientEventId: "evt-1",
        name: "page_view",
      }),
    });
    expect(evDup.status).toBe(200);
    expect(((await evDup.json()) as { duplicate: boolean }).duplicate).toBe(true);

    const cb = await app.request(
      `http://localhost/oauth/callback?tenantId=${encodeURIComponent(tenant)}&code=stub-code`,
    );
    expect(cb.status).toBe(200);
    const stored = await oauthStore.getStub(tenant);
    expect(stored?.code).toBe("stub-code");

    const body = {
      object: "Order",
      action: "Update",
      payload: { id: "o-chain", updatedAt: "2024-06-01T00:00:00.000Z" },
      tenantId: tenant,
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
