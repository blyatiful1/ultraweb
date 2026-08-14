---
name: micro-interactions
description: Component-level interaction feedback for ultraweb builds — hover lifts, press states, animated link underlines, input focus treatment, toggle motion (transform/opacity only, 150–250ms, SYSTEM.md tokens), plus keyboard/focus parity for every hover-reveal affordance, branded chrome surfaces (selection, caret, scrollbar, optional custom cursor), and a bounded text-scramble reveal. Invoke in the ultraweb motion phase (Phase 9) after components are built, or whenever the user says "hover states", "micro-interactions", "the UI feels dead/static", "button feedback", "link underline animation", "focus rings", "custom cursor", "branded scrollbar", "text scramble/decode reveal", "hover-reveal keyboard access", or "polish the interactions". CSS-first — Motion (motion/react) only where CSS transitions cannot do the job.
---

# micro-interactions — feedback felt, not noticed

**Stage:** Phase 9 — Motion - **Reads:** design/SYSTEM.md §motion, design/DIRECTION.md, built components - **Writes:** interaction states across components (CSS transitions in classes/globals.css; Motion only where CSS can't)

## Standard

Every interactive element acknowledges input within 150–250ms, moves only via transform/opacity (plus color/border-color/box-shadow), and no response draws more attention than the content it decorates. The empirical test: tab AND mouse through every page — every link, button, input, card, and toggle responds; nothing lunges; keyboard users see a designed focus ring on everything.

- **150–250ms micro band.** Hover-in 150–200ms; press feedback 100–150ms (press must feel faster than hover). Never 300ms+ on hover — that band belongs to section reveals.
- **One easing family** from SYSTEM.md tokens (`--ease-*`). Never invent a curve per component.
- **CSS-first.** A hover lift is a `transition` + Tailwind utilities, not a client component. Reach for Motion 12 (`"use client"`, `LazyMotion` + `m.` per STACK.md) only for springs, exit animations, or orchestration.
- **Feedback follows hierarchy.** The primary CTA gets the richest response; a footnote link gets an underline. Identical treatment everywhere flattens hierarchy.
- **Hover parity.** Anything a pointer reveals on `:hover` must reveal identically on `:focus-within` and on tap — keyboard can't hover and touch has no hover, so a hover-only affordance (card metadata, a cursor-narrator label) is an accessibility defect, not a flourish (WCAG 2.2 SC 1.4.13). The focus-shown copy persists while focused, dismisses on `Escape` without moving focus, and never vanishes just because the pointer drifted off.
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

**Chrome-level branding (last 2%).** The surfaces every page touches yet no other skill owns — text selection, caret, scrollbar, cursor — get one coherent pass off the palette. Leaving them at OS default is a top tell that an otherwise-crafted site is still templated.

```css
::selection { background: var(--color-primary); color: var(--color-primary-foreground); } /* verify AA — gate-accessibility */
:root { scrollbar-color: var(--color-border) transparent; scrollbar-width: thin; caret-color: var(--color-primary); }
::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: var(--radius-full); } /* radius from shape-language */
```

A custom cursor is optional and gated: an SVG dot with `mix-blend-mode: difference`, only under `@media (pointer: fine)` (never override the caret/pointer on touch), off by default for Data-Dense Utilitarian where the system cursor is the honest choice.

**Text-scramble reveal (bounded variant).** A short string decodes into place — a hero word, a stat label, a nav wordmark — cycling random glyphs before it settles. Strictly bounded: short strings only (never body copy or a full headline), one-shot on reveal (never re-scrambles on hover), and settled fast inside the small band (~250–400ms). It animates `textContent`, not a transform, so it's the rare Motion/JS case — drive it with an interval you clear on completion, and cap the character set to the string's own alphabet so it never flashes visual noise. Reduced motion renders the final text immediately, no cycling. **The engine decision:** the hand-rolled interval is the default and is never worth a dependency. anime's `splitText` + `scrambleText` is the escalation ONLY where DIRECTION.md already commissioned ultraweb:animejs for an SVG moment — then per-character choreography comes free with a dep the site is already paying for (`splitText` needs `accessible: true` and must revert through the scope). That reuse is not a second commissioned moment: it adds no line to DIRECTION.md and does not consume animejs's one-moment budget. Installing anime.js for a scramble alone is the install gate failing, not a shortcut.

**Instant swap between heavy media** (`award-canon`: Instant Everything). When a component switches between heavy pieces — a media gallery, a tabbed panel with video, a before/after — prefetch the *adjacent* item(s), keep the incoming node **mounted** (`opacity-0 pointer-events-none`) and crossfade opacity rather than unmount-and-remount; the perceived instantaneousness is the delight. Cap it to the adjacent 2–3 neighbors — mounting the whole set is a memory trap on mid-range mobile — and if a neighbor isn't loaded, show a dimension-matched skeleton (no CLS), never a fake-instant blank. Reduced motion → instant show, no crossfade.

## Anti-patterns

- `transition-all` — transition named properties; `all` animates layout properties by accident.
- Animating `width`, `height`, `margin`, `padding`, `top`, `left` — layout thrash; grep for these inside `transition-[` and keyframes.
- `hover:scale-110` on cards or containers — a 10% lunge; 1.05 is the ceiling and only on small elements.
- `duration-500` on hover feedback — molasses; the micro band is 150–250ms.
- `whileHover` on elements CSS handles — a client component per list item to fake `:hover` is bundle waste.
- `focus:outline-none` with no focus-visible replacement — an accessibility defect, not a style choice.
- Uniform feedback intensity everywhere — motion has hierarchy like type does.
- Detached feedback: lift without shadow step, toggle whose track color never changes.
- Hover-only reveal — metadata, a label, or a control that appears on `:hover` with no `:focus-within` twin and no tap equivalent; invisible to keyboard, switch, and touch users (WCAG 2.2 SC 1.4.13).
- Default scrollbar and default `::selection` left at OS colors — one of the most common tells an otherwise-crafted site is still templated; the chrome-level pass owns them.
- Scrambling long strings or body copy, or re-scrambling on every hover — a decode effect is a one-shot on a short string; past that it's noise that hurts readability.

## Worked example — Studio Norra, work-index row feedback

Moved to `references/example.md` — read only when this build's case is genuinely ambiguous; the sections above are the decision material.

## Composes with

Moved to `references/composes.md` — the handoff map; load it when orchestrating this skill against its neighbors.
