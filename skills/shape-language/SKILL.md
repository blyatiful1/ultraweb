---
name: shape-language
description: Design the geometry system for an ultraweb build — a coherent --radius-* scale matched to the direction's personality, the nested-radius formula (inner = outer minus padding), one site-wide shape motif family, and divider/clip-path/SVG-accent patterns — written to design/SYSTEM.md §shape during the foundation phase. Invoke in Phase 3 of the ultraweb pipeline once DIRECTION.md exists, or whenever corners look incoherent ("mixed radii", "the rounding feels off"), nested corners look thick, sections need dividers or angled edges, or someone asks for "clip-path sections", "SVG accents", "corner radius scale", or "shape language".
---

# shape-language — one geometry, carried everywhere

**Stage:** Phase 3 — Foundation - **Reads:** design/DIRECTION.md - **Writes:** design/SYSTEM.md §shape + --radius-* @theme tokens handed to ultraweb:tokens

## Standard

Shape is the quietest identity carrier on a site — corners, edges, and accents say more about personality than color does. First-grade means: ONE radius personality chosen from the direction and applied everywhere, nested corners that are concentric (formula below), one geometric motif family echoed in 3+ places, and dividers that are decisions, not gray defaults. The test: crop any 200×200px region — the geometry alone should identify the site. The bar:

- ≤4 radius token values in use, plus 0 and full.
- Zero nested elements where inner radius ≥ outer radius.
- One motif family; an accent appears ≥3 places or gets cut.

## Process

1. Read DIRECTION.md and map the archetype to a radius personality: **Sharp** 0-0.25rem (brutalist, editorial, technical), **Soft** 0.375-0.75rem (product/SaaS default), **Round** 1-1.5rem (friendly consumer, playful). `rounded-full` is reserved for pills, avatars, badges — a Round site may promote it to buttons; a Sharp site never uses it.
2. Define the scale as `--radius-*` tokens (Tailwind v4 namespace → `rounded-sm`…`rounded-xl` utilities):

```css
@theme {
  --radius-sm: 0.375rem; /* badges, chips, small inputs */
  --radius-md: 0.625rem; /* buttons, form fields */
  --radius-lg: 1rem;     /* cards, panels */
  --radius-xl: 1.5rem;   /* hero media, modals, bento cells */
}
```

   Shift the whole column down for Sharp, up for Round — the ratios hold.
3. Apply the nested-radius formula wherever containers nest (below).
4. Choose the motif family matching the personality; list its 3+ placements.
5. Decide the divider system: default, statement, and where none.
6. Write SYSTEM.md §shape: personality, tokens, formula reminder, motif + placements, divider rules. Hand tokens to ultraweb:tokens.

## Nested radii — the concentric formula

**inner radius = outer radius − padding between them.** Clamp at 0.

- Card at `--radius-xl` (1.5rem) with `p-4` (1rem) → the image inside gets 0.5rem: `rounded-[calc(var(--radius-xl)-1rem)]`.
- Padding ≥ outer radius → inner is square (0). Never invert.
- Equal inner and outer radii read as a thick, drifting corner — the #1 amateur tell in card design.
- Applies to: images in cards, thumbnails in bento cells, buttons inside input groups, nested panels, avatars in badges.

## Motif families

Pick ONE, matched to the radius personality. Two languages on one site is no language.

- **Rule & bracket** (Sharp) — hairlines, corner ticks/brackets, plus-grid backgrounds, strict 90° geometry. Placements: image frames, section corners, list markers.
- **Arc & capsule** (Soft/Round) — circles, half-round image masks (`rounded-t-full`), capsule tags, arced dividers.
- **Slant** (high-energy directions) — one fixed angle (2-4°, or a fixed 3rem rise) reused in clip-path edges, skewed image masks, parallelogram tags.
- **Stamp & notch** (playful/commerce) — ticket-edge notches, scalloped edges, sticker outlines.

The motif must appear ≥3 places or be cut — a single occurrence reads as an accident.

## Dividers

