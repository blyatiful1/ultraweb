---
name: gate-performance
description: Core Web Vitals quality gate for ultraweb builds — runs Lighthouse against the production server of record (≥90 performance on every route, mobile emulation is the score of record), measures cold-load JS, font and transfer budgets from the network, audits the LCP element (next/image with preload — never the deprecated priority prop), proves zero CLS (intrinsic dimensions on all media), and sweeps the client bundle ("use client" creep, single LazyMotion provider with m. components, no star imports of lucide-react, a DIRECTION-gated second engine or renderer). Executed by the gate-runner agent as the sixth and last gate of Phase 11 in every ultraweb build, and whenever the user says "the site is slow", "Lighthouse", "Core Web Vitals", "LCP", "CLS", "bundle size", "page speed", or "performance audit".
---

# gate-performance — fast is part of first-grade

**Stage:** Phase 11 — Gates, executed by the `gate-runner` agent (Sonnet) against the production server of record at `prodUrl` (normally `:3100`), in fixed position six of code → responsive → antislop → content → accessibility → performance — last, so it measures a server nothing else is loading. The Lead builds once and starts that server in the Phase 11 preamble (`mkdir -p qa && rm -rf .next && npm run build > qa/build.log 2>&1`, then `PORT=3100 npm start > qa/prod.log 2>&1 &`); the runner never builds and never starts one. - **Reads:** design/SITEMAP.md (route list), design/DIRECTION.md (commissioned scene scope + byte budget), design/SYSTEM.md §scene, app/ + components/ source - **Writes:** design/QA.md §gate-performance (append), qa/gate-performance.log, qa/lh-<route>.*

## Standard

Lighthouse performance ≥90 on every SITEMAP.md route under default mobile emulation — the score of record. LCP under 2.5s and deliberately optimized; CLS 0.00; cold-load client JS ≤140 kB compressed per marketing route, measured from the network because Next 16's build output prints no size numbers to lean on. `ultraweb:taste` applies verbatim: a fast plain site beats a janky impressive one, always. Numbers come from tools this dispatch, never from reading code and estimating.

## Checklist

1. **Cold-load JS** — ≤140 kB encoded per marketing route, ≤170 kB for app-like routes, and the same route fetches the same script set across two runs (a set that moves makes every other number a coin flip). **The 140 kB bar is not raised for 3D:** a renderer inside cold-load JS is a mounting defect, not a budget negotiation. A commissioned GL chunk counts inside `totalEncoded` like every other script and is priced on its own named line against the byte budget DIRECTION.md wrote before the first shader; the 140 kB bar then holds the non-scene remainder. [MEASURED]
2. **Lighthouse** — ≥90 performance per route, mobile emulation the score of record, one desktop pass as confirmation. A score within 2 points of the threshold gets the median of 3 runs, not one lucky pass. [MEASURED]
3. **LCP element** — image LCP → next/image with `preload` + correct `sizes` (the `priority` prop is deprecated in Next 16 — its presence is a defect), never `loading="lazy"`, never inside a lazy-mounted client boundary; text LCP → next/font with no invisible-text period. `preload` on 1–2 images per page: preloading everything un-prioritizes everything. [MEASURED]
4. **Zero CLS** — `cumulative-layout-shift` 0.00; every image has intrinsic width/height or `fill` paired with `sizes`; video/iframe boxed by `aspect-ratio` or dimensions; async content loads into space reserved by skeletons (`ultraweb:ui-states`), never pushing the page. [MEASURED]
5. **Client bundle** — `"use client"` only on interaction leaves per the `ultraweb:app-structure` boundary plan, never in a `layout.tsx` or page root; exactly ONE `LazyMotion features={domAnimation}` provider with `m.` components everywhere (under `strict`, `motion.` throws; `domMax` only when drag/layout animation exists — +25kb vs +15kb, 12.x-measured, unverified for 13 per STACK.md); no star imports of lucide-react, no name-keyed icon maps that pull the whole library. [MEASURED]
6. **Fonts** — everything through next/font (auto self-hosted: zero requests to Google hosts), variable fonts, ≤2 families, woff2 served same-origin under `/_next/`, no face in an error state, `font-display: swap`. [MEASURED]
7. **Transfer weight** — total bytes over the wire per route: a mobile marketing page ≤ ~1.5 MB; record the figure, not just the verdict. A route inside a commissioned `ultraweb:set-design` scope is held to DIRECTION.md's own ceiling and to `ultraweb:award-canon` Pattern 23's site-scale <3 MB — never a number invented at audit time — and the model, the textures and any decoder (invisible to bundle analysers) all count toward it. Every non-scene route on that site still holds the ~1.5 MB line. [MEASURED]
8. **Second engine and renderer** — anime.js and three.js are DIRECTION-gated and never arrive by accident: a commission line naming the skill, named imports only, self-hosted decoders, `frameloop="demand"` unless a written justification exists, the GL chunk after LCP and inside its budget. [MEASURED]
9. **Triage evidence** — for every route under 90 or over budget: the failing metric plus the offending URLs its audit lists name, each traced to `file:line`. [OBSERVED]
10. **Deliberate JS** — every scroll listener and every code split earns its existence: a pure function of scroll position belongs in CSS `animation-timeline`, and a chunk split off with `next/dynamic` is either a commissioned scene/analytics row or a budget dodge — evidence returned: both `rg` hit lists with `file:line`, and the DIRECTION.md lines commissioning the animejs scrubbed-SVG moment or the `ultraweb:set-design` camera, quoted (or "none"). [JUDGMENT → Lead]

