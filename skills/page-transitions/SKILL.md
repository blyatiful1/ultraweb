---
name: page-transitions
description: Route transition strategy for ultraweb builds — decide whether routes transition at all, implement the stable template.tsx entrance as the default, and layer Next 16's EXPERIMENTAL View Transitions (experimental.viewTransition + ViewTransition from react) as progressive enhancement with shared-element continuity, and ship the REQUIRED route-change live announcer so screen readers hear each new page (client navigation is otherwise silent). Invoke in the ultraweb motion phase (Phase 9), or whenever the user says "page transitions", "route animations", "smooth navigation between pages", "shared element transition", "view transitions", "screen reader silent on navigation", "route announcer", or "pages pop in abruptly".
---

# page-transitions — navigation never feels slower

**Stage:** Phase 9 — Motion - **Reads:** design/SYSTEM.md §motion, design/SITEMAP.md, app/ structure - **Writes:** app-level transition layer (app/template.tsx, optional next.config.ts flag + ViewTransition wrappers)

## Standard

A route transition is seasoning on navigation, never a gate in front of it. First-grade means: 150–300ms, content-only (persistent chrome stays still), instant swap under reduced motion, and — because Next 16 View Transitions are EXPERIMENTAL — the site is complete and correct with transitions absent. "No transition" is a valid first-grade answer; dashboards and rapid-navigation flows are better without one.

- **Ceiling: 300ms.** The moment a transition makes navigation feel slower, cut it, not the duration alone.
- **Two-tier architecture.** Tier 1 (default, stable APIs): `template.tsx` entrance animation. Tier 2 (enhancement, experimental): View Transitions for cross-route continuity. Never both animating the same surface — that double-fires.
- **anime.js never owns a route transition.** Even on a build where DIRECTION.md commissioned the engine for an SVG moment (`ultraweb:animejs`), navigation stays View Transitions / `template.tsx` / motion — a third runtime racing the App Router's own commit timing buys nothing Tier 1 doesn't already give for free. **A persistent scene never owns one either.** The camera move may accompany the cut — that is the point of mapping each route to a window of one clip — but `template.tsx` / View Transitions / motion still commit the navigation, and a 3D affordance navigates by emitting a real `href` the DOM nav already reaches. A canvas cannot cross-fade with itself: prefer the View Transitions API, which snapshots it for free, over a hand-rolled `preserveDrawingBuffer` + `drawImage` clone.
- **Chrome is stable.** Header, nav, footer never transition; only the page content wrapped below them.
- **Entrance-only in Tier 1.** `template.tsx` remounts on navigation but cannot animate exit — the old page unmounts immediately. Accept it; don't hack exit with `AnimatePresence` around route children (fragile in App Router).
- **The Masked Cut — only when DIRECTION.md justifies a full-bleed transition (`award-canon`).** Cover the swap with one brief full-bleed effect (color-flood, frost, dissolve) and fire the route or heavy swap *behind* the cover so the load is invisible; an incoming brand-color flood doubles as wayfinding. This is the disciplined form of the full-screen wipe the anti-patterns gate — ONE grammar reused site-wide, reduced-motion → plain crossfade or instant, and never a persistent-canvas SPA just to keep a scene alive across routes — with one commissioned exception, and it is not an SPA: when DIRECTION.md commissions a site-scale scene (`ultraweb:set-design`), the canvas persists but the App Router still owns navigation. Every route stays a real URL with server-rendered content, `<Link>` still navigates, the announcer still announces, and the scene is a background that survives the swap — never a router that replaces it. A canvas that intercepts navigation with `history.pushState` is the banned SPA wearing a commission.
- **Shared-Element Lift (`award-canon`): Browse → Elevate → Read.** A picked item *lifts into* its detail — the same element scales up via a shared-element transition (Motion `layoutId` for an in-page lift, or Tier 2 View Transitions cross-route) so the reader never loses their place. Even inside a looping/infinite field every card stays a real crawlable `<a href>` with its own URL (endless field, bounded meaning); browser Back returns to the field at the same scroll position.
- **Route-change announcer — REQUIRED whenever routes animate (the AA floor, not an enhancement).** A `template.tsx` entrance or a View Transition is *visible but silent*: client navigation never fires the browser's native new-document title announcement, so a screen-reader user is never told the page changed. Any animated route flow ships a persistent visually-hidden `aria-live="polite"` region that speaks the new page's `<h1>`/title one paint after the route commits — the audible half of accessible client nav, paired with focus reset (`app-structure`). See *Route announcer* below.

