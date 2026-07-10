import { z } from "zod";

/** Integrity caps mirrored from the assistant UI — deep discounts cheapen the wine. */
export const MAX_OFFER_PERCENT = 40;
export const MAX_OFFER_DOLLARS = 100;

export const strategyOfferSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("percent"), value: z.number().int().min(1).max(MAX_OFFER_PERCENT) }),
  z.object({ kind: z.literal("dollar"), value: z.number().int().min(1).max(MAX_OFFER_DOLLARS) }),
  z.object({ kind: z.literal("free-shipping") }),
]);

export type StrategyOffer = z.infer<typeof strategyOfferSchema>;

export const strategyCreateBodySchema = z.object({
  tenantId: z.string().min(1),
  title: z.string().min(1).max(120),
  message: z.string().min(1).max(300),
  offer: strategyOfferSchema.optional(),
  testDays: z.number().int().min(3).max(60).default(14),
});

export type StrategyCreateBody = z.infer<typeof strategyCreateBodySchema>;

/** Funnel counts snapshotted at strategy start and read again for verdicts. */
export type StrategySnapshot = {
  totalEvents: number;
  impressions: number;
  clicks: number;
  adds: number;
  purchases: number;
};

export type StrategyRecord = {
  id: string;
  tenantId: string;
  title: string;
  message: string;
  offer: StrategyOffer | null;
  /** Commerce7 promotion backing the offer; null when no offer or C7 push failed. */
  promotionId: string | null;
  startedAt: Date;
  reviewAt: Date;
  testDays: number;
  baseline: StrategySnapshot;
  status: "running" | "ended";
  endedAt: Date | null;
};

export function snapshotFromByName(byName: Record<string, number>, totalEvents: number): StrategySnapshot {
  const sum = (...names: string[]) => names.reduce((t, n) => t + (byName[n] ?? 0), 0);
  return {
    totalEvents,
    impressions: byName.impression ?? totalEvents,
    clicks: byName.click ?? 0,
    adds: sum("add_to_cart", "add_to_cart_click"),
    purchases: sum("purchase", "order_completed", "checkout"),
  };
}

export function offerLabel(offer: StrategyOffer): string {
  if (offer.kind === "free-shipping") return "Free shipping";
  if (offer.kind === "dollar") return `$${offer.value} off`;
  return `${offer.value}% off`;
}