## How to verify

**Runner contract.** In: `gate` · `pluginRoot` · `projectRoot` · `prodUrl` · `devUrl` · `artifacts` (BRIEF, DIRECTION, SYSTEM, SITEMAP, QA, PROGRESS paths) · `tier` · `market` · `themeStrategy` · `rerunOnly` (optional — run only those check numbers).
Out: verdict `PASS` / `PASS-ON-MEASURED` / `FAIL` / `UNVERIFIED` (`PASS` only when `judgment-open` is empty) · failed checks as `check · file:line · one line · owner skill · MECHANICAL|DESIGN` · the judgment-open evidence for check 10 · the QA.md entry appended · `qa/gate-performance.log`.
Every measurement runs against `prodUrl` — auditing `next dev` produces meaningless scores.
The runner never runs `npm run build`, `npm start`, `npm run dev`, `rm -rf .next` or `npm install`, and makes no source or `design/*` edit other than the QA.md append.
Sketch tier: homepage only. Degraded mode — no Playwright: verdict UNVERIFIED with "NO BROWSER — Playwright MCP not available; zero routes verified.", and every `rg`/`npx`-checkable step still runs in full.
Fallback (Phase 0 recorded `measure-library: unavailable`): the V1.8.0 inline snippet — `git -C <plugin> show V1.8.0:skills/gate-performance/SKILL.md`, which works only in a git checkout; in a marketplace snapshot the affected checks go UNVERIFIED.

**1. Cold-load JS — the budget of record.** Per route, `browser_run_code_unsafe` with `filename: <plugin>/scripts/measure/cold-load-js.mjs` (the tool loads the file; `code` is ignored; no `window.__ultraweb` seed). It reloads to network-idle and sums the script/modulepreload resource entries: assert `totalEncoded` ≤140 kB (marketing) / ≤170 kB (app-like); the runner reads `totalEncoded`, `count` and `scripts[].name`. Network-idle after reload is the boundary of record because it swallows the parked-just-past-`load` dodge — a chunk delayed to `load + 1ms` still lands inside it. The result lands in the runner's own context, never the Lead's: write each run to `<projectRoot>/qa/gate-performance-cold-load-js-<run>.json` with the Write tool and diff the two `scripts[].name` lists out of those files rather than scrolling them. Do NOT read sizes from the `next build` route table — Next 16 removed those columns. Over budget → return the route and its `totalEncoded`; attribution is the Lead's follow-up AFTER this gate closes, never a step inside it, because `npx next experimental-analyze --output` (Next 16.1+, the Turbopack Bundle Analyzer: per-route bundles, client split from server, the import chain that pulled each module) writes into `.next` — the build of record this server is serving — so it costs a repeat of the Phase 11 preamble before anything is measured again.

**2. Lighthouse.** Per route: `npx lighthouse <prodUrl>/pricing --only-categories=performance --output=json,html --output-path=qa/lh-pricing --chrome-flags="--headless=new" --quiet`. Reports stay at `qa/lh-<route>.*` — never under `design/`, never `cat` one. Read four numbers per report with one line: `jq -r '[.categories.performance.score*100, .audits["largest-contentful-paint"].numericValue, .audits["cumulative-layout-shift"].numericValue, .audits["total-blocking-time"].numericValue] | @tsv' qa/lh-pricing.report.json`. No preset flag = mobile; `--preset=desktop` once.

