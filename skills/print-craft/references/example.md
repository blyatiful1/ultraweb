## Worked example — Ledger & Lane, a printable Impressum and engagement letter

design/SITEMAP.md flags `/impressum` and `/mandat` (engagement letter) as document-shaped; everything else takes the lean reset. design/SYSTEM.md §type hands over Newsreader (serif) for body — already the right register for print — and the palette's ink navy `oklch(0.25 0.02 260)`, warm paper, and gold accent.

In `@media print` the paper base goes white, ink navy resolves to pure `#000` for ink economy, and the single gold divider rule becomes a `1pt solid #000` hairline. `@page { size: A4; margin: 20mm 18mm; }`; Newsreader body at 11pt/1.5. Both pages take the **Legal-Document** variant: a `.print-letterhead` (hidden on screen) renders "Ledger & Lane · Amtsgericht Charlottenburg HRB 000000 · USt-IdNr DE000000000" so the saved PDF identifies itself without the nav. Each `<section>` carries `break-inside: avoid` so a numbered clause never splits mid-sentence; `h2/h3` get `break-after: avoid`; the Impressum's links to the Kammer and the Berufsordnung expand via `main a[href^="http"]::after` while the in-page anchors and the mailto stay clean. The print-only letterhead reuses the exact name/registry block `ultraweb:seo` marks up as the `LegalService` JSON-LD entity — one source, two surfaces.

Page numbering leans on the browser's native footer; the Mandant keeps it on when saving the engagement letter to PDF for their file.

Rejected: `@page { @bottom-right { content: "Seite " counter(page) } }` for firm-branded page numbers — it renders nothing in browser print, and pulling in Paged.js to get it would violate the zero-dependency scope for a surface the native footer already handles.

Handoff: `ultraweb:consent` owns the cookie banner markup that this block hides in print; `ultraweb:handoff` republishes the two print-tested routes plus the "keep the browser footer on to get page numbers when saving to PDF" note so the firm can produce compliant records.
