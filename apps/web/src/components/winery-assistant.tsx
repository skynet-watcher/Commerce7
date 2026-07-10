"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { defaultApiBase } from "@/lib/api-base";

/* ── Shared storage keys (same store config as the dashboard) ──────────── */
const LS_API = "c7-sandbox-api-base";
const LS_TENANT = "c7-sandbox-dashboard-tenant";
const LS_STRATEGIES = "c7-assistant-strategies";

/* ── Data shapes ───────────────────────────────────────────────────────── */

type SurfaceSlice = { byEventName: Record<string, number>; total: number };

type Overview = {
  tenantId: string;
  generatedAt: string;
  orders: { cursorWalkTotal: number | null; ok: boolean; error: string | null };
  analytics: {
    totalEvents: number;
    byName: Record<string, number>;
    bySurface: Record<string, number>;
    cartCarrot: SurfaceSlice;
    personalizationBlock: SurfaceSlice;
    conversionLikeEvents: number;
  };
};

type CheckStatus = "good" | "attention" | "notset";

type CheckItem = {
  id: string;
  label: string;
  status: CheckStatus;
  finding: string;
  meaning: string;
};

type StrategyGoal = "Bigger orders" | "Loyalty & club" | "New visitors" | "Tune what's running";

type Recommendation = {
  id: string;
  goal: StrategyGoal;
  title: string;
  tagline: string;
  why: string;
  defaultMessage: string;
  steps: string[];
  effort: string;
  suggestedOffer?: PlayOffer;
};

type StrategyNumbers = {
  shown: number;
  clicked: number;
  added: number;
  orders: number;
};

type RunningStrategy = {
  id: string;
  recommendationId: string;
  title: string;
  message: string;
  startedAt: string;
  reviewAt: string;
  testDays: number;
  baseline: StrategyNumbers;
  status: "running" | "paused";
  /** Present on plays the owner built themselves. */
  custom?: { goal: StrategyGoal; audience: string; placement: string };
  /** Optional discount behind the play; ends at reviewAt. */
  offer?: PlayOffer;
};

type PlayAudience = "Everyone" | "First-time visitors" | "Past buyers" | "Shoppers with wine in their cart";
type PlayPlacement = "In the cart" | "On wine pages";

/**
 * An optional discount behind a play. When the Commerce7 wiring lands this
 * becomes a real `POST /promotion` (percentage/shipping discount, ending at
 * the strategy's review date so offers never outlive their test window).
 */
type PlayOffer =
  | { kind: "percent"; value: number }
  | { kind: "dollar"; value: number }
  | { kind: "free-shipping" };

const OFFER_CHOICES = ["No offer", "5% off", "10% off", "15% off", "Free shipping", "Custom…"] as const;
type OfferChoice = (typeof OFFER_CHOICES)[number];

/** Integrity caps: deep discounts cheapen the wine and are almost never the answer. */
const MAX_CUSTOM_PERCENT = 40;
const MAX_CUSTOM_DOLLARS = 100;

type CustomOfferDraft = { unit: "percent" | "dollar"; amount: string };

function customOfferFromDraft(draft: CustomOfferDraft): PlayOffer | undefined {
  const raw = Number.parseInt(draft.amount, 10);
  if (!Number.isFinite(raw) || raw <= 0) return undefined;
  if (draft.unit === "percent") return { kind: "percent", value: Math.min(raw, MAX_CUSTOM_PERCENT) };
  return { kind: "dollar", value: Math.min(raw, MAX_CUSTOM_DOLLARS) };
}

function offerFromChoice(choice: OfferChoice, custom: CustomOfferDraft): PlayOffer | undefined {
  if (choice === "Free shipping") return { kind: "free-shipping" };
  if (choice === "Custom…") return customOfferFromDraft(custom);
  const percent = choice.match(/^(\d+)% off$/);
  if (percent) return { kind: "percent", value: Number(percent[1]) };
  return undefined;
}

function choiceFromOffer(offer: PlayOffer | undefined): OfferChoice {
  if (!offer) return "No offer";
  if (offer.kind === "free-shipping") return "Free shipping";
  if (offer.kind === "percent" && [5, 10, 15].includes(offer.value)) {
    return `${offer.value}% off` as OfferChoice;
  }
  return "Custom…";
}

function offerLabel(offer: PlayOffer): string {
  if (offer.kind === "free-shipping") return "Free shipping";
  if (offer.kind === "dollar") return `$${offer.value} off`;
  return `${offer.value}% off`;
}

/* ── Demo data — keeps the app fully working with no store connected ───── */

const DEMO_OVERVIEW: Overview = {
  tenantId: "demo-winery",
  generatedAt: new Date().toISOString(),
  orders: { cursorWalkTotal: 214, ok: true, error: null },
  analytics: {
    totalEvents: 1418,
    byName: {
      impression: 960,
      click: 214,
      add_to_cart: 96,
      purchase: 41,
    },
    bySurface: { cart_carrot: 815, personalization_block: 603 },
    cartCarrot: {
      total: 815,
      byEventName: { impression: 540, click: 132, add_to_cart: 61, purchase: 27 },
    },
    personalizationBlock: {
      total: 603,
      byEventName: { impression: 420, click: 82, add_to_cart: 35, purchase: 14 },
    },
    conversionLikeEvents: 41,
  },
};

/**
 * `?demo=1` plants a strategy that started six days ago so the Results step
 * shows meaningful progress in a client demo. Only runs when nothing is
 * already saved, so it never clobbers real state.
 */
function demoSeedStrategy(): RunningStrategy {
  const startedAt = addDays(new Date().toISOString(), -6);
  return {
    id: `free-shipping-nudge:${startedAt}`,
    recommendationId: "free-shipping-nudge",
    title: "Free shipping reminder in the cart",
    message: "You're 2 bottles away from free shipping — most guests add a favourite red.",
    startedAt,
    reviewAt: addDays(startedAt, 14),
    testDays: 14,
    baseline: numbersFrom(DEMO_OVERVIEW),
    status: "running",
  };
}

/* ── Helpers ───────────────────────────────────────────────────────────── */

function wineryDisplayName(tenantId: string, explicit: string): string {
  if (explicit.trim()) return explicit.trim();
  if (!tenantId.trim() || tenantId === "demo-winery") return "your winery";
  return tenantId
    .replace(/^sandbox-/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function daysAgo(iso: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));
}

function daysUntil(iso: string): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000));
}

function addDays(iso: string, days: number): string {
  const dt = new Date(iso);
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString();
}

function friendlyDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: "long", day: "numeric" });
  } catch {
    return iso;
  }
}

function readStrategies(): RunningStrategy[] {
  try {
    const raw = localStorage.getItem(LS_STRATEGIES);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as RunningStrategy[]) : [];
  } catch {
    return [];
  }
}

function writeStrategies(next: RunningStrategy[]) {
  try {
    if (next.length > 0) localStorage.setItem(LS_STRATEGIES, JSON.stringify(next));
    else localStorage.removeItem(LS_STRATEGIES);
  } catch {
    /* ignore */
  }
}

