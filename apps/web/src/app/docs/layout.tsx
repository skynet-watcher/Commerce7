import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Docs — Cart Carrot Analytics",
  description: "Setup guides and reference for Cart Carrot Analytics by Chat Through Automations.",
};

const NAV = [
  { href: "/docs/getting-started", label: "Getting started" },
  { href: "/docs/snippet", label: "Click tracking setup" },
  { href: "/docs/dashboard", label: "Reading your dashboard" },
  { href: "/docs/troubleshooting", label: "Troubleshooting" },
];

const SUPPORT_EMAIL = "eric.a.f.jacobsen@gmail.com";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--c-bg-page)] text-[var(--c-text-primary)]">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-[var(--c-border)] bg-[var(--c-bg-card)]/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 no-underline">
              <span className="inline-block h-7 w-7 rounded-sm bg-[var(--c-brand)] text-center text-sm font-black leading-7 text-white">
                C
              </span>
              <span className="text-sm font-bold text-[var(--c-text-primary)]">
                Cart Carrot Analytics
              </span>
            </Link>
            <span className="hidden text-[var(--c-border)] sm:block">/</span>
            <span className="hidden text-sm text-[var(--c-text-secondary)] sm:block">Docs</span>
          </div>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-sm font-medium text-[var(--c-text-secondary)] hover:text-[var(--c-text-primary)]"
          >
            Support
          </a>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-0 px-0 lg:px-6 lg:py-10">
        {/* Sidebar */}
        <nav className="hidden w-56 flex-shrink-0 lg:block">
          <div className="sticky top-24 space-y-1">
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-widest text-[var(--c-text-muted)]">
              Documentation
            </p>
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-none px-3 py-2 text-sm font-medium text-[var(--c-text-secondary)] transition-colors hover:bg-[var(--c-bg-muted)] hover:text-[var(--c-text-primary)]"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-6 border-t border-[var(--c-border)] pt-6">
              <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-widest text-[var(--c-text-muted)]">
                Support
              </p>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="block px-3 py-2 text-sm font-medium text-[var(--c-brand)] hover:underline"
              >
                Email us →
              </a>
            </div>
          </div>
        </nav>

        {/* Mobile nav — horizontal strip */}
        <div className="block w-full border-b border-[var(--c-border)] bg-[var(--c-bg-card)] px-4 py-3 lg:hidden">
          <div className="flex gap-1 overflow-x-auto">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-[var(--c-text-secondary)] hover:bg-[var(--c-bg-muted)] hover:text-[var(--c-text-primary)]"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Content */}
        <main className="min-w-0 flex-1 px-6 py-8 lg:py-0 lg:pl-12">
          {children}
        </main>
      </div>
    </div>
  );
}
