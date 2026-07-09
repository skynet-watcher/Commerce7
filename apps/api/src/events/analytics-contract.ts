import type { AnalyticsEventBody } from "./analytics-schema.js";

/** Mirrors `docs/plans/PERSONALIZATION-ANALYTICS-ARCHITECTURE.md` Layer B payloads. */
export const SURFACE_CART_CARROT = "cart_carrot" as const;
export const SURFACE_PERSONALIZATION_BLOCK = "personalization_block" as const;

const CONVERSION_EVENT_NAMES = new Set([
  "purchase",
  "order_completed",
  "checkout_completed",
  "conversion",
]);

export function surfaceFromBody(body: AnalyticsEventBody): string {
  const raw = body.properties?.surface;
  if (typeof raw === "string" && raw.trim().length > 0) {
    return raw.trim();
  }
  return "unknown";
}

/**
 * Extracts the Cart Carrot block title from event properties.
 * Expected event shape:
 * ```js
 * {
 *   name: "impression" | "click" | "add_to_cart",
 *   properties: {
 *     surface: "cart_carrot",
 *     blockTitle: "You may also like",        // carrot title as set in C7
 *     recommendedProductSku: "CHARD-750",    // the wine being recommended
 *     recommendedProductTitle: "Chardonnay 2022",
 *     sourceProductSku: "CAB-750",           // wine in cart that triggered this carrot
 *     sessionId: "sess_xyz"
 *   }
 * }
 * ```
 */
export function blockTitleFromBody(body: AnalyticsEventBody): string | null {
  const raw = body.properties?.blockTitle;
  if (typeof raw === "string" && raw.trim().length > 0) {
    return raw.trim();
  }
  return null;
}

/** Extracts the recommended product SKU from Cart Carrot event properties. */
export function recommendedSkuFromBody(body: AnalyticsEventBody): string | null {
  const raw = body.properties?.recommendedProductSku;
  if (typeof raw === "string" && raw.trim().length > 0) {
    return raw.trim();
  }
  return null;
}

export function isConversionLikeEventName(name: string): boolean {
  return CONVERSION_EVENT_NAMES.has(name.toLowerCase());
}
