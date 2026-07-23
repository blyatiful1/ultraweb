---
name: seo
description: Findability layer for the Next.js 16 App Router — Metadata API with generateMetadata and awaited params, metadataBase, per-page unique titles and descriptions, opengraph-image.tsx via ImageResponse from next/og, sitemap.ts, robots.ts, manifest.ts, icon.tsx, and JSON-LD structured data. Invoke in the findability phase of every build, and whenever the user mentions SEO, Google ranking, meta tags, OG images, social share previews, sitemap, robots, structured data, rich results, canonical URLs, or "my site doesn't show up in search".
---

# seo — findable, sharable, machine-readable

**Stage:** Phase 10 — Findability - **Reads:** design/BRIEF.md, design/SITEMAP.md, design/SYSTEM.md (palette + type for OG), copy in code - **Writes:** metadata exports per route, app/opengraph-image.tsx, app/sitemap.ts, app/robots.ts, app/manifest.ts, app/icon.tsx, JSON-LD blocks

## Standard

Every route ships: a unique title ≤ 60 chars and a description of 140–160 chars in the site's voice (written by `ultraweb:copywriting`, never keyword mush), a canonical URL, a designed OG image built from the actual palette and type stance, and JSON-LD for whatever entity the page really is. `sitemap.xml` and `robots.txt` generated from real routes, with robots.txt carrying an explicit, logged AI-crawler decision — never an unset default. Zero duplicate titles site-wide — `gate-content` checks.

## Process

1. **Root layout first** — `metadataBase` + title template. Without `metadataBase`, every OG and canonical URL renders relative and social scrapers drop the card:

```ts
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://kilnandco.com"),
  title: { default: "Kiln & Co — Small-Batch Ceramics", template: "%s — Kiln & Co" },
  description: "Stoneware thrown, glazed, and fired in one Lisbon studio.",
};
```

2. **Static pages**: `export const metadata: Metadata = { title: "About", description: "…", alternates: { canonical: "/about" } }`. Title WITHOUT the suffix — the template appends it. Only the home page uses `default`, which bypasses the template.
3. **Dynamic routes**: `generateMetadata` — params is a Promise in Next 16, await it:

```ts
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: `/journal/${slug}` },
    openGraph: { title: post.title, description: post.summary, type: "article" },
  };
}
```

4. **OG image**: `app/opengraph-image.tsx`, plus per-segment ones for key dynamic routes (rules below).
5. **sitemap.ts / robots.ts / manifest.ts / icon.tsx** — file conventions, typed via `MetadataRoute.*` (below).
6. **JSON-LD** on every page that represents a real entity (pattern below).
7. Verify: `npm run build`, then view source of every route — unique title, canonical present, OG URLs absolute; hit `/sitemap.xml`, `/robots.txt`, and `/opengraph-image` directly.

## OG images — ImageResponse rules

```tsx
// app/opengraph-image.tsx
import { ImageResponse } from "next/og";

export const alt = "Kiln & Co — small-batch ceramics from Lisbon";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between",
                    width: "100%", height: "100%", padding: 64, background: "#faf6f0", color: "#1c1917" }}>
        <div style={{ display: "flex", fontSize: 76, fontWeight: 600, letterSpacing: "-0.03em" }}>Kiln &amp; Co</div>
        <div style={{ display: "flex", fontSize: 32, color: "#a8552f" }}>Small-batch ceramics, fired in Lisbon</div>
      </div>
    ),
    size
  );
}
```

- **Flexbox only — no CSS grid.** The renderer doesn't support it, and any div with multiple children needs explicit `display: "flex"` or it errors.
- It never reads `globals.css`: resolve palette tokens to hex/rgb literals here (oklch support in the renderer: verify against current docs first).
- Design it like a section of the site, not a screenshot: dominant type, one accent, real copy. 1200×630 is the default and correct size.
- Custom fonts inside ImageResponse: verify against current docs first; a system-stack bold at 64–80px is an acceptable floor.
- Dynamic segments get their own `opengraph-image.tsx` pulling the page's real title — `await params` there too.

## Route files

```ts
// app/sitemap.ts — routes come from design/SITEMAP.md, never invented
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://kilnandco.com", lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: "https://kilnandco.com/shop", lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  ];
}
```

```ts
// app/robots.ts — the AI-training-crawler policy is a logged CLIENT decision, not a default
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      // brief.aiCrawlerPolicy === "disallow" → deny the AI-training set (a named group wins over "*")
      {
        userAgent: ["GPTBot", "ClaudeBot", "Google-Extended", "CCBot", "Bytespider", "Applebot-Extended"],
        disallow: "/",
      },
    ],
    sitemap: "https://kilnandco.com/sitemap.xml",
  };
}
```

**AI-crawler policy is a logged decision, not a default.** Whether AI-training crawlers may scrape the site is `brief.aiCrawlerPolicy` (`"disallow"` default | `"allow"`) — set it and record the reason in design/SEO.md; an unset default silently reads as consent. For a DACH client it is legally operative: under the EU DSM Directive (2019/790) Art. 4 TDM exception, transposed as German **UrhG §44b**, a *maschinenlesbarer Nutzungsvorbehalt* in robots.txt IS the opt-out act — silence reads as permission to train. Trust-critical or editorial clients (law firms, portfolios, publications) default to `disallow`; a docs-heavy SaaS may `allow` for answer-engine reach, logged with that reason. Citability is a separate lever from training rights: `Google-Extended` gates Gemini training but not Google Search, and blocking the live fetchers (`ChatGPT-User`, `PerplexityBot`) is what actually drops you from AI answers — so disallow the training set to stop uncompensated reuse while staying citable, or block the fetchers too and accept that cost.

- `llms.txt`: a proposed `/llms.txt` markdown site summary for LLMs — cheap and harmless to emit, but treat it as unproven: no major crawler has confirmed it reads the file. Ship it if the client asks; never trade real robots.txt directives for it.
- `manifest.ts`: name, short_name, `theme_color`/`background_color` from the palette — not defaults.
- `icon.tsx`: ImageResponse at 32×32 rendering a real mark (consult `ultraweb:shape-language`). The constitution demands "favicon real" — the framework default is a defect.

## JSON-LD

Server component, inline script, escape `<` to block script injection:

```tsx
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Kiln & Co",
  url: "https://kilnandco.com",
};

<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
/>
```

Type per page: `Organization`/`LocalBusiness` on home · `Article`/`BlogPosting` on posts (headline, datePublished, author) · `Product` with offers on product pages · `BreadcrumbList` on nested routes · `FAQPage` belongs to `ultraweb:faq` — don't duplicate it here. Only mark up what is visibly on the page; invisible structured data risks a manual penalty. Validate with Google's Rich Results Test before closing the phase.

## Anti-patterns

- `next/head` / `<Head>` — Pages Router relic; the Metadata API replaces it entirely
- `metadata` exported from a `"use client"` file — build error; move it to a server file
- `params.slug` read without `await` in `generateMetadata` — Next 16 params are Promises
- missing `metadataBase` — relative OG URLs, broken share cards
- identical `<title>` on multiple pages; description pasted from the H1
- `keywords` meta tag — dead weight since 2009
- `display: "grid"` inside ImageResponse — unsupported, renders nothing
- JSON-LD stringified without the `<` escape
- `robots.ts` shipped with the AI-crawler policy unset for a DACH client — under UrhG §44b, silence is a machine-readable *yes* to AI training
- titles stuffed with `| Home | Welcome` — the template owns the suffix, the page owns one clean name

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
