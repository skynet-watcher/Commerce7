import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Troubleshooting — Cart Carrot Analytics Docs",
  description: "Fix common issues with Cart Carrot Analytics setup and data.",
};

const SUPPORT_EMAIL = "eric.a.f.jacobsen@gmail.com";

function Issue({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-[var(--c-border)] bg-[var(--c-bg-card)]">
      <div className="border-b border-[var(--c-border)] bg-[var(--c-bg-subtle)] px-5 py-4">
        <h3 className="text-sm font-extrabold text-[var(--c-text-primary)]">{title}</h3>
      </div>
      <div className="space-y-3 px-5 py-4 text-sm leading-6 text-[var(--c-text-secondary)]">
        {children}
      </div>
    </div>
  );
}

function Check({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 flex-shrink-0 text-[var(--c-text-muted)]">→</span>
      <span>{children}</span>
    </li>
  );
}

export default function TroubleshootingPage() {
  return (
    <article className="max-w-2xl">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-xs text-[var(--c-text-muted)]">
        <Link href="/" className="hover:text-[var(--c-text-secondary)]">Home</Link>
        <span>/</span>
        <Link href="/docs/getting-started" className="hover:text-[var(--c-text-secondary)]">Docs</Link>
        <span>/</span>
        <span className="text-[var(--c-text-secondary)]">Troubleshooting</span>
      </nav>

      <h1 className="text-3xl font-extrabold tracking-tight text-[var(--c-text-primary)]">
        Troubleshooting
      </h1>
      <p className="mt-4 text-base leading-7 text-[var(--c-text-secondary)]">
        Common issues and how to fix them. If none of these resolve your problem,{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="font-bold text-[var(--c-brand)] hover:underline">
          email us
        </a>{" "}
        — we respond within one business day.
      </p>

      <div className="mt-10 space-y-5">

        <Issue title="No data is appearing in my dashboard">
          <ul className="space-y-2">
            <Check>
              <strong className="text-[var(--c-text-primary)]">Check that the snippet is installed.</strong>{" "}
              Open your storefront in a browser, open the developer console (F12), and run{" "}
              <code className="rounded bg-[var(--c-bg-muted)] px-1 py-0.5 font-mono text-xs">typeof window.ccAnalytics</code>.
              It should return <code className="rounded bg-[var(--c-bg-muted)] px-1 py-0.5 font-mono text-xs">"object"</code>.
              If it returns <code className="rounded bg-[var(--c-bg-muted)] px-1 py-0.5 font-mono text-xs">"undefined"</code>,
              the snippet didn't load. Re-check that you pasted it before{" "}
              <code className="rounded bg-[var(--c-bg-muted)] px-1 py-0.5 font-mono text-xs">&lt;/head&gt;</code>{" "}
              and published the theme change.
            </Check>
            <Check>
              <strong className="text-[var(--c-text-primary)]">Check that the Tenant ID is correct.</strong>{" "}
              It's the first segment of your Commerce7 admin URL — e.g.{" "}
              <code className="rounded bg-[var(--c-bg-muted)] px-1 py-0.5 font-mono text-xs">spectrawinery</code>{" "}
              from <code className="rounded bg-[var(--c-bg-muted)] px-1 py-0.5 font-mono text-xs">spectrawinery.admin.platform.commerce7.com</code>.
            </Check>
            <Check>
              <strong className="text-[var(--c-text-primary)]">Data requires real shopper traffic.</strong>{" "}
              Events only appear when someone actually visits your site and triggers a Cart Carrot
              or personalization block. Test it yourself — open your storefront, view a page with
              a Cart Carrot block, and check your dashboard 1–2 minutes later.
            </Check>
            <Check>
              <strong className="text-[var(--c-text-primary)]">Check your date range.</strong>{" "}
              Make sure the date range in your dashboard covers the time period you installed the
              snippet. New installs will have no data before the snippet went live.
            </Check>
          </ul>
        </Issue>

        <Issue title="Impressions are showing but no clicks">
          <ul className="space-y-2">
            <Check>
              <strong className="text-[var(--c-text-primary)]">Check the click event call.</strong>{" "}
              Your Cart Carrot or personalization block template needs a{" "}
              <code className="rounded bg-[var(--c-bg-muted)] px-1 py-0.5 font-mono text-xs">ccAnalytics.track('click', ...)</code>{" "}
              call wired to the click handler or button. If it's missing, clicks won't be recorded.
              See the{" "}
              <Link href="/docs/snippet" className="font-bold text-[var(--c-brand)] hover:underline">
                snippet guide
              </Link>.
            </Check>
            <Check>
              <strong className="text-[var(--c-text-primary)]">Confirm the event fires.</strong>{" "}
              Open the browser console and watch for network requests to{" "}
              <code className="rounded bg-[var(--c-bg-muted)] px-1 py-0.5 font-mono text-xs">/v1/events</code>{" "}
              when you click the block. If no request appears, the click handler is not calling{" "}
              <code className="rounded bg-[var(--c-bg-muted)] px-1 py-0.5 font-mono text-xs">ccAnalytics.track()</code>.
            </Check>
          </ul>
        </Issue>

        <Issue title="The per-block breakdown table is missing">
          <ul className="space-y-2">
            <Check>
              <strong className="text-[var(--c-text-primary)]">Include blockTitle in your events.</strong>{" "}
              The per-carrot and per-block breakdown reports only appear when your events include
              the <code className="rounded bg-[var(--c-bg-muted)] px-1 py-0.5 font-mono text-xs">blockTitle</code>{" "}
              property. Check your impression events and confirm they include it — e.g.{" "}
              <code className="rounded bg-[var(--c-bg-muted)] px-1 py-0.5 font-mono text-xs">{"{ blockTitle: 'Summer Reds' }"}</code>.
            </Check>
            <Check>
              <strong className="text-[var(--c-text-primary)]">Use consistent names.</strong>{" "}
              If the same carrot sends events with slightly different names (e.g. "Summer Reds" vs
              "summer reds"), they will appear as separate rows. Make sure the blockTitle value is
              exactly the same across impression, click, and add_to_cart events.
            </Check>
          </ul>
        </Issue>

        <Issue title="The numbers look too high or too low">
          <ul className="space-y-2">
            <Check>
              <strong className="text-[var(--c-text-primary)]">Check for duplicate impression calls.</strong>{" "}
              If your theme renders the same Cart Carrot block more than once on a page (e.g. in
              both a desktop and mobile layout that are hidden with CSS), both will fire the
              impression event. Make sure the call only fires once per visible block.
            </Check>
            <Check>
              <strong className="text-[var(--c-text-primary)]">Revenue is directional.</strong>{" "}
              Revenue numbers in the dashboard are estimates, not verified Commerce7 order totals.
              They are based on purchase events from the storefront collector. The trend is correct;
              the dollar amount is approximate until full order correlation is set up. Contact us if
              you need more precise attribution.
            </Check>
            <Check>
              <strong className="text-[var(--c-text-primary)]">Check the date range.</strong>{" "}
              The dashboard only shows data for the selected period. If you changed the range, the
              numbers will change accordingly.
            </Check>
          </ul>
        </Issue>

        <Issue title="I installed the app but haven't received a setup email">
          <p>
            Setup emails are sent within one business day of installation. Check your spam or
            junk folder first.
          </p>
          <p>
            If it's been longer than one business day and you have not received it, email us at{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="font-bold text-[var(--c-brand)] hover:underline">
              {SUPPORT_EMAIL}
            </a>{" "}
            with your Commerce7 winery name (Tenant ID) and we'll get you sorted.
          </p>
        </Issue>

        <Issue title="I can't access my dashboard">
          <ul className="space-y-2">
            <Check>
              <strong className="text-[var(--c-text-primary)]">Use the link from your setup email.</strong>{" "}
              Your dashboard URL includes your Tenant ID as a query parameter — it won't work
              without it. If you've lost the link, email us and we'll resend it.
            </Check>
            <Check>
              <strong className="text-[var(--c-text-primary)]">Check that the API is reachable.</strong>{" "}
              If you see an error like "Could not load analytics", the connection between your
              dashboard and the analytics API may have a problem. Email us with a screenshot of
              the error and we'll investigate.
            </Check>
          </ul>
        </Issue>

        <Issue title="Insights aren't appearing">
          <p>
            Insights require a minimum of{" "}
            <strong className="text-[var(--c-text-primary)]">25 shopper events and 5 observed purchases</strong>{" "}
            in the selected date range. If your store is newer or has lower traffic, keep collecting
            data — they'll appear automatically once the threshold is met.
          </p>
          <p>
            The current count is shown at the top-right of the Insights section:{" "}
            <em>"X observed purchases · Y shopper events"</em>. If purchases are at 0, check
            that you have a{" "}
            <code className="rounded bg-[var(--c-bg-muted)] px-1 py-0.5 font-mono text-xs">ccAnalytics.track('purchase', ...)</code>{" "}
            call on your order confirmation page.
          </p>
        </Issue>

      </div>

      {/* Contact */}
      <div className="mt-12 border border-[var(--c-border)] bg-[var(--c-bg-subtle)] p-6">
        <h2 className="text-base font-extrabold text-[var(--c-text-primary)]">Still stuck?</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--c-text-secondary)]">
          Email us at{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="font-bold text-[var(--c-brand)] hover:underline">
            {SUPPORT_EMAIL}
          </a>{" "}
          with:
        </p>
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm leading-6 text-[var(--c-text-secondary)]">
          <li>Your Commerce7 Tenant ID (winery name in the admin URL)</li>
          <li>A description of what you expected to happen and what happened instead</li>
          <li>A screenshot if something looks wrong in the dashboard or browser console</li>
        </ul>
        <p className="mt-4 text-sm text-[var(--c-text-secondary)]">
          We respond within one business day. No phone support.
        </p>
      </div>

      {/* Nav */}
      <div className="mt-8 border-t border-[var(--c-border)] pt-6">
        <Link
          href="/docs/getting-started"
          className="text-sm font-bold text-[var(--c-brand)] hover:underline"
        >
          ← Back to getting started
        </Link>
      </div>
    </article>
  );
}
