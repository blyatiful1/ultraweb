# System — BLOCKOUT

## §color
Dark leads (class strategy, next-themes, `defaultTheme="dark"`). Neutrals carry a cool graphite tint (H 250, C 0.008–0.015) — the radar at night. ONE accent: dev-texture orange (H 55). Light theme is "blueprint paper" — re-decided per surface, not inverted.

### Value table (semantic tokens)
| Token | `.dark` (default) | `:root` (light) |
|---|---|---|
| background | oklch(0.17 0.012 250) | oklch(0.965 0.004 90) |
| foreground | oklch(0.93 0.008 250) | oklch(0.22 0.012 250) |
| card | oklch(0.205 0.014 250) | oklch(1 0 0) |
| card-foreground | oklch(0.93 0.008 250) | oklch(0.22 0.012 250) |
| popover / popover-fg | 0.205 / 0.93 (as card) | 1 / 0.22 (as card) |
| primary | oklch(0.74 0.13 55) | oklch(0.54 0.15 50) |
| primary-foreground | oklch(0.16 0.012 250) | oklch(0.98 0.005 90) |
| secondary | oklch(0.25 0.015 250) | oklch(0.93 0.006 90) |
| secondary-foreground | oklch(0.9 0.008 250) | oklch(0.28 0.012 250) |
| muted | oklch(0.23 0.014 250) | oklch(0.94 0.005 90) |
| muted-foreground | oklch(0.73 0.012 250) | oklch(0.47 0.012 250) |
| accent | oklch(0.28 0.03 55) | oklch(0.92 0.04 70) |
| accent-foreground | oklch(0.9 0.06 60) | oklch(0.35 0.09 50) |
| destructive | oklch(0.68 0.17 25) | oklch(0.54 0.19 25) |
| border | oklch(0.26 0.014 250) | oklch(0.89 0.006 90) |
| input | oklch(0.26 0.014 250) | oklch(0.89 0.006 90) |
| ring | oklch(0.74 0.13 55) | oklch(0.54 0.15 50) |
| shadow-color | oklch(0 0 0 / 0.4) | oklch(0.3 0.02 250 / 0.10) |

### Era worlds (theme-worlds scroll-act variant — accent re-map ONLY, on `/` era sections)
| World (`data-world`) | `.dark` accent | light accent | meaning |
|---|---|---|---|
| goldsrc | oklch(0.78 0.11 85) | oklch(0.55 0.12 80) | dust gold — the 1999–2003 act |
| source | oklch(0.75 0.09 125) | oklch(0.5 0.1 125) | olive drab — 2004–2011 |
| go | oklch(0.74 0.13 55) | oklch(0.54 0.15 50) | dev orange (base) — 2012–2023 |
| cs2 | oklch(0.78 0.09 200) | oklch(0.5 0.09 210) | smoke teal — 2023– |

Each world re-points `--primary`, `--primary-foreground`, `--ring`, `--accent` only. AA verification for ALL pairs (both themes, all worlds) runs computationally in gate-accessibility; tune L, never C. Do not touch surfaces in a world.

## §type
Pairing: **Archivo + Archivo** (library row 9 — one-family conviction, `axes: ["wdth"]`) + **JetBrains Mono** (metadata chrome, tabular figures). Type as Evidence: one heroic face, scale contrast alone builds hierarchy.
- Display: Archivo 800, `font-stretch: 125%`, UPPERCASE, tracking −0.015em, leading 0.95–1.0. Era titles use `--text-display`.
- Body: Archivo 400, 16–17px, leading 1.65, measure 65ch, `text-wrap: pretty`. H1–H3 get `text-wrap: balance`.
- Mono chrome: JetBrains Mono 400/500, 12–13px labels at +0.06em, `font-variant-numeric: tabular-nums`. Format: `de_dust2 // 2001 // D. JOHNSTON`. Mono never sets paragraphs.
- Loaded weights: Archivo variable (wght+wdth axes, one file), JetBrains Mono variable. lib/fonts.ts exports `display` (= body family) + `mono`.
- Scale: tokens example values, plus `--text-display: clamp(3.5rem, 1.9rem + 8.5vw, 10.5rem)` (56→168px; 168/17 ≈ 9.9× body — era titles feel almost too big, per taste) and `--text-6xl` per tokens worked example. Hero H1 uses `--text-6xl` (100px max, 5.9× body).
- `font-feature-settings: 'kern' 1, 'liga' 1, 'calt' 1` on display tokens. No stylistic sets. No Breathing Type (the Compile is the signature; type stays still).

