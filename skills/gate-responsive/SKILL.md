---
name: gate-responsive
description: Breakpoint quality gate — executed by the gate-runner agent against the production server of record. Drives a real browser over every route in design/SITEMAP.md at 375×812, 768×1024 and 1440×900, saves a capture per combination under qa/ as the runner's evidence for the Lead and gate-antislop, measures overflow and the 44px touch-target floor with the measurement library, and exercises the mobile menu, one interaction per route, and the console. Invoke in Phase 11 after gate-code is green, on an iterate re-gate, after any layout or navigation change, or when the user says "check responsive", "test it on mobile", "does it work at 375", or "run the breakpoint sweep". Appends pass/fail with screenshot paths to design/QA.md.
---

# gate-responsive — three widths, zero excuses

**Stage:** Phase 11 — Gates, second of six: code → **responsive** → antislop → content → accessibility → performance - **Executed by:** the `gate-runner` agent against the **production server of record** the Lead built and started in the Phase 11 preamble (`mkdir -p qa && rm -rf .next && npm run build > qa/build.log 2>&1`, then `PORT=3100 npm start > qa/prod.log 2>&1 &`; root SKILL.md) - **Reads:** `design/SITEMAP.md`, `prodUrl` - **Writes:** `design/QA.md` (append) + `qa/<route>-<width>.png` + `qa/gate-responsive.log`

## Standard

Deliberate at 375, 768 AND 1440 — three designed layouts, not one desktop layout squeezed. Every claim below is a PNG on disk or a number the measurement library returned — never an impression.

## Checklist

