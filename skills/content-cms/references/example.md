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
