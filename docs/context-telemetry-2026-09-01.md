# Context telemetry — first full flagship/studio run (iwanbraun.dev, 2026-09-01)

Written by the Lead mid-run, at the operator's request, as design input for v-next's
context management. Method: introspection of what is actually resident in the Lead's
context window after Phases 0–11 (gate-visual round 4 pending), grounded with disk
measurements where possible. Estimates are marked as estimates. The run: flagship tier,
studio engagement, solo mode, 46 skills invoked, 8 subagent runs (4 pixel-qa shoots,
4 design-judge rounds), 4 gate-visual rounds, ~35 git commits.

## Ranked inventory — what is high in the Lead's context

**1. SKILL.md bodies — the dominant fixed cost. MEASURED: 46 files, 546 KB ≈ 140–150k tokens.**
Every `Skill()` load is permanent context. The twelve largest alone (direction 23.4KB,
gate-accessibility 21.4KB, gate-performance 18.1KB, gate-code 15.3KB, scroll-motion 15.3KB,
gate-content 14.7KB, brief 14.6KB, gate-antislop 14.2KB, email 13.8KB, motion-language 13.2KB,
forms 12.9KB, component-api 12KB) are ~200KB. Moving worked examples to `references/` already
helped — the remaining weight is checklists, verify-command blocks, and anti-pattern lists that
the LEAD carries even when a Mechanical agent executes them. Roughly a third of everything in
my window is skill prose.

**2. Subagent final reports — est. 25–35k tokens.** The four design-judge reports are long,
excellent prose (round 3 alone ~5k tokens). The four pixel-qa reports repeat file tables and
methodology confirmations. Judges earn their length; pixel-qa's could be a 15-line table.

**3. The Lead's own Write payloads — est. 60–80k tokens.** Every site file's full content
passes through context at authoring, and again per rewrite (hero/world-chapter/operator/case
pages were written 1–3× across gate rounds). Unavoidable for Lead-authored code, but rewrites
during the visual-gate fix loops multiplied it.

**4. Out-of-band-edit echo reminders — est. 15–25k tokens, largely avoidable.** When a file
already in context is modified via `python-in-Bash` bulk edits (my habit for multi-file
patches), the harness echoes large regions of the changed file back as a system note. Edit-tool
calls return one cheap line instead. My bulk-edit pattern triggered full-file echoes of
page.tsx, globals.css, footer, legal pages, SYSTEM.md — several times each.

**5. Superseded design material — est. 12–18k tokens.** Five mockup HTML files (round 1 was
retired wholesale, per the checkpoint loop working as designed) plus their contact sheets, all
authored inline in solo mode. Throwaway artifacts, permanent context.

**6. Images read by the Lead — 12 reads, est. 12–20k tokens.** Contact sheets ×2, full-page
homes ×2, brand previews ×2, mid-scroll frame, OG ×2, stat crops ×2, B3 full. The full-page
reads (6000px pages) had the worst value/token — the judge itself ruled that scale unjudgeable
and demanded sectionals. Crops and viewport shots carried nearly all the decision value.

