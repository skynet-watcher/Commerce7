import { describe, expect, it } from "vitest";

import { MockCommerce7Client } from "./mock-client.js";
import { listAllOrderRefs } from "./walk-orders.js";

describe("listAllOrderRefs", () => {
  it("walks until null cursor", async () => {
    const client = MockCommerce7Client.twoPageDemo();
    const all = await listAllOrderRefs(client, "any");
    expect(all).toHaveLength(3);
  });
});
