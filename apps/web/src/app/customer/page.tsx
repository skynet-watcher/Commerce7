const surfaces = [
  ["Cart Carrot", "Dynamic content surface", "US$1,764", "502", "24%", "48%", "0%", "US$3,514"],
  ["Personalization blocks", "Dynamic content surface", "US$2,436", "167", "31%", "42%", "0%", "US$14,587"],
];

const carrots = [
  ["Club members love", "Cabernet 2020", "95", "41", "43%", "22", "23%", "+12pts"],
  ["You may also like", "Chardonnay Reserve 2022", "180", "52", "29%", "28", "16%", "+4pts"],
  ["Pairs well with", "Pinot Noir 2021", "140", "18", "13%", "6", "4%", "-7pts"],
  ["Recently restocked", "Rosé 2023", "87", "9", "10%", "2", "2%", "-9pts"],
];

const blocks = [
  ["Wine Club Sign-Up", "95", "38", "40%", "18", "19%", "+6pts"],
  ["Reserve Allocation", "72", "14", "19%", "4", "6%", "-8pts"],
];

const funnel = [
  ["Impressions", 669, 100],
  ["Clicks", 172, 26],
  ["Add to cart", 80, 12],
  ["Checkout", 0, 0],
  ["Purchases", 40, 6],
];

