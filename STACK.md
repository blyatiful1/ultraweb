# STACK.md — verified stack facts

Verified against live npm registry + official docs on **2026-07-16**; the anime.js and Shiki sections verified **2026-07-28**. Every ultraweb skill's code advice must match this file. Versions drift: `scaffold` re-verifies at build time (`npm view <pkg> version`); when this file and reality disagree, reality wins — then update this file.

## Versions (npm `latest`, 2026-07-16; anime.js/Shiki 2026-07-28)

next 16.2.10 · react/react-dom 19.2.7 (create-next-app pins 19.2.4) · tailwindcss 4.3.2 · shadcn CLI 4.13.0 · lucide-react 1.24.0 · next-themes 0.4.6 · motion 12.42.2 · zod 4.4.3 · drizzle-orm 0.45.2 (v1.0.0-rc.4 on `rc` — official docs install `@rc`) · drizzle-kit 0.31.10 · @neondatabase/serverless 1.1.0 · better-auth 1.6.23 · next-auth 4.24.14 latest / 5.0.0-beta.31 (never left beta) · resend 6.17.2 · react-email 6.9.0 · @react-email/components 1.0.12 · stripe 22.3.2 · @next/mdx 16.2.10 (version-locked to next) · content-collections 0.15.2 · velite 0.4.0 · shiki 4.3.1 · @shikijs/transformers 4.3.1 · @shikijs/rehype 4.3.1 · animejs 4.5.0 (DIRECTION-gated — never in the base install)

## Next.js 16 — the facts

- **Init:** `npx create-next-app@latest my-app --yes` → TS, Tailwind, App Router, ESLint, `@/*` alias, Turbopack, AGENTS.md. There is **no `--turbopack` flag** — Turbopack is the default bundler for dev AND build. `next.config.ts` fully supported.
- **`middleware.ts` is deprecated → `proxy.ts`** exporting `proxy(request)` (Node runtime). Codemod: `npx @next/codemod@latest rename-middleware-to-proxy .`
- **`params`/`searchParams` are Promises** — always `await` them (pages, layouts, generateMetadata).
- **Parallel route slots REQUIRE `default.tsx`** — build fails without it.
- **Caching:** `fetch` is NOT cached by default. Current model = Cache Components: top-level `cacheComponents: true` in next.config → enables `'use cache'` directive + `cacheLife('seconds'|'minutes'|'hours'|'days'|'weeks'|'max')` + `cacheTag()` from `next/cache`. PPR comes via `cacheComponents`, not `experimental.ppr` (removed). `revalidateTag(tag, profile)` now takes a cacheLife profile second arg; `revalidatePath()` unchanged.
- **Server Actions (stable):** `'use server'` action `(prevState, formData)`; client: `const [state, formAction, pending] = useActionState(action, initial)` from `'react'`; `useFormStatus()` from `'react-dom'`; `<form action={formAction}>` progressively enhances.
- **Metadata:** `generateMetadata({params}, parent)` (await params); file conventions all current: `opengraph-image.tsx` (export alt/size/contentType, default async fn returning `ImageResponse` from `next/og` — flexbox only, no grid, 1200×630 default), `sitemap.ts`, `robots.ts`, `manifest.ts`, `icon.tsx`. New `global-not-found.tsx` for app-wide 404.
- **next/image:** `priority` is DEPRECATED → use `preload`; `onLoadingComplete` → `onLoad`. Keep `fill` + `sizes` pairing, `placeholder="blur"`.
- **next/font:** `next/font/google` + `next/font/local`, auto self-hosted (zero Google requests), variable fonts need no weight; central `styles/fonts.ts` or `lib/fonts.ts` exporting instances.
- **View Transitions:** still experimental — `experimental.viewTransition: true`, then `import { ViewTransition } from 'react'`; `<Link transitionTypes={[...]}>` supported. Treat as progressive enhancement only.
- **Removed in 16:** `next lint` command (use ESLint CLI directly), `eslint`/`amp` config options.

