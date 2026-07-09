# Dark Mode Implementation Plan
## Commerce7 Plugin — `apps/web`

---

## Current state

Dark mode is **not implemented**. The dashboard uses 33+ hardcoded hex color values as Tailwind arbitrary properties throughout `apps/web/src/components/insights-dashboard.tsx` (e.g. `bg-[#f3f6f8]`, `text-[#26343d]`, `border-[#d5dee5]`). These override Tailwind's theming system entirely.

`apps/web/src/app/globals.css` has a `prefers-color-scheme: dark` block with CSS custom properties, but it has no effect because the component never reads those variables — it uses inline hex values directly.

There is no `tailwind.config.*` file in `apps/web`, and no `dark:` variant classes anywhere in the codebase.

---

## Approach: CSS custom properties + Tailwind `darkMode: 'media'`

The cleanest path for this codebase is to:

1. Replace all hardcoded hex colors with CSS custom properties (design tokens)
2. Define light and dark values for each token in `globals.css`
3. Reference tokens via `var(--token)` inside Tailwind arbitrary classes
4. Enable `darkMode: 'media'` in `tailwind.config.ts` so `dark:` variants respond to the OS preference

This avoids touching every JSX element twice and keeps design tokens in one place.

---

## Step 1 — Create `tailwind.config.ts`

Create `apps/web/tailwind.config.ts`:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "media",   // responds to prefers-color-scheme
  theme: { extend: {} },
  plugins: [],
};

export default config;
```

---

## Step 2 — Define design tokens in `globals.css`

Replace the existing `globals.css` variables block with a full set of named tokens. Every color used in the dashboard gets a token.

```css
:root {
  /* Surfaces */
  --c-bg-page:        #f3f6f8;
  --c-bg-card:        #ffffff;
  --c-bg-subtle:      #f8fafb;
  --c-bg-muted:       #f0f4f7;

  /* Borders */
  --c-border:         #d5dee5;
  --c-border-focus:   #0b7fab;

  /* Text */
  --c-text-primary:   #26343d;
  --c-text-secondary: #657481;
  --c-text-muted:     #9aa6af;
  --c-text-label:     #64727d;
  --c-text-meta:      #52616b;

  /* Brand / actions */
  --c-brand:          #0b7fab;
  --c-brand-hover:    #096d97;
  --c-brand-light:    #eef7fb;
  --c-brand-blue:     #0079a8;

  /* Status — green (positive) */
  --c-green-border:   #12896d;
  --c-green-bg:       #eefaf5;
  --c-green-text:     #0e6f58;

  /* Status — amber (warning/directional) */
  --c-amber-border:   #e3bd62;
  --c-amber-bg:       #fffaf0;
  --c-amber-text:     #9a6b14;

  /* Status — red (negative) */
  --c-red-border:     #c0392b;
  --c-red-bg:         #fdf2f2;
  --c-red-text:       #b03030;

  /* Disabled */
  --c-disabled-bg:    #8aaebe;

  /* Charts */
  --c-bar-track:      #ebf0f3;
  --c-bar-fill:       #0b7fab;
  --c-bar-green:      #12896d;
}

