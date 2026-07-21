---
name: page-transitions
description: Route transition strategy for ultraweb builds — decide whether routes transition at all, implement the stable template.tsx entrance as the default, and layer Next 16's EXPERIMENTAL View Transitions (experimental.viewTransition + ViewTransition from react) as progressive enhancement with shared-element continuity. Invoke in the ultraweb motion phase (Phase 9), or whenever the user says "page transitions", "route animations", "smooth navigation between pages", "shared element transition", "view transitions", or "pages pop in abruptly".
---

# page-transitions — navigation never feels slower

**Stage:** Phase 9 — Motion - **Reads:** design/SYSTEM.md §motion, design/SITEMAP.md, app/ structure - **Writes:** app-level transition layer (app/template.tsx, optional next.config.ts flag + ViewTransition wrappers)

## Standard

A route transition is seasoning on navigation, never a gate in front of it. First-grade means: 150–300ms, content-only (persistent chrome stays still), instant swap under reduced motion, and — because Next 16 View Transitions are EXPERIMENTAL — the site is complete and correct with transitions absent. "No transition" is a valid first-grade answer; dashboards and rapid-navigation flows are better without one.

- **Ceiling: 300ms.** The moment a transition makes navigation feel slower, cut it, not the duration alone.
- **Two-tier architecture.** Tier 1 (default, stable APIs): `template.tsx` entrance animation. Tier 2 (enhancement, experimental): View Transitions for cross-route continuity. Never both animating the same surface — that double-fires.
- **Chrome is stable.** Header, nav, footer never transition; only the page content wrapped below them.
- **Entrance-only in Tier 1.** `template.tsx` remounts on navigation but cannot animate exit — the old page unmounts immediately. Accept it; don't hack exit with `AnimatePresence` around route children (fragile in App Router).

## Process

1. Read SYSTEM.md §motion and SITEMAP.md; pick a strategy from the decision table. Record it in SYSTEM.md §motion.
2. Implement Tier 1: `app/template.tsx` with a 200–250ms fade + 8px rise. Template, not layout — layouts persist across navigation and would animate exactly once per session.
3. Optionally enable Tier 2: `experimental.viewTransition: true` in `next.config.ts`, `import { ViewTransition } from "react"`, wrap the transitioning surfaces. Give shared elements (card image → detail image) matching `name` props for continuity. `<Link transitionTypes={[...]}>` scopes animation styles per navigation type (per STACK.md). Behavior beyond these verified facts: check current docs first.
4. When Tier 2 is on, remove the Tier 1 animation from the routes it covers.
5. Reduced motion: transitions become instant swaps — gate the template animation and View Transition CSS behind `prefers-reduced-motion`.
6. Verify: click every nav path, use browser back/forward, confirm scroll restoration still works, test in a browser WITHOUT View Transitions support (instant swap must look intentional), console clean.

## Decision table

| Site type (BRIEF.md) | Strategy |
|---|---|
| Marketing / brochure | Tier 1 only: template fade + rise, 200–250ms |
| Editorial / portfolio | Tier 1 + Tier 2 shared-element continuity — the one site type where cross-route continuity earns its flag |
| Dashboard / app-like | None on route change; motion lives inside panes (`ui-states`) |
| E-commerce | Tier 2 on product-card → detail image only; everything else instant |

## Tier 1 — template.tsx (stable, the default)

```tsx
// app/template.tsx — remounts every navigation; layout.tsx does not
"use client";
import { m } from "motion/react"; // app-level LazyMotion(domAnimation) provider required

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <m.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {children}
    </m.div>
  );
}
```

`children` passed as props stay server components — the client boundary is this wrapper only. Place the template at the segment level that should animate (app root for all routes; a route group to exempt the dashboard).

## Tier 2 — View Transitions (experimental enhancement)

```ts
// next.config.ts
import type { NextConfig } from "next";
const nextConfig: NextConfig = { experimental: { viewTransition: true } };
export default nextConfig;
```

```tsx
import { ViewTransition } from "react";
// list page:  <ViewTransition name={`cover-${post.slug}`}><Image …/></ViewTransition>
// detail page: same name on the destination image → the browser morphs one into the other
```

Browsers without the View Transitions API get an instant swap — that IS the design for them, which is why the underlying pages must look finished without any transition. This flag is experimental: expect API movement, re-verify against current Next docs at build time, and never let a Tier 2 feature become load-bearing for layout or content.

## Anti-patterns

- Motion components directly in `layout.tsx` — layouts don't remount; the animation plays once, then never again (grep `m.` / `motion.` in layout.tsx).
- `AnimatePresence` in template.tsx/layout.tsx to fake route exit animations — fragile App Router hack; grep for it.
- Transition > 300ms — the user is waiting on chrome.
- Animating the header/nav/footer during navigation — persistent chrome must hold still.
- Tier 1 + Tier 2 both active on one route — double animation.
- Full-screen curtain/wipe overlays — portfolio-only move; requires explicit DIRECTION.md justification.
- Shipping `experimental.viewTransition` without testing the unsupported-browser path.
- No reduced-motion gate — route change must be an instant swap under `prefers-reduced-motion: reduce`.

## Worked example — Studio Norra, case-study route continuity

SYSTEM.md §motion, from the direction phase: "page transitions between case studies carry the case-study image as a shared element; springs, not ease-out defaults."

Editorial/portfolio → decision-table row 2: Tier 1 + Tier 2. The Tier 1 template fade + 8px rise (220ms) stays on `/`, `/studio`, `/contact`; the `/work` → `/work/[slug]` pair drops Tier 1 and runs Tier 2 shared-element continuity on the cover image — the one route pair where cross-route continuity earns the experimental flag.

```tsx
// app/work/page.tsx — index
<Link href={`/work/${project.slug}`} transitionTypes={["case-study"]}>
  <ViewTransition name={`cover-${project.slug}`}>
    <Image src={project.cover} alt={project.title} fill sizes="(min-width:768px) 50vw, 100vw" preload />
  </ViewTransition>
</Link>
// app/work/[slug]/page.tsx — same name on the destination cover → the browser morphs one into the other
```

`experimental.viewTransition: true` in next.config.ts; `transitionTypes={["case-study"]}` scopes a spring-tuned `::view-transition-group` timing so the morph reads as a spring, not the browser's ease-out default — honoring the brief's "springs" note without a JS animation on the transition. Signal red `oklch(0.6 0.21 25)` stays out of it: it is reserved for interaction states, never motion chrome.

Rejected: keeping the Tier 1 template fade on the `/work` routes as well — cut because Tier 1 + Tier 2 on one surface double-fires (anti-pattern) and the fade would fight the image morph.

Handoff: the strategy plus the `transitionTypes` map are recorded in design/SYSTEM.md §motion; ultraweb:gate-performance verifies the morph adds no INP regression and that the no-View-Transitions-API path is a clean instant swap.

## Composes with

- ultraweb:motion-language — transition durations and easing come from the same site-wide family.
- ultraweb:app-structure — the template-vs-layout placement decision lives on its client-boundary map.
- ultraweb:routing — coordinate with loading.tsx: a slow route shows its loading UI; never stack an entrance animation on top of a skeleton swap.
- ultraweb:navigation — the header's active-state change is part of the navigation choreography; keep it CSS, keep it instant.
- ultraweb:gate-performance — verifies transitions add no INP or long-task regressions.
