---
name: tokens
description: Compile the finished design-system decisions (color, typography, spacing, radius, shadow, easing, animation) into Tailwind CSS v4 @theme tokens in app/globals.css — the single source every component consumes. Writes the :root/.dark oklch variables, the @theme inline bridge, the fluid clamp() type scale, the --spacing multiplier, and --animate-* keyframes. Invoke in the Foundation phase AFTER ultraweb:color, ultraweb:typography, ultraweb:motion-language and ultraweb:shape-language have written design/SYSTEM.md; also when globals.css must be created or regenerated, when the user says "set up the design tokens", "wire the theme", "add a token", "update globals.css", or when components are found hardcoding values that belong in the system.
---

# tokens — the system becomes one file

**Stage:** Phase 3 — Foundation (final step, after color/typography/motion-language/shape-language decide) - **Reads:** design/SYSTEM.md, design/DIRECTION.md - **Writes:** app/globals.css

## Standard

- app/globals.css is the single source of design truth. Components consume generated utilities; a hex code, a bare `oklch(`, or `text-[17px]` inside a component is a defect, not a shortcut.
- Every SYSTEM.md decision becomes a token; every token traces to a SYSTEM.md line. No orphans in either direction.
- Full semantic color set in BOTH `:root` and `.dark` as complete oklch values — never bare HSL triplets, never `hsl(var(--x))` (legacy shadcn v3 pattern, dead).
- Tailwind 4.3 is CSS-first: no tailwind.config.js, no `@tailwind` directives, no `theme.extend`. Ever.
- Type scale is fluid; the hero token resolves to ≥3.5× `--text-base` at 1440px (taste floor).

## Process

1. Read SYSTEM.md §color/§type/§layout/§depth/§shape/§motion. A missing decision means the owning skill hasn't run — run it. Never invent values here.
2. Write `:root` and `.dark` as plain CSS variables — the color skill's value table, verbatim.
3. Bridge every var-referencing token through `@theme inline` (colors, fonts, radius math, shadows); literals (text scale, spacing, easings, keyframes) go in plain `@theme`. Rule: `inline` whenever a token references another CSS variable.
4. Define the entrance `@keyframes` inside `@theme`; durations and curves come from motion-language's `--dur-*`/`--ease-*` tokens, never hardcoded. Land its reduced-motion policy the way motion-language mandates: author every entrance utility inside `@media (prefers-reduced-motion: no-preference)` (worked example below) so motion is opt-in — reduce users receive the static end state and no `both`-fill entrance leaves content hidden. No global `reduce` kill-switch.
5. Base layer: body colors, default border-color, `::selection` in palette — craft in the last 2% (taste).
6. Dark mode is class-strategy: `@custom-variant dark` in CSS + next-themes — `<html suppressHydrationWarning>` and a client `<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>` wrapper.
7. Verify: `npm run build` clean, then Playwright `browser_evaluate` → `getComputedStyle(document.body).backgroundColor` resolves to the token value in BOTH themes.

## Worked example — app/globals.css (Tailwind 4.3)

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

:root { /* light — warm paper ground, terracotta accent (from SYSTEM.md §color) */
  --background: oklch(0.98 0.008 85); --foreground: oklch(0.24 0.02 60);
  --card: oklch(1 0 0); --card-foreground: oklch(0.24 0.02 60);
  --popover: oklch(1 0 0); --popover-foreground: oklch(0.24 0.02 60);
  --primary: oklch(0.53 0.16 45); --primary-foreground: oklch(0.98 0.01 85);
  --secondary: oklch(0.94 0.015 80); --secondary-foreground: oklch(0.3 0.02 60);
  --muted: oklch(0.955 0.01 85); --muted-foreground: oklch(0.49 0.02 60);
  --accent: oklch(0.92 0.05 75); --accent-foreground: oklch(0.32 0.06 45);
  --destructive: oklch(0.53 0.19 25); --ring: oklch(0.53 0.16 45);
  --border: oklch(0.9 0.012 80); --input: oklch(0.9 0.012 80);
  --radius: 0.5rem; --shadow-color: oklch(0.3 0.05 60 / 0.08);
}

.dark { /* re-decided per surface, not inverted (color skill rules) */
  --background: oklch(0.17 0.015 60); --foreground: oklch(0.93 0.012 80);
  --card: oklch(0.21 0.018 60); --card-foreground: oklch(0.93 0.012 80);
  --popover: oklch(0.21 0.018 60); --popover-foreground: oklch(0.93 0.012 80);
  --primary: oklch(0.71 0.13 50); --primary-foreground: oklch(0.15 0.02 60);
  --secondary: oklch(0.26 0.02 60); --secondary-foreground: oklch(0.9 0.012 80);
  --muted: oklch(0.24 0.018 60); --muted-foreground: oklch(0.7 0.02 70);
  --accent: oklch(0.3 0.05 50); --accent-foreground: oklch(0.9 0.06 60);
  --destructive: oklch(0.66 0.17 25); --ring: oklch(0.71 0.13 50);
  --border: oklch(0.28 0.02 60); --input: oklch(0.28 0.02 60);
  --shadow-color: oklch(0 0 0 / 0.35);
}

