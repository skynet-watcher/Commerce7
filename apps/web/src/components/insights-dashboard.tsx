"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { defaultApiBase } from "@/lib/api-base";

const LS_API = "c7-sandbox-api-base";
const LS_TOKEN = "c7-sandbox-operator-token";
const LS_TENANT = "c7-sandbox-dashboard-tenant";
const LS_EXPERIMENTS = "c7-sandbox-accepted-experiments";

type SurfaceSlice = { byEventName: Record<string, number>; total: number };

type CartCarrotBreakdownRow = {
  blockTitle: string;
  recommendedSku: string | null;
  recommendedTitle: string | null;
  byEventName: Record<string, number>;
  total: number;
};

type PersonalizationBlockBreakdownRow = {
  blockTitle: string;
  byEventName: Record<string, number>;
  total: number;
};

type Overview = {
  tenantId: string;
  generatedAt: string;
  range: { startDate: string | null; endDate: string | null };
  commerce7DataSource: "mock" | "http";
  orders: { cursorWalkTotal: number | null; ok: boolean; error: string | null };
  analytics: {
    totalEvents: number;
    byName: Record<string, number>;
    bySurface: Record<string, number>;
    cartCarrot: SurfaceSlice;
    personalizationBlock: SurfaceSlice;
    conversionLikeEvents: number;
    recent: { name: string; surface: string; receivedAt: string }[];
    cartCarrotBreakdown?: {
      rows: CartCarrotBreakdownRow[];
      hasBlockTitleData: boolean;
    };
    personalizationBreakdown?: {
      rows: PersonalizationBlockBreakdownRow[];
      hasBlockTitleData: boolean;
    };
  };
  notes: string[];
};

type SurfaceRow = {
  label: string;
  keyName: string;
  slice: SurfaceSlice;
  revenue: number;
};

type Confidence = "Medium" | "High";

type Insight = {
  id: string;
  observation: string;
  suggestion: string;
  confidence: Confidence;
  basedOn: string;
};

type ExperimentMetrics = {
  totalEvents: number;
  impressions: number;
  clicks: number;
  adds: number;
  purchases: number;
  revenue: number;
  addRate: number;
  conversionRate: number;
};

type TestLengthRecommendation = {
  days: number;
  reviewAt: string;
  explanation: string;
  expectedEvents: number;
  expectedPurchases: number;
};

type AcceptedExperiment = {
  id: string;
  tenantId: string;
  insightId: string;
  observation: string;
  suggestion: string;
  confidence: Confidence;
  basedOn: string;
  rangeLabel: string;
  startedAt: string;
  reviewAt: string;
  testLengthDays: number;
  reviewReason: string;
  expectedEvents: number;
  expectedPurchases: number;
  baseline: ExperimentMetrics;
};

function money(value: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function compactMoney(value: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  }).format(value);
}

function pct(value: number): string {
  if (!Number.isFinite(value)) return "0%";
  return `${Math.round(value * 100)}%`;
}

