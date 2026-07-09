import { describe, expect, it } from "vitest";

import { MockCommerce7Client } from "../c7/mock-client.js";
import { createApp } from "../create-app.js";
import { loadEnv } from "../env.js";
import { BackgroundOrderSyncRunner } from "./background-scheduler.js";
import { InMemoryOrderRefPersistence } from "./order-persistence.js";
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
        orderPersistence: new InMemoryOrderRefPersistence(),
      },
      reconcileEnabled: true,
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

    const p2 = await app.request("http://localhost/sync/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId: "t-sync" }),
    });
    expect(p2.status).toBe(200);
    const rec = await app.request("http://localhost/reconcile/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId: "t-sync" }),
    });
    expect(rec.status).toBe(200);
    expect(((await rec.json()) as { match: boolean }).match).toBe(true);
  });

  it("returns 400 without tenantId", async () => {
    const app = createApp({
      env: loadEnv(),
      webhookStore: new InMemoryWebhookDeliveryStore(),
      sync: {
        client: MockCommerce7Client.twoPageDemo(),
        syncState: new InMemorySyncStateStore(),
        orderPersistence: new InMemoryOrderRefPersistence(),
      },
      reconcileEnabled: true,
    });
    const res = await app.request("http://localhost/sync/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });

  it("exposes merchant-facing background sync run and status", async () => {
    const syncState = new InMemorySyncStateStore();
    const orderPersistence = new InMemoryOrderRefPersistence();
    const runner = new BackgroundOrderSyncRunner({
      client: MockCommerce7Client.twoPageDemo(),
      syncState,
      orderPersistence,
    });
    const app = createApp({
      env: loadEnv(),
      webhookStore: new InMemoryWebhookDeliveryStore(),
      sync: {
        client: MockCommerce7Client.twoPageDemo(),
        syncState,
        orderPersistence,
      },
      backgroundSync: { runner },
    });

    const run = await app.request("http://localhost/v1/sync/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId: "t-bg" }),
    });
    expect(run.status).toBe(200);
    const body = (await run.json()) as { status: { tenantId: string; lastFetched: number } };
    expect(body.status.tenantId).toBe("t-bg");
    expect(body.status.lastFetched).toBe(2);

    const status = await app.request("http://localhost/v1/sync/status?tenantId=t-bg");
    expect(status.status).toBe(200);
    const statusBody = (await status.json()) as { statuses: Array<{ runs: number }> };
    expect(statusBody.statuses[0]?.runs).toBe(1);
  });

  it("scheduler discovers active install tenants at tick time", async () => {
    const { InMemoryAppInstallStore } = await import("../lifecycle/install-store.js");
    const { startBackgroundOrderSyncScheduler } = await import("./background-scheduler.js");
    const installs = new InMemoryAppInstallStore();
    const syncState = new InMemorySyncStateStore();
    const runner = new BackgroundOrderSyncRunner({
      client: MockCommerce7Client.twoPageDemo(),
      syncState,
      orderPersistence: new InMemoryOrderRefPersistence(),
    });

    await installs.recordInstall({
      tenantId: "installed-tenant",
      installerEmail: null,
      installerFirstName: null,
      installerLastName: null,
      raw: {},
    });
    const scheduler = startBackgroundOrderSyncScheduler({
      runner,
      getTenantIds: () => installs.listActiveTenantIds(),
      intervalMs: 60_000,
    });
    await Promise.resolve();
    await new Promise((resolve) => setTimeout(resolve, 0));
    scheduler.stop();

    expect(runner.status("installed-tenant")[0]?.runs).toBe(1);
  });
});