## Tailwind CSS 4.3 — the facts

- **No `tailwind.config.js`.** CSS-first: `@import "tailwindcss";` then tokens in `@theme { }`. Never write `@tailwind base/components/utilities` or `theme.extend` — v3 relics.
- **`@theme` namespaces → utilities:** `--color-*`→bg/text/border-*, `--font-*`→font-*, `--text-*`→text-* sizes, `--spacing` (single multiplier, default 0.25rem), `--radius-*`, `--shadow-*`, `--ease-*`→ease-*, `--animate-*`→animate-* (keyframes may live inside `@theme`), `--breakpoint-*`, `--container-*`, `--tracking-*`, `--leading-*`.
- **`@theme inline { --color-background: var(--background); }`** — use `inline` whenever a token references another CSS variable (the shadcn bridge pattern).
- **Dark mode:** `dark:` is media-query-based BY DEFAULT. For class strategy add `@custom-variant dark (&:where(.dark, .dark *));` + next-themes: `<html suppressHydrationWarning>` + `<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>` (client wrapper).
- **OKLCH is the native color format** — default palette and all custom tokens: `--color-accent: oklch(0.72 0.11 178)`.
- **Container queries in core** — `@container`, `@sm:`, `@max-md:`, named containers. No plugin.

## CSS scroll-driven animations — the facts (verified MDN + caniuse, 2026-07-22)

- **`animation-timeline: scroll()` / `view()`** + `@property` typed custom props (e.g. `--split-position`) = native zero-JS scroll animation, but **progressive enhancement, NOT a default**. NOT Baseline: Chrome/Edge 115+ and Safari 26+ (shipped Sept 2025) unflagged; **Firefox stable still needs `layout.css.scroll-driven-animations.enabled`** (on in Nightly, an Interop 2026 priority — unflagged ship projected ~FF155, not yet landed as of FF152). ~84% global support — Firefox is the gap.
- **Rule:** design so the **no-support state is already the correct static layout** — the animation only enhances it. NEVER gate content visibility on a scroll-driven animation (no `opacity:0`→reveal that stays hidden where unsupported). Wrap any reveal in `@supports (animation-timeline: view())`, default-visible otherwise; always pair with `prefers-reduced-motion`.

## CSS platform features — verified Baseline (checked 2026-07-23)

Verified live during the 2026-07-23 skill expansion. The Baseline-2026 ones are safe defaults with graceful degradation; the flagged ones stay progressive enhancement.

- **CSS Anchor Positioning** (`anchor-name`/`position-anchor`/`position-area`/`position-try`) — **Baseline 2026** (Chrome 125+, Safari 18.2+, Firefox 132+). Powers `overlays`; pair with the Popover API + `@starting-style`. Older engines: give a static fallback position.
- **Popover API** (`popover`, `popovertarget`, top-layer, `::backdrop`, light-dismiss) — widely available. For a true focus-trapping modal use `<dialog>.showModal()` + `inert`, NOT `popover="manual"` (manual popovers trap nothing).
- **`:user-valid` / `:user-invalid`** — **Baseline 2026**; style validity only after interaction (kills the premature red-border-on-load bug). Used by `forms`.
- **`field-sizing: content`** — **Baseline 2026** (Firefox 152, Safari 26.2 Dec 2025) — native auto-growing textareas; delete the JS resize handler.
- **`text-wrap: balance` / `pretty`** — widely available; `balance` for headlines, `pretty` for body (widow/orphan fix, strong for German compounds).
- **Container queries** (`@container`, size + style) — Tailwind v4 core, no plugin. The default responsive contract for reusable components (`cards`, `component-api`).
- **`content-visibility: auto`** (+ `contain-intrinsic-size` to avoid CLS) — skip offscreen render work on long pages; never on the LCP element or sticky/showpiece sections.
- **`@scope`** — scoped token re-mapping for `theme-worlds`; give a `data-world` attribute-selector fallback where unsupported.
- **`text-box-trim` / `text-box-edge`** — Chrome/Edge/Safari ship it, **Firefox does not (2026-07)**; degradation is graceful (normal leading), safe to adopt.
- **Speculation Rules API** (`<script type="speculationrules">`) — instant same-origin prerender/prefetch beyond `next/link`; use MODERATE eagerness (on hover/viewport), never eager-prerender-everything (wasted work + analytics skew).

