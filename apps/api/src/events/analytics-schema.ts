import { z } from "zod";

export const analyticsEventBodySchema = z.object({
  tenantId: z.string().min(1),
  clientEventId: z.string().min(1),
  name: z.string().min(1),
  properties: z.record(z.string(), z.unknown()).optional(),
});

export type AnalyticsEventBody = z.infer<typeof analyticsEventBodySchema>;

/** Counts for one dynamic surface (Cart Carrot, personalization block, …). */
export type SurfaceEngagementSlice = {
  /** Event `name` (impression, click, add_to_cart, …) → count */
  byEventName: Record<string, number>;
  total: number;
};

/** Per-carrot engagement row for the Cart Carrot breakdown table. */
export type CartCarrotRow = {
  /** `”unknown”` when the event omits the `blockTitle` property. */
  blockTitle: string;
  recommendedSku: string | null;
  recommendedTitle: string | null;
  /** Event `name` (impression, click, add_to_cart) → count */
  byEventName: Record<string, number>;
  total: number;
};

export type CartCarrotBreakdown = {
  /** Rows sorted by add-to-cart rate (adds ÷ impressions) descending. */
  rows: CartCarrotRow[];
  /**
   * `false` when no Cart Carrot events carry a `blockTitle` property —
   * show the upgrade nudge instead of the breakdown table.
   */
  hasBlockTitleData: boolean;
};

/** Per-block engagement row for Personalization Block surfaces. */
export type PersonalizationBlockRow = {
  /** "unknown" when the event omits the blockTitle property. */
  blockTitle: string;
  byEventName: Record<string, number>;
  total: number;
};

export type PersonalizationBreakdown = {
  /** Rows sorted by add-to-cart rate (adds ÷ impressions) descending. */
  rows: PersonalizationBlockRow[];
  hasBlockTitleData: boolean;
};

/** Aggregates for operator / dashboard views (not sent to Commerce7). */
export type AnalyticsTenantSummary = {
  totalEvents: number;
  /** Event `name` → count */
  byName: Record<string, number>;
  /** `properties.surface` → count; omitted or blank surface → `unknown`. */
  bySurface: Record<string, number>;
  /** Events tagged `surface: cart_carrot`. */
  cartCarrot: SurfaceEngagementSlice;
  /** Events tagged `surface: personalization_block`. */
  personalizationBlock: SurfaceEngagementSlice;
  /**
   * Events whose `name` looks like a completed purchase/checkout.
   * True “did Cart Carrot cause this?” attribution still needs session → order joins (webhooks).
   */
  conversionLikeEvents: number;
  recent: { name: string; surface: string; receivedAt: string }[];
  /** Per-carrot engagement breakdown (Cart Carrot surface only). */
  cartCarrotBreakdown: CartCarrotBreakdown;
  /** Per-block engagement breakdown (Personalization Block surface only). */
  personalizationBreakdown: PersonalizationBreakdown;
};

export type AnalyticsEventStore = {
  record(input: {
    tenantId: string;
    clientEventId: string;
    body: AnalyticsEventBody;
  }): Promise<{ duplicate: boolean }>;
  summarizeTenant(
    tenantId: string,
    range?: { startDate?: Date | undefined; endDate?: Date | undefined },
  ): Promise<AnalyticsTenantSummary>;
};
