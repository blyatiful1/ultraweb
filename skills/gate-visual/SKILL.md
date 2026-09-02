---
name: gate-visual
description: The self-critique loop that separates working from first-grade — screenshots every page light and dark via the pixel-qa subagent, delegates scoring to the design-judge subagent against design/DIRECTION.md and the taste rubric (hierarchy, typography, spacing, color, distinctiveness, craft — 1–10 each), fixes the worst-ranked defect, re-shoots, and repeats — never fewer than 2 rounds at standard tier (one at sketch, up to five at flagship), stopping only on a SHIP verdict. Invoke in Phase 11 of the ultraweb pipeline after the six measurement gates have run through gate-runner, after any major visual change to an ultraweb site, or when the user says "is it actually good", "critique the design", "judge the site", or "run the visual gate". Writes per-round scores, defects fixed, and screenshot paths to design/QA.md.
---

# gate-visual — critique until it ships

**Stage:** Phase 11 — the one gate the Lead runs itself, after the six measurement gates - **Reads:** the production server of record, design/DIRECTION.md, design/SYSTEM.md, design/SITEMAP.md, design/QA.md (once) - **Writes:** qa/visual/round-N/ frames + VERDICT.md, fixes at file:line, ONE design/QA.md entry at loop end

## Standard

The site is judged from pixels, by a critic with no stake in the code: `design-judge` runs in fresh context and scores frames against DIRECTION.md and the taste constitution — you never grade your own work. First-grade means a SHIP verdict on the bar below, with the committed direction and signature move visibly delivered on screen, not merely described in DIRECTION.md.

## Checklist

1. Preconditions: the six gate entries in QA.md, prod server answering, responsive captures on disk
2. Every route shot at the round's widths, both themes, viewport frames + sectionals
3. Scored by design-judge, never self-scored
4. Round 1's rulings blocks written: antislop 12–17 and responsive-8
5. Worst-ranked defect fixed each round, as Edits at the judge's file:line
6. The tier's round budget honored, SHIP recorded once in QA.md with the VERDICT.md paths

## The loop

1. **Preconditions.** The six measurement gates have run through `gate-runner` and their QA.md entries exist; the production server of record answers at `prodUrl`; `gate-responsive`'s captures are on disk. A broken or overflowing site burns rounds on other gates' defects.
2. **Shoot (round N).** Delegate to `pixel-qa` against `prodUrl` with `outputDir` `qa/visual/round-N/`: every SITEMAP.md route, light AND dark (per SYSTEM.md's theme strategy), as **viewport frames** (`<route>-<theme>-<width>.png`) plus **sectionals**, viewport-height frames at scroll offsets (`<route>-<theme>-s<N>.png`). Round 1 shoots 375, 768 AND 1440 (gate-responsive's check 8 is ruled off those widths); later rounds 1440, plus 375 after a layout fix. No full-page captures — anything past 2500px comes back unjudgeable.
3. **Judge.** Delegate to `design-judge`: round directory, round number, project root, plugin root — never the direction in your own words; it reads the artifacts, constitution and canon invariants itself. Its rationale goes to `qa/visual/round-N/VERDICT.md`; its ≤700-token return carries the scores, the ranked defects at file:line with owner skills, the verdict, and at most two frames worth your eyes. **Read the return only**, nothing past those two frames.
4. **Round 1 closes two gates' judgment halves.** From its return alone the Lead writes two QA.md blocks: `## gate-antislop — rulings (<date>)` — the line `antislop 12–17: ruled <date> from gate-visual round 1 — <n> violation(s)`, then the six `antislop-<n>` lines verbatim — and `## gate-responsive — rulings (<date>)`, the judge's `responsive-8` line per route. A violation is a defect in this loop, fixed through the skill the judge names.
5. **Fix worst-first.** The #1 defect plus any lower defect sharing its root cause. Open the owning skill for its rules, then land the fix as an Edit at the returned `file:line`, never a re-authored page. A defect returned as `route@width` means the judge could not Grep the source: find the owning component yourself first, then Edit at that line. MECHANICAL items (a token swap across files) go to a Sonnet agent with the file:line and owner.
6. **Re-shoot, re-judge.** Fresh captures into `round-N+1/` — affected routes minimum, every route if the fix touched globals.css tokens — then a fresh judge round on it. A fix without a new frame doesn't exist. The production server serves the build of record, not the working tree: a fix that touched source, config, tokens or deps repeats the Phase 11 preamble — one rebuild, one restart, a fresh `Build of record:` line — before the re-shoot, or the frames lie.
7. **Repeat until SHIP**, inside the tier's budget: sketch one round; standard never fewer than 2 full judge rounds — a first-round SHIP is re-tested, not trusted; flagship five. At the cap you are polishing noise or fighting the direction: record the residual defects in the judge's wording, tell the user, stop looping.

