---
name: seo
description: Findability layer for the Next.js 16 App Router — Metadata API with generateMetadata and awaited params, metadataBase, per-page unique titles and descriptions, opengraph-image.tsx via ImageResponse from next/og, sitemap.ts, robots.ts, manifest.ts, icon.tsx, and JSON-LD structured data. Invoke in the findability phase of every build, and whenever the user mentions SEO, Google ranking, meta tags, OG images, social share previews, sitemap, robots, structured data, rich results, canonical URLs, or "my site doesn't show up in search".
---

# seo — findable, sharable, machine-readable

**Stage:** Phase 10 — Findability - **Reads:** design/BRIEF.md, design/SITEMAP.md, design/SYSTEM.md (palette + type for OG), copy in code - **Writes:** metadata exports per route, app/opengraph-image.tsx, app/sitemap.ts, app/robots.ts, app/manifest.ts, app/icon.tsx, JSON-LD blocks

## Standard

Every route ships: a unique title ≤ 60 chars and a description of 140–160 chars in the site's voice (written by `ultraweb:copywriting`, never keyword mush), a canonical URL, a designed OG image built from the actual palette and type stance, and JSON-LD for whatever entity the page really is. `sitemap.xml` and `robots.txt` generated from real routes. Zero duplicate titles site-wide — `gate-content` checks.

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
// app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/" }, sitemap: "https://kilnandco.com/sitemap.xml" };
}
```

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
- titles stuffed with `| Home | Welcome` — the template owns the suffix, the page owns one clean name

## Composes with

- **ultraweb:copywriting** — writes every title and description in voice; this skill only wires them.
- **ultraweb:sitemap** — the route inventory that sitemap.ts and canonicals must mirror exactly.
- **ultraweb:i18n** — adds `alternates.languages` hreflang when the brief is multilingual.
- **ultraweb:faq** — owns FAQPage schema inside its section markup.
- **ultraweb:color** — the OG image uses its palette, resolved to literals.
- **ultraweb:gate-content** — verifies uniqueness and completeness of everything above.
