---
name: handoff
description: Write the closing README for a finished ultraweb site — stack map with the real installed versions, run/build commands, a verified file-by-file content-and-copy editing map, the one-file token guide (app/globals.css @theme), one-line explanations of every design/* artifact, gate re-run instructions, deploy record, and maintenance notes on what not to break. Invoke in Phase 12 of the ultraweb pipeline after ship, or whenever the user asks for docs, a README, a handoff, onboarding notes for another developer, or "how do I edit this myself later". Every path and command in the README is verified against the actual repo, never described from memory.
---

# handoff — the owner's manual

**Stage:** Phase 12 — Ship (after ship) - **Reads:** design/BRIEF.md, DIRECTION.md, SYSTEM.md, SITEMAP.md, QA.md, package.json, app/ tree - **Writes:** README.md

## Standard

The README lets two people succeed without the original author: the owner changes a headline in under 5 minutes, and the next developer restyles the whole site by editing one token in one file. Every path, command, and version in it is verified against THIS repo this session — a README describing an ideal repo instead of the real one is worse than none. The create-next-app boilerplate README does not survive. No generic Next.js tutorial prose: every sentence is a fact about this site.

## Process

1. **Kill the boilerplate.** The string "bootstrapped with" must not survive in README.md.
2. **Stack map** from package.json's real versions (read the file or `npm ls --depth=0`) — exact numbers, never "latest". List backend pieces (Drizzle, Better Auth, Resend, Stripe) only if actually built.
3. **Run section:** `npm install`, `npm run dev`, `npm run build && npm run start`, plus env bootstrap — copy .env.example → .env.local and fill it; the per-key comments ship wrote say where each value comes from.
4. **Content map.** For every page in design/SITEMAP.md, one table row: what the owner sees → the file that owns that string. Build it by opening the actual components — not from memory of what Phase 6 built.
5. **Token guide — the one-file promise.** All styling flows from the `:root`/`.dark`/`@theme` tokens in app/globals.css. Give 3 worked one-line recipes (accent color, radius, font swap). State the law: change the token or add a variant — never hardcode a value inside a component.
6. **design/ folder explained**, one line per artifact: BRIEF (what and who for), DIRECTION (the aesthetic contract and its banned moves), SYSTEM (palette/type/motion rationale), SITEMAP (per-page blueprints), QA (gate history). Frame it as the site's memory — future changes start by reading these.
7. **Gate re-run instructions:** `npm run build` (code gate), `npx eslint .` (`next lint` is removed in Next 16), and: with the ultraweb plugin installed, request changes via `ultraweb:iterate` — it re-runs only the affected gates and appends to design/QA.md.
8. **Deploy record** (only if shipped): live URL, host, redeploy command, env keys the host needs — copied from ship's QA.md entry.
9. **Maintenance notes:** the load-bearing decisions and how not to break them (see skeleton).
10. **Verify before done:** every file path named in the README exists (check each one), every command exits 0 — build already proven by ship; cite its QA.md line instead of re-running.

## README skeleton

```markdown
# <Site name>
<one sentence: what this site is and who it serves — from design/BRIEF.md>

## Stack
Next.js <16.x.y> (App Router, Turbopack) · Tailwind CSS <4.x> (CSS-first — all
tokens in app/globals.css; there is no tailwind.config.js) · shadcn/ui (restyled
primitives) · motion <12.x> (import from "motion/react") · lucide-react · zod v4
<+ backend pieces actually built>

## Run it
npm install → npm run dev → localhost:3000. Production check: npm run build && npm run start.
Copy .env.example to .env.local and fill it — each key's comment says where it comes from.

## Edit content & copy
| You want to change… | Edit this file |
|---|---|
| Homepage headline | components/sections/hero.tsx |
| <one row per user-visible surface, real paths> | |

## Change the look — one file
Everything visual flows from tokens in app/globals.css:
- Accent color: edit --accent in :root AND .dark (both — dark mode is designed, not inverted)
- Corner rounding: the --radius-* tokens under @theme
- Fonts: swap the instance in lib/fonts.ts; the --font-* token name stays
Never hardcode a color or size in a component — change the token or add a variant.

## The design/ folder
BRIEF · DIRECTION · SYSTEM · SITEMAP · QA — <one line each>.
Read DIRECTION.md before any visual change: it names what this site will NOT do.

## Quality gates
npm run build must exit clean. Lint: npx eslint . (the next lint command no longer
exists). With the ultraweb plugin: make changes via ultraweb:iterate — it re-runs
the affected gates and logs results to design/QA.md.

## Deployed
<live URL> on <host>. Redeploy: <command>. Env keys the host needs: <list>.

## Don't break these
- One accent color. Wanting a second is a DIRECTION.md conversation, not a CSS edit.
- Dark mode is re-decided per surface — check both themes after any color change.
- prefers-reduced-motion paths must keep working; test with motion disabled.
```

## Anti-patterns

- "This is a [Next.js] project bootstrapped with create-next-app" — boilerplate survived
- `tailwind.config.js` mentioned anywhere — v4 is CSS-first; the token story lives in globals.css
- `next lint` in gate instructions — removed in Next 16; the ESLint CLI is the command
- `npx shadcn-ui` in maintenance docs — dead package; it is `npx shadcn@latest`
- A content-map row pointing at a path that doesn't exist — step 10 exists to kill this
- Versions written as "latest" instead of package.json's pinned reality
- Generic framework tutorial prose ("Learn more about Next.js…") instead of facts about THIS site

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
the `--font-serif` token name stays. The Stack line reads package.json's pinned reality — Next.js
16.2.10, Tailwind 4.3.2, content-collections 0.15.2 — never "latest". The README also republishes
SYSTEM.md §imagery's placeholder list so volunteers know `placeholder-orchard.svg` still needs a real photo.

Rejected: pointing the story row at app/stories/[slug]/page.tsx — it lost because a volunteer edits
prose, not the MDX renderer; the row that actually helps them lands on content/stories/*.mdx.

Lands as README.md at the repo root; every future change re-enters through ultraweb:iterate, which the
README names as the single supported way in.

## Composes with

- ultraweb:ship — runs first; its env audit and deploy record feed the Run and Deployed sections
- ultraweb:tokens — built the one-file system the token guide documents
- ultraweb:copywriting — defined the voice; the content map points at strings it wrote
- ultraweb:content-cms — when a content layer exists, the content map documents the MDX/CMS editing flow instead of raw TSX paths
- ultraweb:iterate — the README's standing instruction for every future change
- ultraweb:imagery — its SYSTEM.md §imagery placeholder inventory becomes the README's "replace these generated assets" list for the owner
