---
name: physics
description: Spring-based interaction for ultraweb builds — magnetic hover, drag with constraints, cursor followers, and gesture response using motion/react springs (stiffness/damping recipes included). GATED — only for briefs whose DIRECTION.md names a playful/tactile/interactive motion stance; budget 1–2 physics moments per site. Invoke in the ultraweb motion phase (Phase 9) when DIRECTION.md calls for it, or when the user says "magnetic button", "draggable", "cursor follower", "springy", "make it feel tactile/playful", or "elements should react to the mouse".
---

# physics — motion that obeys the hand

**Stage:** Phase 9 — Motion (DIRECTION-gated) - **Reads:** design/DIRECTION.md, design/SYSTEM.md §motion - **Writes:** 1–2 interactive moments (Magnetic wrapper, drag surfaces, cursor follower)

## Standard

Anything that tracks a gesture uses a spring, not a duration — the hand is analog and the response must be too. But physics is a scarce resource: 1–2 moments per site, pointer-fine devices only, and only when DIRECTION.md's motion stance says playful/tactile/interactive. A law firm gets zero magnetic buttons. The empirical test: the effect runs 60fps in a DevTools performance recording, does nothing on touch devices, and disappears cleanly under reduced motion.

- **Springs by stiffness/damping**, never by duration. One recipe table (below), values kept in one constants file so the site's "feel" tunes in one place.
- **Displacement is small.** Magnetic pull ≤ 12px on buttons; a springy press is scale 0.97, not 0.9.
- **Overshoot belongs to gestures.** Section entrances use the easing curves from `motion-language`; bounce on a scroll reveal is slop.
- **Touch degrades to nothing.** Magnetic hover and cursor followers are `(hover: hover) and (pointer: fine)` only. Drag must not fight page scroll.
- **Bundle honesty (STACK.md):** hover/tap/spring animations run under `domAnimation`; `drag` and `layout` require `domMax` (+25kb). Adding one draggable element costs the whole delta — budget it consciously.
- **Gestures never leave motion.** Even on a site whose DIRECTION.md commissioned anime.js for an SVG moment, drag and pointer tracking stay here: anime's `createDraggable` is its heaviest module (per STACK.md) and a second drag system is fragmentation, not capability. The same line holds against a renderer: on a DIRECTION-commissioned `ultraweb:set-design` build, pointer→scene raycasting and camera damping are **scene input** and stay inside the canvas, while every DOM spring, magnetic hover and cursor follower stays here on motion — `domAnimation` until a real `drag`/`layout` moment earns `domMax`, per the bundle-honesty rule above. If the thing that moves is a DOM node it is this skill; if it is an `Object3D` it is not. `OrbitControls`/`CameraControls` are never installed on a site-scale scene — a free camera fights an authored journey, and a camera the user can lose is not a site.

## Process

