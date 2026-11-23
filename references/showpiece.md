# showpiece

The award path: one commissioned signature spectacle (a hero set piece, an SVG sequence, or a site-scale scene) and everything that keeps it fast, accessible and real. Version pins, measured bundle sizes and package-specific facts live in `references/stack-3d.md`; this file does not restate them.

Load when: design/DIRECTION.md commissions a showpiece (flagship tier). Never loaded otherwise.
Reads: design/DIRECTION.md, design/SYSTEM.md §motion, `references/motion.md`, `references/stack-3d.md`, client assets. Writes: components/showpiece/* (or components/scene/*, lib/scene/*), the static edition, SYSTEM.md §scene.

## 1. When a showpiece is warranted

A showpiece is one signature move that DIRECTION.md names, places (page and section) and bounds (byte budget, route scope). Requirements, all of them:

1. DIRECTION.md commissions it by name with its byte budget. A showpiece added at build time without that line is removed.
2. The site type has the energy budget: portfolio, agency, campaign or release microsite, product hero; not a brochure, funnel or trust-critical site.
3. Motion intensity is recorded as 3 in SYSTEM.md (2 for an unscrubbed SVG timeline).
4. The assets exist or are obtainable (section 3). A boxGeometry scene with an improvised camera is a tutorial, not a signature.
5. A designed static edition is achievable and would pass the visual judge on its own.

One showpiece per site. The deletion test sorts the scale: delete the canvas; if the page keeps its shape and argument it was a set piece, if the site loses its shape it was a world. A world (a canvas persisting across routes with a scroll-driven camera) is a different commission from a set piece and needs its route scope and per-route static edition written in DIRECTION.md. Many small 3D moments on one page are one canvas with scissored viewports (drei `View`).

Weight is a design constraint set before richness (full 3D sites that lasted ship in single-digit MB), and the semantic layer is what survives, so build the static edition first.

## 2. The three exits and the cost ladder

**Three exits, always wired:** `prefers-reduced-motion` shows the static edition; no WebGL or context loss shows the static edition; hidden tab or offscreen pauses the loop (`visibilitychange` plus IntersectionObserver). Identical content in all three tiers, selected by capability and preference.

**The static edition is a designed deliverable**, a poster (gradient, SVG composition, treated image or a build-time render of the scene) that passes the visual judge alone. It also carries the argument in words: 2-4 sentences of real copy about what the piece claims, in a `sr-only` block that becomes visible under `prefers-reduced-motion`. Never template alt text such as "an interactive 3D scene". Germany's BFSG makes this a legal floor for in-scope builds.

**Cost ladder, cheapest sufficient rung:**

| Rung | Cost | Use |
|---|---|---|
| CSS | 0 KB JS | animated gradient, masked display type, blend modes, layered SVG, `clip-path` reveals |
| Static sequence | image/video bytes | pre-rendered frames or video scrubbed on a `sticky` stage; hero object examined through scroll at a fraction of WebGL weight |
| 2D canvas | 0 deps | particles (about 200-400 on mid hardware), generative lines, noise flows; preallocate arrays, one rAF loop, DPR capped |
| Shader | small | hand-rolled fragment shader on a raw WebGL quad (about 150 lines, no dependency) or a maintained shader-gradient library (check React compatibility) |
| R3F | heavy | product views, 3D type, scenes; the largest dependency decision in the build |
| Site-scale scene | heaviest | section 5 |

Try the lowest rung first; many "WebGL" briefs are satisfied by CSS or a static sequence. An anime.js moment (appendix) is a side branch, a different medium, and never excuses skipping cheaper rungs.

**Mounting pattern.** The scene loads behind `next/dynamic` with `ssr: false` inside a `"use client"` file, with the poster as `loading`. Headline and CTA render from server HTML; the canvas sits in the media slot behind or after them. The showpiece never owns LCP.

```tsx
"use client";
import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import { StaticPoster } from "./static-poster";
const Scene = dynamic(() => import("./scene"), { ssr: false, loading: () => <StaticPoster /> });

export function Showpiece() {
  const reduced = useSyncExternalStore(subscribeReduce, () => matchMedia("(prefers-reduced-motion: reduce)").matches, () => true);
  return reduced ? <StaticPoster /> : <Scene />;
}
```

(`subscribeReduce` adds a `change` listener on that media query; the server snapshot is `true` so the poster is the pre-hydration frame.) Inside the scene: feature-detect WebGL and return the poster on failure, cap `dpr` at 2 (`dpr={[1, 2]}`), pause on hidden or offscreen, and guard bfcache restores (`pageshow` with `e.persisted` reloads, because a restored page has a dead GL context).

**A navigable scene is app state.** Serialize explorable camera poses into a `?view=` param and restore on mount: `router.push` for discrete scenes, `router.replace` for continuous drags, written when a tween settles, never inside `useFrame`.

## 3. The asset problem

This path needs authored material: a GLB with a named camera clip and material names, footage, art-directed imagery. An LLM does not model. Decide the asset source in the brief and record it under the showpiece line in DIRECTION.md. Sources, in order of credibility:

| Source | Credible when |
|---|---|
| Client-supplied (GLB, CAD export, footage, renders) | Always the best. Ask in the brief intake; reject files without a license. Run the asset pipeline (section 6) before they enter the repo. |
| Commissioned or licensed from a 3D artist or asset library | Camera clip and material names written to the station contract in SYSTEM.md §scene so the artist delivers to it. |
| Generated with the session's image, 3D or video tools | Imagery and video are credible for static sequences, textures, posters and backgrounds. Generated meshes are rough: expect topology and UV cleanup, no camera clip, no material names. Use them as props inside a procedural world or as a still, never as the hero of a close-up. Flag licensing and style drift across generations as risks. |
| Procedural or shader-only scene (no model) | Fully credible without a DCC artist: instanced geometry, noise fields, a signed-distance-field shader, particles, a generative terrain. The look comes from one material and one light, so it reads as authored. This is the default flagship path when no assets exist. |

**Not credible without an artist:** a character, a detailed product, an interior, a hand-keyed cinematic camera. If the brief needs one and no source exists, say so at CP1 and downgrade to a rung that fits or ask the client for assets.

**Camera path without a DCC clip.** Keep a keyframe table (position, target, fov, normalized t) in a data file, sampled with a Catmull-Rom curve and an eased `lookAt`. A dev-only fly mode that dumps the current pose on a key press captures keyframes by flying rather than guessing. It is cruder than a DCC clip; credible for procedural scenes.

## 4. Performance conditions

All must hold, measured, recorded in SYSTEM.md and QA:

1. Steady 60 fps over at least 5 s of interaction on mid hardware, no long task over 50 ms (Playwright `performance`/`PerformanceObserver`).
2. At 4x CPU throttle it stays at 30 fps or higher, or it detects and falls to the next rung or the static edition. Record which rung it settled on.
3. LCP element is server-rendered text or image, not the canvas; the GL chunk's request begins after the LCP entry.
4. Reduced motion: no canvas element in the DOM; poster and narrative render, so the page is complete.
5. WebGL killed: static edition renders, console clean. JS off: content, nav and metadata still serve.
6. Zero per-frame allocations: hoist vectors and colors to module scope and mutate in place; clamp `delta` to 1/30 s; no `new THREE.` or `.clone()` or `setState` inside `useFrame`.
7. No third-party CDN requests for decoders, environments or fonts (section 7).

**Mobile and adaptive ladder.** Adapt the camera, not the world: cache the authored `fov`, widen it by at most 3 degrees below the same breakpoint Tailwind uses, hard cap 72 degrees, `updateProjectionMatrix()`. Narrow: `dpr` `[1, 1.5]`, shadow map 1024, `multisampling={0}`. Live step-down: dpr, then post off, shadows off, environment resolution, then the static edition, driven by drei `PerformanceMonitor` (plus `AdaptiveDpr`) with an initial tier from `useDetectGPU`. Content is identical at every rung.

**The JS budget, stated honestly.** The cold-load JS budget in `references/gates.md` is a number the checker measures from the network. A renderer inside cold-load JS is a mounting defect. A GL chunk requested after the load window is not part of the cold-load figure, and the perf gate reports it anyway on its own line, so no number is hidden. DIRECTION.md writes four budgets before the first shader and QA re-measures them:

| Line | Default ceiling unless DIRECTION.md writes another |
|---|---|
| Cold-load JS per route (non-scene remainder) | the standard cold-load budget, unchanged |
| GL chunk, gzip, requested after LCP | 400 KB |
| Authored model after optimization | 1.5 MB |
| Total transfer per route (model, textures and decoders count) | 3 MB; non-scene routes keep the normal page budget |

A chunk parked just past the load window is still reported at full size, and the weight tradeoff goes to the user at CP1.

## 5. The site-scale scene (a world)

A persistent canvas fixed behind natively scrolling DOM, one camera clip spanning every route, one material world. Commission-only; requires route scope, byte budget and per-route static edition in DIRECTION.md.

**Native scroll stays authoritative.** No `preventDefault` on `wheel`, no drei `ScrollControls`, no virtual scroller. The page is genuinely tall, the scrollbar is real, and Space, PageDown, Home, End, find-in-page, anchors and deep links work because nothing took them away. If inertia is wanted, it is Lenis under its contract in `references/motion.md`, layered on native scroll.

**The canvas is `aria-hidden` only because it is the second path to everything.** Every affordance in the world has a DOM twin rendered from one registry. No twin means build one or cut the affordance. Every route is a real route: server-rendered `<main>`, `<h1>`, content, a distinct title and description, canonical, OG image, sitemap, `<noscript>`. 

**The static edition is a per-route deliverable built first** (server-component pages, poster in the layout background slot, narrative copy); the site ships with zero 3D dependencies installed. Each route's poster is one build-time render of the scene at its window start (AVIF for the static tier, JPEG for `opengraph-image`).

**Journey map: one clip, every route.** Each route owns a normalized window of the clip. Page scroll maps into the route's window; navigating retargets the playhead and the damper carries the camera, which is the transition. The scene is a pure function of `pathname` and `scrollYProgress`.

```ts
// lib/scene/journey.ts: the only place route-to-camera mapping exists
export const CLIP = "<action name in the GLB>";
export const journey = {
  "/":                [0.00, 0.18],
  "/work":            [0.20, 0.46],
  "/work/[slug]":     [0.48, 0.70],
  "/contact":         [0.88, 1.00],
} as const satisfies Record<string, readonly [number, number]>;
// Windows never overlap; gaps are transition travel; the last window ends at 1.
// The key is the route PATTERN: match "/work/kraken" back to "/work/[slug]" with one small matcher
// beside the map (or useSelectedLayoutSegments), never a second copy of the windows.
```

```tsx
// components/scene/camera-rig.tsx: inside the canvas leaf. Read scroll in the DOM-side leaf and pass the
// MotionValue in as a prop so no DOM hook runs inside the R3F tree.
import { useRef } from "react";
import type { AnimationMixer } from "three";
import { useFrame, invalidate } from "@react-three/fiber";
import { useMotionValueEvent, type MotionValue } from "motion/react";
import { sceneTau } from "@/lib/motion";
import { journey } from "@/lib/scene/journey";

export function CameraRig({ progress, routeKey, mixer, duration }:
  { progress: MotionValue<number>; routeKey: keyof typeof journey; mixer: AnimationMixer; duration: number }) {
  const [from, to] = journey[routeKey];
  const play = useRef(from);
  useMotionValueEvent(progress, "change", () => invalidate());   // a scroll tick while parked schedules no frame by itself
  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 30);                          // alt-tab return must not teleport
    const target = from + (to - from) * progress.get();
    play.current += (target - play.current) * (1 - Math.exp(-dt / sceneTau));
    mixer.setTime(play.current * duration);
    if (Math.abs(target - play.current) > 1e-4) invalidate();    // parked camera renders zero frames
  });
  return null;
}
```

- `1 - Math.exp(-dt / tau)` is the only smoothing. A fixed-alpha `lerp(a, b, 0.1)` is twice as fast at 120 Hz as at 60 Hz, so the same code feels like a different site on a different monitor. `sceneTau` is one number in `lib/motion.ts` and it is the site's scroll personality. Write the one line yourself rather than adding a math dependency.
- `frameloop="demand"` is the default with `invalidate()` while the damper moves. `"always"` only for a DIRECTION-named living idle, paused on `document.hidden` and when covered, with the reason written in SYSTEM.md §scene.
- Each route's scroll track is genuinely tall (about `min-h-[300vh]`), sized for reading pace; never pad a page to buy camera time.
- Keep the Suspense fallback inside the Canvas; an outer boundary unmounts and rebuilds the WebGL context. A second `<Canvas>` anywhere is a defect (context cap is around 8-16, and the world is one place).

**Named moves (all inside the one commissioned world):**

- **Authored camera.** One clip in the GLB, other actions paused, `mixer.setTime()` driving it. Use the GLTF's camera (`gltf.cameras[0]` into `set({ camera })`), cache the authored `fov` in a `WeakMap`, restore on unmount. No clip: the keyframe fallback in section 3.
- **Material names are the API.** One `stations` array is the contract between artist and build and has three consumers: the TypeScript union of material names, the DOM nav's `<a href>`s and the scene hotspots. Find meshes with `scene.traverse` and `material.name`; never use `gltfjsx` component trees, which break on every re-export while names survive. A dev-time assertion fails loudly when a union name is not found.
- **Patch, don't write.** `material.onBeforeCompile` with a `#include <map_fragment>` replace keeps PBR, shadows, fog and tone mapping. `customProgramCacheKey` is mandatory or three recompiles per instance. Snapshot the material's color, emissive, maps, metalness, roughness and `toneMapped` into a `Map` before mutating and restore on teardown, because the loader cache is shared across mounts. At most one full `ShaderMaterial` on the site.
- **Canvas textures for type.** A 1024 px 2D canvas bound to `map` and `emissiveMap` gives kerning, ligatures and CJK with no dependency, where drei `Text` is the costliest component. Set `toneMapped: false`, sRGB, `generateMipmaps: false`, linear filters, anisotropy `Math.min(8, gl.capabilities.getMaxAnisotropy())`. Redraw on a dirty flag only. Headline and decorative panels only; nav and body copy live in the DOM.
- **Wait for the font before the first draw.** A texture baked before the webfont loads stays wrong. Draw once, `await Promise.race([document.fonts.ready, timeout(5000)])`, poll `document.fonts.load(shorthand, sample)` (capped 5 s), redraw, set `needsUpdate`. Use the exact shorthand `next/font` generates.
- **Postprocessing as punctuation.** The composer holds anti-aliasing, tone mapping last, and at most one semantic effect that rests at zero amplitude and spikes on a discrete event. Mutate a module-scope uniform in `useFrame`; a per-frame `setState` rerenders the composer tree 60 times a second. A default bloom, noise, vignette and chromatic-aberration stack makes every R3F site look alike.
- **Light by exposure, one material world.** Three lights and one image-based light is the ceiling; a hemisphere light plus exposure beats six point lights. Environment is a self-hosted HDRI or `<Environment><Lightformer/></Environment>`. Every surface commits to one primitive so the site reads as one place; colors resolve from the token module, and a hex literal in GLSL is a token that escaped.
- **3D objects are links.** A raycast hit dispatches an intent carrying the DOM nav's `href`; use a typed callback or one small typed store, never an untyped `CustomEvent` bus. One preallocated raycaster per frame, gated on an interactive flag and pointer-enter/leave flags. On touch, tap versus drag is discriminated at 12 px of movement.
- **Degrade the choreography, keep the content.** Coarse pointer: no custom cursor. Narrow viewport: simpler transition. Reduced motion: no canvas.

## 6. Asset pipeline (dev-only, zero runtime footprint)

```bash
gltf-transform inspect world.glb
gltf-transform optimize world.glb public/models/world.glb --compress draco --texture-compress webp
```

Then `prune`, `dedup`, `weld`, `join`, `instance` as inspect suggests. An unoptimized GLB never enters the repo. Self-host decoders (copy the draco and basis folders from three's examples into `public/` and point the loaders there). Draco pays for itself on any real mesh; the KTX2 transcoder is several times larger and only wins past several 2K maps, so below that use WebP. Video textures load behind IntersectionObserver and `canplay` with a poster.

## 7. Verified R3F, three and drei traps

Version-specific behavior (shadow types, peer ranges, deprecations) is in `references/stack-3d.md`; recheck it against the installed versions.

- `<Canvas>` imports all of three and extends it, so there is no tree-shaking; budget the floor the moment a canvas exists. Named imports only; `import * as THREE` or `import * as` drei barrels cost multiples.
- `"use client"` is mandatory and the failure lies: a Canvas in a Server Component fails the build with `TypeError: ...createContext is not a function` in a minified SSR chunk, with no mention of the directive. Imports are SSR-safe; only constructing a renderer throws.
- Adding `<EffectComposer>` sets `gl.toneMapping` to none on mount, so highlights blow out. Put a tone-mapping effect last in the chain.
- `useFrame(cb, priority)` with a positive priority takes over rendering and blacks out the canvas until you call `gl.render()`. Never pass a priority to run something last.
- drei `ScrollControls` is not page scroll. It injects its own `overflow-y: auto` scroller, so `window.scrollY` stays 0 and motion `useScroll`, CSS `animation-timeline`, page IntersectionObserver, anchors and scroll restoration are dead inside it; `<Scroll html>` renders through a second React root, so theme, router and i18n providers are undefined there. drei's own `useScroll` returns null outside `ScrollControls`; the page-tracking hook here is motion's. Reserve `ScrollControls` for a canvas-only route.
- drei fetches decoders and environments from third-party CDNs by default (Draco from a Google host, KTX2 from an unpinned jsDelivr ref, `Environment preset` from a GitHub-raw proxy). All three are self-hosted: same defect class as un-self-hosted Google Fonts, and a consent problem in the EU.
- three, fiber and drei have no reduced-motion support; at site scale the canvas does not mount.
- Bare `shadows` and `shadows="soft"` map to a shadow type three has deprecated and downgrades; use `variance` or drei's shadow components (check `references/stack-3d.md`).
- `@types/three` is locked to `three`, which is pinned exactly where a peer range caps it (`references/stack-3d.md`). `transpilePackages: ['three']` is stale advice; add it only if the build fails without it.
- WebGPU is not the default: Canvas imports the WebGL stack, so adding it ships both; check `references/stack-3d.md` first.

Greppable: `addEventListener\("wheel"` with `preventDefault`; `ScrollControls`; `useFrame\([^,]+,\s*[1-9]`; `<Environment[^>]*preset=`; `useGLTF\(` with no `setDecoderPath`; `onBeforeCompile` without `customProgramCacheKey`; `<EffectComposer` without tone mapping; `frameloop="always"` unjustified.

## Appendix: anime.js SVG timelines (verified traps)

Use only when DIRECTION.md commissions an SVG moment that needs at least two of: multi-path timeline sequencing, path `d` morph, motion path, 2D grid stagger, split-text choreography, scroll-scrubbed SVG. One path draw alone stays on motion `pathLength` or a CSS `stroke-dashoffset` transition at zero cost. Intensity 2 or higher, 3 for scrubbed or pinned. Install in the build phase per `stack/versions.json`; never `@types/animejs` (it is the old major and shadows the bundled types). One commissioned moment per site, authored as one `createTimeline` rather than parallel `animate()` calls. The finished artwork renders in server HTML at its final state and is never the LCP element. At most 2 concurrent SVG choreographies per viewport (attribute animation is not compositor-friendly); non-scrubbed timelines pause on hidden tab and offscreen.

Convert the token mirror once: anime runs in milliseconds where motion runs in seconds.

```ts
// lib/motion.ts, appended only when commissioned
import { cubicBezier } from "animejs";
export const animeEase = { out: cubicBezier(...ease.out), inOut: cubicBezier(...ease.inOut), in: cubicBezier(...ease.in) } as const;
export const animeDur = { micro: dur.micro * 1000, small: dur.small * 1000, section: dur.section * 1000 } as const;
```

- No default export; `import anime from "animejs"` is the old idiom. Use named imports from the root barrel (`animate`, `createTimeline`, `createScope`, `stagger`, `svg`, `text`, `utils`, `onScroll`, `splitText`, `scrambleText`, `cubicBezier`). Never `import * as`; the root barrel tree-shakes well, so subpath imports are optional.
- `ease: "cubicBezier(...)"` as a string silently runs linear with only a console warning. Pass the function `cubicBezier()` returns. An unknown ease name also falls back to linear with no warning.
- A `spring()` ease returns an object whose computed duration overrides the tween's duration; set one, not both.
- `onScroll` defaults to `sync: "play pause"`, which is threshold playback, not scrubbing. Scrub with `sync: true` (a number adds lag smoothing). Pass it as the timeline's `autoplay`.
- `svg.createDrawable(".curve")` is required for `draw`; `draw` is not a real attribute, so a raw selector writes an inert attribute and nothing draws. The reduced-motion branch also goes through `createDrawable`.
- `morphTo` needs matching point counts and no baked transforms. `createMotionPath` spreads translate and rotate onto the traveler.
- `splitText` rewrites `innerHTML` and installs a ResizeObserver; keep `accessible: true` (the default) and `revert()` it with the scope, or the observer leaks and the markup stays mangled.
- Wire through `createScope({ root, mediaQueries: { reduceMotion: "(prefers-reduced-motion: reduce)" } })` inside `useEffect` of a client leaf. Pass the ref object as `root`, not `root.current`. Under `self.matches.reduceMotion` land the FINAL state (paths drawn, text assembled); a path left at full dashoffset is invisible content. Clean up with `scope.current?.revert()` (optional chaining, StrictMode double-invokes effects).
- `createDraggable` is not used; drag stays with motion. Text scramble never justifies the install.

Greppable: `import anime from`; `@types/animejs`; `ease: ["']cubicBezier`; `createDraggable`; `accessible: false`; `duration: 0\.` in a file importing `animejs`.
