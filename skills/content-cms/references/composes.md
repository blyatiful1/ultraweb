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
