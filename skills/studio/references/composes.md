## Composes with

- ultraweb:scaffold — creates it, right after the dev-server smoke test; skips it at sketch tier
- ultraweb:status — PROGRESS.md is the page's spine; the top panel is that file rendered, never re-derived
- ultraweb:checkpoint — REVIEWS.md fills the ledger panel; an open checkpoint is the loudest thing on the page
- the Phase 11 gates — QA.md is the gate table's only source; every gate ignores `/studio` in return
- ultraweb:hidden-craft — kinship, not overlap: both are craft signals, but hidden-craft ships to the visitor and this dies at the build boundary
- ultraweb:ship — its smoke test fetches `/studio` on the production server expecting 404; a 200 blocks the deploy
- ultraweb:handoff — documents the deletion: one route group, one folder, zero cleanup
- ultraweb:app-structure — the feed is the single `"use client"` leaf; page and handlers stay server-side
- ultraweb:seo — `/studio` never enters SITEMAP.md, `sitemap.ts`, or `robots.ts`
