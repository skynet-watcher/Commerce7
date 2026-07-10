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

/**
 * Input for `POST /promotion`. Discounts our app creates always carry an
 * `endDate` — offers must never outlive their strategy's test window.
 *
 * NOTE: the mirrored docs are inconsistent about discount units (the create
 * example sends `shippingDiscount: 10000` for a percentage while the object
 * example uses `productDiscount: 10` for "$10 Off"). We send plain integers
 * (percent as 10, dollars as 10) matching the object example — verify against
 * the sandbox before production and adjust here if C7 expects cents/bps.
 */
export type C7PromotionInput = {
  title: string;
  actionMessage: string | null;
  usageLimitType: "Unlimited";
  appliesTo: "Store";
  productDiscountType: "Percentage Off" | "Dollar Off" | "No Discount";
  productDiscount: number | null;
  shippingDiscountType: "Percentage Off" | "No Discount";
  shippingDiscount: number | null;
  availableTo: "Everyone";
  status: "Enabled";
  startDate: string;
  endDate: string;
};

export type C7PromotionRef = { id: string };

export interface Commerce7Client {
  listOrders(params: ListOrdersParams): Promise<ListOrdersResult>;
  /** POST `/v1/app-sync` — surface integration status on the object in Commerce7 Admin. */
  createAppSync(tenantId: string, body: AppSyncCreateInput): Promise<void>;
  /**
   * GET `/account/user` — validates an Admin extension `account` (or storefront `appToken`) JWT.
   * Uses **`Authorization`** and **`tenant`** only — no app Basic auth (see authenticate-app developer doc).
   */
  getAccountUser(tenantId: string, authorization: string): Promise<AccountUserProxyResult>;
  /** POST `/promotion` — create an auto-applying discount (always with an endDate). */
  createPromotion(tenantId: string, input: C7PromotionInput): Promise<C7PromotionRef>;
  /**
   * End a promotion early: GET `/promotion/{id}`, then PUT it back with
   * `endDate` = now. Keeps the promotion's history in Commerce7 Admin
   * (unlike DELETE).
   */
  endPromotion(tenantId: string, promotionId: string, endDate: string): Promise<void>;
}

export const SYNC_RESOURCE_ORDER = "order" as const;
