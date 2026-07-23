---
name: print-craft
description: Design the print stylesheet (@media print) as a real surface for document-shaped pages — hide nav/consent/chrome, expand meaningful link URLs, control page breaks, set print type and @page margins, and economize ink — with a DACH focus on the Impressum, AGB, and Datenschutzerklärung, invoices, and quotes that German business practice routinely saves to PDF for compliance records. Invoke in the craft phase for any legal page, engagement letter, invoice/order confirmation, quote, case study, or annual report, or when the user says "the print version looks broken", "make it print/PDF cleanly", "print stylesheet", "save as PDF", "Impressum/AGB/Datenschutz to PDF", or "print-to-PDF".
---

# print-craft — the page that prints

**Stage:** Phase 10 — Craft (last-2%) - **Reads:** design/SITEMAP.md (which routes are document-shaped), design/SYSTEM.md §type, design/DIRECTION.md - **Writes:** app/print.css (imported into app/globals.css), print-only header markup on document pages

## Standard

Every site ships a lean print reset; a small number of document-shaped pages earn a designed print layout. The reset is not optional — a legal page or invoice sent to the printer with the browser default (nav bars, a cookie banner across the top, gradient headings printing as gray mud, links that read `Datenschutz` with no URL) is a broken surface on a real, auditable user path. Restraint applies here too: **most pages need the reset, not a design project.** A marketing landing page does not deserve a print layout — nobody prints it, and forcing one violates the constitution for zero reader benefit. Spend the craft only where a human actually hits Ctrl-P or "Save as PDF": legal pages, contracts, quotes, invoices, case studies, annual reports.

The DACH reason this skill exists at all: in German-speaking business practice the **Impressum**, **AGB**, and **Datenschutzerklärung** are routinely printed or saved to PDF as compliance records — a user keeps the Datenschutzerklärung as evidence of what they were told, an accountant keeps the **Rechnung** and **Auftragsbestätigung** under GoBD retention, a Mandant keeps the engagement letter. Those pages get a real page. This is the last-2% jurors never see but the client's lawyer does.

Print is monochrome and paginated — two facts the screen design ignored. Design for both: black ink on white paper, and content that breaks across pages without severing a heading from its clause or a table from its header row.

## Wiring

Keep print rules in their own `app/print.css` and import it after Tailwind so they stay greppable and unlayered:

```css
/* app/globals.css */
@import "tailwindcss";
@import "./print.css";   /* unlayered — beats Tailwind's @layer utilities without an !important war */
```

In Tailwind v4 every utility lives in `@layer utilities`, and an **unlayered** declaration wins over any layered one regardless of source order — so plain rules in `print.css` override `flex`, `bg-*`, `shadow-*` inside `@media print` with no `!important` needed (reserve `!important` for the color-adjust reset alone). Everything below lives inside one `@media print { … }` block.

## The lean reset — every site gets this

```css
@media print {
  /* ink economy: kill the screen's color, shadow, and texture */
  *, *::before, *::after {
    background: transparent !important;
    box-shadow: none !important;
    color: #000 !important;
    text-shadow: none !important;
  }
  body { font: 12pt/1.5 Georgia, "Times New Roman", serif; margin: 0; }

  /* hide the chrome — nav, footer, consent, floating widgets, motion */
  header nav, footer, [data-print="hide"],
  .cookie-banner, [role="dialog"], .back-to-top, .share-bar,
  video, [aria-hidden="true"] { display: none !important; }

  /* reveal content the screen collapsed, or the printed AGB loses half its text */
  details { display: block !important; }
  details > summary { display: none !important; }
  [hidden] { display: revert !important; }

  a { text-decoration: underline; }
  img { max-width: 100% !important; }
  @page { size: A4; margin: 18mm; }
}
```

`print-color-adjust` (with `-webkit-` prefix) defaults to *economy* — the browser drops your dark backgrounds for you. Only set it `exact` on the **one** element whose real color is load-bearing (a logo), never globally. Note `print-color-adjust: exact` on that logo is the counterpart to the global `background: transparent` above — the exception, not the rule.

## Designed variants — for document-shaped pages only

Pick the variant from what the page *is* (SITEMAP.md flags it). Each adds to the reset; none replaces it.

**Legal-Document** — Impressum, AGB, Datenschutzerklärung, an engagement letter (Mandatsvereinbarung). A print-only letterhead carrying the firm's legal identity, section rules that survive a page break, and expanded URLs so the printed authority links are actually usable:

```css
@media print {
  .print-letterhead { display: block !important; border-bottom: 1pt solid #000;
    padding-bottom: 6pt; margin-bottom: 18pt; font-size: 10pt; }
  h2, h3 { break-after: avoid; }            /* a heading never sits alone at a page foot */
  section, .clause, dl > div { break-inside: avoid; }
  p { orphans: 3; widows: 3; }
  /* expand only meaningful links; nav, buttons, in-page anchors stay clean */
  main a[href^="http"]::after { content: " (" attr(href) ")"; font-size: 9pt; word-break: break-all; }
  a[href^="#"]::after, a[href^="mailto:"]::after, a[href^="javascript:"]::after { content: ""; }
}
```

The `.print-letterhead` block is `display: none` on screen and reveals only in print — put the firm name, Registergericht, HRB, and USt-IdNr there so the saved PDF is self-identifying without the site nav.

