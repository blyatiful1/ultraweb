---
name: showpiece
description: Hero-grade set pieces for ultraweb builds — 2D canvas, shader/mesh gradients, particles, R3F/three.js 3D — under taste's hard gate — only when DIRECTION.md demands it, 60fps verified on mid hardware, static fallback and reduced-motion path mandatory, one per site. Covers the cost ladder (CSS → canvas → shader → R3F), next/dynamic ssr:false mounting, and LCP protection. Invoke in the ultraweb motion phase (Phase 9) when DIRECTION.md commissions it, or when the user says "WebGL hero", "3D product view", "shader gradient", "particles", "something jaw-dropping in the hero", or "an interactive centerpiece".
---

# showpiece — one set piece, fully earned

**Stage:** Phase 9 — Motion (DIRECTION-gated) - **Reads:** design/DIRECTION.md (signature move), design/SYSTEM.md, design/BRIEF.md - **Writes:** ONE signature element (components/showpiece/*) + its static fallback

## Standard

Taste's rule verbatim: 3D, shaders, canvas only when the direction demands it, it runs 60fps on mid hardware, and there's a static fallback — a fast plain site beats a janky impressive one, always. One showpiece per site; it IS the signature move or directly serves it. First-grade additionally means:

- **The showpiece never owns LCP.** Hero headline and CTA render from server HTML and paint first; the canvas mounts behind or after them.
- **The static fallback is itself designed** — a poster frame (gradient, SVG composition, or treated image via `imagery`) that would pass `gate-visual` alone. Reduced-motion users, no-WebGL browsers, and the pre-hydration frame all see it; it is not a degradation, it is the second edition of the design.
- **Three exits wired**: `prefers-reduced-motion` → static; WebGL/context unavailable → static; tab hidden or element offscreen → animation loop paused.
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

## Pass criteria

Record all six in design/SYSTEM.md (decision + bundle delta) and design/QA.md (measurements) before the gates run:

1. Performance recording shows steady 60fps over ≥5s of interaction, zero long tasks >50ms.
2. 4x CPU throttle stays fluid (≥30fps) or the piece detects and falls back.
3. LCP element is server-rendered text/image, not the canvas — confirmed in DevTools.
4. Reduced-motion emulation renders `StaticPoster`, and the poster alone reads as designed.
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

## Worked example — Studio Norra, Oslo agency portfolio index

design/DIRECTION.md commissions the signature move verbatim: "cursor-proximity case-study image reveals on the `/work` index." Editorial Brutalist, Archivo Expanded display over Inter body, paper `oklch(0.96 0.005 90)` / ink `oklch(0.2 0.01 270)` with signal red `oklch(0.6 0.21 25)` reserved for interaction states.

The gate check's site-type arm passes (agency portfolio — spend boldly), but the cost-ladder arm decides it: the cheapest sufficient rung is the *floor*. The eight case-study photos stay real `<img>` in the DOM — crisp, indexable, alt-texted — revealed via `clip-path` and drawn toward the pointer by a `useSpring` follower. 0kb of WebGL, no canvas, no R3F. showpiece declines to escalate and records in design/SYSTEM.md: "no set piece — signature met at the DOM+spring rung; showpiece scope: none, bundle delta 0kb."

Rejected: a fragment-shader displacement reveal on a raw WebGL quad. It lost because rasterizing the work onto a canvas destroys exactly what an agency index sells — image crispness, text-first LCP, per-image alt text — for zero gain over `clip-path`.

Handoff: the pointer spring is owned by ultraweb:physics; the `/work` → `/work/[slug]` shared-element image transition (springs, not ease-out defaults) is owned by ultraweb:scroll-motion. The static fallback — the plain index list revealing each image on hover/focus — is what prefers-reduced-motion and no-JS receive, and it clears gate-visual on its own.

## Composes with

- ultraweb:direction — the only authority that can commission a showpiece; no DIRECTION.md mandate, no showpiece.
- ultraweb:hero — the showpiece usually lives in the first viewport: hero owns layout, headline scale, and CTA hierarchy; the showpiece is its backdrop or media slot.
- ultraweb:imagery — designs the static poster fallback (gradient meshes, noise, treated imagery).
- ultraweb:media-optimization — LCP protection and asset strategy when the showpiece shares the fold.
- ultraweb:gate-performance — the 60fps recording, bundle delta, and LCP checks are its pass bar.
- ultraweb:gate-accessibility — verifies the reduced-motion exit actually renders the static path.
- ultraweb:physics — when the cheapest sufficient rung is a pointer/element spring rather than canvas or WebGL, showpiece hands the motion to physics and builds no set piece.
- ultraweb:scroll-motion — a "showpiece" brief that is really a scroll-linked reveal or shared-element page transition is routed down to scroll-motion instead of mounting a canvas.
- ultraweb:award-canon — Weight as a Feature and Progressive Spectacle Tiers are the operational form of this skill's 60fps + static-fallback gate; One Material World, Fake-Depth Before Real Depth, and The Persistent Hero Object guide what the set piece should be. Cite the principle, never a winner's surface.