1. Every route × 375/768/1440 captured to `qa/<route>-<width>.png` [MEASURED]
2. Zero horizontal overflow at every route × width [MEASURED]
3. Every interactive target ≥44×44 CSS px at 375 [MEASURED]
4. Mobile menu opens, navigates, closes at 375 [OBSERVED]
5. One primary interaction per route exercised without a visual break [OBSERVED]
6. No orphan layouts at 768; no letterboxed media or runaway measure at 1440 [OBSERVED]
7. Browser console clean at every route × width [OBSERVED]
8. Each width looks deliberate — designed, not squeezed [JUDGMENT → design-judge, ruled in gate-visual round 1; evidence: this gate's three capture paths per route, cross-reference]

## How to verify

**Runner contract.** The Lead dispatches this gate to `gate-runner` and never loads this file.
In: `gate` · `pluginRoot` · `projectRoot` · `prodUrl` (`http://localhost:3100`) · `devUrl` · `artifacts` · `tier` · `market` · `themeStrategy` · `rerunOnly` (optional — run only those checks).
Out: verdict `PASS` | `PASS-ON-MEASURED` | `FAIL` | `UNVERIFIED`; each failed check as `check · file:line · one line · owner skill · MECHANICAL|DESIGN`; check 8's judgment-open evidence; the QA.md entry appended; `qa/gate-responsive.log`.
Full stdout/stderr of every failing or unverified command goes to `<projectRoot>/qa/gate-responsive.log` — the return carries the path, never the contents.
Never: `npm run build`, `npm start`, `npm run dev`, `rm -rf .next`, `npm install`, any source or `design/*` edit other than the QA.md append.

1. **Sweep [1].** Routes from `design/SITEMAP.md`. Per route × 375×812 / 768×1024 / 1440×900: resize, navigate `<prodUrl><route>`, wait for network idle, save to `<projectRoot>/qa/<route>-<width>.png` (route `/` → `home`). A combination without its file was not checked (`ls qa/*-375.png | wc -l` = route count, likewise 768/1440). Name every path in the QA.md entry: gate-antislop's runner pass reads them instead of re-shooting; gate-visual round 1 shoots its own frames and cross-references these.
2. **Overflow [2].** Per route × width, `<plugin>/scripts/measure/overflow-culprits.mjs` via `browser_run_code_unsafe` (`filename:`). Asserts `!overflowX` — `documentElement.scrollWidth > clientWidth` (`innerWidth` counts the scrollbar and hides ~15px of overflow); `culprits[]` (`selector,text,left,right,width`) are the elements whose `right` passes `innerWidth`, deepest first — the file:line leads. Re-evaluate per route; client-side navigation carries state.
3. **Targets [3].** At 375 only, per route: seed `window.__ultraweb` with `{threshold:44}` (one `browser_evaluate` per navigation; WCAG's floor is 24, ultraweb ships 44), then `<plugin>/scripts/measure/targets.mjs`. Asserts `small.length === 0`; read `small[]` (`selector,text,w,h`) and `count`. Links inline in a paragraph are exempt (WCAG 2.5.8); nav links, icon buttons, accordion triggers and form controls are not.
4. **Menu [4].** At 375: open the trigger, capture `qa/<route>-375-menu.png`, tap a nav link, confirm the URL changed and the route rendered, close it. A menu that opens but strands the user is a defect; an undersized trigger is check 3's.
5. **Interaction [5].** One primary control per route (hero CTA, form submit, accordion, tab strip): activate it at 375 and report what the page did — clipped panel, off-screen overlay, layout break, or nothing wrong.
6. **Orphans [6].** Read the 768 captures: a 3-column grid collapsing to 2 strands the third item alone. At 1440: letterboxed hero media, body measure past ~75ch.
7. **Console [7].** Collect console messages at every route × width. Any error or hydration warning is a defect: hydration mismatches surface HERE, not in gate-code's terminal check.
8. **Deliberate [8].** JUDGMENT → design-judge, ruled in gate-visual round 1 from its own 375/768/1440 frames in `qa/visual/round-1/`; forward this gate's three capture paths per route as cross-reference, never a rating.

Fallback for checks 2/3 (Phase 0 recorded `measure-library: unavailable`): the inline snippets — `git -C <plugin> show V1.8.0:skills/gate-responsive/SKILL.md`, a git checkout only; in a marketplace snapshot checks 2 and 3 go UNVERIFIED.

## Fix routing

Overflow and orphans → `layout-grid`; menu breaks → `navigation`; undersized targets → `buttons` (nav links → `navigation`), then re-check neighbors for overlap; console errors → gate-code territory, fixed before the next gate. A fix that touched source, config, tokens or dependencies repeats the Phase 11 preamble first — the server serves the build of record, not the working tree — then re-dispatch with `rerunOnly` naming the failed checks; a token or config change widens that to the whole gate.

## Pass criteria

`PASS-ON-MEASURED`: every route × 3 widths has its PNG; `overflowX` false everywhere; `small.length === 0` outside the inline exception; menu and one interaction per route observed; console clean. Check 8 stays open until design-judge's round-1 `responsive-8` lines land and the Lead writes the `## gate-responsive — rulings (<date>)` block, which turns PASS-ON-MEASURED into PASS. What a WORKING browser could not verify — a route that would not load — is a FAIL, not a footnote.

## Degraded mode (no browser)

When Phase 0's preflight reported no Playwright MCP, the verdict is **UNVERIFIED**. Still runs, its defects real: the code-side audit — `rg -n '(w|h|min-w|max-w)-\[[0-9]+px\]' app components`, fill `<Image>` without `sizes`, missing viewport meta, sections with no `sm:`/`md:`/`lg:` variant. Cannot run: captures, overflow, targets, menu, interactions, console — and check 8, which has no round-1 frames to be ruled from. The QA.md entry says exactly that: `UNVERIFIED — no browser: code audit clean; screenshots/overflow/touch-targets/menu unproven. Verify before relying on mobile.` The build may ship; `ship` carries the line. Banned: PASS on a code audit alone, or a route that would not load hiding inside UNVERIFIED.

## QA.md entry

The runner APPENDS this with a `cat >> design/QA.md <<'EOF'` heredoc — never rewrites it, never reads it for an anchor. On `rerunOnly` it appends a dated `re-run` block naming only those checks and their new results.

```markdown
## gate-responsive — 2026-07-16 — PASS
| Route | 375 | 768 | 1440 | Overflow | Targets <44 | Console |
|-------|-----|-----|------|----------|-------------|---------|
| / | qa/home-375.png | qa/home-768.png | qa/home-1440.png | none | 0 | clean |
| /pricing | qa/pricing-375.png | qa/pricing-768.png | qa/pricing-1440.png | none | 0 | clean |
Mobile menu: opens + navigates — qa/home-375-menu.png.
Issues fixed: pricing table overflowed at 375 → scroll container per layout-grid; footer icons 32×32 → padded to 44.
```

## Anti-patterns

- Grading responsiveness from the 1440 capture and imagination — 375 and 768 get their own files or the gate did not run
- `overflow-hidden` on `<body>` to "fix" horizontal scroll — hides the symptom, ships the broken layout

## Worked example — Casa Verde, EN/PT menu across three widths

Moved to `references/example.md` — read only when this build's case is genuinely ambiguous; the sections above are the decision material.

## Composes with

Moved to `references/composes.md` — the handoff map; load it when orchestrating this skill against its neighbors.
