import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Click tracking setup — Cart Carrot Analytics Docs",
  description:
    "Set up click and impression tracking for Cart Carrot Analytics. GTM option takes about 5 minutes — no developer required.",
};

const SUPPORT_EMAIL = "eric.a.f.jacobsen@gmail.com";

function CodeBlock({ code, label }: { code: string; label?: string }) {
  return (
    <div className="mt-3">
      {label ? (
        <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[var(--c-text-muted)]">
          {label}
        </p>
      ) : null}
      <pre className="overflow-x-auto rounded-none border border-[var(--c-border)] bg-[var(--c-bg-muted)] p-4 font-mono text-xs leading-relaxed text-[var(--c-text-primary)]">
        <code>{code.trim()}</code>
      </pre>
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 border-l-4 border-[var(--c-brand)] bg-[var(--c-brand-light)] px-4 py-3">
      <div className="text-sm leading-6 text-[var(--c-text-primary)]">{children}</div>
    </div>
  );
}

const BASE_SNIPPET = `<!-- Cart Carrot Analytics — click & impression tracking -->
<script>
(function(tenantId, collectorUrl) {
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }
  function send(name, surface, extra) {
    var payload = JSON.stringify({
      tenantId: tenantId,
      clientEventId: surface + ':' + name + ':' + uid(),
      name: name,
      properties: Object.assign({ surface: surface }, extra || {})
    });
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(collectorUrl, new Blob([payload], { type: 'application/json' }));
      } else {
        fetch(collectorUrl, {
          method: 'POST',
          body: payload,
          headers: { 'Content-Type': 'application/json' },
          keepalive: true
        });
      }
    } catch (_) {}
  }
  window.ccAnalytics = { track: send };
})('YOUR_TENANT_ID', 'https://YOUR_API_DOMAIN/v1/events');
</script>`;

const CART_CARROT_IMPRESSION = `ccAnalytics.track('impression', 'cart_carrot', {
  blockTitle: 'Summer Reds',           // The name you gave this carrot in Commerce7
  recommendedProductSku: 'WINE-001'   // SKU of the recommended wine (optional but recommended)
});`;

const CART_CARROT_CLICK = `ccAnalytics.track('click', 'cart_carrot', {
  blockTitle: 'Summer Reds'
});`;

const CART_CARROT_ADD = `ccAnalytics.track('add_to_cart', 'cart_carrot', {
  blockTitle: 'Summer Reds'
});`;

const PERSONALIZATION_IMPRESSION = `ccAnalytics.track('impression', 'personalization_block', {
  blockTitle: 'Club Member Upsell'    // The name of your personalization block
});`;

const PERSONALIZATION_CLICK = `ccAnalytics.track('click', 'personalization_block', {
  blockTitle: 'Club Member Upsell'
});`;

const PERSONALIZATION_ADD = `ccAnalytics.track('add_to_cart', 'personalization_block', {
  blockTitle: 'Club Member Upsell'
});`;

const VERIFY_SNIPPET = `// Open the browser console on your live storefront and run:
typeof window.ccAnalytics
// Should return: "object"`;

