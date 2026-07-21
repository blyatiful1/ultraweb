---
name: gate-performance
description: Core Web Vitals quality gate for ultraweb builds — runs Lighthouse against the production build (≥90 performance on every route, mobile emulation is the score of record), audits the LCP element (next/image with preload — never the deprecated priority prop), proves zero CLS (intrinsic dimensions on all media), sweeps the client bundle ("use client" creep, single LazyMotion provider with m. components, no star imports of lucide-react), and verifies self-hosted next/font loading. Invoke in Phase 11 (Gates) of every ultraweb build, and whenever the user says "the site is slow", "Lighthouse", "Core Web Vitals", "LCP", "CLS", "bundle size", "page speed", or "performance audit".
---

# gate-performance — fast is part of first-grade

**Stage:** Phase 11 — Gates - **Reads:** `npm run build` output, running `npm start` server, design/SITEMAP.md (route list), app/ + components/ source - **Writes:** design/QA.md §gate-performance

## Standard

Lighthouse performance ≥90 on every route under default mobile emulation — the score of record — measured against a production server. LCP element deliberately optimized and under 2.5s; CLS measured 0.00; first-load JS ≤140 kB per marketing route. taste's ruling applies here verbatim: a fast plain site beats a janky impressive one, always. Numbers come from tools this session, never from reading code and estimating.

## Checklist

1. **Build & budget** — production build clean; First Load JS from the build table ≤140 kB per marketing route, ≤170 kB for app-like routes.
2. **Lighthouse** — performance ≥90 per SITEMAP.md route, mobile emulation; a desktop pass as confirmation.
3. **LCP element** — identified from the report, then optimized: image LCP → next/image with `preload` + correct `sizes` (the `priority` prop is deprecated in Next 16 — its presence is a defect), never `loading="lazy"`, never inside a lazy-mounted client boundary; text LCP → loaded via next/font with no invisible-text period.
4. **Zero CLS** — every image has intrinsic width/height or `fill` paired with `sizes`; video/iframe boxed by `aspect-ratio` or dimensions; async content loads into space reserved by skeletons (ui-states), never pushing the page.
5. **Client bundle** — `"use client"` only on interaction leaves per the app-structure boundary plan; exactly ONE `LazyMotion features={domAnimation}` provider with `m.` components everywhere (under `strict`, `motion.` throws; `domMax` only when drag/layout animation exists — +25kb vs +15kb); no star imports of lucide-react, no name-keyed icon maps that pull the whole library.
6. **Fonts** — everything through next/font (auto self-hosted: zero requests to Google hosts), variable fonts, ≤2 families, `font-display: swap` in the served `@font-face`.

## How to verify

**1.** `npm run build` (Turbopack is the default bundler for dev AND build — there is no `--turbopack` flag) → read the route table, record First Load JS per route against budget. Then `npm start` and gate against it. Auditing `next dev` produces meaningless scores — never do it.

**2.** Per route: `npx lighthouse http://localhost:3000/pricing --only-categories=performance --output=json,html --output-path=design/lh-pricing --chrome-flags="--headless=new" --quiet`. No preset flag = mobile emulation = score of record; run `--preset=desktop` once as confirmation. A score within 2 points of the threshold gets the median of 3 runs, not one lucky pass.

**3.** In the JSON, `audits["largest-contentful-paint-element"]` names the node. Trace it to its component. Image LCP: `preload` present, `sizes` matches rendered width, `placeholder="blur"` where the source allows. Then `rg -n "priority" app components -g "*.tsx"` — every hit on an `<Image>` is the deprecated prop; replace with `preload`. Keep `preload` to 1–2 images per page: preloading everything un-prioritizes everything, and below-fold images stay on the lazy default.

