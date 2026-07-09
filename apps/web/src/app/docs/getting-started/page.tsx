import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Getting started — Cart Carrot Analytics Docs",
  description:
    "Install Cart Carrot Analytics from the Commerce7 App Store. Purchase tracking is automatic — no developer required.",
};

const SUPPORT_EMAIL = "eric.a.f.jacobsen@gmail.com";

function Step({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-5">
      <div className="flex-shrink-0">
        <div className="flex h-8 w-8 items-center justify-center border border-[var(--c-brand)] bg-[var(--c-brand)] text-sm font-extrabold text-white">
          {number}
        </div>
      </div>
      <div className="min-w-0 pb-10">
        <h3 className="text-base font-extrabold text-[var(--c-text-primary)]">{title}</h3>
        <div className="mt-3 space-y-3 text-sm leading-6 text-[var(--c-text-secondary)]">
          {children}
        </div>
      </div>
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-l-4 border-[var(--c-brand)] bg-[var(--c-brand-light)] px-4 py-3">
      <p className="text-sm leading-6 text-[var(--c-text-primary)]">{children}</p>
    </div>
  );
}

function AutoBadge() {
  return (
    <span className="ml-2 inline-block border border-[var(--c-green-border)] bg-[var(--c-green-bg)] px-2 py-0.5 text-xs font-bold text-[var(--c-green-text)]">
      Automatic
    </span>
  );
}

