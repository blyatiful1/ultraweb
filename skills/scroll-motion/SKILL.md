---
name: scroll-motion
description: Scroll-driven motion for ultraweb builds — section entrance reveals (whileInView, once by default), stagger choreography, parallax discipline (10–15% max), sticky scroll sequences, and scroll-linked progress via useScroll + useSpring from motion/react. Invoke in the ultraweb motion phase (Phase 9) after sections are built, or whenever the user says "animate on scroll", "reveal sections", "fade in as you scroll", "parallax", "scroll progress bar", "sticky scroll section", or "the page feels static when scrolling".
---

# scroll-motion — entrances earn attention once

**Stage:** Phase 9 — Motion - **Reads:** design/SYSTEM.md §motion, design/DIRECTION.md, design/SITEMAP.md, built sections - **Writes:** section entrance layer (Reveal wrapper, progress components, parallax/sticky moments)

## Standard

Scroll motion directs reading order; it never performs for its own sake. First-grade means: reveals fire once, travel 16–24px, land in 400–700ms, and at most ~60% of sections animate at all — taste bans "staggered fade-up on every element". The empirical test: scroll every page top to bottom, then bottom to top — nothing re-triggers, nothing janks, above-fold content never waits for an entrance.

- **Once, always.** `viewport={{ once: true }}` is the default. Re-triggering reveals on scroll-up reads as broken.
- **Small travel.** 16–24px rise + fade. 100px fly-ups are 2015 scroll-library slop.
- **Reading order.** Elements within a section stagger 40–80ms in the order the eye should take, group total ≤ 600ms.
- **Hero is exempt.** The first viewport animates on load, not on scroll — it's already visible.
- **Parallax is decoration-only.** 10–15% displacement max, backgrounds and ornaments only, never body text or interactive elements.
- **Named moves & the #1 hazard (`award-canon`).** A long page is Scroll-as-Journey — authored acts (rooms/worlds/phases) with density rhythm, dense walls alternating with rest, not a uniform stack. Binding scroll to one continuous spatial move (Scroll-as-Camera) is the top rung: DIRECTION-gated and the #1 scroll-jack hazard — layer motion *on* native scroll, never hijack velocity; native scroll position stays authoritative (keyboard, PageDown, and the footer all still reach). The parallax above is Fake-Depth Before Real Depth — subtle, transform-only, off under reduced-motion.
- **CSS scroll-driven animation is progressive enhancement, not a default.** `animation-timeline: view()/scroll()` buys scroll-linked reveals with zero JS, but cross-browser support landed late (Safari, late 2025) — use it only where the no-support state is *already* the correct static layout, never a broken one.
- **Reduced motion:** reveals collapse to opacity-only or nothing; parallax and sticky sequences disable entirely.

## Process

1. Read SYSTEM.md §motion for reveal duration, easing, and stagger values; read DIRECTION.md for the motion stance (calm archetypes get fewer, subtler reveals).
2. Map sections per SITEMAP.md: mark which reveal and which stay static. Data-dense sections, legal pages, and anything above the fold stay static.
3. Build ONE `Reveal` client wrapper and reuse it site-wide. Children passed as props stay server components — never convert a section to a client component for its entrance.
4. Mount `LazyMotion features={domAnimation} strict` once in a client provider near the root; use `m.` components everywhere below (per STACK.md, `motion.` throws under strict).
5. Add stagger groups where a section has 3–8 sibling items; beyond 8, reveal in batches or as one block.
6. Parallax and sticky sequences only if DIRECTION.md supports them — max one sticky sequence per site.
7. Verify in the browser (Playwright MCP): full scroll pass both directions, DevTools performance check for long tasks, reduced-motion emulation pass.

## Patterns

**Reveal wrapper** — the workhorse; everything else is exception:

```tsx
"use client";
import { m } from "motion/react"; // app-level LazyMotion(domAnimation) provider required

export function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98], delay }}
    >
      {children}
    </m.div>
  );
}
```

`margin: "-80px"` fires the reveal after the section is meaningfully on screen, not at first pixel. Replace the ease array with the SYSTEM.md token values.

**Stagger group** — parent orchestrates, children inherit:

```tsx
<m.ul initial="hidden" whileInView="show" viewport={{ once: true }}
  variants={{ show: { transition: { staggerChildren: 0.06 } } }}>
  {items.map((it) => (
    <m.li key={it.id} variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }} />
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

## Anti-patterns

- Missing `once: true` (grep `whileInView` without `viewport={{ once`) — re-triggering entrances.
- `whileInView` on every element — if more than ~2 reveal units animate per viewport-height, cut.
- `y: 100` (or larger) entrances — small travel only; grep `y: 1\d\d`.
- Parallax on headlines, body copy, or anything clickable.
- Animating `filter`/`blur`/`box-shadow` on scroll — paint storms; transform/opacity only.
- Scroll-hijacking: overriding wheel delta or smooth-scroll takeover libraries — banned without explicit DIRECTION.md justification.
- Page-level `useScroll` driving a section effect — always scope with `target` + `offset`.
- Reveal delay > 0.3s on the first element of a section — the user is already waiting.

## Worked example — Studio Norra, /work index case-study reveals

SYSTEM.md §motion caps section reveals at 550ms; DIRECTION.md ("Editorial Brutalist — springs, not ease-out defaults") calls for a spring on anything physical. SITEMAP.md marks `/work` as the one page that earns motion — `/studio` prose and the `/contact` form stay static.

Decision: the eight case-study rows on `/work` are one stagger group, 60ms apart, 20px rise + fade, settling on a spring so rows land rather than snap. The oversized Archivo Expanded row headings are the reveal unit; the exposed grid rules under them do not animate — the brutalist grid must read as fixed and honest. Signal red `oklch(0.6 0.21 25)` stays out of the entrance entirely (interaction states only). The above-fold `/work` masthead animates on load via hero, not on scroll.

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
- ultraweb:feature-sections — owns the sticky-scroll showcase layout this skill animates.
- ultraweb:hero — hero entrances run on load; this skill takes over below the fold.
- ultraweb:showpiece — a scroll-linked moment that needs canvas/WebGL graduates there.
- ultraweb:gate-performance — verifies zero CLS and no long tasks from the entrance layer.
- ultraweb:gate-accessibility — verifies the reduced-motion collapse.
- ultraweb:award-canon — Scroll-as-Journey, Scroll-as-Camera, and Fake-Depth Before Real Depth are the patterns this skill executes; their scroll-jack discipline is its guardrail.
