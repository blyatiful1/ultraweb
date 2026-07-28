---
name: motion-language
description: Defines the site-wide motion vocabulary every Tier-4 skill consumes — duration tiers (micro 150-250ms, small 250-400ms, section 400-700ms), ONE easing family as --ease-* tokens with a lib/motion.ts mirror, choreography rules (40-80ms stagger, once-only reveals, hard list of what never animates), a two-layer reduced-motion policy (CSS media query + useReducedMotion from motion/react), and a 0-3 motion-intensity dial set by the direction archetype. Invoke in the foundation phase before any animation is written, whenever a duration or easing value is needed, or when motion feels wrong ("animations everywhere", "timing feels off", "too much movement", "janky transitions", "make the motion consistent").
---

# motion-language — one vocabulary, every animation

**Stage:** Phase 3 — Foundation - **Reads:** design/DIRECTION.md, design/BRIEF.md, design/SITEMAP.md - **Writes:** design/SYSTEM.md §motion + easing/duration tokens (landed via ultraweb:tokens) + lib/motion.ts

## Standard

Every animation on the site draws its numbers from ONE token set and obeys ONE choreography plan. If two components (or two Tier-4 skills) would pick different values for the same interaction, this skill failed. Motion exists to direct attention, confirm an action, or express the direction's character — anything else doesn't animate. `prefers-reduced-motion` is honored on every animated surface, twice (CSS and JS). These are `award-canon`'s **Semantic Motion Only** (every animation encodes meaning or is cut) and **One Physics** (one easing personality, applied everywhere — consistency, not variety, is the signature) stated as this site's motion vocabulary.

**One vocabulary, two engines.** The tiers, curves, and choreography below are engine-independent; ownership is not, and it is never a per-component choice. CSS owns micro feedback and simple reveals. `motion/react` owns component lifecycle — `whileInView`, `AnimatePresence`, layout/FLIP, springs, gestures, cursor physics — plus every route transition and every drag. Scroll that is a pure function of position belongs to CSS `animation-timeline`, escalating to motion's `useScroll` only for spring-smoothing, velocity, or cross-element work (ultraweb:scroll-motion owns that ladder). ONE territory graduates past both: SVG choreography — multi-path draw, morph, motion path, grid stagger fields, split-text timelines — and scroll-scrubbed SVG sequences, which run on anime.js v4 through ultraweb:animejs, installed only when DIRECTION.md commissions the moment by name at intensity ≥2 (a scrubbed or pinned SVG timeline needs 3). motion stays THE animation library; anime.js is the one commissioned specialist, and the engines it displaces were argued once in STACK.md. Detect the second engine by import specifier (`from "animejs"`) — never by a bare API name, since `animate(` is also motion/react and WAAPI.

## Duration tiers

| Tier | Range | Token | Owns |
|------|-------|-------|------|
| micro | 150-250ms | `--dur-micro` | hover, press, focus, toggles, link underlines |
| small | 250-400ms | `--dur-small` | dropdowns, tooltips, accordions, modal-in, tab switches |
| section | 400-700ms | `--dur-section` | section reveals, hero entrance, page-level moments |

Nothing exceeds 700ms except a showpiece sequence explicitly named in DIRECTION.md, or a DIRECTION-commissioned animejs SVG timeline. Exits run at ~70% of their entrance duration — leaving is faster than arriving.

## Easing — one family, three roles

Pick ONE family for the whole site and assign its three roles. Enter with out, move/morph with in-out, exit with in. Never the CSS default `ease`; `linear` only for marquees and progress.

- **Decisive** (default — SaaS, editorial, local business): out `cubic-bezier(0.22, 1, 0.36, 1)` · in-out `cubic-bezier(0.83, 0, 0.17, 1)` · in `cubic-bezier(0.64, 0, 0.78, 0)`.
- **Mechanical** (brutalist, technical directions): out `cubic-bezier(0.33, 1, 0.68, 1)` · in-out `cubic-bezier(0.65, 0, 0.35, 1)` · in `cubic-bezier(0.32, 0, 0.67, 0)` — flatter curves, and cut every duration tier ~20%.
- **Springy** (playful, expressive directions): physical interactions use motion springs (`useSpring`, spring transitions), not beziers; the CSS side may use overshoot `cubic-bezier(0.34, 1.56, 0.64, 1)` on the micro tier ONLY.

```css
/* app/globals.css — landed by ultraweb:tokens */
@theme {
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);    /* entrances, hover */
  --ease-in-out: cubic-bezier(0.83, 0, 0.17, 1); /* moves, morphs */
  --ease-in: cubic-bezier(0.64, 0, 0.78, 0);     /* exits only */
}
:root {
  --dur-micro: 200ms;
  --dur-small: 320ms;
  --dur-section: 560ms;
}
```