function numbersFrom(overview: Overview): StrategyNumbers {
  const byName = overview.analytics.byName;
  return {
    shown: byName.impression ?? overview.analytics.totalEvents,
    clicked: byName.click ?? 0,
    added: (byName.add_to_cart ?? 0) + (byName.add_to_cart_click ?? 0),
    orders: Math.max(
      overview.analytics.conversionLikeEvents,
      (byName.purchase ?? 0) + (byName.order_completed ?? 0),
    ),
  };
}

/**
 * In demo mode there is no live event stream, so we simulate steady progress
 * for a running strategy: activity accrues day by day with a modest lift.
 */
function simulateProgress(baseline: StrategyNumbers, startedAt: string): StrategyNumbers {
  const days = Math.min(daysAgo(startedAt), 21);
  const perDay = {
    shown: Math.max(18, Math.round(baseline.shown / 30)),
    clicked: Math.max(5, Math.round(baseline.clicked / 30)),
    added: Math.max(3, Math.round((baseline.added / 30) * 1.35)),
    orders: Math.max(1, Math.round((baseline.orders / 30) * 1.3)),
  };
  return {
    shown: baseline.shown + perDay.shown * days,
    clicked: baseline.clicked + perDay.clicked * days,
    added: baseline.added + perDay.added * days,
    orders: baseline.orders + perDay.orders * days,
  };
}

function verdictFor(strategy: RunningStrategy, current: StrategyNumbers) {
  const newClicks = Math.max(0, current.clicked - strategy.baseline.clicked);
  const newAdds = Math.max(0, current.added - strategy.baseline.added);
  const newOrders = Math.max(0, current.orders - strategy.baseline.orders);

  if (strategy.status === "paused") {
    return {
      tone: "neutral" as const,
      headline: "Paused",
      detail: "This message is not showing to shoppers right now. Resume it any time.",
    };
  }
  if (newClicks < 20 || newOrders < 3) {
    return {
      tone: "neutral" as const,
      headline: "Still gathering results",
      detail: `Too early to call. So far ${newClicks} shoppers have clicked and ${newOrders} orders have followed — check back around ${friendlyDate(strategy.reviewAt)}.`,
    };
  }
  const baselineAddRate =
    strategy.baseline.clicked > 0 ? strategy.baseline.added / strategy.baseline.clicked : 0;
  const currentAddRate = newClicks > 0 ? newAdds / newClicks : 0;
  if (currentAddRate > baselineAddRate + 0.05) {
    return {
      tone: "good" as const,
      headline: "Working well",
      detail: `Shoppers who see this message are adding bottles more often than before it started. ${newOrders} orders so far — keep it running as is.`,
    };
  }
  if (currentAddRate < baselineAddRate - 0.05) {
    return {
      tone: "soft" as const,
      headline: "Not landing yet",
      detail: "Shoppers are seeing it but responding less than before. Try a clearer offer or a different message.",
    };
  }
  return {
    tone: "neutral" as const,
    headline: "Holding steady",
    detail: `Results look similar to before the change. ${newOrders} orders so far — let it run until ${friendlyDate(strategy.reviewAt)} for a clearer read.`,
  };
}

/* ── Checkup + recommendation logic ────────────────────────────────────── */

function buildCheckup(overview: Overview, live: boolean): CheckItem[] {
  const a = overview.analytics;
  const hasEvents = a.totalEvents > 0;
  const carrot = a.bySurface.cart_carrot ?? a.cartCarrot.total;
  const blocks = a.bySurface.personalization_block ?? a.personalizationBlock.total;

  return [
    {
      id: "tracking",
      label: "Shopper tracking",
      status: hasEvents ? "good" : "notset",
      finding: hasEvents
        ? "Installed and collecting activity from your online store."
        : "Not collecting yet.",
      meaning: hasEvents
        ? "We can see what shoppers do, so every recommendation below is based on your own store."
        : "Once the tracking snippet is on your site, we can base recommendations on your real shoppers.",
    },
    {
      id: "orders",
      label: "Order history",
      status: overview.orders.ok ? "good" : "attention",
      finding: overview.orders.ok
        ? `Connected${overview.orders.cursorWalkTotal ? ` — ${overview.orders.cursorWalkTotal} recent orders in view` : ""}.`
        : "We could not read recent orders.",
      meaning: overview.orders.ok
        ? "We can tell which messages actually lead to orders, not just clicks."
        : "Reconnect so results can be tied to real orders.",
    },
    {
      id: "cart-messages",
      label: "Cart messages",
      status: carrot > 0 ? "good" : "notset",
      finding:
        carrot > 0
          ? "At least one cart message is live and being seen."
          : "No cart messages running yet.",
      meaning:
        carrot > 0
          ? "The cart is where buying decisions happen — you are already talking to shoppers there."
          : "A short note in the cart (like a free-shipping reminder) is the easiest first win.",
    },
    {
      id: "recommendations",
      label: "Personalized bottle suggestions",
      status: blocks > 0 ? "good" : "notset",
      finding:
        blocks > 0
          ? "Product suggestions are showing to shoppers."
          : "Not showing personalized suggestions yet.",
      meaning:
        blocks > 0
          ? "Returning shoppers see wines matched to what they already enjoy."
          : "Suggesting the right next bottle is how tasting-room hospitality carries over online.",
    },
    {
      id: "data-source",
      label: "Your numbers",
      status: live ? "good" : "attention",
      finding: live ? "Showing live numbers from your store." : "Showing sample numbers.",
      meaning: live
        ? "Everything below reflects your real shoppers."
        : "Connect your store to replace these with your own shoppers and orders.",
    },
  ];
}

