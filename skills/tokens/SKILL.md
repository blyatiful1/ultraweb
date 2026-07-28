---
name: tokens
description: Compile the finished design-system decisions (color, typography, spacing, radius, shadow, easing, animation) into Tailwind CSS v4 @theme tokens in app/globals.css — the single authoring source every component consumes across three token tiers. Writes the :root/.dark oklch variables, the @theme inline bridge, the fluid clamp() type scale, the --spacing multiplier, --animate-* keyframes, the @layer order that overrides shadcn without !important, @property-typed tokens so animatable colors interpolate, and the resolved-hex lib/tokens.ts export for email/OG. Invoke in the Foundation phase AFTER ultraweb:color, ultraweb:typography, ultraweb:motion-language and ultraweb:shape-language have written design/SYSTEM.md; also when globals.css must be created or regenerated, when the user says "set up the design tokens", "wire the theme", "add a token", "export tokens for email/OG", "make a token animatable", "update globals.css", or when components are found hardcoding values that belong in the system.
---

# tokens — the system becomes one file

**Stage:** Phase 3 — Foundation (final step, after color/typography/motion-language/shape-language decide) - **Reads:** design/SYSTEM.md, design/DIRECTION.md - **Writes:** app/globals.css

## Standard

- app/globals.css is the single source of design truth. Components consume generated utilities; a hex code, a bare `oklch(`, or `text-[17px]` inside a component is a defect, not a shortcut.
- Every SYSTEM.md decision becomes a token; every token traces to a SYSTEM.md line. No orphans in either direction.
- Full semantic color set in BOTH `:root` and `.dark` as complete oklch values — never bare HSL triplets, never `hsl(var(--x))` (legacy shadcn v3 pattern, dead).
- Tailwind 4.3 is CSS-first: no tailwind.config.js, no `@tailwind` directives, no `theme.extend`. Ever.
- Type scale is fluid; the hero token resolves to ≥3.5× `--text-base` at 1440px (taste floor).
- Three tiers, never skipped: **primitive** (raw scale — `--color-neutral-*`, never named by a component), **semantic** (intent — `--background`, `--primary`, `--ring`; what color/typography/depth already emit), **component** (one-off — `--pricing-featured-ring`, declared in the consuming component's own CSS, aliasing a semantic/primitive token). A component that invents a semantic token or hardcodes a value is skipping its tier — that is how the system rots.
- The cascade layer order is the specificity contract. Tailwind v4 ships `@layer theme, base, components, utilities`; treat it as law. Restyling shadcn's default look (taste demands it) is won by putting hand-written component CSS in `@layer components` — never by `!important`, never by an ever-deeper selector.
- Animatable tokens are `@property`-registered; static tokens are not. A plain custom property is untyped, so a color or gradient token inside a `transition`/keyframe snaps at the midpoint instead of interpolating. Register exactly the tokens that move — no more, and no exemption for a second engine: a token a DIRECTION-commissioned ultraweb:animejs timeline interpolates registers here like any other.
- `lib/motion.ts` is the same contract for time, and it is ONE mirror serving BOTH engines: motion-language's durations and curves live there once, read by `motion/react` in seconds and bezier arrays, and — only when DIRECTION.md commissions the SVG engine — by an appended `animeEase`/`animeDur` block (ms and `cubicBezier()`, per motion-language) for anime.js. Two engines, one set of numbers; a duration typed into a component is the same defect either way.
- globals.css is the single authoring source; `lib/tokens.ts` is its generated projection, never a second source. Everything inside the CSS cascade reads globals.css; everything outside it (react-email, `next/og` `ImageResponse`) reads the resolved-hex mirror — one generated file, never a hand-retyped second palette.

## Process

1. Read SYSTEM.md §color/§type/§layout/§depth/§shape/§motion. A missing decision means the owning skill hasn't run — run it. Never invent values here.
2. Write `:root` and `.dark` as plain CSS variables — the color skill's value table, verbatim. These are the primitive and semantic tiers; the component tier is declared later, inside each component's own CSS, aliasing back here — never a new value born in a component.
3. Bridge every var-referencing token through `@theme inline` (colors, fonts, radius math, shadows); literals (text scale, spacing, easings, keyframes) go in plain `@theme`. Rule: `inline` whenever a token references another CSS variable.
4. Define the entrance `@keyframes` inside `@theme`; durations and curves come from motion-language's `--dur-*`/`--ease-*` tokens, never hardcoded. Land its reduced-motion policy the way motion-language mandates: author every entrance utility inside `@media (prefers-reduced-motion: no-preference)` (worked example below) so motion is opt-in — reduce users receive the static end state and no `both`-fill entrance leaves content hidden. No global `reduce` kill-switch.
5. Register the tokens that animate with `@property` — a gradient `<angle>`, an interpolating `<color>` — each with a `syntax`, `inherits`, and `initial-value`. An untyped custom property is a string to the engine, so it snaps at the transition midpoint instead of tweening; register exactly those that move and no static token.
6. Make the cascade order explicit: Tailwind v4 already declares `@layer theme, base, components, utilities`, so any hand-written component override goes in `@layer components` and wins over shadcn's base styling by layer, not force. `!important` in component CSS means the layer order is wrong.
7. Base layer: body colors, default border-color, `::selection` in palette — craft in the last 2% (taste).
8. Dark mode is class-strategy: `@custom-variant dark` in CSS + next-themes — `<html suppressHydrationWarning>` and a client `<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>` wrapper.
9. Export `lib/tokens.ts` — a plain object of resolved sRGB-hex values for every semantic token, generated from this file (a ~20-line converter, never hand-typed). react-email templates and `next/og` `ImageResponse` render outside the cascade and read neither CSS variables nor `oklch()`; this is their single color source, so the brand can't silently fork.
10. Verify: `npm run build` clean, then Playwright `browser_evaluate` → `getComputedStyle(document.body).backgroundColor` resolves to the token value in BOTH themes.

## Worked example — app/globals.css (Tailwind 4.3)

```css
@import "tailwindcss"; /* establishes @layer theme, base, components, utilities — the specificity contract the overrides below rely on */

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

/* animatable tokens — typed so they interpolate instead of snapping (consumed by scroll-motion / micro-interactions) */
@property --gradient-angle { syntax: "<angle>"; inherits: false; initial-value: 180deg; }
@property --flow-accent { syntax: "<color>"; inherits: false; initial-value: oklch(0.53 0.16 45); }

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

@layer components { /* component tier: one-off values live here as named tokens aliasing the system — never a raw oklch() in JSX. Sits above shadcn's base, so overrides win by layer, no !important. */
  .roast-curve { --curve-stroke: var(--color-primary); stroke: var(--curve-stroke); } /* signature move; the animated angle uses --gradient-angle above */
}

@media (prefers-reduced-motion: no-preference) { /* motion-language policy: motion is opt-in. Entrance utilities attach their animation ONLY when the user allows motion — no `reduce` kill-switch fighting !important specificity, and a `both`-fill entrance can never leave reduce users staring at hidden content, because they receive the static end state directly. */
  .animate-fade-up { animation: fade-up var(--dur-section) var(--ease-out) both; }
  .animate-scale-in { animation: scale-in var(--dur-small) var(--ease-out) both; }
}
```

## Anti-patterns

- `tailwind.config`, `@tailwind base`, `theme.extend`, `darkMode:` — v3 relics; the config file must not exist.
- `hsl(var(--` and bare HSL triplets in `:root` — the dead shadcn bridge; full oklch only.
- `#`-hex, `rgb(`, `oklch(` inside `app/` or `components/` — grep for all three; only globals.css defines color. The lone sanctioned exception is a named component-tier token in that component's own CSS (`--pricing-featured-ring: var(--color-primary)`), never a literal in a `className`.
- A component inventing a semantic token, or reaching for a raw value, to cover a one-off — that is the component tier's job: a `--component-*` custom property declared in the component, aliasing a semantic/primitive token.
- `!important` in component CSS — the layer order is wrong, not the override too weak; move the rule into `@layer components` instead of forcing it.
- Animating a color/gradient token that was never `@property`-registered (it snaps at the midpoint), or registering static tokens that never move (noise) — type exactly the ones that interpolate.
- Hand-typed hex/`rgb()` in `email/` templates or `app/**/opengraph-image.tsx` — both must import `lib/tokens.ts`; a second palette drifts and no visual gate renders email or OG to catch it.
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
- ultraweb:component-api — its cva() variants resolve to the semantic tokens here, and any per-component one-off it needs is the sanctioned component tier; the two skills define the same three-tier dialect from opposite ends.
- ultraweb:micro-interactions, ultraweb:scroll-motion — animate the `@property`-typed color/gradient tokens registered here; without the registration those transitions would snap at the midpoint.
- ultraweb:theme-worlds — re-maps these `@theme` tokens for a scoped subtree via `@scope`/`data-world`; it re-decides values within the same tier model, never introduces a raw literal.
- ultraweb:email — reads `lib/tokens.ts` (resolved sRGB hex), not the raw `oklch()`, since email clients render neither CSS variables nor `oklch()`; this file generates that mirror.
- ultraweb:seo — its `opengraph-image.tsx` / `next/og` `ImageResponse` takes inline style objects with literal hex, so it reads the same `lib/tokens.ts` and share cards match the site exactly.
- ultraweb:gate-code — greps for the failure modes this file prevents: `!important` in component CSS, bare `oklch(`/hex in `components/`, and hex literals in `email/` or `opengraph-image.tsx` not sourced from `lib/tokens.ts`.
