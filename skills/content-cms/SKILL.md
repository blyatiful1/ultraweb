---
name: content-cms
description: The content layer for a Next.js 16 site — plain @next/mdx for a handful of long-form pages (root mdx-components.tsx is mandatory, pageExtensions must include md/mdx, @next/mdx pinned to the next version), content-collections or velite for typed collections at scale, zod v4 frontmatter schemas, long-form prose styled from SYSTEM.md tokens instead of default gray prose classes, and Shiki code blocks highlighted at build inside RSCs (zero client JS). Contentlayer is dead and never an option. Invoke during the backend phase when the brief calls for a blog, docs, changelog, case studies, or any markdown-driven content, when choosing between MDX-in-repo and a headless CMS, or when article pages render as unstyled or default-gray prose. Trigger phrases — "add a blog", "MDX pages", "docs section", "markdown content", "frontmatter", "content collections", "style the article page", "syntax highlighting", "code blocks", "do we need a CMS".
---

# content-cms — typed content, designed prose

**Stage:** Phase 7 — Backend - **Reads:** design/BRIEF.md, design/DIRECTION.md, design/SYSTEM.md - **Writes:** content/*, mdx-components.tsx, next.config.ts MDX wiring, frontmatter schema, lib/highlight.ts, prose styles in app/globals.css

## Standard

- Content is typed at the boundary: frontmatter validated by a zod v4 schema at build time. A typo'd field is a build error, not a silent `undefined` rendered to production.
- Long-form prose consumes SYSTEM.md tokens — accent links, tinted-neutral code blocks, the site's type scale. Default gray prose classes on a designed site read as a template drop-in.
- **Contentlayer is DEAD.** Never recommend, install, or migrate toward it. Migrate away from it to content-collections.
- Every content page ships real metadata derived from its frontmatter, and drafts never leak — not into listings, not into sitemap.ts.
- Code blocks are highlighted at build inside RSCs — a highlighter in the browser is a defect, not a choice.

## Process

1. Read design/BRIEF.md: what content exists, who edits it, how often. That decides the pipeline (table below).
2. Wire the pipeline — @next/mdx's two mandatory wires, or the collection tool's config with the zod frontmatter schema.
3. Build the prose layer AND the highlighter (component mapping, long-form styles from `@theme` tokens, `lib/highlight.ts` + the code-surface tokens) BEFORE writing content, so the first article renders designed.
4. Build routes: listing + `[slug]` with `generateStaticParams`, `generateMetadata` from frontmatter, drafts filtered everywhere.
5. Hand every string to `copywriting`; wire posts into sitemap.ts and JSON-LD via `seo`.
6. Verify: `npm run build` compiles every content file; deliberately break one frontmatter field and confirm the build fails — a schema that can't fail isn't validating.

## Pick the pipeline

- **≤ ~8 standalone long-form pages** (about, legal, a manifesto) → plain `@next/mdx`; the MDX files ARE routes (`app/(marketing)/about/page.mdx`).
- **Collections** — blog, changelog, docs, case studies with listings, tags, ordering → **content-collections** (0.15.2) or **velite** (0.4.0): frontmatter validated at build, typed arrays exported to code.
- **Non-developer editors, weekly+ cadence, preview/scheduling workflows** → headless CMS (last section).
- **Contentlayer / next-contentlayer** → never, under any prompt. Dead project.

## Plain @next/mdx — the two mandatory wires

```ts
// next.config.ts
import type { NextConfig } from 'next'
import createMDX from '@next/mdx'

const nextConfig: NextConfig = {
  pageExtensions: ['md', 'mdx', 'ts', 'tsx'],   // without md/mdx here, .mdx pages 404 with ZERO error
}

export default createMDX()(nextConfig)
```

```tsx
// mdx-components.tsx — PROJECT ROOT, beside app/ (not inside it).
// Omitting this file is the #1 MDX setup error, and the failure message never names it.
import type { MDXComponents } from 'mdx/types'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h2: (props) => <h2 className="mt-14 mb-5 font-display text-3xl tracking-tight" {...props} />,
    a: (props) => <a className="text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent" {...props} />,
    ...components,
  }
}
```

- Pin `@next/mdx` to the exact `next` version (both 16.2.10 today) — they are version-locked; a mismatch is build-breaking drift.
- Install the companion packages the current docs list alongside it (loader/react/types) — verify against current docs first.
- @next/mdx parses NO YAML frontmatter by default — a `---` block renders as literal text. For `page.mdx` routes, `export const metadata = { title, description }` feeds the Metadata API like any page. remark-frontmatter is possible, but Turbopack requires serializable plugin config — verify against current docs first.

## Typed collections — content-collections or velite

Both validate frontmatter at build and emit typed, importable arrays. Exact config wiring (Next plugin wrapper, schema helper) drifts between minors — verify against current docs first, then record the choice in design/BRIEF.md. The schema shape, whichever tool:

```ts
const frontmatter = z.object({
  title: z.string().min(8, { error: 'Titles under 8 chars read as filler' }),
  date: z.iso.date({ error: 'YYYY-MM-DD' }),
  summary: z.string().min(40, { error: 'Write a real summary — it becomes the meta description' }).max(180),
  tags: z.array(z.string()).max(4).default([]),
  draft: z.boolean().default(false),
})
```

- Computed fields at build: slug from filename, reading time, date-sorted exports. Never compute these at request time from raw files.
- Filter `draft` out of every production list, every `generateStaticParams`, AND sitemap.ts — one forgotten surface leaks the post.

```tsx
// app/(marketing)/blog/[slug]/page.tsx
import { notFound } from 'next/navigation'

export function generateStaticParams() {
  return posts.filter((p) => !p.draft).map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params            // Next 16: params is a Promise — always await
  const post = getPost(slug)
  if (!post || post.draft) notFound()      // filtered generateStaticParams alone does NOT block this
  return { title: post.title, description: post.summary }
}
```

- Guard the page component the same way (`if (!post || post.draft) notFound()`) — or set `export const dynamicParams = false`. `dynamicParams` defaults to `true`, so a filtered `generateStaticParams` still renders a draft on demand at its direct URL.

## Prose that consumes the system

- Never ship `prose prose-gray` / `prose-slate` defaults. Long-form type is still YOUR type system — gray plugin prose is the greppable smell of an undesigned article page.
- Two mechanisms, use both: (1) component mapping — `mdx-components.tsx` (and the `components` prop where collections render MDX) maps h1–h6/p/a/blockquote/code to token-styled elements; (2) one long-form class in app/globals.css built from `@theme` tokens for element rules the mapping shouldn't repeat.
- The numbers: measure 65–75ch (`max-w-[70ch]`); body leading 1.65–1.75; h2 takes ≥2× the space above than below (mt-14/mb-5) so sections group; links take the site accent with `underline-offset-4`, never default blue or gray; inline code and blockquotes sit on the tinted neutral ramp from SYSTEM.md §color, not `bg-gray-100`.
- Dark mode re-decided for prose: code-block backgrounds, blockquote borders, image borders get explicit dark values — inversion muddies long-form worst of all.
- Prose headings use the display font only if DIRECTION.md's type stance says so — editorial directions often keep them in the body family with weight contrast instead.

## Code blocks — Shiki, RSC-only

Shiki (per STACK.md) is the highlighter, and it runs at **build time inside a server component** — a highlighted block ships styled HTML and zero client JavaScript. A client-side highlighter (`prismjs`, `highlight.js`, `react-syntax-highlighter`) sends a parser plus every grammar to the browser to redo work the server already finished, and flashes unstyled code while it boots.

- **In MDX** — `@shikijs/rehype` (per STACK.md) wired into the pipeline config; every fenced block is highlighted during the build. Turbopack requires serializable plugin options, so verify how transformers are passed against current docs — where that fails, map `pre`/`code` in `mdx-components.tsx` to the same RSC component below and keep one path.
- **Outside MDX** — `codeToHtml()` called directly in an RSC. Standalone marketing snippets (a dev-tool hero showing the install line, a feature section with three lines of API) render through this same component, never a second hand-styled `<pre>`; one code aesthetic site-wide.

```tsx
// lib/highlight.ts — server-only. Themes are a base; the token colours are mapped onto the site's palette.
import { codeToHtml } from "shiki/bundle/web";   // not the full `shiki` barrel (per STACK.md)
import { transformerNotationDiff, transformerNotationHighlight } from "@shikijs/transformers";

export const highlight = (code: string, lang: string) =>
  codeToHtml(code, {
    lang,
    themes: { light: "github-light", dark: "github-dark" }, // base themes only — nearest to the palette's hue family
    defaultColor: false,                                    // emit --shiki-light / --shiki-dark instead of baked colors
    // + the colour-replacement map that swaps the themes' palette entries for the site's var(--color-*)
    //   — verify the current option name against the docs before writing it
    transformers: [transformerNotationDiff(), transformerNotationHighlight()],
  });

// components/code-block.tsx — server component; only <CopyButton> below is "use client"
export async function CodeBlock({ code, lang }: { code: string; lang: string }) {
  return <div className="relative"><CopyButton value={code} /><div dangerouslySetInnerHTML={{ __html: await highlight(code, lang) }} /></div>;
}
```

`defaultColor: false` is half the trick: Shiki emits paired custom properties per token and bakes no inline `color`, so a few CSS rules can map them onto the site's own tokens — and that swap is won by `@layer components` order, not the `!important` the docs reach for and `gate-code` sweeps for (per STACK.md). The other half is the palette: the stock pair earns its keep as scope coverage only, its colour entries replaced by the site's `var(--color-*)` values, or you author a minimal theme object from SYSTEM.md §color. Never ship a stock VS Code theme untouched; Dracula on a luxury-serif site is the same tell as untouched shadcn. And mind the entry point: the full `shiki` barrel carries every grammar and theme — build-time or not, prefer `shiki/bundle/web` or `createHighlighterCore` with explicit languages (per STACK.md).

```css
/* app/globals.css — the code surface is the tinted neutral ramp from SYSTEM.md §color, both themes re-decided */
:root { --code-surface: oklch(0.96 0.008 85); }
.dark { --code-surface: oklch(0.21 0.018 60); }               /* re-decided, never inverted */