@media (prefers-color-scheme: dark) {
  :root {
    --c-bg-page:        #0f1923;
    --c-bg-card:        #18252f;
    --c-bg-subtle:      #1e2f3c;
    --c-bg-muted:       #243341;

    --c-border:         #2d404f;
    --c-border-focus:   #3fa8d4;

    --c-text-primary:   #e8f0f5;
    --c-text-secondary: #8fa8b8;
    --c-text-muted:     #5c7585;
    --c-text-label:     #7a9aaa;
    --c-text-meta:      #8fa8b8;

    --c-brand:          #3fa8d4;
    --c-brand-hover:    #5ab8e0;
    --c-brand-light:    #1a3040;
    --c-brand-blue:     #3fa8d4;

    --c-green-border:   #1aad8a;
    --c-green-bg:       #0d2b22;
    --c-green-text:     #2dd4a8;

    --c-amber-border:   #c9a23a;
    --c-amber-bg:       #2a1f08;
    --c-amber-text:     #f0c060;

    --c-red-border:     #d9534f;
    --c-red-bg:         #2a1010;
    --c-red-text:       #f08080;

    --c-disabled-bg:    #3a5a6e;

    --c-bar-track:      #243341;
    --c-bar-fill:       #3fa8d4;
    --c-bar-green:      #1aad8a;
  }
}
```

---

## Step 3 — Replace hardcoded hex values in the dashboard

Do a find-and-replace pass through `apps/web/src/components/insights-dashboard.tsx`, swapping each hardcoded color for its CSS variable:

| Replace | With |
|---|---|
| `bg-[#f3f6f8]` | `bg-[var(--c-bg-page)]` |
| `bg-white` | `bg-[var(--c-bg-card)]` |
| `bg-[#f8fafb]` | `bg-[var(--c-bg-subtle)]` |
| `bg-[#f0f4f7]` | `bg-[var(--c-bg-muted)]` |
| `border-[#d5dee5]` | `border-[var(--c-border)]` |
| `border-[#c6d2da]` | `border-[var(--c-border)]` |
| `focus:border-[#0b7fab]` | `focus:border-[var(--c-border-focus)]` |
| `text-[#26343d]` | `text-[var(--c-text-primary)]` |
| `text-[#657481]` | `text-[var(--c-text-secondary)]` |
| `text-[#9aa6af]` | `text-[var(--c-text-muted)]` |
| `text-[#64727d]` | `text-[var(--c-text-label)]` |
| `text-[#52616b]` | `text-[var(--c-text-meta)]` |
| `bg-[#0b7fab]` | `bg-[var(--c-brand)]` |
| `hover:bg-[#096d97]` | `hover:bg-[var(--c-brand-hover)]` |
| `bg-[#eef7fb]` | `bg-[var(--c-brand-light)]` |
| `text-[#0b7fab]` | `text-[var(--c-brand)]` |
| `text-[#0079a8]` | `text-[var(--c-brand-blue)]` |
| `border-[#12896d]` | `border-[var(--c-green-border)]` |
| `bg-[#eefaf5]` | `bg-[var(--c-green-bg)]` |
| `text-[#0e6f58]` | `text-[var(--c-green-text)]` |
| `border-[#e3bd62]` | `border-[var(--c-amber-border)]` |
| `bg-[#fffaf0]` | `bg-[var(--c-amber-bg)]` |
| `text-[#9a6b14]` | `text-[var(--c-amber-text)]` |
| `border-[#c0392b]` | `border-[var(--c-red-border)]` |
| `bg-[#fdf2f2]` | `bg-[var(--c-red-bg)]` |
| `text-[#b03030]` | `text-[var(--c-red-text)]` |
| `disabled:bg-[#8aaebe]` | `disabled:bg-[var(--c-disabled-bg)]` |
| `bg-[#ebf0f3]` | `bg-[var(--c-bar-track)]` |
| `bg-[#0b7fab]` (bar fill) | `bg-[var(--c-bar-fill)]` |
| `bg-[#12896d]` (bar) | `bg-[var(--c-bar-green)]` |

---

## Step 4 — Verify

```bash
# No hardcoded hex colors should remain in the dashboard
grep -c '#[0-9a-fA-F]\{6\}' apps/web/src/components/insights-dashboard.tsx
# Should output 0

pnpm typecheck
pnpm dev:web
# Open at localhost:3000/dashboard
# Toggle OS appearance in System Preferences → verify both modes render correctly
```

---

## Files to change

| File | Change |
|---|---|
| `apps/web/tailwind.config.ts` | Create — add `darkMode: "media"` |
| `apps/web/src/app/globals.css` | Replace color block with full token set (light + dark) |
| `apps/web/src/components/insights-dashboard.tsx` | Replace all hardcoded hex values with `var(--token)` |

---

## Effort estimate

~3–4 hours. Mechanical but thorough — every hex value needs to be checked. A regex find-and-replace covers most of it; the amber/green/red status colors need care because the same hex appears in multiple semantic contexts (border vs. background vs. text).
