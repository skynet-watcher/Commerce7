import type { StrategyRecord, StrategySnapshot } from "./schema.js";

export type StrategyVerdict = {
  tone: "good" | "soft" | "neutral";
  headline: string;
  detail: string;
  /** Activity since the strategy started (current minus baseline, floored at 0). */
  since: StrategySnapshot;
};

const MIN_CLICKS_FOR_READ = 20;
const MIN_PURCHASES_FOR_READ = 3;
const MEANINGFUL_RATE_DELTA = 0.05;

function delta(current: StrategySnapshot, baseline: StrategySnapshot): StrategySnapshot {
  const d = (a: number, b: number) => Math.max(0, a - b);
  return {
    totalEvents: d(current.totalEvents, baseline.totalEvents),
    impressions: d(current.impressions, baseline.impressions),
    clicks: d(current.clicks, baseline.clicks),
    adds: d(current.adds, baseline.adds),
    purchases: d(current.purchases, baseline.purchases),
  };
}

function friendlyDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

/**
 * The honest verdict: never claims success without enough signal, and says
 * plainly when results are softer than before. Mirrors the assistant UI's
 * language so the merchant reads the same story everywhere.
 */
export function computeVerdict(strategy: StrategyRecord, current: StrategySnapshot): StrategyVerdict {
  const since = delta(current, strategy.baseline);

  if (strategy.status === "ended") {
    return {
      tone: "neutral",
      headline: "Ended",
      detail: `This strategy has ended${strategy.offer ? " and its discount is no longer active" : ""}. The numbers below cover its full run.`,
      since,
    };
  }

  if (since.clicks < MIN_CLICKS_FOR_READ || since.purchases < MIN_PURCHASES_FOR_READ) {
    return {
      tone: "neutral",
      headline: "Still gathering results",
      detail: `Too early to call. So far ${since.clicks} shoppers have clicked and ${since.purchases} orders have followed — check back around ${friendlyDate(strategy.reviewAt)}.`,
      since,
    };
  }

  const baselineAddRate =
    strategy.baseline.clicks > 0 ? strategy.baseline.adds / strategy.baseline.clicks : 0;
  const sinceAddRate = since.clicks > 0 ? since.adds / since.clicks : 0;

  if (sinceAddRate > baselineAddRate + MEANINGFUL_RATE_DELTA) {
    return {
      tone: "good",
      headline: "Working well",
      detail: `Shoppers who see this message are adding bottles more often than before it started. ${since.purchases} orders so far — keep it running as is.`,
      since,
    };
  }
  if (sinceAddRate < baselineAddRate - MEANINGFUL_RATE_DELTA) {
    return {
      tone: "soft",
      headline: "Not landing yet",
      detail:
        "Shoppers are seeing it but responding less than before. Try a clearer offer or a different message.",
      since,
    };
  }
  return {
    tone: "neutral",
    headline: "Holding steady",
    detail: `Results look similar to before the change. ${since.purchases} orders so far — let it run until ${friendlyDate(strategy.reviewAt)} for a clearer read.`,
    since,
  };
}