## Process

1. Read SYSTEM.md §motion and SITEMAP.md; pick a strategy from the decision table. Record it in SYSTEM.md §motion.
2. Implement Tier 1: `app/template.tsx` with a 200–250ms fade + 8px rise. Template, not layout — layouts persist across navigation and would animate exactly once per session.
3. Optionally enable Tier 2: `experimental.viewTransition: true` in `next.config.ts`, `import { ViewTransition } from "react"`, wrap the transitioning surfaces. Give shared elements (card image → detail image) matching `name` props for continuity. `<Link transitionTypes={[...]}>` scopes animation styles per navigation type (per STACK.md). Behavior beyond these verified facts: check current docs first.
4. When Tier 2 is on, remove the Tier 1 animation from the routes it covers.
5. Ship the route announcer (required for ANY animated route flow, Tier 1 or Tier 2): mount `<RouteAnnouncer/>` once in `app/layout.tsx`, below `{children}` — see *Route announcer* below. Skip only when the site chose "None" (no route animates at all).
6. Reduced motion: transitions become instant swaps — gate the template animation and View Transition CSS behind `prefers-reduced-motion`. The announcer is exempt: it carries no motion and stays on under reduced motion.
7. Verify: click every nav path, use browser back/forward, confirm scroll restoration still works, test in a browser WITHOUT View Transitions support (instant swap must look intentional), console clean; and with a screen reader running (NVDA / VoiceOver), confirm each client route change announces the new page title exactly once.

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

## Route announcer — the accessible half of client navigation

Client navigation swaps content inside one live document, so the browser's native "new page" title announcement never fires — a screen-reader user hears nothing when a route (or a View Transition) changes. Ship ONE persistent visually-hidden live region that speaks the new page. It mounts once in `app/layout.tsx` (never `template.tsx`: a region that remounts with the route isn't stable in the DOM when its text changes, so the announcement is dropped).

```tsx
// components/layout/route-announcer.tsx — render ONCE in app/layout.tsx, below {children}
"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function RouteAnnouncer() {
  const pathname = usePathname();
  const [label, setLabel] = useState("");
  useEffect(() => {
    // title/H1 resolve a paint AFTER the route commits; read next frame, latest read wins
    const id = requestAnimationFrame(() => {
      const h1 = document.querySelector("main h1")?.textContent?.trim();
      setLabel(h1 || document.title);
    });
    return () => cancelAnimationFrame(id); // coalesces rapid navigations — no stacked announcements
  }, [pathname]);
  return <div aria-live="polite" role="status" className="sr-only">{label}</div>;
}
```

