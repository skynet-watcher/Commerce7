import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Reading your dashboard — Cart Carrot Analytics Docs",
  description:
    "A plain-language guide to every section of the Cart Carrot Analytics dashboard.",
};

const SUPPORT_EMAIL = "eric.a.f.jacobsen@gmail.com";

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mt-12 scroll-mt-24">
      <h2 className="text-xl font-extrabold text-[var(--c-text-primary)]">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function FieldRow({ name, what }: { name: string; what: string }) {
  return (
    <tr className="border-t border-[var(--c-border)] align-top">
      <td className="px-4 py-3 font-mono text-xs font-bold text-[var(--c-text-primary)]">{name}</td>
      <td className="px-4 py-3 text-sm leading-6 text-[var(--c-text-secondary)]">{what}</td>
    </tr>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-l-4 border-[var(--c-brand)] bg-[var(--c-brand-light)] px-4 py-3">
      <p className="text-sm leading-6 text-[var(--c-text-primary)]">{children}</p>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <article className="max-w-2xl">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-xs text-[var(--c-text-muted)]">
        <Link href="/" className="hover:text-[var(--c-text-secondary)]">Home</Link>
        <span>/</span>
        <Link href="/docs/getting-started" className="hover:text-[var(--c-text-secondary)]">Docs</Link>
        <span>/</span>
        <span className="text-[var(--c-text-secondary)]">Reading your dashboard</span>
      </nav>

      <h1 className="text-3xl font-extrabold tracking-tight text-[var(--c-text-primary)]">
        Reading your dashboard
      </h1>
      <p className="mt-4 text-base leading-7 text-[var(--c-text-secondary)]">
        A plain-language guide to every section of your Cart Carrot Analytics dashboard — what
        each number means, what "directional" means, and how to use the Insights feature.
      </p>

      {/* Table of contents */}
      <div className="mt-8 border border-[var(--c-border)] bg-[var(--c-bg-subtle)] p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--c-text-muted)]">On this page</p>
        <ul className="mt-3 space-y-2 text-sm">
          {[
            ["#date-range", "Choosing a date range"],
            ["#surface-performance", "Surface performance table"],
            ["#cart-carrot-breakdown", "Cart Carrot breakdown"],
            ["#personalization-breakdown", "Personalization block breakdown"],
            ["#behavior-funnel", "Behavior funnel"],
            ["#attribution-health", "Attribution health"],
            ["#insights", "Insights"],
            ["#running-strategies", "Running strategies"],
          ].map(([href, label]) => (
            <li key={href}>
              <a href={href} className="text-[var(--c-brand)] hover:underline">{label}</a>
            </li>
          ))}
        </ul>
      </div>

      {/* Sections */}
      <Section id="date-range" title="Choosing a date range">
        <p className="text-sm leading-6 text-[var(--c-text-secondary)]">
          At the top of the dashboard, select a date range — Last 7 days, Last 30 days, Last 90 days,
          or a custom range. Click <strong className="text-[var(--c-text-primary)]">Refresh</strong> to
          load data for the selected period.
        </p>
        <p className="text-sm leading-6 text-[var(--c-text-secondary)]">
          All numbers in the report — impressions, clicks, purchases, revenue — are for that date
          range only. Changing the range resets the report.
        </p>
        <Callout>
          Start with Last 30 days. That's usually enough data for a reliable read on how your
          promotions are performing. Switch to Last 7 days to check a recent change.
        </Callout>
      </Section>

      <Section id="surface-performance" title="Surface performance table">
        <p className="text-sm leading-6 text-[var(--c-text-secondary)]">
          This table is the main report. Each row is a content surface — Cart Carrot or
          Personalization blocks. Columns show the full funnel from view to purchase.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[var(--c-border)] bg-[var(--c-bg-subtle)]">
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-[var(--c-text-label)]">Column</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-[var(--c-text-label)]">What it means</th>
              </tr>
            </thead>
            <tbody>
              <FieldRow name="Revenue" what="The estimated revenue influenced by this surface. This is directional — see Attribution health below for what that means." />
              <FieldRow name="Impressions" what="The number of times shoppers saw this surface (a Cart Carrot block appeared on their screen)." />
              <FieldRow name="Click-through rate" what="Clicks ÷ Impressions. How many shoppers who saw the block actually clicked it. A rate below 5% usually means the offer or message needs work." />
              <FieldRow name="Add-to-cart rate" what="Adds ÷ Clicks. How many shoppers who clicked actually added the item to their cart. Below 20% often means a mismatch between the click promise and the product landing." />
              <FieldRow name="Conversion rate" what="Purchases ÷ Clicks. The end-to-end metric: of everyone who clicked, how many bought." />
              <FieldRow name="Revenue per 1,000 views" what="A normalized metric for comparing surfaces that get very different traffic volumes. Higher is better." />
              <FieldRow name="Data quality" what="Directional means the purchase count is from storefront events, not yet verified against Commerce7 order records. Use as a trend signal." />
              <FieldRow name="Recommended next test" what="A suggestion based on this surface's current performance. Acts as a starting point — not a rule." />
            </tbody>
          </table>
        </div>
        <p className="text-sm leading-6 text-[var(--c-text-secondary)]">
          If your store has enough session data, a{" "}
          <strong className="text-[var(--c-text-primary)]">Site average</strong> row appears at
          the bottom — this is the overall conversion rate across all sessions, including shoppers
          who never saw any dynamic content. It's your baseline: a surface converting above site
          average is adding lift.
        </p>
      </Section>

      <Section id="cart-carrot-breakdown" title="Cart Carrot breakdown">
        <p className="text-sm leading-6 text-[var(--c-text-secondary)]">
          Below the surface table, if you've included <code className="rounded bg-[var(--c-bg-muted)] px-1 py-0.5 font-mono text-xs">blockTitle</code>{" "}
          in your Cart Carrot events, this section appears. Each row is one carrot, ranked by
          add-to-cart rate.
        </p>
        <p className="text-sm leading-6 text-[var(--c-text-secondary)]">
          The <strong className="text-[var(--c-text-primary)]">vs. carrot average</strong> column
          shows how each individual carrot is performing against the average across all your carrots —
          a <span className="font-bold text-[var(--c-green-text)]">+12pts</span> badge means that
          carrot's add-to-cart rate is 12 percentage points above average.
        </p>
        <Callout>
          This is the report that shows you which carrots are earning their placements. If a carrot
          has strong impressions but is below average, it's a candidate to replace or rewrite.
        </Callout>
        <p className="text-sm leading-6 text-[var(--c-text-secondary)]">
          If the breakdown doesn't appear, check that you're including{" "}
          <code className="rounded bg-[var(--c-bg-muted)] px-1 py-0.5 font-mono text-xs">blockTitle</code>{" "}
          in your Cart Carrot event calls. See the{" "}
          <Link href="/docs/snippet" className="font-bold text-[var(--c-brand)] hover:underline">
            tracking snippet guide
          </Link>.
        </p>
      </Section>

      <Section id="personalization-breakdown" title="Personalization block breakdown">
        <p className="text-sm leading-6 text-[var(--c-text-secondary)]">
          Same structure as the Cart Carrot breakdown, but for personalization blocks. Each row is
          one block, ranked by add-to-cart rate with a comparison against the average across all blocks.
        </p>
        <p className="text-sm leading-6 text-[var(--c-text-secondary)]">
          Include <code className="rounded bg-[var(--c-bg-muted)] px-1 py-0.5 font-mono text-xs">blockTitle</code>{" "}
          in your personalization block events to populate this section.
        </p>
      </Section>

      <Section id="behavior-funnel" title="Behavior funnel">
        <p className="text-sm leading-6 text-[var(--c-text-secondary)]">
          The funnel shows the full shopper journey for the selected date range: Impressions →
          Clicks → Add to cart → Checkout → Purchases. Each bar is proportional to the step above it.
        </p>
        <p className="text-sm leading-6 text-[var(--c-text-secondary)]">
          A sharp drop between any two steps is where you're losing shoppers. Common patterns:
        </p>
        <ul className="list-inside list-disc space-y-2 text-sm leading-6 text-[var(--c-text-secondary)]">
          <li><strong className="text-[var(--c-text-primary)]">Big drop at Clicks:</strong> The block is visible but not compelling. Test the message or offer.</li>
          <li><strong className="text-[var(--c-text-primary)]">Big drop at Add to cart:</strong> The click promised something the product page didn't deliver. Check the pairing or the price.</li>
          <li><strong className="text-[var(--c-text-primary)]">Big drop at Checkout:</strong> Possible friction at checkout — shipping threshold, club signup requirement, or form friction.</li>
        </ul>
      </Section>

      <Section id="attribution-health" title="Attribution health">
        <p className="text-sm leading-6 text-[var(--c-text-secondary)]">
          This panel shows two numbers: Attributed purchases and Unattributed orders.
        </p>
        <p className="text-sm leading-6 text-[var(--c-text-secondary)]">
          <strong className="text-[var(--c-text-primary)]">Attributed</strong> — purchase events
          captured from shoppers who interacted with a Cart Carrot or personalization block before
          buying.
        </p>
        <p className="text-sm leading-6 text-[var(--c-text-secondary)]">
          <strong className="text-[var(--c-text-primary)]">Unattributed</strong> — orders in your
          Commerce7 store with no matching dynamic content event. These are shoppers who found the
          product on their own.
        </p>
        <div className="border border-[var(--c-amber-border)] bg-[var(--c-amber-bg)] px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--c-amber-text)]">⚠ What "Directional" means</p>
          <p className="mt-2 text-sm leading-6 text-[var(--c-text-primary)]">
            Revenue and purchase numbers in the dashboard are{" "}
            <strong>directional</strong> — they come from storefront events and have not yet been
            matched one-to-one against Commerce7 order records. The trend is reliable from the
            first week. Treat dollar amounts as estimates until you contact us to set up full order
            correlation for your store.
          </p>
        </div>
      </Section>

      <Section id="insights" title="Insights">
        <p className="text-sm leading-6 text-[var(--c-text-secondary)]">
          The Insights section appears once your store has accumulated enough activity —
          at least 25 shopper events and 5 observed purchases in the selected date range.
        </p>
        <p className="text-sm leading-6 text-[var(--c-text-secondary)]">
          Each insight card has three parts:
        </p>
        <ul className="list-inside list-disc space-y-2 text-sm leading-6 text-[var(--c-text-secondary)]">
          <li><strong className="text-[var(--c-text-primary)]">Observation:</strong> What the data is showing right now.</li>
          <li><strong className="text-[var(--c-text-primary)]">Try this:</strong> A specific, actionable change to make in Commerce7.</li>
          <li><strong className="text-[var(--c-text-primary)]">Confidence:</strong> Medium (25+ events, 5+ purchases) or High (100+ events, 20+ purchases). Higher confidence means the recommendation is based on a larger sample.</li>
        </ul>
        <p className="text-sm leading-6 text-[var(--c-text-secondary)]">
          Click <strong className="text-[var(--c-text-primary)]">Try this strategy</strong> to log a
          strategy brief. The dashboard snapshots your current metrics as a baseline — this is how it
          tracks progress while your strategy runs.
        </p>
        <Callout>
          Make only one change at a time. If you change multiple placements or offers simultaneously,
          you won't know which change caused the result.
        </Callout>
      </Section>

      <Section id="running-strategies" title="Running strategies">
        <p className="text-sm leading-6 text-[var(--c-text-secondary)]">
          When you click "Try this strategy" on an insight, a{" "}
          <strong className="text-[var(--c-text-primary)]">Running strategy</strong> card appears.
          It shows:
        </p>
        <ul className="list-inside list-disc space-y-2 text-sm leading-6 text-[var(--c-text-secondary)]">
          <li>The observation and suggestion that prompted the strategy</li>
          <li>New events and purchases since the strategy started</li>
          <li>A review date — when to check back and decide whether to keep or revert the change</li>
          <li>An early result summary comparing current rates against your starting baseline</li>
        </ul>
        <p className="text-sm leading-6 text-[var(--c-text-secondary)]">
          To end a strategy, click{" "}
          <strong className="text-[var(--c-text-primary)]">Clear this strategy</strong>. This removes
          the strategy card but leaves all your analytics data intact.
        </p>
        <p className="text-sm leading-6 text-[var(--c-text-secondary)]">
          Strategies are stored in your browser. They'll be there the next time you open the
          dashboard on the same device.
        </p>
      </Section>

      {/* Footer */}
      <div className="mt-12 flex flex-wrap gap-3 border-t border-[var(--c-border)] pt-8">
        <Link
          href="/docs/troubleshooting"
          className="border border-[var(--c-border)] bg-[var(--c-bg-subtle)] px-5 py-2 text-sm font-bold text-[var(--c-text-primary)] hover:bg-[var(--c-bg-muted)]"
        >
          Troubleshooting →
        </Link>
      </div>

      <div className="mt-8 border-t border-[var(--c-border)] pt-6">
        <p className="text-sm text-[var(--c-text-secondary)]">
          Something doesn't look right?{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="font-bold text-[var(--c-brand)] hover:underline">
            Email us
          </a>{" "}
          and describe what you're seeing — we'll take a look.
        </p>
      </div>
    </article>
  );
}