@theme inline { /* bridge: tokens that reference other variables */
  --color-background: var(--background); --color-foreground: var(--foreground);
  --color-card: var(--card); --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover); --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary); --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary); --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted); --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent); --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive); --color-ring: var(--ring);
  --color-border: var(--border); --color-input: var(--input);
  --font-display: var(--font-fraunces); /* set by next/font in lib/fonts.ts */
  --font-sans: var(--font-instrument);
  --radius-sm: calc(var(--radius) - 4px); --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius); --radius-xl: calc(var(--radius) + 6px);
  --shadow-xs: 0 1px 2px var(--shadow-color);
  --shadow-sm: 0 1px 3px var(--shadow-color), 0 1px 2px -1px var(--shadow-color);
  --shadow-md: 0 2px 6px -1px var(--shadow-color), 0 8px 24px -4px var(--shadow-color);
  --shadow-lg: 0 4px 12px -2px var(--shadow-color), 0 20px 48px -8px var(--shadow-color);
}

@theme { /* literals: fluid scale 390→1440px (typography skill), motion literals */
  --text-*: initial; /* wipe defaults — no text-7xl escape hatch around the scale */
  --text-xs: 0.75rem; --text-sm: 0.875rem;
  --text-base: 1rem; --text-lg: 1.125rem;
  --text-xl: clamp(1.19rem, 1.07rem + 0.48vw, 1.5rem);
  --text-2xl: clamp(1.375rem, 1.19rem + 0.76vw, 1.875rem);
  --text-3xl: clamp(1.69rem, 1.39rem + 1.24vw, 2.5rem);
  --text-4xl: clamp(2rem, 1.44rem + 2.29vw, 3.5rem);
  --text-4xl--line-height: 1.08;
  --text-5xl: clamp(2.5rem, 1.66rem + 3.43vw, 4.75rem);  /* 40px → 76px = 4.75× body */
  --text-5xl--line-height: 1.02;
  --text-6xl: clamp(3rem, 1.79rem + 4.95vw, 6.25rem);
  --text-6xl--line-height: 0.96;
  --spacing: 0.25rem; /* single multiplier — all spacing utilities derive from it */
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);      /* entrances, hover — Decisive family (motion-language) */
  --ease-in-out: cubic-bezier(0.83, 0, 0.17, 1);   /* moves, morphs */
  --ease-in: cubic-bezier(0.64, 0, 0.78, 0);       /* exits only */
  --dur-micro: 200ms; --dur-small: 320ms; --dur-section: 560ms; /* motion-language duration tiers — plain custom props (no Tailwind namespace), mirrored in lib/motion.ts */
  @keyframes fade-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
  @keyframes scale-in { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: none; } }
}

@layer base {
  * { border-color: var(--color-border); }
  body { background: var(--color-background); color: var(--color-foreground); font-family: var(--font-sans); }
  ::selection { background: var(--color-primary); color: var(--color-primary-foreground); }
}

@media (prefers-reduced-motion: no-preference) { /* motion-language policy: motion is opt-in. Entrance utilities attach their animation ONLY when the user allows motion — no `reduce` kill-switch fighting !important specificity, and a `both`-fill entrance can never leave reduce users staring at hidden content, because they receive the static end state directly. */
  .animate-fade-up { animation: fade-up var(--dur-section) var(--ease-out) both; }
  .animate-scale-in { animation: scale-in var(--dur-small) var(--ease-out) both; }
}
```

## Anti-patterns

- `tailwind.config`, `@tailwind base`, `theme.extend`, `darkMode:` — v3 relics; the config file must not exist.
- `hsl(var(--` and bare HSL triplets in `:root` — the dead shadcn bridge; full oklch only.
- `#`-hex, `rgb(`, `oklch(` inside `app/` or `components/` — grep for all three; only globals.css defines color.
- `text-[`, `p-[`, `rounded-[`, `shadow-[` arbitrary values — a value you need is a token you're missing.
- `dark:bg-[` — per-component dark hacks instead of the `.dark` block re-decision.
- Tokens defined but SYSTEM.md silent on them (invented here), or SYSTEM.md decisions with no token (system leaks into components).
- Entrance utilities authored outside `@media (prefers-reduced-motion: no-preference)`, or a global `reduce` kill-switch standing in for opt-in authoring — reduce users must never receive motion they didn't opt into; taste requires the preference honored by construction, not overridden after the fact.

## Composes with

- ultraweb:color — supplies every oklch value and the dark-theme table this file encodes verbatim.
- ultraweb:typography — supplies the `--font-*` variables (via lib/fonts.ts) and the clamp() scale values.
- ultraweb:motion-language — supplies the duration/easing vocabulary behind `--ease-*`/`--dur-*` and the entrance keyframes, plus the opt-in `no-preference` reduced-motion policy this file authors.
- ultraweb:shape-language — supplies the `--radius` base and its scale steps.
- ultraweb:depth — supplies the shadow recipes and the per-theme `--shadow-color` strategy.
- ultraweb:scaffold — creates the project and a skeleton globals.css; this skill replaces the skeleton, never runs before it.
- Consumed by every component-tier and layout skill (ultraweb:buttons, ultraweb:data-display, ultraweb:layout-grid, ultraweb:content-cms, …) — they style off the utilities generated here; a raw hex or bare `oklch(` inside a component is their defect, not a missing token.
- ultraweb:email — reads the raw palette oklch values from this file to inline into react-email templates, since email clients can't consume the `@theme` utilities the web build generates.