export default function SnippetPage() {
  return (
    <article className="max-w-2xl">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-xs text-[var(--c-text-muted)]">
        <Link href="/" className="hover:text-[var(--c-text-secondary)]">Home</Link>
        <span>/</span>
        <Link href="/docs/getting-started" className="hover:text-[var(--c-text-secondary)]">Docs</Link>
        <span>/</span>
        <span className="text-[var(--c-text-secondary)]">Click tracking setup</span>
      </nav>

      <h1 className="text-3xl font-extrabold tracking-tight text-[var(--c-text-primary)]">
        Click tracking setup
      </h1>
      <p className="mt-4 text-base leading-7 text-[var(--c-text-secondary)]">
        Purchase tracking is fully automatic — Commerce7 loads our receipt page on every order
        confirmation without any code from you. This page covers the optional click and impression
        tracking that powers the per-carrot breakdown and funnel reports.
      </p>

      {/* What's automatic */}
      <div className="mt-8 border border-[var(--c-border)] bg-[var(--c-bg-card)] p-5">
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-[var(--c-text-primary)]">
          Already working — nothing to set up
        </h2>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--c-text-secondary)]">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 flex-shrink-0 font-bold text-[var(--c-green-text)]">✓</span>
            <span>
              <strong className="text-[var(--c-text-primary)]">Purchase tracking.</strong>{" "}
              Commerce7 automatically loads our iFrame on every order confirmation. Every completed
              order is recorded — no code, no theme edits required.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 flex-shrink-0 font-bold text-[var(--c-green-text)]">✓</span>
            <span>
              <strong className="text-[var(--c-text-primary)]">Order sync.</strong>{" "}
              We pull your order history from Commerce7 in the background to cross-reference
              purchase counts.
            </span>
          </li>
        </ul>
        <p className="mt-4 text-sm text-[var(--c-text-secondary)]">
          The steps below add <strong className="text-[var(--c-text-primary)]">impression and click tracking</strong> —
          what lets you see how many shoppers saw each Cart Carrot or personalization block, and how
          many clicked it.
        </p>
      </div>

      {/* Step 1: Load the snippet */}
      <h2 className="mt-10 text-xl font-extrabold text-[var(--c-text-primary)]">
        Step 1 — Load the tracking snippet
      </h2>
      <p className="mt-3 text-sm leading-6 text-[var(--c-text-secondary)]">
        The snippet adds a small global function —{" "}
        <code className="rounded bg-[var(--c-bg-muted)] px-1 py-0.5 font-mono text-xs">window.ccAnalytics.track()</code>{" "}
        — to your storefront. Pick whichever method fits your store:
      </p>

      {/* Option A: GTM */}
      <div className="mt-5 border border-[var(--c-green-border)] bg-[var(--c-green-bg)] p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--c-green-text)]">
          Option A — Google Tag Manager (recommended · ~5 minutes · no developer)
        </p>
        <p className="mt-3 text-sm leading-6 text-[var(--c-text-primary)]">
          If your store already has GTM installed, you can add click tracking yourself — no developer
          or theme access needed.
        </p>
        <ol className="mt-4 space-y-3 text-sm leading-6 text-[var(--c-text-secondary)]">
          <li className="flex gap-3">
            <span className="flex-shrink-0 font-bold text-[var(--c-text-primary)]">1.</span>
            <span>
              In your GTM workspace, click{" "}
              <strong className="text-[var(--c-text-primary)]">Tags → New → Custom HTML</strong>.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 font-bold text-[var(--c-text-primary)]">2.</span>
            <span>
              Paste the snippet below (your setup email has a version with your real values
              pre-filled). Set the trigger to{" "}
              <strong className="text-[var(--c-text-primary)]">All Pages</strong>.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 font-bold text-[var(--c-text-primary)]">3.</span>
            <span>
              Click <strong className="text-[var(--c-text-primary)]">Save</strong> then{" "}
              <strong className="text-[var(--c-text-primary)]">Submit</strong> to publish.
            </span>
          </li>
        </ol>
        <p className="mt-4 text-xs text-[var(--c-text-secondary)]">
          Not sure if you have GTM? Open your storefront, right-click → View Page Source, and search
          for <code className="rounded bg-[var(--c-bg-muted)] px-1 font-mono">GTM-</code>.
          If you see a tag ID starting with those letters, you have GTM.
        </p>
      </div>

      {/* Option B: No GTM */}
      <div className="mt-3 border border-[var(--c-border)] bg-[var(--c-bg-subtle)] p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--c-text-label)]">
          Option B — No GTM (paste directly into your theme · ~2 minutes)
        </p>
        <p className="mt-3 text-sm leading-6 text-[var(--c-text-primary)]">
          Paste the snippet before the closing{" "}
          <code className="rounded bg-[var(--c-bg-muted)] px-1 py-0.5 font-mono text-xs">{"</head>"}</code>{" "}
          tag in your Commerce7 theme.
        </p>
        <p className="mt-2 text-sm leading-6 text-[var(--c-text-secondary)]">
          Many Commerce7 stores have a Custom Code field — check{" "}
          <strong className="text-[var(--c-text-primary)]">Admin → Customize → Custom Code</strong>{" "}
          first. If that field is there, paste it in and save — done, no theme files to edit.
        </p>
      </div>

      {/* The snippet itself */}
      <CodeBlock code={BASE_SNIPPET} label="Snippet — paste in GTM Custom HTML tag or before </head>" />

      <Note>
        Your setup email from us includes a version of this snippet with{" "}
        <code className="font-mono text-xs">YOUR_TENANT_ID</code> and{" "}
        <code className="font-mono text-xs">YOUR_API_DOMAIN</code> already filled in. Use that
        one — you don't need to find these values yourself.
      </Note>

      <p className="mt-4 text-sm leading-6 text-[var(--c-text-secondary)]">
        If you need your Tenant ID, it is the first segment of your Commerce7 admin URL. For
        example:{" "}
        <code className="rounded bg-[var(--c-bg-muted)] px-1 font-mono text-xs">spectrawinery</code>{" "}
        from{" "}
        <code className="rounded bg-[var(--c-bg-muted)] px-1 font-mono text-xs">
          spectrawinery.admin.platform.commerce7.com
        </code>.
      </p>

      {/* Step 2: Cart Carrot events */}
      <h2 className="mt-10 text-xl font-extrabold text-[var(--c-text-primary)]">
        Step 2 — Add event calls to your Cart Carrot templates
      </h2>
      <p className="mt-3 text-sm leading-6 text-[var(--c-text-secondary)]">
        Once the snippet is loaded on every page, you need to call{" "}
        <code className="rounded bg-[var(--c-bg-muted)] px-1 py-0.5 font-mono text-xs">ccAnalytics.track()</code>{" "}
        from your Cart Carrot block templates. This is what powers the per-carrot breakdown report —
        without these calls, purchases are still tracked but the funnel won't show impressions or
        clicks.
      </p>
      <p className="mt-3 text-sm leading-6 text-[var(--c-text-secondary)]">
        The{" "}
        <code className="rounded bg-[var(--c-bg-muted)] px-1 py-0.5 font-mono text-xs">blockTitle</code>{" "}
        value must match the name of the carrot exactly as you set it in Commerce7 — this is how
        the per-block breakdown knows which row belongs to which carrot. Use the same value for
        impression, click, and add_to_cart.
      </p>

      <CodeBlock code={CART_CARROT_IMPRESSION} label="When the Cart Carrot block renders (shopper sees it)" />
      <CodeBlock code={CART_CARROT_CLICK} label="When the shopper clicks the recommendation" />
      <CodeBlock code={CART_CARROT_ADD} label="When the shopper adds the recommended product to cart" />

      <Note>
        <code className="font-mono text-xs">recommendedProductSku</code> is optional but recommended —
        it powers the "Recommended wine" column in your Cart Carrot breakdown so you can see which
        specific products are driving add-to-cart activity.
      </Note>

      {/* Step 3: Personalization block events */}
      <h2 className="mt-10 text-xl font-extrabold text-[var(--c-text-primary)]">
        Step 3 — Add event calls to your personalization block templates
      </h2>
      <p className="mt-3 text-sm leading-6 text-[var(--c-text-secondary)]">
        For each personalization block, add the same three calls. Use the block's name in Commerce7
        as the <code className="rounded bg-[var(--c-bg-muted)] px-1 py-0.5 font-mono text-xs">blockTitle</code>.
      </p>

      <CodeBlock code={PERSONALIZATION_IMPRESSION} label="On impression" />
      <CodeBlock code={PERSONALIZATION_CLICK} label="On click" />
      <CodeBlock code={PERSONALIZATION_ADD} label="On add to cart" />

      {/* Step 4: Verify */}
      <h2 className="mt-10 text-xl font-extrabold text-[var(--c-text-primary)]">
        Step 4 — Verify the snippet loaded
      </h2>
      <p className="mt-3 text-sm leading-6 text-[var(--c-text-secondary)]">
        After publishing your changes (GTM submit or theme save), open your storefront in a browser.
        Open the developer console (F12 → Console) and run:
      </p>
      <CodeBlock code={VERIFY_SNIPPET} />
      <p className="mt-3 text-sm leading-6 text-[var(--c-text-secondary)]">
        If it returns{" "}
        <code className="rounded bg-[var(--c-bg-muted)] px-1 py-0.5 font-mono text-xs">"object"</code>,
        the snippet is loaded and ready. Interact with a Cart Carrot block on your storefront —
        an impression should appear in your dashboard within 1–2 minutes.
      </p>
      <p className="mt-3 text-sm leading-6 text-[var(--c-text-secondary)]">
        If it returns{" "}
        <code className="rounded bg-[var(--c-bg-muted)] px-1 py-0.5 font-mono text-xs">"undefined"</code>,
        the snippet didn't load. Re-check that you published the GTM container or saved the
        theme change.
      </p>

      {/* Event reference */}
      <h2 className="mt-10 text-xl font-extrabold text-[var(--c-text-primary)]">
        Event reference
      </h2>
      <p className="mt-3 text-sm leading-6 text-[var(--c-text-secondary)]">
        Every call to{" "}
        <code className="rounded bg-[var(--c-bg-muted)] px-1 py-0.5 font-mono text-xs">
          ccAnalytics.track(name, surface, properties)
        </code>{" "}
        takes three arguments:
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--c-border)] bg-[var(--c-bg-subtle)]">
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-[var(--c-text-label)]">Argument</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-[var(--c-text-label)]">Values</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-[var(--c-text-label)]">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--c-border)]">
            {[
              ["name", "impression · click · add_to_cart", "The funnel step being tracked (purchase is automatic via receipt iFrame)"],
              ["surface", "cart_carrot · personalization_block", "Which type of content triggered the event"],
              ["blockTitle", "Any string", "Name of the carrot or block. Keep it consistent — used in per-block breakdown reports"],
              ["recommendedProductSku", "Any string (optional)", "Cart Carrot only. The SKU of the recommended wine"],
            ].map(([arg, values, notes]) => (
              <tr key={arg} className="align-top">
                <td className="px-4 py-3 font-mono text-xs text-[var(--c-text-primary)]">{arg}</td>
                <td className="px-4 py-3 text-xs text-[var(--c-text-secondary)]">{values}</td>
                <td className="px-4 py-3 text-xs text-[var(--c-text-secondary)]">{notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Next */}
      <div className="mt-10 flex flex-wrap gap-3 border-t border-[var(--c-border)] pt-8">
        <Link
          href="/docs/dashboard"
          className="border border-[var(--c-brand)] bg-[var(--c-brand)] px-5 py-2 text-sm font-bold text-white hover:bg-[var(--c-brand-hover)]"
        >
          Read the dashboard guide →
        </Link>
        <Link
          href="/docs/troubleshooting"
          className="border border-[var(--c-border)] bg-[var(--c-bg-subtle)] px-5 py-2 text-sm font-bold text-[var(--c-text-primary)] hover:bg-[var(--c-bg-muted)]"
        >
          Troubleshooting
        </Link>
      </div>

      <div className="mt-8 border-t border-[var(--c-border)] pt-6">
        <p className="text-sm text-[var(--c-text-secondary)]">
          Need help with the setup?{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="font-bold text-[var(--c-brand)] hover:underline">
            Email us
          </a>{" "}
          — we respond within one business day.
        </p>
      </div>
    </article>
  );
}