const RECOMMENDATIONS: Recommendation[] = [
  {
    id: "free-shipping-nudge",
    goal: "Bigger orders",
    title: "Free shipping reminder in the cart",
    tagline: "Your easiest first win",
    why: "Shoppers with one or two bottles in the cart often don't realize how close they are to free shipping. A friendly reminder is the single most reliable way to turn a 2-bottle order into a 6-bottle order.",
    defaultMessage: "You're 2 bottles away from free shipping — most guests add a favourite red.",
    steps: [
      "We show this note to shoppers with 1–5 bottles in their cart",
      "Shoppers who already qualify never see it",
      "You can edit or pause it any time",
    ],
    effort: "Live in about a minute",
    suggestedOffer: { kind: "free-shipping" },
  },
  {
    id: "half-case-upgrade",
    goal: "Bigger orders",
    title: "Half-case upgrade nudge",
    tagline: "Four bottles is almost six",
    why: "A shopper with four bottles in the cart is one small nudge away from a half-case. Pairing the ask with a modest saving makes it feel like a smart move rather than an upsell.",
    defaultMessage: "Make it a half-case — add 2 more bottles and save 10% on the lot.",
    steps: [
      "Shows to shoppers with 3–5 bottles in their cart",
      "Works best tied to a half-case discount you already offer",
      "You can edit or pause it any time",
    ],
    effort: "Live in about a minute",
    suggestedOffer: { kind: "percent", value: 10 },
  },
  {
    id: "perfect-pairing",
    goal: "Bigger orders",
    title: "Perfect pairing suggestion",
    tagline: "The tasting-room upsell, online",
    why: "In the tasting room you'd naturally say \"if you like that, try this.\" This does the same in the cart: it suggests one bottle that pairs with what the shopper already picked.",
    defaultMessage: "Guests who take home this Chardonnay usually grab our Rosé too — add one?",
    steps: [
      "We suggest one wine based on what's already in the cart",
      "The suggestion updates as the cart changes",
      "You can edit or pause it any time",
    ],
    effort: "Live in about a minute",
    suggestedOffer: { kind: "percent", value: 10 },
  },
  {
    id: "club-invite",
    goal: "Loyalty & club",
    title: "Wine club invitation for repeat buyers",
    tagline: "Turn regulars into members",
    why: "Shoppers on their second or third order already love your wine. A quiet club invitation at that moment converts far better than a banner on the homepage.",
    defaultMessage: "You clearly have good taste — club members get this wine at 15% off, every time.",
    steps: [
      "Shows only to shoppers who have ordered before",
      "Links straight to your club signup page",
      "You can edit or pause it any time",
    ],
    effort: "Live in about a minute",
  },
  {
    id: "welcome-back-reorder",
    goal: "Loyalty & club",
    title: "Welcome back, your favourite's in stock",
    tagline: "Make reordering effortless",
    why: "Past buyers are your best buyers, but reordering takes effort. Greeting a returning shopper with the wine they bought last time removes every step between \"I liked that\" and \"it's in my cart.\"",
    defaultMessage: "Welcome back — the Pinot you ordered last time is in stock. Same again?",
    steps: [
      "Shows only to shoppers we recognize from a past order",
      "Features the wine from their last order, one click to add",
      "You can edit or pause it any time",
    ],
    effort: "Live in about a minute",
  },
  {
    id: "limited-release",
    goal: "Loyalty & club",
    title: "Limited release heads-up",
    tagline: "Scarcity, told honestly",
    why: "When a small-lot wine is genuinely limited, saying so is the most effective message you can run. It rewards loyal shoppers and gives fence-sitters a real reason to decide today.",
    defaultMessage: "Only 40 cases of this year's reserve red — once it's gone, it's gone until next fall.",
    steps: [
      "Shows on the wine you choose, while stock lasts",
      "Best for wines that are truly limited — shoppers can tell",
      "You can edit or pause it any time",
    ],
    effort: "Live in about a minute",
  },
  {
    id: "first-visit-welcome",
    goal: "New visitors",
    title: "First-visit welcome",
    tagline: "Open the door properly",
    why: "A first-time visitor doesn't know where to start on a page of forty wines. A short welcome pointing at your tasting-room favourites gives them the same easy entry a pour at the bar would.",
    defaultMessage: "New here? Our tasting-room favourites six-pack is the easiest way to find your wine.",
    steps: [
      "Shows only to shoppers we haven't seen before",
      "Points to a starter collection you choose",
      "You can edit or pause it any time",
    ],
    effort: "Live in about a minute",
  },
  {
    id: "sharpen-message",
    goal: "Tune what's running",
    title: "Sharpen your current cart message",
    tagline: "Small wording change, real difference",
    why: "Your cart message is being seen, but fewer shoppers are clicking than we'd expect. Messages with a specific number (\"2 bottles away\") reliably beat vague ones (\"almost there\").",
    defaultMessage: "Add 2 more bottles and shipping is on us.",
    steps: [
      "Replaces your current cart message wording",
      "We compare results before and after the change",
      "You can put the old wording back any time",
    ],
    effort: "Live in about a minute",
  },
];

const STRATEGY_GOALS: StrategyGoal[] = [
  "Bigger orders",
  "Loyalty & club",
  "New visitors",
  "Tune what's running",
];

const PLAY_GOALS: StrategyGoal[] = ["Bigger orders", "Loyalty & club", "New visitors"];
const PLAY_AUDIENCES: PlayAudience[] = [
  "Everyone",
  "First-time visitors",
  "Past buyers",
  "Shoppers with wine in their cart",
];
const PLAY_PLACEMENTS: PlayPlacement[] = ["In the cart", "On wine pages"];

/** A sensible starter message for whatever combination the owner picks. */
function starterMessage(goal: StrategyGoal, audience: PlayAudience, placement: PlayPlacement): string {
  if (audience === "First-time visitors") {
    return "Welcome in — our tasting-room favourites are the easiest place to start.";
  }
  if (audience === "Past buyers") {
    return goal === "Loyalty & club"
      ? "Good to see you again — club members get first pick of every new release."
      : "Welcome back — your favourites are in stock, and a few new things arrived too.";
  }
  if (audience === "Shoppers with wine in their cart") {
    return placement === "In the cart"
      ? "Nice picks — add 2 more bottles and shipping is on us."
      : "That wine loves company — see what our winemaker pairs it with.";
  }
  return goal === "New visitors"
    ? "New here? Start with the six wines our tasting room pours most."
    : "This month's featured wine comes with free shipping on any half-case.";
}

function customPlayTitle(audience: PlayAudience, placement: PlayPlacement): string {
  const who: Record<PlayAudience, string> = {
    Everyone: "every shopper",
    "First-time visitors": "first-time visitors",
    "Past buyers": "past buyers",
    "Shoppers with wine in their cart": "shoppers mid-cart",
  };
  return `Your play: a note for ${who[audience]} ${placement === "In the cart" ? "in the cart" : "on wine pages"}`;
}

function pickRecommendations(overview: Overview, running: RunningStrategy[]): Recommendation[] {
  const carrotSlice = overview.analytics.cartCarrot;
  const carrotShown = carrotSlice.byEventName.impression ?? carrotSlice.total;
  const carrotClicks = carrotSlice.byEventName.click ?? 0;
  const lowClickRate = carrotShown >= 25 && carrotClicks / Math.max(carrotShown, 1) < 0.05;

  const startedIds = new Set(running.map((s) => s.recommendationId));
  const ordered = lowClickRate
    ? ["sharpen-message", "free-shipping-nudge", "perfect-pairing"]
    : ["free-shipping-nudge", "club-invite", "welcome-back-reorder"];

  const pool = [
    ...ordered,
    ...RECOMMENDATIONS.map((r) => r.id).filter((id) => !ordered.includes(id)),
  ]
    .map((id) => RECOMMENDATIONS.find((r) => r.id === id))
    .filter((r): r is Recommendation => Boolean(r))
    .filter((r) => !startedIds.has(r.id));

  return pool.length > 0 ? pool : RECOMMENDATIONS.slice(0, 1);
}

/* ── Small presentational pieces ───────────────────────────────────────── */

