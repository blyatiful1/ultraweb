## Composes with

- ultraweb:typography — §type supplies the print type stack (a serif at pt sizes, print leading); this skill only re-targets it inside `@media print`.
- ultraweb:imagery — its screen treatments (duotone, grain, mesh) are stripped for print; the lone logo that keeps its color is the one `print-color-adjust: exact` exception.
- ultraweb:seo — the print letterhead's legal-identity block (name, Registergericht, USt-IdNr) is the same entity seo marks up as `Organization`/`LegalService` JSON-LD — single source of truth, different medium.
- ultraweb:consent — the consent banner and its backdrop are chrome this skill hides in print; consent owns the markup, print-craft removes it from the page.
- ultraweb:sitemap — flags which routes are document-shaped, deciding per page whether it gets the designed variant or only the lean reset.
- ultraweb:handoff — republishes the print-tested routes and the browser-footer note so the client can produce GoBD/compliance PDFs.
