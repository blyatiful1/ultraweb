---
name: retrofit
description: Entry point for existing Next.js sites that ultraweb did not build — inventory the codebase and routes, sweep for banned-list patterns, boot the site, screenshot every page at 375/768/1440, score it against the taste constitution via the design-judge rubric, and write design/RETROFIT.md — scored gaps each mapped to the one ultraweb skill that fixes it, phased into quick wins → system fixes → direction change, each phase then executed via ultraweb:iterate. Invoke when the user points at an existing site and asks to "improve", "audit the design", "modernize", "redesign", or "bring it up to standard", or asks "how bad is my site". For building from scratch use the root ultraweb skill; for a scoped change to a site that already has design/* artifacts use ultraweb:iterate directly.
---

# retrofit — diagnose before redesigning

**Stage:** Entry point — before any pipeline phase, for sites ultraweb did not build - **Reads:** existing codebase, running site, taste - **Writes:** design/RETROFIT.md, design/screenshots/retrofit/*, reconstructed design/BRIEF.md + DIRECTION.md

## Standard

A diagnosis a studio would charge for: every gap carries evidence (a screenshot path or a file:line grep hit), a score against the taste rubric, the ONE ultraweb skill that fixes it, and a phase. Scores come from looking at rendered pages — never from reading code alone. Retrofit changes nothing except what is required to boot the app; treatment happens afterward, through ultraweb:iterate, one approved phase at a time.

## Process

1. **Qualify the patient.** Read package.json and the tree. Next.js App Router → proceed. Pages Router, CRA, or another framework → say so and stop; retrofit audits, it doesn't port. Offer a fresh `ultraweb` build as the alternative.
2. **Inventory.** Routes (every `app/**/page.tsx`), components, styling entry (`@theme` in app/globals.css vs `tailwind.config.js` — the config file marks Tailwind v3), and deps of record: next major, `framer-motion` vs `motion`, zod major, `middleware.ts` (pre-Next-16 signal) vs `proxy.ts`.
3. **Static anti-slop sweep** — grep the banned list before rendering anything:
   - `lorem`, `href="#"`, `Feature 1`, `placeholder.com`
   - `from-purple-|from-violet-|to-blue-` and headline `bg-clip-text` gradient text
   - `✨|🚀|🎉` and emoji-as-icons in TSX
   - counts of `rounded-xl` and `shadow-lg` — near-universal usage = depth without hierarchy
   - `Elevate|Unlock the power|Seamlessly|Empower|Welcome to`
   Every hit is a pre-scored gap with file:line evidence.
4. **Boot it.** `npm install`, `npm run dev`. Won't start → hand the verbatim error to stack-doctor and apply the minimal fix that gets pixels on screen. No other code changes during the audit.
5. **Screenshot everything.** pixel-qa drives Playwright MCP: every route at 375/768/1440, light AND dark if a theme toggle exists → design/screenshots/retrofit/. Console errors are recorded as gaps.
6. **Score.** Send screenshots (plus any existing direction statement) to design-judge with the rubric below. The judge returns per-axis scores and ranked defects.
7. **Map every gap to one skill** (table below). A gap without a named fixing skill isn't finished — "improve the design" ships nothing.
8. **Phase the plan** into design/RETROFIT.md: A quick wins → B system fixes → C direction change (only when triggered).
9. **Bootstrap the artifacts iterate needs.** Reverse-engineer design/BRIEF.md from the evident site (audience, purpose, pages, backend surface). Write design/DIRECTION.md as the TARGET direction — the existing aesthetic sharpened, or, when Phase C triggers, a fresh pick via ultraweb:direction.
10. **Hand off.** Present RETROFIT.md. Each approved phase executes via `ultraweb:iterate` with this file as the change request. Phase C is the burn-it-down case: get explicit user confirmation of scope before starting it.

## Scoring rubric

Seven axes, 0–10, scored per page from screenshots by design-judge:

| Axis | 8–10 looks like | ≤4 means |
|---|---|---|
| Hierarchy | the eye lands where the page intends | everything shouts equally |
| Spacing rhythm | compression and release on a base unit | uniform py-24 wallpaper |
| Typography | real pairing, hero ≥3.5× body | default Inter at timid sizes |
| Color | one accent doing real work, AA verified | slate + purple gradient, or gray soup |
| Distinctiveness | a point of view and a signature move | interchangeable template |
| Motion | purposeful, one easing family, reduced-motion path | everything fades up, or nothing moves |
| Craft | focus rings, favicon, optical alignment | defaults everywhere in the last 2% |

Report the WORST axis alongside the mean — a 7.0 average hiding a 2/10 distinctiveness IS a distinctiveness problem. Triggers: any axis ≤4 → its system fix goes to Phase B. Distinctiveness ≤4, or no identifiable direction at all → Phase C candidate.

## Gap → skill map (canonical examples)

| Gap found | Fixing skill | Phase |
|---|---|---|
| Dead startup copy, lorem, "Feature 1" | copywriting | A |
| Emoji as icons | icons | A |
| Missing metadata / OG image / favicon | seo | A |
| No focus-visible, contrast failures | micro-interactions + color (verify via gate-accessibility) | A |
| Untouched shadcn look (Inter, slate, default radius) | tokens + color + typography | B |
| Uniform section rhythm, everything centered | layout-grid | B |
| Three identical icon-cards as "features" | feature-sections | B |
| Dark mode absent, or an inversion filter | color + tokens | B |
| Motion on everything, or none at all | motion-language + scroll-motion | B |
| Tailwind v3 config / framer-motion / middleware.ts | stack migration first — prerequisite to all Phase B token work; verify steps against current migration docs | B-0 |
| No point of view; template look | direction, then Phase 3 of the root pipeline | C |

## RETROFIT.md format

```markdown
# Retrofit — <site> (<date>)
Verdict: <one sentence>. Mean <n>/10, worst axis: <axis> <n>/10.

