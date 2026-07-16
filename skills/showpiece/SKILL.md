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

## Composes with

- ultraweb:direction — the only authority that can commission a showpiece; no DIRECTION.md mandate, no showpiece.
- ultraweb:hero — the showpiece usually lives in the first viewport: hero owns layout, headline scale, and CTA hierarchy; the showpiece is its backdrop or media slot.
- ultraweb:imagery — designs the static poster fallback (gradient meshes, noise, treated imagery).
- ultraweb:media-optimization — LCP protection and asset strategy when the showpiece shares the fold.
- ultraweb:gate-performance — the 60fps recording, bundle delta, and LCP checks are its pass bar.
- ultraweb:gate-accessibility — verifies the reduced-motion exit actually renders the static path.
