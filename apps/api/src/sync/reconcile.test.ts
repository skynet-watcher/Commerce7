import { describe, expect, it } from "vitest";

import { MockCommerce7Client } from "../c7/mock-client.js";
import { InMemoryOrderRefPersistence } from "./order-persistence.js";
import { reconcileSyncedOrders } from "./reconcile.js";
import { InMemorySyncStateStore, runOrderSyncStep } from "./sync-state.js";

describe("reconcileSyncedOrders", () => {
  it("matches after full mock syncwalk persisted all refs", async () => {
    const client = MockCommerce7Client.twoPageDemo();
    const syncState = new InMemorySyncStateStore();
    const persist = new InMemoryOrderRefPersistence();
    const tenant = "reco-1";

    await runOrderSyncStep(client, syncState, tenant, { orderPersistence: persist });
    await runOrderSyncStep(client, syncState, tenant, { orderPersistence: persist });

    const r = await reconcileSyncedOrders(client, persist, tenant);
    expect(r.localCount).toBe(3);
    expect(r.remoteCount).toBe(3);
    expect(r.match).toBe(true);
  });

  it("detects drift when local is incomplete", async () => {
    const client = MockCommerce7Client.twoPageDemo();
    const persist = new InMemoryOrderRefPersistence();
    const tenant = "reco-2";
    await persist.upsertOrderRefs(tenant, [{ id: "only-one", updatedAt: "2024-01-01T00:00:00.000Z" }]);

    const r = await reconcileSyncedOrders(client, persist, tenant);
    expect(r.match).toBe(false);
    expect(r.remoteCount).toBe(3);
    expect(r.localCount).toBe(1);
  });
});
