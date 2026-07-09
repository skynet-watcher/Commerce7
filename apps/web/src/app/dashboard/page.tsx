import type { Metadata } from "next";
import { Suspense } from "react";

import { InsightsDashboard } from "@/components/insights-dashboard";

export const metadata: Metadata = {
  title: "Cart Carrot & personalization · Analytics",
  description:
    "Cart Carrot clicks, personalization blocks, adds to cart, and checkout signals from your storefront collector.",
};

function Fallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--console-bg)] text-[var(--console-muted)]">
      <p className="text-sm">Loading dashboard…</p>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<Fallback />}>
      <InsightsDashboard />
    </Suspense>
  );
}
