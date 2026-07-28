---
name: showpiece
description: Hero-grade set pieces for ultraweb builds — 2D canvas, shader/mesh gradients, particles, R3F/three.js 3D — under taste's hard gate — only when DIRECTION.md demands it, 60fps verified on mid hardware, static fallback and reduced-motion path mandatory, one per site. Covers the cost ladder (CSS → canvas → shader → R3F), next/dynamic ssr:false mounting, and LCP protection. Invoke in the ultraweb motion phase (Phase 9) when DIRECTION.md commissions it, or when the user says "WebGL hero", "3D product view", "shader gradient", "particles", "something jaw-dropping in the hero", "an interactive centerpiece", or "make a 3D view shareable / deep-linkable".
---

# showpiece — one set piece, fully earned

**Stage:** Phase 9 — Motion (DIRECTION-gated) - **Reads:** design/DIRECTION.md (signature move), design/SYSTEM.md, design/BRIEF.md - **Writes:** ONE signature element (components/showpiece/*) + its static fallback

## Standard

Taste's rule verbatim: 3D, shaders, canvas only when the direction demands it, it runs 60fps on mid hardware, and there's a static fallback — a fast plain site beats a janky impressive one, always. One showpiece per site; it IS the signature move or directly serves it. First-grade additionally means:

- **The showpiece never owns LCP.** Hero headline and CTA render from server HTML and paint first; the canvas mounts behind or after them.
- **The static fallback is itself designed** — a poster frame (gradient, SVG composition, or treated image via `imagery`) that would pass `gate-visual` alone. Reduced-motion users, no-WebGL browsers, and the pre-hydration frame all see it; it is not a degradation, it is the second edition of the design.
- **The fallback carries the argument in words, not just a picture.** A showpiece asserts a claim — about the product, the craft, the world; the accessible edition must state that claim, not gesture at it. Every canvas/WebGL/R3F section ships a sibling narrative — 2–4 sentences of real copy authored in Phase 8 (`ultraweb:copywriting`), never template alt text like "an interactive 3D scene" — in an `sr-only` block that becomes visible under `prefers-reduced-motion`. The meaning survives without the spectacle; that is the test. (Germany's BFSG, in force since 2025-06-28, makes this a legal floor for DACH sites, not a courtesy.)
- **Three exits wired**: `prefers-reduced-motion` → static; WebGL/context unavailable → static; tab hidden or element offscreen → animation loop paused.
- **A navigable scene is app state, not a demo reel.** If the showpiece is an explorable 3D/canvas view — an R3F scene, multiple camera framings, a scene selector — its camera (position, target, fov) and active scene belong in the URL, not trapped in `useState`. Encode them into a `?view=` search param and restore on mount, so the moment is bookmarkable, shareable, and reachable by back/forward — a place, not a reel. `ultraweb:routing` owns the URL contract; the discipline that keeps it cheap is in the mounting pattern below.
- **Cheapest rung wins.** Climb the cost ladder only as far as the direction requires.
- **Progressive Spectacle Tiers (`award-canon`) is the operational form of this gate.** The three exits above ARE the tiers — a complete static/semantic baseline (no-JS, no-WebGL, reduced-motion), a CSS/Motion-enhanced tier, an optional WebGL top rung — identical content across all three, selected by capability + preference. Build the static tier FIRST as the durable edition, never a degraded stub.
- **Weight as a Feature (`award-canon`): payload is a headline constraint set before richness, not after.** The winners that lasted ship full 3D worlds in single-digit MB — Messenger 5.7MB initial (Developer Site of the Year 2025), Bruno Simon ~2.8MB, Orano 901KB gzipped; set a byte budget before the first shader, because a 9MB/6s page will not win regardless of beauty. Most OLDER canvas-only winners in the corpus are now dead or replaced — Messenger is the living exception, and even it ships essentially no static/SEO path — so the semantic layer is what survives.
- **What the set piece should BE (`award-canon`).** One Material World — commit every surface to a single primitive (ice, glass, points of light, grain) so the piece reads as one world, not a pile of unrelated effects; Fake-Depth Before Real Depth — layered 2D parallax, baked light, and matcaps buy the *look* of depth at a fraction of the cost, which is why the cost ladder climbs slowly; and one persistent hero object examined through scroll out-executes ten decorated sections.

## Process

1. **Gate check — all four or stop:** (a) DIRECTION.md names the showpiece as/serving the signature move; (b) the site type has the energy budget per taste (portfolio/agency/product-hero — not a local-business brochure); (c) a first-grade static fallback is achievable; (d) you will profile before shipping. Any "no" → `scroll-motion` or `physics` likely delivers the signature cheaper.
2. Pick the lowest sufficient rung on the cost ladder (below).
3. **Build the static fallback FIRST** and drop it into the layout. The page must be shippable at this point.
4. Implement the live piece behind `next/dynamic` with `ssr: false` (this call must live in a `"use client"` file), using the fallback as `loading` state so there is never a blank frame.
5. Wire the three exits; cap `devicePixelRatio` at 2; pause the loop when `document.hidden` or the element leaves the viewport (IntersectionObserver).
6. **Verify empirically:** DevTools performance recording ≥5s of interaction — steady 60fps, no long tasks >50ms; re-run at 4x CPU throttle and confirm it stays fluid (≥30fps) or falls back; `npm run build` and compare client bundle before/after — the delta is a design decision, record it in SYSTEM.md.

## Cost ladder

- **CSS set piece (0kb JS).** Animated gradient via `@theme` `--animate-*` keyframes, masked display type, blend modes, layered SVG. Try to kill the showpiece here first — many "WebGL" briefs are satisfied by a great CSS backdrop.
- **2D canvas (0kb deps).** Particle fields, generative lines, noise flows. Cap ~200–400 particles on mid hardware; zero object allocation inside the draw loop (pre-allocate arrays, reuse vectors); one `requestAnimationFrame` loop, DPR-capped.
- **Shader gradient (WebGL, small).** Animated mesh/noise gradient as a hero backdrop — either a maintained shader-gradient library (verify current package options and React 19 compat against docs first) or a hand-rolled fragment shader on a raw WebGL quad (~150 lines, no dependency).
- **R3F 3D (heaviest).** `@react-three/fiber` + `@react-three/drei` for product views, 3D type, scenes. three.js core alone adds on the order of 150kb+ min+gzip to the client bundle — the largest single dependency decision in the build; verify current versions and React 19 compatibility against docs before installing. Discipline: `dpr={[1, 2]}`, demand-driven frameloop for static-ish scenes, compressed models, no per-frame allocations in `useFrame`.

**Side branch, not a rung — vector-authored moments (anime.js, +~19 KB gz per STACK.md).** A commissioned SVG timeline — multi-path draw, morph, motion path, split-text choreography — is a different medium, not a cheaper canvas, so it never sits between the two 0-dep rungs and never excuses skipping them: if CSS or a 2D canvas satisfies the brief, they still win. Take the branch only when the moment is *inherently* vector (a diagram that draws itself, a mark that assembles, a route that traces) and DIRECTION.md names it at intensity ≥2 (a scrubbed or pinned SVG timeline needs 3); ultraweb:animejs owns the install gate. Everything above holds unchanged — one showpiece per site, and the three exits wired: reduced motion → the final drawn state, no-WebGL/no-JS/pre-hydration → the server-rendered static SVG, hidden tab or offscreen → the timeline paused.

## Mounting pattern

```tsx
// components/showpiece/index.tsx
"use client";
import dynamic from "next/dynamic";
import { StaticPoster } from "./static-poster"; // the designed fallback

const Scene = dynamic(() => import("./scene"), {
  ssr: false,
  loading: () => <StaticPoster />,
});

export function Showpiece() {
  if (typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return <StaticPoster />;
  }
  return <Scene />;
}
```

Inside `scene.tsx`: feature-detect the WebGL context and return `<StaticPoster />` on failure; register `visibilitychange` + IntersectionObserver to pause the loop. The hero section renders headline/CTA as server HTML and places `<Showpiece />` in the background/media slot — never the other way around.

**Scene state in the URL (navigable scenes only).** Serialize a small pose object to base64 in `?view=` and hydrate from it on mount. Commit discrete scenes with `router.push` (each is a back-button entry); stream continuous camera drags with `router.replace` so a drag doesn't spam history — and write back only once a tween settles, never inside `useFrame`.

```tsx
// inside the "use client" scene wrapper — navigable scenes only
const params = useSearchParams();
const router = useRouter();                         // next/navigation
const initial = decodePose(params.get("view"));    // base64 → { pos, target, fov }

// on settle (tween end / OrbitControls 'end' event) — NOT per frame:
const persist = (pose: Pose, discrete: boolean) => {
  const href = `?view=${encodePose(pose)}`;
  discrete ? router.push(href, { scroll: false })
           : router.replace(href, { scroll: false });
};
```

## Pass criteria

Record all six in design/SYSTEM.md (decision + bundle delta) and design/QA.md (measurements) before the gates run:

1. Performance recording shows steady 60fps over ≥5s of interaction, zero long tasks >50ms.
2. 4x CPU throttle stays fluid (≥30fps) or the piece detects and falls back.
3. LCP element is server-rendered text/image, not the canvas — confirmed in DevTools.
4. Reduced-motion emulation renders `StaticPoster` with its narrative text visible, and the poster plus that narrative carry the argument on their own (real copy, not template alt text).
5. Kill WebGL (or test a no-WebGL context): static path renders, console clean.
6. Client bundle delta measured via `npm run build` before/after and accepted deliberately.

## Anti-patterns

- Scene imported statically (grep the showpiece for imports without `dynamic(`) — three.js lands in the shared client bundle.
- Canvas as the LCP element — hero text must paint from server HTML first.
- `requestAnimationFrame` loop with no `document.hidden`/IntersectionObserver pause — burns battery on hidden tabs; grep the raf callsite for a visibility guard.
- Allocations per frame: `new THREE.Vector3(...)` or object literals inside `useFrame`/the draw loop — GC hitching.
- A gray box or `null` as the fallback — the fallback is a designed deliverable, not an apology.
- Two showpieces — taste allows one signature move; the second dilutes both.
- Particle-count flexing: thousands of particles at 20fps loses to hundreds at 60fps every time.
- A spinning 3D object with no relation to the brief — decoration is not direction; if DIRECTION.md can't say what it means, cut it.
- Skipping the 4x-throttle run — "60fps on my machine" is not "60fps on mid hardware".
- Camera or scene locked in `useState` on a navigable piece — a view no link can reach and the back button can't undo is a demo reel wearing a URL bar. Grep an explorable scene for `useSearchParams`; its absence is the smell.
- Writing the URL every frame — `router.replace` inside `useFrame` thrashes history and re-renders; sync only when the tween settles.
- An `sr-only` narrative that parrots template alt text ("an interactive 3D scene") instead of the claim the visual makes — it must carry the argument, or it fails both the screen-reader user and the BFSG.

## Worked example — Studio Norra, Oslo agency portfolio index

design/DIRECTION.md commissions the signature move verbatim: "cursor-proximity case-study image reveals on the `/work` index." Editorial Brutalist, Archivo Expanded display over Inter body, paper `oklch(0.96 0.005 90)` / ink `oklch(0.2 0.01 270)` with signal red `oklch(0.6 0.21 25)` reserved for interaction states.

The gate check's site-type arm passes (agency portfolio — spend boldly), but the cost-ladder arm decides it: the cheapest sufficient rung is the *floor*. The eight case-study photos stay real `<img>` in the DOM — crisp, indexable, alt-texted — revealed via `clip-path` and drawn toward the pointer by a `useSpring` follower. 0kb of WebGL, no canvas, no R3F. showpiece declines to escalate and records in design/SYSTEM.md: "no set piece — signature met at the DOM+spring rung; showpiece scope: none, bundle delta 0kb."

Rejected: a fragment-shader displacement reveal on a raw WebGL quad. It lost because rasterizing the work onto a canvas destroys exactly what an agency index sells — image crispness, text-first LCP, per-image alt text — for zero gain over `clip-path`.

Handoff: the pointer spring is owned by ultraweb:physics; the `/work` → `/work/[slug]` shared-element image transition (springs, not ease-out defaults) is owned by ultraweb:scroll-motion. The static fallback — the plain index list revealing each image on hover/focus — is what prefers-reduced-motion and no-JS receive, and it clears gate-visual on its own. Because the case-study images stay real DOM with authored alt text and the list names each project, that fallback already carries the argument in words — the narrative text-track is satisfied without a separate `sr-only` block; and with no camera, there is no scene state to route.

## Composes with

- ultraweb:direction — the only authority that can commission a showpiece; no DIRECTION.md mandate, no showpiece.
- ultraweb:hero — the showpiece usually lives in the first viewport: hero owns layout, headline scale, and CTA hierarchy; the showpiece is its backdrop or media slot.
- ultraweb:imagery — designs the static poster fallback (gradient meshes, noise, treated imagery).
- ultraweb:media-optimization — LCP protection and asset strategy when the showpiece shares the fold.
- ultraweb:gate-performance — the 60fps recording, bundle delta, and LCP checks are its pass bar.
- ultraweb:gate-accessibility — verifies the reduced-motion exit renders the static path AND that its narrative text-track carries the argument (real copy, not template alt text).
- ultraweb:copywriting — authors the narrative text-track in Phase 8 (2–4 sentences per showpiece section stating the visual's actual claim), so the accessible edition argues instead of leaving a placeholder.
- ultraweb:physics — when the cheapest sufficient rung is a pointer/element spring rather than canvas or WebGL, showpiece hands the motion to physics and builds no set piece.
- ultraweb:animejs — the cost ladder's side branch: when the set piece is inherently vector rather than canvas, showpiece hands it there and the one-showpiece budget plus the three exits travel with it.
- ultraweb:scroll-motion — a "showpiece" brief that is really a scroll-linked reveal or shared-element page transition is routed down to scroll-motion instead of mounting a canvas.
- ultraweb:routing — the home for camera/scene URL state: showpiece serializes the pose into a `?view=` search param, routing owns the search-param contract that makes a navigable scene bookmarkable and back/forward-navigable.
- ultraweb:award-canon — Weight as a Feature and Progressive Spectacle Tiers are the operational form of this skill's 60fps + static-fallback gate; One Material World, Fake-Depth Before Real Depth, and The Persistent Hero Object guide what the set piece should be. Cite the principle, never a winner's surface.
