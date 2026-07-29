---
name: set-design
description: Site-scale immersive 3D for ultraweb builds — ONE persistent R3F canvas behind natively-scrolling DOM, surviving every route; a DCC-authored camera clip scrubbed by a journey map (route window x scrollYProgress -> mixer.setTime), material-names-as-API, patched stock materials over hand-written GLSL, punctuation-only postprocessing, and a gltf-transform/DRACO asset pipeline. GATED — Phase 9 only when design/DIRECTION.md names this skill, its route scope AND its byte budget, at archetype 12 and motion intensity 3; ONE set piece in one section stays ultraweb:showpiece. Invoke when DIRECTION.md commissions the world, or when the user says "the whole site is 3D", "a world you scroll through", "persistent WebGL across pages", "scroll-driven camera journey", "immersive 3D portfolio", or "one continuous scene across all the pages".
---

# set-design — the scene is the site

**Stage:** Phase 9 — Motion (DIRECTION-gated, site-scale) - **Reads:** design/DIRECTION.md (the commissioned world — its route scope and its byte budget), design/SYSTEM.md §motion + §scene, design/SITEMAP.md, lib/motion.ts, the authored GLB - **Writes:** ONE persistent scene (components/scene/*, lib/scene/*) + design/SYSTEM.md §scene + the static edition of EVERY route the scene survives

## Standard

Taste's rule verbatim, at site scale: 3D, shaders, canvas only when the direction demands it, it runs 60fps on mid hardware, and there's a static fallback — a fast plain site beats a janky impressive one, always. `showpiece` builds ONE set piece; this skill is commissioned only when the direction is *immersion itself*, and then every one of showpiece's conditions binds at **every route the scene survives**, not just the one it started on. The world IS the signature move and it consumes the entire budget: nothing else on this site gets a second gesture. First-grade additionally means:

- **The scene is authored, not coded.** The camera path, framing, FOV keys and easing live in a DCC clip inside the asset; the runtime maps input onto its playhead. A hand-splined `CatmullRomCurve3` + `lookAt` is a week of JS reproducing what an animator keys in an hour, and it reads as code, not choreography. No authored asset and none commissionable → the gate fails.
- **Native scroll stays authoritative — this is the whole design.** No `preventDefault` on `wheel`, no `ScrollControls`, no virtual scroller. The page is genuinely tall, the scrollbar is real, and Space/PageDown/Home/End, find-in-page, `#anchor` links and deep links work because we never took them away. `scroll-motion` names this the #1 hazard; WCAG 2.2 AA 2.1.1 makes it an obligation, not a preference.
- **The canvas is `aria-hidden` only because it is the SECOND path to everything.** Every affordance in the world has a DOM twin rendered from the same registry. The moment one thing is reachable only in 3D, it gets a twin or it is cut. This is `showpiece`'s narrative contract at site scale, and Germany's BFSG (in force 2025-06-28) makes it a legal floor for DACH builds.
- **The static edition is a per-route deliverable, built first.** Every route in the scope ships server-rendered content, a designed poster, and 2–4 sentences of real copy carrying that stretch of the world's argument. Build it before the first shader; the site must be shippable at that moment.
- **The byte budget is written before the first shader.** `<Canvas>` ships all of three.js — a 241 kB gzip floor, ~355 kB for a full site-scale kit (per STACK.md), roughly 1.9× the entire rest of the app. That number goes in DIRECTION.md *before* the build and is re-measured in QA.md. `award-canon`'s **Weight as a Feature**, at the largest number this harness ever spends.
- **The GL chunk is never first-load.** `next/dynamic({ssr:false})` inside a client leaf, requested after the LCP entry. First-load JS stays ≤140 kB per route; the GL chunk is measured separately against its own written budget. The LCP element is server-rendered text or image on every route, always.
- **Cheapest correct expression wins, inside the world too.** Patch a stock material before writing a shader; bake light before adding one; a canvas texture before a glyph renderer; a poster frame before a video texture. `award-canon`'s **Fake-Depth Before Real Depth** does not stop applying because you already bought the renderer.
- **One material world.** Every surface commits to a single primitive so the site reads as one place. Its colors resolve out of `lib/tokens.ts`; a hex literal in GLSL is a token that escaped (`theme-worlds`' rule, restated for uniforms).
- **The clock stops when nobody is watching, and mostly it is already stopped.** `frameloop="demand"` + `invalidate()` while the damper is moving means a parked camera renders zero frames. `"always"` only for a DIRECTION-named living idle, then paused on `document.hidden` and when the canvas is covered.
- **Boundaries are hard, not stylistic.** Route transitions, drag, DOM springs, cursor chrome and SVG choreography stay where they are. The scene is a renderer — not a router, not an animation engine.

## Process

1. **Gate check — all five or stop.** (a) design/DIRECTION.md commissions the world BY NAME, cites `ultraweb:set-design`, and states all three bounds — **route scope, byte budget in gzip, and what the complete static edition of each of those routes contains**; any of the three missing is a fail. (b) DIRECTION.md's archetype is **12 Art-House Immersive**, or a recorded twist whose Motion stance is literally "the medium itself" — no other archetype qualifies, because eleven of the twelve prescribe motion a persistent canvas would contradict. (c) design/SYSTEM.md §motion records intensity **3 / Theatrical**; levels 0–2 refuse the work by construction. (d) The world exists as an **authored scene** — a GLB carrying a named camera clip and a material-name contract — or is commissionable as one. This skill does not model: a `<boxGeometry>` world with a hand-splined camera is a tutorial, not a signature move. (e) Per `taste`'s energy-budget heuristic the site type is a portfolio/agency showpiece, a campaign microsite, or a film/music/game release — **never conversion-critical, never content-heavy, never trust-critical, never a local business** — *and* a first-grade static edition of *every* route in the scope is achievable and would pass `gate-visual` alone. Any "no" → **stop and return to the pipeline.** One hero canvas is `ultraweb:showpiece`; the scroll *feel* is `ultraweb:scroll-motion` rungs 1–2; the pointer *feel* is `ultraweb:physics`; a hero object examined through scroll is an image sequence on `sticky` (`award-canon` Pattern 16's own Stack line), at a fraction of the weight.
2. **Write `design/SYSTEM.md §scene` before any code** — the journey map (route → clip window), the station registry (the material-name contract the 3D artist reads), the material world's one primitive, the byte budget copied from DIRECTION.md, and the adaptive-quality ladder. This is what a re-export or a second agent reads; it is why the scene survives someone else touching it.
3. **Build the static edition of every route and ship it.** Real `app/*/page.tsx` server components, per-route metadata, `sitemap.ts`, `robots.ts`, the poster in the layout's background slot. The site is shippable and gate-visual-passable at this point, with zero 3D dependencies installed.
4. **Install in Phase 9, never at scaffold.** Verify with `npm view three version` etc. per `scaffold` step 1's discipline, then install; **pin `three` exactly** and lock `@types/three` to the same version (per STACK.md). Self-host the DRACO decoder into `public/draco/` in the same step.
5. **Run the asset pipeline before the first import** — `gltf-transform inspect`, then `optimize --compress draco --texture-compress webp`, measured against the budget. An unoptimized GLB never enters the repo.
6. **Mount the scene** — one `"use client"` leaf, `next/dynamic({ssr:false})`, deferred past LCP, fixed behind the DOM with `eventSource`/`eventPrefix="client"`. Wire the journey map, then the stations, then the materials, then at most one post effect. In that order — each step is shippable.
7. **Verify empirically, per route.** Performance recording ≥5s of scroll plus one navigation on *every* route in the scope; 4× CPU throttle, recording which rung of the adaptive ladder it settles on; reduced-motion emulation on every route; JS off; keyboard-only pass; `npm run build`, then hand the GL chunk's measured gzip plus the DIRECTION.md citation to `gate-performance`.

## Engine ownership — a renderer, not a third engine

| Moment | Owner |
|---|---|
| Micro feedback, simple reveals | CSS — the default, unchanged |
| Component lifecycle: `whileInView`, `AnimatePresence`, layout/FLIP, springs, gestures | motion/react |
| Scroll that is a pure function of position (DOM) | CSS `animation-timeline` — `ultraweb:scroll-motion` rung 1 |
| Scroll needing spring-smoothing, velocity, or cross-element choreography (DOM) | motion `useScroll` — `ultraweb:scroll-motion` rung 2 |
| SVG choreography + scroll-scrubbed SVG sequences | anime.js — `ultraweb:animejs`, DIRECTION-gated |
| ONE canvas/WebGL/R3F set piece living in one section | `ultraweb:showpiece`, DIRECTION-gated |
| **Scene-graph state across every route: the persistent canvas, the camera clip, materials, uniforms, per-frame work** | **R3F `useFrame` — this skill, DIRECTION-gated at site scale** |
| Route transitions and the route announcer | View Transitions / `template.tsx` / motion — never anime.js, never a canvas-owned router |
| Drag, gestures, cursor chrome, magnetic hover | motion (`domMax`) — `ultraweb:physics` |

three.js is not a second animation engine. It has no timeline, no easing library, no DOM property animator; `useFrame` is a raf hook. It is a **renderer**, and it enters on the same written commission and the same 60fps + static-fallback + reduced-motion conditions as any canvas. Detect it by IMPORT SPECIFIER — `from "three"` / `from "@react-three/` — never by `<Canvas` or `useFrame(`, which appear in tutorials, comments and dead code. An uncommissioned second animation runtime is slop with a package.json entry; an uncommissioned renderer is the same slop an order of magnitude heavier.

- **vs `showpiece` — the deletion test.** Delete the canvas. If the page still has its shape and its argument, it was a showpiece. If the *site* loses its shape, it was a world. A showpiece mounts inside one section, behind server-rendered text, on one route, and can be deleted without the layout, the routes, the nav or the reading order changing; a set mounts in the app shell, survives navigation, and more than one route composes over it. Escalation is a scope decision made in DIRECTION.md, never a taller rung reached for at build time. Many small 3D moments on ONE page is drei's `<View>` inside `showpiece` — one canvas, N scissored viewports; it is never this skill.
- **vs `scroll-motion`.** This is not a fourth rung. The DOM scroll engine stays exactly where scroll-motion put it: the camera reads rung 2's `scrollYProgress` inside `useFrame`. Native scroll stays authoritative — scrollbar, keyboard, PageDown, find-in-page and the footer all still reach, because the page is genuinely tall and nothing calls `preventDefault` on `wheel`.
- **vs `physics`.** If the thing that moves is a DOM node, it is physics. If it is an `Object3D`, it is this skill. Pointer→scene raycasting and camera damping are scene input; every cursor follower, magnetic hover and DOM spring stays on motion — `domAnimation` until a real drag or layout moment earns `domMax`, per `ultraweb:physics` — and no second drag system is installed. `OrbitControls`/`CameraControls` are not installed on a site-scale scene — a free camera fights an authored journey, and a camera the user can lose is not a site.
- **vs `animejs`.** SVG choreography does not enter the canvas and the canvas does not animate SVG. `animejs/adapters/three` stays refused per STACK.md. A commissioned anime.js moment and a commissioned set are two separate commissions; a site that somehow earned both has two signature moves, which is a `direction` failure to catch, not a licence.

Two refusals stand and are cited here, not re-argued. **GSAP + ScrollTrigger** is closed by doctrine, not licensing, per STACK.md — and the replacement is better on the merits, not merely sanctioned: a tall page plus `useScroll` keeps the scrollbar, the keyboard and find-in-page that a `pin`+`scrub` removes. **Theatre.js** is a 3D animation authoring GUI — a second source of truth for numbers DIRECTION.md and `lib/motion.ts` already own.

## The journey map — one clip, every route

One camera clip spans the whole world. Each route owns a normalized window of it. Inside a route, real page scroll maps into that window; navigating retargets the playhead across the gap and the damper carries the camera there — which *is* the transition. The scene is therefore a pure function of two pieces of genuine browser state, `pathname` and `scrollYProgress`, and every affordance a wheel-accumulator destroys survives for free: the scrollbar, the keyboard, find-in-page, deep links, the back button, and a footer you can actually reach.

```ts
// lib/scene/journey.ts — the ONLY place route↔camera mapping exists.
// Windows are normalized positions in the authored clip; they must not overlap.
export const CLIP = "DescentAction";                 // the DCC action name — an asset contract
export const journey = {
  "/":                [0.00, 0.18],
  "/deepwater":       [0.20, 0.46],
  "/bestiary":        [0.48, 0.70],
  "/bestiary/[slug]": [0.72, 0.86],
  "/wishlist":        [0.88, 1.00],
} as const satisfies Record<string, readonly [number, number]>;
```

```tsx
// components/scene/camera-rig.tsx — inside the "use client" canvas leaf
import { useFrame, invalidate } from "@react-three/fiber";
import { useScroll, useMotionValueEvent } from "motion/react"; // real page scroll, not drei's
import { sceneTau } from "@/lib/motion";           // motion-language owns the constant
import { journey } from "@/lib/scene/journey";     // the map above — one source, no second copy

const { scrollYProgress } = useScroll();           // 0..1 over the real, tall page
useMotionValueEvent(scrollYProgress, "change", () => invalidate()); // a scroll tick while parked schedules no frame by itself — this re-arms the demand loop
const [from, to] = journey[route];                 // route is the journey KEY — match usePathname() against journey's keys (or useSelectedLayoutSegments()), since "/bestiary/kraken" is not one
const play = useRef(from);

useFrame((_, delta) => {
  const dt = Math.min(delta, 1 / 30);              // an alt-tab return must not teleport
  const target = from + (to - from) * scrollYProgress.get();
  play.current += (target - play.current) * (1 - Math.exp(-dt / sceneTau));  // frame-rate independent
  mixer.setTime(play.current * clip.duration);     // mixer/clip from useAnimations — leaf-local
  if (Math.abs(target - play.current) > 1e-4) invalidate();   // demand loop: parked = zero frames
});
```

- **`1 - Math.exp(-dt / τ)` is the only sanctioned smoothing.** A fixed-alpha `lerp(a, b, 0.1)` is twice as fast at 120 Hz as at 60 Hz — the same code feels like a different site on a different monitor. τ is one number, it lives in `lib/motion.ts` beside `dur`/`ease` as `sceneTau`, and it *is* the site's scroll personality. `maath`'s `easing.damp` is the same formula, but `maath` is drei's transitive and STACK.md refuses it in package.json — write the one line yourself.
- **Windows never overlap and the last one ends at 1.0.** A gap between windows is the transition's travel; an overlap is two routes claiming one frame. A dynamic segment (`/bestiary/[slug]`) gets its own window like any other route — `ultraweb:routing` owns the URL contract, this skill owns the window mapped to it. The key is the *pattern*, never the resolved path, so `/bestiary/kraken` is matched back to `/bestiary/[slug]` before the lookup — `useSelectedLayoutSegments()` or one small matcher beside the map, never a second copy of the windows.
- **The page must be genuinely tall per route.** `min-h-[300vh]` on the route's scroll track, sized so the content is legible at reading pace — not so the camera looks good. If the copy is short, the window is short; you do not pad a page to buy camera time.
- **Never `preventDefault` the wheel to buy smoothness.** If the direction genuinely needs inertia, that is `scroll-motion`'s DIRECTION-gated Lenis with its full contract, layered *on* native scroll — never a virtual playhead that eats the scrollbar.

## Named moves

Ten moves, all inside the one commissioned world. Each names the mechanism that builds it and the guardrail that keeps it cheap; nothing here is a second signature.

- **The Authored Camera** — one clip inside the GLB (the action name recorded in SYSTEM.md §scene), played by `useAnimations` with every other action paused; `mixer.setTime()` drives it. R3F's default camera is replaced by the GLTF's own (`gltf.cameras[0]` → `set({ camera })`), the authored `fov` cached in a `WeakMap` and restored on unmount. The runtime computes no spline, tweens no `Vector3`, and calls no `lookAt` for the journey.
- **Material Names Are the API** — one `stations` array is the contract between the 3D artist and the build, and it has three consumers that cannot drift: the TypeScript union of legal material names, the DOM nav's `<a href>`s, and the scene's hotspots. Find meshes with `scene.traverse` + `material.name` — never `gltfjsx` component trees, which break on every re-export while names survive. A dev-time assertion fails loudly when a name in the union was not found, so a renamed material is a red screen, not a silently dead nav link.

  ```ts
  // lib/scene/stations.ts — one array, three consumers, impossible to drift
  export const stations = [
    { href: "/deepwater", label: "The Descent", material: "to_deepwater", t: 0.30 },
    { href: "/bestiary",  label: "Bestiary",    material: "to_bestiary",  t: 0.55 },
  ] as const;
  export type StationMaterial = (typeof stations)[number]["material"];
  ```

- **Patch, Don't Write** — `material.onBeforeCompile` + a `#include <map_fragment>` string replace buys a bespoke look while keeping PBR, shadows, fog, tone mapping and every three.js upgrade. **`customProgramCacheKey` is mandatory** — without it three.js recompiles the program per material instance and you get a frame-time cliff. Capture `{color, emissive, emissiveIntensity, map, emissiveMap, metalness, roughness, toneMapped}` into a `Map` before mutating and copy it back on teardown, because drei's GLTF cache is shared across mounts and an unrestored mutation corrupts the next visit. **Budget: at most ONE full `ShaderMaterial` on the entire site.** The site this skill studied won a Developer Award on five lines of hand-written GLSL.
- **Canvas Textures for Type** — a 1024² 2D canvas bound to `map` *and* `emissiveMap` gives full kerning, ligatures, CJK and per-frame animation for zero dependencies — where drei's `<Text>` is the dearest single component in the box (per STACK.md) and renders glyphs nobody can select, search or hear. Settings: `toneMapped:false`, `colorSpace: SRGBColorSpace`, `generateMipmaps:false`, `min/magFilter: LinearFilter`, `anisotropy: Math.min(8, gl.capabilities.getMaxAnisotropy())`. **Redraw only on a dirty flag**, never unconditionally per frame. **Headline and decorative panels only** — `award-canon` Pattern 6's Pioneer Corn cautionary is a hard boundary: nav and body copy live in the DOM.
- **Wait for the Font Before the First Draw** — a texture baked before the webfont loads is *permanently* wrong — there is no reflow to fix it. Draw once immediately with whatever is available, then `await Promise.race([document.fonts.ready, timeout(5000)])`, poll `document.fonts.load(shorthand, sample)` until it resolves (also capped at 5s), redraw, `needsUpdate = true`. Pass the exact font shorthand `next/font` generates, so the self-hosted variable font is the one that gets baked.
- **Postprocessing as Punctuation** — the composer holds anti-aliasing, **`<ToneMapping mode={ToneMappingMode.ACES_FILMIC} />` LAST** (because `<EffectComposer>` silently sets `NoToneMapping` on mount — per STACK.md, the #1 "why did my colours change" bug), and at most **one** semantic effect that sits at zero amplitude and spikes on a discrete event. Mutate a module-scope `Vector2`/uniform inside `useFrame`; a per-frame `setState` re-renders the composer tree 60×/s. `multisampling={0}` on the mobile tier. The default `<Bloom/><Noise/><Vignette/><ChromaticAberration/>` stack is `taste`'s most-copied-effects objection in three dimensions — it is why every R3F site looks the same.
- **Overexpose a World, Don't Add Lights** — three lights and one IBL is the ceiling. A hemisphere light with a tinted ground bounce plus tone-mapping exposure does more than six point lights and costs nothing. `shadows="variance"` — R3F maps bare `shadows` and `shadows="soft"` to a shadow type three r185 deprecated and silently downgrades (per STACK.md), so "soft shadows" are not soft. Environment: **self-hosted HDRI or `<Environment><Lightformer/></Environment>`** (procedural, zero asset, zero request) — drei's `preset` fetches a free GitHub-raw proxy on the render path.
- **Responsive FOV, Not a Responsive Scene** — small-screen adaptation is a camera parameter, not a re-authored world: cache the authored `fov`, widen it by ≤3° below the same breakpoint token Tailwind uses, hard-cap at 72° to avoid fish-eye, `updateProjectionMatrix()`. The narrow branch also drops `dpr` to `[1, 1.5]` and the shadow map to 1024². Degrade the *choreography*, never the content.
- **3D Objects Are Links, Not Handlers** — a raycast hit dispatches an intent carrying the same `href` the DOM nav already renders, and `router.push(href)` resolves it — typed callback or one tiny typed store, never an untyped `CustomEvent` bus TypeScript cannot see. Raycast once per frame with one pre-allocated raycaster, gated on both an `isInteractive` flag and a `pointerenter`/`pointerleave` flag on the canvas, so nothing raycasts while the pointer is elsewhere. On touch, discriminate tap from drag at 12 px of movement. This single rule is the difference between an enhancement and an accessibility failure.
- **Degrade the Choreography, Keep the Content** — drop *mechanisms*, never information: coarse pointer → no custom cursor; narrow viewport → simpler transition, same content; `prefers-reduced-motion` → **the canvas is not constructed at all** and the static edition renders. This is `award-canon` Pattern 24 executed properly, and it is the largest single delta between the reference and what we ship.

The craft underneath all ten is one discipline: nothing is allocated per frame and nothing holding the GL context is ever rebuilt. Zero allocations inside `useFrame` — hoist vectors and colors to module scope and `.copy()`/`.lerp()`/`.set()` in place; clamp `delta` to 1/30 s everywhere; `<Preload all />` inside the Suspense boundary so nothing shader-compiles mid-interaction; keep the Suspense fallback **inside** the Canvas so an asset load never unmounts and rebuilds the WebGL context; guard bfcache restores with `pageshow` + `e.persisted` → reload, because a restored page has a dead GL context; and let the browser own `scrollRestoration`, because unlike a wheel-accumulator site we have real scroll to restore.

## The semantic twin — a canvas-first site is still a website

- **One registry, two renderings.** The `stations` array renders the DOM `<nav aria-label="Primary">` with real `<a href>` and `aria-current="page"` **and** resolves the scene's hotspots. Two code paths that cannot disagree, because there is one source.
- **`aria-hidden="true"` on the canvas wrapper is a claim you must earn.** It says *everything in here is decorative, because everything in here also exists out there*. Audit it by listing every affordance in the world and pointing at its DOM twin. No twin → build one or cut the affordance.
- **Every route is a real route.** Server-rendered `<main>`, `<h1>`, real content, a distinct `<title>` and description, canonical, OG image, `sitemap.ts`, `robots.ts`, a `<noscript>`. Byte-identical empty shells across routes are a `taste` "Real content" failure and an SEO failure at once — and it is free to avoid, because the DOM layer was going to be server-rendered anyway.
- **The per-route narrative carries the argument in words.** `showpiece`'s text-track rule at site scale: 2–4 sentences of real copy per route, authored by `ultraweb:copywriting` in Phase 8, stating what *that* stretch of the world claims — never "an interactive 3D scene". `sr-only` by default, visible under `prefers-reduced-motion`. Germany's BFSG (in force 2025-06-28) makes this statutory for DACH commercial builds.
- **Keyboard costs nothing because we never took it.** Native scroll means Space/PageDown/Home/End, Tab, in-page anchors and find-in-page all work without a single `keydown` handler. Ours is a non-event, and that is the point.
- **Reduced motion is a tier, not a slowdown.** Under `reduce` the canvas **does not mount at all** — not paused, not slowed: not constructed. Each route renders its baked poster and its narrative. The failure mode to hunt for is worse than a still frame: a scene that fails to mount under `reduce` leaves an *empty page*, so the poster is load-bearing markup, not a fallback attribute.

One authored frame closes the section: **each route's poster is a single build-time render of the GLB at its window's start** — shipped as AVIF for the static tier, the `reduce` tier and the no-JS tier, and exported once more as JPEG for that route's `opengraph-image`, because Next's OG file convention accepts jpg/png/gif only and the crawlers reading the card are stricter still. Four deliverables, one authored frame, two encodes.

## Weight budget, asset pipeline, and adaptive quality

**The budget is written in DIRECTION.md before the first shader and re-measured in QA.md after.** Its shape is fixed and has four lines, not one:

| Line | House rule |
|---|---|
| First-load JS per route (build table) | **≤140 kB — unchanged, and the GL chunk is NOT in it** |
| GL chunk, measured gzip, requested after LCP | **written in DIRECTION.md; house ceiling 400 kB** — STACK.md's measured full-kit reference sits under it |
| Authored model after `gltf-transform optimize` | **written in DIRECTION.md; house ceiling 1.5 MB** |
| Total transfer per route | **written in DIRECTION.md; house ceiling <3 MB** (`award-canon` Pattern 23: LCP <1.5s, CLS <0.05, INP <100ms, 60fps) |

The carve-out is honest, not a loophole: the GL chunk is genuinely absent from the first-load graph because it is `next/dynamic({ssr:false})` behind an idle callback fired after the LCP entry, and `gate-performance` verifies that **in the network waterfall** rather than taking the build table's word for it. A renderer inside first-load JS is a mounting defect, not a budget negotiation.

The pipeline is dev-only and leaves zero runtime footprint:

```bash
gltf-transform inspect world.glb          # geometry-heavy or texture-heavy? draw calls?
gltf-transform optimize world.glb public/models/world.glb \
  --compress draco --texture-compress webp
```

Then the targeted passes the inspect report calls for — `prune`, `dedup`, `weld`, `join`, `instance`. **Self-host the decoders:** copy `three/examples/jsm/libs/draco/gltf/` into `public/draco/` and call `useGLTF.setDecoderPath('/draco/')`; drei's default is a Google CDN request on every Draco model — the same DSGVO class of defect as un-self-hosted Google Fonts. **DRACO's decoder almost always pays for itself on any real mesh; KTX2's Basis transcoder is several times larger and only wins past several 2K maps — below that WebP beats it outright** (both figures per STACK.md). Every texture ships AVIF/WebP through `ultraweb:media-optimization`; nothing in the scene is a raw PNG. Video textures load behind `IntersectionObserver` + `canplay` with a poster, never `preload="auto"` + immediate `.play()`.

The adaptive-quality ladder steps down mechanisms, never content. The step order is fixed:

1. `useDetectGPU` at mount sets the initial tier (dpr cap, shadows on/off, post on/off, environment resolution).
2. `<PerformanceMonitor onDecline>` + `<AdaptiveDpr>` + `<AdaptiveEvents>` step live, in this order: **dpr down → post off → shadows off → environment resolution down → the static edition.**
3. Content, copy, nav and links are identical at every rung (`award-canon` Pattern 24: never a degraded stub).
4. `frameloop="demand"` is the default posture; `invalidate()` while the damper is moving. `"always"` only for a DIRECTION-named living idle, then paused on `document.hidden`.
5. Dev tooling is drei's `<Stats/>`/`<StatsGl/>`/`<PerformanceMonitor>` — `r3f-perf` and `leva` are rejected in STACK.md and stay rejected.

## Verified traps

- **`<Canvas>` ships ALL of three.js.** fiber does `import * as THREE` and runs `extend(THREE)` inside Canvas — no downstream import discipline shrinks it. Budget the floor the moment a canvas exists (per STACK.md).
- **`"use client"` is mandatory and the failure mode lies:** `TypeError: jN.createContext is not a function`, in a minified SSR chunk, with no path into your code and no mention of the directive. Map that exact string to the missing directive.
- **`<EffectComposer>` sets `gl.toneMapping = NoToneMapping` on mount.** Add any post effect and the whole scene's highlights blow out. `<ToneMapping mode={ToneMappingMode.ACES_FILMIC} />` last in the chain.
- **`useFrame(cb, priority > 0)` blacks out the entire canvas** — a positive priority increments a counter and the loop stops rendering until someone calls `gl.render()`. Never pass a priority "so it runs last".
- **`shadows` / `shadows="soft"` are not soft on three r185** — both map to a deprecated shadow type that warns and reassigns itself. Use `shadows="variance"` or drei's shadow components.
- **drei phones home to three third-party CDNs by default** — `useGLTF` → gstatic, `useKTX2` → an unpinned jsDelivr `@master` ref, `<Environment preset>` → raw.githack. All three self-hosted, no exceptions.
- **`ScrollControls` is not page scroll and is refused here.** It injects its own `overflow-y:auto` scroller, so `window.scrollY` stays 0 and motion's `useScroll`, CSS `animation-timeline`, page IntersectionObserver, `#anchor` links and scroll restoration are all dead inside it. `<Scroll html>` is worse: a second `ReactDOM.createRoot` called during the render phase, so theme, router and i18n providers are `undefined` in that DOM. And the trap has a twin: drei exports its own `useScroll`, which outside `<ScrollControls>` returns `null`, not a default — the page-tracking `useScroll` this skill uses is motion/react's, a different hook that shares nothing but the name.
- **Never `import * as drei`** (or `import * as THREE`) — the barrels are multiples of the named-import cost (per STACK.md); named imports shake near-perfectly.
- **Pin `three` exactly and lock `@types/three` to it.** `postprocessing`'s peer range caps three below the next minor, and three ships a minor every 6–8 weeks (per STACK.md). three bundles no types of its own.
- **`transpilePackages: ['three']` is stale advice** — the R3F docs still say it; verified false on Next 16 + Turbopack. Do not add it.
- **Keep the Suspense fallback INSIDE the Canvas.** A suspending `useGLTF` under an outer boundary unmounts and rebuilds the WebGL context — you lose the persistent canvas, which is the entire architecture.
- **three has no `prefers-reduced-motion` support.** Like anime.js, the consumer implements it (per STACK.md), and at site scale the implementation is that the canvas does not mount. Separately: the `THREE.Clock` deprecation warning at boot is upstream and cosmetic — say so, so nobody spends an afternoon on it.

## Pass criteria

Record all eight in design/SYSTEM.md §scene (decisions + measured deltas) and design/QA.md (measurements) before the gates run:

1. Steady 60fps over ≥5s of scroll plus one navigation, on **every route in the scope**; zero long tasks >50ms.
2. 4× CPU throttle: the adaptive ladder demonstrably steps down and the site holds ≥30fps, or falls to the static edition. Record which rung it settled on.
3. LCP element is server-rendered text or image on every route, and the GL chunk's request begins **after** the LCP entry in the network waterfall.
4. First-load JS ≤140 kB per route from the build table with the GL chunk excluded; the GL chunk's measured gzip recorded against its DIRECTION.md budget; total transfer per route under budget and under 3 MB.
5. `prefers-reduced-motion: reduce` emulated on every route: **no canvas element in the DOM at all**, the poster renders, and the route's narrative reads as a complete argument on its own.
6. JS off: every route serves its content, nav and metadata. `/robots.txt` and `/sitemap.xml` return 200. Every route has a distinct `<title>`, description, canonical and OG image.
7. Keyboard-only pass on every route: Tab reaches every station, Space/PageDown/Home/End scroll, in-page anchors land, find-in-page finds body copy. Zero `preventDefault` on `wheel` anywhere in the build.
8. WebGL killed (no-WebGL context or a forced context loss): the static edition renders, console clean; a bfcache restore does not leave a dead context behind; zero requests to gstatic/jsdelivr/githack in the network log.

## Anti-patterns

Greppable — each should return zero:

- `addEventListener\("wheel"` paired with `preventDefault` — the #1 scroll-jack hazard, and it takes the keyboard with it
- `ScrollControls` / `<Scroll html>` — a second scroller on a site that has DOM sections
- `import \* as .* from "@react-three/drei"` / `from "three"` — the barrels, for the same canvas
- `new THREE\.` / `\.clone\(\)` / a `useState` setter inside a `useFrame` callback — GC sawtooth and a 60 Hz re-render
- `useFrame\([^,]+,\s*[1-9]` — a positive priority blacks out the canvas
- `<Environment[^>]*preset=` with no self-hosted `files`/`<Lightformer>` — a third-party fetch on the render path
- `useGLTF\(` in a build with no `setDecoderPath\('/draco/'\)` anywhere — every Draco load is a `gstatic.com` request
- `<EffectComposer` in a file with no `<ToneMapping` — silently `NoToneMapping`
- `shadows="soft"` or bare `shadows` on r185 — deprecated and silently downgraded
- `onBeforeCompile` in a file without `customProgramCacheKey` — per-instance shader recompiles
- `transpilePackages` containing `three` — cargo cult, verified unnecessary on Next 16
- `"@types/three"` at a version that is not `three`'s — the `ThreeElements` augmentation drifts
- `"use client"` missing from any file importing `@react-three/fiber` — the build error names neither the directive nor the file
- `frameloop="always"` with no written justification in SYSTEM.md §scene

Non-greppable defects, named by smell:

- A second `<Canvas>` anywhere in the build — contexts are capped around 8–16 and the world is one place.
- A GLB committed without `gltf-transform` — the pipeline is not optional.
- A `gltfjsx` component tree used as the contract — it breaks on every artist re-export; names survive, trees do not.
- A scene that re-authors itself per route instead of moving the camera — that is N scenes wearing one canvas, and it is two signature moves at minimum.
- The static edition treated as a fallback rather than the first edition shipped — build it in step 3 or it will be a gray box with a spinner.
- A hex literal in GLSL or in a material constructor — that is a token that escaped `lib/tokens.ts`.
- An infinite camera loop with no end and no reachable footer — a site you cannot get to the bottom of is not a site.
- A `<boxGeometry>` world with a hand-splined camera presented as the signature move — that is a tutorial, and gate arm (d) exists to catch it.
- Nav or body copy rendered into the canvas as texture or SDF glyphs — Pattern 6's cautionary, and an accessibility failure no visual can buy back.
- An untyped `CustomEvent` string bus between the R3F tree and the DOM tree — invisible to devtools and to TypeScript; use one small typed store.

And the constitutional one: a world with no DIRECTION.md line naming this skill, its route scope, and its byte budget is not a signature move — it is someone else's demo, at the largest dependency cost this harness can incur. The scene is the ONE signature move and it spends the entire budget: a site that ships this *and* a second gesture has shipped none.

## Worked example — Framewalk, "Hollow Cartographer: Deepwater" launch microsite

design/DIRECTION.md commissions the world verbatim: *"Art-House Immersive, on Framewalk's Atmospheric Dark palette, earned by the game's fog-and-lantern art. Signature move: **the Descent** — one continuous lantern-lit cave the whole microsite inhabits; scroll is the camera's descent and each route is a chamber of it. Route scope: `/`, `/deepwater`, `/bestiary`, `/bestiary/[slug]`, `/wishlist` — the canvas persists across all five. Byte budget: GL chunk ≤380 kB gzip, lazy after LCP; GLB ≤1.4 MB; total ≤2.6 MB per route; LCP <1.5s. Static edition: one baked chamber poster per route plus the full DOM. — ultraweb:set-design."*

The gate runs out loud. (a) Named, with route scope and budget — pass. (b) Archetype **12 Art-House Immersive** with Framewalk's recorded Atmospheric Dark twist, and the direction is immersion itself, not a decorated hero — pass; it would have **failed on the parent site**, where `/devlog` is content-heavy and "Wishlist on Steam" makes it conversion-critical, both of which archetype 12 rules out by name. (c) SYSTEM.md §motion records intensity **3 / Theatrical** — pass. (d) The asset exists: the studio's own in-engine cave geometry re-exported from Blender with a camera action named `DescentAction` and five materials named for the stations — pass. (e) Game launch microsite, spectacle-native on taste's energy budget, and five chamber posters plus the DOM clear gate-visual alone — pass. All five; the commission stands.

Decision, with the numbers it was held to. One GLB: 4.7 MB → **1.31 MB** after `gltf-transform optimize --compress draco --texture-compress webp`, under the 1.4 MB line. `DescentAction` is 96s of authored travel; the journey map is `/` [0, 0.18] · `/deepwater` [0.20, 0.46] · `/bestiary` [0.48, 0.70] · `/bestiary/[slug]` [0.72, 0.86] · `/wishlist` [0.88, 1.00]. τ = **0.14s**, exported as `sceneTau` in `lib/motion.ts` beside `dur`/`ease` — motion-language owns it, the scene consumes it. Phosphor `oklch(0.78 0.15 160)` is the **only** emissive in the world — it is the lantern, and it resolves out of `lib/tokens.ts` into the material's emissive, never a hex in GLSL. One material patch: a 4-line depth-fog grade injected after `#include <map_fragment>` on the cave material with `customProgramCacheKey = () => "cave-fog-0.62"`. Lighting: ambient 0.06, one hemisphere at 0.9 with the ground tinted from `--background`, one lantern `pointLight` that *is* the accent, `<Environment><Lightformer/></Environment>` at zero requests, `shadows="variance"`. Post: SMAA plus one ChromaticAberration parked at zero that spikes 50ms then releases over 240ms when a bestiary creature resolves — semantic, not atmospheric — with `<ToneMapping ACES_FILMIC>` last in the chain. **Measured:** GL chunk **361 kB gzip** against the 380 budget; first-load JS `/` **128 kB** with the chunk deferred to an idle callback after the LCP entry; total `/` **2.21 MB**; LCP **1.28s**, CLS **0.00**; 60fps on all five routes; at 4× throttle it steps to dpr 1 + post off and holds **42fps**. Static edition: five posters baked from the same GLB at each window's start frame by a build-time script, shipped AVIF for the static and `reduce` tiers with a JPEG export of each frame as that route's `opengraph-image`. Under `reduce` the canvas never mounts; the poster plus three sentences of Phase-8 copy carry each chamber.

Rejected: four, in this order. (1) **This same request from Studio Norra** — `showpiece` already recorded for that client *"no set piece — signature met at the DOM+spring rung; showpiece scope: none, bundle delta 0kb"*, and `award-canon` explicitly kept a Scroll-as-Camera dolly out because an agency index is an index, not a scene; rasterizing case-study photography destroys the image crispness, text-first LCP and per-image alt text an index sells. Arm (b) fails, the answer is no, and it stays no however good the mockup looks. (2) **drei's `ScrollControls`** for the descent — it injects its own scroller, so `window.scrollY` stays 0 and motion's `useScroll`, `#anchor` links, page IntersectionObserver, find-in-page and scroll restoration all die inside it (per STACK.md); the tall-page + `useScroll` route keeps every one of them for +0 kB. (3) **GSAP ScrollTrigger + `scrub`**, which is how the rest of the industry builds this — rejected once in STACK.md on weight and anti-slop grounds, and it buys nothing here: `useScroll` → `useFrame` → `mixer.setTime()` is twelve lines and zero new dependencies. (4) **A hand-splined `CatmullRomCurve3` camera** — a week of JS reproducing what the studio's animator keys in an hour, and the result reads as code, not choreography.

Handoff: `ultraweb:direction` wrote the commission and owns any widening of the route scope; `ultraweb:motion-language` owns `sceneTau` in `lib/motion.ts` and recorded intensity 3; `ultraweb:imagery` bakes and treats the five chamber posters and `ultraweb:media-optimization` ships them plus the GLB/texture pipeline; `ultraweb:copywriting` authors the five `sr-only` narratives in Phase 8; `ultraweb:page-transitions` keeps the route announcer and the View-Transition grammar the camera move accompanies; `ultraweb:routing` owns `/bestiary/[slug]`; `ultraweb:app-structure` carries the written justification for the canvas leaf in the root layout; `ultraweb:seo` owns the per-route metadata, robots and sitemap; `ultraweb:physics` keeps the DOM cursor work; `ultraweb:gate-performance` records the GL-chunk row and `ultraweb:gate-accessibility` runs the five-route reduce, no-JS and keyboard passes.

## Composes with

- ultraweb:direction — the only authority that can commission a world; no DIRECTION.md line naming this skill, its route scope AND its byte budget, no scene. It is also the only authority that can widen the route scope.
- ultraweb:showpiece — the rung below and the source of every rule here: one set piece in one section stays there, and everything showpiece requires (three exits, the designed static edition, the sr-only narrative, the byte budget, the 60fps + 4×-throttle proof) binds here at *every* route the scene survives.
- ultraweb:taste — the constitution: the scene is ONE signature move at site scale and it spends the whole budget; the 3D heuristic's three conditions apply per route, not per site.
- ultraweb:motion-language — the vocabulary: intensity 3 is the floor, `sceneTau` lives in `lib/motion.ts` beside the tiers, and the scene consumes numbers it never invents. Camera work is position-mapped, so the 700ms ceiling does not address it.
- ultraweb:scroll-motion — native scroll stays authoritative, always: this skill is a consumer of `scrollYProgress`, never a scroller, and Scroll-as-Camera's scroll-jack discipline is its guardrail. Lenis remains that skill's separate gate.
- ultraweb:physics — DOM springs, cursor chrome, magnetic hover and drag stay there at `domMax`; camera damping and raycast hover are scene state and stay here. No `OrbitControls` on a site-scale scene.
- ultraweb:animejs — no overlap: SVG choreography is vector, this is a renderer, and `animejs/adapters/three` stays refused per STACK.md. Both commissioned on one site would be two signature moves.
- ultraweb:page-transitions — the App Router still owns navigation and the route announcer; the canvas persists *behind* a real route swap and never becomes the router.
- ultraweb:app-structure — a canvas leaf mounted from the root layout is exactly the "written justification" that skill demands; the boundary plan records it and gate-performance audits against it.
- ultraweb:routing — every route in a scene's scope stays a real URL with server-rendered content; routing owns the URL contract, this skill owns the camera window mapped to it, and dynamic segments need a window too.
- ultraweb:hero — the first viewport still renders headline and CTA from server HTML in front of the scene, never behind it; on a scene build the hero's first frame is the poster of the `/` window.
- ultraweb:imagery + ultraweb:media-optimization — imagery bakes the per-route posters that are simultaneously the static tier, the reduce tier, the no-JS tier and the OG image; media-optimization owns the model/texture pipeline and the self-hosted decoders.
- ultraweb:copywriting — authors the per-route narrative that carries each stretch of the world's argument in words.
- ultraweb:theme-worlds — the world axis re-points the DOM accent and the scene re-points its material palette from the same tokens; neither invents a value, and a hex in a uniform is a token that escaped.
- ultraweb:seo — per-route metadata, robots and sitemap; a canvas-first site is where this is most often lost.
- ultraweb:gate-performance / gate-accessibility / gate-antislop / gate-code — the per-route 60fps proof, the GL-chunk budget, the reduce/no-JS/keyboard passes, the uncited-renderer check and the two-half dependency check are the pass bar.
- ultraweb:award-canon — Scroll-as-Camera, The Persistent Hero Object, One Material World, The Loader is the Overture, Progressive Spectacle Tiers and Weight as a Feature are the patterns this skill executes at site scale. Cite the principle, never a winner's surface.