**7. Playwright echo tax — est. 8–12k tokens.** Both `browser_evaluate` and
`browser_run_code_unsafe` echo the submitted code verbatim in the result ("Ran Playwright
code"), doubling every measurement script — the contrast matrix ran 4×, axe 3×, each paying
for its own source twice.

**8. Everything else** — design artifacts written once each (BRIEF/SYSTEM/DIRECTION/SITEMAP/
QA/…, ~25k total, fully earned); QA.md gate appends via Edit (anchor text repeated per append);
log-grep spelunking during the shared-.next debugging saga; Lighthouse JSON extraction lines.

## What held up well (keep in v-next)

- The **artifact contract + "read once per context" rule** — I never re-read BRIEF/SYSTEM/
  DIRECTION after writing them; the files, not my memory of them, were the source for
  subagents. This is the design working.
- `references/` extraction of worked examples — without it, item 1 would be ~2× worse.
- **Judges/shooters in fresh contexts** — their tool traffic (125 tool calls in one pixel-qa
  run, 148k subagent tokens) never touched the Lead's window; only the report did. This is the
  single most important existing mechanism; v-next should extend it, not just keep it.

## v-next proposals, ranked by leverage

**P1 — Move skill bodies out of the Lead for executor phases.** The Lead needs the *decisions*
each skill governs, not its verify-command blocks. Two concrete shapes:
  (a) Gate skills load inside a gate-runner agent (the delegation table already routes
      measurement to Mechanical tier) — ship a ready-made gate-runner brief per gate so the
      handoff is turnkey; the Lead receives the QA.md row + fix list only. Saves ~110KB of the
      seven gate bodies from the Lead's window.
  (b) Phase 3 alternative: a foundation-runner agent loads the 8 foundation skills and returns
      SYSTEM.md + globals; the Lead reviews artifacts, not skill prose. (Trade-off: the Lead
      loses internalized rules for later fix routing — mitigate with a ~40-line "core card"
      per skill, see P2.)

**P2 — Split each SKILL.md into core card + full body.** Core = position, the decision table,
the artifact format (≤50 lines). Full body (process detail, verify blocks, anti-pattern greps)
loads only in whichever context *executes* it. The root pipeline would say "Lead loads cores;
executors load bodies." Direction (23KB — the archetype catalog!) is the poster child: the
catalog could be a reference the mockup/direction step loads once, while the core card is 30
lines.

**P3 — Structured subagent returns with word budgets.** pixel-qa: a fixed table schema
(file, ok/fail, booleans) — target ≤500 tokens. design-judge: scores table + ranked defects
(file:line + owner + one sentence) capped, with full rationale written to
`qa/visual/round-N-verdict.md` for the record instead of the return channel. The judge's prose
is worth keeping — on disk, not in the Lead.

**P4 — Solo-mode mockups may fan out.** The root skill allows candidate fan-out only in
fan-out mode; solo Leads author 3 candidates + revision rounds inline (~15k tokens of
throwaway HTML this run, one full round retired). Candidates are independent and disposable —
exactly the safe delegation case. Let solo mode spawn one cheap agent per candidate.

**P5 — Codify editing-channel discipline in §Context discipline.** New rules:
"Files already in this context are edited with Edit/Write, never via shell scripts — every
out-of-band write triggers a full echo-back"; and "append-heavy ledgers (QA.md) get per-round
files plus a one-line index, so appends never repeat anchors."

**P6 — Image-viewing budget for the Lead.** "The Lead views crops and viewport frames at
decision points; full-page captures are subagent food. At most ~2 images per checkpoint."
This run's full-page reads were the lowest-value tokens I spent.

**P7 — Measurement-script library.** The contrast matrix, axe injection, overflow/touch-target
snippets were re-inlined (and echoed back) repeatedly. Ship them as `scripts/qa/*.js` in the
plugin; skills reference the path (`browser_run_code_unsafe` accepts `filename`), so the Lead
pays for results, never for source-in-transit.

**P8 — A resume-grade CONTEXT-HANDOFF convention.** PROGRESS.md answers "where are we";
nothing captures "what did this session learn that the artifacts don't show" (this run: the
shared-.next corruption protocol, shadcn-as-runtime-dep, SSE-vs-networkidle, the screenshot
methodology). A `design/CONTEXT-HANDOFF.md` §Lessons block, appended at phase boundaries,
would make long builds compaction-proof — this run wrote one ad hoc and it should be standard.

## One number to remember

Rough shape of the Lead's window at Phase 11, flagship solo: **~⅓ skill prose, ~⅕ own code
authoring, ~⅕ everything operational (tool results, logs, echoes), ~1/10 subagent reports,
~1/10 design artifacts + images.** P1–P3 attack the first and fourth slices — together the
biggest reclaimable share — without touching what made the run work: artifacts as memory and
fresh-context verification.
