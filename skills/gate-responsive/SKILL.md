---
name: gate-responsive
description: Breakpoint quality gate — delegates to the pixel-qa subagent to drive a real browser over every route at 375×812, 768×1024, and 1440×900. Screenshots each combination, evaluates document.documentElement.scrollWidth against clientWidth for horizontal overflow, measures every interactive element against the 44px touch-target floor via getBoundingClientRect, and exercises the mobile menu end to end (open, screenshot, tap, navigate). Defects route to the owning skill, then the sweep re-runs until one full pass is clean. Invoke in Phase 11 of the ultraweb pipeline after gate-code is green, after any layout/navigation/grid change to an ultraweb site, or when the user says "check responsive", "test it on mobile", "does it work at 375", or "run the breakpoint sweep". Writes pass/fail with screenshot paths to design/QA.md.
---

# gate-responsive — three widths, zero excuses

**Stage:** Phase 11 — Gates (after gate-code; needs a serving app) - **Reads:** running dev server, design/SITEMAP.md (route list), agents/pixel-qa.md - **Writes:** design/QA.md entry + qa/*.png screenshots + layout fixes

## Standard

Deliberate at 375, 768, AND 1440 — three designed layouts, not one desktop layout squeezed. Empirical throughout: every claim in this gate is backed by a screenshot file on disk or a browser-evaluated number captured by pixel-qa. Zero horizontal scroll anywhere, zero interactive targets under 44×44 CSS px, no stranded grid orphans at tablet, and a mobile menu that provably opens and navigates.

## Checklist

1. Full sweep: every route × 375/768/1440 screenshotted
2. Zero horizontal overflow at any combination
3. Touch targets ≥44×44px at 375
4. Mobile menu opens, navigates, closes
5. No orphan layouts at 768 (the forgotten middle)
6. Browser console clean at all breakpoints

## How to verify

Delegate the sweep to the **pixel-qa subagent** (agents/pixel-qa.md) — hand it the dev-server URL and the full route list from design/SITEMAP.md. It drives Playwright MCP; you read its report and route fixes. Never eyeball-and-grade in your own context what a subagent can measure.

1. **Sweep:** pixel-qa resizes to 375×812 / 768×1024 / 1440×900, navigates each route, waits for network idle, saves `qa/<route>-<width>.png`. A breakpoint without its file was not checked — pixel-qa's own rule; enforce it when reading the report.
2. **Overflow:** at each route × breakpoint, pixel-qa evaluates `document.documentElement.scrollWidth > document.documentElement.clientWidth` → must be `false` (clientWidth excludes the scrollbar; innerWidth does not, and hides up to ~15px of overflow). On `true`, locate the culprit before fixing:

```js
[...document.querySelectorAll('*')]
  .filter(el => el.getBoundingClientRect().right > innerWidth + 1)
  .slice(0, 5).map(el => `${el.tagName}.${el.getAttribute('class') ?? ''}`)
```

   Usual suspects: unwrapped tables and code blocks, fixed-width hero art, negative-margin bleeds without a clipping section, 100vw used where 100% was meant.
3. **Touch targets** at 375, per route — this evaluation returns an empty array:

```js
[...document.querySelectorAll('a,button,input,select,textarea,summary,[role="button"]')]
  .map(el => ({ el, r: el.getBoundingClientRect() }))
  .filter(({r}) => r.width > 0 && r.height > 0 && (r.width < 44 || r.height < 44))
  .map(({el, r}) => `${el.tagName}.${el.className} ${Math.round(r.width)}×${Math.round(r.height)}`)
```

   Links inline in a paragraph are exempt (the WCAG 2.5.8 inline exception); everything else — nav links, icon buttons, accordion triggers, form controls — holds 44. WCAG's legal floor is 24px; ultraweb ships 44.
4. **Mobile menu** at 375: open the trigger, screenshot the open state (`qa/<route>-375-menu.png`), tap a nav link, verify the URL changed and the target route rendered. A menu that opens but traps the user is a fail; so is a trigger under 44px (check 3 catches it).
5. **Orphans** — read the 768 captures specifically: a 3-column grid collapsing to 2 strands the third item alone — fix by going 2-up at md or spanning the orphan deliberately (layout-grid owns the pattern). At 1440: body text lines over ~75ch and hero media letterboxed by an unconsidered aspect ratio are the same class of defect.
6. **Console:** pixel-qa captures console messages at every route × breakpoint; any error or hydration warning is a defect, not noise — hydration mismatches surface HERE, not in gate-code's terminal check.

## Fix loop

Route each defect to its owner and fix there — never patch with a stray `overflow-hidden`: overflow and orphans → layout-grid; menu breaks → navigation; undersized targets → buttons (nav links → navigation); console errors → gate-code territory, fix before continuing. After fixes, re-run pixel-qa on the affected routes only; once every defect is closed, run ONE full sweep of all routes × all breakpoints — pass is judged on that final sweep alone.

## Pass criteria

Final sweep, zero fixes in between: every route × 3 breakpoints has a screenshot on disk; overflow evaluation `false` everywhere; touch-target evaluation empty outside the inline exception; mobile-menu open + navigation proven with screenshots; console clean per pixel-qa's report. Anything pixel-qa listed as "could not verify" is a fail, not a footnote.

## QA.md entry

```markdown
## gate-responsive — 2026-07-16 — PASS
| Route | 375 | 768 | 1440 | Overflow | Targets <44 | Console |
|-------|-----|-----|------|----------|-------------|---------|
| / | qa/home-375.png | qa/home-768.png | qa/home-1440.png | none | 0 | clean |
| /pricing | qa/pricing-375.png | qa/pricing-768.png | qa/pricing-1440.png | none | 0 | clean |
Mobile menu: opens + navigates — qa/home-375-menu.png.
Issues fixed: pricing table overflowed at 375 → wrapped in a scroll container per layout-grid; footer social icons 32×32 → padded to 44.
```

## Anti-patterns

- Grading responsiveness from the 1440 screenshot and imagination — 375 and 768 get their own captures or the gate didn't run
- `overflow-hidden` on `<body>` to "fix" horizontal scroll — hides the symptom, ships the broken layout
- Testing only "/" — every route in SITEMAP.md, every breakpoint
- Trusting one overflow evaluation across client-side navigations — re-evaluate per route, state persists
- Inflating targets with padding until neighbors overlap — after any target fix, re-check adjacent elements for collision
- Mobile menu "verified" by opening it — navigating through it is the check
- Treating 768 as the average of the other two — tablet gets designed, not interpolated

## Worked example — Casa Verde, EN/PT menu across three widths

From design/SITEMAP.md: `/en`, `/en/menu`, `/en/story`, `/en/reservations` and the `/pt/*` mirror — pixel-qa swept all eight routes × 375/768/1440.

Defect caught (check 2, overflow): the signature day's-harvest strip — the horizontally-scrolling row of today's market finds above the menu — used `w-screen` inside the padded `<main>`, so `/en/menu` at 375 gave `scrollWidth` 390 vs `clientWidth` 375: 15px of page-level horizontal scroll.

Fix → ultraweb:layout-grid: the bleed moved off `w-screen` onto a `100%`-width section that clips, with the strip scrolling inside its own `overflow-x-auto`. Re-check: overflow evaluation `false` at all three widths, in both `/en` and `/pt`.

Also at 375 → ultraweb:i18n (it owns the switcher and the translated strings): the EN/PT locale toggle measured 30×30 (check 3, padded to 44), and the PT label "Reservar mesa" overflowed the header where "Book a table" fit — shortened for the mobile header.

Rejected: `overflow-hidden` on `<body>` — it zeroes the scrollWidth number while shipping the clipped harvest strip. Symptom hidden, defect shipped.

Handoff: the PASS row lands in design/QA.md with `qa/en-menu-375.png` + `qa/en-menu-375-menu.png`; ultraweb:gate-visual then reuses this dev server and pixel-qa harness to score the corrected layouts, not the broken ones.

## Composes with

- pixel-qa (subagent) — runs the entire sweep; this gate reads its report and routes fixes
- ultraweb:layout-grid — owns overflow and orphan fixes: grid collapse rules, bleed discipline
- ultraweb:navigation — owns the mobile menu this gate exercises
- ultraweb:gate-accessibility — inherits the 44px concern (WCAG 2.5.8) and takes over keyboard, contrast, reduced-motion
- ultraweb:gate-visual — reuses the same dev server and pixel-qa harness; run responsive first so the judge scores fixed layouts
- ultraweb:i18n — the sweep runs both locale trees; overflow from long PT strings and locale-switcher targets under 44 route here for the fix
