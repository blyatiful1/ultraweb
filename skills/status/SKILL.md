---
name: status
description: Owns design/PROGRESS.md, the single where-are-we surface for a long build — which phase is running, whether anything is waiting on the user, when they will next be needed and for how long, what is already done, and which decisions are still cheap to change. The Lead rewrites the file at every phase boundary and at every checkpoint open and close; every status answer is read FROM the file, never re-derived by scrolling the transcript. Invoke whenever the user asks "where are we", "status", "what's happening", "is it still going", "did it finish", "what do you need from me", or returns after being away, and at every phase or checkpoint transition to keep the file true. It is also the first authority the root pipeline's resume ladder consults when a session is picked up cold.
---

# status — where are we, answered from a file

**Stage:** cross-cutting, at every phase boundary and checkpoint transition - **Reads:** design/PROGRESS.md (rebuilt from BRIEF/MOCKUPS/REVIEWS/SITEMAP/QA only when stale) - **Writes:** design/PROGRESS.md

A twelve-phase build runs long. The user should never have to read a transcript to learn what their own project is doing — scrollback is a log, not a status, and asking a person to reconstruct state from a log is the studio making the client do its job. `design/PROGRESS.md` is the answer, kept current by the build itself, and every status question is a file read.

## Standard

- **Four questions, ten seconds.** What phase are we in, what is running right now, are you waiting on me, when will you need me next and for how long. A first-grade PROGRESS.md answers all four above the fold, in that order, in plain sentences. Phase numbers alone are not an answer.
- **"Waiting on you" is the most important line in the plugin.** It is the one line a user checks to decide whether they can walk away. It must be accurate at every moment: an open checkpoint that reads "Nothing" is a defect on the level of a red gate shipped green. When nothing is blocked, say so and release them explicitly — "Nothing. Go do something else."
- **Bounded beats accurate.** Estimates are honest ranges seeded from the durations already measured in §Done, never invented precision. "~25 min away · ~5 min of your time" is useful; "4 min 30 s" is a lie with a decimal point.
- **Two clocks, always both.** How far away the next interruption is, and how much of the user's own time it costs. Someone deciding whether to start something else needs the second number more than the first.
- **Written before it is asked.** The file is rewritten on the build's transitions, not on demand. A status question must never trigger an investigation — if answering one requires reading anything but PROGRESS.md, the contract was already broken.
- **State, not verdicts.** PROGRESS.md says where the build is; `design/REVIEWS.md` says what was approved and in whose words. Never duplicate the ledger here — link to it.

## Process

1. **Create it at the first turn of Phase 1**, before the scoping interview, as soon as the working site name exists. Header line carries engagement level, scope, start time; §Now says "Phase 1/12 — Understand"; §Waiting on you says the interview is coming and how long it takes.
2. **Rewrite — never append — at every phase boundary.** The whole file is regenerated so §Now is always literally now. The only accumulating section is §Done, which gains one closed-phase line with its measured start–end times. An append-only PROGRESS.md is just the transcript again.
3. **At every checkpoint open:** set §Waiting on you to the open checkpoint, name what the user must do and how long it takes, and **print §Now and §Waiting on you verbatim to the terminal** alongside the checkpoint presentation. The file and the terminal say the same words; a user who was away reads one thing, not two.
4. **At every checkpoint close** (approved, approved-with-notes, or auto-passed), clear §Waiting on you in the same turn — before any work on the next phase starts. A stale block is worse than no file: it teaches the user to distrust the one line they rely on.
5. **Seed estimates from measurement.** Each §Done line records real elapsed time. The next estimate for a comparable phase comes from those numbers, widened to a range; before any phase has closed, use the pipeline's own coarse expectations and say the range is coarse. Re-estimate at every rewrite — an estimate that never moves was never a measurement.
6. **During Phase 5, `scaffold` appends per-step lines** under §Now (install, tokens wired, dev-server smoke test) because that phase is a visibly long silence and the user deserves a heartbeat. No other phase gets step-level lines — elsewhere they are noise dressed as transparency.
7. **Answer every status question from the file.** Read it, reply with §Now + §Waiting on you + §Next time I need you in the user's own register. If it is stale by more than one transition, rewrite it from the artifacts first, then answer, and say plainly that it had drifted.
8. **On resume, this file is authority one.** The root pipeline's resume ladder reads §Now before reconstructing anything from artifacts: artifacts say what was decided, §Now says what was in flight when the session stopped. Check it against the last artifact touched; rewrite it if they disagree.
9. **While `iterate` runs**, §Now shows the iterate scope and classified layer instead of a phase number — a post-ship change request is a build state too.

