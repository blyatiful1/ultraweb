# evals

Blind comparison of what different setups produce from the same client brief.

## Arms

| Arm | Setup |
|---|---|
| `baseline` | Plain Claude Code, no design plugin or skill. |
| `frontend-design` | Claude Code with the frontend-design skill only. |
| `taste-skill` | Claude Code with the taste skill only. |
| `ultraweb-sketch` | ultraweb, tier `sketch`, autonomous mode. |
| `ultraweb-standard` | ultraweb, tier `standard`, autonomous mode. |

Run the set once with the strongest model you have and once with the smallest. The plugin is meant to lift a small model by giving it tested parts to assemble, so the small-model pair is the more informative one.

Rules for every arm:

- Same model, same effort setting, same prompt per brief. The prompt is the text under
  `## Prompt` in `briefs/<name>.md`, pasted verbatim, with nothing appended. Arms that need a
  tier or mode word (ultraweb) get only that word added.
- One fresh session per arm per brief, empty working folder, no earlier context.
- ultraweb runs autonomous: it must not ask questions and nobody answers any. If a run stalls
  on a question, record it as `stalled` in meta.json and do not nudge it.
- Give every arm the same ceiling (wall-clock and a token budget, set before starting) and
  the same deploy target. Do not fix anything by hand afterwards.

## Record per run

Create `evals/runs/<run-id>/meta.json`. Run ids look like `bakery-baseline-1`.

```json
{
  "run": "bakery-baseline-1",
  "brief": "bakery",
  "arm": "baseline",
  "model": "claude-...",
  "started": "ISO time", "finished": "ISO time", "wall_clock_s": 0,
  "tokens": { "input": 0, "output": 0, "cache_read": 0, "cache_write": 0 },
  "url": "https://... or null", "folder": "path or null",
  "status": "complete | stalled | failed",
  "notes": ""
}
```

Tokens come from the session transcript (`~/.claude/projects/<project>/<session>.jsonl`): sum
`message.usage` over assistant turns, including subagent transcripts. `capture.mjs` adds a
`qa` block (gates verdict) to the same file and keeps what is already there.

## Capture

```
node evals/capture.mjs --run bakery-baseline-1 --url https://example.com [--routes /,/menu]
```

Writes `runs/<run-id>/shots/` (desktop 1440x900 and mobile 390x844, wheel-scrolled steps, cap 8
per viewport, plus full-page shots), a contact sheet per viewport, and, when
`scripts/gates.mjs` exists, `qa/` and its verdict. Needs Playwright (project, then global).
Capture every run of a brief the same day, with the same routes.

## Grade blind

```
node evals/compare.mjs --brief bakery --runs bakery-baseline-1,bakery-ultraweb-standard-1,... \
  --out evals/compare/bakery.html
```

Open the page. Every pair of runs is shown side by side, left and right randomised, arm
names hidden. For each pair choose left, right or tie on four axes: design, usability,
creativity, content. Read `briefs/<name>.md` checklist first, and do not open meta.json or
the QA output until you have exported. Use "Export JSON" and save it as
`runs/results-<brief>-<grader>.json`. Then press Reveal for win rates per arm, cost and gate
verdicts.

## Read the result

Win rate per arm is wins plus half of ties over comparisons. Look at each axis separately;
an arm that wins design and loses usability is a finding. Put cost next to quality: tokens,
wall-clock and gate verdict. Compare across briefs before claiming anything general.

## Caveats

- Small n: six briefs, one run per arm unless you repeat. Generation varies run to run; repeat
  runs before believing a small gap.
- One grader unless you recruit others; the grader may recognise a plugin's look despite
  hidden labels. Use more graders, and record whether the grader guessed arms.
- Genre effects: an arm may suit a genre and not others. Report per brief.
- Deployment and capture differences (fonts, hosting, cold starts) can look like quality
  differences. Capture the same way for all.
- Gate verdicts measure rule compliance, not taste. Shots and the grader are the quality signal.