**3. LCP element.** `jq -r '.audits["largest-contentful-paint-element"].details.items[0].items[0].node.selector' qa/lh-<route>.report.json` names the node; trace it to its component. Then `rg -n "priority" app components -g "*.tsx"` — every hit on an `<Image>` is the deprecated prop (→ `preload`); `rg -n 'loading="lazy"'` on the LCP component is a defect; confirm `sizes` matches the rendered box and `placeholder="blur"` where the source allows.

**4. Zero CLS.** The `cumulative-layout-shift` number from step 2 must be 0; when it is not, `jq -r '.audits["layout-shift-elements"].details.items[].node.selector' qa/lh-<route>.report.json` names the shifting nodes. Source sweep: `rg -n "<img\b" -g "*.tsx"` — raw `img` tags should not exist (next/image only; `ultraweb:media-optimization` owns documented exceptions); `rg -n "fill" -g "*.tsx"` → every `fill` image carries `sizes`; `rg -n "<video|<iframe" -g "*.tsx"` → each has `aspect-ratio` or explicit dimensions.

**5. Client bundle.** `rg -l '"use client"' app components -g "*.tsx"` → compare against the app-structure boundary plan; a hit in any `layout.tsx` or page root is a defect. `rg -n 'from "motion/react"'` → components import `{ m }` (hooks like `useScroll`/`useSpring` are fine); `rg -n 'import \{[^}]*\bmotion\b[^}]*\} from "motion/react"'` → each hit is a refactor to `m.` under the single provider; confirm exactly one `LazyMotion` in the tree. `rg -n 'import \* as .* from "lucide-react"'` → zero hits; named imports only.

**6. Fonts.** Per route, `browser_run_code_unsafe` with `filename: <plugin>/scripts/measure/font-requests.mjs` (no seed needed): it collects the font resource entries plus `document.fonts` → assert no face with `status: 'error'`, distinct `faces[].family` ≤2, and every `fonts[].name` same-origin under `/_next/` and woff2; the runner reads `faces[]`, `fonts[].name`, `count` and `totalTransfer`. A `fonts.googleapis.com`/`fonts.gstatic.com` name means a stray `<link>` or `@import` bypassed next/font. Then `rg -n "next/font" app lib styles` → one central fonts module exporting the instances, variable fonts (no weight arrays), `display: "swap"` set explicitly in the loader.

**7. Transfer weight.** Hard-reload each route, then `browser_network_requests`; sum the transfer column per route and record the figure. A mobile marketing page over ~1.5 MB is a defect even at Lighthouse 90: the score forgives a fast test connection, a visitor's data plan does not. A route inside a commissioned scene scope is measured identically against DIRECTION.md's written ceiling instead. Offenders in the usual order: unoptimized hero media (`ultraweb:media-optimization`), a font family not earning its bytes (`ultraweb:typography`), a commissioned second engine (step 8). On a sustainability-minded brief, run the totals through co2.js for a grams-per-visit figure — a measured number, never a badge.

**8. Engine-and-renderer sweeps** — only when a second engine or a renderer shipped. Detect by import specifier, never by API name: `animate(` is also motion/react and WAAPI, and `<Canvas` / `useFrame(` appear in comments and dead code.

