---
name: cards
description: Design and build the card system — hierarchy inside the card, one site-wide hover motif, image handling, and group layouts that refuse uniformity. Five named variants (media-top, icon-lede, stat, editorial, feature-object) with when-to-use, full interactive state coverage including card-as-link focus behavior, and rules for card groups that don't read as wallpaper. Invoke during the Build phase whenever a surface calls for cards — blog or case-study grids, service and feature cards, stat blocks, bento cells — or when the user says "the cards look generic", "make the cards interesting", or a grid of identical boxes is emerging.
---

# cards — hierarchy at small scale

**Stage:** Phase 6 — Build - **Reads:** design/SYSTEM.md, design/DIRECTION.md, app/globals.css - **Writes:** components/ui/card.tsx restyle + card compositions in components/

## Standard

A card is a hierarchy exercise in a small box: one focal element, scannable in under 2 seconds, at most three type levels (kicker/meta → headline → body). A GROUP of cards is a composition exercise: three identical icon-cards as the default features row is banned outright (taste), and any longer run of visual twins is wallpaper — cap identical siblings at 3 (see group layouts). Restyle the shadcn Card after `npx shadcn@latest add card` — the default border+radius+shadow is a primitive, not a design. React 19 note: shadcn primitives ship without forwardRef and expose `data-slot` attributes — target sub-parts via `data-[slot=...]` selectors, not fragile child combinators. A reusable card owns its own responsive behavior: any variant that can appear in more than one context (grid, bento cell, sidebar) MUST reflow off its own container width via `@container`, never viewport breakpoints — a card built with `md:flex-row` silently breaks the moment it lands in a 1-of-4 cell narrower than the viewport implies.

## Process

1. Read SYSTEM.md: radius language, elevation language (tinted shadows per `ultraweb:depth`), spacing unit, accent role.
2. Pick a variant per content type from the table below. A page may mix variants — mixing is a feature, not an inconsistency.
3. Define ONE hover motif for the whole site (see states) and encode it in the card component once, never per-instance.
4. Compose the group: sizes, offsets, or variant mixing so no more than three siblings are visual twins.
5. Wire states: hover, focus-visible (card-as-link), active, skeleton — the skeleton itself belongs to `ultraweb:ui-states` but must mirror this exact layout.
6. Verify: text-over-image contrast ≥4.5:1 computed; card links keyboard-reachable with a visible ring.

## The five variants

| Variant | When | Key rules |
|---|---|---|
| **media-top** | blog, case studies, products — honest imagery exists | Fixed aspect (16/10 or 4/3), `overflow-hidden` wrapper radius matches card |
| **icon-lede** | abstract services/features | 20-24px lucide icon in a shaped container (`ultraweb:shape-language`), max 3 per row |
| **stat** | metrics, proof numbers | Number ≥2.5x body, `tabular-nums`; accent on the number or nowhere |
| **editorial** | text-led directions, link lists | Kicker + headline + meta row; type does the work, no image |
| **feature-object** | bento cells, product showcases | Visual bleeds to cell edge, text pinned to one corner over a gradient scrim, text block ≤50% of cell |

Image handling (media-top, feature-object): `next/image` with `fill` + `sizes` inside the aspect-locked wrapper, `placeholder="blur"` for local imports. No `preload` — card images are below the fold; `preload` is reserved for the LCP element (`priority` is deprecated in Next 16).

## Hierarchy inside the card

- One focal element per card — image, number, or headline. Two focals = zero focals.
- Internal padding 24-32px (6-8 steps on the 4px scale); title-to-body gap TIGHTER than card-to-card gap — proximity does the grouping, not boxes.
- Meta rows (date, tags, read time) at 0.8-0.875x body in the muted-foreground token, never accent.

## Card-as-link + states

When a card has one destination, the whole card is the tap target: stretch the title's `<a>` over the card (`after:absolute after:inset-0`), keeping the accessible name = the real title — never a bare "Learn more". No nested interactive elements inside a stretched-link card; if a card needs a secondary action, the card is not a link.

