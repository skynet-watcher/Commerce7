import { z } from "zod";

import { appSyncCreateInputSchema, type AppSyncCreateInput } from "./app-sync-schema.js";
import { fetchWithBackoff } from "../http/fetch-with-backoff.js";
import type {
  C7PromotionInput,
  C7PromotionRef,
  Commerce7Client,
  ListOrdersParams,
  ListOrdersResult,
} from "./types.js";

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

  async createAppSync(tenantId: string, body: AppSyncCreateInput): Promise<void> {
    const parsed = appSyncCreateInputSchema.safeParse(body);
    if (!parsed.success) {
      throw new Error("Commerce7 createAppSync: invalid body shape");
    }
    const res = await this.fetchImpl(`${this.baseUrl}/app-sync`, {
      method: "POST",
      headers: {
        Authorization: this.header,
        tenant: tenantId,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parsed.data),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Commerce7 app-sync failed: HTTP ${res.status} ${text.slice(0, 200)}`);
    }
  }

  async createPromotion(tenantId: string, input: C7PromotionInput): Promise<C7PromotionRef> {
    const res = await this.fetchImpl(`${this.baseUrl}/promotion`, {
      method: "POST",
      headers: {
        Authorization: this.header,
        tenant: tenantId,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Commerce7 create promotion failed: HTTP ${res.status} ${text.slice(0, 200)}`);
    }
    const json = (await res.json()) as { id?: unknown };
    if (typeof json.id !== "string" || json.id.length === 0) {
      throw new Error("Commerce7 create promotion: response missing id");
    }
    return { id: json.id };
  }

  async endPromotion(tenantId: string, promotionId: string, endDate: string): Promise<void> {
    const headers = {
      Authorization: this.header,
      tenant: tenantId,
      Accept: "application/json",
    };
    const getRes = await this.fetchImpl(`${this.baseUrl}/promotion/${promotionId}`, {
      method: "GET",
      headers,
    });
    if (!getRes.ok) {
      const text = await getRes.text().catch(() => "");
      throw new Error(`Commerce7 get promotion failed: HTTP ${getRes.status} ${text.slice(0, 200)}`);
    }
    const current = (await getRes.json()) as Record<string, unknown>;
    // PUT expects the full promotion body; send it back with the new endDate.
    const { id: _id, createdAt: _c, updatedAt: _u, ...body } = current;
    const putRes = await this.fetchImpl(`${this.baseUrl}/promotion/${promotionId}`, {
      method: "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, endDate }),
    });
    if (!putRes.ok) {
      const text = await putRes.text().catch(() => "");
      throw new Error(`Commerce7 end promotion failed: HTTP ${putRes.status} ${text.slice(0, 200)}`);
    }
  }

  async getAccountUser(tenantId: string, authorization: string) {
    const res = await this.fetchImpl(`${this.baseUrl}/account/user`, {
      method: "GET",
      headers: {
        Authorization: authorization,
        tenant: tenantId,
        Accept: "application/json",
      },
    });
    const text = await res.text().catch(() => "");
    let body: unknown = null;
    if (text.length > 0) {
      try {
        body = JSON.parse(text) as unknown;
      } catch {
        body = { message: text.slice(0, 500) };
      }
    }
    return { status: res.status, body };
  }
}
