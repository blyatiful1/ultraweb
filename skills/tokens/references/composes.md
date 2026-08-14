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