function StatusChip(props: { status: CheckStatus }) {
  const styles: Record<CheckStatus, { bg: string; border: string; text: string; label: string }> = {
    good: {
      bg: "var(--c-green-bg)",
      border: "var(--c-green-border)",
      text: "var(--c-green-text)",
      label: "Looks good",
    },
    attention: {
      bg: "var(--c-amber-bg)",
      border: "var(--c-amber-border)",
      text: "var(--c-amber-text)",
      label: "Worth a look",
    },
    notset: {
      bg: "var(--c-bg-muted)",
      border: "var(--c-border)",
      text: "var(--c-text-secondary)",
      label: "Not set up",
    },
  };
  const s = styles[props.status];
  return (
    <span
      className="inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-xs font-bold"
      style={{ background: s.bg, borderColor: s.border, color: s.text }}
    >
      {s.label}
    </span>
  );
}

function BigNumber(props: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-xl border border-[var(--c-border)] bg-[var(--c-bg-card)] p-4">
      <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--c-text-label)]">
        {props.label}
      </p>
      <p className="mt-2 text-2xl font-extrabold leading-none text-[var(--c-text-primary)]">
        {props.value}
      </p>
      <p className="mt-2 text-xs leading-4 text-[var(--c-text-secondary)]">{props.hint}</p>
    </div>
  );
}

function StepPill(props: { number: number; label: string; active: boolean; done: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={[
        "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition-colors",
        props.active
          ? "border-[var(--c-brand)] bg-[var(--c-brand)] text-white"
          : "border-[var(--c-border)] bg-[var(--c-bg-card)] text-[var(--c-text-secondary)] hover:border-[var(--c-brand)]",
      ].join(" ")}
    >
      <span
        className={[
          "grid h-5 w-5 place-items-center rounded-full text-[11px] font-extrabold",
          props.active ? "bg-white text-[var(--c-brand)]" : "bg-[var(--c-bg-muted)] text-[var(--c-text-secondary)]",
        ].join(" ")}
      >
        {props.done && !props.active ? "✓" : props.number}
      </span>
      {props.label}
    </button>
  );
}