- The default divider is SPACE (layout-grid's rhythm), not a line. Two adjacent sections with different backgrounds need no divider at all — the color change is the divider.
- When a line: 1px, foreground token at 8-12% alpha; either full container width or a deliberately short 2-3rem accent rule under a heading. Never a default mid-gray `<hr>`.
- Statement dividers — one style site-wide, used 2-4 times max:
  - Angled edge: `clip-path: polygon(0 0, 100% 0, 100% calc(100% - 3rem), 0 100%)` on the section. Add bottom padding equal to the cut (`pb-12` for 3rem) so content isn't clipped; keep the cut direction consistent all page.
  - SVG curve: inline SVG with `fill="currentColor"`, colored by the NEXT section's background so the seam disappears; `aria-hidden="true"`.
- Parametric, not pasted — a statement divider is a formula with recorded numbers, so it re-derives at any width: angled edge = one angle θ, rise `tan(θ)·container-width` clamped to 2-5rem; arc = `M0,h Q 50%,h-r 100%,h` with sag r at 2-6% of the width; wave = `y = A·sin(2πx/λ)` sampled into cubics, λ dividing the container width exactly so the seam disappears. Record θ / r / A+λ in SYSTEM.md §shape — a downloaded wave-divider SVG with numbers nobody chose is the template tell.

## SVG accents

- Inline or data-URI only — self-contained, theme-aware via `currentColor`. Every decorative SVG gets `aria-hidden="true" focusable="false"`.
- Curated set: hand-drawn underline beneath ONE key headline word per page (animate `stroke-dashoffset` over 400-700ms on reveal if motion-language allows; under `prefers-reduced-motion` the underline renders fully drawn (static), no dashoffset animation); corner brackets on featured cards; dot/plus grid backgrounds at 4-6% opacity; circled-word or arrow annotations in editorial directions.
- Accents obey the motif family — brackets on a Sharp site, arcs on a Round one. Decoration outside the family is slop.

**Animation-ready authoring.** Any SVG a motion skill will later touch is drawn for it up front — retrofitting a flattened export costs more than authoring it right:

- ONE path per independently animatable element; a merged path cannot stagger. Stable hand-written IDs (`#curve-rise`, never `#path-1247`) — selectors are a contract, and ultraweb:media-optimization's SVGO pass must preserve them (`cleanupIds: false`).
- No baked `transform` attributes on animatable nodes: bake geometry into `d` and leave `transform` free for the engine. Keep `viewBox`, drop `width`/`height`, keep `stroke="currentColor" fill="none"` and `aria-hidden="true" focusable="false"`.
- Morph pairs (state A → state B) need identical point counts, command order, and drawing direction, or the interpolation turns inside out. Draw B by editing a copy of A, never from scratch.
- One path drawing on reveal is CSS `stroke-dashoffset` (above). Multi-path timelines, morphs, motion paths, and scroll-scrubbed sequences are a commissioned moment — ultraweb:animejs owns those, and only when DIRECTION.md names it.

## Focus & hit-area notes

- Focus rings trace the element's radius — `outline` and Tailwind's ring (box-shadow) both follow `border-radius`. Verify pill buttons visually in gate-accessibility.
- `clip-path` clips hit-testing: clicks outside the clipped shape fall through. Keep interactive targets (≥44px) fully inside the visible shape near a cut edge.

## Anti-patterns

- `rounded-xl` on every element uniformly (taste ban) — grep `rounded-xl` density; a healthy build uses 3-4 radius utilities with intent.
- Mixed personalities — grep `rounded-full` and `rounded-none`; coexistence outside pills/avatars needs DIRECTION.md justification.
- Inner radius ≥ outer radius in nested markup — audit for thick corners in gate-visual screenshots.
- Scale bypass — grep `rounded-[`; more than a couple of arbitrary values (beyond the concentric calc) means the tokens are being ignored.
- Blob and squiggle SVGs as decoration — banned regardless of direction.
- `<hr>` or a `border-t` line between every section — grep `<hr`; wallpaper separation.
- Clip-path sections without compensating padding — text clipped at the cut edge.

## Worked example — Loop & Thread, geometry for a handmade-textiles shop

DIRECTION.md reads "Soft Craft — tactility through generous radius, close-up photography, unhurried motion." Generous radius is stated intent, so the archetype maps to **Round** (1–1.5rem band), the whole column shifted up one notch:

```css
@theme {
  --radius-sm: 0.625rem;  /* review pills, chips */
  --radius-md: 0.875rem;  /* buttons, form fields */
  --radius-lg: 1.25rem;   /* product cards */
  --radius-xl: 1.5rem;    /* hero media, /journal covers */
}
```

The flat-lay→in-hand hover image sits in a `--radius-lg` card with `p-2` (0.5rem), so it takes `rounded-[calc(var(--radius-lg)-0.5rem)]` = 0.75rem — concentric, no drifting corner behind the crop. Motif family: **Arc & capsule** — capsule "small-batch" tags on shop cards, an arced SVG divider (fill = the shop grid's linen) between hero and grid, and a thread-spool circle accent in the footer: three placements, so it stays.

Rejected **Stamp & notch** (ticket-edge product cards): the notched-coupon look reads as discount commerce and undercuts the unhurried, handmade calm the palette (`oklch(0.94 0.012 80)` linen, `oklch(0.45 0.08 265)` indigo) is buying.

Output lands in design/SYSTEM.md §shape; the four `--radius-*` tokens hand to ultraweb:tokens, which writes them into app/globals.css `@theme`, and ultraweb:cards pulls the concentric calc for every `/products/[slug]` gallery frame.

## Composes with

- ultraweb:direction — the archetype dictates the radius personality and motif family.
- ultraweb:tokens — the scale ships as `--radius-*` tokens in app/globals.css `@theme`.
- ultraweb:cards — heaviest consumer of the concentric formula (images and media inside cards).
- ultraweb:buttons — button/input radii come from `--radius-md`; input-group nesting uses the formula.
- ultraweb:imagery — image masks and background patterns borrow this skill's geometry; imagery owns texture, shape owns form.
- ultraweb:gate-antislop — sweeps for uniform rounded-xl, blob SVGs, and default dividers.
- ultraweb:icons — SVG accents and motif glyphs match lucide's icon stroke-width so decoration and UI icons read as one weight.
