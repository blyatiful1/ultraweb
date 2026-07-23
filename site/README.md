# BLOCKOUT — A History of Counter-Strike Maps

A fan-made editorial microsite telling the story of Counter-Strike's levels — from the 1999 beta through CS 1.6, Source, and CS:GO to CS2 — as one authored scroll. Not affiliated with Valve Corporation; every visual is original (radar-style SVG linework, dev-texture CSS patterns, procedural 3D — no game assets).

## The three experiences

- `/` — **The Journey.** Four era acts (GoldSrc → Source → CS:GO → CS2) around the signature showpiece "The Compile": a procedural 3D bombsite diorama that builds itself from wireframe to fully lit as you scroll. Static SVG posters serve reduced-motion, no-WebGL, and pre-hydration states.
- `/maps` — **The Atlas.** The nine-map canon as a filterable radar-card archive.
- `/maps/[slug]` — **Dossiers.** One page per map: author, lineage, reworks, callouts, esports moments. Slugs: `dust2 mirage inferno nuke train overpass cache ancient anubis`.

## Commands

```bash
npm run dev     # dev server (Turbopack)
npm run build   # production build — must exit 0 before shipping
npm start       # serve the production build
npx eslint app components lib   # lint (next lint was removed in Next 16)
```

## Where things live

- `design/` — the build's decision record: `BRIEF.md` (audience, tone, scope), `DIRECTION.md` (aesthetic + the We-will-NOT list), `SYSTEM.md` (palette/type/motion values), `SITEMAP.md` (per-section blueprints), `RESEARCH.md` (verified facts — **all dates/names/numbers in copy must trace here**), `QA.md` (gate log).
- `app/globals.css` — the entire design system as Tailwind v4 `@theme` tokens (OKLCH, dark leads, era-world accent re-maps via `data-world`). Components never hardcode colors.
- `lib/eras.ts`, `lib/maps.ts` — all content, typed by `lib/types.ts`. Edit copy here, not in components.
- `components/radar/` — nine hand-simplified radar SVGs. `components/showpiece/` — The Compile (R3F scene + poster fallbacks). `components/sections/` — page sections named by blueprint.

Stack: Next.js 16 (App Router, strict TS, Turbopack) · Tailwind CSS v4 · motion · React Three Fiber · next-themes.