## PROGRESS.md format

Exactly this shape, in this order. Sections never get renamed, and none is ever dropped:

```md
# Progress — Kaffeewerk Ost
Engagement: guided · Scope: standard · Started 14:02 · Updated 17:41
## Now
Phase 6/12 — Build · homepage, 4 of 7 sections (product strip in progress)
## Waiting on you
Nothing. Go do something else.
## Next time I need you
CP4 first-page review · ~25 min away · ~5 min of your time
What you'll do: look at 2 screenshots (375 + 1440) and approve or name what's wrong.
## Done
✓ P1 Understand 14:02–14:11 · ✓ P2 Direction 14:11–14:40 (CP2 approved, round 1)
## Decisions you can still change later
Subscriptions = monthly only (assumed) · DE only (interview R1)
```

§Waiting on you holds either that release line or the open checkpoint and what it needs. §Decisions you can still change later carries BRIEF.md's §Assumed facts and any interview answer still cheap to reverse — a user who reads only this file still knows which doors are open.

## Anti-patterns

- "Waiting on you: Nothing" printed while a checkpoint question sits unanswered — the single failure this file cannot survive
- Answering "where are we" by re-reading the transcript instead of the file
- Appending status entries instead of rewriting §Now — an append-only file is a log, and the log is what the user came here to escape
- Fake precision: "3 min 20 s remaining" on work nobody has measured
- A §Now that is only a phase number and a skill name — the user does not run this pipeline, they own the site
- Opening a checkpoint without printing §Now and §Waiting on you to the terminal
- Copying checkpoint verdicts into PROGRESS.md — REVIEWS.md owns the ledger, this owns the state
- Step-by-step narration outside Phase 5's scaffold heartbeat — transparency theater buries the four questions
- Leaving §Waiting on you populated after an approval "until the next rewrite"

## Worked example — Kaffeewerk Ost, guided build, hour three

The roastery build opened PROGRESS.md at 14:02 with §Now reading *Phase 1/12 — Understand* and §Waiting on you holding the scoping interview (*4 questions, ~2 min of your time*). Phase 1 closed at 14:11, Phase 2 at 14:40; both landed in §Done with real times, which is what makes the current estimate honest: two measured phases averaging 20 minutes seed CP4 as *~25 min away*, a range, not a promise.

At 17:41 the user comes back from lunch and types "where are we". The answer is a file read — §Now (*Phase 6/12 — Build · homepage, 4 of 7 sections, product strip in progress*), §Waiting on you (*Nothing. Go do something else.*), §Next time I need you (*CP4 · ~25 min away · ~5 min of your time · you'll look at 2 screenshots and approve or name what's wrong*). No transcript scrolled, no phases re-derived.

Twenty minutes later CP4 opens. §Waiting on you flips to *CP4 first-page review — 2 screenshots (375 + 1440), approve or name what's wrong*, and the Lead prints §Now and §Waiting verbatim above the screenshots. The verdict — *"the product cards feel cramped on the phone"* — is logged in REVIEWS.md, not here; PROGRESS.md only moves §Now to *Phase 6/12 — Build · CP4 round 1, cards revision*. On approval §Waiting clears in the same turn, before the first inner page starts.

Rejected alternative: emitting a live progress bar per section instead of a rewritten file. It looks more responsive and answers none of the four questions — it cannot say whether the user is blocked, and it vanishes with the scrollback, taking the resume ladder's first authority with it.

## Composes with

- ultraweb:checkpoint — every open checkpoint is a §Waiting on you line and prints §Now + §Waiting to the terminal; after CP2 it prints the session map of remaining phases and checkpoints, which this file then holds.
- root `SKILL.md` — the resume ladder reads §Now before reconstructing from artifacts, and the engagement level set there decides how often the user appears in §Next time I need you.
- ultraweb:scaffold — the only skill permitted to append step lines under §Now, during Phase 5's long silence.
- ultraweb:iterate — while a change request runs, §Now shows its scope and classified layer instead of a phase number.
- ultraweb:brief — §Decisions you can still change later is §Assumed facts made visible while reversing them is still cheap.
- ultraweb:mockup — CP2's round state lives in §Now and §Waiting; the Approved line stays in MOCKUPS.md.
- ultraweb:ship — the last rewrite: §Now becomes the shipped state and §Waiting on you names the deploy confirmation while it is open.
