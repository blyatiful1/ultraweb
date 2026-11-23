# motion

Motion vocabulary and the build patterns that use it: scroll, feedback, route transitions, springs. The 3D, shader and SVG-timeline path is `references/showpiece.md`.

Load when: §Vocabulary in Phase 3 (system); the rest in Phase 5 and 6 when sections get their motion.
Reads: design/DIRECTION.md, design/SYSTEM.md, design/SITEMAP.md, built sections. Writes: design/SYSTEM.md §motion, tokens in `app/globals.css` (or `site/styles.css`), `lib/motion.ts`, the Reveal wrapper, transition layer, interaction states.

## Vocabulary

Every animation draws its numbers from one token set. Raw durations and curves exist in exactly two files: the token CSS and `lib/motion.ts`. Components import from them.

**Duration tiers**

| Tier | Range | Owns |
|---|---|---|
| micro | 150-250ms | hover, press, focus, toggles, underlines |
| small | 250-400ms | dropdowns, tooltips, accordions, modal-in, tabs |
| section | 400-700ms | section reveals, hero entrance, page-level moments |

Record one value per range in SYSTEM.md. Nothing exceeds 700ms except a commissioned showpiece sequence. Exits run at about 70% of the entrance. Press feedback (100-150ms) is faster than hover.

**Easing is chosen per direction, as a family of three roles**: out (entrances, hover), in-out (moves, morphs), in (exits). Choose the family from the character DIRECTION.md argues, then write three curves for it. Never the CSS default `ease`; `linear` only for marquees and progress.

| Character | Out | In-out | Duration scale |
|---|---|---|---|
| Decisive, editorial, product | strong deceleration, y1 = 1, x1 0.1-0.3 | symmetric steep S-curve | as picked |
| Mechanical, technical | flatter, y1 1, x1 0.3-0.4 | gentler S | cut tiers about 20% |
| Springy, playful | physical interactions use springs (below); CSS may overshoot (y1 above 1) on the micro tier only | as above | as picked |
| Slow, cinematic | long deceleration, x1 under 0.2 | very steep S | top of each range |

Compare 3 candidate `out` curves on the real hero entrance and keep the one that lands without a visible tail. Redefine `--ease-*` inside `@theme` so the stock `ease-out`/`ease-in`/`ease-in-out` utilities serve the brand curves:

```css
@theme { --ease-out: cubic-bezier(/* picked */); --ease-in-out: cubic-bezier(/* picked */); --ease-in: cubic-bezier(/* picked */); }
:root { --dur-micro: /* ms */; --dur-small: /* ms */; --dur-section: /* ms */; }
```

```ts
// lib/motion.ts: same values in motion units (seconds, bezier arrays)
export const dur = { micro: 0, small: 0, section: 0 } as const;          // fill from SYSTEM.md
export const ease = { out: [0, 0, 0, 0], inOut: [0, 0, 0, 0], in: [0, 0, 0, 0] } as const;
export const spring = { snap: { type: "spring", stiffness: 450, damping: 32 },
  playful: { type: "spring", stiffness: 300, damping: 22 },
  trailing: { type: "spring", stiffness: 180, damping: 18 },
  heavy: { type: "spring", stiffness: 130, damping: 24, mass: 1.2 } } as const;
```

The zeros are placeholders to fill; never ship them. Tailwind duration utilities consume `duration-[var(--dur-micro)]`.

**Choreography**
- Stagger siblings 40-80ms; cap staggered groups at 6, past that animate the container as one block.
- One entrance choreography per viewport; at most 8 elements mid-animation at once.
- Reveal order in a section: container, heading, supporting copy, CTA/media.
- Reveals fire once. Header and nav render static. The LCP element never mounts at `opacity: 0`; if the hero choreographs, the LCP headline or image starts at zero delay.
- Animate `transform` and `opacity` only. Exceptions: motion's `layout` prop (FLIP), SVG attributes inside a commissioned showpiece, scene-graph state inside a canvas.
- Never animate focus outlines, body text while read, form input positions or theme switches (`disableTransitionOnChange`).
- One ambient loop is allowed: transform-only drift on at most 2 hero elements, intensity 2+, off under reduced motion. Other perpetual autoplay is a vestibular hazard.

