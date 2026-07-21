---
name: micro-interactions
description: Component-level interaction feedback for ultraweb builds — hover lifts, press states, animated link underlines, input focus treatment, toggle motion — all transform/opacity only at 150–250ms using SYSTEM.md motion tokens. Invoke in the ultraweb motion phase (Phase 9) after components are built, or whenever the user says "hover states", "micro-interactions", "the UI feels dead/static", "button feedback", "link underline animation", "focus rings", or "polish the interactions". CSS-first — Motion (motion/react) only where CSS transitions cannot do the job.
---

# micro-interactions — feedback felt, not noticed

**Stage:** Phase 9 — Motion - **Reads:** design/SYSTEM.md §motion, design/DIRECTION.md, built components - **Writes:** interaction states across components (CSS transitions in classes/globals.css; Motion only where CSS can't)

## Standard

Every interactive element acknowledges input within 150–250ms, moves only via transform/opacity (plus color/border-color/box-shadow), and no response draws more attention than the content it decorates. The empirical test: tab AND mouse through every page — every link, button, input, card, and toggle responds; nothing lunges; keyboard users see a designed focus ring on everything.

- **150–250ms micro band.** Hover-in 150–200ms; press feedback 100–150ms (press must feel faster than hover). Never 300ms+ on hover — that band belongs to section reveals.
- **One easing family** from SYSTEM.md tokens (`--ease-*`). Never invent a curve per component.
- **CSS-first.** A hover lift is a `transition` + Tailwind utilities, not a client component. Reach for Motion 12 (`"use client"`, `LazyMotion` + `m.` per STACK.md) only for springs, exit animations, or orchestration.
- **Feedback follows hierarchy.** The primary CTA gets the richest response; a footnote link gets an underline. Identical treatment everywhere flattens hierarchy.
- **Reduced motion:** transforms drop, color/opacity feedback stays — state change must never depend on movement alone.

## Process

1. Read SYSTEM.md §motion — duration and easing tokens. Every value below maps to a token, never a fresh magic number.
2. Inventory interactive elements per page: links, buttons, cards, inputs, selects, toggles, nav items, accordion triggers, icon buttons.
3. Apply the patterns below with CSS transitions via Tailwind utilities. Server components stay server — CSS needs no `"use client"`.
4. For the few Motion cases (spring toggle, animated presence), use `m.` components under the app's single `LazyMotion features={domAnimation}` provider — `motion.` throws under `strict`.
5. Verify: keyboard-tab the full site (focus-visible everywhere, palette-matched), hover sweep every page, then re-check with `prefers-reduced-motion: reduce` emulated.

## Patterns

**Hover lift (buttons, cards).** Buttons: `hover:-translate-y-0.5` (2px). Cards: up to `hover:-translate-y-1` (4px) paired with one shadow step from the `depth` scale — lift without shadow change reads as a glitch. Scale is reserved for small icon buttons, 1.03–1.05 max. Never scale text blocks.

**Press.** `active:translate-y-0 active:scale-[0.98]`, ~100ms. The element visibly "gives" under the pointer.

**Link underline.** Gradient-as-underline grows from the left:

```css
.link-anim {
  background-image: linear-gradient(currentColor, currentColor);
  background-size: 0% 1px;
  background-position: 0 100%;
  background-repeat: no-repeat;
  transition: background-size 200ms var(--ease-out);
}
.link-anim:hover, .link-anim:focus-visible { background-size: 100% 1px; }
```

Body-copy links keep a static underline (accessibility floor); the animated variant is for nav and standalone links. Nav can use the exit-through-right variant (`background-position` flips to `100% 100%` off-hover).

**Focus ring.** `focus-visible:` only — no ring on mouse click, always on keyboard. 2px ring in the accent or a high-contrast neutral from the color tokens (never browser default blue), `ring-offset-2` against filled surfaces. Grep-check the build: any `focus:outline-none` without a `focus-visible:` replacement is a defect.

**Input focus.** Border-color transition 150ms + focus-visible ring; optional floating label moves via `transform: translateY/scale`, never `top`/`font-size`.

**Toggle/switch.** Thumb travels by transform with a spring; track color crossfades 200ms. State must read without motion (position + color both change):

```tsx
"use client";
import { m } from "motion/react"; // under the app-level LazyMotion(domAnimation) provider

<m.span
  animate={{ x: on ? 20 : 0 }}
  transition={{ type: "spring", stiffness: 500, damping: 30 }}
  className="block size-4 rounded-full bg-background"
/>
```

**Icon micro-motion.** CTA arrow nudge: `group-hover:translate-x-0.5` (2px, 4px max). Accordion chevron: `rotate-180` in 200ms. External-link icon: rises 1px diagonal. One icon motion per element.

**Loading state.** Button label swaps to spinner via opacity crossfade 150ms; button keeps its width (`min-w` or absolutely-positioned spinner) — no layout jump.

## Anti-patterns

- `transition-all` — transition named properties; `all` animates layout properties by accident.
- Animating `width`, `height`, `margin`, `padding`, `top`, `left` — layout thrash; grep for these inside `transition-[` and keyframes.
- `hover:scale-110` on cards or containers — a 10% lunge; 1.05 is the ceiling and only on small elements.
- `duration-500` on hover feedback — molasses; the micro band is 150–250ms.
- `whileHover` on elements CSS handles — a client component per list item to fake `:hover` is bundle waste.
- `focus:outline-none` with no focus-visible replacement — an accessibility defect, not a style choice.
- Uniform feedback intensity everywhere — motion has hierarchy like type does.
- Detached feedback: lift without shadow step, toggle whose track color never changes.

## Worked example — Studio Norra, work-index row feedback

design/SYSTEM.md §motion pins the micro band to 150–200ms on a single `--ease-out`; design/DIRECTION.md reserves signal red `oklch(0.6 0.21 25)` for interaction states only — it must never appear at rest.

Decision: on `/work`, each index row's left rule draws in on hover and focus — the link-underline pattern turned vertical (`background-size: 2px 0% → 2px 100%`, 200ms `var(--ease-out)`) — and the only places red surfaces are that rule plus `focus-visible:ring-2 ring-[oklch(0.6_0.21_25)] ring-offset-2` against paper. Case-study titles set in Archivo Expanded stay dead-flat; no transform touches the type block.

Rejected: `hover:-translate-y-1` + a `depth` shadow step on the rows. Editorial Brutalist is an exposed, flat grid — a lifting, drop-shadowed card reads as stock SaaS and softens the rawness the direction is built on. The rule-draw carries the whole feedback instead.

The cursor-proximity image reveal (the signature move) is gesture-tracking, so it graduates to ultraweb:physics rather than being double-treated here. The focus-visible and reduced-motion states installed here hand off to ultraweb:gate-accessibility, which greps the build for any `focus:outline-none` left without a replacement.

## Composes with

- ultraweb:motion-language — supplies the duration/easing tokens; this skill spends them, never mints them.
- ultraweb:buttons — the CTA system's hover/active/loading states get their timing and physics here.
- ultraweb:forms — input focus treatment and validation-feedback timing.
- ultraweb:depth — every hover lift pairs its transform with a step on the elevation scale.
- ultraweb:physics — anything gesture-tracking (magnetic pull, drag) graduates there; don't double-treat one element.
- ultraweb:gate-accessibility — verifies the focus-visible coverage and reduced-motion behavior installed here.
- Consumed by the component-tier skills (cards, pricing, data-display, social-proof, …) — they pull their hover/press/focus timing from these patterns rather than inventing per-component motion.
- ultraweb:navigation — the nav link-underline variants (grow-from-left, exit-through-right) and active-item treatment are specified here; navigation wires them onto the real nav.
- ultraweb:faq — the accordion trigger's chevron rotate and expand timing come from this skill's icon-micro-motion patterns.
