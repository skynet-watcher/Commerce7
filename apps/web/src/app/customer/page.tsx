const scanItems = [
  ["Cart Carrots", "None found", "Create the first carrot"],
  ["Shipping promotion", "Found", "Use the bottle threshold"],
  ["Club members", "Available", "Can target club buyers"],
  ["Personalization blocks", "Not installed", "Prepare a designer handoff"],
];

const recommendation = {
  title: "Free shipping nudge",
  feature: "Cart Carrot",
  type: "General Content",
  location: "Top of Side Cart",
  message: "Add 1 more bottle to receive free shipping on your order.",
  reason:
    "The simplest useful first move is a cart message tied to an existing shipping promotion. It is easy for the winery to understand and easy for shoppers to act on.",
  conditions: ["Cart Item Count is at least 1", "Cart Item Count is 5 or fewer"],
};

const setupSteps = [
  "Create Cart Carrot",
  "Choose Top of Side Cart",
  "Use General Content",
  "Add bottle-count conditions",
  "Save as inactive draft until confirmed",
];

const journeyPlan = [
  ["Anonymous", "Welcome message + starter collection"],
  ["First-time buyer", "Repeat-purchase recommendation"],
  ["Repeat buyer", "Club invitation"],
  ["Club member", "Shipment or customization reminder"],
];

