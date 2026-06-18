const recommendedStrategy = {
  title: "Club members love this Cabernet",
  surface: "Cart Carrot",
  audience: "Active club members viewing red wines",
  placement: "Product page, just above Add to Cart",
  message:
    "Club members most often add Cabernet 2020 after viewing this wine. Add it to your cart today and save your member allocation.",
  product: "Cabernet 2020",
  reason:
    "Your red-wine shoppers are clicking recommendations, but purchases trail add-to-cart behavior. This test uses the clearest product match and a familiar club-member reason to buy.",
};

const firstStateStrategy = {
  title: "Start with one safe recommendation",
  surface: "Cart Carrot",
  audience: "All shoppers on product pages",
  placement: "Product page, below product description",
  message:
    "Customers who enjoyed this wine often add Chardonnay Reserve 2022. It is an easy pairing for your next shipment.",
  product: "Chardonnay Reserve 2022",
  reason:
    "If the winery has not used Cart Carrot or personalization blocks yet, start with one product-page recommendation. It is easy to understand, easy to measure, and low risk.",
};

const analytics = [
  ["Cart Carrot", "US$1,764", "502", "24%", "48%", "US$3,514"],
  ["Personalization blocks", "US$2,436", "167", "31%", "42%", "US$14,587"],
];

const detailRows = [
  ["Club members love", "Cabernet 2020", "95", "41", "43%", "22", "23%", "+12pts"],
  ["You may also like", "Chardonnay Reserve 2022", "180", "52", "29%", "28", "16%", "+4pts"],
  ["Pairs well with", "Pinot Noir 2021", "140", "18", "13%", "6", "4%", "-7pts"],
  ["Recently restocked", "Rose 2023", "87", "9", "10%", "2", "2%", "-9pts"],
];

