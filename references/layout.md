# layout

The page layout system: grid, container widths, vertical rhythm, and asymmetry used where it earns its place.

Load when: setting up the layout system, or when pages read as one repeated column.
Reads: design/DIRECTION.md, design/BRIEF.md, design/SITEMAP.md. Writes: design/SYSTEM.md §layout and container tokens (`references/tokens.md`).

## Method

1. Read the density stance in DIRECTION.md (dense and product-like, or airy and editorial) and where the signature move sits. It usually owns the page's strongest layout decision.
2. Fix the container tiers and the grid vocabulary (below), and record them.
3. Give each section in SITEMAP.md a spacing size from the rhythm scale, chosen by what the section is.
4. Choose layout structure per section from what its content needs. Record any asymmetry with the reason; asymmetry is a tool, not a quota. A page where everything has equal weight needs hierarchy, which sometimes comes from an offset and sometimes from scale, color or a rule.

## Containers

Define at most four width tiers as tokens (a reading width in `ch`, a default content width, a wide width for galleries and tables, and full-bleed as a deliberate break-out). Values come from the content: a reading width around 60-70ch; content widths from the density stance. `--container-*` theme variables drive `max-w-*` utilities in Tailwind. A fifth width in code means the system leaked. Full-bleed is a decision, not a missing `max-w`.

## Grid

- A 12-column base with gaps that grow with the viewport (about 16px on phones, 24-32px on desktop). All spacing is a multiple of the base unit (4px).
- Name the splits the site reuses, for example 7/5 for text-led, 8/4 for media-led, 3/9 for a margin rail. Use 6/6 for true equals such as comparisons. List only the ones used.
- Components that render at several widths respond to their container (`@container`), not the viewport.
- DOM order equals reading order. Build layout with grid placement, not `order-*` that separates tab order from visual order.

## Vertical rhythm

Use three or four named section sizes and vary them with the content: tight for dense proof (stat rows, lists), standard for ordinary sections, generous for chapter breaks and the space before a main call to action. Pick the numbers from the density stance, as a scale from the base unit (for instance 48/80/128px as a starting range, and 64/112/160px for airy directions).

- Related sections sit closer; a change of topic gets more space. Space encodes grouping.
- Space inside a section is smaller than space between sections.
- Adjacent sections that share a background are one surface; split the padding at the join instead of stacking two full paddings.
- Uniform padding on every section is the thing to avoid. The rhythm gate reports how uniform the page is; treat a flat result as a prompt to look at hierarchy, not as a number to game.

Offscreen sections beyond the third screen height (long archives, footer sitemaps) can use `content-visibility: auto` with a measured `contain-intrinsic-size` (for example `auto 900px`). An unmeasured size trades paint cost for layout shift. Exempt the section that holds the LCP element, sticky-scroll sequences and any showpiece.

## Asymmetry, with a reason

Use these when a section's content calls for them, and say which and why in SYSTEM.md:

| Pattern | What it does | Use when |
|---|---|---|
| Offset split | two blocks start at different heights (2-4rem) | one block is the lead and the other supports it |
| Edge bleed | text stays in the container, media runs to one viewport edge (`margin-right: calc(50% - 50vw)`) | a product or photograph deserves scale |
| Overlap | a block crosses a section boundary with a negative margin, above a contrasting surface | joining two sections that belong together; one per page, and keep interactive targets uncovered |
| Staggered columns | column two starts lower in a two-column list | breaking a uniform card grid where order does not matter |
| Margin rail | narrow sticky column (number, label, contents) beside wide content | long-form or reference pages |
| Collage | two or three images overlap with slight consistent rotation | print-like editorial subjects; never on the section holding the signature move |

Rules: every pattern has a decided stacking order at 375px (rotation off, full-width stack, hero element first); target size stays at least 44px; negative margins are for a pattern from this table, not for faking variety. A bento grid is one option among these, not the default fix for a features section; when used, give it one dominant cell, a single gap value and real content in every cell, and collapse it with the most important cell first.

## Anti-patterns (grep)

`py-24` on most sections · `max-w-7xl mx-auto text-center` repeated per section · `grid-cols-3 gap-6` of identical cards as the features section · `grid-cols-2` at 6/6 for every split · `max-w-[` arbitrary widths · negative margins that are not part of a named pattern · `order-` classes that change reading order.