- `rg -n 'from "animejs"' app components` and `rg -n 'from "three"|from "@react-three/' app components` → any hit requires a design/DIRECTION.md line commissioning it BY NAME: the SVG moment for animejs, `ultraweb:set-design` **with route scope and byte budget** (or `ultraweb:showpiece` for one set piece) for the renderer. No citation, no dependency — gate-code's check 10 owns the package.json half (its check 7, unused dependencies, exempts them precisely because 10 rules them).
- `rg -n 'import \* as .* from "animejs"|import \* as .* from "three"|import \* as .* from "@react-three/drei"'` → zero hits; the barrels are multiples of the named-import cost (per STACK.md).
- `rg -n 'gstatic.com/draco|cdn.jsdelivr.net/gh/pmndrs|raw.githack.com'` → zero hits; drei's three default CDNs must be self-hosted.
- `rg -n 'frameloop="always"' app components` → every hit carries its written justification in design/SYSTEM.md §scene naming the commissioned living idle and its pause on `document.hidden`; `demand` is the default posture and an unjustified always-loop is a battery defect.
- `rg -n 'addEventListener\("wheel"' app components` → no hit paired with `passive: false` / `preventDefault`. In the engine's own files, `rg -n 'onScroll\('` → every hit belongs to the commissioned moment.
- Record the engine's and the GL chunk's measured bytes from step 1's `scripts[]` against the DIRECTION.md budget, confirming from step 7's network log that the chunk starts after LCP. Module costs are per STACK.md; this site's number is not.

**9. Triage — report the owner, never fix.** Per failing route, name the metric and its source: **LCP** → a page blocking on a slow fetch (`ultraweb:data-fetching` streams it with Suspense), a missing `preload`, `sizes` oversized for the rendered box, or fonts without swap. **TBT** → the client bundle (step 5), `motion` without LazyMotion, third-party scripts; the fix is server work, not `setTimeout` games. **Speed Index** → above-fold content waiting on JS (`ultraweb:scroll-motion`'s rule: content renders, motion enhances) or late hero media. **Audit lists** → `unused-javascript`, `modern-image-formats`, `uses-responsive-images` name offending URLs; trace each to its component and return the `file:line`.

**10. Judgment evidence.** `rg -n 'addEventListener\("scroll"|useScroll' app components` and `rg -n 'next/dynamic' app components`; return both lists with `file:line`, and quote the DIRECTION.md commission lines (or "none"). The Lead rules whether each listener genuinely needs JS — spring smoothing, velocity, cross-element choreography, the commissioned animejs timeline that `animation-timeline` cannot drive, the commissioned scene camera that no CSS timeline can address — and whether each split chunk is a commissioned row or a dodge.

## Pass criteria

Every SITEMAP.md route (homepage only at sketch tier): perf ≥90 mobile, LCP element verified optimized, CLS 0.00, cold-load JS and transfer weight recorded and inside budget — or, on a route inside a commissioned `ultraweb:set-design` scope, inside that build's DIRECTION.md budgets — script set stable, bundle, font and engine sweeps clean. Every fix re-dispatches this gate with `rerunOnly` naming the affected checks — but the server serves the build of record, not the working tree, so any fix that touched source, config, tokens or dependencies repeats the Phase 11 preamble (one rebuild, one restart) BEFORE the re-dispatch, and a token or config change widens the re-run to the whole gate, since it can move every number here. A code change without a re-measure is unverified.

## QA.md entry

The runner APPENDS this with a `>>` heredoc — it never rewrites QA.md and never reads it to find an anchor. On `rerunOnly` it appends a dated `re-run` block listing only the re-run checks and their new results. Full stdout/stderr of every failing or unverified command goes to `<projectRoot>/qa/gate-performance.log`; the return carries that path, never the contents. The `fixed:` line belongs to a re-run block (the Lead's fixes, re-measured); a first dispatch writes `failed:` or `failed: none`.

```md
## gate-performance — PASS-ON-MEASURED (2026-07-16)
cold-load JS (encodedBodySize, network-idle): / 128kB · /pricing 131kB · /about 122kB (budget 140) · script set stable across 2 runs
lighthouse mobile: / 96 · /pricing 94 · /about 97 — reports in qa/lh-*
LCP: hero next/image, preload+sizes ok, 1.9s · CLS: 0.00 all routes
bundle: 9 client files (plan: 9) · single LazyMotion, m.-only ok · lucide named imports ok
second engine: none (no animejs import, no DIRECTION commission)
renderer:      none (no three/@react-three import, no DIRECTION commission)
transfer: / 0.9MB · /pricing 0.7MB · /about 0.6MB (budget ~1.5MB mobile)
fonts: 2 variable families via next/font, self-hosted, swap ok
failed: none · judgment-open: 2 scroll listeners (hero.tsx:41, marquee.tsx:18)
```

On a build that shipped a commissioned scene the renderer row carries numbers instead of `none`, every one measured this dispatch: `renderer: set-design — GL chunk 361 kB gz (budget 380), after LCP on all 5 routes, scope /,/deepwater,/bestiary,/bestiary/[slug],/wishlist`.

## Anti-patterns

- Auditing the dev server, or trusting one run at 90 exactly (item 2's median of 3)
- Reading First Load JS from the `next build` table — those columns are gone in Next 16
- Parking a chunk just past `load` to duck the budget — network-idle catches it
- `@next/bundle-analyzer` wired into a Turbopack build — a webpack plugin that produces no report there; it points at `experimental-analyze` and works only under a deliberate `next build --webpack`
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
