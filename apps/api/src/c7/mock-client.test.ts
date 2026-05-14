import { describe, expect, it } from "vitest";

import { MockCommerce7Client } from "./mock-client.js";

describe("MockCommerce7Client", () => {
  it("returns pages for start and inner cursor, then ends", async () => {
    const client = MockCommerce7Client.twoPageDemo();
    const p1 = await client.listOrders({ tenantId: "t1", cursor: "start" });
    expect(p1.orders).toHaveLength(2);
    expect(p1.nextCursor).toBe("page-2");

    const p2 = await client.listOrders({ tenantId: "t1", cursor: "page-2" });
    expect(p2.orders).toHaveLength(1);
    expect(p2.nextCursor).toBe(null);
  });

  it("returns empty for unknown cursor", async () => {
    const client = MockCommerce7Client.twoPageDemo();
    const p = await client.listOrders({ tenantId: "t1", cursor: "nope" });
    expect(p.orders).toEqual([]);
    expect(p.nextCursor).toBe(null);
  });

  it("records createAppSync calls", async () => {
    const client = MockCommerce7Client.twoPageDemo();
    await client.createAppSync("ten", {
      objectType: "Order",
      objectId: "o1",
      status: "Success",
    });
    expect(client.appSyncCalls).toHaveLength(1);
    expect(client.appSyncCalls[0]!.tenantId).toBe("ten");
  });

  it("getAccountUser records call and maps mock-401", async () => {
    const client = MockCommerce7Client.twoPageDemo();
    const ok = await client.getAccountUser("t", "tok");
    expect(ok.status).toBe(200);
    expect(client.accountUserCalls).toHaveLength(1);

    const denied = await client.getAccountUser("t", "mock-401");
    expect(denied.status).toBe(401);
  });
});
