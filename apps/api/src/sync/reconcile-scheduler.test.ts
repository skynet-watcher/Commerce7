import { describe, expect, it } from "vitest";

import { MockCommerce7Client } from "../c7/mock-client.js";
import { InMemoryAppInstallStore } from "../lifecycle/install-store.js";
import { InMemoryOrderRefPersistence } from "./order-persistence.js";
import { runReconcileSweep } from "./reconcile-scheduler.js";
import { InMemorySyncStateStore } from "./sync-state.js";

describe("runReconcileSweep", () => {
  it("syncs and reconciles active installs only", async () => {
    const installStore = new InMemoryAppInstallStore();
    await installStore.recordInstall({
      tenantId: "active-a",
      installerEmail: null,
      installerFirstName: null,
      installerLastName: null,
      raw: {},
    });
    await installStore.recordInstall({
      tenantId: "inactive-b",
      installerEmail: null,
      installerFirstName: null,
      installerLastName: null,
      raw: {},
    });
    await installStore.recordUninstall("inactive-b");

    const result = await runReconcileSweep({
      installStore,
      client: MockCommerce7Client.twoPageDemo(),
      syncState: new InMemorySyncStateStore(),
      orderPersistence: new InMemoryOrderRefPersistence(),
      intervalMs: 60_000,
      maxSyncBatchesPerTenant: 5,
    });

    expect(result.tenantsChecked).toBe(1);
    expect(result.errors).toEqual([]);
    expect(result.results).toHaveLength(1);
    expect(result.results[0]).toMatchObject({
      tenantId: "active-a",
      localCount: 3,
      remoteCount: 3,
      match: true,
    });
  });

  it("reports tenants that exceed the per-sweep batch cap", async () => {
    const installStore = new InMemoryAppInstallStore();
    await installStore.recordInstall({
      tenantId: "active-a",
      installerEmail: null,
      installerFirstName: null,
      installerLastName: null,
      raw: {},
    });

    const result = await runReconcileSweep({
      installStore,
      client: MockCommerce7Client.twoPageDemo(),
      syncState: new InMemorySyncStateStore(),
      orderPersistence: new InMemoryOrderRefPersistence(),
      intervalMs: 60_000,
      maxSyncBatchesPerTenant: 1,
    });

    expect(result.results).toEqual([]);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.tenantId).toBe("active-a");
  });
});