**4.** `audits["cumulative-layout-shift"].numericValue` must be 0 (inspect the filmstrip when it isn't). Source sweep: `rg -n "<img\b" -g "*.tsx"` — raw `img` tags should not exist (next/image only; media-optimization owns documented exceptions); every `fill` image carries `sizes` (`rg -n "fill" -g "*.tsx"` and audit); `rg -n "<video|<iframe" -g "*.tsx"` → each has `aspect-ratio` or explicit dimensions.

**5.** `rg -l '"use client"' app components -g "*.tsx"` → compare the file list against the app-structure boundary plan; a `"use client"` in any `layout.tsx` or page root is a defect. Motion: `rg -n 'from "motion/react"'` → components import `{ m }` (hooks like `useScroll`/`useSpring` are fine); `rg -n 'import \{[^}]*\bmotion\b[^}]*\} from "motion/react"'` → refactor each to `m.` under the single provider. Confirm exactly one `LazyMotion` in the tree. Lucide: `rg -n 'import \* as .* from "lucide-react"'` → zero hits; named imports only.

**6.** Hard-reload each route, then `browser_network_requests`:

- zero hits on `fonts.googleapis.com` / `fonts.gstatic.com` — next/font self-hosts; any Google host request means a stray `<link>` or raw `@import` bypassed it
- font files served same-origin under `/_next/`, woff2 only
- `rg -n "next/font" app lib styles` → one central fonts module exporting the instances, variable fonts (no weight arrays)
- inspect a served `@font-face` for `font-display: swap`; set `display: "swap"` explicitly in the loader if absent

## Metric triage

When a route scores <90, the failing metric names the owner — fix at the source, not with tricks:

- **LCP high** → in order: page blocks on a slow data fetch (stream it with Suspense — data-fetching owns the pattern), LCP image missing `preload` or `sizes` oversized for the rendered box, fonts without swap blocking text paint.
- **TBT high** → client bundle: a big hydrating client tree (item 5's boundary audit), `motion` imported without LazyMotion, third-party scripts. The fix is moving work back to the server, not `setTimeout` games.
- **Speed Index high** → above-fold content waiting on JS: entrance animations that hide content until hydration (scroll-motion's rule — content renders, motion enhances), or hero media loading late.
- **Audit lists** — `unused-javascript`, `modern-image-formats`, `uses-responsive-images` in the JSON each name offending URLs; trace every URL to its component and fix there.

## Pass criteria

Every SITEMAP.md route: perf ≥90 mobile, LCP element verified optimized, CLS 0.00, budgets met, bundle and font sweeps clean. Every fix re-runs Lighthouse on the affected route — a code change without a re-measure is unverified.

## QA.md entry

```md
## gate-performance — PASS (2026-07-16)
build: clean · first-load JS: / 128kB · /pricing 131kB · /about 122kB (budget 140)
lighthouse mobile: / 96 · /pricing 94 · /about 97 — reports in design/lh-*
LCP: hero next/image, preload+sizes ok, 1.9s · CLS: 0.00 all routes
bundle: 9 client files (plan: 9) · single LazyMotion, m.-only ok · lucide named imports ok
fonts: 2 variable families via next/font, self-hosted, swap ok
fixed: hero image priority → preload · testimonial avatar fill missing sizes · residual: none
```

## Anti-patterns

- Auditing the dev server, or trusting one run at 90 exactly — take the median of 3 near the threshold
- `priority` on next/image (deprecated in Next 16 → `preload`), and its cousin: `preload` sprayed on every image
- Fixing CLS with `min-height` guesses instead of real intrinsic dimensions
- `"use client"` at the top of a layout or page "to be safe" — the whole subtree ships to the client
- `import { motion }` in a LazyMotion-strict app — runtime throw, and the full bundle even without strict
- A wildcard lucide import or `icons[name]` lookup map — defeats tree-shaking
- Chasing 100: past a verified-90 with clean LCP/CLS, further points rarely beat spending the time in gate-visual

## Worked example — Framewalk, Hollow Cartographer Steam launch site

design/QA.md §gate-performance, first pass. SITEMAP.md routes: `/`, `/game`, `/devlog`, `/devlog/[slug]`, `/press`.
build clean · first-load JS `/` 132kB · `/game` 129kB (budget 140). `npm start`, then mobile Lighthouse.
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
CLS 0.00 on all; first-load JS `/devlog` 121kB · `/devlog/[slug]` 124kB · `/press` 118kB (budget 140).

Handoff: PASS row written to design/QA.md; ultraweb:ship reads this gate green before cutting the deploy.

## Composes with

- ultraweb:media-optimization — implements the next/image and asset pipeline this gate measures.
- ultraweb:app-structure — the RSC/client boundary plan that item 5 audits against.
- ultraweb:typography — the next/font pairing whose loading item 6 verifies.
- ultraweb:ui-states — skeletons that reserve space so async content cannot shift layout.
- ultraweb:showpiece — its 60fps-on-mid-hardware and static-fallback mandate is re-verified here when one exists.
- ultraweb:gate-code — must be green first; this gate assumes a clean build.
- ultraweb:data-fetching — when LCP blocks on a slow request, this gate hands the fix here: stream it behind Suspense rather than block the paint.
- ultraweb:hero — when the LCP element traces to the hero, this gate hands the preload/boundary fix to hero, which owns the above-fold image and its client split.
- ultraweb:scroll-motion — its "content renders, motion enhances" rule is the fix this gate prescribes when entrance animations hide above-fold content until hydration (Speed Index).
- ultraweb:physics — this gate's bundle audit only passes `domMax` (+25kb over domAnimation) when physics' drag/layout animation actually needs it.
