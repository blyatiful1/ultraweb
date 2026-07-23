# Direction — Art-House Immersive (+ twist: documentary body)

**Why this, for this brief:** The brief is a shareable fan showpiece with campaign energy and a single authored story — exactly Art-House Immersive's home turf (scroll-driven scenes as the narrative spine, type as image). The tone tension "documentary but playful" supplies the twist: unlike pure art-house, body copy stays editorial — 65ch measure, real paragraphs — because the audience came to read history that is true. The immersive layer performs the subject: a website about level design that builds itself like a level.

**Dark-ground justification (required):** the ground is near-black not by Dark-Tech reflex but because the subject's native visual language — the radar/overview map every CS player reads daily — is light linework on dark. The audience genuinely lives in dark game UIs. Differentiating execution: zero glow, zero neon, zero gradient-on-navy; the dark is flat, print-like graphite with hairline rules — a blueprint at night, not an "AI startup".

**Signature move: THE COMPILE** — one persistent low-poly bombsite diorama (procedural box geometry, original — evocative of a generic A-site, copied from no real map) pinned as the scroll spine of `/`. As the reader scrolls through the four era acts it compiles: wireframe (1999/GoldSrc) → flat-shaded orange dev-texture blockout (Source) → gritty textured light/shadow (CS:GO) → fully lit with a drifting volumetric-style smoke plume (CS2). Borrowed principles (award-canon): The Persistent Hero Object + Scroll-as-Journey + Progressive Spectacle Tiers.
Bounds: ONE R3F scene, procedural geometry only (no model downloads), client-bundle delta accepted deliberately and recorded in SYSTEM.md; static per-era poster fallback (SVG) that passes gate-visual alone; three exits wired (reduced-motion, no-WebGL, offscreen/hidden pause); native scroll only — the scene listens to scroll, never hijacks it. Dossier pages get NO canvas — CSS/SVG treatments only.

**Type stance:** Type as Evidence — ONE heroic face. Archivo (variable, self-hosted via next/font): display at 800–900 weight, wide, ALL-CAPS, clamp() up to ~9vw for era titles ("ACT II — SOURCE"); body Archivo 400, 1.65 leading, 65ch. Second voice: JetBrains Mono for the metadata chrome that IS the site's decoration — `de_dust2 // 2001 // D. Johnston`, grid coordinates, file-path breadcrumbs (`csgo/maps/de_inferno.bsp`). Mono never sets body paragraphs.

**Color stance:** graphite ground `oklch(0.17 0.012 250)` (dark leads); ink-on-paper light theme re-decided per surface (blueprint white `oklch(0.965 0.004 90)`, not an inversion). ONE working accent: dev-texture orange `oklch(0.72 0.14 55)` — the color every mapper knows — on CTAs, links, active states, the diorama's blockout era. Era acts on `/` re-map the accent per act via `data-world` (theme-worlds scroll-act variant, justified: the eras ARE the acts): 1.6 dust-gold, Source olive-drab, CS:GO the base orange, CS2 smoke-teal. Each world is an accent re-map only, AA-verified in both modes. Everywhere outside `/`'s acts, the single orange rules.

**Motion stance:** One Physics — "settled weight": everything moves like a spectator camera with inertia. One easing family `cubic-bezier(0.22,1,0.36,1)`; micro 180ms; reveals 500–650ms, opacity + ≤12px translate; The Compile is scroll-scrubbed. Never animates: body text, nav, more than one element cluster per viewport. No parallax decoration, no staggered fade-up on every section. `prefers-reduced-motion`: posters, instant states, full content.

**References (principles to chase, not surfaces):** The Persistent Hero Object (Lando helmet's one-object-carries-the-site conviction); Scroll-as-Journey (Noomo's rooms — era acts with density rhythm: dense dossier walls between airy era titles); Type as Evidence (The Other Side of Truth's documentary authority); Weight as a Feature (Bruno Simon's ~3MB ceiling — budget before richness); Framed Data (stat row set in radar-frame SVG).

**We will NOT:**
1. Take runner-up **Editorial/Magazine** (too quiet for the ask) or **Brutalist** (the exposed-metadata idea is imported as the mono chrome, but no clashing acid palette, no anti-design) — one archetype, committed.
2. Ship the Dark-Tech template: no glows, no neon grids, no purple-to-blue gradients, no gradient headline text, no glassmorphism.
3. Use any copyrighted asset: no game screenshots, no ripped textures, no Valve logos or fonts. Radar-style SVG linework and procedural geometry only.
4. Hijack scroll or gate content behind the canvas — native scroll, server-rendered text always; the diorama is backdrop, never the LCP.
5. Add a second showpiece — dossier pages and `/maps` stay canvas-free (CSS/SVG only), so the one Compile can sing.
6. Write gamer-site slop: no glitch-text-everywhere, no aggressive esports slashes, no emoji, no "Welcome to the ultimate", no autoplay sound.
7. Animate everything: one revealed cluster per viewport max; body text never animates.
