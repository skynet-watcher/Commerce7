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

export interface Commerce7Client {
  listOrders(params: ListOrdersParams): Promise<ListOrdersResult>;
}

export const SYNC_RESOURCE_ORDER = "order" as const;
