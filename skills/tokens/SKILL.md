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

Moved to `references/example.md` — read only when this build's case is genuinely ambiguous; the sections above are the decision material.

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

Moved to `references/composes.md` — the handoff map; load it when orchestrating this skill against its neighbors.
