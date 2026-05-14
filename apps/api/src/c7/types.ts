import type { AppSyncCreateInput } from "./app-sync-schema.js";

export type { AppSyncCreateInput } from "./app-sync-schema.js";

/** Minimal order shape for cursor sync (IDs + watermark). */
export type C7OrderRef = {
  id: string;
  updatedAt: string;
};

export type ListOrdersParams = {
  tenantId: string;
  /** Commerce7: first page uses `start`, then opaque cursor from prior response. */
  cursor: string;
  limit?: number;
};

export type ListOrdersResult = {
  orders: C7OrderRef[];
  /** `null` when there is no further page. */
  nextCursor: string | null;
};

/** Proxied GET /account/user — status + JSON body from Commerce7 (success user or error envelope). */
export type AccountUserProxyResult = {
  status: number;
  body: unknown;
};

export interface Commerce7Client {
  listOrders(params: ListOrdersParams): Promise<ListOrdersResult>;
  /** POST `/v1/app-sync` — surface integration status on the object in Commerce7 Admin. */
  createAppSync(tenantId: string, body: AppSyncCreateInput): Promise<void>;
  /**
   * GET `/account/user` — validates an Admin extension `account` (or storefront `appToken`) JWT.
   * Uses **`Authorization`** and **`tenant`** only — no app Basic auth (see authenticate-app developer doc).
   */
  getAccountUser(tenantId: string, authorization: string): Promise<AccountUserProxyResult>;
}

export const SYNC_RESOURCE_ORDER = "order" as const;