export default function GettingStartedPage() {
  return (
    <article className="max-w-2xl">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-xs text-[var(--c-text-muted)]">
        <Link href="/" className="hover:text-[var(--c-text-secondary)]">Home</Link>
        <span>/</span>
        <span className="text-[var(--c-text-secondary)]">Getting started</span>
      </nav>

      <h1 className="text-3xl font-extrabold tracking-tight text-[var(--c-text-primary)]">
        Getting started
      </h1>
      <p className="mt-4 text-base leading-7 text-[var(--c-text-secondary)]">
        Install the app and purchase tracking starts immediately — no developer, no code. Click and
        impression tracking takes about 5 minutes if your store has Google Tag Manager, or a single
        copy-paste if it doesn't.
      </p>

      {/* What you get out of the box */}
      <div className="mt-8 border border-[var(--c-border)] bg-[var(--c-bg-card)] p-5">
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-[var(--c-text-primary)]">
          What works the moment you install
        </h2>
        <ul className="mt-3 space-y-3 text-sm leading-6 text-[var(--c-text-secondary)]">
          <li className="flex items-start gap-2">
            <span className="mt-1 flex-shrink-0 text-[var(--c-green-text)] font-bold">✓</span>
            <span>
              <strong className="text-[var(--c-text-primary)]">Purchase tracking.</strong>{" "}
              Commerce7 automatically loads our tracking page on every order confirmation. Every
              completed order is recorded with no action from you.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 flex-shrink-0 text-[var(--c-green-text)] font-bold">✓</span>
            <span>
              <strong className="text-[var(--c-text-primary)]">Order sync.</strong>{" "}
              We pull your order history from Commerce7 in the background so we can cross-reference
              purchase counts.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 flex-shrink-0 text-[var(--c-amber-text)] font-bold">+</span>
            <span>
              <strong className="text-[var(--c-text-primary)]">Click and impression tracking</strong>{" "}
              (5 min setup — see Step 3 below). This is what powers the per-carrot breakdown and
              funnel reports.
            </span>
          </li>
        </ul>
      </div>

      {/* Steps */}
      <div className="mt-10 space-y-0">
        <Step number="1" title="Install from the Commerce7 App Store">
          <p>
            In your Commerce7 Admin, go to{" "}
            <strong className="text-[var(--c-text-primary)]">Apps → App Store</strong> and search
            for <em>Cart Carrot Analytics</em>. Click{" "}
            <strong className="text-[var(--c-text-primary)]">Install</strong>.
          </p>
          <p>
            Commerce7 will show you the data the app accesses — Order (read) and Webhook logs
            (read). Confirm, and the app is installed.
          </p>
          <Note>
            <strong>Purchase tracking starts immediately.</strong> Once installed, Commerce7
            automatically loads our tracking page on every order confirmation — nothing else needed
            for purchases.
          </Note>
        </Step>

        <Step number="2" title={`Your dashboard is ready`}>
          <p>
            Within one business day of your install, you will receive an email from{" "}
            <strong className="text-[var(--c-text-primary)]">{SUPPORT_EMAIL}</strong> with your
            dashboard link and your click-tracking setup instructions.
          </p>
          <p>
            You can open your dashboard right away — it will show purchase data from your very
            first order after install.
          </p>
          <p>
            If you haven't heard from us after one business day, check spam or{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="font-bold text-[var(--c-brand)] hover:underline">
              email us
            </a>.
          </p>
        </Step>

        <Step number="3" title="Add click and impression tracking (5 min)">
          <p>
            Purchase tracking is automatic. To also see which Cart Carrot promotions shoppers are
            clicking and how many are seeing them, you need one of the following — pick whichever
            fits your store:
          </p>

          {/* Option A: GTM */}
          <div className="border border-[var(--c-green-border)] bg-[var(--c-green-bg)] p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--c-green-text)]">
              Option A — Google Tag Manager (recommended · ~5 minutes)
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--c-text-primary)]">
              If your store already has GTM installed, you can do this yourself — no developer
              needed. Add a Custom HTML tag with the snippet we send you. Set the trigger to
              All Pages. That's it.
            </p>
            <p className="mt-2 text-xs text-[var(--c-text-secondary)]">
              Not sure if you have GTM? Open your storefront, right-click → View Page Source, and
              search for <code className="rounded bg-[var(--c-bg-muted)] px-1 font-mono">GTM-</code>.
              If you see it, you have GTM.
            </p>
          </div>

          {/* Option B: Theme */}
          <div className="border border-[var(--c-border)] bg-[var(--c-bg-subtle)] p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--c-text-label)]">
              Option B — No GTM (one line of code · ~2 minutes)
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--c-text-primary)]">
              We send you a single{" "}
              <code className="rounded bg-[var(--c-bg-muted)] px-1 py-0.5 font-mono text-xs">{"<script>"}</code>{" "}
              tag to paste before the closing{" "}
              <code className="rounded bg-[var(--c-bg-muted)] px-1 py-0.5 font-mono text-xs">{"</head>"}</code>{" "}
              in your Commerce7 theme. Your web person (or you) can do this in a couple of minutes.
              Many Commerce7 stores have a Custom Code field in Admin where you can paste it without
              touching any files — check{" "}
              <strong className="text-[var(--c-text-primary)]">Admin → Customize → Custom Code</strong>{" "}
              first.
            </p>
          </div>

          <Note>
            Your setup email tells you exactly which option applies to your store and includes
            the ready-to-paste code. You don't need to figure this out before installing.
          </Note>
        </Step>

        <Step number="4" title="See impressions and clicks appear">
          <p>
            Once the click tracking is in place, open your dashboard. Interact with a Cart Carrot
            block on your storefront — an impression should appear in the dashboard within 1–2
            minutes.
          </p>
          <p>
            <strong className="text-[var(--c-text-primary)]">Insights</strong> (strategy
            recommendations) appear once your store has at least 25 shopper events and 5 observed
            purchases — typically 1–2 weeks of normal traffic.
          </p>
        </Step>
      </div>

      {/* Next steps */}
      <div className="mt-4 border border-[var(--c-border)] bg-[var(--c-bg-subtle)] p-5">
        <h2 className="text-sm font-extrabold text-[var(--c-text-primary)]">Next steps</h2>
        <div className="mt-4 space-y-3">
          <Link
            href="/docs/snippet"
            className="flex items-center justify-between border border-[var(--c-border)] bg-[var(--c-bg-card)] p-4 hover:bg-[var(--c-bg-muted)]"
          >
            <div>
              <p className="text-sm font-bold text-[var(--c-text-primary)]">Click tracking setup</p>
              <p className="mt-1 text-xs text-[var(--c-text-secondary)]">
                GTM tag, theme snippet, and event reference
              </p>
            </div>
            <span className="ml-4 flex-shrink-0 text-[var(--c-text-muted)]">→</span>
          </Link>
          <Link
            href="/docs/dashboard"
            className="flex items-center justify-between border border-[var(--c-border)] bg-[var(--c-bg-card)] p-4 hover:bg-[var(--c-bg-muted)]"
          >
            <div>
              <p className="text-sm font-bold text-[var(--c-text-primary)]">Reading your dashboard</p>
              <p className="mt-1 text-xs text-[var(--c-text-secondary)]">
                What every number means and how to act on it
              </p>
            </div>
            <span className="ml-4 flex-shrink-0 text-[var(--c-text-muted)]">→</span>
          </Link>
        </div>
      </div>

      {/* Support */}
      <div className="mt-10 border-t border-[var(--c-border)] pt-8">
        <p className="text-sm text-[var(--c-text-secondary)]">
          Something not right?{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="font-bold text-[var(--c-brand)] hover:underline">
            Email us
          </a>{" "}
          — we respond within one business day. You can also check the{" "}
          <Link href="/docs/troubleshooting" className="font-bold text-[var(--c-brand)] hover:underline">
            troubleshooting guide
          </Link>.
        </p>
      </div>
    </article>
  );
}
