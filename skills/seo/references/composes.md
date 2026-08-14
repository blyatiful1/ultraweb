## Composes with

- **ultraweb:copywriting** — writes every title and description in voice; this skill only wires them.
- **ultraweb:brief** — logs `aiCrawlerPolicy` and its reason at brief stage; robots.ts only enforces that decision.
- **ultraweb:sitemap** — the route inventory that sitemap.ts and canonicals must mirror exactly.
- **ultraweb:i18n** — adds `alternates.languages` hreflang when the brief is multilingual.
- **ultraweb:faq** — owns FAQPage schema inside its section markup.
- **ultraweb:color** — the OG image uses its palette, resolved to literals.
- **ultraweb:gate-content** — verifies uniqueness and completeness of everything above.
- **ultraweb:content-cms** — defines the MDX frontmatter (title, summary, publishedAt, author) that `/insights` generateMetadata and the BlogPosting JSON-LD read.
- **ultraweb:routing** — owns the dynamic segments (`/practice/[area]`, `/insights/[slug]`) whose awaited `params` shape generateMetadata mirrors.
- **ultraweb:ship** — sets the production origin that `metadataBase` hard-codes; the absolute OG and sitemap URLs break if the deploy domain drifts from it.
