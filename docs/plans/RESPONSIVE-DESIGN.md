# Responsive Design Implementation Plan
## Commerce7 Plugin — `apps/web`

---

## Current state

The dashboard is **partially responsive**. The overall page layout adapts at `lg` (1024px) breakpoints, but three data tables have fixed minimum widths that force horizontal scrolling on tablets and phones. One critical form control (date range inputs) is hidden entirely below 1024px.

### Known breakpoints in use
- `lg:` — grid column changes, label visibility
- `sm:` — one location only (custom date grid, line 1497)
- No `md:` or `xl:` usage

---

## Issues to fix

### 1. Tables overflow on mobile (high priority)

All three breakdown tables have hard `min-w-` values that make them wider than any phone screen and most tablets:

| Table | File line | Min width | Breaks at |
|---|---|---|---|
| Surface performance | ~870 | `min-w-[920px]` | < 920px |
| Cart Carrot by title | ~1015 | `min-w-[860px]` | < 860px |
| Personalization by title | ~1138 | `min-w-[760px]` | < 760px |

**Fix:** Add an `overflow-x-auto` wrapper (already exists on two tables — verify all three have it) and display a subtle scroll hint on small screens. The tables are already inside `<div className="overflow-x-auto">` wrappers, so they scroll horizontally — but there's no visual affordance that tells the user to scroll.

Add a scroll hint label beneath each table on small screens:

```tsx
<div className="overflow-x-auto">
  <table className="w-full min-w-[920px] ...">
    ...
  </table>
</div>
<p className="mt-1 text-xs text-[var(--c-text-muted)] lg:hidden">
  ← Scroll to see all columns
</p>
```

**Longer-term fix (post-launch):** Replace the tables with a card-stack layout on screens below `md` (768px). Each row becomes a card with label–value pairs stacked vertically. This is more work but gives a proper mobile experience.

---

### 2. Date range inputs hidden below 1024px (high priority)

Start date and end date inputs use `hidden lg:block` — they disappear on any screen smaller than 1024px. A tablet user in "custom" date mode would see the dropdown say "Custom dates" but have no inputs to fill in.

**Current code (lines ~811, 823):**
```tsx
<label className={dateRange === "custom" ? "block" : "hidden lg:block"}>
```

**Fix:** Change `hidden lg:block` to `hidden md:block` so inputs appear from 768px up. Below 768px, show a compact inline date input row that stacks vertically:

```tsx
<label className={dateRange === "custom" ? "block" : "hidden md:block"}>
```

And wrap the date control section in a responsive grid that collapses gracefully:

```tsx
<div className="grid gap-3 md:grid-cols-[200px_1fr_1fr_120px] md:items-end">
```

Below `md`, the layout stacks: dropdown → start date → end date → button, all full-width.

---

### 3. Header text wrapping on small screens (low priority)

The `<h1>` uses `text-3xl font-extrabold` which can clip on screens below 360px. The header flex layout (`flex flex-wrap`) already handles wrapping gracefully. No change needed unless a very small device is a target.

---

### 4. Running strategies grid (low priority)

The running strategies section uses `lg:grid-cols-3`. On screens between 768px–1024px, all three strategy cards stack in a single column, which is tall but functional. Consider `md:grid-cols-2 lg:grid-cols-3` for a better tablet layout.

```tsx
<div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
```

---

## Target breakpoints

| Breakpoint | Width | Target device |
|---|---|---|
| (default) | < 640px | Phones |
| `sm:` | ≥ 640px | Large phones |
| `md:` | ≥ 768px | Tablets |
| `lg:` | ≥ 1024px | Laptops |
| `xl:` | ≥ 1280px | Desktops |

The dashboard currently jumps from phone to laptop with no tablet treatment. Adding `md:` handling for the date controls and strategy grid is the key gap.

---

## Commerce7 iframe context

Commerce7 embeds this app inside an admin panel iframe. The iframe is typically **900px–1100px wide** on desktop, which means the `lg:` breakpoints (1024px) will not trigger inside the iframe on most setups. This is a significant issue: features that require `lg:` — including the visible date inputs — will be hidden inside the C7 admin iframe.

**Fix:** Drop the date input visibility breakpoint from `lg` to `md` (768px) as described above. This ensures they're visible at the typical iframe width.

---

## Files to change

| File | Change |
|---|---|
| `apps/web/src/components/insights-dashboard.tsx` | Add scroll hints below tables; change date input breakpoint from `lg:` to `md:`; add `md:grid-cols-2` to strategies grid |

---

## Verification

```bash
# Use browser DevTools device emulator:
# 375px  (iPhone SE)         — tables scroll, layout intact
# 768px  (iPad portrait)     — date inputs visible, tables scroll
# 1024px (iPad landscape)    — full layout
# 900px  (C7 iframe width)   — date inputs visible — critical

pnpm dev:web
# Open localhost:3000/dashboard?tenantId=sandbox-eric-jacobsen1
# Toggle device sizes in DevTools → verify each breakpoint
```

---

## Effort estimate

~2–3 hours. The scroll hints and breakpoint changes are straightforward. A full card-based mobile layout for tables is a larger project (~1 day) and can be deferred post-launch.
