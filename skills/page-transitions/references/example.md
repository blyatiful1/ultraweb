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
