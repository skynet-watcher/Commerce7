import { Suspense } from "react";

import { IntegrationConsole } from "@/components/integration-console";

function Fallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--console-bg)] text-[var(--console-muted)]">
      <p className="text-sm">Loading console…</p>
    </div>
  );
}

/** Same as `/` — point ADC “extension URL” at `…/app` if you prefer a dedicated path. */
export default function AppExtensionEntry() {
  return (
    <Suspense fallback={<Fallback />}>
      <IntegrationConsole />
    </Suspense>
  );
}