Redefining `--ease-*` inside `@theme` makes the stock `ease-out`/`ease-in`/`ease-in-out` utilities serve the brand curves — one name, impossible to drift. Durations stay plain `:root` custom properties (STACK.md names no duration namespace — verify against current docs before assuming one); consume them via `duration-[var(--dur-micro)]` or the JS mirror:

```ts
// lib/motion.ts — identical values in motion/react units (seconds, bezier arrays)
export const dur = { micro: 0.2, small: 0.32, section: 0.56 } as const;
export const ease = {
  out: [0.22, 1, 0.36, 1],
  inOut: [0.83, 0, 0.17, 1],
  in: [0.64, 0, 0.78, 0],
} as const;
```

`app/globals.css` and `lib/motion.ts` are the ONLY two files where raw motion numbers may exist. Any component importing from `motion/react` needs `"use client"`. The rule survives a second engine: a commissioned anime.js timeline imports its curves and durations from the same mirror, extended once and never duplicated.

```ts
// lib/motion.ts — appended only when DIRECTION.md commissions ultraweb:animejs
import { cubicBezier } from "animejs";
export const animeEase = {
  out: cubicBezier(...ease.out), inOut: cubicBezier(...ease.inOut), in: cubicBezier(...ease.in),
} as const;
export const animeDur = { micro: dur.micro * 1000, small: dur.small * 1000, section: dur.section * 1000 } as const; // anime runs in ms, motion in s
```

