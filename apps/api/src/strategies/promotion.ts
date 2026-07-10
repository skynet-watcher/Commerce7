import type { C7PromotionInput } from "../c7/types.js";
import { offerLabel, type StrategyOffer } from "./schema.js";

/**
 * Map a strategy offer to a Commerce7 promotion. The endDate is always the
 * strategy's review date — a discount must never outlive its test window.
 */
export function promotionInputForStrategy(opts: {
  title: string;
  message: string;
  offer: StrategyOffer;
  startedAt: Date;
  reviewAt: Date;
}): C7PromotionInput {
  const { offer } = opts;
  return {
    title: `[Assistant] ${offerLabel(offer)} — ${opts.title}`.slice(0, 120),
    actionMessage: opts.message.slice(0, 300),
    usageLimitType: "Unlimited",
    appliesTo: "Store",
    productDiscountType:
      offer.kind === "percent" ? "Percentage Off" : offer.kind === "dollar" ? "Dollar Off" : "No Discount",
    productDiscount: offer.kind === "free-shipping" ? null : offer.value,
    shippingDiscountType: offer.kind === "free-shipping" ? "Percentage Off" : "No Discount",
    shippingDiscount: offer.kind === "free-shipping" ? 100 : null,
    availableTo: "Everyone",
    status: "Enabled",
    startDate: opts.startedAt.toISOString(),
    endDate: opts.reviewAt.toISOString(),
  };
}
