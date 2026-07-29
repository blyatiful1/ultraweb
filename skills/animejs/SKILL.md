---
name: animejs
description: SVG choreography for ultraweb builds — anime.js v4 as the ONE specialist engine allowed beside motion: multi-path line draw, shape morphs, motion-path travel, 2D grid-stagger fields, split-text timelines, and scroll-scrubbed SVG sequences, wired through createScope in a client leaf against the lib/motion.ts easing mirror. GATED — installed in Phase 9 only when design/DIRECTION.md commissions the moment BY NAME and it needs at least two of those capabilities; a single path draw stays on motion pathLength or CSS, for free. Invoke when DIRECTION.md names an SVG signature move, or when the user says "animate the SVG", "the diagram should draw itself", "trace the routes in sequence", "morph the shapes", "scrub the diagram as I scroll", or "stagger the grid".
---

# animejs — vector choreography, earned

**Stage:** Phase 9 — Motion (DIRECTION-gated) - **Reads:** design/DIRECTION.md (the commissioned moment), design/SYSTEM.md §motion, lib/motion.ts, the authored SVG - **Writes:** ONE SVG choreography (components/motion/*) + its drawn static state + the `animeEase`/`animeDur` mirror in lib/motion.ts

## Standard

`motion` remains THE animation library — taste's stack lock is not up for renegotiation. anime.js is the one specialist hired beside it, and only for territory motion cannot reach: sequencing many SVG paths on one clock, morphing a path's `d`, walking an element along a path, staggering a 2D field, and scrubbing any of that against scroll position. That moment IS the signature move or it is not built. The empirical test: delete the dependency and try to rebuild the commissioned moment — if `pathLength` plus a CSS transition gets you 90% of the way, the dependency was never earned and the gate below should have caught it.

- **The dependency is the design decision.** A commissioned SVG-timeline moment costs +~19 KB gz, ~23 KB once `onScroll` scrubs it (per STACK.md). That is `award-canon`'s **Weight as a Feature** applied to motion: the byte budget is set before the choreography, not apologized for after.
- **One moment, one engine.** Same budget as `showpiece` — one commissioned moment per site; a second anime.js moment means the first one wasn't the signature. The single exception is `ultraweb:micro-interactions`' scramble escalation: a micro-tier reuse of the `text` module on an already-installed engine, never a new commissioned moment and never a reason to install.
- **The finished artwork paints first.** The SVG renders in server HTML at its final state; the timeline enhances it after mount. It is never the LCP element and never mounts hidden — `ultraweb:hero`'s rule, inherited.
- **Reduced motion lands the FINAL state.** anime.js ships zero reduced-motion support (verified: zero matches in dist, per STACK.md), so this skill supplies it in two layers. A path left at full dashoffset under `reduce` is invisible content, not restraint.
- **The clock stops when nobody is watching.** A non-scrubbed timeline pauses on `visibilitychange` and when the root leaves the viewport (IntersectionObserver); a scrubbed one gets this free from `onScroll`.
- **Every number comes from `lib/motion.ts`.** anime.js runs in milliseconds where motion runs in seconds; the mirror below is the only place that conversion exists.
- **Boundaries are hard, not stylistic.** Route transitions, drag, gestures, springs, and component lifecycle stay on motion — see the table. anime.js touching any of them is fragmentation, not capability.

## Process

1. **Gate check — all four or stop.** (a) design/DIRECTION.md commissions the moment BY NAME and cites `ultraweb:animejs`; (b) the moment needs **≥2** of: multi-path timeline sequencing, `d` morph, motion path, 2D grid stagger, split-text choreography, scroll-scrubbed SVG; (c) SYSTEM.md §motion records intensity ≥2 — ≥3 for a scrubbed or pinned timeline; (d) the artwork exists as authored SVG (`ultraweb:shape-language`), not a traced blob. Any "no" → **stop and return to the pipeline.** A single path draw belongs to motion's `pathLength` or a CSS `stroke-dashoffset` transition — `ultraweb:icons` has the line-draw recipe, `ultraweb:scroll-motion` has the scroll half, and both cost zero bytes.
2. Install in Phase 9, never at scaffold: verify with `npm view animejs version`, then install that version. Never `@types/animejs` — it is v3 and fights the bundled types (per STACK.md).
3. Extend `lib/motion.ts` with the `animeEase`/`animeDur` mirror. No raw durations or beziers enter a component.
4. Build the static drawn artwork first and ship the page with it. Only then add the `"use client"` leaf: `createScope({ root, mediaQueries })` inside `useEffect`, teardown via `scope.current?.revert()`.
5. Author the moment as ONE `createTimeline`, not N parallel `animate()` calls — a single clock is the whole reason the engine is here. Scrub it by passing `onScroll({ …, sync: true })` as the timeline's `autoplay`.
6. **Verify empirically:** a performance recording ≥5s of the moment — steady 60fps, zero long tasks >50ms (driven with Playwright `browser_run_code_unsafe` + the `performance`/`PerformanceObserver` API, the house mechanism); emulate `prefers-reduced-motion` and confirm every path reads drawn and every split line reassembled; run `npm run build` and hand the measured gzip delta plus the DIRECTION.md citation to `ultraweb:gate-performance` for design/QA.md.

## Engine ownership

| Moment | Owner |
|---|---|
| Micro feedback, simple reveals | CSS — the default, unchanged |
| Component lifecycle: `whileInView`, `AnimatePresence`, layout/FLIP, springs, gestures | motion/react |
| Scroll that is a pure function of position | CSS `animation-timeline` |
| Scroll needing spring-smoothing, velocity, or cross-element choreography | motion `useScroll` |
| **SVG choreography — multi-path draw, morph, motion path, grid-stagger field, split-text timeline; scroll-scrubbed SVG sequences** | **anime.js — this skill, DIRECTION-gated** |
| Route transitions | View Transitions / `template.tsx` / motion — anime.js NEVER |
| Drag and gestures | motion (`domMax`). `createDraggable` is the heaviest module and is not installed — two drag systems is fragmentation |

## Named moves

Six moves, all inside the one commissioned timeline. Each names the API that does it; nothing here is a second moment.

- **Line-draw reveal** — `svg.createDrawable(".curve")` fed to `draw: ["0 0", "0 1"]`. Multi-path is the point: `delay: stagger(120)` sequences a diagram's strokes in reading order. One path alone does not clear the gate.
- **Morph sequence** — `{ d: svg.morphTo("#target-path") }` on a timeline step. Source and target need matching point counts and no baked transforms (`ultraweb:shape-language` authors both).
- **Motion-path traveler** — `{ ...svg.createMotionPath("#lead") }` spreads `translateX`/`translateY`/`rotate` onto the traveling element, so a marker rides the same geometry the reveal just drew.
- **Grid-stagger field** — `stagger(60, { grid: [cols, rows], from: "center" })`: a 2D wave across a tile field. This is a different animal from an entrance reveal — motion-language's 6-item stagger cap still governs entrances, and the field lives only here.
- **Split-text choreography** — `splitText(el, { chars: true, accessible: true })`, then stagger its `.chars`/`.words` on the timeline. `accessible: true` is the default — never turn it off; `.revert()` rides the scope cleanup.
- **Rough-annotation underline/circle** — the hand-drawn marker gesture, authored as two or three deliberately imperfect SVG passes and drawn by this same timeline at the micro tier. It replaces a fourth animation runtime for one effect (per STACK.md) — the effect survives, the dependency does not. It rides an already-cleared gate and never counts toward the ≥2.

## Wiring — the mirror and the scope

```ts
// lib/motion.ts — anime.js mirror, added only when DIRECTION commissions the engine
import { cubicBezier } from "animejs";
export const animeEase = {
  out: cubicBezier(...ease.out), inOut: cubicBezier(...ease.inOut), in: cubicBezier(...ease.in),
} as const;
export const animeDur = { micro: dur.micro * 1000, small: dur.small * 1000, section: dur.section * 1000 } as const; // anime.js runs in ms, motion in s
```

Reduced motion is two mandatory layers: CSS authored inside `@media (prefers-reduced-motion: no-preference)`, and the Scope's own media query in JS.

```ts
// components/motion/<moment>.tsx — inside useEffect of a "use client" leaf; root is the ref OBJECT
import { animate, createScope, svg, utils } from "animejs";
import { animeEase, animeDur } from "@/lib/motion";

createScope({ root, mediaQueries: { reduceMotion: "(prefers-reduced-motion: reduce)" } })
  .add((self) => {
    if (self.matches.reduceMotion) { utils.set(svg.createDrawable(".curve"), { draw: "0 1" }); return; } // final DRAWN state
    animate(svg.createDrawable(".curve"), { draw: ["0 0", "0 1"], ease: animeEase.out, duration: animeDur.section });
  });
```

The Scope holds a `MediaQueryList` and re-runs on its `change` event, so toggling the OS setting live is handled and prior instances are reverted first. The reduce branch lands the final state — drawn path, assembled text — never a hidden one, and it goes through `svg.createDrawable()` too: `draw` is not a real attribute, so a raw selector writes an inert `draw="0 1"` and nothing is drawn (per STACK.md).

## Verified traps

- **`ease: "cubicBezier(0.22, 1, 0.36, 1)"` as a STRING silently runs LINEAR.** A `console.warn` is the only signal. Import the function and pass it — that is exactly what `animeEase` above exists for. Never forward a raw CSS custom-property string.
- **An unknown ease name falls back to linear with NO warning at all.** `"spring"`, `"spring(1,80,10,0)"`, and any typo degrade silently. Validate against the `eases` keys before passing a derived value through.
- **`spring({ bounce: .7 })` returns an object whose computed `.duration` OVERRIDES the tween's.** Setting both is a silent conflict — pick one.
- **`onScroll`'s default `sync` is `'play pause'`** — threshold playback, not scrubbing. Scrubbing needs `sync: true`; a number (e.g. `0.25`) adds lag-smoothing, an ease remaps progress.
- **`splitText` rewrites `innerHTML` and installs a ResizeObserver** that re-splits on resize. `accessible` defaults to true and keeps it screen-reader-safe — the defect is turning it off; without a `.revert()` you leak the observer and ship mangled markup.
- **`@types/animejs` is v3.** Types ship with the package; installing the DefinitelyTyped one shadows them.
- **`createScope({ root })` takes the ref OBJECT, not `root.current`** — passing `.current` silently loses selector scoping.
- **Cleanup with `scope.current?.revert()`** — optional chaining, because StrictMode double-invokes effects and the ref may not be populated on the discarded pass (per STACK.md).
- **DOM-touching calls throw during SSR.** The top-level import is safe; `animate`, `splitText`, and `onScroll` live inside `useEffect` only.

## Pass criteria

Record all six in design/SYSTEM.md (decision + bundle delta) and design/QA.md (measurements) before the gates run:

1. Performance recording shows steady 60fps over ≥5s of the moment, zero long tasks >50ms.
2. ≤2 concurrent SVG choreographies per viewport — attribute animation is compositor-unfriendly and the budget is not negotiable.
3. Reduced-motion emulation lands the final state on every animated node: paths drawn, split text reassembled, nothing at zero opacity.
4. `ultraweb:gate-performance` carries a bundle entry: the measured gzip contribution, named imports only, and the DIRECTION.md line that commissioned it.
5. The LCP element is server-rendered text or image, not the SVG; console clean on first paint and after `revert()`.
6. A non-scrubbed timeline is paused on a hidden tab and once the root scrolls out of view — background the tab, scroll it off, and confirm the clock stopped; a scrubbed timeline inherits this from `onScroll`.

## Anti-patterns

Greppable — each should return zero:

- `import \* as .* from "animejs"` / `import anime from` — v4 has no default export, and a star import defeats the barrel's tree-shaking
- `@types/animejs` in package.json — the v3 package, and it shadows the bundled types
- `ease: 'cubicBezier` / `ease: "cubicBezier` — the string form is silently linear
- `createDraggable` — drag is motion's, at `domMax`; two drag systems is fragmentation
- `sync: 'play pause'` on a timeline meant to scrub — threshold playback, and it is also the silent default when the key is missing
- `accessible: false` — turning off the visually-hidden mirror shreds the text for screen readers
- `duration: 0.` in a file carrying `from "animejs"` — someone pasted motion's seconds into a millisecond engine

Detect the engine by IMPORT SPECIFIER (`from "animejs"`), never by a bare API name: `animate(` is also motion/react and WAAPI, so every call-site check above is scoped to files that carry that import. The dependency itself is not a grep but a two-part check: `animejs` in package.json passes only with BOTH a file importing `from "animejs"` under app/components AND a design/DIRECTION.md line commissioning the moment by name — either half missing is an uncommissioned engine.

And the constitutional one: a second animation engine in the bundle with no DIRECTION.md line commissioning it by name is slop wearing a dependency. motion is the animation library; this is the one specialist, hired for one moment, removable the day that moment is cut.

## Worked example — Kaffeewerk Ost, /roesterei roast-profile sequence

design/DIRECTION.md (Warm Organic/Humanist) commissions the same motif at two intensities and keeps them apart on purpose: *"the roast-profile temperature curve — a hand-drawn SVG rise-and-plateau path — lives on `/` as the hero's spine and recurs as the section divider. Budget on `/`: ONE reusable path, no per-section variation, scroll draw-in only. On `/roesterei` the same curve becomes the argument: three batch profiles (Yirgacheffe, Huila, Sidamo) trace in sequence as you scroll, a bean marker rides the lead curve, and the first-crack tick morphs into the drop-temperature tick — ultraweb:animejs."*

Decision: the gate clears on `/roesterei` and only there — the moment needs four of the six capabilities (multi-path sequencing, motion path, `d` morph, scroll scrub), DIRECTION.md names the skill, and SYSTEM.md §motion records intensity **3** because the timeline is scrubbed. One timeline, 1400ms of scrubbed range — past motion-language's 700ms ceiling under its carve-out for a DIRECTION-commissioned animejs sequence. Rust `oklch(0.62 0.16 45)` draws the lead Yirgacheffe curve; the two supporting profiles trace in ink at 40% so the accent still means "this one"; Fraunces batch labels sit static, Work Sans axis numbers never animate. Cost: +~19 KB gz for the timeline, ~23 KB once `onScroll` scrubs it (per STACK.md), recorded in SYSTEM.md as a deliberate spend.

```tsx
// components/motion/roast-profile.tsx — "use client" leaf; the finished SVG is server-rendered above it
"use client";
import { useRef } from "react";
import { createScope, createTimeline, onScroll, stagger, svg, utils, type Scope } from "animejs";
import { animeEase, animeDur } from "@/lib/motion";

const root = useRef<HTMLDivElement>(null);  // in the component; everything below is its useEffect
const scope = useRef<Scope>(null);

scope.current = createScope({ root, mediaQueries: { reduceMotion: "(prefers-reduced-motion: reduce)" } })
  .add((self) => {
    if (self.matches.reduceMotion) { utils.set(svg.createDrawable(".curve"), { draw: "0 1" }); return; }
    createTimeline({ autoplay: onScroll({ target: root, enter: "bottom top", leave: "top bottom", sync: 0.25 }) })
      .add(svg.createDrawable(".curve"), {
        draw: ["0 0", "0 1"], delay: stagger(120), ease: animeEase.out, duration: animeDur.section,
      })
      .add(".bean", { ...svg.createMotionPath("#lead"), ease: animeEase.inOut, duration: animeDur.section }, "-=200")
      .add(".tick-crack", { d: svg.morphTo("#tick-drop"), duration: animeDur.small }, "-=120");
  });
return () => scope.current?.revert();
```

Rejected: motion `pathLength` for the whole thing. It genuinely wins on `/` — the hero's spine is one path, one scroll draw, and `<motion.path pathLength>` (or a plain CSS `stroke-dashoffset` transition) does it for zero bytes; that is precisely why the hero is not this skill's territory and why the dependency does not exist until `/roesterei` is built. What `pathLength` cannot do is hold three drawables, a motion-path traveler, and a `d` morph on ONE scrubbed clock: three independent `useScroll` transforms drift out of phase at exactly the moment the reader is comparing batches, and correcting that drift is re-implementing a timeline engine badly. Also rejected: Rough Notation for the hand-drawn underline under each batch label — a fourth runtime for one effect (per STACK.md); the underline is authored as two squiggle passes and drawn by this same timeline at the micro tier.

Handoff: `components/motion/roast-profile.tsx` plus `animeEase`/`animeDur` in `lib/motion.ts`; ultraweb:shape-language authored the SVG (one path per animatable element, stable IDs, matching point counts on the tick morph pair, no baked transforms); ultraweb:gate-performance records the measured gzip delta and the DIRECTION.md citation in design/QA.md; ultraweb:gate-accessibility confirms the reduce branch leaves all three curves drawn and the labels legible.

## Composes with

- ultraweb:direction — the gate: no DIRECTION.md line naming this skill and its moment, no engine. It is also the only authority that can widen the moment's scope.
- ultraweb:motion-language — the vocabulary: duration tiers, the one easing family, the intensity dial, and the carve-outs that let a commissioned SVG timeline exceed 700ms and reach intensity 3. This skill consumes values, never invents them.
- ultraweb:scroll-motion — owns every other scroll effect; `animation-timeline` stays the default engine, and only the commissioned scrubbed-SVG timeline is carved out of its no-JS-scroll-listener rule.
- ultraweb:physics — gestures, drag, and pointer springs stay on motion at `domMax`; `createDraggable` is never installed, so the two skills never overlap.
- ultraweb:showpiece — shares the one-signature budget. A moment that is raster, canvas, shader, or 3D in one section is showpiece's; a moment that is inherently vector is this skill's side branch of its cost ladder.
- ultraweb:set-design — the DIRECTION-gated renderer, not a third engine: SVG choreography is vector and never enters a canvas, `animejs/adapters/three` stays refused per STACK.md, and a site that somehow earned both commissions has two signature moves, which is a `direction` failure to catch.
- ultraweb:micro-interactions — the hand-rolled text scramble stays its default; `splitText`/`scrambleText` is the escalation ONLY when this engine is already commissioned, never a reason to install it.
- ultraweb:icons — the lucide line-draw recipe is the CHEAP version of the first named move; a single glyph draw stays there and never pulls this dependency.
- ultraweb:shape-language — authors every SVG this skill animates: one path per animatable element, stable IDs, `currentColor`, no baked transforms, morph pairs with matching point counts.
- ultraweb:gate-performance — the bundle entry is its pass bar: named imports only, measured gzip contribution, DIRECTION citation present.
- ultraweb:gate-accessibility — verifies the reduce branch empirically; a path left undrawn under `prefers-reduced-motion` is invisible content and a hard fail.
- ultraweb:award-canon — Weight as a Feature is why the byte budget precedes the choreography, and Semantic Motion Only is why the moment must carry the argument, not decorate it. Cite the principle, never a winner's surface.
