import { describe, expect, it, vi } from "vitest";

import { HttpCommerce7Client } from "./http-client.js";

describe("HttpCommerce7Client", () => {
  it("maps Commerce7 JSON to ListOrdersResult", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          orders: [{ id: "a1", updatedAt: "2024-01-01T00:00:00.000Z", total: 100 }],
          cursor: "next-cursor",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const client = new HttpCommerce7Client({
      baseUrl: "https://api.commerce7.com/v1",
      appId: "app",
      appSecret: "sec",
      fetchImpl: fetchImpl as (input: string, init?: RequestInit) => Promise<Response>,
    });

    const r = await client.listOrders({ tenantId: "tenant-a", cursor: "start", limit: 10 });

    expect(r.orders).toEqual([{ id: "a1", updatedAt: "2024-01-01T00:00:00.000Z" }]);
    expect(r.nextCursor).toBe("next-cursor");

    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.commerce7.com/v1/order?cursor=start&limit=10",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: "Basic " + Buffer.from("app:sec").toString("base64"),
          tenant: "tenant-a",
        }),
      }),
    );
  });

  it("treats missing cursor as end of pagination", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ orders: [{ id: "x", updatedAt: "2024-02-02T00:00:00.000Z" }] }), {
        status: 200,
      }),
    );
    const client = new HttpCommerce7Client({
      baseUrl: "https://api.commerce7.com/v1",
      appId: "a",
      appSecret: "b",
      fetchImpl: fetchImpl as (input: string, init?: RequestInit) => Promise<Response>,
    });
    const r = await client.listOrders({ tenantId: "t", cursor: "start" });
    expect(r.nextCursor).toBe(null);
  });

  it("POSTs app-sync with Basic Auth and tenant header", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(null, { status: 201 }));
    const client = new HttpCommerce7Client({
      baseUrl: "https://api.commerce7.com/v1",
      appId: "app",
      appSecret: "sec",
      fetchImpl: fetchImpl as (input: string, init?: RequestInit) => Promise<Response>,
    });
    await client.createAppSync("my-tenant", {
      objectType: "Customer",
      objectId: "c1",
      status: "Error",
      issues: ["x"],
    });
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.commerce7.com/v1/app-sync",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Basic " + Buffer.from("app:sec").toString("base64"),
          tenant: "my-tenant",
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({
          objectType: "Customer",
          objectId: "c1",
          status: "Error",
          issues: ["x"],
        }),
      }),
    );
  });
});
