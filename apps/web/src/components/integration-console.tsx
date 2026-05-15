"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { defaultApiBase } from "@/lib/api-base";

const LS_API = "c7-sandbox-api-base";
const LS_TOKEN = "c7-sandbox-operator-token";

type ActionState = { ok: boolean; status: number; body: string; ms: number } | null;

function prettyJson(text: string): string {
  try {
    return JSON.stringify(JSON.parse(text) as unknown, null, 2);
  } catch {
    return text;
  }
}

export function IntegrationConsole() {
  const search = useSearchParams();
  const fromUrl = useMemo(() => {
    const tenantId = search.get("tenantId") ?? search.get("tenant") ?? "";
    const account = search.get("account") ?? "";
    const appToken = search.get("appToken") ?? "";
    const customerId = search.get("customerId") ?? "";
    return { tenantId, account, appToken, customerId };
  }, [search]);

  const [apiBase, setApiBase] = useState(defaultApiBase);
  const [operatorToken, setOperatorToken] = useState("");
  const [manualTenant, setManualTenant] = useState("");
  const [manualJwt, setManualJwt] = useState("");
  const [last, setLast] = useState<ActionState>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      const a = localStorage.getItem(LS_API);
      const t = localStorage.getItem(LS_TOKEN);
      if (a) setApiBase(a);
      if (t) setOperatorToken(t);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (fromUrl.tenantId) setManualTenant((t) => t || fromUrl.tenantId);
    const jwt = fromUrl.account || fromUrl.appToken;
    if (jwt) setManualJwt((j) => j || jwt);
  }, [fromUrl.tenantId, fromUrl.account, fromUrl.appToken]);

  const persistSettings = useCallback(() => {
    try {
      localStorage.setItem(LS_API, apiBase);
      localStorage.setItem(LS_TOKEN, operatorToken);
    } catch {
      /* ignore */
    }
  }, [apiBase, operatorToken]);

  const authHeaders = useCallback(
    (): HeadersInit => {
      const h: Record<string, string> = { Accept: "application/json" };
      if (operatorToken.trim()) {
        h.Authorization = `Bearer ${operatorToken.trim()}`;
      }
      return h;
    },
    [operatorToken],
  );

  const run = useCallback(
    async (
      label: string,
      fn: () => Promise<Response>,
    ): Promise<void> => {
      setBusy(true);
      setLast(null);
      const t0 = performance.now();
      try {
        const res = await fn();
        const text = await res.text();
        setLast({
          ok: res.ok,
          status: res.status,
          body: text || "(empty body)",
          ms: Math.round(performance.now() - t0),
        });
        if (!res.ok) {
          console.warn(`[${label}]`, res.status, text);
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setLast({
          ok: false,
          status: 0,
          body: msg,
          ms: Math.round(performance.now() - t0),
        });
        console.error(`[${label}]`, e);
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  const tenant = manualTenant.trim() || fromUrl.tenantId;
  const extensionJwt = manualJwt.trim() || fromUrl.account || fromUrl.appToken;

  return (
    <div className="min-h-screen bg-[var(--console-bg)] text-[var(--console-fg)]">
      <header className="border-b border-[var(--console-border)] bg-[var(--console-surface)]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-[var(--console-muted)]">
              Commerce7
            </p>
            <h1 className="text-xl font-semibold tracking-tight">Integration console</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
              Sandbox-ready
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 px-5 py-8">
        <section className="rounded-2xl border border-[var(--console-border)] bg-[var(--console-surface)] p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--console-muted)]">
            Connection
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="text-[var(--console-muted)]">API base URL</span>
              <input
                className="mt-1.5 w-full rounded-lg border border-[var(--console-border)] bg-[var(--console-bg)] px-3 py-2 font-mono text-sm outline-none ring-violet-500/40 focus:ring-2"
                value={apiBase}
                onChange={(e) => setApiBase(e.target.value.replace(/\/+$/, ""))}
                placeholder="http://localhost:3001"
                autoComplete="off"
              />
            </label>
            <label className="block text-sm">
              <span className="text-[var(--console-muted)]">
                Operator token{" "}
                <span className="font-normal normal-case text-[var(--console-muted)]/80">
                  (optional — matches API <code className="text-xs">INTERNAL_API_TOKEN</code>)
                </span>
              </span>
              <input
                className="mt-1.5 w-full rounded-lg border border-[var(--console-border)] bg-[var(--console-bg)] px-3 py-2 font-mono text-sm outline-none ring-violet-500/40 focus:ring-2"
                value={operatorToken}
                onChange={(e) => setOperatorToken(e.target.value)}
                placeholder="Bearer token for sync / reconcile / events"
                type="password"
                autoComplete="off"
              />
            </label>
          </div>
          <button
            type="button"
            className="mt-4 rounded-lg bg-stone-200 px-4 py-2 text-sm font-medium text-stone-800 hover:bg-stone-300 dark:bg-stone-700 dark:text-stone-100 dark:hover:bg-stone-600"
            onClick={persistSettings}
          >
            Save to this browser
          </button>
        </section>

        <section className="rounded-2xl border border-[var(--console-border)] bg-[var(--console-surface)] p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--console-muted)]">
            Extension context
          </h2>
          <p className="mt-2 max-w-prose text-sm text-[var(--console-muted)]">
            When opened from Commerce7 Admin, query params may include{" "}
            <code className="rounded bg-stone-100 px-1 py-0.5 text-xs dark:bg-stone-800">tenantId</code>{" "}
            and{" "}
            <code className="rounded bg-stone-100 px-1 py-0.5 text-xs dark:bg-stone-800">account</code>{" "}
            (JWT). Storefront embeds may use{" "}
            <code className="rounded bg-stone-100 px-1 py-0.5 text-xs dark:bg-stone-800">appToken</code>.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {fromUrl.tenantId ? (
              <span className="rounded-full bg-violet-500/15 px-3 py-1 text-xs text-violet-800 dark:text-violet-200">
                tenantId (URL): {fromUrl.tenantId}
              </span>
            ) : null}
            {fromUrl.customerId ? (
              <span className="rounded-full bg-stone-500/15 px-3 py-1 text-xs">customerId: {fromUrl.customerId}</span>
            ) : null}
            {fromUrl.account ? (
              <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs text-amber-900 dark:text-amber-100">
                account JWT in URL
              </span>
            ) : null}
            {fromUrl.appToken ? (
              <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs text-amber-900 dark:text-amber-100">
                appToken in URL
              </span>
            ) : null}
            {!fromUrl.tenantId && !fromUrl.account && !fromUrl.appToken ? (
              <span className="text-sm text-[var(--console-muted)]">No extension params detected — enter manually below.</span>
            ) : null}
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="text-[var(--console-muted)]">Tenant ID</span>
              <input
                className="mt-1.5 w-full rounded-lg border border-[var(--console-border)] bg-[var(--console-bg)] px-3 py-2 font-mono text-sm outline-none ring-violet-500/40 focus:ring-2"
                value={manualTenant}
                onChange={(e) => setManualTenant(e.target.value)}
                placeholder="spectrawinery"
              />
            </label>
            <label className="block text-sm">
              <span className="text-[var(--console-muted)]">Admin JWT / appToken (Authorization value)</span>
              <input
                className="mt-1.5 w-full rounded-lg border border-[var(--console-border)] bg-[var(--console-bg)] px-3 py-2 font-mono text-xs outline-none ring-violet-500/40 focus:ring-2"
                value={manualJwt}
                onChange={(e) => setManualJwt(e.target.value)}
                placeholder="Paste token or load from URL"
                autoComplete="off"
              />
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy || !tenant || !extensionJwt}
              className="rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() =>
                run("account/user", () =>
                  fetch(`${apiBase}/v1/account/user?tenantId=${encodeURIComponent(tenant)}`, {
                    headers: { Authorization: extensionJwt, Accept: "application/json" },
                  }),
                )
              }
            >
              Validate session
            </button>
            <button
              type="button"
              disabled={busy}
              className="rounded-lg border border-[var(--console-border)] bg-transparent px-4 py-2.5 text-sm font-medium hover:bg-stone-100 dark:hover:bg-stone-800"
              onClick={() => run("health", () => fetch(`${apiBase}/health`))}
            >
              API health
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--console-border)] bg-[var(--console-surface)] p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--console-muted)]">
            Operator actions
          </h2>
          <p className="mt-2 text-sm text-[var(--console-muted)]">
            Requires operator token if the API has <code className="text-xs">INTERNAL_API_TOKEN</code> set.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy || !tenant}
              className="rounded-lg bg-rose-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() =>
                run("sync", () =>
                  fetch(`${apiBase}/sync/orders`, {
                    method: "POST",
                    headers: { ...authHeaders(), "Content-Type": "application/json" },
                    body: JSON.stringify({ tenantId: tenant }),
                  }),
                )
              }
            >
              Sync orders (one batch)
            </button>
            <button
              type="button"
              disabled={busy || !tenant}
              className="rounded-lg border border-rose-300 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-900 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-100 dark:hover:bg-rose-950/60 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() =>
                run("reconcile", () =>
                  fetch(`${apiBase}/reconcile/orders`, {
                    method: "POST",
                    headers: { ...authHeaders(), "Content-Type": "application/json" },
                    body: JSON.stringify({ tenantId: tenant }),
                  }),
                )
              }
            >
              Reconcile orders
            </button>
            <button
              type="button"
              disabled={busy || !tenant}
              className="rounded-lg bg-stone-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-600 dark:bg-stone-600 dark:hover:bg-stone-500 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() =>
                run("app-sync", () =>
                  fetch(`${apiBase}/v1/app-sync`, {
                    method: "POST",
                    headers: { ...authHeaders(), "Content-Type": "application/json" },
                    body: JSON.stringify({
                      tenantId: tenant,
                      objectType: "Order",
                      objectId: "demo-order-id",
                      status: "Success",
                    }),
                  }),
                )
              }
            >
              Post demo app-sync
            </button>
            <button
              type="button"
              disabled={busy || !tenant}
              className="rounded-lg border border-[var(--console-border)] bg-transparent px-4 py-2.5 text-sm font-medium hover:bg-stone-100 dark:hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() =>
                run("webhook-sample", () =>
                  fetch(`${apiBase}/webhooks/commerce7`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      object: "Order",
                      action: "Update",
                      payload: { id: "demo-from-ui", updatedAt: new Date().toISOString() },
                      tenantId: tenant,
                    }),
                  }),
                )
              }
            >
              Sample webhook
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-dashed border-[var(--console-border)] bg-[var(--console-surface)]/50 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--console-muted)]">
            Tomorrow in the sandbox
          </h2>
          <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-[var(--console-muted)]">
            <li>
              Run API + web: <code className="text-xs">pnpm dev:all</code> (or two terminals: <code className="text-xs">pnpm dev:api</code> +{" "}
              <code className="text-xs">pnpm dev:web</code>).
            </li>
            <li>
              Point ADC extension URL at this UI (e.g. <code className="text-xs">https://YOUR-NGROK/web</code> or path{" "}
              <code className="text-xs">/app</code>).
            </li>
            <li>
              Set <code className="text-xs">NEXT_PUBLIC_API_URL</code> to your public API URL if the browser cannot reach{" "}
              <code className="text-xs">localhost:3001</code>.
            </li>
            <li>Ensure API <code className="text-xs">APP_BASE_URL</code> allows your web origin for CORS.</li>
          </ul>
        </section>

        {last ? (
          <section
            className={`rounded-2xl border p-6 ${
              last.ok
                ? "border-emerald-500/40 bg-emerald-500/5"
                : "border-red-500/40 bg-red-500/5"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">Last response</h2>
              <span className="font-mono text-xs">
                HTTP {last.status} · {last.ms}ms
              </span>
            </div>
            <pre className="mt-4 max-h-80 overflow-auto rounded-lg bg-[var(--console-bg)] p-4 font-mono text-xs leading-relaxed">
              {prettyJson(last.body)}
            </pre>
          </section>
        ) : null}
      </main>
    </div>
  );
}
