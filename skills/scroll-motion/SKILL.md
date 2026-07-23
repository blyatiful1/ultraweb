---
name: scroll-motion
description: Scroll-driven motion for ultraweb builds — CSS animation-timeline (view()/scroll()) as the default engine, section entrance reveals (once by default), stagger choreography, parallax discipline (10–15% max), sticky scroll sequences, scroll-linked progress, contained horizontal scroll-snap galleries, and DIRECTION-gated Lenis smooth-scroll with an accessibility contract. Invoke in the ultraweb motion phase (Phase 9) after sections are built, or whenever the user says "animate on scroll", "reveal sections", "fade in as you scroll", "parallax", "scroll progress bar", "sticky scroll section", "smooth scroll", "horizontal scroll section", or "the page feels static when scrolling".
---

# scroll-motion — entrances earn attention once

**Stage:** Phase 9 — Motion - **Reads:** design/SYSTEM.md §motion, design/DIRECTION.md, design/SITEMAP.md, built sections - **Writes:** section entrance layer (Reveal wrapper, progress components, parallax/sticky moments)

## Standard

Scroll motion directs reading order; it never performs for its own sake. First-grade means: reveals fire once, travel ≤12px by default, land in 400–700ms, and at most ~60% of sections animate at all — taste bans "staggered fade-up on every element". The empirical test: scroll every page top to bottom, then bottom to top — nothing re-triggers, nothing janks, above-fold content never waits for an entrance.

- **Once, always.** `viewport={{ once: true }}` is the default. Re-triggering reveals on scroll-up reads as broken.
- **Small travel.** ≤12px rise + fade is the default; 16–24px only when the intensity dial is turned up (motion-language). 100px fly-ups are 2015 scroll-library slop.
- **Reading order.** Elements within a section stagger 40–80ms in the order the eye should take, group total ≤ 600ms.
- **Hero is exempt.** The first viewport animates on load, not on scroll — it's already visible.
- **Parallax is decoration-only.** 10–15% displacement max, backgrounds and ornaments only, never body text or interactive elements.
- **Named moves & the #1 hazard (`award-canon`).** A long page is Scroll-as-Journey — authored acts (rooms/worlds/phases) with density rhythm, dense walls alternating with rest, not a uniform stack. Binding scroll to one continuous spatial move (Scroll-as-Camera) is the top rung: DIRECTION-gated and the #1 scroll-jack hazard — layer motion *on* native scroll, never hijack velocity; native scroll position stays authoritative (keyboard, PageDown, and the footer all still reach). The parallax above is Fake-Depth Before Real Depth — subtle, transform-only, off under reduced-motion.
- **Smooth-scroll is gated and contract-bound.** Lenis is the only sanctioned smooth-scroll layer, and only when DIRECTION.md makes smoothness a deliberate signature (it is an extra dependency over native scroll). Its contract is non-negotiable: under reduced motion it is *never instantiated* — early-return before `new Lenis()`, not merely slowed; nav and fragment links route through `lenis.scrollTo` so anchors and Ctrl+F still land; native scrollbar-drag and keyboard (PageDown/Space/Home/End) stay live. A borrowed physics feel must never cost native browser behavior.
- **Horizontal scroll is contained, never document-level.** A horizontal gallery is its own `overflow-x` + `scroll-snap-type: x` region with `overscroll-behavior-x: contain`; keyboard, Tab, and trackpad scroll it natively. Hijacking the whole page's wheel to drive horizontal movement is the field's most-botched pattern — a named, banned anti-pattern.
- **CSS scroll-driven timelines are the default engine.** For any effect that is a pure function of scroll/view position — reveals, progress bars, parallax scrub — reach for `animation-timeline: view()/scroll()` first: it runs on the compositor, cannot jank, needs zero JS, and degrades to declarative CSS under reduced motion. Escalate to Motion's `useScroll` only for spring-smoothing, velocity, or cross-element choreography (One Physics). Ship it as progressive enhancement — wrap the animation in `@supports (animation-timeline: view())` so the no-support state (Firefox stable is still flagged) is the correct *static, fully visible* layout. Never gate content visibility on the timeline.
- **Reduced motion:** reveals collapse to opacity-only or nothing; parallax and sticky sequences disable entirely.

## Process

1. Read SYSTEM.md §motion for reveal duration, easing, and stagger values; read DIRECTION.md for the motion stance (calm archetypes get fewer, subtler reveals).
2. Map sections per SITEMAP.md: mark which reveal and which stay static. Data-dense sections, legal pages, and anything above the fold stay static.
3. Build ONE `Reveal` client wrapper and reuse it site-wide. Children passed as props stay server components — never convert a section to a client component for its entrance.
4. Mount `LazyMotion features={domAnimation} strict` once in a client provider near the root; use `m.` components everywhere below (per STACK.md, `motion.` throws under strict).
5. Add stagger groups where a section has 3–6 sibling items; beyond 6, reveal in batches or as one block.
6. Parallax and sticky sequences only if DIRECTION.md supports them — max one sticky sequence per site.
7. Verify in the browser (Playwright MCP): full scroll pass both directions, DevTools performance check for long tasks, reduced-motion emulation pass.