## Scorecard
| axis | score | evidence (screenshot / file:line) |

## Gaps
| # | gap | evidence | severity P0–P3 | skill | phase |

## Plan
- Phase A — quick wins (hours, local, reversible): #3, #7, #9…
- Phase B — system fixes (globals.css tokens + foundation skills): #1, #2… [B-0 stack migration first if flagged]
- Phase C — direction change (only if triggered; confirm scope with the user): …
Execute each phase via ultraweb:iterate, pointing it at this file and the phase id.
```

## Anti-patterns

- Fixing while auditing — the only permitted edit is whatever boots the dev server
- Scores produced without screenshots — code reading is inventory, not judgment
- "Improve visual hierarchy" with no skill, no evidence, no phase — that's a shrug, not a gap
- Every gap mapped to "rebuild it" — Phase C is the exception; most sites need B
- Reporting only the mean score — the worst axis is the headline
- Treating `tailwind.config.js` as cosmetic — it blocks the entire token strategy; migration is B-0
- Skipping the artifact bootstrap — iterate refuses sites without design/BRIEF.md and DIRECTION.md

## Worked example — Ledger & Lane, auditing the firm's inherited site

**Patient (what retrofit reads):** a two-partner law firm's existing Next.js site from a prior vendor. Inventory finds Next 14, `tailwind.config.js` (the Tailwind v3 marker), `framer-motion`, `middleware.ts`, and default Inter at 16/32px with slate body text on white.

**Diagnosis.** The static sweep flags "Welcome to Ledger & Lane" hero copy, three identical practice-area icon-cards, and uniform `rounded-xl`+`shadow-lg`. design-judge scores the 375/768/1440 screenshots: mean 4.1/10, worst axis Distinctiveness 2/10. The target isn't a rebuild but the existing bones sharpened toward "Quiet Authority" — Newsreader + Public Sans, ink-navy `oklch(0.25 0.02 260)` on warm paper `oklch(0.975 0.005 80)`, muted gold `oklch(0.72 0.09 85)` reserved for one CTA per page, ruled hairlines as the signature move. Gaps map one-to-one: dead copy → copywriting (A); icon-cards → feature-sections (B); Inter/slate → tokens+color+typography (B); the v3-config / framer-motion / `middleware.ts` triad → stack migration as **B-0**, prerequisite to all Phase B token work.

**Phase C candidate — pending user confirmation:** distinctiveness at 2/10 records a full direction change (ultraweb:direction) as a Phase C candidate, not a verdict — it stays open until the user confirms scope; retrofit can't close it unilaterally. The recommended default meanwhile is Phase B: the routes (`/practice/[area]`, `/attorneys`, `/insights/[slug]`) and the MDX content model are sound, so burning it down would re-solve problems the site doesn't have. Phase B proceeds; Phase C waits on the recorded confirmation.

**Handoff:** written to design/RETROFIT.md alongside a reconstructed design/BRIEF.md + DIRECTION.md; each approved phase hands to ultraweb:iterate, which executes it against this file one phase at a time.

## Composes with

- ultraweb:taste — the rubric IS the constitution; every score traces to its lists
- ultraweb:iterate — executes each approved phase; RETROFIT.md is its change request
- ultraweb:direction — Phase C's engine; also sharpens the reconstructed DIRECTION.md
- ultraweb:gate-antislop — its greppable pattern list powers the step-3 static sweep
- design-judge (subagent) — scores the screenshots against the rubric
- pixel-qa (subagent) — drives the breakpoint screenshot sweep
