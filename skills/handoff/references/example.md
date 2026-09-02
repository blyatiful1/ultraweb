## Worked example — Aldermoor Trust, README for a volunteer-run site

BRIEF.md says the stories are "maintained by volunteers after handoff" — so the README must make a
non-developer succeed. That reframes step 4: the content map's story row points at the MDX source,
not the renderer.

| You want to change… | Edit this file |
|---|---|
| A story's text or headline | content/stories/foraging-club.mdx |
| The "Apply for a grant" CTA label | components/sections/grant-cta.tsx |

Token guide, verified against this repo's app/globals.css: the deep-green accent is
`--accent: oklch(0.45 0.1 155)` in BOTH `:root` and `.dark`; swap Source Serif 4 in lib/fonts.ts and
the `--font-serif` token name stays. The Stack line reads package.json's pinned reality — the exact
Next.js, Tailwind, and `@content-collections/core` + `@content-collections/next` numbers from THIS
repo's lockfile — never "latest", never digits quoted from memory. The README also republishes
SYSTEM.md §imagery's placeholder list so volunteers know `placeholder-orchard.svg` still needs a real photo.

Rejected: pointing the story row at app/stories/[slug]/page.tsx — it lost because a volunteer edits
prose, not the MDX renderer; the row that actually helps them lands on content/stories/*.mdx.

Lands as README.md at the repo root; every future change re-enters through ultraweb:iterate, which the
README names as the single supported way in.
