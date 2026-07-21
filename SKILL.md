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

## Delegation & model routing

Not every task deserves the lead model. Whenever work is delegated — the bundled subagents, or ad-hoc agents in either mode — route by judgment density, not phase prestige:

| Tier | Model | Work that belongs here |
|------|-------|------------------------|
| Lead | the session's model | Phases 1–5 and 8 (brief, direction, foundation, structure, voice) — the decisions everything downstream obeys; any edit to DIRECTION.md or SYSTEM.md; cross-cutting fix passes after gates |
| Specialist | Opus 4.8 (`model: opus`) | `design-judge` critiques, `stack-doctor` repairs, gate-visual judgment rounds; in fan-out mode: Phase 6 per-section builds, Phase 7 backend modules, Phase 9 motion and Phase 10 findability passes |
| Mechanical | Sonnet 5 (`model: sonnet`) | `pixel-qa` breakpoint sweeps, gate-code build/type/lint runs, gate-antislop pattern sweeps, gate-content link/metadata checks, the measurement halves of gate-responsive / gate-accessibility / gate-performance (screenshots, computed contrast, Lighthouse), artifact-conformance checks |

Rules:
- **Fallback:** anything not named above is Lead work — in solo mode the Lead simply does it; delegation below Lead happens only for rows in this table.
- **Verdicts flow up, never sideways.** A Sonnet agent may report that contrast fails at 3.8:1; deciding which color moves is Lead/Specialist work. Mechanical agents observe and report — they never amend design/* artifacts. Every gate's fix decisions escalate per this rule even when its measurements ran Mechanical.
- The bundled subagents pin their tier in frontmatter (`model:` in agents/*.md). Trust it: don't override upward "to be safe" or downward to save tokens on judgment work.
- This table applies in solo mode too — any agent you spawn ad hoc gets the cheapest tier that genuinely handles it.

## Worked example — one build, traced

Prompt: *"build me a website for a Berlin specialty coffee roastery with an online shop"* (Kaffeewerk Ost — the same client used across the skill files' worked examples).

- **Phase 1** `brief` → BRIEF.md: e-commerce + subscription ("Abo"); audience: specialty buyers who care about origin; tone: sensory, direct, zero fluff; routes `/`, `/shop`, `/shop/[slug]`, `/abo`, `/roasterei`, `/kontakt`; backend needs: Stripe, Drizzle (products/orders/subscriptions), Resend receipts.
- **Phase 2** `direction` → DIRECTION.md: "Warm Workshop" archetype; signature move: the roast-profile temperature curve as a recurring SVG motif; will-not list: dark "premium" template, gradient headlines.
- **Phase 3** foundation → SYSTEM.md, then `tokens` compiles it: warm neutrals `oklch(0.97 0.008 75)` → `oklch(0.24 0.02 60)`, rust accent `oklch(0.62 0.16 45)`, Fraunces + Work Sans, `--animate-curve-draw` for the motif — all as `@theme` tokens in `app/globals.css`.
- **Phases 4–5**: SITEMAP.md blueprints every page section-by-section, naming the skill that builds each (hero: split variant, signature move lives here); `scaffold` pins the current stack and smoke-tests the dev server.
- **Phase 6** builds the sections (this trace assumes fan-out mode was opted in: one Opus 4.8 agent per page, artifacts passed verbatim — in default solo mode the Lead builds the same sections sequentially); **Phase 7** wires Stripe checkout + raw-body webhook, the Drizzle schema, Resend order receipt.
- **Phase 8** `copywriting`: hero headline becomes "Röstung No. 14. Apricot, black tea, honey." — the product is the poetry; no "Elevate your mornings".
- **Phase 11**: `pixel-qa` (Sonnet 5) sweeps 375/768/1440 and catches the `/shop` grid overflowing at 375; `design-judge` (Opus 4.8) scores pages and flags a uniform card row on `/shop`; fixes land via `cards` group-layout rules; re-gate green → QA.md.
- **Phase 12** `ship`: env audit (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `DATABASE_URL`, `RESEND_API_KEY`), build + start smoke test, handoff README.

## Failure discipline

- A gate that fails twice on the same issue: stop patching symptoms, re-read the relevant skill, fix the root cause.
- Never weaken a gate to pass it. Never fake a screenshot check.
- If the dev server won't start or the build breaks, fix that before ANY design work continues.
