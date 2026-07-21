---
name: layout-grid
description: Design the page layout system for an ultraweb build — container width strategy, 12-column and asymmetric grid vocabulary, section vertical rhythm with deliberate compression and release (never uniform py-24), at least four named asymmetry patterns, and bento composition rules — written to design/SYSTEM.md §layout during the foundation phase. Invoke in Phase 3 of the ultraweb pipeline once DIRECTION.md exists, or whenever layout feels monotonous, every section is the same centered column, spacing rhythm is flat, or someone asks for "a bento grid", "an offset layout", "asymmetric sections", "better section spacing", or "container widths".
---

# layout-grid — rhythm and asymmetry over wallpaper

**Stage:** Phase 3 — Foundation - **Reads:** design/DIRECTION.md, design/BRIEF.md - **Writes:** design/SYSTEM.md §layout + container tokens handed to ultraweb:tokens

## Standard

Layout is where decisions become visible. First-grade means: ONE container system (max 4 width tiers), a 12-column vocabulary with named splits, section spacing that changes tempo down the page, and at least one recurring asymmetry pattern — taste mandates it. Scrolling the page must feel like compression and release, not a metronome. The bar, concretely:

- One default content width; body copy never exceeds 72ch.
- ≥1 asymmetric split per page; 6/6 is the exception, reserved for true equals.
- ≥2 section-padding sizes per page; no three consecutive sections share a size.
- Everything lands on the 4px base unit; asymmetry is aligned to the grid, never off-grid drift.

## Process

1. Read DIRECTION.md for density stance (editorial-airy vs product-dense) and where the signature move lives — it usually claims the boldest asymmetry.
2. Set the container strategy (below); record the three tier values.
3. Fix the grid vocabulary: base columns, gaps, and 2-3 named splits this site will reuse.
4. Build the rhythm map: assign every SITEMAP section a size from compressed/standard/release.
5. Choose 1-2 asymmetry patterns from the named set as the site's recurring moves. One pattern repeated is a voice; a new pattern every section is chaos.
6. If the wireframe calls for a bento, apply the composition rules below.
7. Write SYSTEM.md §layout: tiers, splits, rhythm map, chosen patterns, bento verdict. Hand `--container-*` values to ultraweb:tokens.

## Container strategy

```css
@theme {
  --container-prose: 65ch;    /* long-form text */
  --container-content: 72rem; /* default sections; 80rem for marketing-heavy briefs */
  --container-wide: 88rem;    /* bento, galleries, data tables */
}
```

- Usage: `max-w-content mx-auto px-4 sm:px-6 lg:px-8` — `--container-*` tokens drive `max-w-*` in Tailwind v4.
- Full-bleed is a deliberate breakout (Edge Bleed below), never a missing `max-w`.
- Four tiers total (prose/content/wide/bleed). A fifth width appearing in code means the system leaked.

## Grid vocabulary

- Base: `grid grid-cols-12`, `gap-4` (16px) mobile, `gap-6`–`gap-8` (24-32px) desktop.
- Named splits: **Lead 7/5** (text-led feature), **Heavy 8/4** (media-led), **Reverse 5/7** (alternating sections), **Margin Note 3/9** (editorial meta rail). 6/6 only for comparisons and before/afters.
- Sub-layouts inside grid cells respond via container queries (`@container` on the cell, `@sm:` inside — Tailwind v4 core, no plugin).

## Vertical rhythm — compression and release

Uniform `py-24` on every section is wallpaper rhythm, banned by taste. Three named sizes:

| Size | Classes | Use |
|---|---|---|
| compressed | `py-12 md:py-16` (48/64px) | logo strips, stat bars, tickers, dense proof |
| standard | `py-20 md:py-28` (80/112px) | default content sections |
| release | `py-28 md:py-40` (112/160px) | hero exit, pre-CTA, chapter breaks |

Rules:
- The page arcs toward the primary CTA: compress the proof, release before the ask.
- Related sections compress toward each other; topic changes get release. Space encodes grouping.
- Adjacent sections sharing a background are one surface — split the boundary (`pb-10` + `pt-10`), never stack two full paddings.
- Space within a section < space between sections, always. Heading-to-content: `mt-12`–`mt-16` (48-64px).

## Asymmetry patterns (named)