**Intensity dial.** DIRECTION.md maps to one level; record it in SYSTEM.md §motion. Work above the level is refused.

| Level | Grants | Fits |
|---|---|---|
| 0 Still | micro transitions only | print-like, ultra-minimal |
| 1 Calm | + once-only reveals (fade + up to 12px rise) | SaaS, local business, content; the default |
| 2 Expressive | + stagger, scroll-linked moments, one physics interaction, unscrubbed SVG timeline | portfolio, agency, creative commerce |
| 3 Theatrical | + page transitions, pinned or scrubbed sequences, showpiece canvas, site-scale scene | only when DIRECTION.md commissions it |

**Reduced motion, two layers, both mandatory**
1. CSS: author entrances and loops inside `@media (prefers-reduced-motion: no-preference)`. Opt-in beats a `reduce` kill-switch fighting specificity. Color and opacity transitions up to 200ms may live outside it.
2. JS: mount `<MotionConfig reducedMotion="user">` once, inside the LazyMotion provider. It disables transform and layout animations for users who ask and keeps opacity and color. Bespoke logic (parallax, pointer springs, canvases) also reads `useReducedMotion()`.

Reduced means fades survive; movement, parallax, autoplaying media, springs and pinned sequences do not. State changes never depend on movement alone. Libraries that are not motion (anime.js, three.js, Lenis) have no reduced-motion support; the consumer implements it.

## Engine ownership

| Moment | Owner |
|---|---|
| Micro feedback, simple reveals | CSS |
| Scroll that is a pure function of position (reveal, progress, parallax) | CSS `animation-timeline` |
| Component lifecycle: `whileInView`, `AnimatePresence`, layout/FLIP, springs, gestures, drag | motion/react |
| Scroll needing spring smoothing, velocity or cross-element choreography | motion `useScroll` |
| Route transitions | View Transitions, `template.tsx`, motion. Never anime.js, never a canvas-owned router |
| Multi-path SVG timelines, morphs, split-text, scrubbed SVG | anime.js, showpiece.md only |
| Scene-graph state in a canvas | three.js/R3F, showpiece.md only |

At most one specialist engine (anime.js or a renderer) beyond motion, and only when DIRECTION.md commissions it by name. Detect engines by import specifier (`from "animejs"`, `from "three"`), never by an API name like `animate(`. GSAP is permitted by its license but is not used here: it duplicates what the table already covers and adds weight. Lenis is covered below. Mount motion once as `LazyMotion features={domAnimation} strict` with `m.` components everywhere (`motion.` throws under `strict`); `drag` and `layout` need `domMax`, added only for a real drag or layout moment.

## Scroll: the rung ladder

Cheapest rung wins.

1. **CSS `animation-timeline: view()/scroll()`** for anything that is a pure function of position. Compositor-driven, zero JS.
2. **motion `useScroll`** for spring smoothing, velocity, cross-element choreography. Always scope with `target` and `offset`; page-level `useScroll` driving a section effect is a defect.
3. **Specialist engine** (scrubbed SVG, site-scale camera): showpiece.md.

Rule for rung 1: the no-support state is already the correct, fully visible static layout. Check current browser support before relying on the effect for meaning. Never gate content visibility on a timeline.

```css
.reveal { opacity: 1; }
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .reveal { animation: reveal-rise linear both; animation-timeline: view(); animation-range: entry 0% cover 40%; }
    @keyframes reveal-rise { from { opacity: 0; translate: 0 12px } to { opacity: 1; translate: 0 0 } }
  }
}
.progress { transform-origin: left; scale: 0 1; animation: grow-x linear both; animation-timeline: scroll(root block); }
@keyframes grow-x { to { scale: 1 1 } }
```

Above-fold elements start past their entry range, so `both` leaves them visible. Register typed custom properties with `@property` when a timeline must interpolate a number or color.