## Patterns

**Native scroll-driven timeline (CSS-first default)** — reach for this before any JS reveal:

```css
/* Default-visible: the reveal is enhancement only, never a visibility gate. */
.reveal { opacity: 1; }

@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .reveal { animation: reveal-rise linear both; animation-timeline: view(); animation-range: entry 0% cover 40%; }
    @keyframes reveal-rise { from { opacity: 0; translate: 0 12px } to { opacity: 1; translate: 0 0 } }
  }
}
/* Progress bar: scroll(root block) instead of view() — scale-x a fixed strip. */
.progress { transform-origin: left; scale: 0 1; animation: grow-x linear both; animation-timeline: scroll(root block) }
@keyframes grow-x { to { scale: 1 1 } }
```

Above-fold elements start past their `entry` range, so fill `both` leaves them visible — no load-time flash. Register a typed custom property with `@property` when a timeline must interpolate a number or color (e.g. a `--progress` gradient stop). This is the default; the JS patterns below are the escalation for what CSS timelines can't express — springs, velocity, cross-element choreography.

**Reveal wrapper** — the workhorse; everything else is exception:

```tsx
"use client";
import { m } from "motion/react"; // app-level LazyMotion(domAnimation) provider required
import { dur, ease } from "@/lib/motion"; // motion-language's token mirror — no inline beziers/durations

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

`margin: "-80px"` fires the reveal after the section is meaningfully on screen, not at first pixel. `dur.section`/`ease.out` come from `lib/motion.ts` — motion-language's token mirror — so the numbers match SYSTEM.md §motion; never inline a bezier array or a raw duration here.

**Stagger group** — parent orchestrates, children inherit:

```tsx
<m.ul initial="hidden" whileInView="show" viewport={{ once: true }}
  variants={{ show: { transition: { staggerChildren: 0.06 } } }}>
  {items.map((it) => (
    <m.li key={it.id} variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }} />
  ))}
</m.ul>
```

0.04–0.08s per child. Variants work under `domAnimation` (STACK.md).

**Scroll progress** — long-form/editorial pages:

```tsx
"use client";
import { m, useScroll, useSpring } from "motion/react";

export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  return <m.div style={{ scaleX }} className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-accent" />;
}
```

The `useSpring` smoothing is what separates it from a jittery scroll listener.

**Parallax layer** — element-scoped `useScroll`:

```tsx
const ref = useRef(null);
const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
// <m.div ref={ref}><m.div style={{ y }} className="absolute inset-0 -z-10">…</m.div></m.div>
```

±10% total; 15% is the absolute ceiling. Oversize the layer (`scale-110` or negative insets) so edges never show.

**Sticky sequence** — a `relative h-[300vh]` track with a `sticky top-0 h-screen` stage inside; drive phase opacity/position from the track's `scrollYProgress` via `useTransform`. Reserve for one showcase (see `feature-sections` for the layout); it must degrade to stacked static sections under reduced motion.

**Contained horizontal scroll-snap** — a rail that owns its own scroll, never the page's:

```tsx
<ul className="flex snap-x snap-mandatory overflow-x-auto [overscroll-behavior-x:contain]"
    tabIndex={0} role="region" aria-label="Case studies">
  {items.map((it) => <li key={it.id} className="snap-start shrink-0 basis-[80vw] md:basis-[42ch]" />)}
</ul>
```

`snap-x snap-mandatory` + `snap-start` do the snapping; `overscroll-behavior-x: contain` stops an over-scroll from firing browser back-navigation. Trackpad, keyboard, and Tab scroll it for free — `tabIndex={0}` + `role="region"` + label make a non-interactive rail keyboard-reachable, and a rail of links/cards is already focusable. A wheel shim for mouse-wheel users is optional, scoped to the rail node, and releases at its edges so the page is never trapped:

```tsx
function onWheel(e: WheelEvent) {                 // ref.addEventListener("wheel", onWheel, { passive: false })
  const el = e.currentTarget as HTMLElement;      // React's onWheel is passive — preventDefault no-ops there
  const past = (e.deltaY < 0 && el.scrollLeft <= 0) ||
               (e.deltaY > 0 && el.scrollLeft + el.clientWidth >= el.scrollWidth);
  if (past) return;                               // at an edge: let the page scroll vertically
  e.preventDefault(); el.scrollLeft += e.deltaY;
}
```

**Smooth-scroll (Lenis)** — DIRECTION-gated; the contract, not the feature, is the point:

```tsx
"use client";
import { useEffect } from "react";
import Lenis from "lenis";

