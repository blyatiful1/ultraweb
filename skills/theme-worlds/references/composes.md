## Composes with

- ultraweb:color — defines and AA-verifies every `--world-*` accent pair in both modes; theme-worlds owns the scoping mechanism, color owns the values and the contrast proof.
- ultraweb:tokens — lands the world tokens in globals.css and supplies the `@theme inline` bridge that makes re-declaring `--primary` on a subtree cascade to every utility; worlds work *because* tokens used `inline`.
- ultraweb:depth — shadows use `--shadow-color` (a neutral), so an accent-only world leaves elevation untouched by construction; a world re-tinting shadows would collide with the mode axis.
- ultraweb:app-structure — worlds are static server-rendered `data-world`/`data-mode` attributes (route layout, section, or article), never a provider; the "no new context in the root layout" rule applied to theming.
- ultraweb:scroll-motion — the Scroll-as-Journey per-act `data-mode` shift rides on this skill's mechanism; the shift is scrolling between statically-themed sections, not a scroll listener re-theming.
- ultraweb:award-canon — Content-Derived Color (derive the world from the content) and Scroll-as-Journey (per-room `data-mode`) are the principles this skill executes at the cheapest rung — steal the scoped-palette principle, never the ThemeProvider surface.
- ultraweb:cards — the case-study/project card is the usual `data-world` carrier in a portfolio grid; each card lights its own accent while its structure stays the site-wide card.
- ultraweb:set-design — the world axis re-points the DOM accent and the scene re-points its material palette from the same `lib/tokens.ts` values; neither invents one, and a hex literal in a uniform or a material constructor is this skill's "every value stays a token" rule broken in GLSL.
