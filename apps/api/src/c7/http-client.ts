import { z } from "zod";

import { fetchWithBackoff } from "../http/fetch-with-backoff.js";
import type { Commerce7Client, ListOrdersParams, ListOrdersResult } from "./types.js";

const listOrdersResponseSchema = z.object({
  orders: z.array(
    z
      .object({
        id: z.string(),
        updatedAt: z.string(),
      })
      .passthrough(),
  ),
  cursor: z.string().optional(),
});

export type HttpCommerce7ClientOptions = {
  baseUrl: string;
  /** App ID (Basic Auth username). */
  appId: string;
  /** App secret (Basic Auth password). */
  appSecret: string;
  /** Override for tests. */
  fetchImpl?: (input: string, init?: RequestInit) => Promise<Response>;
};

export class HttpCommerce7Client implements Commerce7Client {
  private readonly baseUrl: string;
  private readonly header: string;
  private readonly fetchImpl: (input: string, init?: RequestInit) => Promise<Response>;

  constructor(options: HttpCommerce7ClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, "");
    this.header = `Basic ${Buffer.from(`${options.appId}:${options.appSecret}`, "utf8").toString("base64")}`;
    this.fetchImpl = options.fetchImpl ?? ((u, i) => fetchWithBackoff(u, i));
  }

  async listOrders(params: ListOrdersParams): Promise<ListOrdersResult> {
    const limit = params.limit ?? 50;
    const url = new URL(`${this.baseUrl}/order`);
    url.searchParams.set("cursor", params.cursor);
    url.searchParams.set("limit", String(limit));

    const res = await this.fetchImpl(url.toString(), {
      method: "GET",
      headers: {
        Authorization: this.header,
        tenant: params.tenantId,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Commerce7 order list failed: HTTP ${res.status} ${text.slice(0, 200)}`);
    }

    const json: unknown = await res.json();
    const parsed = listOrdersResponseSchema.safeParse(json);
    if (!parsed.success) {
      throw new Error(`Commerce7 order list: unexpected JSON shape`);
    }

    const next =
      parsed.data.cursor && parsed.data.cursor.length > 0 ? parsed.data.cursor : null;

    return {
      orders: parsed.data.orders.map((o) => ({ id: o.id, updatedAt: o.updatedAt })),
      nextCursor: next,
    };
  }
}
