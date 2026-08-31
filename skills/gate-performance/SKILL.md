---
name: gate-performance
description: Core Web Vitals quality gate for ultraweb builds — runs Lighthouse against the production build (≥90 performance on every route, mobile emulation is the score of record), audits the LCP element (next/image with preload — never the deprecated priority prop), proves zero CLS (intrinsic dimensions on all media), sweeps the client bundle ("use client" creep, single LazyMotion provider with m. components, no star imports of lucide-react), and verifies self-hosted next/font loading. Invoke in Phase 11 (Gates) of every ultraweb build, and whenever the user says "the site is slow", "Lighthouse", "Core Web Vitals", "LCP", "CLS", "bundle size", "page speed", or "performance audit".
---

# gate-performance — fast is part of first-grade

**Stage:** Phase 11 — Gates - **Reads:** `npm run build` output, running `npm start` server, design/SITEMAP.md (route list), app/ + components/ source - **Writes:** design/QA.md §gate-performance

## Standard

Lighthouse performance ≥90 on every route under default mobile emulation — the score of record — measured against a production server. LCP element deliberately optimized and under 2.5s; CLS measured 0.00; first-load client JS ≤140 kB compressed per marketing route, measured from the network log — Next 16's build output prints no size numbers to lean on. taste's ruling applies here verbatim: a fast plain site beats a janky impressive one, always. Numbers come from tools this session, never from reading code and estimating.

## Checklist

1. **Build & budget** — production build clean. Next 16 REMOVED the `size` and `First Load JS` columns from the `next build` route table — there is no number there to read, so the budget is **measured**: the compressed JS a hard reload of each route transfers before the `load` event, summed from the network log against `npm start`. ≤140 kB per marketing route, ≤170 kB for app-like routes. **The 140 kB bar is not raised for 3D.** On a build carrying a DIRECTION-commissioned persistent scene (`ultraweb:set-design`) it is met by the DOM shell, and the GL chunk is excluded from that figure only if it genuinely is: prove in the network waterfall that its request starts after the LCP entry, then price it on its own line against the byte budget DIRECTION.md wrote before the first shader. A renderer inside First Load JS is a mounting defect, not a budget negotiation.
2. **Lighthouse** — performance ≥90 per SITEMAP.md route, mobile emulation; a desktop pass as confirmation.
3. **LCP element** — identified from the report, then optimized: image LCP → next/image with `preload` + correct `sizes` (the `priority` prop is deprecated in Next 16 — its presence is a defect), never `loading="lazy"`, never inside a lazy-mounted client boundary; text LCP → loaded via next/font with no invisible-text period.
4. **Zero CLS** — every image has intrinsic width/height or `fill` paired with `sizes`; video/iframe boxed by `aspect-ratio` or dimensions; async content loads into space reserved by skeletons (ui-states), never pushing the page.
5. **Client bundle** — `"use client"` only on interaction leaves per the app-structure boundary plan; exactly ONE `LazyMotion features={domAnimation}` provider with `m.` components everywhere (under `strict`, `motion.` throws; `domMax` only when drag/layout animation exists — +25kb vs +15kb); no star imports of lucide-react, no name-keyed icon maps that pull the whole library; and if a second engine or a renderer ships, the engine-and-renderer audit below.
6. **Fonts** — everything through next/font (auto self-hosted: zero requests to Google hosts), variable fonts, ≤2 families, `font-display: swap` in the served `@font-face`.
7. **Transfer weight** — total bytes over the wire per route, from the network log: a mobile marketing page ≤ ~1.5 MB; record the actual figure, not just the verdict. A route carrying a commissioned persistent scene is measured against its own DIRECTION.md line instead, and against `award-canon` Pattern 23's site-scale ceiling of <3 MB — never against a number invented at audit time — and the model, the textures and any decoder (invisible to bundle analysers) all count toward it. Every non-scene route on that site still holds the ~1.5 MB line.

## How to verify

**1.** `npm run build` (Turbopack is the default bundler for dev AND build — there is no `--turbopack` flag) → exit 0. Do NOT grep the route table for sizes: Next 16 removed the `size` and `First Load JS` columns (upgrade guide; CLI changelog v16.0.0) — the table now prints only render-mode symbols (`○` static, `◐` partial prerender, `●` SSG, `ƒ` dynamic) plus Revalidate/Expire on cached routes. Then `npm start` and gate against it. Auditing `next dev` produces meaningless scores — never do it.

**First-load JS, measured.** Hard-reload each route, `browser_network_requests`, sum the compressed transfer of every script fetched before the `load` event → the per-route figure of record against the 140/170 kB budget. When a route is over, attribute before cutting: `npx next experimental-analyze` (Next 16.1+, the Turbopack Bundle Analyzer) filters bundles per route, splits client from server, and shows the full import chain that pulled each module in; `--output` writes static analysis to `.next/diagnostics/analyze` for before/after diffs. `@next/bundle-analyzer` is a webpack plugin and Turbopack does not run webpack plugins — on a default Next 16 build it silently does nothing; it works only under a deliberate `next build --webpack`.

