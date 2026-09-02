# Context diet — v1.9.0 (2026-09-02)

Design input: [context-telemetry-2026-09-01.md](context-telemetry-2026-09-01.md), the Lead's own accounting of its window after Phases 0–11 of the first flagship/studio run (~⅓ skill prose, ~⅕ own write payloads, ~⅕ operational echo, ~1/10 subagent reports, ~1/10 artifacts + images). This release answers its eight proposals. The governing principle, which decided every trade below: **moving prose saves Lead tokens only when a different context executes it, when the Lead reads it selectively, or when it is never needed at execution time.** Moving text the Lead still has to load is a file rename, not a diet.

## The numbers

Measured with `node scripts/context-budget.mjs` (`--json` for the raw report), "before" against `main` at 7209144, "after" on this branch. The core standard set is root SKILL.md plus every skill a plain standard build loads (Phase-line skills that are not brief-conditional, plus `taste` and `status`); tokens are bytes ÷ 3.9, the ratio measured in the telemetry run.

<!-- NUMBERS:BEGIN -->
| Measure | main (7209144) | v1.9.0 | Δ |
|---|---:|---:|---:|
| Core standard set (root + loaded SKILL.md) | 675,998 | 498,334 | -26% |
|   skills in the core set | 54 | 47 | -13% |
| Full Phase-line set (core + brief-conditional skills) | 966,108 | 765,347 | -21% |
| Root SKILL.md | 30,898 | 38,247 | +24% |
| Six measurement-gate bodies (Lead-loaded before, runner-loaded after) | 94,247 | 98,162 | +4% |
| `gate-visual` (the one gate the Lead still loads) | 11,248 | 8,841 | -21% |
| `direction` SKILL.md (catalog moved to references/CATALOG.md) | 23,365 | 13,887 | -41% |
| `mockup` SKILL.md | 10,384 | 10,524 | +1% |
| Corpus: all 79 SKILL.md | 952,890 | 872,426 | -8% |
| Corpus: all references/ (never loaded whole) | 199,765 | 322,376 | +61% |
| Skills with references/example.md | 39 | 78 | +100% |

Core standard set in tokens (÷3.9): **173,333 → 127,778** for a plain standard build; the full Phase-line set 247,720 → 196,243. Ceiling: 545,000 B.

Per phase (v1.9.0), what the Lead loads:

| Phase | Skills loaded | SKILL.md B | ~tokens | references/ B (on disk, not loaded) |
|---|---|---:|---:|---:|
| root | SKILL.md | 38,247 | 9,807 | 3,570 |
| always (invoked from body text) | `taste`, `status` | 20,808 | 5,335 | 2,714 |
| 0 Preflight | — | 0 | 0 | 0 |
| 1 Understand | `brief`, `assets` | 22,264 | 5,709 | 5,916 |
| 2 Direction | `direction`, `mockup` | 24,411 | 6,259 | 24,987 |
| 3 Foundation | `color`, `typography`, `layout-grid`, `depth`, `shape-language`, `imagery`, `motion-language`, `theme-worlds`, `identity`, `tokens` | 93,737 | 24,035 | 35,975 |
| 4 Structure | `sitemap`, `wireframe` | 16,590 | 4,254 | 5,956 |
| 5 Scaffold | `scaffold`, `app-structure`, `studio` | 29,977 | 7,686 | 8,084 |
| 6 Build | `component-api`, `hero`, `navigation`, `footer`, `feature-sections`, `cards`, `buttons`, `forms`, `data-display`, `pricing`, `social-proof`, `faq`, `ui-states`, `overlays`, `cart`, `product-detail`, `command-palette`, `marginalia`, `icons`, `routing`, `data-fetching`, `media-optimization` | 203,984 | 52,304 | 67,359 |
| 7 Backend | `server-actions`, `api-design`, `database`, `auth`, `email`, `payments`, `content-cms`, `storage`, `analytics`, `consent` | 104,128 | 26,699 | 32,628 |
| 8 Voice | `copywriting` | 9,062 | 2,324 | 2,953 |
| 9 Motion | `micro-interactions`, `scroll-motion`, `page-transitions`, `physics`, `showpiece`, `set-design`, `animejs`, `hidden-craft` | 121,394 | 31,127 | 38,125 |
| 10 Findability | `seo`, `i18n`, `print-craft` | 30,265 | 7,760 | 8,710 |
| 11 Gates | `gate-visual` | 8,841 | 2,267 | 2,821 |
| 11.5 Acceptance | `checkpoint`, `preview` | 18,571 | 4,762 | 4,914 |
| 12 Ship | `ship`, `handoff` | 23,068 | 5,915 | 5,056 |
<!-- NUMBERS:END -->

