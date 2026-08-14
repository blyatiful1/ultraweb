## Composes with

- ultraweb:navigation — hosts the visible ⌘K pill in the header and guarantees every indexed item also has a normal, crawlable link; the palette never replaces the nav, it accelerates it.
- ultraweb:overlays — owns the dialog mechanics the palette rides on: focus-trap, focus restore to the trigger, scroll-lock, Escape, and open/close choreography.
- ultraweb:ui-states — supplies the loading, empty (recent/suggested), no-results, and error states; the palette defers all four rather than inventing its own.
- ultraweb:forms — the no-JS `/search` `<form method="get">` and the input's label/type/`role="search"` follow forms' field and validation contract.
- ultraweb:content-cms — feeds the build-time index from MDX/page frontmatter (title, section, url, keywords); the palette consumes what content-cms structures.
- ultraweb:seo — marks the `/search` results route `noindex` and keeps the crawlable link graph the palette is layered over.
- ultraweb:icons — the search glyph, group icons, and the `↵`/`esc` hints come from one lucide set at the SYSTEM stroke width, never emoji.
- ultraweb:copywriting — writes the empty-state suggestions, the no-results path-out line, and the pill label in the brief's voice.
- ultraweb:app-structure — the palette is a `"use client"` leaf; the index build and `/search` page stay server-side.
- ultraweb:gate-accessibility — runs the keyboard walkthrough and JS-disabled test that prove the accelerator-not-only-path and combobox-ARIA claims.