Round state — number, last verdict, VERDICT.md path — lives in PROGRESS.md §Now while the loop runs; QA.md gets nothing from THIS gate until it ends (the round-1 rulings blocks are gate-antislop's and gate-responsive's entries).

## How to verify

- Captures exist before judging: `ls qa/visual/round-N/` lists route × theme × the round's widths (375/768/1440 in round 1; 1440 after, plus 375 when the round follows a layout fix) — a missing file means shoot again, not "judge what we have"
- Every round left a `qa/visual/round-N/VERDICT.md`, and QA.md's scores are the judge's verbatim numbers — never rounded, averaged, or softened to "mostly strong"
- Each round's fix is a nameable diff (file:line + what changed) paired with the round-N+1 frame showing it; an axis that DROPS after it means the fix fought the direction — revert and re-read DIRECTION.md

## Pass criteria

Final verdict SHIP; every page ≥7 on all six axes (enforce it if the judge says SHIP anyway); zero banned-list violations in the final sweep; the tier's budget met; one QA.md entry holding the whole history. FIX-THEN-SHIP is not a pass: apply the named fixes and run the next round.

## Degraded mode (no browser)

When Phase 0 reported no Playwright MCP, this gate's verdict is **UNVERIFIED** — a third state, never conflated with PASS or FAIL. Still runs: `design-judge`'s source-only mode (`<plugin>/agents/design-judge.md` §Degraded mode) — token discipline in globals.css vs SYSTEM.md, section structure vs SITEMAP.md, the banned-list greps — returning ranked defects at file:line and the verdict **UNVERIFIED-VISUAL**. Cannot run: the screenshot rounds, this gate's empirical core; with no round-1 sweep, antislop 12–17 and responsive-8 stay UNVERIFIED too. The QA.md entry says it plainly: `UNVERIFIED — no browser: source-level review only; no page has been SEEN. The visual bar is unproven.` Never write PASS from source review; never let the judge score a page it hasn't seen.

## QA.md entry

Written ONCE, at loop end, per the ledger rule: an Edit anchored on QA.md's last line, or a `>>` heredoc when QA.md is not in this context.

```markdown
## gate-visual — 2026-07-16 — PASS (SHIP, round 3)
| Round | Verdict | Lowest axis (page) | Worst defect → fix | Frames | Rationale (in qa/visual/) |
|---|---|---|---|---|---|
| 1 | NOT-CLOSE | typography 5 (/) | hero display too small → clamp() ceiling raised per typography | 34 | round-1/VERDICT.md |
| 2 | FIX-THEN-SHIP | spacing 6 (/pricing) | wallpaper rhythm → compression/release per layout-grid | 14 | round-2/VERDICT.md |
| 3 | SHIP | all ≥7 | — | 14 | round-3/VERDICT.md |
Banned-list violations: 0 in final sweep. Issues fixed: 2. Residual defects: none.
```

## Anti-patterns

- Self-scoring ("the screenshots look strong to me") — the judge scores, you fix
- Reading VERDICT.md into your own context — it exists so the rationale does NOT cost Lead tokens
- Homepage-only or light-mode-only rounds — every route ships, and dark mode is a design, not a filter
- Coaching the judge ("the hero is intentionally sparse") — if the direction needs defending, write it into DIRECTION.md, where the judge reads it
- Arguing scores down — disagreement resolves by re-reading taste + DIRECTION.md, and taste wins
- Shotgunning ten fixes in one round — one root cause per round keeps cause and effect visible

## Worked example — Studio Norra, Editorial Brutalist agency portfolio

Moved to `references/example.md` — read only when this build's case is genuinely ambiguous; the sections above are the decision material.

## Composes with

Moved to `references/composes.md` — the handoff map; load it when orchestrating this skill against its neighbors.
