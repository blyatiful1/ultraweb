## Composes with

- ultraweb:copywriting — wrote every string; all copy fixes route back through its voice spec and length limits.
- ultraweb:seo — wired the metadata this gate audits; owns metadataBase, canonical, the OG fetch and dimension checks this gate defers to, and every template fix.
- ultraweb:sitemap — the route list defining crawl coverage and each page's conversion goal.
- ultraweb:wireframe — the section order the heading story should mirror.
- ultraweb:gate-accessibility — owns heading levels and landmarks; this gate owns the narrative.
- ultraweb:gate-antislop — overlapping dead-copy greps; antislop sweeps clichés broadly, this gate ties copy to completeness, and item 3's microcopy sweep is the same widen-the-banned-gate mechanism applied to controls.
- ultraweb:ui-states — defines the authoring standard for confirm/error/empty strings; item 3's microcopy sweep is the mechanical re-check that the standard actually shipped.
- ultraweb:buttons — owns the label component and its states; a bare-generic label flagged in item 3 is relabelled to verb+object here.
- ultraweb:pricing — owns the line-through discount UI and unit price (Grundpreis); item 6's 30-day-lowest disclosure is the completeness check that closes that seam for DACH/EU discounts.
- ultraweb:footer — owns the disclosure and utility links this gate crawls for 200s and anchor resolution; broken ones route back here.
- ultraweb:content-cms — owns the MDX article pipeline; a sampled /insights/[slug] with a missing or duplicate frontmatter title, or a dead in-body link, is fixed here.
- ultraweb:i18n — on localized builds, supplies the per-locale route list and hreflang pairs this gate dedupes titles across before calling metadata complete.
