## Worked example — Casa Verde, EN/PT menu across three widths

From design/SITEMAP.md: `/en`, `/en/menu`, `/en/story`, `/en/reservations` and the `/pt/*` mirror — the runner swept all eight routes × 375/768/1440.

Defect caught (check 2, overflow): the signature day's-harvest strip — the horizontally-scrolling row of today's market finds above the menu — used `w-screen` inside the padded `<main>`, so `/en/menu` at 375 gave `scrollWidth` 390 vs `clientWidth` 375: 15px of page-level horizontal scroll.

Fix → ultraweb:layout-grid: the bleed moved off `w-screen` onto a `100%`-width section that clips, with the strip scrolling inside its own `overflow-x-auto`. Re-check: overflow evaluation `false` at all three widths, in both `/en` and `/pt`.

Also at 375 → ultraweb:i18n (it owns the switcher and the translated strings): the EN/PT locale toggle measured 30×30 (check 3, padded to 44), and the PT label "Reservar mesa" overflowed the header where "Book a table" fit — shortened for the mobile header.

Rejected: `overflow-hidden` on `<body>` — it zeroes the scrollWidth number while shipping the clipped harvest strip. Symptom hidden, defect shipped.

Final sweep, zero fixes in between — all eight routes × three widths on disk, overflow `false` and no target under 44 anywhere:

| Route | 375 | 768 | 1440 |
|-------|-----|-----|------|
| /en | qa/en-375.png | qa/en-768.png | qa/en-1440.png |
| /en/menu | qa/en-menu-375.png | qa/en-menu-768.png | qa/en-menu-1440.png |
| /en/story | qa/en-story-375.png | qa/en-story-768.png | qa/en-story-1440.png |
| /en/reservations | qa/en-reservations-375.png | qa/en-reservations-768.png | qa/en-reservations-1440.png |
| /pt | qa/pt-375.png | qa/pt-768.png | qa/pt-1440.png |
| /pt/menu | qa/pt-menu-375.png | qa/pt-menu-768.png | qa/pt-menu-1440.png |
| /pt/story | qa/pt-story-375.png | qa/pt-story-768.png | qa/pt-story-1440.png |
| /pt/reservations | qa/pt-reservations-375.png | qa/pt-reservations-768.png | qa/pt-reservations-1440.png |

Handoff: the PASS row lands in design/QA.md with `qa/en-menu-375.png` + `qa/en-menu-375-menu.png`; ultraweb:gate-visual then judges the same production server of record (:3100) with these captures as its precondition, scoring the corrected layouts, not the broken ones.