Pass `animeEase.*` as the function `cubicBezier()` returns — never the string `'cubicBezier(...)'`, which silently falls back to linear (per STACK.md's easing traps).

## Choreography

- Stagger siblings 40-80ms (`delay: i * 0.06`); cap staggered groups at 6 items — past 6, animate the container as one block. The cap governs entrance reveals; 2D `stagger(v, { grid })` fields are a different animal and exist only inside the commissioned animejs moment.
- ONE entrance choreography per viewport; never more than 8 elements mid-animation at any instant.
- Reveal order inside a section: backdrop/container → heading → supporting copy → CTA/media. Meaning first, ornament last.
- Reveals fire once: `whileInView` with `viewport={{ once: true }}`. Scrolling back replays nothing.
- Header/nav render static — no entrance. The LCP element never mounts at `opacity: 0`; if the hero choreographs, the LCP headline/image leads with zero delay.
- Animate `transform` and `opacity` only — never width/height/top/left/margin. motion's `layout` prop is the sanctioned exception (FLIP, still transforms underneath); SVG attributes — `stroke-dashoffset`/`dasharray`, path `d` morphs, motion-path transforms — are the second, sanctioned ONLY inside a DIRECTION-commissioned animejs moment. They are compositor-unfriendly: budget ≤2 concurrent SVG choreographies per viewport and prove it with a performance recording — steady 60fps over ≥5s, zero long tasks >50ms.
- NEVER animates: focus outlines · body text while it's being read (display headlines may reveal; paragraphs may not) · form input positions · elements under the cursor (unless ultraweb:physics deliberately owns the moment) · theme switches (next-themes `disableTransitionOnChange` — a site-wide color crossfade is mud) · anything reacting to every scroll tick that isn't a designed scroll-linked moment (ultraweb:scroll-motion owns those).
- One sanctioned ambient loop — `award-canon`'s **living idle** under Semantic Motion Only: low-amplitude perpetual drift on ≤2 hero elements, transform-only (`useTime`-driven `translateY(sin(t))`), permitted only at intensity ≥2 when DIRECTION.md names it and always behind `prefers-reduced-motion`. Any other autoplaying perpetual motion is a vestibular hazard and slop.

## Reduced motion — two layers, both mandatory

1. **CSS:** author entrance and looping animations inside `@media (prefers-reduced-motion: no-preference) { }` — opt-in beats a `reduce` kill-switch fighting specificity. Color/opacity micro-transitions ≤200ms may live outside it.
2. **JS:** every `"use client"` component driving motion calls `useReducedMotion()` from `motion/react` and swaps translation/scale/parallax for an opacity-only fade ≤200ms, or nothing.

Reduced ≠ frozen: fades survive; movement, parallax, autoplaying media, springs, and pinned sequences do not. `gate-accessibility` verifies by emulating the preference — design for that check now.

## Intensity dial

DIRECTION.md's archetype maps to exactly ONE level; record it in SYSTEM.md §motion. Tier-4 skills refuse work above the recorded level.

| Level | Name | Grants | Fits |
|-------|------|--------|------|
| 0 | Still | micro transitions only — no entrances, no scroll motion | print-like editorial, ultra-minimal |
| 1 | Calm | + once-only section reveals (fade + ≤12px rise) | SaaS, local business, content — the default |
| 2 | Expressive | + stagger choreography, scroll-linked moments, one physics interaction | portfolio, agency, creative commerce |
| 3 | Theatrical | + page transitions, pinned sequences, showpiece canvas | only when DIRECTION.md names the showpiece, or a commissioned animejs SVG sequence that is scrubbed or pinned (an unscrubbed one is granted at level 2) |

## Process

1. Read DIRECTION.md; set the intensity level with a one-line rationale in SYSTEM.md §motion.
2. Pick the easing family; hand the `--ease-*` tokens + `:root` durations to ultraweb:tokens for app/globals.css.
3. Write `lib/motion.ts` with the identical values in motion units.
4. Write the choreography plan against SITEMAP.md: which sections reveal, stagger values, exemptions (nav, LCP element).
5. Write the reduced-motion delta: exactly what remains under `reduce`.
6. Record all of it in SYSTEM.md §motion — Tier-4 skills consume tokens and rules, never invent values.

## Anti-patterns

Greppable — each should return zero:
- `transition-all` — name the transitioned properties
- `cubic-bezier(` anywhere outside `app/globals.css` and `lib/motion.ts`
- `transition={{ duration: 0.` inline in components — import from `lib/motion`
- `whileInView` without `once: true`
- `animate-bounce` / `animate-pulse` as attention-getters (skeletons excepted — ultraweb:ui-states owns those)
- `duration-700` / `duration-1000` on hover states
- `ease: "linear"` outside marquees and progress bars

And the constitutional one: staggered fade-up on every section is banned wallpaper — if everything enters, nothing arrives.

## Worked example — Studio Norra, portfolio motion vocabulary

DIRECTION.md: "Editorial Brutalist — oversized type, exposed grid, deliberate rawness; page transitions between case studies carry the case-study image as a shared element; springs, not ease-out defaults."

Intensity **3 / Theatrical** — level 3 unlocks only because DIRECTION.md names the page-transition showpiece; the cursor-proximity index reveals sit inside it as the one physics interaction. Easing family **Mechanical** (brutalist), every duration tier cut ~20%. The single physical moment — the case-study image morphing across the `/work` → `/work/[slug]` transition — overrides the bezier with a motion spring; everything else rides the flat Mechanical curves.

```ts
// lib/motion.ts
export const dur = { micro: 0.16, small: 0.26, section: 0.45 } as const;
export const ease = {
  out: [0.33, 1, 0.68, 1], inOut: [0.65, 0, 0.35, 1], in: [0.32, 0, 0.67, 0],
} as const;
export const morph = { type: "spring", stiffness: 260, damping: 30 } as const; // shared-element only
```

Rejected: ease-out tweens for the shared-element morph — DIRECTION.md forbids them by name, and a spring gives the image weight as it resizes from index thumbnail to case-study hero where an eased tween just reads as a slide. Signal red `oklch(0.6 0.21 25)` fires only on interaction states, never as entrance ornament; the reveals fall to opacity-only under `useReducedMotion()`.

Handoff: the numbers land in design/SYSTEM.md §motion — ultraweb:tokens writes `--ease-*` + `:root` durations into app/globals.css, ultraweb:page-transitions consumes `morph` for the shared element, ultraweb:physics owns the cursor-proximity reveal.

## Composes with

- ultraweb:tokens — lands the `--ease-*`/duration tokens this skill specifies
- ultraweb:micro-interactions — consumes the micro tier and easing roles
- ultraweb:scroll-motion — consumes the section tier, stagger caps, and once-only rules
- ultraweb:page-transitions — permitted only at intensity 3; same easing family
- ultraweb:physics — springs for anything physical, at intensity ≥2
- ultraweb:animejs — the DIRECTION-gated second engine: it holds the install gate, stays inside the SVG-choreography lane, and draws its curves and durations from this skill's `lib/motion.ts` mirror
- ultraweb:gate-accessibility — empirically verifies the reduced-motion policy
- ultraweb:direction — read for the archetype that sets the intensity level (0-3) and selects the easing family
- ultraweb:navigation — told the nav/header renders static: no entrance, and the LCP headline never mounts at opacity 0
- ultraweb:ui-states — owns the skeleton pulse/shimmer, one of only two permitted attention-loops (the other is the DIRECTION-sanctioned living idle above, always behind reduced-motion)
- ultraweb:award-canon — One Physics and Semantic Motion Only name this skill's one-easing-family and meaning-or-cut rules; living idle is its one sanctioned ambient loop
