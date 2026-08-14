## Composes with

- **ultraweb:sitemap** — the tree implements SITEMAP.md part 1; amend the artifact before deviating.
- **ultraweb:app-structure** — owns RSC/client boundaries and layout-vs-template choices inside the segments this skill creates.
- **ultraweb:ui-states** — designs every skeleton, error, and empty surface that loading.tsx/error.tsx/not-found.tsx render.
- **ultraweb:page-transitions** — route-level motion sits on this tree; template.tsx decisions coordinate there.
- **ultraweb:seo** — per-segment `generateMetadata` awaits the same params this skill defines.
- **ultraweb:gate-code** — the build gate catches missing slot defaults and boundary errors; run it after any tree change.
- **ultraweb:gate-performance** — the Speculation Rules block and prefetch strategy are the perceived-latency levers it measures; over-eager prerender shows up there as wasted renders and skewed analytics.
- **ultraweb:hidden-craft** — owns the playful not-found.tsx micro-scene (the Framewalk playable 404); this skill owns the boundary-file contract it renders into.
- **ultraweb:scaffold** — creates the `app/` directory and `next.config` this tree populates, and re-verifies Next 16 versions before the route files land here.
- **ultraweb:i18n** — owns the `[locale]` segment (or `/en`, `/pt` groups) this tree nests every route inside; localized `not-found` and awaited params flow back through here.
- **ultraweb:showpiece** — the `?view=` camera-pose contract is a search-param contract this skill owns; a navigable scene is app state, not a demo reel.
- **ultraweb:set-design** — a persistent canvas rides on real routes: every route in the scene's scope stays a real URL with server-rendered content, every 3D affordance resolves through `<Link>`/`router.push`, the canvas never intercepts navigation, and a dynamic segment needs a journey window like any other route.