**2.** Per route: `npx lighthouse http://localhost:3000/pricing --only-categories=performance --output=json,html --output-path=design/lh-pricing --chrome-flags="--headless=new" --quiet`. No preset flag = mobile emulation = score of record; run `--preset=desktop` once as confirmation. A score within 2 points of the threshold gets the median of 3 runs, not one lucky pass.

**3.** In the JSON, `audits["largest-contentful-paint-element"]` names the node. Trace it to its component. Image LCP: `preload` present, `sizes` matches rendered width, `placeholder="blur"` where the source allows. Then `rg -n "priority" app components -g "*.tsx"` — every hit on an `<Image>` is the deprecated prop; replace with `preload`. Keep `preload` to 1–2 images per page: preloading everything un-prioritizes everything, and below-fold images stay on the lazy default.

**4.** `audits["cumulative-layout-shift"].numericValue` must be 0 (inspect the filmstrip when it isn't). Source sweep: `rg -n "<img\b" -g "*.tsx"` — raw `img` tags should not exist (next/image only; media-optimization owns documented exceptions); every `fill` image carries `sizes` (`rg -n "fill" -g "*.tsx"` and audit); `rg -n "<video|<iframe" -g "*.tsx"` → each has `aspect-ratio` or explicit dimensions.

**5.** `rg -l '"use client"' app components -g "*.tsx"` → compare the file list against the app-structure boundary plan; a `"use client"` in any `layout.tsx` or page root is a defect. Motion: `rg -n 'from "motion/react"'` → components import `{ m }` (hooks like `useScroll`/`useSpring` are fine); `rg -n 'import \{[^}]*\bmotion\b[^}]*\} from "motion/react"'` → refactor each to `m.` under the single provider. Confirm exactly one `LazyMotion` in the tree. Lucide: `rg -n 'import \* as .* from "lucide-react"'` → zero hits; named imports only. Scroll-driven effects: `rg -n 'addEventListener\("scroll"|useScroll' app components` — each hit must genuinely need JS (spring smoothing, velocity, cross-element choreography); a pure function of scroll position belongs in CSS `animation-timeline` (two exceptions: the DIRECTION-commissioned animejs scrubbed-SVG moment, since `animation-timeline` cannot drive multi-path timeline choreography; and the DIRECTION-commissioned `set-design` camera, since a scene-graph camera is not a CSS property and no timeline can address it).

**Engine-and-renderer audit** (only when a second engine or a renderer shipped). motion/react is the site's animation library; anime.js is DIRECTION-gated and never arrives by accident. Detect it by import specifier, never by API name — `animate(` is also motion/react and WAAPI: `rg -n 'from "animejs"' app components`.

- the dependency exists only with a design/DIRECTION.md line commissioning the SVG moment BY NAME — no citation, no dependency (gate-code's check 7 owns the package.json half)
- `rg -n 'import \* as .* from "animejs"'` → zero hits; named imports from the barrel only, or the tree-shake is defeated
- record the measured gzip contribution in QA.md off the network log or `next experimental-analyze` — module costs are per STACK.md, but this site's actual number is not
- in those files only, `rg -n 'onScroll\('` — every hit belongs to the commissioned moment; an anime scroll observer on any other surface is a second moment nobody commissioned (item 5 sweeps scroll listeners generally, by API name, across the whole tree)

**Renderer half** (only when a scene shipped). three.js is not an animation engine, but it is gated on the same construction and it is the largest single dependency this harness ever installs. Detect it by import specifier, never by `<Canvas` or `useFrame(`, which appear in comments, prose and dead code: `rg -n 'from "three"|from "@react-three/' app components`.

- the dependency exists only with a design/DIRECTION.md line naming `ultraweb:set-design` **with its route scope and byte budget** (or `ultraweb:showpiece` for one set piece) — no citation, no dependency (gate-code's check 7 owns the package.json half)
- `rg -n 'import \* as .* from "@react-three/drei"|import \* as .* from "three"'` → zero hits; the barrels are multiples of the named-import cost (per STACK.md)
- `rg -n 'gstatic.com/draco|cdn.jsdelivr.net/gh/pmndrs|raw.githack.com'` → zero hits; drei's three default CDNs must be self-hosted
- `rg -n 'frameloop="always"' app components` → every hit carries its written justification in design/SYSTEM.md §scene naming the DIRECTION-commissioned living idle and its pause on `document.hidden`; `demand` is the default posture and an unjustified always-loop is a battery defect, not a preference
- `rg -n 'addEventListener\("wheel"' app components` → no hit paired with `passive: false`/`preventDefault`; and record the GL chunk's measured gzip from the network log (or `next experimental-analyze --output`) against the DIRECTION.md budget, confirming from the waterfall that it loads after LCP. Module costs are per STACK.md; this site's actual number is not.

**6.** Hard-reload each route, then `browser_network_requests`:

- zero hits on `fonts.googleapis.com` / `fonts.gstatic.com` — next/font self-hosts; any Google host request means a stray `<link>` or raw `@import` bypassed it
- font files served same-origin under `/_next/`, woff2 only
- `rg -n "next/font" app lib styles` → one central fonts module exporting the instances, variable fonts (no weight arrays)
- inspect a served `@font-face` for `font-display: swap`; set `display: "swap"` explicitly in the loader if absent

**7.** Same hard reload, same `browser_network_requests` log — sum the transfer sizes per route. A mobile marketing page over ~1.5 MB is a defect even at Lighthouse 90: the score forgives a fast test connection, a visitor's data plan does not. A route inside a commissioned `set-design` scope is instead held to the transfer budget DIRECTION.md wrote for it — same measurement, same QA.md record, a different written ceiling. Record the actual per-route total in QA.md, not just the verdict. Offenders in the usual order: unoptimized hero media (media-optimization), a font family not earning its bytes (typography), a commissioned second engine (item 5). Optional on a sustainability-minded brief — run the totals through co2.js for a grams-per-visit figure the client can quote; a measured number, never a badge.

## Metric triage

When a route scores <90, the failing metric names the owner — fix at the source, not with tricks:

- **LCP high** → in order: page blocks on a slow data fetch (stream it with Suspense — data-fetching owns the pattern), LCP image missing `preload` or `sizes` oversized for the rendered box, fonts without swap blocking text paint.
- **TBT high** → client bundle: a big hydrating client tree (item 5's boundary audit), `motion` imported without LazyMotion, third-party scripts. The fix is moving work back to the server, not `setTimeout` games.
- **Speed Index high** → above-fold content waiting on JS: entrance animations that hide content until hydration (scroll-motion's rule — content renders, motion enhances), or hero media loading late.
- **Audit lists** — `unused-javascript`, `modern-image-formats`, `uses-responsive-images` in the JSON each name offending URLs; trace every URL to its component and fix there.

## Pass criteria

Every SITEMAP.md route: perf ≥90 mobile, LCP element verified optimized, CLS 0.00, budgets met, transfer weight recorded and inside ~1.5 MB — or, on a route inside a commissioned `set-design` scope, inside that build's DIRECTION.md transfer budget — bundle and font sweeps clean. Every fix re-runs Lighthouse on the affected route — a code change without a re-measure is unverified.

## QA.md entry

```md
## gate-performance — PASS (2026-07-16)
build: clean · first-load JS (wire, network log): / 128kB · /pricing 131kB · /about 122kB (budget 140)
lighthouse mobile: / 96 · /pricing 94 · /about 97 — reports in design/lh-*
LCP: hero next/image, preload+sizes ok, 1.9s · CLS: 0.00 all routes
bundle: 9 client files (plan: 9) · single LazyMotion, m.-only ok · lucide named imports ok
second engine: none (no animejs in package.json, no DIRECTION commission)
renderer:      none (no three/@react-three in package.json, no DIRECTION commission)
transfer: / 0.9MB · /pricing 0.7MB · /about 0.6MB (budget ~1.5MB mobile)
fonts: 2 variable families via next/font, self-hosted, swap ok
fixed: hero image priority → preload · testimonial avatar fill missing sizes · residual: none
```

On a build that shipped a commissioned scene the renderer row carries numbers instead of `none`, and every one of them is measured this session: `renderer: set-design — GL chunk 361 kB gz (budget 380), after LCP on all 5 routes, scope /,/deepwater,/bestiary,/bestiary/[slug],/wishlist`.

## Anti-patterns

- Auditing the dev server, or trusting one run at 90 exactly — take the median of 3 near the threshold
- Reading First Load JS from the `next build` table — those columns were removed in Next 16; the budget is measured from the network log and attributed with `next experimental-analyze`
- `@next/bundle-analyzer` wired into a Turbopack build — a webpack plugin that silently does nothing there
- `priority` on next/image (deprecated in Next 16 → `preload`), and its cousin: `preload` sprayed on every image
- Fixing CLS with `min-height` guesses instead of real intrinsic dimensions
- `"use client"` at the top of a layout or page "to be safe" — the whole subtree ships to the client
- `import { motion }` in a LazyMotion-strict app — runtime throw, and the full bundle even without strict
- A wildcard lucide import or `icons[name]` lookup map — defeats tree-shaking
- Chasing 100: past a verified-90 with clean LCP/CLS, further points rarely beat spending the time in gate-visual

## Worked example — Framewalk, Hollow Cartographer Steam launch site

Moved to `references/example.md` — read only when this build's case is genuinely ambiguous; the sections above are the decision material.

## Composes with

Moved to `references/composes.md` — the handoff map; load it when orchestrating this skill against its neighbors.