1. **Offset Split** — Lead 7/5 or Heavy 8/4 with the two blocks' top edges deliberately misaligned by 2-4rem (`mt-8`–`mt-16` on one side). The workhorse; safe everywhere.
2. **Edge Bleed** — text stays in the container, media escapes to the viewport edge on ONE side: `lg:mr-[calc(50%-50vw)]` on the media column. Best for product shots and photography.
3. **Overlap Stack** — a card or stat block crosses a section boundary with `-mt-16`–`-mt-24` (64-96px), z-indexed above a contrasting surface. Stitches hero to first section; one per page.
4. **Staggered Rail** — a 2-column item grid where column two is pushed down `mt-12`–`mt-24` (48-96px). Breaks card-grid monotony; suits portfolios and testimonials.
5. **Margin Note** — 3/9 split: narrow sticky rail (section number, eyebrow, TOC) beside wide content. Editorial directions; pairs with long-form.

## Bento composition

- 4-7 cells on `grid-cols-2 md:grid-cols-4` (or 6); exactly ONE hero cell ≥2× any other's area (`col-span-2 row-span-2`).
- ≤3 distinct cell sizes; ONE gap value site-wide (`gap-4` or `gap-6`); one radius token from shape-language.
- Every cell earns real content — a stat, a live mini-demo, an image. No filler tiles, no "and much more".
- Max 1 media-heavy or animated cell; the rest stay typographically quiet so the hero cell sings.
- Mobile collapse: source order = importance order; the hero cell renders first at 375px.

## Responsiveness & a11y

- DOM order = reading order. Build asymmetry with grid placement, not `order-*` that splits tab order from visual order (WCAG 2.4.3).
- Overlap Stack: verify the overlapping element covers no interactive targets underneath; targets stay ≥44px even in compressed sections.
- Every pattern needs a decided 375px stacking order — never let it fall as it may. Check in gate-responsive screenshots.

## Anti-patterns

- `py-24` on most sections — grep `py-24`; >60% of sections = wallpaper rhythm.
- `max-w-7xl mx-auto` + `text-center` repeated per section — the centered-column wallpaper taste bans.
- `grid-cols-3 gap-6` identical cards as the features section — the three-card slop; defer to feature-sections.
- `grid-cols-2` at 6/6 for every split — no hierarchy between the halves.
- Random negative margins to fake asymmetry — off-grid misalignment is a defect, not composition.
- Bento with all-equal cells, or a filler cell padding out the grid.
- Ad-hoc widths — grep `max-w-[`; arbitrary container values mean the tier system is being bypassed.

## Worked example — Studio Norra, Oslo agency portfolio layout

design/DIRECTION.md: "Editorial Brutalist — exposed 12-col grid, oversized uppercase Archivo Expanded, deliberate rawness with high craft. Signature: cursor-proximity image reveals on the /work index."

Exposed grid means the columns must stay legible, so the site commits to two recurring asymmetries: **Margin Note 3/9** (a sticky rail carrying the case number + eyebrow beside the wide case body on /work/[slug] and /studio) and **Staggered Rail** for the /work index, where column two drops `mt-24` so the cursor-reveal thumbnails never resolve into a tidy card grid — the boldest split hosts the signature move. Container tiers handed to tokens:

```css
@theme {
  --container-prose: 65ch;    /* case-study running text */
  --container-content: 72rem; /* /studio, /contact */
  --container-wide: 88rem;    /* /work index + full-bleed case imagery */
}
```

Rhythm on /work/[slug]: `release` hero exit (`py-28 md:py-40`), then a `compressed` credits/role strip (`py-12 md:py-16`), then `standard` narrative sections — never three py-24s in a row. Rejected a centered 6/6 gallery for the index: equal halves flatten the exposed-grid tension the direction is built on, and 6/6 is reserved for true comparisons. Output lands in design/SYSTEM.md §layout (tiers + split names + rhythm map); ultraweb:tokens mints the `--container-*` tokens and ultraweb:wireframe blueprints each /work section against the split names.

## Composes with

- ultraweb:tokens — container tiers land as `--container-*` tokens in app/globals.css `@theme`.
- ultraweb:wireframe — consumes the split names and rhythm sizes when blueprinting each section.
- ultraweb:hero — builds its variants on Offset Split and Edge Bleed at full energy.
- ultraweb:feature-sections — governed by the bento and split rules here.
- ultraweb:gate-responsive — verifies rhythm and asymmetry survive 375/768/1440 screenshots.
- ultraweb:taste — supplies the asymmetry mandate and anti-wallpaper rule this skill operationalizes.
- ultraweb:gate-antislop — greps the anti-patterns defined here (`py-24` wallpaper, `max-w-[` arbitrary widths, repeated centered columns) and fails the build when the rhythm or tier system leaks.
- ultraweb:gate-visual — its design-judge scores this skill's compression-and-release rhythm and recurring asymmetry against taste's required list; flat spacing or a missing asymmetry reads as a required-list miss.