**Case-Study / Portfolio** — one project per sheet, so a case study reads as a discrete document: `.case { break-before: page; }` (the first stays put via `.case:first-child { break-before: auto; }`), figures held whole with `figure { break-inside: avoid; }`, captions kept with their image via `figcaption { break-before: avoid; }`. Strip the imagery treatments — a duotone hero is ink-hog and meaningless in gray.

**Pricing / Quote** — an invoice, Angebot, or Auftragsbestätigung. Add a print-only "Prepared for {name} · {date}" line and a generated timestamp so the paper artifact is dated and attributable; right-align the figures in `tabular-nums`; repeat table headers across pages with `thead { display: table-header-group; }` and hold each line item with `tr { break-inside: avoid; }`.

## Pagination — and the page-number trap

`break-inside`, `break-before`, `break-after` (modern; `page-break-*` is the legacy alias), plus `orphans`/`widows`, are well supported in browser print. **`@page` margin boxes are not.** The advice you'll find everywhere — `@page { @bottom-right { content: counter(page) } }` for page numbers — silently renders nothing in Chrome, Firefox, or Safari print; it only works in a paged-media engine (Paged.js, Prince, a server renderer). So:

- For page numbers, rely on the **browser's native footer** — the print dialog already offers "page X of Y" and a date, and the user keeps them on precisely when saving an Impressum or Rechnung for records. Don't fight it.
- If a client genuinely needs CSS-controlled numbering or a repeating printed header on *every* page, that crosses out of zero-dependency scope into Paged.js or a server-side PDF route — flag it as a real decision, don't fake it with `position: fixed` (which repeats unreliably across engines).

## Anti-patterns

- **No `@media print` block at all** on a site with `/impressum`, `/agb`, `/datenschutz`, an invoice, or a quote — the browser default is a defect on a compliance path. Grep the codebase; `print.css` should exist.
- `@page { @bottom-right { content: counter(page) } }` or `@top-center { … }` — margin-box counters are ignored by every browser's print engine. Dead code that looks like it works.
- Blanket `a[href]::after { content: attr(href) }` — expands nav, buttons, `href="#"`, and `mailto:` into URL noise. Scope to `main a[href^="http"]` and null out the rest.
- Content trapped in a collapsed `<details>`, tab, or `[hidden]` that prints empty — the AGB's own clauses vanish. Force `details`/`[hidden]` open in print.
- `print-color-adjust: exact` set globally to "preserve the design" — forces every dark background onto paper and drains a cartridge. One element, one reason.
- Fixed `px` font sizes in the print block — print type is measured in `pt`; px anchors to a screen assumption.
- A duotone/grain/mesh treatment left on for print — costs ink, says nothing in monochrome. Strip it (see `ultraweb:imagery`).

## Worked example — Ledger & Lane, a printable Impressum and engagement letter

design/SITEMAP.md flags `/impressum` and `/mandat` (engagement letter) as document-shaped; everything else takes the lean reset. design/SYSTEM.md §type hands over Newsreader (serif) for body — already the right register for print — and the palette's ink navy `oklch(0.25 0.02 260)`, warm paper, and gold accent.

In `@media print` the paper base goes white, ink navy resolves to pure `#000` for ink economy, and the single gold divider rule becomes a `1pt solid #000` hairline. `@page { size: A4; margin: 20mm 18mm; }`; Newsreader body at 11pt/1.5. Both pages take the **Legal-Document** variant: a `.print-letterhead` (hidden on screen) renders "Ledger & Lane · Amtsgericht Charlottenburg HRB 000000 · USt-IdNr DE000000000" so the saved PDF identifies itself without the nav. Each `<section>` carries `break-inside: avoid` so a numbered clause never splits mid-sentence; `h2/h3` get `break-after: avoid`; the Impressum's links to the Kammer and the Berufsordnung expand via `main a[href^="http"]::after` while the in-page anchors and the mailto stay clean. The print-only letterhead reuses the exact name/registry block `ultraweb:seo` marks up as the `LegalService` JSON-LD entity — one source, two surfaces.

Page numbering leans on the browser's native footer; the Mandant keeps it on when saving the engagement letter to PDF for their file.

Rejected: `@page { @bottom-right { content: "Seite " counter(page) } }` for firm-branded page numbers — it renders nothing in browser print, and pulling in Paged.js to get it would violate the zero-dependency scope for a surface the native footer already handles.

Handoff: `ultraweb:consent` owns the cookie banner markup that this block hides in print; `ultraweb:handoff` republishes the two print-tested routes plus the "keep the browser footer on to get page numbers when saving to PDF" note so the firm can produce compliant records.

## Composes with

- ultraweb:typography — §type supplies the print type stack (a serif at pt sizes, print leading); this skill only re-targets it inside `@media print`.
- ultraweb:imagery — its screen treatments (duotone, grain, mesh) are stripped for print; the lone logo that keeps its color is the one `print-color-adjust: exact` exception.
- ultraweb:seo — the print letterhead's legal-identity block (name, Registergericht, USt-IdNr) is the same entity seo marks up as `Organization`/`LegalService` JSON-LD — single source of truth, different medium.
- ultraweb:consent — the consent banner and its backdrop are chrome this skill hides in print; consent owns the markup, print-craft removes it from the page.
- ultraweb:sitemap — flags which routes are document-shaped, deciding per page whether it gets the designed variant or only the lean reset.
- ultraweb:handoff — republishes the print-tested routes and the browser-footer note so the client can produce GoBD/compliance PDFs.
