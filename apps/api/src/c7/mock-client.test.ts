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
});
