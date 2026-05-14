import { describe, expect, it } from "vitest";

import { MockCommerce7Client } from "../c7/mock-client.js";
import { SYNC_RESOURCE_ORDER } from "../c7/types.js";
import { InMemorySyncStateStore, runOrderSyncStep } from "./sync-state.js";

describe("runOrderSyncStep", () => {
  it("advances cursor across pages then clears state", async () => {
    const client = MockCommerce7Client.twoPageDemo();
    const sync = new InMemorySyncStateStore();
    const tenant = "acme";

    const s1 = await runOrderSyncStep(client, sync, tenant);
    expect(s1.fetched).toBe(2);
    expect(s1.completedWalk).toBe(false);
    expect(s1.persistedCursor).toBe("page-2");
    expect(await sync.getCursor(tenant, SYNC_RESOURCE_ORDER)).toBe("page-2");

    const s2 = await runOrderSyncStep(client, sync, tenant);
    expect(s2.fetched).toBe(1);
    expect(s2.completedWalk).toBe(true);
    expect(s2.persistedCursor).toBe(null);
    expect(await sync.getCursor(tenant, SYNC_RESOURCE_ORDER)).toBe(null);

    const s3 = await runOrderSyncStep(client, sync, tenant);
    expect(s3.fetched).toBe(2);
    expect(s3.completedWalk).toBe(false);
    expect(s3.persistedCursor).toBe("page-2");
  });

  it("isolates cursors by tenant", async () => {
    const client = MockCommerce7Client.twoPageDemo();
    const sync = new InMemorySyncStateStore();
    await runOrderSyncStep(client, sync, "a");
    await runOrderSyncStep(client, sync, "b");
    expect(await sync.getCursor("a", SYNC_RESOURCE_ORDER)).toBe("page-2");
    expect(await sync.getCursor("b", SYNC_RESOURCE_ORDER)).toBe("page-2");
  });
});
