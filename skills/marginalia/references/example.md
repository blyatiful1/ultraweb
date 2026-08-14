## Worked example — Aldermoor Trust, annual-report page furniture

SITEMAP marks `/report/2025` as long-form (a ~9-minute read); the landing `/` stays bare. DIRECTION is the foundation's quiet-civic register; the page inherits content-cms's system: Source Serif 4 body, deep-green accent `oklch(0.45 0.1 155)`, warm paper. layout-grid's **Margin Note 3/9** reserves the column and sets `--gutter-w`.

Primary tenant: a **Sidenote Gutter** — the report cites audited figures, so numbered notes ride the margin at ≥1440px (endowment return, grant splits, fee basis). Riding the top-outer edge above it: a **Running Folio** (`aria-hidden`, current programme section) and a **Read-o-meter** reading `9 min · 41%` in green-tinted small-caps. Copy on a real note: *"3. Net of the 0.4% management fee; figures as audited by [firm]."* — never `href="#"`, the ref is `<a href="#fn-3" aria-describedby="fn-3">`.

Degrade: at 768px the notes collapse to native popovers on tap; at 375px they become an endnotes `<ol>` with two-way links and no gutter — nothing scrolls sideways. Reduced motion: the folio swaps instantly and the percent updates without the spring.

Rejected: a **Section Rail** — the report reads start-to-finish, not jump-around, and a scrollspy TOC would fight the sidenotes for the one margin column (one-tenant rule). Also rejected: scroll-motion's fixed top **progress bar** — the print register wants progress as marginal type, not a UI bar. The **Running Folio** leads instead on Studio Norra's case study, where named sections are the thing a reader loses.

Handoff: reading time comes from content-cms's build-time field; `scrollYProgress` and reveal discipline from scroll-motion; the margin column and `--gutter-w` from layout-grid. Notes stay in-DOM after their reference so seo indexes them and screen readers read them in order. gate-responsive verifies the 1440 → 768 → 375 collapse; gate-accessibility verifies note reachability, real anchors, and the reduced-motion behavior.
