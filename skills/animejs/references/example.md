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
