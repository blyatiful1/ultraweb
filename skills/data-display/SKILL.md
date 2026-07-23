---
name: data-display
description: Tables, stat blocks, and charts for ultraweb builds — alignment discipline (numbers right in tabular-nums, text left), one precision per column, responsive table strategies (priority columns, card collapse, scroll container), stat-row typography, and chart restraint (one question per chart, tokens-only colors, bars start at zero). Invoke in Phase 6 whenever a page shows structured data — stats/KPI rows, feature or comparison tables, spec sheets, dashboards, leaderboards, or any chart ("add a stats section", "comparison table", "show the numbers", "add a chart"). The comparison matrix in ultraweb:pricing inherits these rules.
---

# data-display — numbers that read instantly

**Stage:** Phase 6 — Build - **Reads:** design/SYSTEM.md, design/SITEMAP.md, design/BRIEF.md - **Writes:** components/data/* (tables, stat blocks, charts)

## Standard

A first-grade data surface is scannable in 3 seconds: eyes land on the biggest number, compare down a column without wobble, and leave with one takeaway. Concretely: every numeric column right-aligned in tabular figures, one decimal precision per column, units stated once, semantic table markup, all four async states designed, and no chart that a sentence plus a big number would beat. Data is where craft shows — a misaligned decimal column reads as sloppiness everywhere else.

## Process

1. Read SITEMAP.md for each data surface. Decide the cheapest form that answers its question, in order: sentence → stat block → table → chart. Escalate only when the cheaper form loses information.
2. Per table, write the column spec: content type (text/number/date), alignment, precision, unit placement, and a priority rank (drives responsive behavior).
3. Build with semantic HTML — `<table>` for tabular data, always — styled from `@theme` tokens.
4. Apply alignment rules; confirm the SYSTEM.md font renders tabular figures (see below).
5. Choose ONE responsive strategy per table; verify at 375px with a screenshot, not a guess.
6. Add loading/empty/error states via ultraweb:ui-states.
7. Charts last: write the one-sentence takeaway first. If the sentence suffices, ship it with a stat block instead of the chart.

## Alignment rules

- Numbers right, `tabular-nums`, always. Verify the chosen font ships tabular figures (tnum) — not all do; if it doesn't, define a numeric-safe font token in `@theme` for data surfaces and flag it to ultraweb:typography.
- Text left. Center only single-glyph cells (status dot, check). A centered text column is the fastest way to look amateur.
- Headers align with their column's content — numeric header right, text header left.
- One precision per column: "4.0 / 12.5 / 7.3", never "4 / 12.5 / 7". Format with `Intl.NumberFormat` (locale separators for free), not string math.
- Units once, in the header — "Price (EUR)", "Weight (kg)" — not per cell. Currency symbol per cell only when currencies mix within a column.
- One date format sitewide; pick it in the column spec and stop re-deciding.

## Table variants

1. **Dense** — 40–44px rows, 13–14px text, hairline row separators. For real datasets users scan and compare: dashboards, leaderboards, logs.
2. **Comfortable** — 56–64px rows, 15–16px text, generous cell padding. For marketing-context tables (plans, spec highlights) where the table is also a design surface.
3. **Definition** — two columns, muted label left / value right. For spec sheets and key-value detail panels; beats a bulleted list every time.

## Responsive strategies

1. **Priority columns** — rank columns, hide the low-ranked at breakpoints (`hidden md:table-cell`); the identity column plus the key metric survive to 375px. Default for ≤6 columns.
2. **Card collapse** — below 640px each row becomes a card with inline labels (shares anatomy with ultraweb:cards). For heterogeneous rows or rows with touch actions.
3. **Scroll container** — `overflow-x-auto`, sticky first column, gradient fade edge signalling more content. Last resort, for true matrices (feature comparisons) only — never the lazy default for a 4-column table.

## Stat blocks

- **Stat row**: 3–4 KPIs. Value 2.5–3.5rem, semibold+, `tabular-nums`; label 0.8125–0.875rem, muted, consistently above or below across the row. Delta ("+12%") gets a direction icon plus semantic color — never color alone.
- Count-up: 400–700ms, ease-out, once on first view; under `prefers-reduced-motion` render the final value immediately.
- Framed Data (`award-canon`, an optional signature for ONE hero figure): wrap the count-up in a thematic SVG `<mask>`/`clip-path` frame that embodies the subject — a gauge, a filling vessel — so the figure reads as embodied, not floating (The Other Side of Truth framed war stats in bullet-hole vignettes, SOTY 2022). The frame is SVG/CSS; the number stays real DOM text with the full value in `aria-label`, never a canvas glyph. Static / reduced-motion fallback: the final number already inside the same frame. Reserve it for the hero stat — framing every figure is noise.
- Caption the timeframe/source ("last 30 days") — an unanchored number reads as marketing fiction.

## Chart restraint

- One question per chart. Title states the answer ("Signups doubled after launch"), not the axes ("Signups over time").
- Series colors from `@theme` tokens only — accent plus a neutral covers most charts; 3+ series get direct labels at line ends, not a legend color-hunt.
- Bars start at zero, always. Lines may crop the range but must show axis values.
- Gridlines: ≤5 horizontal hairlines, no vertical grid, no border box, no axis you don't need.
- Banned: 3D, dual y-axes, pies beyond 3 slices (use bars), gradient fills as decoration, a legend for a single series.
- Tooltip: token-styled, exact values in `tabular-nums`, 150–250ms fade (needs `"use client"`; keep chart clients leaf components).
- Sparklines and simple bars: hand-rolled SVG beats a chart dependency — a marketing site rarely earns one. If real interactivity demands a library, verify current options against docs first, then wrap it so every color and font flows from tokens.

## States

- Loading: skeleton mirrors the real column widths and a plausible row count — a spinner in a void tells the layout nothing.
- Empty: designed message plus the next action ("No invoices yet — create your first"), per ultraweb:ui-states.
- Error: what failed plus a retry affordance; never an empty table pretending to be zero rows.
- Interactive rows: hover background one token step, focus-visible ring, active press; sorted column shows `aria-sort` plus a direction icon on the active column only.

## A11y

- Every table gets a `<caption>` (visually-hidden if needed) or `aria-label`; `<th scope="col">` on headers, `<th scope="row">` on row identity cells.
- Row interaction lives on a real link/button inside a cell — an `onClick` on `<tr>` has no keyboard path.
- Charts get a text equivalent: the takeaway sentence adjacent, or a visually-hidden table of the data.
- Scroll containers are keyboard-reachable: `tabindex="0"` + `role="region"` + `aria-label` on the wrapper.
- Status and deltas never by color alone — icon or text carries the meaning.

## Anti-patterns

- `text-center` on data cells
- numeric columns missing `tabular-nums`
- `onClick` on `<tr>` with no focusable child
- zebra stripes + row borders + hover highlight stacked together — pick ONE separator
- units repeated in every cell ("$4.00, $5.00, $6.00" down a column)
- div-soup masquerading as a table when the data IS tabular
- pie with >3 slices; donut-with-centered-KPI as the default stat
- fake precision ("99.99999% uptime")
- `overflow-x-auto` as the only mobile plan for a narrow table

## Worked example — Tidepool, berth-utilization surface on /product

design/SYSTEM.md pairs General Sans (UI) with JetBrains Mono (data/numerals) on the dark-first "Precision Instrument" palette — so every figure already sits in a monospace, natively-tabular font, no tnum audit needed.

Decision for the `/product` berth table — **Dense** variant, 42px rows, 13px text, hairline row separators on surface `oklch(0.18 0.015 250)`. Column spec:
- Port — text, left, General Sans
- Calls — int, right, 0 decimals, JetBrains Mono `tabular-nums`
- Avg wait (h) — number, right, 1 decimal
- Utilization (%) — number, right, 1 decimal

Units stated once in the header, values formatted via `Intl.NumberFormat`, never string math. Above it a 3-KPI stat row: value 2.75rem semibold JetBrains Mono ("4.2h", "12,480", "94.0%"), labels 0.8125rem muted, deltas a direction icon plus teal accent `oklch(0.68 0.12 200)`, captioned "last 30 days". Responsive: priority columns — Port + Utilization survive to 375px, Calls and Avg wait (h) both go `hidden md:table-cell`.

Rejected a donut-with-centered-KPI for utilization: the question is "which ports are congested", which a ranked horizontal-bar list answers directly — a pie hides the ordering the analyst is scanning for.

Output lands in `components/data/berth-table.tsx`; ultraweb:pricing inherits this alignment and markup spec for the `/pricing` Starter/Growth/Fleet comparison matrix.

## Composes with

- ultraweb:ui-states — skeleton/empty/error design for every async data surface
- ultraweb:tokens — table and chart colors resolve to `@theme` tokens, never inline hex
- ultraweb:typography — confirms the pairing ships tabular figures before columns depend on them
- ultraweb:pricing — its comparison matrix inherits these alignment and markup rules
- ultraweb:social-proof — marketing stat rows reuse the stat-block spec
- ultraweb:micro-interactions — sort, hover, and tooltip feedback timing
- ultraweb:award-canon — Framed Data (a stat animating inside a thematic SVG/clip-path frame, the static framed number as fallback) is the canon technique for a hero figure here
