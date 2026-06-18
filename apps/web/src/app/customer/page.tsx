const setupChecks = [
  ["Cart Carrots", "Not found", "The advisor can create the first one"],
  ["Free shipping promotion", "Likely available", "Use bottle-count carrot"],
  ["Personalization block", "Needs code", "Prepare options for designer"],
  ["Club data", "Available", "Use club-member incentive"],
];

const recommendedPlan = {
  name: "Free shipping nudge",
  surface: "Cart Carrot",
  location: "Top of Side Cart",
  type: "General Content",
  goal: "Get shoppers who already have bottles in cart to add enough for free shipping.",
  message: "Add 1 more bottle to receive free shipping on your order.",
  conditions: [
    "Cart Item Count is greater than or equal to 1",
    "Cart Item Count is less than or equal to 5",
  ],
  apiAction:
    "Create Cart Carrot -> General Content -> Top of Side Cart -> save conditions and message",
};

const fallbackPlan = {
  name: "Dynamic product upsell",
  surface: "Cart Carrot",
  location: "Bottom of Side Cart",
  type: "Dynamic Product Upsell",
  goal:
    "If the winery has no clear promotion, let Commerce7 dynamically recommend a product based on purchase history and cart contents.",
  message: "Customers often add one more wine before checkout. Here is a recommended bottle.",
  conditions: ["No manual product selection", "No conditions required for this carrot type"],
};

const personalizationPlan = [
  ["Anonymous visitor", "Welcome them and point to a starter collection"],
  ["First-time buyer", "Show product recommendations based on their first purchase"],
  ["Repeat buyer", "Promote club benefits and invite them to join"],
  ["Club member", "Show upcoming shipment or customization reminder"],
];

const detailRows = [
  ["Free shipping carrot", "General Content", "Top of Side Cart", "Cart Item Count 1-5"],
  ["Add-on bottle carrot", "Product Upsell", "Bottom of Side Cart", "Cart Item Count >= 1"],
  ["Club case incentive", "General Content", "Cart Page", "Club Member + Item Count <= 11"],
  ["Birthday coupon", "General Content", "Cart Page", "Birthday is this month"],
];