1. **Gate check.** Does DIRECTION.md name tactility, playfulness, or interactivity in its motion stance? No → stop; return to the pipeline. `micro-interactions` covers everything below the physics threshold.
2. **Budget.** Pick 1–2 moments, usually attached to the signature move: the primary CTA, a work-gallery drag, a hero cursor effect. Never all three.
3. Pick spring values from the recipe table; export them from `lib/motion.ts` (or the site's constants module) beside the easing tokens.
4. Guard for input type: render the plain element on touch/coarse pointers; attach physics only under `(hover: hover) and (pointer: fine)`.
5. If drag is used, switch the app's `LazyMotion` features to `domMax` — under `strict`, drag with `domAnimation` fails.
6. Tune on real hardware by hand — throw the drag, circle the magnet. Spring feel cannot be judged from code.
7. Verify: DevTools performance recording ≥5s of interaction at 60fps, touch emulation shows no dead effects, reduced-motion emulation snaps springs to end state or disables the moment.

## Spring recipes (starting values, tune by hand)

| Feel | stiffness | damping | mass | Use for |
|---|---|---|---|---|
| Snap (no overshoot) | 400–500 | 30–35 | 1 | toggles, press response, UI that must feel precise |
| Playful (slight overshoot) | 250–350 | 18–24 | 1 | magnetic hover, springy icons, badge pops |
| Trailing (loose) | 150–250 | 15–20 | 1 | cursor followers, elements that lag the pointer |
| Heavy (luxurious) | 100–170 | 20–26 | 1–1.5 | large media panels, drawer settle |

Damping < 10 wobbles forever and reads as broken — never ship it.

## Moves

**Magnetic hover** — element leans toward the pointer, springs home on leave:

```tsx
"use client";
import { m, useSpring } from "motion/react";

const spring = { stiffness: 300, damping: 22 };

export function Magnetic({ children }: { children: React.ReactNode }) {
  const x = useSpring(0, spring);
  const y = useSpring(0, spring);
  return (
    <m.div
      style={{ x, y }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * 0.25);
        y.set((e.clientY - r.top - r.height / 2) * 0.25);
      }}
      onPointerLeave={() => { x.set(0); y.set(0); }}
    >
      {children}
    </m.div>
  );
}
```

Pull factor 0.2–0.3; cap the result so buttons never travel more than ~12px. Refinement: counter-translate the label at half the container's offset so text stays calmer than its frame.

**Drag with constraints** — galleries, before/after sliders, playful cards:

```tsx
<m.div drag="x" dragConstraints={trackRef} dragElastic={0.15} whileTap={{ cursor: "grabbing" }} />
```

Always constrain (`dragConstraints` as ref or `{ left, right }` bounds); `dragElastic` 0.1–0.2 gives edges a physical tug. Horizontal drag inside a vertically scrolling page is fine; free-axis `drag` inside scroll is not. Requires `domMax`.

**Cursor follower** — a dot/label trailing the pointer with the Trailing recipe (`useSpring` per axis fed from pointer events). Hide the native cursor only inside the zone that replaces it (`cursor-none` scoped to that container), never site-wide. Pointer-fine only; the label must duplicate information available elsewhere (it's ornament, not UI). (`award-canon`: The Cursor as Narrator — the cursor may label an affordance ("explore"/"watch") or point direction, but only as pure enhancement over the native cursor and real focus/hover states, and never on touch.)

**Spring press** — `whileTap={{ scale: 0.97 }}` with `transition={{ type: "spring", stiffness: 500, damping: 30 }}` on the 1–2 elements that deserve more than the CSS active state from `micro-interactions`.

**Prove-It gesture** (`award-canon`: The Prove-It Gesture) — one deliberate press-and-hold or drag-to-intensify that reveals a hidden layer or teaches the model by consequence: `onPointerDown`/`onPointerUp` cross-fading an overlay, or a held pointer ramping a spring `useMotionValue` that eases home on release. ONE per site, tied to the signature move — never the only path to key info: pair a visible affordance and a click/tap fallback, keep it keyboard-operable, and snap to the end state under reduced motion.

## Anti-patterns

- Physics on a brief whose DIRECTION.md motion stance is calm/editorial — the gate exists for a reason.
- `drag` without `dragConstraints` — grep for it; unbounded flingable UI.
- `cursor: none` / `cursor-none` on `body` or `html` — grep; scope it to the follower's zone.
- Missing pointer guards — magnetic/follower code with no `(pointer: fine)` check ships dead weight and ghost behavior to phones.
- Spring scale/pull on every card in a grid — physics on list items is mis-hover chaos; one moment, not a treatment.
- `damping: 5`-class values — perpetual wobble.
- Loading `domMax` when nothing drags — +25kb for hover springs `domAnimation` already covers (STACK.md).
- Springs on section entrances — that's `scroll-motion`'s territory and it uses easing curves, not bounce.

## Worked example — Framewalk, cursor-reactive hero fog for a Steam launch

design/DIRECTION.md motion stance: *"Atmospheric Dark — the fog answers the hand. One interactive moment, everything else holds still; static art under reduced motion."* The signature move (three-layer parallax fog) is the whole physics budget — no other element gets a spring.

Each fog layer lags the pointer with the **Trailing** recipe (`stiffness 180, damping 18, mass 1`), pulling a different distance so depth reads as parallax — back 8px, mid 20px, front 40px. One spring drives all three via `useTransform`; the constant lives in `lib/motion.ts` beside the easing tokens.

```tsx
"use client";
import { m, useSpring, useTransform } from "motion/react";
import { fogTrail } from "@/lib/motion"; // { stiffness: 180, damping: 18, mass: 1 }

const px = useSpring(0, fogTrail); // -1..1 from pointer, mounted only under (pointer: fine)
const back  = useTransform(px, [-1, 1], [-8, 8]);
const mid   = useTransform(px, [-1, 1], [-20, 20]);
const front = useTransform(px, [-1, 1], [-40, 40]);
```

No drag anywhere on the site, so `domAnimation` (+15kb) carries it — loading `domMax` for a hover-only effect would be dead weight (STACK.md). Under `prefers-reduced-motion` the layers render as flat art; on touch/coarse pointers the fog never mounts the springs.

Rejected: a magnetic "Wishlist on Steam" button. One physics moment is the budget, and a bouncy CTA beside somber fog-and-lantern art reads as playful marketing — wrong tone for Atmospheric Dark, so the CTA keeps only the CSS press from `micro-interactions`.

Handoff: `components/hero-fog.tsx` + the `fogTrail` constant in `lib/motion.ts`; `ultraweb:gate-performance` records the ≥5s pointer session at 60fps and `ultraweb:gate-accessibility` confirms the reduced-motion static fallback before it ships.

## Composes with

- ultraweb:direction — the gate: physics exists only when the archetype's motion stance commissions it.
- ultraweb:motion-language — spring recipes live beside the easing/duration vocabulary as one motion system.
- ultraweb:micro-interactions — everything below the gesture threshold (plain hover/press/focus) stays there; never double-treat an element.
- ultraweb:showpiece — a cursor-reactive canvas or WebGL moment graduates there with its gating rules.
- ultraweb:set-design — the site-scale sibling: scene-graph input and camera damping live there, every DOM spring and cursor follower lives here, and no second drag system is installed on either side.
- ultraweb:animejs — the other DIRECTION-gated engine, and the boundary is firm: it owns SVG choreography, this skill owns every gesture; `createDraggable` is never installed.
- ultraweb:gate-performance — 60fps verification of pointer-tracking effects is its pass bar.
- ultraweb:gate-accessibility — verifies touch degradation and the reduced-motion path.
- ultraweb:award-canon — The Prove-It Gesture and The Cursor as Narrator are the canon patterns this skill owns; their discipline (never the sole affordance, keyboard-operable, touch fallback) is its guardrail.