`polite`, never `assertive` — a route change queues behind the user, it doesn't interrupt them. The region is empty on first paint (the native document-load announcement already covers the first page, so this never double-announces) and speaks only on subsequent client navigations. Prefer the `<h1>` over `document.title`: the heading is the page's on-screen name and is reliably in the DOM by the next frame, while `document.title` (set by each page's `generateMetadata`/`metadata` export) resolves slightly later and is the fallback. `sr-only` (Tailwind) keeps the node in the accessibility tree while off-screen — never `hidden`/`display:none`, which drops it from screen readers. Moving keyboard focus to that new heading is the *other* half of accessible client nav and belongs to `ultraweb:app-structure`: the announcer says *what* changed, the focus reset says *where you are now*.

## Anti-patterns

- Motion components directly in `layout.tsx` — layouts don't remount; the animation plays once, then never again (grep `m.` / `motion.` in layout.tsx).
- `AnimatePresence` in template.tsx/layout.tsx to fake route exit animations — fragile App Router hack; grep for it.
- Transition > 300ms — the user is waiting on chrome.
- Animating the header/nav/footer during navigation — persistent chrome must hold still.
- Tier 1 + Tier 2 both active on one route — double animation.
- Full-screen curtain/wipe overlays — portfolio-only move; requires explicit DIRECTION.md justification.
- Shipping `experimental.viewTransition` without testing the unsupported-browser path.
- No reduced-motion gate — route change must be an instant swap under `prefers-reduced-motion: reduce`.
- Animating a route (template or View Transition) with no live-region announcer — the swap is visible but silent to a screen reader. Required, not optional.
- Announcer mounted in `template.tsx` or a page instead of `layout.tsx` — it remounts with the route, so the live region isn't stable when its text changes and the announcement is dropped (grep `RouteAnnouncer` in template.tsx / page files).
- `aria-live="assertive"` or `role="alert"` for route announcements — interrupts the user mid-utterance; route changes are polite.

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

```css
/* app/globals.css — without this the case-study type only scopes; the UA ease-out still runs */
:active-view-transition-type(case-study)::view-transition-old(*),
:active-view-transition-type(case-study)::view-transition-new(*) {
  animation-duration: 300ms;
  animation-timing-function: linear(0, 0.65 22%, 1.04 52%, 0.99 78%, 1); /* spring-like, slight overshoot */
}
```

`experimental.viewTransition: true` in next.config.ts; `transitionTypes={["case-study"]}` only scopes the navigation — the CSS above is what supplies the spring: `:active-view-transition-type(case-study)` targets the `::view-transition-old/new` snapshots so the morph reads as a spring, not the browser's ease-out default — honoring the brief's "springs" note without a JS animation on the transition. Signal red `oklch(0.6 0.21 25)` stays out of it: it is reserved for interaction states, never motion chrome.

Because both `/work` (Tier 1 fade) and `/work/[slug]` (the View-Transition morph) animate, `<RouteAnnouncer/>` sits once in `app/layout.tsx`: landing on a case study, a screen reader hears the project's `<h1>` ("Meridian — a brand system for a tidal-energy startup") one frame after the morph commits, while sighted users get the image lift — one navigation, both channels served. Focus resets to that same `<h1>` via ultraweb:app-structure.

Rejected: keeping the Tier 1 template fade on the `/work` routes as well — cut because Tier 1 + Tier 2 on one surface double-fires (anti-pattern) and the fade would fight the image morph.

Handoff: the strategy plus the `transitionTypes` map are recorded in design/SYSTEM.md §motion; ultraweb:gate-performance verifies the morph adds no INP regression and that the no-View-Transitions-API path is a clean instant swap.

## Composes with

- ultraweb:motion-language — transition durations and easing come from the same site-wide family.
- ultraweb:app-structure — the template-vs-layout placement decision lives on its client-boundary map; the route announcer mounts once in the root layout it defines, and moving focus to the new page's `<h1>` on navigation is the focus-reset half of accessible client nav that pairs with this skill's announcer.
- ultraweb:routing — coordinate with loading.tsx: a slow route shows its loading UI; never stack an entrance animation on top of a skeleton swap.
- ultraweb:set-design — the one commissioned exception to the persistent-canvas ban: the canvas survives the route swap, this skill still owns the swap, the announcer, and the reduced-motion path.
- ultraweb:navigation — the header's active-state change is part of the navigation choreography; keep it CSS, keep it instant.
- ultraweb:gate-accessibility — its manual screen-reader pass is where the announcer is proven: navigate with a screen reader running and confirm each new page title is announced exactly once.
- ultraweb:gate-performance — verifies transitions add no INP or long-task regressions.
- ultraweb:award-canon — The Masked Cut and Shared-Element Lift are the canon patterns this skill gates; the Masked Cut requires DIRECTION.md justification, and both keep a reduced-motion instant path and real URLs underneath.