What the Lead no longer carries is not only the difference in the core set: in the telemetry run, six gate bodies, the direction catalog, three worked examples per phase, the full design-judge rationales, and every re-inlined measurement snippet were all resident by Phase 11. The ceiling constant in `scripts/context-budget.mjs` is the post-diet core set plus ~10%; CI fails when the core standard set grows past it, when a Phase line names a measurement gate or an unknown skill, or when a §Context-discipline / Phase 11 anchor disappears from root SKILL.md.

## What changed, by mechanism

1. **Progressive disclosure finished.** `scripts/split-references.mjs` moved the remaining 39 inline worked examples and compose maps into `skills/<name>/references/` (104,581 B); every skill with such a section now carries the two-line stub, lint rule 10 refuses an inline body, and the root skill's own worked example lives in `references/example.md`. `direction`'s twelve-archetype catalog is `skills/direction/references/CATALOG.md`; the core keeps a 12-row table and reads only the shortlisted entries (`grep -n '^### '` → Read offset/limit).
2. **Gates leave the Lead.** A fourth subagent, `agents/gate-runner.md` (Sonnet), executes one measurement gate per dispatch — code → responsive → antislop → content → accessibility → performance, strictly sequentially — against a **production server of record** the Lead builds and starts once in the Phase 11 preamble (`mkdir -p qa && rm -rf .next && npm run build > qa/build.log 2>&1`, `PORT=3100 npm start > qa/prod.log 2>&1 &`). Every checklist item carries a MEASURED / OBSERVED / JUDGMENT tag; the runner asserts the first two, returns the third as `judgment-open` with evidence, appends the gate's QA.md entry itself, writes raw logs to `qa/<gate>.log`, and returns ≤400 tokens. The Lead rules on open items in a `## <gate> — rulings (<date>)` block and re-dispatches with `rerunOnly`. `gate-visual` stays with the Lead (it is a judgment loop); its round-1 judge sweep performs gate-antislop's screenshot checks 12–17 and rules gate-responsive's "looks deliberate at each width" item. Gates no longer fan out in fan-out mode — they share one browser, one `.next`, one port.
3. **Seven hard rules in §Context discipline.** The original three (read once, re-read only after a write, never read back) plus: Edit the smallest hunk and never write a build file through the shell; ledgers are appended never rewritten (Edit on the last line when in context, `>>` heredoc when not); two images per decision; bounded output. Rule 4 is enforced deterministically by `hooks/shell-write-guard.sh` (PreToolUse on Bash: blocks `sed -i`/`perl -i`, truncating redirects and `tee` onto source files and top-level `design/*.md` inside a build; allows `>>`/`tee -a` to ledgers, logs, `.env*`, `qa/**`; escape hatch `ULTRAWEB_SHELL_WRITE_OK=1 ` prefix). 34 fixture cases in `tests/hook-shell-write-guard.test.sh`.
4. **Structured subagent returns.** `pixel-qa` returns a fixed three-part report ≤500 tokens and shoots viewport frames plus sectionals (`<route>-<theme>-s<N>.png`) instead of full-page captures; `design-judge` writes its full rationale to `qa/visual/round-N/VERDICT.md` and returns ≤700 tokens (scores table, ≤8 ranked defects with owner skill, the antislop-12–17 lines, verdict, ≤2 frames for the Lead's own eyes); it declares any capture taller than 2500px unjudgeable. Lint pins the three caps.
5. **Solo mode delegates.** "One mind owns every decision" is no longer read as "one context does all the typing": when the Agent tool is available and the user has not asked for a single context, the Lead delegates round-1 mockup candidates (standard and flagship; `skills/mockup/references/candidate-brief.md` is the turnkey brief), every measurement gate, and at flagship tier the Phase 6 inner pages after CP4. The trade is stated in one sentence: the Lead's window shrinks, total spend rises.
6. **Measurement library.** Fifteen scripts under `scripts/measure/*.mjs`, each one `async (page) => {…}` run through Playwright MCP's `browser_run_code_unsafe` with `filename:`; configuration through `window.__ultraweb` (seeded once with `browser_evaluate`); results return to the runner's context, which writes list-shaped ones to `qa/<gate>-<script>.json` and greps them. `_selftest.mjs` proves the channel in Phase 0. `tests/qa-scripts.test.mjs` parses every file and, when Playwright resolves, runs the library live against `tests/fixtures/measure-page/index.html`, a page with known defects.
7. **CONTEXT-HANDOFF.** `design/CONTEXT-HANDOFF.md`, owned by `status`: append-only `## Lessons` blocks (≤10 lines) at phase boundaries and after any debugging saga; §Resuming reads it after PROGRESS.md §Now; `handoff` folds it into the README's "Don't break these".
8. **Plugin root, recorded.** Phase 0 (and `iterate` step 1) resolves the plugin directory — newest `ultraweb@…` `installPath` in `~/.claude/plugins/installed_plugins.json`, then `~/.claude/skills/ultraweb`, each validated by reading `.claude-plugin/plugin.json` — and records `Plugin: <path>` on PROGRESS.md's header, so every `<plugin>/…` path in the corpus resolves without a search.
9. **Enforcement.** Lint rules 10–12 (stub bodies, subagent-count prose, measurement-library mentions), rule 5 now enumerates `agents/` against a routing map and pins the return caps, rule 6 covers the root `references/`; `scripts/context-budget.mjs` runs in CI; the manifests test globs `hooks/*.sh` and checks every hook is wired.

## The eight proposals, answered

- **P1(a) gate-runner — adopted, tightened.** Not one agent per gate in parallel (the report's fan-out framing) but one runner dispatched six times in a fixed order, because the gates share a browser, a `.next`, and a port, and antislop reads responsive's captures. The "turnkey brief per gate" became a single payload contract in root SKILL.md Phase 11 plus the tag vocabulary inside each gate: the runner loads the gate with the Skill tool, so the gate body itself is the brief.
- **P1(b) foundation-runner — rejected.** Root SKILL.md reserves every DIRECTION.md/SYSTEM.md edit to the Lead, and the Phase 3 skills are exactly where the Lead's internalized rules pay off in later fix routing. The Phase 3 prose (106 KB before the diet, 94 KB after) is noted; the middle path — a runner that drafts SYSTEM.md sections for the Lead to ratify — is a flagged experiment for a later release, not a v1.9.0 change.
- **P2 core card + full body — adopted where the body has a different executor, rejected as a blanket split.** Gates split by executor (runner). Direction split by selective reading (catalog). Worked examples and compose maps split by need. A generic ≤50-line "core card" for every skill was rejected: the Lead still executes those skills, so the body would be loaded anyway and the split would only add a second file to open.
- **P3 structured returns — adopted** (mechanism 4), with the rationale on disk at `qa/visual/round-N/VERDICT.md` as proposed.
- **P4 solo-mode mockups — adopted** (mechanism 5), extended to gates and flagship inner pages.
- **P5 editing-channel discipline — adopted for the rule, rejected for the QA index.** The Edit/never-shell rule is rule 4 with a hook behind it. The proposed "per-round QA files plus a one-line index" was rejected on blast radius: QA.md is read by `ship`, `iterate`, `studio`, `handoff`, and every gate's entry format; the anchor problem it solved is solved instead by the ledger-append rule (Edit on the last line, or `>>` when not in context — no anchor to find).
- **P6 image budget — adopted** as rule 6, plus sectionals replacing full-page captures at the source (pixel-qa) and a >2500px refusal at the judge.
- **P7 measurement library — adopted** (mechanism 6). Path is `scripts/measure/` rather than the proposed `scripts/qa/`, to keep `qa/` for the build's own runtime artifacts (`qa/*.log`, screenshots, VERDICT.md).
- **P8 CONTEXT-HANDOFF — adopted** (mechanism 7).

## Deviations from the plan worth knowing

- `agents/gate-runner.md` carries **no `tools:` restriction**. The plan asked for an explicit list; the Playwright MCP tool names depend on how the user registered the server (`mcp__playwright__…` here, anything elsewhere), and a `tools:` list would have to name them to keep them. Lint instead requires that *if* a list appears it includes Skill and Bash.
- The shell-write guard's analysis lives in `hooks/shell-write-guard.mjs` (node) behind a bash wrapper; tokenizing quotes, heredocs and `2>&1` dups in POSIX sh was not worth the bugs. A host without node stands down — ultraweb cannot run without node anyway.
- Root SKILL.md grew (Phase 11 preamble, payload contract, seven rules) even after its worked example left. It is the one file every build pays for; the growth is deliberate and the budget script reports it first.
- **The measurement library does not make script source free — it moves it.** Verified live: Playwright MCP's `browser_run_code_unsafe` with `filename:` loads the file, runs it, and then echoes the full source in its result — 2–15 KB per call, source plus result, contrast-matrix the worst case. `filename:` is an input; there is no result-to-file sink, and `browser_evaluate` cannot run the library. So the runner pays the echo in its own disposable context and writes list-shaped results to `qa/<gate>-<script>.json` itself; the Lead sees only the ≤400-token return. The MCP server also refuses `file://` URLs, so the fixture is served over http in tests. P7's "the Lead pays for results, never for source-in-transit" holds for the Lead; for the runner it is "once per script per route".
- **Rebuild after every fix.** The production server of record serves `.next`, not the working tree, so a source fix is invisible to a browser gate until the Lead repeats the preamble. The first draft of Phase 11 repeated it only for config/token/dependency changes; the verifiers caught the contradiction and the rule is now: any fix that touched code repeats the preamble (an exit code and five log lines in the Lead's context), a rulings-only round does not. `gate-visual`'s fix rounds follow the same rule.
- The fallback for a missing library points at `git show V1.8.0:skills/<gate>/SKILL.md` — the repo's tags are capitalised, and the first pass wrote `v1.8.0`, a dead command every verifier flagged. A snapshot install without tags has no fallback beyond the GitHub history.
- `gate-visual`'s checklist carries no MEASURED/OBSERVED/JUDGMENT tags: it is never dispatched to the runner, and tags are the runner's contract.

## Telemetry template for the next run

Write it mid-run, at the same point (after the measurement gates, before gate-visual's last round), as the Lead, from introspection plus disk measurements. Report, in this order:

1. Run shape: tier, engagement, orchestration mode, skills invoked, subagent runs by type, gate rounds, commits.
2. Ranked inventory of what is resident, in the report's seven categories: skill prose · own write payloads · operational echo (tool results, logs, diff echoes) · subagent reports · design artifacts · images · other. Estimate each as a share of the window; mark estimates.
3. Per category, the three largest single items with sizes and how they got in (loaded, echoed, viewed).
4. `node <plugin>/scripts/context-budget.mjs` output pasted for the corpus version used.
5. What held up (mechanisms that kept things out of the window) and what leaked (rule violations, with the rule number).
6. Proposals ranked by leverage, each with the share it attacks and the executor it moves work to.

## Verifying this release

```
node scripts/lint-skills.mjs
node scripts/context-budget.mjs
node --test tests/*.test.mjs
bash tests/hook-antislop.test.sh
bash tests/hook-shell-write-guard.test.sh
```