export default function CustomerDashboard() {
  return (
    <main className="min-h-screen bg-[#eef3f6] text-[#26343f]">
      <header className="border-b border-[#cbd8e2] bg-[#f7f9fb] px-7 py-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#0079a9]">
              Analytics by Chat Through Automations
            </p>
            <h1 className="mt-2 text-3xl font-extrabold">Dynamic content analytics</h1>
            <p className="mt-2 text-sm text-[#5c6e7d]">
              Cart Carrot and personalization outcomes for <b>Eric Jacobsen1</b>.
            </p>
          </div>
          <div className="flex gap-2 text-sm font-semibold">
            <div className="border border-[#cbd8e2] bg-white px-4 py-4 text-[#596a78]">
              Updated May 19, 2026, 4:45 p.m.
            </div>
            <div className="border border-[#cbd8e2] bg-white px-4 py-4">Integration console</div>
          </div>
        </div>
      </header>

      <div className="space-y-5 px-7 py-5">
        <section className="border border-[#cbd8e2] bg-white p-4">
          <div className="grid gap-3 md:grid-cols-[220px_1fr_1fr_128px]">
            <Field label="Date range" value="Last 30 days" select />
            <Field label="Start date" value="2026-04-20" muted />
            <Field label="End date" value="2026-05-19" muted />
            <button className="self-end bg-[#087fa8] px-5 py-3 text-sm font-bold text-white">Refresh</button>
          </div>
        </section>

        <Panel title="Insights" subtitle="Recommended strategies appear after enough shopper activity and observed purchases." badge="40 OBSERVED PURCHASES · 4461 SHOPPER EVENTS">
          <div className="grid gap-3 p-5 md:grid-cols-2">
            <Insight
              strategyId="cart-carrot-strategy"
              text="Cart Carrot is getting add-to-cart activity, but purchases are not following at the same rate."
            />
            <Insight
              strategyId="personalization-strategy"
              text="Personalization blocks are getting add-to-cart activity, but purchases are not following at the same rate."
            />
          </div>
        </Panel>

        <section className="grid gap-4 lg:grid-cols-2">
          <Strategy
            id="cart-carrot-strategy"
            title="Cart Carrot strategy"
            metric="48% add-to-cart rate · 0% conversion rate"
            action="Add a second Cart Carrot placement at checkout and test a lower-friction wine match against Club members love."
          />
          <Strategy
            id="personalization-strategy"
            title="Personalization block strategy"
            metric="42% add-to-cart rate · 0% conversion rate"
            action="Keep Wine Club Sign-Up live, then test checkout copy and shipping-threshold messaging for the Reserve Allocation block."
          />
        </section>

        <Panel
          title="Surface performance"
          subtitle="Quantified outcomes for Cart Carrot, personalization blocks, and other captured dynamic content."
          badge="2 SURFACES TRACKED"
        >
          <div className="grid grid-cols-[1.2fr_0.9fr_0.8fr_0.8fr_0.8fr_0.8fr_1fr_0.9fr_1.7fr] border-b border-[#cbd8e2] bg-[#f4f7f9] px-4 py-4 text-xs font-bold uppercase text-[#627382]">
            {["Surface", "Revenue", "Impressions", "Click-through rate", "Add-to-cart rate", "Conversion rate", "Revenue per 1,000 views", "Data quality", "Recommended next test"].map((h) => <span key={h}>{h}</span>)}
          </div>
          {surfaces.map((r) => (
            <div className="grid grid-cols-[1.2fr_0.9fr_0.8fr_0.8fr_0.8fr_0.8fr_1fr_0.9fr_1.7fr] border-b border-[#cbd8e2] px-4 py-6 text-base" key={r[0]}>
              <div><b>{r[0]}</b><p className="mt-2 text-sm text-[#5c6e7d]">{r[1]}</p></div>
              <Bar value={r[2]} />
              <b>{r[3]}</b><b>{r[4]}</b><b>{r[5]}</b><b>{r[6]}</b><b>{r[7]}</b>
              <span><em className="border border-[#e1a326] bg-[#fff9e8] px-2 py-1 text-xs not-italic text-[#9a6200]">Directional</em></span>
              <p className="text-sm leading-6 text-[#5c6e7d]">This surface is producing measurable purchase activity. Add a second placement and compare performance between the two.</p>
            </div>
          ))}
        </Panel>

        <Panel title="Cart Carrot performance by title" subtitle="Ranked by add-to-cart rate · Last 30 days for Eric Jacobsen1" badge="4 CARROTS">
          <Table headers={["Carrot title", "Recommended wine", "Impressions", "Clicks", "Click-through rate", "Add to cart", "Add-to-cart rate", "Vs. carrot average"]} rows={carrots} average="12%" />
        </Panel>

        <Panel title="Personalization block performance by title" subtitle="Ranked by add-to-cart rate · Last 30 days for Eric Jacobsen1" badge="2 BLOCKS">
          <Table headers={["Block title", "Impressions", "Clicks", "Click-through rate", "Add to cart", "Add-to-cart rate", "Vs. block average"]} rows={blocks} average="13%" />
        </Panel>

        <div className="grid gap-4 lg:grid-cols-[2fr_0.9fr]">
          <Panel title="Behavior funnel" subtitle="Last 30 days for Eric Jacobsen1" badge="DIRECTIONAL ATTRIBUTION">
            <div className="space-y-4 px-5 pb-5">
              {funnel.map(([label, value, width]) => (
                <div className="grid grid-cols-[120px_1fr_52px] items-center gap-3 text-sm" key={label as string}>
                  <span>{label}</span><div className="h-3 bg-[#e5edf2]"><div className="h-3 bg-[#0b83a8]" style={{ width: `${width}%` }} /></div><b>{value}</b>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="Attribution health">
            <div className="grid grid-cols-2 gap-3 px-5 pb-4">
              <Metric label="Attributed" value="40" />
              <Metric label="Unattributed" value="0" />
            </div>
            <p className="px-5 pb-5 text-sm leading-6 text-[#647585]">
              Revenue is quantified from captured purchase/order events. Treat it as directional until session-to-order correlation is validated against Commerce7 orders.
            </p>
          </Panel>
        </div>
      </div>
    </main>
  );
}

function Panel({ title, subtitle, badge, children }: { title: string; subtitle?: string; badge?: string; children?: React.ReactNode }) {
  return <section className="border border-[#cbd8e2] bg-white"><div className="flex items-start justify-between gap-4 border-b border-[#cbd8e2] p-5"><div><h2 className="text-2xl font-extrabold">{title} <span className="text-sm text-[#89a0b0]">ⓘ</span></h2>{subtitle ? <p className="mt-1 text-sm text-[#5c6e7d]">{subtitle}</p> : null}</div>{badge ? <b className="border border-[#cbd8e2] px-3 py-2 text-xs text-[#627382]">{badge}</b> : null}</div>{children}</section>;
}

function Field({ label, value, select, muted }: { label: string; value: string; select?: boolean; muted?: boolean }) {
  return <label className="block text-xs font-bold uppercase text-[#627382]">{label}<div className={`mt-2 border border-[#cbd8e2] px-3 py-3 text-sm normal-case ${muted ? "text-[#8da0ad]" : "text-[#26343f]"}`}>{value}{select ? <span className="float-right">⌄</span> : null}</div></label>;
}

function Bar({ value }: { value: string }) {
  return <div><b>{value}</b><div className="mt-2 h-1 bg-[#dfe8ee]"><div className="h-1 w-[72%] bg-[#00856a]" /></div></div>;
}

function Table({ headers, rows, average }: { headers: string[]; rows: string[][]; average: string }) {
  return <><div className="grid border-b border-[#cbd8e2] bg-[#f4f7f9] px-4 py-4 text-xs font-bold uppercase text-[#627382]" style={{ gridTemplateColumns: `repeat(${headers.length}, minmax(0, 1fr))` }}>{headers.map((h) => <span key={h}>{h}</span>)}</div>{rows.map((row) => <div className="grid border-b border-[#cbd8e2] px-4 py-4" style={{ gridTemplateColumns: `repeat(${headers.length}, minmax(0, 1fr))` }} key={row.join("|")}>{row.map((cell, i) => <span className={i === 0 || i === 5 ? "font-bold" : ""} key={cell}>{cell.startsWith("+") || cell.startsWith("-") ? <em className={`border px-2 py-1 text-xs not-italic ${cell.startsWith("+") ? "border-[#00956f] text-[#007a5b]" : "border-[#ef4444] text-[#b91c1c]"}`}>{cell}</em> : cell}</span>)}</div>)}<div className="grid bg-[#f6f9fb] px-4 py-4 font-bold text-[#536575]" style={{ gridTemplateColumns: `repeat(${headers.length}, minmax(0, 1fr))` }}><span>Overall average</span><span /><span /><span /><span /><span>{average}</span><span>—</span></div></>;
}

function Insight({ text, strategyId }: { text: string; strategyId: string }) {
  return <article className="border border-[#cbd8e2] bg-[#f8fafb] p-4"><div className="flex justify-between gap-3"><b className="text-xs uppercase text-[#627382]">Observation</b><b className="border border-[#00956f] px-2 py-1 text-xs text-[#007a5b]">High confidence</b></div><p className="mt-4 text-sm leading-6">{text}</p><b className="mt-5 block text-xs uppercase text-[#627382]">Try this</b><p className="mt-2 text-sm leading-6">check the product match, price point, shipping threshold, or checkout friction before scaling.</p><p className="mt-5 text-xs text-[#647585]">Based on 40 observed purchases and 4461 shopper events.</p><a className="mt-4 block w-full border border-[#087fa8] py-2 text-center text-sm font-bold text-[#087fa8]" href={`#${strategyId}`}>Try this strategy</a></article>;
}

function Strategy({ id, title, metric, action }: { id: string; title: string; metric: string; action: string }) {
  return <article className="scroll-mt-4 border border-[#087fa8] bg-white p-5" id={id}><p className="text-xs font-bold uppercase text-[#087fa8]">Recommended strategy</p><h2 className="mt-2 text-xl font-extrabold">{title}</h2><p className="mt-2 text-sm font-bold text-[#536575]">{metric}</p><p className="mt-4 text-sm leading-6 text-[#26343f]">{action}</p><div className="mt-4 border border-[#cbd8e2] bg-[#f8fafb] p-3 text-sm text-[#536575]">Demo status: ready to test in the next campaign cycle.</div></article>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="border border-[#cbd8e2] bg-[#f8fafb] p-4"><p className="text-xs font-bold uppercase text-[#627382]">{label}</p><p className="mt-2 text-3xl font-extrabold">{value}</p></div>;
}