@theme inline { --color-code-surface: var(--code-surface); }  /* the bridge ultraweb:tokens requires */

@layer components {
  .shiki { background: var(--color-code-surface); }           /* surface: site token, not the theme's */
  .shiki, .shiki span { color: var(--shiki-light); }          /* tokens: Shiki's paired variables */
  .dark .shiki, .dark .shiki span { color: var(--shiki-dark); }
}
```

`@shikijs/transformers` supplies the `// [!code ++]` / `// [!code highlight]` notations — annotations written in the source, styled by your CSS, still zero runtime. The **copy button is the one client leaf**: a `"use client"` button positioned beside the server-rendered `<pre>`, taking the raw string as a prop. The block never becomes a client component just to carry a button.

## When a headless CMS instead

- MDX-in-repo is the default: versioned with the site, edited by whoever edits code, zero runtime dependency.
- Escalate only when the BRIEF names non-developer editors on a weekly+ cadence, preview/scheduling workflows, or >~200 documents with structured relations. Then the CMS is just a data source: fetch behind `'use cache'` + `cacheLife('hours')` + `cacheTag` per content type, per `data-fetching`.
- Never bolt a CMS onto a five-page brochure site — infrastructure cosplay.

## Anti-patterns

- `contentlayer` / `next-contentlayer` in package.json — dead project; greppable, zero tolerance.
- No root `mdx-components.tsx` while `@next/mdx` is installed — the #1 setup error.
- `pageExtensions` missing `'md', 'mdx'` — MDX pages 404 silently.
- `@next/mdx` version ≠ `next` version — version-locked pair.
- `prose prose-gray`, `prose-slate`, `prose-zinc` — greppable; default gray prose on a designed site.
- `react-syntax-highlighter`, `prismjs`, `highlight.js` in package.json — a client-side highlighter redoing at runtime what Shiki did at build.
- `"use client"` on the code-block component — only the copy button is a client leaf; the highlighted `<pre>` stays server-rendered.
- YAML `---` frontmatter in a plain @next/mdx page — renders as body text; export metadata instead.
- `post.frontmatter.title` reached without a schema — typos compile and render `undefined`.
- Drafts visible in production listings or sitemap.ts.
- Draft reachable via direct URL — `generateStaticParams` filtering alone does not block on-demand rendering (`dynamicParams` defaults to `true`); guard with `notFound()` or set `dynamicParams = false`.
- Lorem ipsum or "First post!" filler in content/ — copy is design (taste bans it outright).

