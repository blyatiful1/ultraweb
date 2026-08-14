## Composes with

- **ultraweb:typography** — supplies the small-caps label rule (uppercase, 11–13px, +0.10–0.14em), the caption step the notes are set at, and the body measure the gutter sits outside.
- **ultraweb:layout-grid** — its **Margin Note 3/9** column *is* the gutter; marginalia claims it via `--gutter-w` and enforces one tenant per margin, never a second grid.
- **ultraweb:scroll-motion** — provides `useScroll`/`scrollYProgress` for the read-o-meter and the once-only reveal discipline; the read-o-meter is its `ReadingProgress` rendered as text, not a bar.
- **ultraweb:navigation** — the Section Rail is an in-page TOC nav; coordinate its active-state semantics and the `top-24` sticky offset with the site header so the rail clears it.
- **ultraweb:content-cms** — computes the build-time reading-time field and hosts the MDX where footnotes/sidenotes are authored; the article measure and prose type come from there.
- **ultraweb:seo** — footnotes/sidenotes stay in-DOM after their reference, so they're crawled and read in order; furniture adds no metadata surface.
- **ultraweb:gate-responsive** — verifies the gutter → popover → endnotes degrade at 1440/768/375 with zero horizontal scroll.
- **ultraweb:gate-accessibility** — verifies note reachability, real anchors (no `href="#"`), `aria-hidden` only on echoing furniture, and the reduced-motion readouts.