function ChoiceChips<T extends string>(props: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset>
      <legend className="text-xs font-bold uppercase tracking-wide text-[var(--c-text-label)]">
        {props.label}
      </legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {props.options.map((option) => {
          const active = option === props.value;
          return (
            <button
              key={option}
              type="button"
              onClick={() => props.onChange(option)}
              aria-pressed={active}
              className={[
                "rounded-full border px-4 py-2 text-xs font-bold transition-colors",
                active
                  ? "border-[var(--c-brand)] bg-[var(--c-brand)] text-white"
                  : "border-[var(--c-border)] bg-[var(--c-bg-card)] text-[var(--c-text-secondary)] hover:border-[var(--c-brand)]",
              ].join(" ")}
            >
              {option}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function OfferPicker(props: {
  label: string;
  choice: OfferChoice;
  onChoice: (choice: OfferChoice) => void;
  custom: CustomOfferDraft;
  onCustom: (draft: CustomOfferDraft) => void;
}) {
  const resolved = offerFromChoice(props.choice, props.custom);
  return (
    <div>
      <ChoiceChips
        label={props.label}
        options={OFFER_CHOICES}
        value={props.choice}
        onChange={props.onChoice}
      />
      {props.choice === "Custom…" ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="inline-flex overflow-hidden rounded-full border border-[var(--c-border)]">
            {(["percent", "dollar"] as const).map((unit) => (
              <button
                key={unit}
                type="button"
                onClick={() => props.onCustom({ ...props.custom, unit })}
                aria-pressed={props.custom.unit === unit}
                className={[
                  "px-3 py-1.5 text-xs font-bold",
                  props.custom.unit === unit
                    ? "bg-[var(--c-brand)] text-white"
                    : "bg-[var(--c-bg-card)] text-[var(--c-text-secondary)]",
                ].join(" ")}
              >
                {unit === "percent" ? "% off" : "$ off"}
              </button>
            ))}
          </div>
          <input
            type="number"
            min={1}
            max={props.custom.unit === "percent" ? MAX_CUSTOM_PERCENT : MAX_CUSTOM_DOLLARS}
            inputMode="numeric"
            placeholder={props.custom.unit === "percent" ? "e.g. 12" : "e.g. 20"}
            value={props.custom.amount}
            onChange={(e) => props.onCustom({ ...props.custom, amount: e.target.value })}
            className="h-9 w-24 rounded-full border border-[var(--c-border)] bg-[var(--c-bg-card)] px-4 text-sm font-bold outline-none focus:border-[var(--c-border-focus)]"
            aria-label={`Custom amount ${props.custom.unit === "percent" ? "percent" : "dollars"} off`}
          />
          <span className="text-[11px] text-[var(--c-text-muted)]">
            up to {props.custom.unit === "percent" ? `${MAX_CUSTOM_PERCENT}%` : `$${MAX_CUSTOM_DOLLARS}`} —
            deeper discounts tend to cheapen the wine
          </span>
        </div>
      ) : null}
      {resolved ? (
        <p className="mt-2 text-xs leading-5 text-[var(--c-amber-text)]">
          <strong>{offerLabel(resolved)}</strong> is a real discount in your store. It ends
          automatically when the two-week test ends, and you can end it sooner any time.
        </p>
      ) : null}
    </div>
  );
}

/* ── Main component ────────────────────────────────────────────────────── */

export function WineryAssistant() {
  const search = useSearchParams();
  const tenantFromUrl = search.get("tenantId") ?? search.get("tenant") ?? "";
  const nameFromUrl = search.get("winery") ?? search.get("wineryName") ?? search.get("storeName") ?? "";

  const [apiBase, setApiBase] = useState(defaultApiBase);
  const [tenant, setTenant] = useState(tenantFromUrl);
  const [ready, setReady] = useState(false);
  const [overview, setOverview] = useState<Overview>(DEMO_OVERVIEW);
  const [live, setLive] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [strategies, setStrategies] = useState<RunningStrategy[]>([]);
  const [confirming, setConfirming] = useState<Recommendation | null>(null);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmOffer, setConfirmOffer] = useState<OfferChoice>("No offer");
  const [confirmCustom, setConfirmCustom] = useState<CustomOfferDraft>({ unit: "percent", amount: "" });
  const [draftMessage, setDraftMessage] = useState("");
  const [justStartedId, setJustStartedId] = useState<string | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [playGoal, setPlayGoal] = useState<StrategyGoal>("Bigger orders");
  const [playAudience, setPlayAudience] = useState<PlayAudience>("Everyone");
  const [playPlacement, setPlayPlacement] = useState<PlayPlacement>("In the cart");
  const [playMessage, setPlayMessage] = useState("");
  const [playOffer, setPlayOffer] = useState<OfferChoice>("No offer");
  const [playCustom, setPlayCustom] = useState<CustomOfferDraft>({ unit: "percent", amount: "" });

  useEffect(() => {
    try {
      const savedApi = localStorage.getItem(LS_API);
      const savedTenant = localStorage.getItem(LS_TENANT);
      if (savedApi) setApiBase(savedApi);
      if (!tenantFromUrl && savedTenant) setTenant(savedTenant);
      const saved = readStrategies();
      if (saved.length === 0 && search.get("demo") === "1") {
        const seeded = [demoSeedStrategy()];
        writeStrategies(seeded);
        setStrategies(seeded);
      } else {
        setStrategies(saved);
      }
    } catch {
      /* ignore */
    } finally {
      setReady(true);
    }
  }, [tenantFromUrl, search]);

  const load = useCallback(async () => {
    const tid = tenant.trim();
    if (!tid) {
      setOverview(DEMO_OVERVIEW);
      setLive(false);
      return;
    }
    try {
      const res = await fetch(
        `${apiBase.replace(/\/+$/, "")}/v1/insights/overview?tenantId=${encodeURIComponent(tid)}`,
        { headers: { Accept: "application/json" } },
      );
      if (!res.ok) throw new Error(String(res.status));
      const parsed = (await res.json()) as Overview;
      if (parsed.analytics.totalEvents > 0) {
        setOverview(parsed);
        setLive(true);
      } else {
        setOverview(DEMO_OVERVIEW);
        setLive(false);
      }
    } catch {
      setOverview(DEMO_OVERVIEW);
      setLive(false);
    }
  }, [apiBase, tenant]);

  useEffect(() => {
    if (!ready) return;
    void load();
  }, [ready, load]);

  const wineryName = wineryDisplayName(tenant, nameFromUrl);
  const checkup = useMemo(() => buildCheckup(overview, live), [overview, live]);
  const goodCount = checkup.filter((c) => c.status === "good").length;
  const recommendations = useMemo(
    () => pickRecommendations(overview, strategies),
    [overview, strategies],
  );
  const primary = recommendations[0];
  const alternates = recommendations.slice(1, 3);

  const startStrategy = useCallback(
    (rec: Recommendation, message: string, offer?: PlayOffer) => {
      const startedAt = new Date().toISOString();
      const testDays = 14;
      const strategy: RunningStrategy = {
        id: `${rec.id}:${startedAt}`,
        recommendationId: rec.id,
        title: rec.title,
        message: message.trim() || rec.defaultMessage,
        startedAt,
        reviewAt: addDays(startedAt, testDays),
        testDays,
        baseline: numbersFrom(overview),
        status: "running",
        offer,
      };
      setStrategies((current) => {
        const next = [strategy, ...current].slice(0, 10);
        writeStrategies(next);
        return next;
      });
      setConfirming(null);
      setJustStartedId(strategy.id);
      setStep(3);
    },
    [overview],
  );

  const startCustomPlay = useCallback(() => {
    const message = playMessage.trim();
    if (!message) return;
    const startedAt = new Date().toISOString();
    const testDays = 14;
    const strategy: RunningStrategy = {
      id: `custom:${startedAt}`,
      recommendationId: `custom:${startedAt}`,
      title: customPlayTitle(playAudience, playPlacement),
      message,
      startedAt,
      reviewAt: addDays(startedAt, testDays),
      testDays,
      baseline: numbersFrom(overview),
      status: "running",
      custom: { goal: playGoal, audience: playAudience, placement: playPlacement },
      offer: offerFromChoice(playOffer, playCustom),
    };
    setStrategies((current) => {
      const next = [strategy, ...current].slice(0, 10);
      writeStrategies(next);
      return next;
    });
    setBuilderOpen(false);
    setPlayMessage("");
    setPlayOffer("No offer");
    setJustStartedId(strategy.id);
    setStep(3);
  }, [overview, playAudience, playCustom, playGoal, playMessage, playOffer, playPlacement]);

  const setStrategyStatus = useCallback((id: string, status: "running" | "paused") => {
    setStrategies((current) => {
      const next = current.map((s) => (s.id === id ? { ...s, status } : s));
      writeStrategies(next);
      return next;
    });
  }, []);

  const removeStrategy = useCallback((id: string) => {
    setStrategies((current) => {
      const next = current.filter((s) => s.id !== id);
      writeStrategies(next);
      return next;
    });
  }, []);

  const headerNumbers = numbersFrom(overview);
  const openConfirm = useCallback(
    (rec: Recommendation) => {
      setConfirmMessage(
        rec.id === primary?.id && draftMessage.trim() ? draftMessage.trim() : rec.defaultMessage,
      );
      setConfirmOffer(choiceFromOffer(rec.suggestedOffer));
      setConfirming(rec);
    },
    [draftMessage, primary],
  );
  const startedRecommendationIds = useMemo(
    () => new Set(strategies.map((s) => s.recommendationId)),
    [strategies],
  );

  return (
    <div className="min-h-screen bg-[var(--c-bg-page)] text-[var(--c-text-primary)]">
      {/* Hero */}
      <header className="border-b border-[var(--c-border)] bg-[var(--c-bg-card)]">
        <div className="mx-auto max-w-[1080px] px-6 pb-8 pt-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--c-brand)]">
                Your marketing assistant
              </p>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Let&apos;s grow {wineryName === "your winery" ? "your winery" : wineryName}
              </h1>
              <p className="mt-3 max-w-xl text-[15px] leading-6 text-[var(--c-text-secondary)]">
                We check how your online store is set up, suggest one thing worth trying,
                and show you honestly whether it&apos;s working. No marketing degree required.
              </p>
            </div>
            {!live ? (
              <span className="rounded-full border border-[var(--c-amber-border)] bg-[var(--c-amber-bg)] px-4 py-2 text-xs font-bold text-[var(--c-amber-text)]">
                Sample data — connect your store to see your own numbers
              </span>
            ) : null}
          </div>

          <nav className="mt-8 flex flex-wrap gap-2" aria-label="Steps">
            <StepPill number={1} label="Checkup" active={step === 1} done={goodCount >= 4} onClick={() => setStep(1)} />
            <StepPill number={2} label="Next move" active={step === 2} done={strategies.length > 0} onClick={() => setStep(2)} />
            <StepPill number={3} label="Results" active={step === 3} done={false} onClick={() => setStep(3)} />
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-[1080px] space-y-6 px-6 py-8">
        {/* ── Step 1: Checkup ─────────────────────────────────────────── */}
        {step === 1 ? (
          <>
            <section className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-bg-card)] p-6 sm:p-8">
              <h2 className="text-xl font-extrabold">
                {goodCount >= 4
                  ? "You're in good shape"
                  : goodCount >= 2
                    ? "A solid start — a couple of things to set up"
                    : "Let's get the basics in place"}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--c-text-secondary)]">
                Here&apos;s what we looked at in your online store, in plain language.
                Nothing here changes anything — it&apos;s just a picture of where you are today.
              </p>

              <div className="mt-6 space-y-3">
                {checkup.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-[var(--c-border)] bg-[var(--c-bg-subtle)] p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-bold">{item.label}</p>
                      <StatusChip status={item.status} />
                    </div>
                    <p className="mt-1 text-sm text-[var(--c-text-primary)]">{item.finding}</p>
                    <p className="mt-1 text-sm leading-5 text-[var(--c-text-secondary)]">
                      {item.meaning}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded-full bg-[var(--c-brand)] px-6 py-3 text-sm font-bold text-white hover:bg-[var(--c-brand-hover)]"
                >
                  See what to try next →
                </button>
                <p className="text-xs text-[var(--c-text-muted)]">
                  Takes about two minutes, and nothing goes live without your say-so.
                </p>
              </div>
            </section>

            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <BigNumber
                label="Message views"
                value={headerNumbers.shown.toLocaleString()}
                hint="Times shoppers saw one of your messages in the last 30 days"
              />
              <BigNumber
                label="Clicks"
                value={headerNumbers.clicked.toLocaleString()}
                hint="Shoppers who clicked through to a wine or offer"
              />
              <BigNumber
                label="Bottles added"
                value={headerNumbers.added.toLocaleString()}
                hint="Add-to-cart actions that followed a message"
              />
              <BigNumber
                label="Orders influenced"
                value={headerNumbers.orders.toLocaleString()}
                hint="Orders where a message played a part"
              />
            </section>
          </>
        ) : null}

        {/* ── Step 2: Next move ───────────────────────────────────────── */}
        {step === 2 && primary ? (
          <>
            <section className="overflow-hidden rounded-2xl border border-[var(--c-brand)] bg-[var(--c-bg-card)]">
              <div className="border-b border-[var(--c-border)] bg-[var(--c-brand-light)] px-6 py-4 sm:px-8">
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--c-brand)]">
                  Our recommendation · {primary.tagline}
                </p>
              </div>
              <div className="p-6 sm:p-8">
                <h2 className="text-2xl font-extrabold">{primary.title}</h2>
                <p className="mt-3 max-w-2xl text-[15px] leading-6 text-[var(--c-text-secondary)]">
                  {primary.why}
                </p>

                <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-[var(--c-text-label)]">
                      What shoppers will see
                    </p>
                    <div className="mt-2 rounded-xl border border-dashed border-[var(--c-brand)] bg-[var(--c-brand-light)] p-4">
                      <p className="text-sm font-semibold leading-6">
                        {draftMessage.trim() || primary.defaultMessage}
                      </p>
                    </div>
                    <label className="mt-4 block">
                      <span className="text-xs font-bold uppercase tracking-wide text-[var(--c-text-label)]">
                        Make it sound like you (optional)
                      </span>
                      <textarea
                        className="mt-2 w-full rounded-xl border border-[var(--c-border)] bg-[var(--c-bg-card)] p-3 text-sm leading-6 outline-none focus:border-[var(--c-border-focus)]"
                        rows={2}
                        placeholder={primary.defaultMessage}
                        value={draftMessage}
                        onChange={(e) => setDraftMessage(e.target.value)}
                      />
                    </label>
                  </div>

                  <div className="rounded-xl border border-[var(--c-border)] bg-[var(--c-bg-subtle)] p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-[var(--c-text-label)]">
                      How it works
                    </p>
                    <ul className="mt-3 space-y-2">
                      {primary.steps.map((s) => (
                        <li key={s} className="flex gap-2 text-sm leading-5 text-[var(--c-text-secondary)]">
                          <span className="mt-0.5 text-[var(--c-green-text)]">✓</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-4 text-xs font-bold text-[var(--c-green-text)]">{primary.effort}</p>
                  </div>
                </div>

                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => openConfirm(primary)}
                    className="rounded-full bg-[var(--c-brand)] px-6 py-3 text-sm font-bold text-white hover:bg-[var(--c-brand-hover)]"
                  >
                    Review and start →
                  </button>
                  <p className="text-xs text-[var(--c-text-muted)]">
                    You&apos;ll see exactly what happens before anything goes live.
                  </p>
                  <button
                    type="button"
                    onClick={() => setBuilderOpen(true)}
                    className="text-xs font-bold text-[var(--c-brand)] hover:underline"
                  >
                    Or make your own play →
                  </button>
                </div>
              </div>
            </section>

            {alternates.length > 0 ? (
              <section className="grid gap-3 sm:grid-cols-2">
                {alternates.map((rec) => (
                  <div
                    key={rec.id}
                    className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-bg-card)] p-5"
                  >
                    <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--c-text-label)]">
                      Also worth trying
                    </p>
                    <h3 className="mt-1 text-base font-extrabold">{rec.title}</h3>
                    <p className="mt-2 text-sm leading-5 text-[var(--c-text-secondary)]">{rec.why}</p>
                    <button
                      type="button"
                      onClick={() => openConfirm(rec)}
                      className="mt-4 rounded-full border border-[var(--c-brand)] px-4 py-2 text-xs font-bold text-[var(--c-brand)] hover:bg-[var(--c-brand-light)]"
                    >
                      Start this instead
                    </button>
                  </div>
                ))}
              </section>
            ) : null}

            {/* Strategy library — for owners who want to take charge */}
            <section className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-bg-card)]">
              <button
                type="button"
                onClick={() => setLibraryOpen((open) => !open)}
                className="flex w-full flex-wrap items-center justify-between gap-2 p-5 text-left sm:px-8"
                aria-expanded={libraryOpen}
              >
                <span>
                  <span className="block text-base font-extrabold">
                    Know what you want? Browse every strategy
                  </span>
                  <span className="mt-1 block text-sm text-[var(--c-text-secondary)]">
                    {RECOMMENDATIONS.length} plays, grouped by goal — start any of them directly.
                  </span>
                </span>
                <span className="text-xl font-bold text-[var(--c-brand)]" aria-hidden>
                  {libraryOpen ? "−" : "+"}
                </span>
              </button>

              {libraryOpen ? (
                <div className="space-y-6 border-t border-[var(--c-border)] p-5 sm:px-8">
                  {STRATEGY_GOALS.map((goal) => {
                    const plays = RECOMMENDATIONS.filter((r) => r.goal === goal);
                    if (plays.length === 0) return null;
                    return (
                      <div key={goal}>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--c-brand)]">
                          {goal}
                        </h3>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {plays.map((rec) => {
                            const isRunning = startedRecommendationIds.has(rec.id);
                            return (
                              <div
                                key={rec.id}
                                className="flex flex-col rounded-xl border border-[var(--c-border)] bg-[var(--c-bg-subtle)] p-4"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="text-sm font-extrabold leading-5">{rec.title}</h4>
                                  {isRunning ? (
                                    <span className="shrink-0 rounded-full border border-[var(--c-green-border)] bg-[var(--c-green-bg)] px-2.5 py-0.5 text-[10px] font-bold text-[var(--c-green-text)]">
                                      Running
                                    </span>
                                  ) : null}
                                </div>
                                <p className="mt-1 text-xs font-semibold text-[var(--c-text-label)]">
                                  {rec.tagline}
                                </p>
                                <p className="mt-2 flex-1 text-[13px] leading-5 text-[var(--c-text-secondary)]">
                                  {rec.why}
                                </p>
                                {isRunning ? (
                                  <button
                                    type="button"
                                    onClick={() => setStep(3)}
                                    className="mt-3 self-start rounded-full border border-[var(--c-border)] px-4 py-1.5 text-xs font-bold text-[var(--c-text-secondary)] hover:border-[var(--c-brand)]"
                                  >
                                    See results
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => openConfirm(rec)}
                                    className="mt-3 self-start rounded-full border border-[var(--c-brand)] px-4 py-1.5 text-xs font-bold text-[var(--c-brand)] hover:bg-[var(--c-brand-light)]"
                                  >
                                    Start this one
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  <div className="rounded-xl border border-dashed border-[var(--c-brand)] bg-[var(--c-brand-light)] p-4">
                    <h3 className="text-sm font-extrabold">Have an idea of your own?</h3>
                    <p className="mt-1 text-[13px] leading-5 text-[var(--c-text-secondary)]">
                      A release party, a harvest special, free tastings for pickup orders — you know
                      your winery. Answer three quick questions and write the message; we&apos;ll
                      measure it just like the others.
                    </p>
                    <button
                      type="button"
                      onClick={() => setBuilderOpen(true)}
                      className="mt-3 rounded-full bg-[var(--c-brand)] px-5 py-2 text-xs font-bold text-white hover:bg-[var(--c-brand-hover)]"
                    >
                      Make your own play →
                    </button>
                  </div>
                </div>
              ) : null}
            </section>
          </>
        ) : null}
        {step === 2 && !primary ? (
          <section className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-bg-card)] p-8 text-center">
            <h2 className="text-lg font-extrabold">Everything we&apos;d suggest is already running</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[var(--c-text-secondary)]">
              Nice work. Check your results, and we&apos;ll have a new suggestion once the current
              strategies have had time to prove themselves.
            </p>
          </section>
        ) : null}

        {/* ── Step 3: Results ─────────────────────────────────────────── */}
        {step === 3 ? (
          strategies.length === 0 ? (
            <section className="rounded-2xl border border-dashed border-[var(--c-border-subtle)] bg-[var(--c-bg-card)] p-10 text-center">
              <h2 className="text-lg font-extrabold">Nothing running yet</h2>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[var(--c-text-secondary)]">
                When you start a strategy, this is where you&apos;ll see whether it&apos;s
                actually bringing in orders — in plain language, not spreadsheets.
              </p>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="mt-5 rounded-full bg-[var(--c-brand)] px-6 py-3 text-sm font-bold text-white hover:bg-[var(--c-brand-hover)]"
              >
                See our recommendation →
              </button>
            </section>
          ) : (
            <>
              {strategies.map((strategy) => {
                const current = live
                  ? numbersFrom(overview)
                  : simulateProgress(strategy.baseline, strategy.startedAt);
                const verdict = verdictFor(strategy, current);
                const started = daysAgo(strategy.startedAt);
                const remaining = daysUntil(strategy.reviewAt);
                const progress = Math.min(
                  100,
                  Math.round((started / Math.max(strategy.testDays, 1)) * 100),
                );
                const newNumbers = {
                  shown: Math.max(0, current.shown - strategy.baseline.shown),
                  clicked: Math.max(0, current.clicked - strategy.baseline.clicked),
                  added: Math.max(0, current.added - strategy.baseline.added),
                  orders: Math.max(0, current.orders - strategy.baseline.orders),
                };
                const toneStyles = {
                  good: { border: "var(--c-green-border)", bg: "var(--c-green-bg)", text: "var(--c-green-text)" },
                  soft: { border: "var(--c-amber-border)", bg: "var(--c-amber-bg)", text: "var(--c-amber-text)" },
                  neutral: { border: "var(--c-border)", bg: "var(--c-bg-subtle)", text: "var(--c-text-secondary)" },
                }[verdict.tone];

                return (
                  <section
                    key={strategy.id}
                    className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-bg-card)] p-6 sm:p-8"
                  >
                    {justStartedId === strategy.id ? (
                      <p className="mb-4 inline-block rounded-full border border-[var(--c-green-border)] bg-[var(--c-green-bg)] px-4 py-2 text-xs font-bold text-[var(--c-green-text)]">
                        ✓ Started — your message is live
                      </p>
                    ) : null}
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-extrabold">{strategy.title}</h2>
                        <p className="mt-1 text-sm text-[var(--c-text-secondary)]">
                          {`Started ${started === 0 ? "today" : `${started} day${started === 1 ? "" : "s"} ago`} — clear read by `}
                          <strong>{friendlyDate(strategy.reviewAt)}</strong>
                          {remaining > 0 ? ` (${remaining} days to go)` : ""}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {strategy.status === "running" ? (
                          <button
                            type="button"
                            onClick={() => setStrategyStatus(strategy.id, "paused")}
                            className="rounded-full border border-[var(--c-border)] px-4 py-2 text-xs font-bold text-[var(--c-text-secondary)] hover:border-[var(--c-brand)]"
                          >
                            Pause
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setStrategyStatus(strategy.id, "running")}
                            className="rounded-full border border-[var(--c-green-border)] bg-[var(--c-green-bg)] px-4 py-2 text-xs font-bold text-[var(--c-green-text)]"
                          >
                            Resume
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeStrategy(strategy.id)}
                          className="rounded-full border border-[var(--c-border)] px-4 py-2 text-xs font-bold text-[var(--c-text-muted)] hover:border-[var(--c-red-border)] hover:text-[var(--c-red-text)]"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {strategy.custom || strategy.offer ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {strategy.custom ? (
                          <>
                            <span className="rounded-full border border-[var(--c-brand)] bg-[var(--c-brand-light)] px-3 py-1 text-[11px] font-bold text-[var(--c-brand)]">
                              Your own play
                            </span>
                            <span className="rounded-full border border-[var(--c-border)] bg-[var(--c-bg-subtle)] px-3 py-1 text-[11px] font-bold text-[var(--c-text-secondary)]">
                              {strategy.custom.audience}
                            </span>
                            <span className="rounded-full border border-[var(--c-border)] bg-[var(--c-bg-subtle)] px-3 py-1 text-[11px] font-bold text-[var(--c-text-secondary)]">
                              {strategy.custom.placement}
                            </span>
                          </>
                        ) : null}
                        {strategy.offer ? (
                          <span className="rounded-full border border-[var(--c-green-border)] bg-[var(--c-green-bg)] px-3 py-1 text-[11px] font-bold text-[var(--c-green-text)]">
                            Offer: {offerLabel(strategy.offer)} — ends {friendlyDate(strategy.reviewAt)}
                          </span>
                        ) : null}
                      </div>
                    ) : null}

                    <div className="mt-4 rounded-xl border border-dashed border-[var(--c-border)] bg-[var(--c-bg-subtle)] p-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-[var(--c-text-label)]">
                        The message shoppers see
                      </p>
                      <p className="mt-1 text-sm font-semibold">{strategy.message}</p>
                    </div>

                    <div
                      className="mt-4 rounded-xl border p-4"
                      style={{ borderColor: toneStyles.border, background: toneStyles.bg }}
                    >
                      <p className="text-sm font-extrabold" style={{ color: toneStyles.text }}>
                        {verdict.headline}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[var(--c-text-primary)]">
                        {verdict.detail}
                      </p>
                    </div>

                    <div className="mt-5">
                      <div className="flex items-center justify-between text-xs font-bold text-[var(--c-text-label)]">
                        <span>Test progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[var(--c-bar-track)]">
                        <div
                          className="h-full rounded-full bg-[var(--c-bar-fill)]"
                          style={{ width: `${Math.max(progress, 4)}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-4">
                      <BigNumber label="Seen by" value={newNumbers.shown.toLocaleString()} hint="Shoppers since this started" />
                      <BigNumber label="Clicked" value={newNumbers.clicked.toLocaleString()} hint="Shoppers who clicked the message" />
                      <BigNumber label="Bottles added" value={newNumbers.added.toLocaleString()} hint="Add-to-cart actions that followed" />
                      <BigNumber label="Orders" value={newNumbers.orders.toLocaleString()} hint="Orders where this message helped" />
                    </div>
                  </section>
                );
              })}

              <p className="text-center text-xs text-[var(--c-text-muted)]">
                Want the full spreadsheet view?{" "}
                <Link href="/dashboard" className="font-bold text-[var(--c-brand)] hover:underline">
                  Open the detailed report
                </Link>
              </p>
            </>
          )
        ) : null}
      </main>

      {/* ── Make-your-own-play dialog ───────────────────────────────────── */}
      {builderOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Make your own play"
        >
          <div className="my-8 w-full max-w-xl rounded-2xl border border-[var(--c-border)] bg-[var(--c-bg-card)] p-6 shadow-xl sm:p-8">
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--c-brand)]">
              Your play
            </p>
            <h2 className="mt-2 text-xl font-extrabold">Three questions, then your message</h2>

            <div className="mt-5 space-y-5">
              <ChoiceChips
                label="1 · What are you after?"
                options={PLAY_GOALS}
                value={playGoal}
                onChange={setPlayGoal}
              />
              <ChoiceChips
                label="2 · Who should see it?"
                options={PLAY_AUDIENCES}
                value={playAudience}
                onChange={setPlayAudience}
              />
              <ChoiceChips
                label="3 · Where does it show?"
                options={PLAY_PLACEMENTS}
                value={playPlacement}
                onChange={setPlayPlacement}
              />
              <OfferPicker
                label="4 · Sweeten it with an offer? (optional)"
                choice={playOffer}
                onChoice={setPlayOffer}
                custom={playCustom}
                onCustom={setPlayCustom}
              />

              <div>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wide text-[var(--c-text-label)]">
                    Your message to shoppers
                  </span>
                  <textarea
                    className="mt-2 w-full rounded-xl border border-[var(--c-border)] bg-[var(--c-bg-card)] p-3 text-sm leading-6 outline-none focus:border-[var(--c-border-focus)]"
                    rows={2}
                    maxLength={160}
                    placeholder={starterMessage(playGoal, playAudience, playPlacement)}
                    value={playMessage}
                    onChange={(e) => setPlayMessage(e.target.value)}
                  />
                </label>
                <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setPlayMessage(starterMessage(playGoal, playAudience, playPlacement))}
                    className="text-xs font-bold text-[var(--c-brand)] hover:underline"
                  >
                    Use this starter
                  </button>
                  <span className="text-[11px] text-[var(--c-text-muted)]">
                    Short and specific works best — one offer, one next step.
                  </span>
                </div>
              </div>

              {playMessage.trim() ? (
                <div className="rounded-xl border border-dashed border-[var(--c-brand)] bg-[var(--c-brand-light)] p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-[var(--c-text-label)]">
                    {playAudience} will see this {playPlacement.toLowerCase()}
                  </p>
                  <p className="mt-1 text-sm font-semibold leading-6">{playMessage.trim()}</p>
                </div>
              ) : null}

              <p className="rounded-xl bg-[var(--c-bg-subtle)] p-3 text-xs leading-5 text-[var(--c-text-secondary)]">
                Same deal as our suggestions: we&apos;ll watch it for two weeks and tell you plainly
                whether it&apos;s working. You can edit, pause, or remove it any time.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={startCustomPlay}
                disabled={!playMessage.trim()}
                className="rounded-full bg-[var(--c-brand)] px-6 py-3 text-sm font-bold text-white hover:bg-[var(--c-brand-hover)] disabled:cursor-not-allowed disabled:bg-[var(--c-disabled-bg)]"
              >
                Start my play
              </button>
              <button
                type="button"
                onClick={() => setBuilderOpen(false)}
                className="rounded-full border border-[var(--c-border)] px-6 py-3 text-sm font-bold text-[var(--c-text-secondary)] hover:border-[var(--c-brand)]"
              >
                Go back
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* ── Confirm dialog ──────────────────────────────────────────────── */}
      {confirming ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Confirm ${confirming.title}`}
        >
          <div className="w-full max-w-lg rounded-2xl border border-[var(--c-border)] bg-[var(--c-bg-card)] p-6 shadow-xl sm:p-8">
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--c-brand)]">
              One last look
            </p>
            <h2 className="mt-2 text-xl font-extrabold">{confirming.title}</h2>
            <div className="mt-4 rounded-xl border border-dashed border-[var(--c-brand)] bg-[var(--c-brand-light)] p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--c-text-label)]">
                Shoppers will see
              </p>
              <textarea
                className="mt-2 w-full resize-none rounded-lg border border-transparent bg-transparent text-sm font-semibold leading-6 outline-none focus:border-[var(--c-border-focus)]"
                rows={2}
                value={confirmMessage}
                onChange={(e) => setConfirmMessage(e.target.value)}
                aria-label="Edit the message shoppers will see"
              />
              <p className="text-[11px] text-[var(--c-text-muted)]">Tap the message to edit it.</p>
            </div>
            <ul className="mt-4 space-y-2">
              {confirming.steps.map((s) => (
                <li key={s} className="flex gap-2 text-sm leading-5 text-[var(--c-text-secondary)]">
                  <span className="mt-0.5 text-[var(--c-green-text)]">✓</span>
                  {s}
                </li>
              ))}
            </ul>

            <div className="mt-4">
              <OfferPicker
                label="Sweeten it with an offer?"
                choice={confirmOffer}
                onChoice={setConfirmOffer}
                custom={confirmCustom}
                onCustom={setConfirmCustom}
              />
            </div>

            <p className="mt-4 rounded-xl bg-[var(--c-bg-subtle)] p-3 text-xs leading-5 text-[var(--c-text-secondary)]">
              We&apos;ll watch the results for two weeks and tell you plainly whether it&apos;s
              working. You can edit, pause, or remove it any time — nothing is permanent.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  startStrategy(
                    confirming,
                    confirmMessage.trim() || confirming.defaultMessage,
                    offerFromChoice(confirmOffer, confirmCustom),
                  )
                }
                className="rounded-full bg-[var(--c-brand)] px-6 py-3 text-sm font-bold text-white hover:bg-[var(--c-brand-hover)]"
              >
                Start it
              </button>
              <button
                type="button"
                onClick={() => setConfirming(null)}
                className="rounded-full border border-[var(--c-border)] px-6 py-3 text-sm font-bold text-[var(--c-text-secondary)] hover:border-[var(--c-brand)]"
              >
                Go back
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
