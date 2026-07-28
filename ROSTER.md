# ultraweb skill roster

The complete map of the harness. 72 skills: 1 orchestrator (root `SKILL.md`) + 71 specialist skills in `skills/<name>/SKILL.md`. Every skill reads `design/*` artifacts produced upstream and serves the pipeline defined in the root skill. `taste` is the constitution; every skill defers to it.

Format: **name** — scope. *(reads → writes)*

Most skills close with a **Worked example** traced from a shared bank of eight recurring clients — Kaffeewerk Ost (roastery e-commerce), Tidepool (B2B SaaS), Studio Norra (agency portfolio), Casa Verde (restaurant, EN/PT), Ledger & Lane (law firm), Framewalk (game studio), Aldermoor Trust (foundation), Loop & Thread (textiles shop). Skills sharing a client agree on its canonical palette, type, and routes, so reading two related skills shows the same project from both sides of the handoff.

## Tier 0 — Core
- **taste** — the design constitution: first-grade bar, banned list, required list, heuristics, stack lock. *(— → judgment)*
- **iterate** — targeted revision pipeline for an existing ultraweb site: locate the design/* artifacts, scope the change, touch only affected phases, re-run only affected gates. *(design/* → changed code + QA.md)*
- **award-canon** — the study library: 25 named patterns + per-site bank distilled from Awwwards Site-of-the-Year/SOTD-tier winners 2017-2026; direction consults it for references, design-judge scores against its invariants. *(— → judgment + reference)*

## Tier 1 — Discovery
- **brief** — expand one prompt into a full creative brief: site type, audience, goals, tone words, page list, content inventory, backend needs. Decides, never interviews. *(user prompt → design/BRIEF.md)*
- **direction** — choose ONE aesthetic archetype from a catalog of 12 named directions (each with type/color/motion stance, when-to-use, signature-move ideas) + ONE signature move + an explicit "we will not" list. *(BRIEF.md → design/DIRECTION.md)*
- **sitemap** — information architecture: pages, routes, nav structure, per-page purpose and conversion goal. *(BRIEF.md → design/SITEMAP.md part 1)*
- **wireframe** — section-by-section blueprint per page: section order, which component skill builds each, content density, where the signature move lives. *(BRIEF+DIRECTION+SITEMAP → design/SITEMAP.md part 2)*
- **copywriting** — voice definition and every string on the site: headlines that earn their size, microcopy, CTAs, error/empty text. Bans dead startup copy. *(BRIEF+DIRECTION → copy in code)*

## Tier 2 — Design system
- **tokens** — the entire system as Tailwind v4 `@theme` tokens in app/globals.css: color, font, spacing, radius, shadow, easing, animation tokens; semantic naming; dark-mode variables. The single source all components consume. *(SYSTEM.md decisions → app/globals.css)*
- **color** — OKLCH palette construction: tinted neutral ramp, accent selection, semantic roles, dark theme re-decision, AA contrast math (verify, don't eyeball). *(DIRECTION.md → SYSTEM.md §color)*
- **typography** — font pairing from a curated library (display/body combos per archetype), fluid type scale via clamp(), weight/tracking/leading rules, next/font self-hosting. *(DIRECTION.md → SYSTEM.md §type)*
- **layout-grid** — page grid, container widths, spacing rhythm with compression/release, deliberate asymmetry patterns, bento/split/offset layouts. *(DIRECTION.md → SYSTEM.md §layout)*
- **depth** — elevation language: shadow scale (tinted, not gray), borders vs shadows, layering, glass done right (rare, justified). *(DIRECTION.md → SYSTEM.md §depth)*
- **shape-language** — radius scale and shape motifs: corner language consistency, decorative geometry, dividers, clip-paths, SVG accents. *(DIRECTION.md → SYSTEM.md §shape)*
- **icons** — icon system: lucide-react as default, stroke-width consistency, sizing scale, when custom SVG beats a library icon, never emoji. *(SYSTEM.md → icon usage in code)*
- **imagery** — art direction for images: photo treatment (duotone/grain/overlay), gradient meshes, noise textures, SVG patterns, honest placeholder strategy (generated, on-brand — never gray boxes or stock-photo-cliché). *(DIRECTION.md → SYSTEM.md §imagery + assets)*
- **motion-language** — the motion vocabulary: duration/easing token set, choreography rules (what animates, in what order, what never animates), reduced-motion policy. *(DIRECTION.md → SYSTEM.md §motion)*
- **theme-worlds** — scoped multi-theme "worlds" beyond light/dark: per-route or per-case-study accent worlds via native CSS `@scope` + `data-world`/`data-mode` token re-mapping (no ThemeProvider); every world AA-verified, dark mode re-decided per world. *(DIRECTION.md → scoped @theme overrides)*

## Tier 3 — Components (each: quality bar, 3+ named layout variants, anti-patterns, states, a11y notes)
- **hero** — first-viewport sections: variants (typographic, split, full-bleed media, product-shot, editorial), headline scale, CTA hierarchy, above-fold performance. *(DIRECTION+SYSTEM+SITEMAP → components/sections/hero.tsx)*
- **navigation** — headers and mobile menus: sticky/scroll behavior, mobile menu as designed moment, active states, mega-menu when warranted, skip-link. *(SYSTEM → components/layout/header.tsx)*
- **footer** — footers as a designed closing statement, not a link dump: variants, sitemap/legal/social organization, newsletter row. *(SYSTEM → components/layout/footer.tsx)*
- **feature-sections** — the anti-three-cards skill: alternating splits, bento grids, sticky-scroll showcases, numbered editorial lists, tabbed showcases; when each fits. *(SITEMAP → components/sections/*)*
- **cards** — card design: hierarchy inside the card, hover behavior, image handling, group layouts that avoid uniformity. *(SYSTEM → components/ui extensions)*
- **buttons** — CTA system: primary/secondary/ghost hierarchy, sizing, icon placement, hover/active/focus/loading states, one primary per view. *(SYSTEM → components/ui/button variants)*
- **forms** — form UX: field design, labels always, inline validation timing, error recovery, multi-step patterns, success states. Pairs with server-actions. *(SYSTEM → form components)*
- **data-display** — tables, stat blocks, charts: alignment rules, tabular numerals, responsive table strategies, chart color/tooltip discipline. *(SYSTEM → data components)*
- **pricing** — pricing sections: tier tables, highlight discipline (one featured plan), billing toggles, comparison rows, honest feature lists. *(BRIEF+SYSTEM → pricing section)*
- **social-proof** — testimonials, logo walls, stats, case-study teasers: credibility design, avoiding fake-looking proof, marquee dos/don'ts. *(BRIEF+SYSTEM → proof sections)*
- **faq** — FAQ/accordion sections: native details vs JS accordion, typography, schema.org FAQ markup. *(SYSTEM → faq section)*
- **ui-states** — empty, loading, error, success, skeleton states: every async surface gets all states designed; skeletons match real layout. *(SYSTEM → state components)*
- **component-api** — the cross-cutting contract every component skill honors: the `variant`/`size`/`tone` prop vocabulary, `asChild`/Slot composition, `cn()` merge order, `data-slot` parts, controlled/uncontrolled parity — so the UI reads as authored, not assembled from ten prop dialects. *(SYSTEM → component prop conventions)*
- **overlays** — the native overlay layer: HTML Popover API + CSS Anchor Positioning (Baseline 2026) for menus/tooltips/comboboxes/popovers, retiring z-index wars, portals, and JS focus-trap libs; `<dialog>` for true modals. *(SYSTEM → overlay primitives)*
- **cart** — cart / mini-cart state and UI: the in-place add-to-cart moment, slide-drawer vs page, honest gross totals, one anti-three-cards cross-sell slot, a designed empty cart, optimistic server actions. *(BRIEF+SYSTEM → cart layer)*
- **product-detail** — the Product Detail Page: swatch-driven variant crossfade with URL state, media gallery, buy-box hierarchy (one CTA), mobile sticky buy-box; WebGL-free by default. *(BRIEF+SYSTEM → product page)*
- **command-palette** — the ⌘K command-palette / on-site-search composite: keyboard trigger + visible affordance, combobox ARIA, focus-trap, ranked/grouped results, an accelerator layered over real nav (never the only path). *(SYSTEM → search/command layer)*
- **marginalia** — print-derived page furniture for long-form: running folio, reading-progress, sticky TOC rail, Tufte-style sidenote gutters, marginal pull-quotes; long-form pages only, degrades to inline at 375px. *(SYSTEM → long-form furniture)*

## Tier 4 — Motion & interaction
- **micro-interactions** — hover/focus/press feedback, link underline animations, input focus, toggle physics: 150–250ms, transform/opacity only. *(SYSTEM §motion → component-level motion)*
- **scroll-motion** — scroll-driven reveals, parallax discipline, sticky sequences, scroll-linked progress; IntersectionObserver/`useScroll`; once-only reveals. *(SYSTEM §motion → section entrance layer)*
- **page-transitions** — route transition strategy: View Transitions API/next-view-transitions, template.tsx animations, shared-element continuity, when NOT to transition. *(SYSTEM §motion → app-level transitions)*
- **physics** — spring-based interaction: drag, magnetic hover, cursor followers, gesture response via motion springs; restraint rules. *(DIRECTION → interactive moments)*
- **showpiece** — hero-grade set pieces: canvas/WebGL/R3F, shader gradients, particle systems, 3D product views. Gated: only when DIRECTION demands, 60fps verified, static fallback + reduced-motion path mandatory. *(DIRECTION → one signature element)*
- **animejs** — anime.js v4 as the SVG-choreography engine: multi-path draw timelines, morphs, motion paths, grid stagger fields, split-text and scroll-scrubbed sequences. Gated: installed only when DIRECTION.md commissions the moment by name; motion/react keeps component lifecycle, gestures, and route transitions. *(DIRECTION.md → commissioned SVG moments)*
- **hidden-craft** — the opt-in last-2% reward layer that signals human authorship: a tasteful console signature, one keyboard/view-source egg, a playful on-brand 404, `humans.txt`; hard discipline — never gates content, zero LCP cost, ONE gesture per site. *(SYSTEM → easter-egg layer)*

## Tier 5 — Next.js engineering
- **scaffold** — project init: create-next-app current flags, Tailwind v4 wiring, shadcn init, motion/lucide/zod install, strict tsconfig, folder conventions, globals.css token skeleton, dev-server smoke test. *(SITEMAP → running app)*
- **app-structure** — App Router architecture: RSC-by-default, 'use client' boundary placement (leaves, not layouts), layout vs template, component organization, composition patterns that keep client bundles small. *(SITEMAP → app/ structure + design/SITEMAP.md part 3 boundary plan)*
- **routing** — route design: route groups, dynamic segments, parallel/intercepting routes (modals), loading.tsx/error.tsx/not-found.tsx per segment — all designed, not default. *(SITEMAP → app/ routes)*
- **data-fetching** — server-side data: fetch caching semantics (current defaults), revalidation, streaming with Suspense, parallel fetching, when to use route handlers vs direct calls. *(BRIEF → data layer)*
- **server-actions** — mutations: 'use server' actions with zod validation, useActionState form wiring, optimistic updates, error returns as data, progressive enhancement. *(forms → app/actions/*)*
- **media-optimization** — next/image (sizes, preload, placeholder), next/font pipeline, video embedding, asset strategy, LCP protection. *(imagery → optimized assets)*
- **seo** — Metadata API per route, generateMetadata, ImageResponse OG images, sitemap.ts/robots.ts, JSON-LD structured data, canonical/i18n alternates. *(BRIEF+copy → metadata layer)*
- **i18n** — internationalization when the brief needs it: locale routing strategy, dictionary pattern, hreflang, date/number formatting, RTL awareness. *(BRIEF → i18n layer)*
- **print-craft** — the print stylesheet (`@media print`) as a designed surface: chrome-hiding reset, page-break control, `@page` margins, ink economy; a real DACH angle for print-to-PDF Impressum/AGB/Datenschutz and invoices. *(SYSTEM → print layer)*

## Tier 6 — Backend
- **api-design** — route handlers: REST shape, typed responses, zod-validated input, error envelope convention, status codes, rate-limit hook points. *(BRIEF → app/api/*)*
- **database** — Drizzle + Postgres: schema design from the brief's nouns, drizzle-kit migrations, Neon/local setup, query patterns in RSC, seed script. *(BRIEF → db/ layer)*
- **auth** — Better Auth setup (the current default; Auth.js is maintenance-mode legacy): server config, providers, proxy.ts route protection, session in RSC, sign-in page that matches the design system (never default unstyled). *(BRIEF → auth layer)*
- **email** — transactional email: Resend + react-email, templates that match site branding, contact-form and magic-link flows, dev preview. *(BRIEF+SYSTEM → emails/)*
- **payments** — Stripe: checkout sessions, webhook route handler with signature verification, product/price modeling, test-mode discipline, success/cancel pages designed. *(BRIEF → payments layer)*
- **content-cms** — content layer: MDX pipeline for blogs/docs (typed frontmatter, styled prose that matches SYSTEM.md — never default prose-gray), when to reach for a headless CMS instead. *(BRIEF → content layer)*
- **storage** — file upload/storage: blob storage setup, upload UX (progress, drag-drop, validation), image handling post-upload. *(BRIEF → storage layer)*
- **consent** — GDPR/TTDSG §25 cookie & tracking consent as an anti-dark-pattern design problem: equal-weight Accept/Reject in the site's own language, a consent-state context gating third-party script injection, a footer "Cookie-Einstellungen" resurface link. *(BRIEF → consent layer)*
- **analytics** — cookieless-first measurement (Plausible / self-hosted Umami): an event taxonomy derived from SITEMAP.md's per-page conversion goals, one typed `track()` helper, instrumented CTAs; cookie-based tools go behind consent, GA4-by-default stays banned. *(BRIEF+SITEMAP → analytics layer)*

## Tier 7 — Quality gates (each: checklist + how to verify empirically + pass criteria + QA.md entry format)
- **gate-code** — build/type/lint gate: npm run build clean, tsc strict, ESLint, no unused deps, RSC boundary correctness, no console errors. *(code → QA.md entry)*
- **gate-responsive** — 375/768/1440 screenshot sweep via Playwright MCP: no overflow, no orphan layouts, touch targets ≥44px, mobile nav works. *(running app → QA.md + screenshots)*
- **gate-visual** — the self-critique loop: screenshot every page, judge against DIRECTION.md + taste with a scored rubric (hierarchy, spacing, type, color, distinctiveness), fix worst issue, repeat ≥2 rounds. *(running app → QA.md)*
- **gate-accessibility** — WCAG 2.2 AA: computed contrast check, keyboard-only walkthrough, focus-visible on everything interactive, landmarks/headings order, alt text, reduced-motion verification. *(running app → QA.md)*
- **gate-performance** — Core Web Vitals: Lighthouse ≥90 perf, LCP element optimized, zero CLS, client bundle audit ('use client' creep, motion import strategy), font loading. *(running app → QA.md)*
- **gate-antislop** — sweep for every banned-list item in taste: grep-able patterns (gradient clichés, emoji, lorem, href="#") + visual clichés from screenshots. Zero tolerance. *(code+screenshots → QA.md)*
- **gate-content** — copy and metadata completeness: every page has real title/description, no dead copy patterns, headings tell a story when read alone, links resolve. *(code → QA.md)*

## Tier 8 — Ship
- **ship** — production readiness: env var audit, build + start smoke test, deploy (Vercel when asked), post-deploy verification of live URL. *(green QA.md → live site)*
- **handoff** — closing docs: README with stack map, how to edit content/tokens, design/* artifacts explained, maintenance notes. *(everything → README.md)*
- **retrofit** — entry point for existing sites: audit any Next.js site against the constitution, produce a scored gap report and a phased upgrade plan mapping each gap to the ultraweb skill that fixes it. *(existing code → design/RETROFIT.md)*

## Subagents (agents/)

Each subagent pins its model tier in frontmatter (`model:`) so delegated work runs on the cheapest model that genuinely handles it — see the root skill's "Delegation & model routing" table for the full policy.

- **design-judge** (`model: opus` — Opus 5, judgment work) — scores screenshots against DIRECTION.md + taste rubric; returns ranked defects. Used by gate-visual.
- **pixel-qa** (`model: sonnet` — Sonnet 5, mechanical sweeps) — drives Playwright MCP: navigates, screenshots at breakpoints, reports console errors and layout breaks. Used by gate-responsive/gate-visual.
- **stack-doctor** (`model: opus` — Opus 5, diagnostic work) — fixes build/dependency/config failures: reads the error, checks current-version docs, repairs without downgrading the stack. Used whenever scaffold or gate-code hits tooling failures.
