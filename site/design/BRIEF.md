# Brief — BLOCKOUT · A History of Counter-Strike Maps

## Site type & energy budget
Editorial/content microsite with campaign-showpiece energy. No product, no conversion funnel — the site IS the deliverable, built to be shared. Energy budget per taste: spend boldly (portfolio/campaign tier), but content is a documentary — usability and factual accuracy are the floor, spectacle is the ceiling.

## Audience
A 22-year-old CS2 player with 4,000 hours, opening the link from a Discord message at night on a desktop (secondary: phone, in bed). They know what "banana" means, they have strong opinions about the Train rework, and they will spot a wrong date instantly. They distrust: fandom-wiki walls of text, AI-generated gaming "content" slop, and sites that clearly weren't made by someone who plays.

## Goals
- **Primary conversion: scroll the full journey** — reach the CS2 era at the bottom of `/` (the site's one story told end to end).
- **Secondary: open at least one map dossier** (`/maps/[slug]`).
- Success: the owner's friends finish the scroll, open Dust II's dossier, and share the link.

## Tone
Reverent, precise, mischievous — tension pair: **documentary but playful**. The facts are treated with museum-grade seriousness; the voice knows it's talking about crates and flashbangs.
Sample sentence: "Twenty-three years later, the double doors on Long A still open the same way. Nobody would dare touch them."

## Pages
- `/` — **The Journey.** The whole 1999→2026 story as one authored scroll: four era acts (GoldSrc/1.6 → Source → CS:GO → CS2), spine = the signature 3D diorama compiling itself through the eras. Serves the primary conversion.
- `/maps` — **The Atlas.** The 9-map archive grid, browsable, each card radar-styled. Serves the secondary conversion.
- `/maps/[slug]` — **Dossiers** (9): dust2, mirage, inferno, nuke, train, overpass, cache, ancient, anubis. Author, lineage, reworks, callouts, esports moments. Data-driven from one template.
- 404 — "MAP FAILED TO COMPILE" — in-world, crafted (the corners win awards).

## Content inventory
All facts come from `design/RESEARCH.md` (verified fact sheet: game/engine timeline, per-map dossiers with authors/dates/reworks/callouts/moments, era notes, stat set). **No copy may state a date, name, or number that is not in RESEARCH.md.** Items RESEARCH.md marks UNVERIFIED are either omitted or phrased without the specific claim.
Per era act on `/`: era name, years, engine, 2–3 sentence narrative, the maps it birthed, one defining moment.
Stat row: years of history, map count in the atlas, concurrent-player record, majors count (as verified).

## Backend: needs
None — fully static content, no forms, no accounts. Content lives in typed TS data files (`lib/maps.ts`, `lib/eras.ts`).

## Backend: rejected
- `database`/`auth` — no per-user state exists.
- `server-actions` + `email` — no contact form; the site is a shareable artifact, not a business.
- `content-cms` — 9 dossiers + 4 eras is typed-data scale, not editor scale.
- `payments`, `storage`, `api-design` — nothing to sell, upload, or serve.
- AI chat/search — default reject; 13 content nodes need no search.

## Assumed facts
- Working name "BLOCKOUT" (the mapper's term for a level's gray-box first draft — the site's metaphor). Owner can rename via iterate.
- Language: English. No sound layer. Dark theme leads; light theme is a designed alternate.
- No copyrighted game assets: no ripped screenshots, textures, or logos. All visuals are original — procedural 3D, radar-style SVG linework, dev-texture-inspired patterns.
- Deployed to a *.vercel.app URL for sharing with friends; no custom domain.
- 9 maps chosen as the canon set (active-duty icons + Cache as the community landmark). Vertigo, Office, Italy et al. left out deliberately — curation is a feature.
