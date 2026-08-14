## Worked example — Ledger & Lane, boutique law-firm findability

design/SYSTEM.md fixes the OG palette — ink navy `oklch(0.25 0.02 260)`, warm paper `oklch(0.975 0.005 80)`, muted gold `oklch(0.72 0.09 85)`. ImageResponse can't read `globals.css`, so I resolve them to `#23252e`, `#f7f5ef`, `#c2a15e` and set ink type on paper with gold only on the divider rule — the palette reserves gold for a single accent per page.

Root layout: `metadataBase: new URL("https://ledgerandlane.com")`, `title: { default: "Ledger & Lane — Considered Counsel", template: "%s — Ledger & Lane" }`. The home page carries one `LegalService` node; `/attorneys` profiles each get their own `Attorney` node (name, jobTitle, worksFor):

```ts
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LegalService",
  name: "Ledger & Lane",
  url: "https://ledgerandlane.com",
  makesOffer: practiceAreas.map((a) => ({ "@type": "Offer", name: a.title })),
};
```

Insights are MDX, so `/insights/[slug]` runs `generateMetadata` with `await params`, and its `BlogPosting` reads `headline`, `datePublished`, and `author` from the article frontmatter.

As a German-facing law firm, Ledger & Lane sets `aiCrawlerPolicy: "disallow"`: robots.ts denies the training set (GPTBot, ClaudeBot, Google-Extended, CCBot, Bytespider) as its UrhG §44b *Nutzungsvorbehalt*, while `*: allow` plus the sitemap keep Google indexing every page; design/SEO.md logs the reason. `llms.txt` is skipped as unproven.

Rejected: aggregate `Review`/`AggregateRating` markup on the practice-area pages — nothing visible there shows a rating, and invisible structured data invites a manual penalty, so `LegalService` + `Attorney` stay the only entities marked up.

Handoff: exports land as per-route `metadata`, `app/opengraph-image.tsx`, and an `app/sitemap.ts` mirroring the six routes from design/SITEMAP.md; `ultraweb:gate-content` then greps for duplicate titles and missing canonicals before Phase 10 closes.