## Analytics & compliance defaults (added 2026-07-23)

- **Default analytics = EU-hosted & cookieless** (Plausible, Fathom, or self-hosted Umami on the already-locked Postgres) — NOT Google Analytics 4 by default. GA4's US data transfers were ruled unlawful by the Austrian DSB and France's CNIL (2022); a cookieless EU-hosted tool needs no consent banner and is not a compliance landmine for a DACH studio. GA4 or any non-essential tracking loads ONLY behind the `consent` banner (TTDSG §25 / now TDDDG). Related DACH-legal skills: `consent`, `sitemap` (Impressum/Datenschutz), `pricing` (PAngV/Grundpreis), `gate-accessibility` (BFSG), `email` (double-opt-in), `seo` (AI-crawler/TDM opt-out).

## shadcn/ui CLI 4 — the facts

- `npx shadcn@latest init` / `add <component>` (the package `shadcn-ui` is long dead). Current default style lineage: "default" → deprecated (Feb 2025) → "new-york" → docs now show "base-nova"; `init` flags: `-t next`, `-b base|radix`, `--css-variables` (default true), `--rtl`.
- components.json for Tailwind v4: `"tailwind": { "config": "" }` (blank), css points at globals.css, `"iconLibrary": "lucide"`.
- React 19: **no `forwardRef`**; every primitive has `data-slot="..."` — target sub-parts via `data-[slot=...]`/`[&_[data-slot=...]]`.
- Theme tokens are FULL oklch values in `:root`/`.dark` bridged via `@theme inline` — never the legacy bare-HSL-triplet + `hsl(var(--x))` pattern.
- `toast` deprecated → **sonner**.

## Motion 12 (motion.dev) — the facts

- Package `motion`, import `from "motion/react"` (`framer-motion` = legacy alias, same versions). Any file using it needs `"use client"`.
- APIs: `motion.div`, `AnimatePresence`, `useScroll` (→ scrollYProgress motion value), `useSpring`, `useTransform`, `layout` prop, `whileHover/whileTap/whileInView`.
- Bundle discipline: `import { LazyMotion, domAnimation, m } from "motion/react"`; wrap once, use `m.div`. `domAnimation` (+15kb) = variants/exit/hover/tap; `domMax` (+25kb) adds drag + layout animations. With LazyMotion strict, `motion.` components throw — use `m.`.

## anime.js 4 — the facts (DIRECTION-gated)

MIT (the v4 sponsorware period is over). `motion` remains THE animation library; anime.js is the one specialist engine, installed in Phase 9 only when design/DIRECTION.md commissions an SVG-choreography moment BY NAME — `animejs` owns that gate, `motion-language` owns the engine-ownership table. Everything below was verified against the installed 4.5.0 tarball (runtime export enumeration, source reads, DOM-less Node execution, esbuild+gzip measurement).

- **No default export.** `import anime from 'animejs'` (the v3 idiom) is dead — 67 named exports, zero `default`; the #1 migration break. Named ESM from the root barrel: `import { animate, createTimeline, createScope, stagger, svg, text, utils, onScroll, spring, cubicBezier, eases } from "animejs"`. `svg`/`utils`/`text`/`waapi`/`eases` are namespace objects at the root, so `svg.createDrawable(...)` and a direct `import { createDrawable }` both work. **Never `import * as anime`** — that is the whole 43 KB barrel.
- **Tree-shaking from the barrel is already near-perfect** — measured `from "animejs"` at 12717 B gzip vs `from "animejs/animation"` at 12692 B, a 25-byte delta. Subpath imports are allowed, never required; the docs oversell them.
- **Measured gzip cost — the canonical table.** esbuild `--bundle --minify --format=esm` per entry point, `gzip -c | wc -c`. Byte figures for this engine live HERE and nowhere else; every other skill cites "per STACK.md".