export default function CustomerDashboard() {
  return (
    <main className="min-h-screen bg-[#edf3f6] text-[#23313c]">
      <header className="border-b border-[#cbd8e2] bg-white px-7 py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase text-[#0079a9]">
              Proposal mockup - review only
            </p>
            <h1 className="mt-2 text-3xl font-extrabold">What should we try next?</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5b6c78]">
              A simple recommendation workspace for wineries that do not want to read
              a dashboard. We choose a next step, pre-fill the strategy, and let them
              push it to Commerce7.
            </p>
          </div>
          <div className="space-y-2 text-right">
            <div className="border border-[#cbd8e2] bg-[#f7fafb] px-4 py-3 text-sm font-bold">
              Eric Jacobsen1
            </div>
            <div className="border border-[#e1a326] bg-[#fff9e8] px-4 py-2 text-xs font-bold uppercase text-[#9a6200]">
              Not wired to API yet
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-5 px-7 py-5 xl:grid-cols-[1.45fr_0.9fr]">
        <section className="border border-[#cbd8e2] bg-white">
          <div className="border-b border-[#cbd8e2] p-5">
            <p className="text-xs font-bold uppercase text-[#0079a9]">Recommended next step</p>
            <h2 className="mt-2 text-2xl font-extrabold">{recommendedStrategy.title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#5b6c78]">
              {recommendedStrategy.reason}
            </p>
          </div>

          <div className="grid gap-4 p-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-3">
              <Info label="Use" value={recommendedStrategy.surface} />
              <Info label="Audience" value={recommendedStrategy.audience} />
              <Info label="Placement" value={recommendedStrategy.placement} />
              <Info label="Product" value={recommendedStrategy.product} />
              <div className="border border-[#cbd8e2] bg-[#f8fafb] p-4">
                <p className="text-xs font-bold uppercase text-[#687a87]">Expected outcome</p>
                <p className="mt-2 text-2xl font-extrabold">+8-12 add-to-carts</p>
                <p className="mt-1 text-sm text-[#5b6c78]">Directional estimate from similar activity.</p>
              </div>
            </div>

            <div className="border border-[#087fa8] bg-[#f7fcfe] p-4">
              <label className="block text-xs font-bold uppercase text-[#087fa8]">
                Pre-filled shopper message
                <textarea
                  className="mt-2 min-h-32 w-full resize-y border border-[#b9d6e0] bg-white p-3 text-sm leading-6 text-[#23313c]"
                  defaultValue={recommendedStrategy.message}
                />
              </label>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="text-xs font-bold uppercase text-[#687a87]">
                  Start date
                  <input className="mt-2 w-full border border-[#cbd8e2] bg-white p-3 text-sm normal-case" defaultValue="2026-06-21" />
                </label>
                <label className="text-xs font-bold uppercase text-[#687a87]">
                  Test length
                  <select className="mt-2 w-full border border-[#cbd8e2] bg-white p-3 text-sm normal-case" defaultValue="14 days">
                    <option>7 days</option>
                    <option>14 days</option>
                    <option>30 days</option>
                  </select>
                </label>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button className="bg-[#087fa8] px-5 py-3 text-sm font-bold text-white">
                  Push strategy to Commerce7
                </button>
                <button className="border border-[#087fa8] px-5 py-3 text-sm font-bold text-[#087fa8]">
                  Save draft
                </button>
              </div>
              <p className="mt-3 text-xs leading-5 text-[#5b6c78]">
                API draft: create/update the Cart Carrot placement, shopper message, audience,
                product target, and test window. Show success with the Commerce7 object link.
              </p>
            </div>
          </div>
        </section>

        <aside className="space-y-5">
          <section className="border border-[#cbd8e2] bg-white p-5">
            <p className="text-xs font-bold uppercase text-[#0079a9]">No setup yet?</p>
            <h2 className="mt-2 text-xl font-extrabold">Recommended first state</h2>
            <p className="mt-2 text-sm leading-6 text-[#5b6c78]">{firstStateStrategy.reason}</p>
            <div className="mt-4 space-y-2 text-sm">
              <Info label="Use" value={firstStateStrategy.surface} compact />
              <Info label="Placement" value={firstStateStrategy.placement} compact />
              <Info label="Product" value={firstStateStrategy.product} compact />
            </div>
            <button className="mt-4 w-full bg-[#0b7f68] px-4 py-3 text-sm font-bold text-white">
              Create first strategy
            </button>
          </section>

          <section className="border border-[#cbd8e2] bg-white p-5">
            <p className="text-xs font-bold uppercase text-[#687a87]">Health check</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Metric label="Ready ideas" value="2" />
              <Metric label="Needs setup" value="1" />
            </div>
            <p className="mt-4 text-sm leading-6 text-[#5b6c78]">
              The app should explain what is missing in plain English and offer to build the
              minimum viable Cart Carrot or personalization block for them.
            </p>
          </section>
        </aside>

        <section className="border border-[#cbd8e2] bg-white xl:col-span-2">
          <details>
            <summary className="cursor-pointer border-b border-[#cbd8e2] p-5 text-xl font-extrabold">
              Detailed analytics
              <span className="ml-2 text-sm font-normal text-[#5b6c78]">
                for advanced users and internal support
              </span>
            </summary>
            <div className="grid gap-5 p-5 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <h3 className="text-sm font-bold uppercase text-[#687a87]">Surface summary</h3>
                <div className="mt-3 overflow-x-auto border border-[#cbd8e2]">
                  <table className="min-w-full border-collapse text-left text-sm">
                    <thead className="bg-[#f4f7f9] text-xs uppercase text-[#687a87]">
                      <tr>
                        {["Surface", "Revenue", "Views", "CTR", "Add-to-cart", "Rev / 1k views"].map((h) => <th className="border-b border-[#cbd8e2] p-3" key={h}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.map((row) => (
                        <tr key={row[0]}>
                          {row.map((cell, index) => <td className="border-b border-[#cbd8e2] p-3 font-semibold" key={`${row[0]}-${cell}`}>{index === 0 ? cell : <span>{cell}</span>}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold uppercase text-[#687a87]">Cart Carrot detail</h3>
                <div className="mt-3 overflow-x-auto border border-[#cbd8e2]">
                  <table className="min-w-full border-collapse text-left text-sm">
                    <thead className="bg-[#f4f7f9] text-xs uppercase text-[#687a87]">
                      <tr>
                        {["Title", "Wine", "Views", "Clicks", "CTR", "Adds", "Add rate", "Vs avg"].map((h) => <th className="border-b border-[#cbd8e2] p-3" key={h}>{h}</th>)}
                      </tr>
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[#cbd8e2] bg-[#f8fafb] p-4">
      <p className="text-xs font-bold uppercase text-[#687a87]">{label}</p>
      <p className="mt-2 text-3xl font-extrabold">{value}</p>
    </div>
  );
}
