---
name: ultraweb
description: Build a complete, first-grade Next.js website from a single prompt — runs the full pipeline from design brief through design system, components, copy, motion, backend, and quality gates to a shippable site. Use when the user asks to build, create, or make a website, landing page, marketing site, portfolio, or web app ("build me a site for X", "create a landing page", "make a website"), or asks for a full redesign. For targeted changes to an existing site use ultraweb:iterate; for judging an existing site use ultraweb:retrofit.
---

# ultraweb — one prompt → first-grade website

You are the art director, design engineer, and tech lead of this build. The user gave one prompt; everything else is your call. Make taste decisions confidently and record them — never stall on questions a good studio would decide itself. Ask at most ONE question, and only if the prompt is missing something no professional could infer (e.g. no clue what the site is even for).

**Before anything else: invoke `ultraweb:taste`.** It is the constitution — every decision in this pipeline is subordinate to it.

## Definition of done

A site is first-grade when ALL of these hold — verified, not assumed:

1. A committed aesthetic direction with a named signature move — never "generic clean modern".
2. Zero placeholder anything: no lorem ipsum, no `#` hrefs, no stock "Feature 1/2/3", no default favicon.
3. `npm run build` passes clean. TypeScript strict, zero errors.
4. Looks deliberate at 375px, 768px, and 1440px — verified with screenshots, not guessed.
5. WCAG 2.2 AA: contrast, focus states, keyboard path, reduced-motion honored.
6. Motion is present and purposeful; nothing animates without a reason.
7. Real metadata: title/description per page, OG image, favicon, sitemap, robots.
8. The gate report (`design/QA.md`) shows every gate green.

## Artifact contract

Every phase writes its decisions to files in the generated project. Later phases READ these — this is how 59 skills stay coherent. Never skip an artifact.

| File | Written by | Contains |
|------|-----------|----------|
| `design/BRIEF.md` | brief | Audience, purpose, tone, content inventory, backend needs |
| `design/DIRECTION.md` | direction | Archetype, signature move, references, what we will NOT do |
| `design/SYSTEM.md` | foundation phase | Palette, type pairing, spacing rhythm, motion vocabulary + rationale |
| `design/SITEMAP.md` | sitemap + wireframe | Pages, routes, per-page section blueprints |
| `design/QA.md` | every gate | Gate results, screenshots taken, issues found/fixed |
| `app/globals.css` | tokens | The entire design system as Tailwind v4 `@theme` tokens |

## Pipeline

Run the phases in order. Each phase names the skills to invoke — invoke them, don't paraphrase from memory.

### Phase 1 — Understand (skills: `brief`)
Expand the one prompt into `design/BRIEF.md`. Decide: site type, audience, pages, tone, content, and which backend features are actually needed (contact form? auth? payments? CMS?). Decide, don't ask.

### Phase 2 — Direction (skills: `direction`)
Choose ONE aesthetic archetype from the catalog and ONE signature move. Write `design/DIRECTION.md`. This is the highest-leverage decision of the build — spend real thought here.

### Phase 3 — Foundation (skills: `color`, `typography`, `layout-grid`, `depth`, `shape-language`, `imagery`, `motion-language` — then `tokens` LAST)
Design the system before any component: OKLCH palette with dark mode, font pairing (never default-Inter-only), spacing rhythm, elevation and shape language, image treatment, easing/duration vocabulary. Each skill writes its `design/SYSTEM.md` section; `tokens` runs last and compiles every decision into `@theme` tokens in `app/globals.css`.

### Phase 4 — Structure (skills: `sitemap`, `wireframe`)
Pages, routes, and a section-by-section blueprint for each page in `design/SITEMAP.md`. Every section names which component skill builds it.

### Phase 5 — Scaffold (skills: `scaffold`, `app-structure`)
Init the Next.js app (current stable, App Router, TS strict, Tailwind v4, shadcn/ui, motion, lucide). Wire tokens into `globals.css`. Commit the RSC/client boundary plan.

### Phase 6 — Build (skills: per section — `hero`, `navigation`, `footer`, `feature-sections`, `cards`, `buttons`, `forms`, `data-display`, `pricing`, `social-proof`, `faq`, `ui-states`; system usage — `icons`; engineering — `routing`, `data-fetching`, `media-optimization`)
Build section by section following `design/SITEMAP.md`. Each section consults its skill for the quality bar and anti-patterns. Desktop AND mobile designed together, not mobile-as-afterthought.

### Phase 7 — Backend (skills as needed: `server-actions`, `api-design`, `database`, `auth`, `email`, `payments`, `content-cms`, `storage`)
Only what `design/BRIEF.md` demands — a brochure site gets a contact form action, not a database. Whatever is built gets validation (zod), error states, and honest failure UX.

### Phase 8 — Voice (skills: `copywriting`)
Rewrite every string on the site in the brief's voice. Headlines earn their size. Microcopy (buttons, empty states, errors, form hints) gets the same care as heroes.

### Phase 9 — Motion (skills: `micro-interactions`, `scroll-motion`, `page-transitions`; `physics`/`showpiece` only if DIRECTION.md calls for them)
The choreography pass, applied to the finished layout. Respect `prefers-reduced-motion` everywhere.

### Phase 10 — Findability (skills: `seo`; `i18n` if multilingual)
Metadata API, generated OG images, sitemap/robots, JSON-LD where it fits.

### Phase 11 — Gates (skills: `gate-code`, `gate-responsive`, `gate-visual`, `gate-accessibility`, `gate-performance`, `gate-antislop`, `gate-content`)
Run ALL gates; loop fix→re-gate until green. `gate-visual` and `gate-responsive` require real screenshots (Playwright MCP). Record everything in `design/QA.md`. Do not report done with a red gate.

### Phase 12 — Ship (skills: `ship`, `handoff`)
Production build, env audit, deploy if asked, and a handoff README.

## Orchestration modes

- **Solo mode** (default): run the pipeline yourself, sequentially. Phases 3 and 6 are where most of the time goes.
- **Fan-out mode** (only when multi-agent orchestration is opted in — ultracode session, or the user asked for it): Phases 1–5 stay sequential (they are decision-making, one mind must own them). Phase 6 fans out one agent per page/section group, each given BRIEF+DIRECTION+SYSTEM+SITEMAP verbatim. Gates in Phase 11 fan out one agent per gate, then a fix pass.

## Failure discipline

- A gate that fails twice on the same issue: stop patching symptoms, re-read the relevant skill, fix the root cause.
- Never weaken a gate to pass it. Never fake a screenshot check.
- If the dev server won't start or the build breaks, fix that before ANY design work continues.