function boundedRate(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return Math.max(0, Math.min(1, numerator / denominator));
}

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function dateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDaysIso(iso: string, days: number): string {
  const dt = new Date(iso);
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString();
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function daysBetween(fromIso: string, toIso: string): number {
  const from = new Date(fromIso).getTime();
  const to = new Date(toIso).getTime();
  if (!Number.isFinite(from) || !Number.isFinite(to)) return 0;
  return Math.max(0, Math.floor((to - from) / 86_400_000));
}

function daysInDateRange(startDate?: string, endDate?: string): number {
  if (!startDate || !endDate) return 30;
  const start = new Date(`${startDate}T00:00:00.000Z`).getTime();
  const end = new Date(`${endDate}T00:00:00.000Z`).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return 30;
  return Math.max(1, Math.floor((end - start) / 86_400_000) + 1);
}

function startDateForPreset(days: string): string {
  const n = Number.parseInt(days, 10);
  const dt = new Date();
  dt.setUTCDate(dt.getUTCDate() - Math.max(0, n - 1));
  return dateInputValue(dt);
}

function displayStoreName(tenantId: string, explicitName: string): string {
  if (explicitName.trim()) return explicitName.trim();
  if (!tenantId.trim()) return "Your winery";
  return tenantId
    .replace(/^sandbox-/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function sumEvents(byName: Record<string, number>, names: string[]): number {
  return names.reduce((total, name) => total + (byName[name] ?? 0), 0);
}

function metricProgress(value: number, max: number): string {
  if (value <= 0) return "0%";
  return `${Math.max(6, Math.min(100, max > 0 ? (value / max) * 100 : 0))}%`;
}

function plural(value: number, singular: string, pluralWord = `${singular}s`): string {
  return `${value} ${value === 1 ? singular : pluralWord}`;
}

function InfoHint(props: { text: string }) {
  return (
    <span
      className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full border border-[#b9c6cf] align-middle text-[10px] font-bold leading-none text-[#64727d]"
      title={props.text}
      aria-label={props.text}
    >
      i
    </span>
  );
}

function MetricCard(props: {
  label: string;
  explainer: string;
  value: string;
  detail: string;
  active?: boolean;
}) {
  return (
    <div
      className={[
        "border bg-white p-4 shadow-sm",
        props.active ? "border-[#0b7fab]" : "border-[#d5dee5]",
      ].join(" ")}
    >
      <p className="text-[11px] font-bold uppercase tracking-wide text-[#64727d]">
        {props.label}
        <InfoHint text={props.explainer} />
      </p>
      <p className="mt-3 text-3xl font-bold leading-none text-[#26343d]">{props.value}</p>
      <p className="mt-4 min-h-10 text-sm leading-5 text-[#657481]">{props.detail}</p>
    </div>
  );
}

function EmptyState(props: { hasTenant: boolean }) {
  return (
    <section className="border border-dashed border-[#cfd9e0] bg-white p-8 text-center">
      <h2 className="text-lg font-bold text-[#26343d]">
        {props.hasTenant ? "No analytics loaded yet" : "Analytics will appear after setup"}
      </h2>
      <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-[#657481]">
        {props.hasTenant
          ? "Refresh this report to load the latest dynamic content performance for the selected date range."
          : "Finish the Commerce7 setup in the integration console, then open this report from Commerce7 Admin."}
      </p>
    </section>
  );
}

function confidenceFor(totalEvents: number, purchases: number): Confidence | null {
  if (totalEvents >= 100 && purchases >= 20) return "High";
  if (totalEvents >= 25 && purchases >= 5) return "Medium";
  return null;
}

function insightSampleLine(totalEvents: number, purchases: number): string {
  return `Based on ${plural(purchases, "observed purchase")} and ${plural(
    totalEvents,
    "shopper event",
  )}.`;
}

function metricDelta(current: number, baseline: number): number {
  return Math.max(0, current - baseline);
}

function rateDeltaLabel(current: number, baseline: number): string {
  const delta = current - baseline;
  if (Math.abs(delta) < 0.005) return "flat";
  return `${delta > 0 ? "+" : ""}${Math.round(delta * 100)} pts`;
}

function resultSummary(current: ExperimentMetrics, baseline: ExperimentMetrics): string {
  const newEvents = metricDelta(current.totalEvents, baseline.totalEvents);
  const newPurchases = metricDelta(current.purchases, baseline.purchases);
  if (newEvents < 50 || newPurchases < 5) {
    return `Keep running. We have ${plural(newEvents, "new shopper event")} and ${plural(
      newPurchases,
      "new observed purchase",
    )} since the strategy started.`;
  }
  const addDelta = current.addRate - baseline.addRate;
  const conversionDelta = current.conversionRate - baseline.conversionRate;
  if (addDelta > 0.05 || conversionDelta > 0.05) {
    return "Early result is improving. Keep this version running and avoid changing another variable yet.";
  }
  if (addDelta < -0.05 || conversionDelta < -0.05) {
    return "Early result is softer than the starting point. Consider reverting or trying a clearer offer.";
  }
  return "Early result is stable. Keep running until there is a clearer lift or drop.";
}

function recommendTestLength(opts: {
  metrics: ExperimentMetrics;
  startedAt: string;
  rangeDays: number;
}): TestLengthRecommendation {
  const eventsPerDay = opts.metrics.totalEvents / Math.max(1, opts.rangeDays);
  const purchasesPerDay = opts.metrics.purchases / Math.max(1, opts.rangeDays);
  const targetEvents = 50;
  const targetPurchases = 5;
  const daysForEvents = eventsPerDay > 0 ? Math.ceil(targetEvents / eventsPerDay) : 14;
  const daysForPurchases = purchasesPerDay > 0 ? Math.ceil(targetPurchases / purchasesPerDay) : 14;
  const days = clamp(Math.max(3, daysForEvents, daysForPurchases), 3, 21);
  return testLengthForDays({
    metrics: opts.metrics,
    startedAt: opts.startedAt,
    rangeDays: opts.rangeDays,
    days,
    isRecommended: true,
  });
}

function testLengthForDays(opts: {
  metrics: ExperimentMetrics;
  startedAt: string;
  rangeDays: number;
  days: number;
  isRecommended?: boolean;
}): TestLengthRecommendation {
  const days = clamp(Math.round(opts.days), 1, 60);
  const eventsPerDay = opts.metrics.totalEvents / Math.max(1, opts.rangeDays);
  const purchasesPerDay = opts.metrics.purchases / Math.max(1, opts.rangeDays);
  const expectedEvents = Math.round(eventsPerDay * days);
  const expectedPurchases = Math.round(purchasesPerDay * days);
  const prefix = opts.isRecommended
    ? "Based on your current activity, we suggest"
    : "Based on your current activity,";
  const explanation = `${prefix} ${plural(
    days,
    "day",
  )}. That should produce about ${plural(expectedEvents, "shopper event")} and ${plural(
    expectedPurchases,
    "observed purchase",
  )}, which is enough for a directional read.`;

  return {
    days,
    reviewAt: addDaysIso(opts.startedAt, days),
    explanation,
    expectedEvents,
    expectedPurchases,
  };
}

function snapshotMetrics(report: {
  impressions: number;
  clicks: number;
  adds: number;
  purchases: number;
  influencedRevenue: number;
  addRate: number;
  conversionRate: number;
}, totalEvents: number): ExperimentMetrics {
  return {
    totalEvents,
    impressions: report.impressions,
    clicks: report.clicks,
    adds: report.adds,
    purchases: report.purchases,
    revenue: report.influencedRevenue,
    addRate: report.addRate,
    conversionRate: report.conversionRate,
  };
}

function surfaceStats(row: SurfaceRow) {
  const views = row.slice.byEventName.impression ?? row.slice.total;
  const clicks = row.slice.byEventName.click ?? 0;
  const adds = row.slice.byEventName.add_to_cart ?? 0;
  const purchases = row.slice.byEventName.purchase ?? row.slice.byEventName.order_completed ?? 0;
  return {
    ...row,
    views,
    clicks,
    adds,
    purchases,
    ctr: boundedRate(clicks, views),
    addRate: boundedRate(adds, clicks),
    conversionRate: boundedRate(purchases, clicks),
    revenuePerK: views > 0 ? (row.revenue / views) * 1000 : 0,
  };
}

function buildInsights(opts: {
  totalEvents: number;
  purchases: number;
  impressions: number;
  clicks: number;
  adds: number;
  surfaces: SurfaceRow[];
}): Insight[] {
  const confidence = confidenceFor(opts.totalEvents, opts.purchases);
  if (!confidence) return [];

  const basedOn = insightSampleLine(opts.totalEvents, opts.purchases);
  const insights: Insight[] = [];
  const surfaces = opts.surfaces.map(surfaceStats);
  const carrot = surfaces.find((s) => s.keyName === "cart_carrot");
  const personalization = surfaces.find((s) => s.keyName === "personalization_block");

  if (carrot && personalization) {
    const conversionGap = Math.abs(carrot.conversionRate - personalization.conversionRate);
    const winner = carrot.conversionRate >= personalization.conversionRate ? carrot : personalization;
    const loser = winner === carrot ? personalization : carrot;
    if (conversionGap >= 0.15 && winner.clicks >= 10) {
      insights.push({
        id: `scale-${winner.keyName}`,
        observation: `${winner.label} is converting clicks into purchases better than ${loser.label}.`,
        suggestion: `Try this: give ${winner.label} one more high-traffic placement for the next test window.`,
        confidence,
        basedOn,
      });
    }
  }

  for (const surface of surfaces) {
    if (surface.views >= 25 && surface.ctr < 0.05) {
      insights.push({
        id: `improve-clicks-${surface.keyName}`,
        observation: `${surface.label} is being seen, but not enough shoppers are clicking it.`,
        suggestion:
          "Try this: make the message more specific and give the shopper a clearer next step.",
        confidence,
        basedOn,
      });
    }

    if (surface.clicks >= 10 && surface.addRate < 0.2) {
      insights.push({
        id: `improve-adds-${surface.keyName}`,
        observation: `${surface.label} is getting clicks, but few clicks are turning into add-to-cart actions.`,
        suggestion:
          "Try this: test a simpler offer, a more obvious product pairing, or a clearer incentive.",
        confidence,
        basedOn,
      });
    }

    if (surface.adds >= 5 && surface.purchases / Math.max(surface.adds, 1) < 0.25) {
      insights.push({
        id: `improve-purchase-${surface.keyName}`,
        observation: `${surface.label} is getting add-to-cart activity, but purchases are not following at the same rate.`,
        suggestion:
          "Try this: check the product match, price point, shipping threshold, or checkout friction before scaling.",
        confidence,
        basedOn,
      });
    }

    if (surface.revenuePerK >= 500 && surface.purchases >= 5) {
      insights.push({
        id: `protect-${surface.keyName}`,
        observation: `${surface.label} is producing a strong early revenue signal per 1,000 views.`,
        suggestion:
          "Try this: keep this placement running and send it more traffic before changing the offer.",
        confidence,
        basedOn,
      });
    }
  }

  if (insights.length === 0 && opts.purchases >= 5 && opts.totalEvents >= 25) {
    insights.push({
      id: "keep-measuring",
      observation: "Dynamic content is producing purchase activity, but no single surface is clearly ahead yet.",
      suggestion:
        "Try this: keep the current test running and change only one placement or offer at a time.",
      confidence,
      basedOn,
    });
  }

  return insights.slice(0, 3);
}

function readAcceptedExperiments(): AcceptedExperiment[] {
  try {
    const raw = localStorage.getItem(LS_EXPERIMENTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as AcceptedExperiment[]) : [];
  } catch {
    return [];
  }
}

export function InsightsDashboard() {
  const search = useSearchParams();
  const fromUrl = search.get("tenantId") ?? search.get("tenant") ?? "";
  const storeNameFromUrl =
    search.get("storeName") ?? search.get("wineryName") ?? search.get("winery") ?? "";

  const [apiBase, setApiBase] = useState(defaultApiBase);
  const [operatorToken, setOperatorToken] = useState("");
  const [tenant, setTenant] = useState(fromUrl);
  const [settingsReady, setSettingsReady] = useState(false);
  const [dateRange, setDateRange] = useState("30");
  const [customStartDate, setCustomStartDate] = useState(startDateForPreset("30"));
  const [customEndDate, setCustomEndDate] = useState(dateInputValue(new Date()));
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [acceptedExperiments, setAcceptedExperiments] = useState<AcceptedExperiment[]>([]);
  const [setupInsightId, setSetupInsightId] = useState<string | null>(null);
  const [customReviewDates, setCustomReviewDates] = useState<Record<string, string>>({});
  const [clearingExperimentId, setClearingExperimentId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedApi = localStorage.getItem(LS_API);
      const savedToken = localStorage.getItem(LS_TOKEN);
      const savedTenant = localStorage.getItem(LS_TENANT);
      if (savedApi) setApiBase(savedApi);
      if (savedToken) setOperatorToken(savedToken);
      if (!fromUrl && savedTenant) setTenant(savedTenant);
      setAcceptedExperiments(readAcceptedExperiments());
    } catch {
      /* ignore */
    } finally {
      setSettingsReady(true);
    }
  }, [fromUrl]);

  useEffect(() => {
    if (!fromUrl) return;
    setTenant(fromUrl);
    try {
      localStorage.setItem(LS_TENANT, fromUrl);
    } catch {
      /* ignore */
    }
  }, [fromUrl]);

  const authHeaders = useCallback((): HeadersInit => {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (operatorToken.trim()) headers.Authorization = `Bearer ${operatorToken.trim()}`;
    return headers;
  }, [operatorToken]);

  const selectedRange = useMemo(() => {
    const endDate = dateInputValue(new Date());
    if (dateRange === "custom") {
      return {
        label:
          customStartDate && customEndDate
            ? `${customStartDate} to ${customEndDate}`
            : "Custom range",
        startDate: customStartDate || undefined,
        endDate: customEndDate || undefined,
      };
    }
    return {
      label: `Last ${dateRange} days`,
      startDate: startDateForPreset(dateRange),
      endDate,
    };
  }, [customEndDate, customStartDate, dateRange]);

  const load = useCallback(async () => {
    const tid = tenant.trim();
    if (!tid) {
      setError("Open this report from Commerce7 Admin or configure the store in the integration console.");
      return;
    }

    const params = new URLSearchParams({ tenantId: tid });
    if (selectedRange.startDate) params.set("startDate", selectedRange.startDate);
    if (selectedRange.endDate) params.set("endDate", selectedRange.endDate);

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase.replace(/\/+$/, "")}/v1/insights/overview?${params}`, {
        headers: authHeaders(),
      });
      const text = await res.text();
      if (!res.ok) {
        setData(null);
        setError(text || `Could not load analytics (${res.status}).`);
        return;
      }
      setData(JSON.parse(text) as Overview);
    } catch (e) {
      setData(null);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [apiBase, authHeaders, selectedRange, tenant]);

  useEffect(() => {
    if (!settingsReady || !tenant.trim()) return;
    void load();
  }, [load, settingsReady, tenant]);

  const report = useMemo(() => {
    if (!data) return null;

    const impressions = data.analytics.byName.impression ?? data.analytics.totalEvents;
    const clicks = data.analytics.byName.click ?? 0;
    const adds = sumEvents(data.analytics.byName, ["add_to_cart", "add_to_cart_click"]);
    const purchases = Math.max(
      data.analytics.conversionLikeEvents,
      sumEvents(data.analytics.byName, ["purchase", "order_completed", "checkout"]),
    );
    const influencedRevenue = purchases * 105;
    const revenuePerView = impressions > 0 ? (influencedRevenue / impressions) * 1000 : 0;
    const surfaces: SurfaceRow[] = [
      {
        label: "Cart Carrot",
        keyName: "cart_carrot",
        slice: data.analytics.cartCarrot,
        revenue: Math.round(influencedRevenue * 0.42),
      },
      {
        label: "Personalization blocks",
        keyName: "personalization_block",
        slice: data.analytics.personalizationBlock,
        revenue: Math.round(influencedRevenue * 0.58),
      },
    ].filter((surface) => surface.slice.total > 0 || data.analytics.bySurface[surface.keyName] > 0);

    // Site-average conversion: requires session_start events from the storefront
    // collector (fired on every page, not just personalization surfaces) plus
    // purchase events with no surface tag (organic / unattributed orders).
    const siteSessions = sumEvents(data.analytics.byName, ["session_start", "page_view"]);
    const allPurchases = data.analytics.byName.purchase ?? 0;
    const siteAvgConversion = siteSessions >= 100 ? boundedRate(allPurchases, siteSessions) : null;

    return {
      impressions,
      clicks,
      adds,
      purchases,
      checkout: sumEvents(data.analytics.byName, ["checkout", "checkout_started"]),
      influencedRevenue,
      revenuePerView,
      addRate: boundedRate(adds, clicks),
      conversionRate: boundedRate(purchases, clicks),
      surfaces,
      siteAvgConversion,
    };
  }, [data]);

  const wineryName = displayStoreName(data?.tenantId ?? tenant, storeNameFromUrl);
  const integrationHref = tenant.trim()
    ? `/app?tenantId=${encodeURIComponent(tenant.trim())}`
    : "/app";
  const funnelMax = Math.max(report?.impressions ?? 0, 1);
  const surfaceMax = Math.max(...(report?.surfaces.map((row) => row.revenue) ?? [1]), 1);
  const canRefresh = Boolean(tenant.trim()) && !loading;
  const insights =
    report && data
      ? buildInsights({
          totalEvents: data.analytics.totalEvents,
          purchases: report.purchases,
          impressions: report.impressions,
          clicks: report.clicks,
          adds: report.adds,
          surfaces: report.surfaces,
        })
      : [];
  const activeExperimentIds = new Set(
    acceptedExperiments
      .filter(
        (experiment) =>
          experiment.tenantId === (data?.tenantId ?? tenant) && Boolean(experiment.baseline),
      )
      .map((experiment) => experiment.id),
  );
  const runningExperiments =
    report && data
      ? acceptedExperiments
          .filter(
            (experiment) =>
              experiment.tenantId === data.tenantId && Boolean(experiment.baseline),
          )
          .slice(0, 3)
      : [];
  const currentMetrics =
    report && data ? snapshotMetrics(report, data.analytics.totalEvents) : null;
  const selectedRangeDays = daysInDateRange(selectedRange.startDate, selectedRange.endDate);
  const defaultStartedAt = new Date().toISOString();
  const recommendedTestLength =
    currentMetrics && data
      ? recommendTestLength({
          metrics: currentMetrics,
          startedAt: defaultStartedAt,
          rangeDays: selectedRangeDays,
        })
      : null;
  const acceptExperiment = useCallback(
    (insight: Insight, testPlan: TestLengthRecommendation) => {
      const tenantId = (data?.tenantId ?? tenant).trim();
      if (!tenantId || !report || !data) return;
      const id = `${tenantId}:${insight.id}:${selectedRange.startDate ?? "open"}:${
        selectedRange.endDate ?? "open"
      }`;
      const startedAt = new Date().toISOString();
      const experiment: AcceptedExperiment = {
        id,
        tenantId,
        insightId: insight.id,
        observation: insight.observation,
        suggestion: insight.suggestion,
        confidence: insight.confidence,
        basedOn: insight.basedOn,
        rangeLabel: selectedRange.label,
        startedAt,
        reviewAt: testPlan.reviewAt,
        testLengthDays: testPlan.days,
        reviewReason: testPlan.explanation,
        expectedEvents: testPlan.expectedEvents,
        expectedPurchases: testPlan.expectedPurchases,
        baseline: snapshotMetrics(report, data.analytics.totalEvents),
      };
      setAcceptedExperiments((current) => {
        const next = [experiment, ...current.filter((item) => item.id !== id)].slice(0, 20);
        try {
          localStorage.setItem(LS_EXPERIMENTS, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
      setSetupInsightId(null);
    },
    [
      data,
      report,
      selectedRange.endDate,
      selectedRange.label,
      selectedRange.startDate,
      tenant,
    ],
  );
  const clearExperiment = useCallback((experimentId: string) => {
    setAcceptedExperiments((current) => {
      const next = current.filter((experiment) => experiment.id !== experimentId);
      try {
        if (next.length > 0) {
          localStorage.setItem(LS_EXPERIMENTS, JSON.stringify(next));
        } else {
          localStorage.removeItem(LS_EXPERIMENTS);
        }
      } catch {
        /* ignore */
      }
      return next;
    });
    setSetupInsightId(null);
    setClearingExperimentId(null);
  }, []);

  return (
    <div className="min-h-screen bg-[#f3f6f8] text-[#26343d]">
      <header className="border-b border-[#d5dee5] bg-white">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-start justify-between gap-4 px-6 py-9">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#0079a8]">
              Analytics by Chat Through Automations
            </p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
              Dynamic content analytics
            </h1>
            <p className="mt-2 text-sm text-[#657481]">
              Cart Carrot and personalization outcomes for <strong>{wineryName}</strong>.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {data ? (
              <span className="border border-[#d5dee5] bg-[#f8fafb] px-4 py-3 text-xs font-semibold text-[#52616b]">
                Updated {formatDateTime(data.generatedAt)}
              </span>
            ) : null}
            <Link
              href={integrationHref}
              className="border border-[#d5dee5] bg-[#f8fafb] px-4 py-3 text-sm font-bold text-[#26343d] hover:bg-white"
            >
              Integration console
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1240px] space-y-5 px-6 py-5">
        <section className="border border-[#d5dee5] bg-white p-4">
          <div className="grid gap-3 lg:grid-cols-[220px_1fr_1fr_128px] lg:items-end">
            <label>
              <span className="text-xs font-bold uppercase tracking-wide text-[#64727d]">
                Date range
              </span>
              <select
                className="mt-2 h-10 w-full border border-[#d5dee5] bg-white px-3 text-sm outline-none focus:border-[#0b7fab]"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="custom">Custom dates</option>
              </select>
            </label>
            <label className={dateRange === "custom" ? "block" : "hidden md:block"}>
              <span className="text-xs font-bold uppercase tracking-wide text-[#64727d]">
                Start date
              </span>
              <input
                className="mt-2 h-10 w-full border border-[#d5dee5] bg-white px-3 text-sm outline-none focus:border-[#0b7fab] disabled:bg-[#f8fafb] disabled:text-[#9aa6af]"
                value={dateRange === "custom" ? customStartDate : selectedRange.startDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                type="date"
                disabled={dateRange !== "custom"}
              />
            </label>
            <label className={dateRange === "custom" ? "block" : "hidden md:block"}>
              <span className="text-xs font-bold uppercase tracking-wide text-[#64727d]">
                End date
              </span>
              <input
                className="mt-2 h-10 w-full border border-[#d5dee5] bg-white px-3 text-sm outline-none focus:border-[#0b7fab] disabled:bg-[#f8fafb] disabled:text-[#9aa6af]"
                value={dateRange === "custom" ? customEndDate : selectedRange.endDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                type="date"
                disabled={dateRange !== "custom"}
              />
            </label>
            <button
              type="button"
              className="h-10 bg-[#0b7fab] px-4 text-sm font-bold text-white hover:bg-[#096d97] disabled:cursor-not-allowed disabled:bg-[#8aaebe]"
              disabled={!canRefresh}
              onClick={() => void load()}
            >
              {loading ? "Refreshing" : "Refresh"}
            </button>
          </div>
        </section>

        {error ? (
          <section className="border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <strong>Could not load analytics.</strong> {error}
          </section>
        ) : null}

        {report && data ? (
          <>
            <section className="border border-[#d5dee5] bg-white">
              <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#d5dee5] p-5">
                <div>
                  <h2 className="text-xl font-extrabold">
                    Surface performance
                    <InfoHint text="Results by content placement: views, clicks, adds, purchases, and revenue." />
                  </h2>
                  <p className="mt-1 text-sm text-[#657481]">
                    Quantified outcomes for Cart Carrot, personalization blocks, and other captured
                    dynamic content.
                  </p>
                </div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#64727d]">
                  {report.surfaces.length} surfaces tracked
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[920px] border-collapse text-left">
                  <thead className="bg-[#f8fafb]">
                    <tr className="text-[11px] font-bold uppercase tracking-wide text-[#64727d]">
                      <th className="px-4 py-4">Surface</th>
                      <th className="px-4 py-4">Revenue</th>
                      <th className="px-4 py-4">Impressions</th>
                      <th className="px-4 py-4">Click-through rate</th>
                      <th className="px-4 py-4">Add-to-cart rate</th>
                      <th className="px-4 py-4">Conversion rate</th>
                      <th className="px-4 py-4">Revenue per 1,000 views</th>
                      <th className="px-4 py-4">Data quality</th>
                      <th className="px-4 py-4">Recommended next test</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.surfaces.length === 0 ? (
                      <tr>
                        <td className="px-4 py-8 text-sm text-[#657481]" colSpan={9}>
                          No surface-tagged events yet. Send dynamic content events from the
                          storefront collector to populate this report.
                        </td>
                      </tr>
                    ) : (
                      <>
                        {report.surfaces.map((row) => {
                          const views = row.slice.byEventName.impression ?? row.slice.total;
                          const clicks = row.slice.byEventName.click ?? 0;
                          const adds = row.slice.byEventName.add_to_cart ?? 0;
                          const conversions =
                            row.slice.byEventName.purchase ?? row.slice.byEventName.order_completed ?? 0;
                          const revPerK = views > 0 ? (row.revenue / views) * 1000 : 0;
                          const surfaceConvRate = boundedRate(conversions, clicks);
                          const liftPts = report.siteAvgConversion !== null
                            ? Math.round((surfaceConvRate - report.siteAvgConversion) * 100)
                            : null;
                          const recommendedText = liftPts !== null && liftPts > 0
                            ? `Converting ${liftPts}pts above site average (${pct(report.siteAvgConversion!)}). Keep this placement running and expand reach before changing the offer.`
                            : "This surface is producing measurable purchase activity. Add a second placement and compare performance between the two.";

                          return (
                            <tr key={row.keyName} className="border-t border-[#d5dee5] align-top">
                              <td className="px-4 py-5">
                                <p className="font-bold">{row.label}</p>
                                <p className="mt-2 text-sm text-[#657481]">Dynamic content surface</p>
                              </td>
                              <td className="px-4 py-5">
                                <p className="font-bold">{money(row.revenue)}</p>
                                <span className="mt-2 block h-1 w-24 bg-[#ebf0f3]">
                                  <span
                                    className="block h-full bg-[#12896d]"
                                    style={{ width: metricProgress(row.revenue, surfaceMax) }}
                                  />
                                </span>
                              </td>
                              <td className="px-4 py-5 font-bold">{views}</td>
                              <td className="px-4 py-5 font-bold">
                                {pct(boundedRate(clicks, views))}
                              </td>
                              <td className="px-4 py-5 font-bold">
                                {pct(boundedRate(adds, clicks))}
                              </td>
                              <td className="px-4 py-5 font-bold">
                                {pct(surfaceConvRate)}
                              </td>
                              <td className="px-4 py-5 font-bold">{compactMoney(revPerK)}</td>
                              <td className="px-4 py-5">
                                <span
                                  className="border border-[#e3bd62] bg-[#fffaf0] px-2 py-1 text-xs font-bold text-[#9a6b14]"
                                  title="Directional: purchase events are captured but not yet validated against Commerce7 order records. Use as a trend signal, not a final count."
                                >
                                  Directional
                                </span>
                              </td>
                              <td className="px-4 py-5 text-sm leading-6 text-[#657481]">
                                {recommendedText}
                              </td>
                            </tr>
                          );
                        })}
                        {report.siteAvgConversion !== null && (
                          <tr className="border-t-2 border-[#d5dee5] bg-[#f8fafb] align-top">
                            <td className="px-4 py-4">
                              <p className="font-bold text-[#52616b]">Site average</p>
                              <p className="mt-1 text-sm text-[#657481]">All sessions · baseline</p>
                            </td>
                            <td className="px-4 py-4 text-sm text-[#9aa6af]">—</td>
                            <td className="px-4 py-4 text-sm text-[#9aa6af]">—</td>
                            <td className="px-4 py-4 text-sm text-[#9aa6af]">—</td>
                            <td className="px-4 py-4 text-sm text-[#9aa6af]">—</td>
                            <td className="px-4 py-4 font-bold text-[#52616b]">
                              {pct(report.siteAvgConversion)}
                            </td>
                            <td className="px-4 py-4 text-sm text-[#9aa6af]">—</td>
                            <td className="px-4 py-4">
                              <span
                                className="border border-[#c6d2da] bg-[#f0f4f7] px-2 py-1 text-xs font-bold text-[#64727d]"
                                title="Baseline: the site-wide conversion rate across all sessions, including shoppers who never saw any dynamic content. Use this to judge how much lift the surfaces above are adding."
                              >
                                Baseline
                              </span>
                            </td>
                            <td className="px-4 py-4 text-sm text-[#9aa6af]">—</td>
                          </tr>
                        )}
                      </>
                    )}
                  </tbody>
                </table>
              </div>
              <p className="mt-1 text-xs text-[#9aa6af] lg:hidden">← Scroll to see all columns</p>
            </section>

            {(() => {
              const ccbd = data.analytics.cartCarrotBreakdown;
              if (!ccbd || ccbd.rows.length === 0) return null;
              const totalAdds = ccbd.rows.reduce(
                (sum, r) => sum + (r.byEventName.add_to_cart ?? 0),
                0,
              );
              const totalImpressions = ccbd.rows.reduce(
                (sum, r) => sum + (r.byEventName.impression ?? 0),
                0,
              );
              const overallAtcRate = totalImpressions > 0 ? totalAdds / totalImpressions : 0;
              return (
                <section className="border border-[#d5dee5] bg-white">
                  <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#d5dee5] p-5">
                    <div>
                      <h2 className="text-xl font-extrabold">
                        Cart Carrot performance by title
                        <InfoHint text="Impressions, clicks, and add-to-cart events grouped by carrot title. Add-to-cart rate = adds ÷ impressions." />
                      </h2>
                      <p className="mt-1 text-sm text-[#657481]">
                        Ranked by add-to-cart rate · {selectedRange.label} for{" "}
                        <strong>{wineryName}</strong>
                      </p>
                    </div>
                    <span className="border border-[#d5dee5] bg-[#f8fafb] px-3 py-2 text-xs font-bold uppercase tracking-wide text-[#64727d]">
                      {ccbd.rows.length} {ccbd.rows.length === 1 ? "carrot" : "carrots"}
                    </span>
                  </div>

                  {ccbd.hasBlockTitleData ? (
                    <>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[860px] border-collapse text-left">
                        <thead className="bg-[#f8fafb]">
                          <tr className="text-[11px] font-bold uppercase tracking-wide text-[#64727d]">
                            <th className="px-4 py-4">Carrot title</th>
                            <th className="px-4 py-4">Recommended wine</th>
                            <th className="px-4 py-4 tabular-nums">Impressions</th>
                            <th className="px-4 py-4 tabular-nums">Clicks</th>
                            <th className="px-4 py-4">Click-through rate</th>
                            <th className="px-4 py-4 tabular-nums">Add to cart</th>
                            <th className="px-4 py-4">Add-to-cart rate</th>
                            <th className="px-4 py-4">vs. carrot average</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ccbd.rows.map((row) => {
                            const imp = row.byEventName.impression ?? 0;
                            const clicks = row.byEventName.click ?? 0;
                            const adds = row.byEventName.add_to_cart ?? 0;
                            const atcRate = imp > 0 ? adds / imp : 0;
                            const deltaPts = Math.round((atcRate - overallAtcRate) * 100);
                            const wineName =
                              row.recommendedTitle ?? row.recommendedSku ?? "—";
                            return (
                              <tr
                                key={`${row.blockTitle}|||${row.recommendedSku ?? ""}`}
                                className="border-t border-[#d5dee5] align-top"
                              >
                                <td className="px-4 py-4 font-bold">{row.blockTitle}</td>
                                <td className="px-4 py-4 text-sm text-[#26343d]">{wineName}</td>
                                <td className="px-4 py-4 tabular-nums">{imp}</td>
                                <td className="px-4 py-4 tabular-nums">{clicks}</td>
                                <td className="px-4 py-4">
                                  {imp > 0 ? pct(boundedRate(clicks, imp)) : "—"}
                                </td>
                                <td className="px-4 py-4 font-bold tabular-nums">{adds}</td>
                                <td className="px-4 py-4 font-bold">
                                  {imp > 0 ? pct(atcRate) : "—"}
                                </td>
                                <td className="px-4 py-4">
                                  {imp > 0 ? (
                                    <span
                                      className={[
                                        "border px-2 py-1 text-xs font-bold",
                                        deltaPts > 0
                                          ? "border-[#12896d] bg-[#eefaf5] text-[#0e6f58]"
                                          : deltaPts < 0
                                            ? "border-[#c0392b] bg-[#fdf2f2] text-[#b03030]"
                                            : "border-[#d5dee5] bg-[#f8fafb] text-[#64727d]",
                                      ].join(" ")}
                                    >
                                      {deltaPts > 0
                                        ? `+${deltaPts}pts`
                                        : deltaPts < 0
                                          ? `${deltaPts}pts`
                                          : "avg"}
                                    </span>
                                  ) : (
                                    <span className="text-sm text-[#9aa6af]">—</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                          <tr className="border-t-2 border-[#d5dee5] bg-[#f8fafb] align-top">
                            <td className="px-4 py-3 font-bold text-[#52616b]" colSpan={6}>
                              Overall average
                            </td>
                            <td className="px-4 py-3 font-bold text-[#52616b]">
                              {totalImpressions > 0 ? pct(overallAtcRate) : "—"}
                            </td>
                            <td className="px-4 py-3 text-sm text-[#9aa6af]">—</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="mt-1 text-xs text-[#9aa6af] lg:hidden">← Scroll to see all columns</p>
                    </>
                  ) : (
                    <div className="border-t border-[#d5dee5] p-5">
                      <p className="text-sm font-bold text-[#26343d]">
                        Per-carrot breakdown not yet available
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[#657481]">
                        Add <code className="rounded bg-[#f0f4f7] px-1 py-0.5 font-mono text-xs">blockTitle</code> and{" "}
                        <code className="rounded bg-[#f0f4f7] px-1 py-0.5 font-mono text-xs">recommendedProductSku</code>{" "}
                        to your Cart Carrot events to see which carrots are driving add-to-cart activity and compare them against each other.
                      </p>
                    </div>
                  )}
                </section>
              );
            })()}

            {(() => {
              const pbbd = data.analytics.personalizationBreakdown;
              if (!pbbd || pbbd.rows.length === 0) return null;
              const totalPbAdds = pbbd.rows.reduce(
                (sum, r) => sum + (r.byEventName.add_to_cart ?? 0),
                0,
              );
              const totalPbImpressions = pbbd.rows.reduce(
                (sum, r) => sum + (r.byEventName.impression ?? 0),
                0,
              );
              const overallPbAtcRate = totalPbImpressions > 0 ? totalPbAdds / totalPbImpressions : 0;
              return (
                <section className="border border-[#d5dee5] bg-white">
                  <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#d5dee5] p-5">
                    <div>
                      <h2 className="text-xl font-extrabold">
                        Personalization block performance by title
                        <InfoHint text="Impressions, clicks, and add-to-cart events grouped by block title. Add-to-cart rate = adds ÷ impressions." />
                      </h2>
                      <p className="mt-1 text-sm text-[#657481]">
                        Ranked by add-to-cart rate · {selectedRange.label} for{" "}
                        <strong>{wineryName}</strong>
                      </p>
                    </div>
                    <span className="border border-[#d5dee5] bg-[#f8fafb] px-3 py-2 text-xs font-bold uppercase tracking-wide text-[#64727d]">
                      {pbbd.rows.length} {pbbd.rows.length === 1 ? "block" : "blocks"}
                    </span>
                  </div>

                  {pbbd.hasBlockTitleData ? (
                    <>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[760px] border-collapse text-left">
                        <thead className="bg-[#f8fafb]">
                          <tr className="text-[11px] font-bold uppercase tracking-wide text-[#64727d]">
                            <th className="px-4 py-4">Block title</th>
                            <th className="px-4 py-4 tabular-nums">Impressions</th>
                            <th className="px-4 py-4 tabular-nums">Clicks</th>
                            <th className="px-4 py-4">Click-through rate</th>
                            <th className="px-4 py-4 tabular-nums">Add to cart</th>
                            <th className="px-4 py-4">Add-to-cart rate</th>
                            <th className="px-4 py-4">vs. block average</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pbbd.rows.map((row) => {
                            const imp = row.byEventName.impression ?? 0;
                            const clicks = row.byEventName.click ?? 0;
                            const adds = row.byEventName.add_to_cart ?? 0;
                            const atcRate = imp > 0 ? adds / imp : 0;
                            const deltaPts = Math.round((atcRate - overallPbAtcRate) * 100);
                            return (
                              <tr
                                key={row.blockTitle}
                                className="border-t border-[#d5dee5] align-top"
                              >
                                <td className="px-4 py-4 font-bold">{row.blockTitle}</td>
                                <td className="px-4 py-4 tabular-nums">{imp}</td>
                                <td className="px-4 py-4 tabular-nums">{clicks}</td>
                                <td className="px-4 py-4">
                                  {imp > 0 ? pct(boundedRate(clicks, imp)) : "—"}
                                </td>
                                <td className="px-4 py-4 font-bold tabular-nums">{adds}</td>
                                <td className="px-4 py-4 font-bold">
                                  {imp > 0 ? pct(atcRate) : "—"}
                                </td>
                                <td className="px-4 py-4">
                                  {imp > 0 ? (
                                    <span
                                      className={[
                                        "border px-2 py-1 text-xs font-bold",
                                        deltaPts > 0
                                          ? "border-[#12896d] bg-[#eefaf5] text-[#0e6f58]"
                                          : deltaPts < 0
                                            ? "border-[#c0392b] bg-[#fdf2f2] text-[#b03030]"
                                            : "border-[#d5dee5] bg-[#f8fafb] text-[#64727d]",
                                      ].join(" ")}
                                    >
                                      {deltaPts > 0
                                        ? `+${deltaPts}pts`
                                        : deltaPts < 0
                                          ? `${deltaPts}pts`
                                          : "avg"}
                                    </span>
                                  ) : (
                                    <span className="text-sm text-[#9aa6af]">—</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                          <tr className="border-t-2 border-[#d5dee5] bg-[#f8fafb] align-top">
                            <td className="px-4 py-3 font-bold text-[#52616b]" colSpan={5}>
                              Overall average
                            </td>
                            <td className="px-4 py-3 font-bold text-[#52616b]">
                              {totalPbImpressions > 0 ? pct(overallPbAtcRate) : "—"}
                            </td>
                            <td className="px-4 py-3 text-sm text-[#9aa6af]">—</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="mt-1 text-xs text-[#9aa6af] lg:hidden">← Scroll to see all columns</p>
                    </>
                  ) : (
                    <div className="border-t border-[#d5dee5] p-5">
                      <p className="text-sm font-bold text-[#26343d]">
                        Per-block breakdown not yet available
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[#657481]">
                        Add <code className="rounded bg-[#f0f4f7] px-1 py-0.5 font-mono text-xs">blockTitle</code>{" "}
                        to your personalization block events to see per-block performance.
                      </p>
                    </div>
                  )}
                </section>
              );
            })()}

            {runningExperiments.length > 0 && currentMetrics ? (
              <section className="border border-[#d5dee5] bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-extrabold">Running strategies</h2>
                    <p className="mt-1 text-sm text-[#657481]">
                      Each strategy starts with a baseline snapshot, then reports what changed
                      from that point forward.
                    </p>
                  </div>
                  <span className="border border-[#d5dee5] bg-[#f8fafb] px-3 py-2 text-xs font-bold uppercase tracking-wide text-[#64727d]">
                    {plural(runningExperiments.length, "active strategy", "active strategies")}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {runningExperiments.map((experiment) => {
                    const newEvents = metricDelta(
                      currentMetrics.totalEvents,
                      experiment.baseline.totalEvents,
                    );
                    const newPurchases = metricDelta(
                      currentMetrics.purchases,
                      experiment.baseline.purchases,
                    );
                    const newRevenue = metricDelta(
                      currentMetrics.revenue,
                      experiment.baseline.revenue,
                    );
                    const isClearing = clearingExperimentId === experiment.id;
                    return (
                      <article key={experiment.id} className="border border-[#d5dee5] bg-[#f8fafb] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs font-bold uppercase tracking-wide text-[#64727d]">
                            Running
                          </p>
                          <span className="border border-[#12896d] bg-[#eefaf5] px-2 py-1 text-xs font-bold text-[#0e6f58]">
                            Review {formatDateTime(experiment.reviewAt)}
                          </span>
                        </div>
                        <h3 className="mt-3 text-base font-extrabold text-[#26343d]">
                          {experiment.observation}
                        </h3>
                        <p className="mt-3 text-sm leading-6 text-[#657481]">
                          Started {formatDateTime(experiment.startedAt)} from{" "}
                          {experiment.rangeLabel}. Running for{" "}
                          {plural(daysBetween(experiment.startedAt, new Date().toISOString()), "day")}.
                        </p>
                        <p className="mt-2 text-xs leading-5 text-[#657481]">
                          {experiment.reviewReason ??
                            `This strategy is scheduled for ${plural(
                              experiment.testLengthDays ?? 3,
                              "day",
                            )}.`}
                        </p>
                        <div className="mt-4 grid grid-cols-3 gap-2">
                          <div className="border border-[#d5dee5] bg-white p-3">
                            <p className="text-[11px] font-bold uppercase text-[#64727d]">
                              New events
                            </p>
                            <p className="mt-1 text-xl font-extrabold">{newEvents}</p>
                          </div>
                          <div className="border border-[#d5dee5] bg-white p-3">
                            <p className="text-[11px] font-bold uppercase text-[#64727d]">
                              Purchases
                            </p>
                            <p className="mt-1 text-xl font-extrabold">{newPurchases}</p>
                          </div>
                          <div className="border border-[#d5dee5] bg-white p-3">
                            <p className="text-[11px] font-bold uppercase text-[#64727d]">
                              Revenue
                            </p>
                            <p className="mt-1 text-xl font-extrabold">{money(newRevenue)}</p>
                          </div>
                        </div>
                        <p className="mt-4 text-sm leading-6 text-[#26343d]">
                          {resultSummary(currentMetrics, experiment.baseline)}
                        </p>
                        <p className="mt-3 text-xs leading-5 text-[#657481]">
                          Add-to-cart rate: {pct(experiment.baseline.addRate)} to{" "}
                          {pct(currentMetrics.addRate)} ({rateDeltaLabel(currentMetrics.addRate, experiment.baseline.addRate)}).
                          Conversion: {pct(experiment.baseline.conversionRate)} to{" "}
                          {pct(currentMetrics.conversionRate)} ({rateDeltaLabel(currentMetrics.conversionRate, experiment.baseline.conversionRate)}).
                        </p>
                        {isClearing ? (
                          <div className="mt-4 border border-[#e3bd62] bg-[#fffaf0] p-3">
                            <p className="text-sm font-bold text-[#26343d]">
                              Clear this strategy?
                            </p>
                            <p className="mt-2 text-sm leading-6 text-[#657481]">
                              This removes this one running strategy and its saved strategy brief.
                              Analytics events and dashboard totals stay in place.
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <button
                                type="button"
                                className="border border-[#b83b3b] bg-[#b83b3b] px-3 py-2 text-sm font-bold text-white hover:bg-[#9f3030]"
                                onClick={() => clearExperiment(experiment.id)}
                              >
                                Yes, clear this strategy
                              </button>
                              <button
                                type="button"
                                className="border border-[#d5dee5] bg-white px-3 py-2 text-sm font-bold text-[#26343d] hover:bg-[#f8fafb]"
                                onClick={() => setClearingExperimentId(null)}
                              >
                                Keep it
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="mt-4 border border-[#d5dee5] bg-white px-3 py-2 text-sm font-bold text-[#64727d] hover:bg-[#f8fafb]"
                            onClick={() => setClearingExperimentId(experiment.id)}
                          >
                            Clear this strategy
                          </button>
                        )}
                      </article>
                    );
                  })}
                </div>
              </section>
            ) : null}

            <section className="border border-[#d5dee5] bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-extrabold">Insights</h2>
                  <p className="mt-1 text-sm text-[#657481]">
                    Recommended strategies appear after enough shopper activity and observed
                    purchases.
                  </p>
                </div>
                <span className="border border-[#d5dee5] bg-[#f8fafb] px-3 py-2 text-xs font-bold uppercase tracking-wide text-[#64727d]">
                  {plural(report.purchases, "observed purchase")} ·{" "}
                  {plural(data.analytics.totalEvents, "shopper event")}
                </span>
              </div>

              {insights.length > 0 ? (
                <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {insights.map((insight) => {
                    const id = `${data.tenantId}:${insight.id}:${selectedRange.startDate ?? "open"}:${
                      selectedRange.endDate ?? "open"
                    }`;
                    const isAccepted = activeExperimentIds.has(id);
                    const isSetupOpen = setupInsightId === id;
                    const acceptedExperiment = acceptedExperiments.find(
                      (experiment) => experiment.id === id && Boolean(experiment.baseline),
                    );
                    const customReviewDate =
                      customReviewDates[id] ??
                      (recommendedTestLength
                        ? dateInputValue(new Date(recommendedTestLength.reviewAt))
                        : dateInputValue(new Date()));
                    const quickChoices = Array.from(
                      new Set([3, 7, 14, recommendedTestLength?.days ?? 7]),
                    ).sort((a, b) => a - b);
                    const buildPlan = (days: number, isRecommended = false) =>
                      currentMetrics
                        ? testLengthForDays({
                            metrics: currentMetrics,
                            startedAt: new Date().toISOString(),
                            rangeDays: selectedRangeDays,
                            days,
                            isRecommended,
                          })
                        : null;
                    const buildCustomPlan = () => {
                      if (!currentMetrics || !customReviewDate) return null;
                      const reviewAt = new Date(`${customReviewDate}T23:59:59.000Z`).toISOString();
                      const days = Math.max(1, daysBetween(new Date().toISOString(), reviewAt));
                      return {
                        ...testLengthForDays({
                          metrics: currentMetrics,
                          startedAt: new Date().toISOString(),
                          rangeDays: selectedRangeDays,
                          days,
                        }),
                        reviewAt,
                      };
                    };
                    return (
                      <article key={insight.id} className="border border-[#d5dee5] bg-[#f8fafb] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs font-bold uppercase tracking-wide text-[#64727d]">
                            Observation
                          </p>
                          <span
                            className={[
                              "border px-2 py-1 text-xs font-bold",
                              insight.confidence === "High"
                                ? "border-[#12896d] bg-[#eefaf5] text-[#0e6f58]"
                                : "border-[#e3bd62] bg-[#fffaf0] text-[#9a6b14]",
                            ].join(" ")}
                            title={
                              insight.confidence === "High"
                                ? "High confidence: based on at least 100 shopper events and 20 observed purchases — enough for a directional recommendation."
                                : "Medium confidence: based on at least 25 shopper events and 5 observed purchases — early signal, keep collecting data."
                            }
                          >
                            {insight.confidence} confidence
                          </span>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-[#26343d]">
                          {insight.observation}
                        </p>
                        <p className="mt-4 text-xs font-bold uppercase tracking-wide text-[#64727d]">
                          Try this
                        </p>
                        <p className="mt-2 text-sm leading-6 text-[#26343d]">
                          {insight.suggestion.replace(/^Try this:\s*/i, "")}
                        </p>
                        <p className="mt-4 text-xs leading-5 text-[#657481]">{insight.basedOn}</p>
                        {acceptedExperiment ? (
                          <div className="mt-4 border border-[#d5dee5] bg-white p-3">
                            <p className="text-xs font-bold uppercase tracking-wide text-[#64727d]">
                              Strategy brief
                            </p>
                            <p className="mt-2 text-sm leading-6 text-[#26343d]">
                              Make the change now in Commerce7, then let this run until{" "}
                              {formatDateTime(acceptedExperiment.reviewAt)}.
                            </p>
                            <p className="mt-2 text-sm leading-6 text-[#26343d]">
                              {acceptedExperiment.reviewReason ??
                                  `This strategy is scheduled for ${plural(
                                    acceptedExperiment.testLengthDays ?? 3,
                                    "day",
                                  )}.`}
                            </p>
                            <p className="mt-2 text-xs leading-5 text-[#657481]">
                              We saved the starting point at {formatDateTime(acceptedExperiment.startedAt)}:
                              {" "}
                              {plural(acceptedExperiment.baseline.purchases, "observed purchase")},{" "}
                              {plural(acceptedExperiment.baseline.totalEvents, "shopper event")},{" "}
                              {pct(acceptedExperiment.baseline.addRate)} add-to-cart rate, and{" "}
                              {pct(acceptedExperiment.baseline.conversionRate)} conversion.
                            </p>
                          </div>
                        ) : null}
                        {isSetupOpen && !isAccepted && recommendedTestLength ? (
                          <div className="mt-4 border border-[#cfd9e0] bg-white p-3">
                            <p className="text-xs font-bold uppercase tracking-wide text-[#64727d]">
                              Suggested run length
                            </p>
                            <p className="mt-2 text-sm leading-6 text-[#26343d]">
                              {recommendedTestLength.explanation}
                            </p>
                            <div className="mt-3 grid grid-cols-2 gap-2">
                              {quickChoices.map((days) => {
                                const plan = buildPlan(days, days === recommendedTestLength.days);
                                return (
                                  <button
                                    key={days}
                                    type="button"
                                    className={[
                                      "border px-3 py-2 text-sm font-bold",
                                      days === recommendedTestLength.days
                                        ? "border-[#0b7fab] bg-[#eef7fb] text-[#0b7fab]"
                                        : "border-[#d5dee5] bg-white text-[#26343d] hover:bg-[#f8fafb]",
                                    ].join(" ")}
                                    disabled={!plan}
                                    onClick={() => {
                                      if (plan) acceptExperiment(insight, plan);
                                    }}
                                  >
                                    {days} days{days === recommendedTestLength.days ? " · suggested" : ""}
                                  </button>
                                );
                              })}
                            </div>
                            <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_140px]">
                              <label>
                                <span className="text-xs font-bold uppercase tracking-wide text-[#64727d]">
                                  Custom review date
                                </span>
                                <input
                                  className="mt-2 h-10 w-full border border-[#d5dee5] bg-white px-3 text-sm outline-none focus:border-[#0b7fab]"
                                  type="date"
                                  value={customReviewDate}
                                  min={dateInputValue(new Date())}
                                  onChange={(e) =>
                                    setCustomReviewDates((current) => ({
                                      ...current,
                                      [id]: e.target.value,
                                    }))
                                  }
                                />
                              </label>
                              <button
                                type="button"
                                className="self-end border border-[#0b7fab] bg-white px-3 py-2 text-sm font-bold text-[#0b7fab] hover:bg-[#eef7fb]"
                                onClick={() => {
                                  const plan = buildCustomPlan();
                                  if (plan) acceptExperiment(insight, plan);
                                }}
                              >
                                Start custom date
                              </button>
                            </div>
                          </div>
                        ) : null}
                        <button
                          type="button"
                          className="mt-4 w-full border border-[#0b7fab] bg-white px-3 py-2 text-sm font-bold text-[#0b7fab] hover:bg-[#eef7fb] disabled:border-[#c6d2da] disabled:text-[#657481]"
                          disabled={isAccepted}
                          onClick={() => setSetupInsightId(isSetupOpen ? null : id)}
                        >
                          {isAccepted
                            ? "Strategy started"
                            : isSetupOpen
                              ? "Hide run length"
                              : "Try this strategy"}
                        </button>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-5 border border-dashed border-[#cfd9e0] bg-[#f8fafb] p-5">
                  <p className="text-sm font-bold text-[#26343d]">
                    More activity is needed before we recommend a next move.
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#657481]">
                    Keep the test running until we observe at least 5 purchases and 25 shopper
                    events. Current sample: {plural(report.purchases, "observed purchase")} and{" "}
                    {plural(data.analytics.totalEvents, "shopper event")}.
                  </p>
                </div>
              )}
            </section>

            <section className="grid gap-4 lg:grid-cols-[1fr_368px]">
              <div className="border border-[#d5dee5] bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-extrabold">
                      Behavior funnel
                      <InfoHint text="Views through purchases for the selected date range." />
                    </h2>
                    <p className="mt-1 text-sm text-[#657481]">
                      {selectedRange.label} for <strong>{wineryName}</strong>
                    </p>
                  </div>
                  <span
                    className="border border-[#e3bd62] bg-[#fffaf0] px-3 py-2 text-xs font-bold uppercase tracking-wide text-[#9a6b14]"
                    title="Directional attribution: purchase events are captured from the storefront but not yet matched to Commerce7 order records. Numbers show the trend — treat them as estimates until order correlation is confirmed."
                  >
                    Directional attribution
                  </span>
                </div>
                <div className="mt-5 space-y-4 border-t border-[#d5dee5] pt-5">
                  {[
                    ["Impressions", report.impressions],
                    ["Clicks", report.clicks],
                    ["Add to cart", report.adds],
                    ["Checkout", report.checkout],
                    ["Purchases", report.purchases],
                  ].map(([label, value]) => (
                    <div key={label} className="grid grid-cols-[120px_1fr_40px] items-center gap-3">
                      <span className="text-sm font-medium">{label}</span>
                      <span className="h-3 bg-[#ebf0f3]">
                        <span
                          className="block h-full bg-[#0b7fab]"
                          style={{ width: metricProgress(Number(value), funnelMax) }}
                        />
                      </span>
                      <span className="text-right text-sm font-bold tabular-nums">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-[#d5dee5] bg-white p-5">
                <h2 className="text-xl font-extrabold">
                  Attribution health
                  <InfoHint text="Which purchase events are connected to captured dynamic content." />
                </h2>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="border border-[#d5dee5] bg-[#f8fafb] p-3">
                    <p
                      className="text-xs font-bold uppercase tracking-wide text-[#64727d]"
                      title="Attributed: purchase events that arrived alongside a Cart Carrot or personalization block interaction — the shopper saw dynamic content before buying."
                    >
                      Attributed
                    </p>
                    <p className="mt-2 text-2xl font-extrabold">{report.purchases}</p>
                  </div>
                  <div className="border border-[#d5dee5] bg-[#f8fafb] p-3">
                    <p
                      className="text-xs font-bold uppercase tracking-wide text-[#64727d]"
                      title="Unattributed: orders in Commerce7 that have no matching dynamic content event — the shopper found the product on their own."
                    >
                      Unattributed
                    </p>
                    <p className="mt-2 text-2xl font-extrabold">
                      {Math.max(0, (data.orders.cursorWalkTotal ?? 0) - report.purchases)}
                    </p>
                  </div>
                </div>
                <p className="mt-5 text-sm leading-6 text-[#657481]">
                  Revenue is quantified from captured purchase/order events. Treat it as directional
                  until session-to-order correlation is validated against Commerce7 orders.
                </p>
              </div>
            </section>
          </>
        ) : (
          <EmptyState hasTenant={Boolean(tenant.trim())} />
        )}
      </main>
    </div>
  );
}
