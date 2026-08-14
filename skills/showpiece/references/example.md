## Worked example — Studio Norra, Oslo agency portfolio index

design/DIRECTION.md commissions the signature move verbatim: "cursor-proximity case-study image reveals on the `/work` index." Editorial Brutalist, Archivo Expanded display over Inter body, paper `oklch(0.96 0.005 90)` / ink `oklch(0.2 0.01 270)` with signal red `oklch(0.6 0.21 25)` reserved for interaction states.

The gate check's site-type arm passes (agency portfolio — spend boldly), but the cost-ladder arm decides it: the cheapest sufficient rung is the *floor*. The eight case-study photos stay real `<img>` in the DOM — crisp, indexable, alt-texted — revealed via `clip-path` and drawn toward the pointer by a `useSpring` follower. 0kb of WebGL, no canvas, no R3F. showpiece declines to escalate and records in design/SYSTEM.md: "no set piece — signature met at the DOM+spring rung; showpiece scope: none, bundle delta 0kb."

Rejected: a fragment-shader displacement reveal on a raw WebGL quad. It lost because rasterizing the work onto a canvas destroys exactly what an agency index sells — image crispness, text-first LCP, per-image alt text — for zero gain over `clip-path`.

Handoff: the pointer spring is owned by ultraweb:physics; the `/work` → `/work/[slug]` shared-element image transition (springs, not ease-out defaults) is owned by ultraweb:scroll-motion. The static fallback — the plain index list revealing each image on hover/focus — is what prefers-reduced-motion and no-JS receive, and it clears gate-visual on its own. Because the case-study images stay real DOM with authored alt text and the list names each project, that fallback already carries the argument in words — the narrative text-track is satisfied without a separate `sr-only` block; and with no camera, there is no scene state to route.
