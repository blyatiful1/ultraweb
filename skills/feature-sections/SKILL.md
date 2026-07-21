---
name: feature-sections
description: Build the feature/benefit sections of a page — the anti-three-cards skill. Chooses and implements one of five named layout patterns (alternating split, bento grid, sticky-scroll showcase, numbered editorial list, tabbed showcase) based on content shape, and enforces the adjacency rule that no two neighboring sections share a layout pattern. Invoke during the Build phase for any "features", "benefits", "how it works", "what we do", "services", or "capabilities" section named in design/SITEMAP.md, or whenever a features area is drifting toward three identical icon-cards in a row.
---

# feature-sections — never three cards again

**Stage:** Phase 6 — Build - **Reads:** design/SITEMAP.md, design/DIRECTION.md, design/SYSTEM.md, app/globals.css - **Writes:** components/sections/*.tsx

## Standard

Three identical icon-cards in a row is the strongest AI-slop signal on the web — taste bans it outright. First-grade feature sections: each communicates ONE idea, has a focal point findable in under a second, and looks composed enough to screenshot alone. Across the page, sections form a rhythm — layout, background, and density alternate deliberately. Server components by default; interactivity is a client leaf, never the section root.

## Process

1. Read the section blueprint in `design/SITEMAP.md`: how many features, content depth per feature (one line vs paragraph vs visual demo), and where the signature move lives.
2. Pick a pattern per feature set from the chooser below — the content shape decides, not habit.
3. Run the adjacency check against the page's FULL section order (hero, proof, pricing included); swap patterns or reorder in SITEMAP.md before building.
4. Build with SYSTEM.md tokens only: spacing from the rhythm scale, one accent, type scale as defined. Card-shaped cells defer to `ultraweb:cards`.
5. Design mobile, don't collapse into it: decide stack order (text before visual), what sticky/tabbed degrade to, and verify at 375px.
6. Entrance motion defers to `ultraweb:scroll-motion` — section reveals 400-700ms, once-only, reduced-motion honored.
7. Screenshot 375/1440 and self-check: one focal point per section? Any two neighbors twins?

## Pattern chooser

| Content shape | Pattern |
|---|---|
| 2-4 features, each earns a paragraph + real visual | alternating split |
| 4-7 features of UNEQUAL weight, one hero capability | bento grid |
| 3-5 sequential steps telling one story | sticky-scroll showcase |
| Process / method / values, imagery weak or absent | numbered editorial list |
| 3-5 parallel capabilities sharing one surface type | tabbed showcase |

## The five patterns

### 1. Alternating split
Text one side, visual the other, direction flips each row. Split at 45/55 or 40/60 — never 50/50, that's dead symmetry. Visual min-height 360px on desktop. Mobile: stack, text first. The alternation IS the rhythm — don't also center the text column.

### 2. Bento grid
Mixed-size cells on a 12-col grid. Exactly one cell spans 2 cols or 2 rows — the hero cell, holding the strongest visual. No two adjacent cells the same size. Cell interiors follow the `ultraweb:cards` feature-object variant. If every feature is equally important, bento is a lie — pick another pattern or decide an order. Once per page, maximum.

### 3. Sticky-scroll showcase
One pane pins (usually the visual) while 3-5 text steps scroll past, swapping the visual per step. CSS `position: sticky` does the pinning; reach for `useScroll` from `motion/react` (client leaf, `"use client"`) only when the visual must track progress continuously. Mobile and reduced-motion degrade to a plain stacked list of step + visual — content must read fully without pinning. Native scroll speed always; scroll-jacking is banned.

### 4. Numbered editorial list
Oversized numerals (01, 02, 03) anchor typographic entries; visuals optional. Numerals ≥3x body size, display face or tabular figures, tinted low-contrast so the headline still wins. Entries separated by hairline rules or generous space — never boxed into cards. The honest choice when imagery is weak: confident type beats fake screenshots.

### 5. Tabbed showcase
Tabs switch one large shared visual/demo surface. `npx shadcn@latest add tabs`, then restyle — the default is a wireframe, not a design. Reserve the panel height for the tallest content so switching never shifts layout. Auto-advance optional at 6-8s; it must pause on hover/focus and stop entirely under `prefers-reduced-motion`.

## States

- **Tabbed showcase** — active trigger styled distinctly from hover (fill or underline shift, never hover styling reused); focus-visible ring per SYSTEM on every trigger; panel change animates ≤250ms, transform/opacity only.
- **Sticky-scroll showcase** — current step emphasized (text opacity or accent shift) as it enters view, with ALL steps readable at rest — emphasis is a highlight, never a gate on content.
- Interactive states inside card-shaped cells and CTAs defer to `ultraweb:cards` / `ultraweb:buttons`.

## The adjacency rule

No two adjacent sections on a page share a layout pattern — counting ALL neighbors: hero, social-proof, pricing, FAQ, not just feature sections. Additionally, adjacent sections alternate at least one of: background (band vs page), width (full-bleed vs contained), density (compressed vs airy). A page that goes split → split, or centered-stack → centered-stack, has wallpaper rhythm — fix the ORDER in SITEMAP.md; never decorate the twin to disguise it.

## A11y

- One `h2` per section, features as `h3` — the heading outline must read as a story alone (gate-content checks this).
- Tabs keyboard-operable: arrow keys between triggers, focus-visible rings; restyling must keep the wiring shadcn generated.
- Sticky-scroll: all step text present in DOM order; no content reachable only via scroll progress.
- Text over band backgrounds: 4.5:1 computed, not eyeballed — `ultraweb:color` owns the math.

## Anti-patterns

- `md:grid-cols-3` wrapping three identical icon+h3+p children — the banned pattern this skill exists to kill.
- `Feature 1`, `Feature 2` — placeholder copy anywhere in a section.
- Uniform `py-24` on every section — spacing must compress and release per SYSTEM.md rhythm.
- Every section `text-center` with `mx-auto` — the centered-column wallpaper.
- Two bento grids on one page.
- Staggered fade-up on every element in every section — motion becomes meaningless (banned list).

## Worked example — SaaS landing feature stack

SITEMAP.md lists: hero, logo wall, 3 core capabilities (each with product screenshot), a 4-step onboarding story, 6 secondary features, pricing. A passing order:

1. Hero (typographic, from `ultraweb:hero`) → 2. logo wall (compressed band, `ultraweb:social-proof`)
3. Alternating split ×3 for the core capabilities — paragraphs + screenshots fit the shape
4. Sticky-scroll showcase for onboarding — sequential story, one evolving visual, contrast against the splits above
5. Bento grid for the 6 secondary features — one spans 2 cols (the strongest), dark band background for release after the sticky section
6. Pricing (contained, light) → FAQ (accordion list — differs from the contained pricing table in pattern and density)

Every neighbor pair differs in pattern AND in at least one of background/width/density. That is the bar.

## Composes with

- ultraweb:wireframe — upstream owner of section order; adjacency conflicts get fixed there first.
- ultraweb:cards — designs bento cells and any card-shaped feature entries.
- ultraweb:layout-grid — the grid, container widths, and compression/release rhythm these patterns live on.
- ultraweb:scroll-motion — entrance reveals and useScroll wiring for the sticky showcase.
- ultraweb:copywriting — feature headlines and body; a weak-looking pattern is often weak copy.
- ultraweb:imagery — the visuals in splits and bento hero cells; never gray boxes.
- ultraweb:gate-antislop — greps the built sections for the three-identical-cards pattern and adjacency twins this skill guards against; a slip fails there, not here.
- ultraweb:icons — supplies the icon set and stroke-width discipline for any single icon placed in a bento cell or list entry — never three identical icon-cards.
