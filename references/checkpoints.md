# checkpoints

How the three guided-mode checkpoints run, the `design/PROGRESS.md` format, and the resume procedure.

Load when: Phase 2 opens CP1, Phase 5 opens CP2, Phase 8 opens CP3, or a session resumes in a folder that contains `design/`.
Reads: the phase's artifacts and `qa/` outputs. Writes: `design/PROGRESS.md`.

## The checkpoints

In autonomous mode none of these block. Decide what the user would have been asked, log it under `## Assumptions`, and continue.

| CP | Opens after | Show | Question |
|---|---|---|---|
| CP1 Direction pick | the mockup round (`references/mockup.md`) | `design/mockups/index.html` contact sheet plus one line per candidate on what it argues | Which direction? Pick one, combine named elements from two, or ask for a new round |
| CP2 Homepage review | the built homepage passes `--quick` gates and one judge round | screenshots at 375 and 1440 from `qa/shots/`, the local URL, a preview URL when Vercel auth exists, and the judge's top three defects with what you fixed | Does the built homepage match the direction you picked? |
| CP3 Acceptance | Phase 7 ends with no FAIL and a judge SHIP | the gate table from `qa/GATES.md`, one screenshot per route, a list of things to click (forms, checkout, 404, theme toggle), a preview URL, and every UNVERIFIED check by name | Do you accept the site for shipping? |

Procedure for every checkpoint:

1. Write the open checkpoint into PROGRESS.md `## Checkpoints` before presenting it.
2. Present a summary the user can read in a minute, with file paths for the rest. Attach screenshots for the user; view at most two yourself.
3. Ask one question with AskUserQuestion when it is available: `Approve` first, then `Request changes`, then at CP1 and CP2 `Rethink the direction`. Free text is always allowed. Without the tool, ask the same three options in plain text and wait.
4. Treat a reply as one round of feedback. Collect a reply that arrives in pieces until the user says they are done, then apply it as one round.
5. Apply changes at their source: color or type feedback changes `design/SYSTEM.md` and the token CSS, wording changes the copy deck in `design/SITEMAP.md`, a missing page changes `design/BRIEF.md` and SITEMAP.md, a dislike of the overall look returns to CP1. Do not patch the complaint site with one-off values.
6. Re-present only what changed.
7. Allow two feedback rounds per checkpoint. A third request at the same checkpoint means an earlier phase is wrong. Name that phase to the user, reopen it, and log the escalation.
8. Log the verdict in PROGRESS.md close to the user's words, ending with `Approved`, `Approved with notes` or `Auto-passed (autonomous)`. A checkpoint without one of these is open.

CP3 is never opened while any gate is FAIL. The user is the acceptance test, not the first tester. Phase 8 does not deploy past an open CP3.

## PROGRESS.md format

Create it in Phase 1. Rewrite `## Now` at every phase boundary and checkpoint change. Append to the other sections; never delete their entries.

```md
# Progress — <site name>
Plugin: <absolute plugin path> · Mode: guided · Tier: standard · Started <date time>

## Now
Phase 5 — Scaffold and homepage. Waiting on you: CP2 homepage review.
Servers: dev http://localhost:3000 (pid 41822)
Last gates: qa/gates.json round 2, FAIL (a11y.contrast on /)

## Phases
- [x] 0 Preflight — Playwright ok, Vercel auth missing (no preview URLs)
- [x] 1 Brief — design/BRIEF.md
- [x] 2 Direction — CP1 approved, candidate B
- [x] 3 System
- [x] 4 Structure and copy
- [ ] 5 Scaffold and homepage

## Checkpoints
### CP1 Direction pick
Shown: A, B, C (design/mockups/index.html)
Round 1: "B, but with A's type" → B with A's type scale, recorded in DIRECTION.md
Approved

### CP2 Homepage review
Shown: qa/shots/home-375.png, qa/shots/home-1440.png
(open)

## Assumptions
- Monthly subscriptions only; the brief did not say.

## Lessons
- shadcn init rewrites the token CSS: add tokens after init.
- A second dev server silently takes the next port; check the pid in ## Now first.
```

`## Now` says the phase, whether the build is waiting on the user, the running servers with ports and pids, and the last gates result. Record servers when you start them and correct the line when they restart. Starting a second server because the first is unrecorded makes every screenshot unreliable.

`## Lessons` holds what a fresh context must not re-learn: one line per lesson, symptom, cause and rule. Add a line after any bug that survived two fix attempts, any tooling detour, and any environment fact that contradicted an assumption. Leave it empty when nothing was learned.

## Resume

Run this before any other work when a session starts in a folder containing `design/`, when the user says "continue", "resume" or "where were we", and after a context compaction.

1. Read `design/PROGRESS.md` in full. If it exists, it is authoritative: take the phase from `## Now`, apply `## Lessons`, and check `## Now` against the newest artifact on disk. If they disagree, trust the disk and rewrite `## Now`.
2. If PROGRESS.md is missing, reconstruct the position from the evidence table in the root `SKILL.md` §Resuming, then confirm it with `git log --oneline`. Commits named `ultraweb: phase N — …` mark completed phases.
3. Look for an open checkpoint: an entry in `## Checkpoints` without a verdict line, or for a reconstructed build, mockups present but no `design/DIRECTION.md`. Present it again and tell the user they were mid-review.
4. Check servers. A pid in `## Now` that no longer runs is stale. Start the server again and record the new pid.
5. Read the references for the current phase. Do not redo any completed phase, and never rewrite DIRECTION.md or SYSTEM.md on resume.
6. Rewrite `## Now`, tell the user in three lines where the build stands and what happens next, and continue without asking unless a checkpoint is open.