- **hover** — ONE motif site-wide: lift (translate-y -2 to -4px + shadow one step up), image zoom (scale 1.03 inside the clipped wrapper), or border/accent shift. 150-250ms, SYSTEM easing token, transform/opacity/box-shadow only. Never scale the whole card past 1.02.
- **focus-visible** — same ring as buttons (`focus-visible:ring-2` + offset, palette-matched) drawn on the card boundary via the stretched link — keyboard users get the hover affordance too.
- **active** — lift returns to 0 (pressed = grounded), 80-100ms.
- **loading** — skeleton matching this exact layout: aspect box, two text lines, meta row. Never a spinner in a card slot.
- **disabled** — does not exist. A card that can't be visited isn't rendered as a card.

Under `prefers-reduced-motion`, transform motifs (lift, zoom) fall back to the border/accent or shadow shift only — no translate or scale; state changes stay instantly visible. Policy per `ultraweb:motion-language`.

## Group layouts that avoid uniformity

- Cap identical siblings at 3 — a 4th must vary in size, variant, or content shape.
- Bento sizing and placement belong to `ultraweb:feature-sections`; equal-importance content never gets bento.
- Offset alternate columns (translate-y on even children, 24-48px) in editorial grids — one deliberate asymmetry, per taste.
- Mixed grids (2 media-top + 1 stat) beat 3 clones.
- Container-aware, not viewport-aware: name the container on the card wrapper (`@container/card`) and query IT (`@sm/card:grid-cols-[9rem_1fr]`), never the viewport — Tailwind v4 core, no plugin. The named query reads the wrapper's own width (24rem at `@sm`), so one component reflows correctly in a sidebar and a 4-up grid alike.

## Worked example — case-study grid

Six case studies, editorial direction. Not 6 clones: row 1 is one wide media-top card (featured, 2-col span, 16/10 image) beside one stat card (the featured project's headline metric). Rows 2-3 are four editorial cards, no images, offset alternate columns by 32px. One hover motif site-wide: lift -2px + shadow step, 200ms. Each card is a stretched link named by its title; skeletons mirror all three shapes. The grid reads as a curated wall, not a database dump — and the featured project is unmistakably first.

## A11y

- Heading level inside the card fits the page outline — usually `h3` under a section `h2`, consistent across the group.
- Stretched-link cards: link text is the card title; screen readers must never land on "Learn more" ×6.
- Scrim over feature-object images guarantees 4.5:1 on the pinned text — computed, not eyeballed.
- Hover-revealed content (if any) must also appear on focus-within and be present in DOM for touch users.

## Anti-patterns

- `rounded-xl shadow-lg` uniformly on every card — depth without hierarchy (banned list).
- `hover:scale-105` — a 5% scale on a card is a lurch, not a lift.
- Three identical icon-cards in a row (banned; `ultraweb:feature-sections` owns the fix).
- `Learn more` as every card's CTA text.
- Border AND heavy shadow simultaneously at rest — pick one from the SYSTEM.md depth language.
- `md:`/`lg:` viewport classes driving a card's INTERNAL layout when the card can appear in more than one grid context — it breaks in the narrower cell; use `@container` (see group layouts).
- Gray placeholder rectangles where images belong — `ultraweb:imagery` owns honest placeholders.

## Composes with

- ultraweb:feature-sections — decides WHERE cards appear and the group pattern; this skill designs the card itself.
- ultraweb:depth — the shadow/border elevation language cards consume.
- ultraweb:shape-language — radius scale and icon-container geometry.
- ultraweb:micro-interactions — hover/press choreography beyond the CSS defaults here.
- ultraweb:ui-states — skeletons that mirror card layout 1:1.
- ultraweb:imagery — image treatment and placeholder strategy for media-top and feature-object.
- ultraweb:component-api — the variant/prop contract a reusable card exposes; `@container` reflow is the responsive half of that same "the component owns its own behavior" contract.
- ultraweb:social-proof — testimonial and "proof number" (stat variant) cards are card compositions: this skill owns the box and its states, social-proof owns the trust content and where proof appears.
