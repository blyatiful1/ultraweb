## Worked example — Framewalk, Hollow Cartographer Steam launch site

design/QA.md §gate-performance, first pass. SITEMAP.md routes: `/`, `/game`, `/devlog`, `/devlog/[slug]`, `/press`.
build clean · cold-load JS (encodedBodySize, 500ms-quiet) `/` 132kB · `/game` 129kB (budget 140). `npm start`, then mobile Lighthouse.
`/` scored 78 — LCP 4.2s. `audits["largest-contentful-paint-element"]` named the base fog layer, the
near-black `oklch(0.16 0.02 200)` art. It rendered inside the `"use client"` `<FogParallax>` boundary, so
the three cursor-answering layers only painted after hydration — the LCP image waited on JS, Speed Index high.
That is the scroll-motion smell exactly: content should paint first, motion enhances.

Fix (owner: ultraweb:hero): the base layer became a server-rendered `next/image` with `preload` +
`sizes="100vw"` + `placeholder="blur"`; `<FogParallax>` enhances the already-painted layers on mousemove,
still `m.`-only under the one `LazyMotion features={domAnimation}`. Re-ran Lighthouse mobile on `/`
(median of 3): LCP 2.1s · CLS 0.00 · perf 93. Space Grotesk + Inter both self-hosted via next/font, swap ok.

Full sweep before the handoff — the other four routes passed on their first Lighthouse run, no fix
needed: `/game` 92 (LCP 2.3s) · `/devlog` 96 (1.9s) · `/devlog/[slug]` 94 (2.1s) · `/press` 97 (1.8s);
CLS 0.00 on all; cold-load JS `/devlog` 121kB · `/devlog/[slug]` 124kB · `/press` 118kB (budget 140).

Handoff: PASS row written to design/QA.md; ultraweb:ship reads this gate green before cutting the deploy.
