## Composes with

- ultraweb:motion-language — transition durations and easing come from the same site-wide family.
- ultraweb:app-structure — the template-vs-layout placement decision lives on its client-boundary map; the route announcer mounts once in the root layout it defines, and moving focus to the new page's `<h1>` on navigation is the focus-reset half of accessible client nav that pairs with this skill's announcer.
- ultraweb:routing — coordinate with loading.tsx: a slow route shows its loading UI; never stack an entrance animation on top of a skeleton swap.
- ultraweb:set-design — the one commissioned exception to the persistent-canvas ban: the canvas survives the route swap, this skill still owns the swap, the announcer, and the reduced-motion path.
- ultraweb:navigation — the header's active-state change is part of the navigation choreography; keep it CSS, keep it instant.
- ultraweb:gate-accessibility — its manual screen-reader pass is where the announcer is proven: navigate with a screen reader running and confirm each new page title is announced exactly once.
- ultraweb:gate-performance — verifies transitions add no INP or long-task regressions.
- ultraweb:award-canon — The Masked Cut and Shared-Element Lift are the canon patterns this skill gates; the Masked Cut requires DIRECTION.md justification, and both keep a reduced-motion instant path and real URLs underneath.