**Rules**
- Reveals once, rise at most 12px (16-24px only at intensity 2+), 400-700ms, stagger group total at most 600ms. Hero is exempt: it animates on load. At most about 60% of sections animate; data-dense sections, legal pages and anything above the fold stay static.
- Parallax: decoration only, 10-15% displacement, backgrounds and ornaments, never text or interactive elements, off under reduced motion. Oversize the layer so edges never show.
- Sticky sequence: a tall track with a `sticky top-0 h-screen` stage driven by the track's `scrollYProgress`. At most one per site; stacked static sections under reduced motion.
- Never animate `filter`, `blur` or `box-shadow` on scroll.
- Horizontal scroll is a contained `overflow-x` region with `scroll-snap-type: x`, `overscroll-behavior-x: contain`, `tabIndex={0}`, `role="region"` and a label. Hijacking the page wheel to move horizontally is banned. A wheel shim, if used, attaches with `addEventListener("wheel", fn, { passive: false })` on the rail only (React's `onWheel` is passive, so `preventDefault` no-ops) and releases at the rail's edges.
- Native scroll position stays authoritative: keyboard, PageDown, find-in-page, anchors and the footer all work. Binding scroll to one continuous camera move is the top hazard and is allowed only as a sticky stage driven by `useScroll` or inside a commissioned canvas.

**Lenis (smooth scroll).** Permitted only when DIRECTION.md makes smoothness a signature, because it adds a dependency over native scroll. Lenis intercepts wheel input itself and animates the real scroll position, so CSS timelines and `useScroll` keep working. That is the library's mechanism; the ban is on writing your own wheel `preventDefault`. Contract: never instantiate under `prefers-reduced-motion: reduce`; leave touch on native scroll (default `syncTouch` off); enable its `anchors` option so `#fragment` links land; keep scrollbar drag and keyboard live; `destroy()` on unmount.

```tsx
"use client";
import { useEffect } from "react";
import Lenis from "lenis";

export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ autoRaf: true, anchors: true });
    return () => lenis.destroy();
  }, []);
  return null;
}
```

## The Reveal wrapper

Build one client wrapper and reuse it. Children passed as props stay server components; do not convert a section to a client component for its entrance.

```tsx
"use client";
import { m } from "motion/react";
import { dur, ease } from "@/lib/motion";

export function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <m.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: dur.section, ease: ease.out, delay }}
    >
      {children}
    </m.div>
  );
}
```

Stagger groups: parent `variants` with `staggerChildren` read from the tokens; variants work under `domAnimation`. Reading progress: `useSpring(scrollYProgress, spring.snap)` on a fixed `scaleX` strip. Parallax: element-scoped `useScroll({ target, offset: ["start end", "end start"] })` into `useTransform`.

Greppable defects: `whileInView` without `once: true`; `y: 1\d\d`; `cubic-bezier(` outside the two token files; `transition-all`; `transition={{ duration: 0.` inline.

## Interaction feedback

CSS first. A hover lift is a `transition` plus utilities, not a client component. Use motion only for springs, exits and orchestration; `whileHover` on something CSS handles is bundle waste.

- Hover-in uses the micro token, press about 100ms. Buttons lift 2px; cards up to 4px with one shadow step from the depth scale (a lift without a shadow change reads as a glitch). Scale is for small icon buttons, 1.03-1.05 max. Never scale text blocks. Press: `active:translate-y-0 active:scale-[0.98]`.
- Feedback follows hierarchy: the primary CTA gets the richest response, a footnote link an underline. Identical treatment everywhere flattens hierarchy.
- Animated underline: a gradient `background-size` transition, `0% 1px` to `100% 1px`, with `:hover` and `:focus-visible`. Body-copy links keep a static underline.
- Never `transition-all`; name properties. Never animate width, height, margin, top, left.

**Hover parity.** Anything a pointer reveals on `:hover` must reveal identically on `:focus-within` and on tap. A hover-only affordance fails WCAG 2.2 SC 1.4.13. Focus-shown content persists while focused, dismisses on `Escape` without moving focus, and does not vanish when the pointer drifts.

**Focus ring.** `focus-visible:` only: a 2px ring in the accent or a high-contrast neutral from the tokens, offset against filled surfaces, never the browser default. `focus:outline-none` without a `focus-visible:` replacement is a defect.

**Chrome branding** (the surfaces every page touches and nothing else owns):

```css
::selection { background: var(--color-primary); color: var(--color-primary-foreground); } /* verify AA contrast */
:root { scrollbar-color: var(--color-border) transparent; scrollbar-width: thin; caret-color: var(--color-primary); }
::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: var(--radius-full); }
```

A custom cursor is optional and only under `@media (pointer: fine)`.

**Other patterns.** Toggle thumbs travel by transform with `spring.snap` while the track color also changes, so state reads without motion. Loading buttons crossfade label to spinner in the micro tier and keep their width. Instant swap between heavy media: prefetch the 2-3 adjacent items, keep the incoming node mounted at `opacity-0` and crossfade, with a dimension-matched skeleton for unloaded neighbors. Text scramble: short strings only, one-shot, settled within the small tier, no library.

## Page transitions

A route transition is seasoning, never a gate. Ceiling 300ms; content only (header, nav, footer stay still); instant swap under reduced motion. "No transition" is a valid answer; dashboards and rapid-navigation flows are better without one.

| Site type | Strategy |
|---|---|
| Marketing, brochure | Tier 1 only |
| Editorial, portfolio | Tier 1 plus Tier 2 shared-element continuity |
| Dashboard, app-like | None on route change |
| E-commerce | Tier 2 on card image to detail image only |

**Tier 1: `app/template.tsx`.** A template remounts on every navigation; a layout does not, so motion in a layout plays once per session. It is entrance-only because the old page unmounts immediately. Do not fake exits with `AnimatePresence` around route children.

```tsx
"use client";
import { m } from "motion/react";
import { dur, ease } from "@/lib/motion";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <m.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: dur.small, ease: ease.out }}>
      {children}
    </m.div>
  );
}
```

Place it at the segment that should animate.

**Tier 2: View Transitions through React.** `<ViewTransition>` is imported from `react`. Animations fire for route navigations (they are transitions), for Suspense reveals and for `useDeferredValue`; plain `setState` does not trigger them. Version-dependent setup, verified against the Next docs for the versions near `stack/versions.json`: the 16.2 docs require `experimental: { viewTransition: true }` in `next.config.ts`; the 16.3 and later guides state it works with no configuration and show no flag. Read the guide for the installed Next minor (Context7 or the docs) and add the flag only when that guide still says so. Behavior to rely on:
- Shared elements: give the same `name` to `<ViewTransition>` on the list item and the detail element; the browser morphs one into the other.
- `<Link transitionTypes={["x"]}>` tags a navigation; `<ViewTransition enter={{ x: "x", default: "none" }} exit={{...}} default="none">` maps types to CSS classes. `default: "none"` keeps back/forward, `router.refresh()` and Suspense reveals from animating directionally.
- Put the wrapper in each `page.tsx`, not the layout. Layouts persist, so enter and exit never fire there.
- Styling uses `::view-transition-old/new(...)` and `:active-view-transition-type(x)`; read durations and easing from the tokens via custom properties.
- Browsers without support get an instant swap, which must look intentional. Check current support before treating continuity as load-bearing, and never make Tier 2 required for layout or content.
- When Tier 2 covers a route, remove Tier 1 from it; both on one surface double-fires.
- A persistent canvas cannot cross-fade with itself; View Transitions snapshot it for free. Prefer them over a `preserveDrawingBuffer` clone.

**A masked cut** (one brief full-bleed color flood or dissolve, route swapped behind it) is allowed only when DIRECTION.md justifies it, with one grammar site-wide and a plain crossfade under reduced motion. The App Router keeps owning navigation: real URLs, real `<Link>`, server-rendered content. A canvas that calls `history.pushState` to replace routing is a banned SPA.

**Route announcer (required whenever routes animate).** Client navigation fires no native "new page" announcement, so a screen-reader user hears nothing. Mount one persistent visually hidden live region in `app/layout.tsx` below `{children}`, never in `template.tsx` (it would remount with the route and drop the announcement).

```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export function RouteAnnouncer() {
  const pathname = usePathname();
  const [label, setLabel] = useState("");
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }       // first load is announced natively
    const id = requestAnimationFrame(() => {
      setLabel(document.querySelector("main h1")?.textContent?.trim() || document.title);
    });
    return () => cancelAnimationFrame(id);                       // coalesces rapid navigations
  }, [pathname]);
  return <div aria-live="polite" role="status" className="sr-only">{label}</div>;
}
```

Use `polite`, never `assertive` or `role="alert"`. `sr-only`, never `hidden`, which removes it from the accessibility tree. Moving focus to the new heading is the other half and belongs to the app structure.

## Physics: springs for gestures

Anything that tracks a hand uses a spring, not a duration. Budget 1-2 moments per site, pointer-fine only, only when DIRECTION.md calls for tactile or playful. Overshoot belongs to gestures; scroll reveals use easing curves, never bounce. Springs live in `lib/motion.ts` (above) so feel tunes in one place.

| Feel | stiffness | damping | mass | Use |
|---|---|---|---|---|
| snap, no overshoot | 400-500 | 30-35 | 1 | toggles, press, precise UI |
| playful | 250-350 | 18-24 | 1 | magnetic hover, badge pops |
| trailing | 150-250 | 15-20 | 1 | cursor followers |
| heavy | 100-170 | 20-26 | 1-1.5 | large panels, drawer settle |

Damping under 10 wobbles forever; never ship it. Tune by hand on real hardware.

**Magnetic hover.** Measure a static wrapper, never the element that moves: reading `getBoundingClientRect()` of the translating element makes its own center shift under the pointer and the effect oscillates. The wrapper is also the hit area, so extend it with padding to start the pull before the pointer reaches the button.

```tsx
"use client";
import { useRef } from "react";
import { m, useSpring } from "motion/react";
import { spring } from "@/lib/motion";

export function Magnetic({ children, pull = 0.25, max = 12 }: { children: React.ReactNode; pull?: number; max?: number }) {
  const zone = useRef<HTMLDivElement>(null);          // static: measured
  const x = useSpring(0, spring.playful);              // inner: moved
  const y = useSpring(0, spring.playful);
  const clamp = (v: number) => Math.max(-max, Math.min(max, v));
  return (
    <div ref={zone} className="inline-block p-3 -m-3"
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = zone.current!.getBoundingClientRect();
        x.set(clamp((e.clientX - r.left - r.width / 2) * pull));
        y.set(clamp((e.clientY - r.top - r.height / 2) * pull));
      }}
      onPointerLeave={() => { x.set(0); y.set(0); }}>
      <m.div style={{ x, y }}>{children}</m.div>
    </div>
  );
}
```

Render the plain element on coarse pointers, and snap to rest under reduced motion.

**Drag.** Always constrain (`dragConstraints` as ref or bounds), `dragElastic` 0.1-0.2, horizontal drag only inside vertical scroll. Needs `domMax`. Gestures never leave motion, even where anime.js or three.js is installed; if a DOM node moves it is motion, if an `Object3D` moves it is the canvas. `OrbitControls` and `CameraControls` are not installed on a site-scale scene.

**Cursor follower.** Trailing spring per axis, `cursor-none` scoped to the replaced zone only (grep `cursor-none` on body or html), pointer-fine only, label duplicates information available elsewhere. **Prove-it gesture:** at most one press-and-hold that reveals a hidden layer; never the only path to information, keyboard operable.


## Craft checklist (optional, at most one gesture)

- Console signature logs once on mount from a client leaf; never `process.env`, tokens or internal URLs.
- A JSX `{/* comment */}` is stripped at build and never reaches served HTML.
- A key-sequence egg bails while an input is focused, never calls `preventDefault`, and its panel closes on Esc and returns focus; it must not collide with the command palette shortcut.
- The 404 stays a working page (heading, link home, nav); playfulness is additive and light.
- `public/humans.txt` and at most one custom header; headers sit beside security headers, never over them.
- Skip all of it for trust-critical brands.
