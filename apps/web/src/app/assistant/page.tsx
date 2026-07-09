import type { Metadata } from "next";
import { Suspense } from "react";

import { WineryAssistant } from "@/components/winery-assistant";

export const metadata: Metadata = {
  title: "Your marketing assistant",
  description:
    "A checkup of your online store, one clear next move, and honest results — built for winery teams, no marketing experience required.",
};

function Fallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--c-bg-page)] text-[var(--c-text-secondary)]">
      <p className="text-sm">Getting things ready…</p>
    </div>
  );
}

export default function AssistantPage() {
  return (
    <Suspense fallback={<Fallback />}>
      <WineryAssistant />
    </Suspense>
  );
}