export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; // never instantiate
    const lenis = new Lenis();
    let id = requestAnimationFrame(function raf(t) { lenis.raf(t); id = requestAnimationFrame(raf); });
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (a) { e.preventDefault(); lenis.scrollTo(a.hash); }                     // anchors + Ctrl+F still land
    };
    document.addEventListener("click", onClick);
    return () => { cancelAnimationFrame(id); document.removeEventListener("click", onClick); lenis.destroy(); };
  }, []);
  return null;
}
```

Lenis smooths *native* scroll (it doesn't transform a fake container), so scrollbar-drag and keyboard stay live by default; the two additions above cover the only things it would otherwise cost — reduced-motion users and fragment/anchor landings.

## Anti-patterns

- Missing `once: true` (grep `whileInView` without `viewport={{ once`) — re-triggering entrances.
- `whileInView` on every element — if more than ~2 reveal units animate per viewport-height, cut.
- `y: 100` (or larger) entrances — small travel only; grep `y: 1\d\d`.
- Parallax on headlines, body copy, or anything clickable.
- Animating `filter`/`blur`/`box-shadow` on scroll — paint storms; transform/opacity only.
- Document- or window-level wheel `preventDefault` to drive a horizontal gallery — the field's most common scroll-jack; scope snapping to the rail's own `overflow-x` region instead.
- A smooth-scroll library instantiated without the reduced-motion early-return, or that leaves `a[href="#…"]`/Ctrl+F unable to land — ship the Lenis contract or don't ship smooth-scroll.
- A JS scroll listener or `useScroll` driving an effect that's a pure function of scroll position — a native `animation-timeline` does it on the compositor; gate-performance flags these.
- Page-level `useScroll` driving a section effect — always scope with `target` + `offset`.
- Reveal delay > 0.3s on the first element of a section — the user is already waiting.

## Worked example — Studio Norra, /work index case-study reveals

SYSTEM.md §motion caps section reveals at 550ms; DIRECTION.md ("Editorial Brutalist — springs, not ease-out defaults") calls for a spring on anything physical. SITEMAP.md marks `/work` as the one page that earns motion — `/studio` prose and the `/contact` form stay static.

Decision: the eight case-study rows on `/work` are one stagger group, 60ms apart, 20px rise + fade, settling on a spring so rows land rather than snap. That spring settle is exactly why these reveals stay on Motion rather than a CSS `animation-timeline` — a linear scroll-driven timeline can't spring; the default engine yields to the escalation only where the direction demands physics. The oversized Archivo Expanded row headings are the reveal unit; the exposed grid rules under them do not animate — the brutalist grid must read as fixed and honest. Signal red `oklch(0.6 0.21 25)` stays out of the entrance entirely (interaction states only). The above-fold `/work` masthead animates on load via hero, not on scroll.

```tsx
const reduced = useReducedMotion(); // motion/react
const row = reduced
  ? { hidden: { opacity: 0 }, show: { opacity: 1 } }
  : { hidden: { opacity: 0, y: 20 },
      show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 30 } } };

<m.ul initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
  variants={{ show: { transition: { staggerChildren: 0.06 } } }}>
  {cases.map((c) => (
    <m.li key={c.slug} variants={row} />
  ))}
</m.ul>
```

Rejected: a fixed reading-progress bar across the index — an eight-item portfolio isn't long-form, so the bar reads as decoration the direction bans. Reduced motion collapses the rows to opacity-only.

Handoff: the Reveal + stagger land in `app/work/page.tsx`; the cursor-proximity image reveals and the shared-element case-study transition are pointer/route work, not scroll — this skill hands those off, and ultraweb:gate-performance then verifies the entrance layer adds zero CLS on `/work`.

## Composes with

- ultraweb:motion-language — duration/easing/stagger vocabulary and the "what never animates" list come from there.
- ultraweb:physics — the One-Physics escalation: reach past CSS timelines to Motion's `useScroll`/springs only for velocity, spring settle, or cross-element choreography.
- ultraweb:feature-sections — owns the sticky-scroll showcase layout this skill animates.
- ultraweb:hero — hero entrances run on load; this skill takes over below the fold.
- ultraweb:showpiece — a scroll-linked moment that needs canvas/WebGL graduates there.
- ultraweb:gate-performance — verifies zero CLS and no long tasks, and flags any scroll listener a native `animation-timeline` could replace.
- ultraweb:gate-accessibility — verifies the reduced-motion collapse and, when smooth-scroll is on, that Tab keeps focus following scroll and in-page anchors still land.
- ultraweb:award-canon — Scroll-as-Journey, Scroll-as-Camera, and Fake-Depth Before Real Depth are the patterns this skill executes; their scroll-jack discipline is its guardrail.