## Worked example — Aldermoor Trust, MDX stories volunteers maintain

BRIEF.md §Backend: needs → "content-cms — stories + news as MDX, maintained by volunteers after handoff"; §Content tags every story to one of three grant programmes.

- Pipeline: **content-collections** (0.15.2), not plain `@next/mdx` — stories are a real collection with a listing on the home page `/`, programme tags, and date ordering; MDX-files-as-routes can't emit the typed, sorted array the index needs.
- Frontmatter typed at the boundary with a zod v4 schema whose programme field is `z.enum(['neighbourhood', 'youth', 'climate'], { error: 'Unknown programme' })`, so a mistyped tag is a build error, not a silently broken filter. `draft` is filtered out of `generateStaticParams`, the page's `notFound()` guard, AND sitemap.ts alike.
- Prose consumes SYSTEM.md, never `prose-gray`: stories render in Source Serif 4, links in the deep-green accent `oklch(0.45 0.1 155)`, AAA-checked against warm paper:

```tsx
// components map for story MDX — Open Civic type, no gray plugin prose
p: (props) => <p className="font-serif text-lg/[1.75] max-w-[70ch]" {...props} />,
a: (props) => <a className="text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent" {...props} />,
```

- Rejected: a headless CMS for the volunteer editors. The brief's cadence is monthly and the volume dozens, not the weekly+/hundreds that earns that infrastructure — MDX-in-repo stays versioned with the site, and handoff documents the git edit path instead.
- Handoff: lands in content/stories/*.mdx + the collection config + prose rules in app/globals.css; `ultraweb:seo` reads the frontmatter for Article JSON-LD and registers each `/stories/[slug]` in sitemap.ts, and `ultraweb:handoff` writes the volunteer editing map.

## Composes with

- **ultraweb:typography** — the scale, pairing, and leading rules the prose layer draws from.
- **ultraweb:tokens** — every prose color/space/radius value resolves to an `@theme` token, never a raw hex.
- **ultraweb:copywriting** — writes the actual words in content/ in the brief's voice.
- **ultraweb:seo** — generateMetadata from frontmatter, Article JSON-LD, posts registered in sitemap.ts.
- **ultraweb:data-fetching** — cache lifetimes and tags when content comes from a CMS instead of the repo.
- **ultraweb:gate-content** — verifies real titles/descriptions and zero dead copy across every content page.
- **ultraweb:gate-code** — asserts zero `!important` in the emitted CSS, which is why the Shiki swap is won by layer order.
- **ultraweb:brief** — its §Backend: needs and per-page content inventory are what step 1 reads to choose the pipeline (plain MDX vs collections vs CMS).
- **ultraweb:handoff** — documents this skill's MDX/collection editing flow so the non-developer editors who maintain content after ship can edit it safely.