| Entry point | gzip |
|---|---|
| `animate` — core tween engine | **12.7 KB** |
| `+ createTimeline` | +1.3 KB (14.0 total) |
| `+ createScope + stagger` | 15.2 KB total |
| `svg` — createDrawable/morphTo/createMotionPath | 2.2 KB (cheapest module) |
| `text` — splitText/scrambleText | 3.7 KB |
| `onScroll` — events/ScrollObserver | 17.1 KB standalone |
| `createDraggable` | 20.3 KB (heaviest — NOT used) |
| `waapi.animate` — WAAPI adapter, off main thread | 4.8 KB |
| whole barrel (`import * as`) | 43 KB |

**Canonical budget line other skills cite verbatim: a commissioned SVG-timeline moment costs ~19 KB gzip (`animate` + `createTimeline` + `createScope` + `stagger` + `svg`); scroll-scrubbing it (`onScroll`) takes it to ~23 KB.** Both are sums of the measured deltas above — record the real number from the bundle audit in design/QA.md.

- **React/Next:** `"use client"` leaf → `createScope({ root })` inside `useEffect`, where `root` is the ref **OBJECT, not `root.current`** (`ScopeParams.root` is typed `DOMTargetSelector | ReactRef | AngularRef`; passing `.current` silently loses scoping). Selectors inside the scope auto-scope to the subtree. `self.add('name', fn)` registers a method callable later as `scope.current.methods.name(...)` — drive animation from handlers/state without re-running the effect. Cleanup is `scope.current?.revert()` — optional chaining, because StrictMode double-invokes.
- **SSR:** the top-level `import` is SAFE (verified in DOM-less Node) — no `dynamic(..., { ssr: false })` needed merely to import. But `animate()`, `createDraggable()`, `splitText()` and `onScroll()` all THROW without a DOM: every call stays inside `useEffect`, never module scope, render, or a Server Component. `createTimer({ autoplay: false })` and `createScope({})` are DOM-free.
- **Easing — the trap that silently breaks a token mirror.** `ease: 'cubicBezier(.17,.67,.83,.67)'` **as a STRING falls back to LINEAR** with only a `console.warn` (`deprecated = ['steps(', 'irregular(', 'linear(', 'cubicBezier(']`, easings/eases/parser.js:166; verified `parseEase` returns identity). Import the constructor and pass the function: `ease: cubicBezier(...ease.out)`. Worse: unknown ease names (`'spring'`, `'spring(1,80,10,0)'`, any typo) fall back to linear with **NO warning at all** — validate against `Object.keys(eases)`. Named and parameterized string forms DO work: `'outExpo'`, `'out(4)'`, `'inOut(3)'`, `'outBack(2)'` (45 names). Never sample an ease at t=0.5 to test it — every inOut is legitimately 0.5 there; sample 0.25/0.75.
- **`spring({ bounce: .7 })` returns an OBJECT**, not a bare function — it carries `.ease` plus a computed `.duration` (628ms for that call) that **OVERRIDES the tween's `duration`**. Setting both is a silent conflict. `createSpring()` is deprecated → `spring()`.
- **Durations are milliseconds** (motion/react uses seconds). Convert once in the `lib/motion.ts` mirror (`animeDur`/`animeEase` — the values are `motion-language`'s, appended to the mirror by `animejs` in Phase 9, since the `cubicBezier` import cannot resolve before the install) — never inline a raw number in a component.
- **`onScroll`'s default `sync` is the string `'play pause'`** (events/scroll.js:374) — threshold-triggered playback, NOT scrubbing. Scrubbing requires `sync: true` (or `'linear'`); `sync: <number>` e.g. `.25` smooths/lags the progress; any easing param remaps it. Method-strings are invoked blindly as `linked[m]()`, so a typo'd method is a silent no-op, not an error. Attach it as a timeline's autoplay — `createTimeline({ autoplay: onScroll({ target, sync: true }) })` (`autoplay?: boolean | ScrollObserver`, types/index.d.ts). `enter`/`leave` take `'bottom top'`-style edge pairs read `'<container-edge> <target-edge>'`, defaults `'end start'`/`'start end'` (scroll.js:551-552); `debug: true` draws the threshold markers.
- **`splitText`'s `accessible` defaults to TRUE** (`this.accessible = setValue(accessible, true)`, text/split.js:230) — it prepends a visually-hidden mirror of the original string, so the defect to grep for is `accessible: false`, which shreds screen-reader text. It rewrites the element's `innerHTML` and installs a **ResizeObserver** that auto re-splits lines on resize; always `.revert()` (scope cleanup does it) or you leak observers and mangled markup.
- **`createDraggable` is NOT used.** Drag and gestures stay with motion (`domMax`) — two drag systems is fragmentation, and it is the single heaviest module.
- **No reduced-motion support exists.** Verified by grepping the entire shipped dist: zero matches for `prefers-reduced-motion`, zero for `reducedMotion`. Any claim that v4 honors the preference is false — the consumer implements it. Scope's `mediaQueries` is the real feature to build on; it stores a `MediaQueryList` per entry, exposes booleans on `self.matches`, and re-runs the scope on `change`, so toggling the OS setting live is handled:

```ts
// components/roast-curve.tsx — "use client" leaf, inside useEffect
createScope({ root, mediaQueries: { reduceMotion: "(prefers-reduced-motion: reduce)" } })
  .add((self) => {
    if (self.matches.reduceMotion) { utils.set(svg.createDrawable(".curve"), { draw: "0 1" }); return; } // final DRAWN state
    animate(svg.createDrawable(".curve"), { draw: ["0 0", "0 1"], ease: animeEase.out, duration: animeDur.section });
  });
```

The reduce branch lands the FINAL state — a path left at full dashoffset under `reduce` is invisible content, not calm motion. **`draw` is not an SVG attribute; it exists only on the `svg.createDrawable()` proxy**, which intercepts `setAttribute('draw', …)` and writes `stroke-dasharray`/`stroke-dashoffset` (svg/drawable.js:57). `utils.set` needs the proxy too — verified on 4.5.0: a raw selector leaves `stroke-dashoffset` `null` and writes an inert `draw="0 1"` attribute, the drawable writes dashoffset `0`.

- **Types are bundled** (`dist/modules/index.d.ts`). **`@types/animejs` is the v3 package — never install it**; it shadows and fights the real types.
- `animejs/adapters/three` (new in 4.5.0) needs the optional `three` peer dep and is marked `sideEffects` in package.json — not tree-shakeable once imported. Unused here; `showpiece` owns 3D.

## Rejected animation engines

Argued once here; every other skill cites "per STACK.md" instead of re-litigating.

- **GSAP** — free for every use since the Webflow acquisition, so licensing is not the objection. It duplicates anime.js's territory at roughly 3× the weight, and its stock effects are the most-copied on the web — an anti-slop liability under `taste`. `award-canon`'s ladder names anime.js where it used to name GSAP ScrollTrigger. (CANON.md's GSAP references are historical facts about real award-winning sites and stay untouched.)
- **Theatre.js** — an authoring GUI plus a runtime; the studio workflow buys nothing a DIRECTION-commissioned timeline written in code doesn't already have, and adds a second source of truth for motion numbers.
- **react-spring** — duplicates motion's springs exactly. One spring system.
- **Rough Notation** — a fourth animation runtime for one hand-drawn-annotation effect. Codified as a named `animejs` move instead.

## Backend — the facts

- **Auth: Better Auth 1.6.23 is the default for new projects.** Auth.js/NextAuth entered maintenance mode 2025-09-22 (Better Auth team maintains it, security patches only; they officially recommend Better Auth for greenfield). NextAuth v5 never left beta. Legacy NextAuth v5 pattern if ever needed: `auth.ts` → `export const { auth, handlers } = NextAuth({...})`, route `app/api/auth/[...nextauth]/route.ts` re-exporting handlers, `proxy.ts` re-exporting `auth`.
- **Drizzle + Neon:** `import { neon } from '@neondatabase/serverless'; import { drizzle } from 'drizzle-orm/neon-http'; const db = drizzle({ client: neon(process.env.DATABASE_URL!) })`. `drizzle.config.ts`: `defineConfig({ schema, out, dialect: 'postgresql', dbCredentials: { url } })` — `dialect` mandatory; commands are `drizzle-kit generate` / `migrate` / `push` (old `generate:pg` is dead). npm latest 0.45.x vs docs installing `@rc` (1.0-rc) — pin deliberately, note the choice.
- **Zod 4:** error customization is `{ error: "Too short" }` — the `message` param is deprecated. `.strict()`/`.passthrough()` → `z.strictObject()`/`z.looseObject()`. Pre-2025 tutorial code is v3-flavored. Check ecosystem peerDeps accept zod ^4.
- **Resend 6:** returns `{ data, error }` — NO throw on API errors, check `error` explicitly. React Email component goes in the `react` property. Templates from `@react-email/components`; `react-email` dev server for preview.
- **Stripe 22:** webhook route handler MUST use raw body: `const body = await req.text()` + `req.headers.get('stripe-signature')` → `stripe.webhooks.constructEvent(body, sig, secret)`. Omit `apiVersion` to use the SDK's pinned version. Lazy-instantiate the client so builds don't fail without the key.
- **Content:** Contentlayer is DEAD — never recommend it. Options: plain `@next/mdx` (requires root `mdx-components.tsx` exporting `useMDXComponents` — forgetting it is the #1 setup error; `pageExtensions` must include md/mdx), **content-collections**, or **velite** for typed content collections.

## Shiki — the facts

Syntax highlighting for MDX prose and for standalone marketing code snippets (dev-tool hero/feature sections) — `content-cms` owns the component. Verified against installed 4.3.1: export enumeration + a real `codeToHtml` render.

- **RSC / build-time only — never a client-side highlighter.** `import { codeToHtml } from "shiki"` and await it in a Server Component, or wire `@shikijs/rehype` into the MDX pipeline. Either way the highlighted markup ships static: zero client JS, zero flash of unhighlighted code. Shipping a highlighter to the browser to color text that never changes is the defect.
- **Dual light/dark via the CSS-variables theme, not two rendered trees.** `codeToHtml(src, { lang, themes: { light, dark }, defaultColor: false })` emits one tree whose tokens carry `--shiki-light`/`--shiki-dark` (plus `-bg`) custom properties; the `.dark` selector picks which one wins. Win that swap with `@layer` order, not the `!important` the docs reach for — `gate-code` asserts zero `!important` in the emitted CSS. **Map both to the site's own OKLCH tokens — a stock VS Code theme is a tell** (Dracula on a luxury-serif site announces the template).
- **`@shikijs/transformers`** supplies the notation comments so diff/highlight/focus markup comes from the source, not hand-written spans: `transformerNotationDiff`, `transformerNotationHighlight`, `transformerNotationWordHighlight`, `transformerNotationFocus`, `transformerNotationErrorLevel`, `transformerMetaHighlight`, `transformerRenderWhitespace` (19 exports total).
- **Bundle discipline:** `shiki` (full bundle) carries every grammar and theme; prefer `shiki/bundle/web` or `createHighlighterCore` from `shiki/core` with explicit language/theme imports. It runs at build time, but a fat barrel still taxes the build.
- The copy-to-clipboard button is the ONE tiny client leaf wrapped around the server-rendered block.

## Unverified (do not assert)

Minimum Node version for Next 16 · `updateTag`/`refresh` cache APIs · `tw-animate-css` as shadcn's scaffolded animation lib · exact lucide dynamic-import subpath for web.