export default function CustomerDashboard() {
  return (
    <main className="min-h-screen bg-[#f3f6f8] text-[#17242e]">
      <header className="border-b border-[#d6e0e8] bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#087fa8]">
              Proposal 3 - review only
            </p>
            <h1 className="mt-1 text-2xl font-extrabold">Growth setup assistant</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <a className="border border-[#d6e0e8] bg-white px-4 py-2 font-bold text-[#516372]" href="#analytics">
              See data
            </a>
            <span className="border border-[#e3b23c] bg-[#fff8e7] px-4 py-2 text-xs font-bold uppercase text-[#8a6100]">
              Proposal only - API not wired
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-6">
        <section className="grid gap-4 md:grid-cols-3">
          <Step number="1" title="Scan" text="Check Commerce7 setup before recommending anything." active />
          <Step number="2" title="Recommend" text="Show one safe next move with defaults filled in." active />
          <Step number="3" title="Confirm" text="Review exactly what will be created before pushing." />
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_360px]">
          <div className="overflow-hidden border border-[#d6e0e8] bg-white">
            <div className="border-b border-[#d6e0e8] bg-[#fbfcfd] p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-[#087fa8]">
                    Recommended next move
                  </p>
                  <h2 className="mt-2 text-3xl font-extrabold">{recommendation.title}</h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-[#516372]">
                    {recommendation.reason}
                  </p>
                </div>
                <div className="border border-[#b9d6e0] bg-[#eef8fb] px-4 py-3 text-sm font-bold text-[#075e79]">
                  Low risk first step
                </div>
              </div>
            </div>

            <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="border-b border-[#d6e0e8] p-5 lg:border-b-0 lg:border-r">
                <h3 className="text-sm font-bold uppercase tracking-wide text-[#637381]">
                  What will be created
                </h3>
                <div className="mt-4 grid gap-3">
                  <Fact label="Feature" value={recommendation.feature} />
                  <Fact label="Type" value={recommendation.type} />
                  <Fact label="Location" value={recommendation.location} />
                </div>

                <div className="mt-5 border border-[#d6e0e8] bg-[#f7fafb] p-4">
                  <p className="text-sm font-bold">Conditions</p>
                  <ul className="mt-3 space-y-2 text-sm leading-5 text-[#516372]">
                    {recommendation.conditions.map((condition) => (
                      <li key={condition}>{condition}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-sm font-bold uppercase tracking-wide text-[#637381]">
                  Pre-filled message
                </h3>
                <div className="mt-4 border border-[#d6e0e8] bg-[#f7fafb] p-4">
                  <p className="text-sm leading-6">{recommendation.message}</p>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Fact label="Title" value="Free shipping nudge" />
                  <Fact label="Sort order" value="10" />
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button className="bg-[#087fa8] px-5 py-3 text-sm font-bold text-white">
                    Review and confirm
                  </button>
                  <button className="border border-[#087fa8] bg-white px-5 py-3 text-sm font-bold text-[#087fa8]">
                    Use dynamic product upsell instead
                  </button>
                </div>
                <p className="mt-3 text-xs leading-5 text-[#637381]">
                  No storefront change happens from this screen. The next screen is a read-only
                  confirmation before any Commerce7 API call.
                </p>
              </div>
            </div>
          </div>

          <aside className="space-y-5">
            <section className="border border-[#d6e0e8] bg-white p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-[#087fa8]">Scan result</p>
              <h2 className="mt-2 text-xl font-extrabold">What we found</h2>
              <div className="mt-4 space-y-3">
                {scanItems.map(([label, status, action]) => (
                  <div className="border border-[#d6e0e8] bg-[#f7fafb] p-3" key={label}>
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-bold">{label}</p>
                      <span className="text-xs font-bold uppercase text-[#637381]">{status}</span>
                    </div>
                    <p className="mt-1 text-sm text-[#516372]">{action}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="border border-[#d6e0e8] bg-white p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-[#087fa8]">If no promotion exists</p>
              <h2 className="mt-2 text-xl font-extrabold">Use Dynamic Product Upsell</h2>
              <p className="mt-2 text-sm leading-6 text-[#516372]">
                Commerce7 can recommend products based on purchase history and cart contents,
                with no manual product choice and no conditions.
              </p>
            </section>
          </aside>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[1fr_1fr]">
          <section className="border border-[#d6e0e8] bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-[#087fa8]">Confirm screen preview</p>
            <h2 className="mt-2 text-xl font-extrabold">Before pushing to Commerce7</h2>
            <div className="mt-4 space-y-2 border border-[#d6e0e8] bg-[#f7fafb] p-4 text-sm">
              {setupSteps.map((step, index) => (
                <p key={step}>
                  <b>{index + 1}.</b> {step}
                </p>
              ))}
            </div>
            <p className="mt-3 text-sm leading-6 text-[#516372]">
              The confirmation copy should say: "You can edit or pause this any time in
              Commerce7 admin." That reduces fear before they click.
            </p>
          </section>

          <section className="border border-[#d6e0e8] bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-[#087fa8]">Personalization quick-start</p>
            <h2 className="mt-2 text-xl font-extrabold">Generate the journey later</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {journeyPlan.map(([audience, action]) => (
                <div className="border border-[#d6e0e8] bg-[#f7fafb] p-3" key={audience}>
                  <p className="text-sm font-bold">{audience}</p>
                  <p className="mt-1 text-sm leading-5 text-[#516372]">{action}</p>
                </div>
              ))}
            </div>
          </section>
        </section>

        <section className="mt-5 border border-[#d6e0e8] bg-white" id="analytics">
          <details>
            <summary className="cursor-pointer p-5 text-lg font-extrabold">
              Evidence and analytics
              <span className="ml-2 text-sm font-normal text-[#637381]">
                opt-in only, separate route in production
              </span>
            </summary>
            <div className="border-t border-[#d6e0e8] p-5 text-sm leading-6 text-[#516372]">
              Proposal 3 keeps raw analytics out of the default path. In production this
              should become `/app/analytics`, with the existing surface tables and funnel.
            </div>
          </details>
        </section>
      </div>
    </main>
  );
}

function Step({ number, title, text, active = false }: { number: string; title: string; text: string; active?: boolean }) {
  return (
    <article className={`border p-4 ${active ? "border-[#087fa8] bg-white" : "border-[#d6e0e8] bg-[#fbfcfd]"}`}>
      <div className="flex items-start gap-3">
        <span className={`grid h-8 w-8 place-items-center text-sm font-extrabold ${active ? "bg-[#087fa8] text-white" : "bg-[#e7eef3] text-[#516372]"}`}>
          {number}
        </span>
        <div>
          <h2 className="text-base font-extrabold">{title}</h2>
          <p className="mt-1 text-sm leading-5 text-[#516372]">{text}</p>
        </div>
      </div>
    </article>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[#d6e0e8] bg-white p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-[#637381]">{label}</p>
      <p className="mt-1 text-sm font-bold leading-5">{value}</p>
    </div>
  );
}