export default function CustomerDashboard() {
  return (
    <main className="min-h-screen bg-[#edf3f6] text-[#23313c]">
      <header className="border-b border-[#cbd8e2] bg-white px-7 py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase text-[#0079a9]">
              Proposal 2 - review only
            </p>
            <h1 className="mt-2 text-3xl font-extrabold">Set up the next best move</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#5b6c78]">
              This proposal turns the app into a plain-English setup assistant. The winery
              sees one recommended action, a pre-filled Commerce7 strategy, and a safe button
              to push it when they are ready. Detailed analytics move behind an evidence drawer.
            </p>
          </div>
          <div className="space-y-2 text-right">
            <div className="border border-[#cbd8e2] bg-[#f7fafb] px-4 py-3 text-sm font-bold">
              Eric Jacobsen1
            </div>
            <div className="border border-[#e1a326] bg-[#fff9e8] px-4 py-2 text-xs font-bold uppercase text-[#9a6200]">
              Proposal only - API not wired
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-5 px-7 py-5 xl:grid-cols-[1.35fr_0.95fr]">
        <section className="border border-[#cbd8e2] bg-white">
          <div className="border-b border-[#cbd8e2] p-5">
            <p className="text-xs font-bold uppercase text-[#0079a9]">Recommended setup</p>
            <h2 className="mt-2 text-2xl font-extrabold">{recommendedPlan.name}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#5b6c78]">
              {recommendedPlan.goal} This is based on Commerce7's basic Cart Carrot pattern:
              show a message when the cart is below the bottle threshold, then stop once the
              shopper qualifies.
            </p>
          </div>

          <div className="grid gap-4 p-5 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="space-y-3">
              <Info label="Commerce7 feature" value={recommendedPlan.surface} />
              <Info label="Location" value={recommendedPlan.location} />
              <Info label="Type" value={recommendedPlan.type} />
              <Info label="Why this first" value="Easy to understand, promotion-driven, and useful even for wineries with no personalization history." />
              <div className="border border-[#cbd8e2] bg-[#f8fafb] p-4">
                <p className="text-xs font-bold uppercase text-[#687a87]">Before pushing, check</p>
                <ul className="mt-2 space-y-2 text-sm leading-5">
                  <li>Whether a free-shipping promotion exists.</li>
                  <li>The bottle threshold, usually 6 or 12.</li>
                  <li>Whether cart count conditions can be created safely.</li>
                </ul>
              </div>
            </div>

            <div className="border border-[#087fa8] bg-[#f7fcfe] p-4">
              <p className="text-xs font-bold uppercase text-[#087fa8]">Pre-filled strategy</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="text-xs font-bold uppercase text-[#687a87]">
                  Cart carrot title
                  <input className="mt-2 w-full border border-[#cbd8e2] bg-white p-3 text-sm normal-case" defaultValue="Free shipping nudge - 1 bottle left" />
                </label>
                <label className="text-xs font-bold uppercase text-[#687a87]">
                  Sort order
                  <input className="mt-2 w-full border border-[#cbd8e2] bg-white p-3 text-sm normal-case" defaultValue="10" />
                </label>
              </div>
              <label className="mt-3 block text-xs font-bold uppercase text-[#687a87]">
                Shopper message
                <textarea
                  className="mt-2 min-h-28 w-full resize-y border border-[#b9d6e0] bg-white p-3 text-sm leading-6 text-[#23313c]"
                  defaultValue={recommendedPlan.message}
                />
              </label>
              <div className="mt-3 border border-[#cbd8e2] bg-white p-3">
                <p className="text-xs font-bold uppercase text-[#687a87]">Conditions to push</p>
                <ul className="mt-2 space-y-1 text-sm leading-5">
                  {recommendedPlan.conditions.map((condition) => <li key={condition}>{condition}</li>)}
                </ul>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button className="bg-[#087fa8] px-5 py-3 text-sm font-bold text-white">
                  Review and push to Commerce7
                </button>
                <button className="border border-[#087fa8] px-5 py-3 text-sm font-bold text-[#087fa8]">
                  Adjust copy
                </button>
              </div>
              <p className="mt-3 text-xs leading-5 text-[#5b6c78]">{recommendedPlan.apiAction}</p>
            </div>
          </div>
        </section>

        <aside className="space-y-5">
          <section className="border border-[#cbd8e2] bg-white p-5">
            <p className="text-xs font-bold uppercase text-[#0079a9]">Setup scan</p>
            <h2 className="mt-2 text-xl font-extrabold">What the setup scan found</h2>
            <div className="mt-4 space-y-3">
              {setupChecks.map(([label, status, action]) => (
                <div className="border border-[#cbd8e2] bg-[#f8fafb] p-3" key={label}>
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-bold">{label}</p>
                    <span className="text-xs font-bold uppercase text-[#687a87]">{status}</span>
                  </div>
                  <p className="mt-1 text-sm text-[#5b6c78]">{action}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="border border-[#cbd8e2] bg-white p-5">
            <p className="text-xs font-bold uppercase text-[#0079a9]">No clear promotion?</p>
            <h2 className="mt-2 text-xl font-extrabold">{fallbackPlan.name}</h2>
            <p className="mt-2 text-sm leading-6 text-[#5b6c78]">{fallbackPlan.goal}</p>
            <div className="mt-4 space-y-2">
              <Info label="Location" value={fallbackPlan.location} compact />
              <Info label="Type" value={fallbackPlan.type} compact />
              <Info label="Setup" value={fallbackPlan.conditions.join(" | ")} compact />
            </div>
            <button className="mt-4 w-full bg-[#0b7f68] px-4 py-3 text-sm font-bold text-white">
              Use this safer fallback
            </button>
          </section>
        </aside>

        <section className="border border-[#cbd8e2] bg-white xl:col-span-2">
          <div className="border-b border-[#cbd8e2] p-5">
            <p className="text-xs font-bold uppercase text-[#0079a9]">Personalization starter pack</p>
            <h2 className="mt-2 text-2xl font-extrabold">If they want personalization, build the journey</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#5b6c78]">
              Commerce7's templates map naturally to the customer journey. The assistant should generate
              the block options, plain-English copy, and designer handoff code so the winery does
              not have to understand targeting logic.
            </p>
          </div>
          <div className="grid gap-3 p-5 md:grid-cols-4">
            {personalizationPlan.map(([audience, goal]) => (
              <article className="border border-[#cbd8e2] bg-[#f8fafb] p-4" key={audience}>
                <p className="text-xs font-bold uppercase text-[#687a87]">{audience}</p>
                <p className="mt-2 text-sm font-bold leading-5">{goal}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border border-[#cbd8e2] bg-white xl:col-span-2">
          <details>
            <summary className="cursor-pointer border-b border-[#cbd8e2] p-5 text-xl font-extrabold">
              Evidence and advanced analytics
              <span className="ml-2 text-sm font-normal text-[#5b6c78]">
                hidden by default for winery users
              </span>
            </summary>
            <div className="grid gap-5 p-5 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <h3 className="text-sm font-bold uppercase text-[#687a87]">Commerce7 examples used</h3>
                <div className="mt-3 overflow-x-auto border border-[#cbd8e2]">
                  <table className="min-w-full border-collapse text-left text-sm">
                    <thead className="bg-[#f4f7f9] text-xs uppercase text-[#687a87]">
                      <tr>{["Strategy", "Type", "Location", "Conditions"].map((h) => <th className="border-b border-[#cbd8e2] p-3" key={h}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {detailRows.map((row) => (
                        <tr key={row[0]}>
                          {row.map((cell) => <td className="border-b border-[#cbd8e2] p-3" key={`${row[0]}-${cell}`}>{cell}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold uppercase text-[#687a87]">Support notes</h3>
                <div className="mt-3 space-y-3 text-sm leading-6 text-[#23313c]">
                  <p className="border border-[#cbd8e2] bg-[#f8fafb] p-4">
                    Keep the winery-facing page focused on one recommendation and one action.
                    Put tables, confidence, attribution, and raw performance detail in this drawer.
                  </p>
                  <p className="border border-[#cbd8e2] bg-[#f8fafb] p-4">
                    For launch, the workflow can support three push actions: basic free-shipping carrot,
                    product upsell carrot, and personalization option draft. Dynamic Product Upsell
                    is the safest fallback when product matching is unclear.
                  </p>
                </div>
              </div>
            </div>
          </details>
        </section>
      </div>
    </main>
  );
}

function Info({ label, value, compact = false }: { label: string; value: string; compact?: boolean }) {
  return (
    <div className={compact ? "" : "border border-[#cbd8e2] bg-[#f8fafb] p-4"}>
      <p className="text-xs font-bold uppercase text-[#687a87]">{label}</p>
      <p className="mt-1 text-sm font-bold leading-5">{value}</p>
    </div>
  );
}