## §layout
- 12-col grid, `max-w-[1280px]`, gutter 24px; content column for prose 65ch.
- Section spacing VARIES: era-title moments get `py-40+` release; dossier data walls compress to `py-16`. Base unit 4px.
- Deliberate asymmetry: era acts alternate their text rail (Act I text left of diorama, Act II right…); dossier pages: 5/7 split — sticky radar SVG panel (5 cols) + scrolling dossier (7 cols); on the atlas, the Dust II card spans 2 columns (the icon earns the space).
- Exposed hairline structure: 1px `--border` column rules visible on `/maps` atlas and dossier metadata tables.

## §depth & shape
- Radius: `--radius: 0.125rem` (2px) — technical, near-brutalist. No rounded-xl anywhere.
- Depth: 1px hairline borders do separation; shadows minimal (xs/sm only, tinted via `--shadow-color`); dark elevation = surface lightness step (+0.03 L), per color rules.
- Shape motif (signature-adjacent, systematized): **corner ticks** — 8px crosshair brackets on card/panel corners (the radar/HUD bracket), drawn with CSS borders or one reusable SVG; plus dashed 1px "survey lines" as section connectors. The dev-texture pattern: a CSS `repeating-linear-gradient` 24px grid at 4–6% opacity on showcase surfaces only (hero, era posters) — never behind body text.

## §imagery
NO photography, NO game assets. Three original media types only:
1. Radar linework — per-map SVG overview drawings (original, simplified, radar-style: white/accent 1.5px strokes, site markers "A"/"B", dashed mid line) — drawn per map in the dossier data.
2. Procedural 3D — the Compile diorama (showpiece only).
3. Dev-texture CSS patterns + subtle grain (≤4% opacity) on era posters.
Alt text is authored per radar ("Simplified radar overview of Dust II: two bombsites…").

## §motion
- Intensity: **3 / Theatrical** — DIRECTION.md names the Compile showpiece + era acts. Rationale: campaign-microsite energy budget.
- Easing family: **Decisive**. out `cubic-bezier(0.22,1,0.36,1)` (entrances/hover) · in-out `cubic-bezier(0.83,0,0.17,1)` (moves) · in `cubic-bezier(0.64,0,0.78,0)` (exits).
- Durations: `--dur-micro: 180ms` · `--dur-small: 300ms` · `--dur-section: 560ms`. Exits ≈70% of entrance. lib/motion.ts mirrors: `{ micro: .18, small: .3, section: .56 }`.
- Choreography: one entrance cluster per viewport; reveal order container → heading → copy → CTA; stagger 60ms cap 6; `whileInView` always `once: true`. Nav static; LCP headline never mounts hidden.
- Scroll: The Compile is scroll-scrubbed (`useScroll` on the `/` spine); era `data-world` shifts are pure section scrolling (no listener). Dossier pages: intensity behaves as level 1 (calm reveals only) — the showpiece budget is spent on `/`.
- Reduced motion: two layers (CSS `no-preference` opt-in authoring + `useReducedMotion()`); Compile renders static era posters; everything else → opacity-fade ≤200ms or nothing.

## §showpiece — The Compile (budget record)
- ONE R3F scene (`components/showpiece/`), procedural BoxGeometry bombsite diorama (~40–70 boxes: ramp, site platform, crates, walls), original composition. Era stages: wireframe material → flat dev-orange lambert with grid texture (canvas-generated, not downloaded) → gritty directional light + vertex-ish shading → CS2 stage adds a cheap smoke plume (~60 sprite particles, additive, DPR-capped).
- Mounted via `next/dynamic` `ssr:false` inside "use client" wrapper; `loading:` = designed SVG poster. Three exits: reduced-motion → poster; no WebGL → poster; `document.hidden`/offscreen → loop paused. `dpr={[1,2]}`, no per-frame allocations.
- Scroll scrub maps journey progress → era stage cross-fades + slow camera orbit (~30° total). Native scroll only.
- Static fallback: 4 era SVG posters (isometric linework of the same diorama) — designed, pass gate-visual alone; sr-only narrative (2–4 sentences, Phase 8) carries the argument.
- Budget: three.js+R3F client delta accepted (~160–190kb gz, recorded post-build); total page weight target <3MB; LCP = server-rendered hero H1.

## §craft floor
`::selection` in primary/primary-foreground; focus-visible ring 2px `--ring` offset 2px; custom favicon (orange dev-grid tile with "B"); scrollbar styled thin on showcase pages; 404 designed ("MAP FAILED TO COMPILE · missing .bsp"); OG image generated via next/og from lib/tokens.ts.
