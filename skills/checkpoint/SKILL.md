---
name: checkpoint
description: The client-review mechanic for ultraweb builds — six named checkpoints modeled on how real studios run web projects (brief read-back, direction approval, structure sign-off, first-page review, voice review, preflight/UAT), each with a presentation format, a consolidated-feedback round discipline (two rounds, then it's a scope question), verdict routing to the owning skill, and a written ledger in design/REVIEWS.md. Which checkpoints block is set by the session's engagement level (hands-off / guided / studio) in the root skill. Invoke whenever the pipeline reaches a checkpoint the engagement level activates, or when the user asks to review progress mid-build ("show me where we are", "let me see it before you continue", "I want sign-off steps"). Unattended sessions never stall: a checkpoint that cannot get an answer auto-passes and logs it.
---

# checkpoint — the client is a phase, not an interruption

**Stage:** cross-cutting, at phase boundaries the engagement level activates - **Reads:** the finishing phase's artifacts - **Writes:** design/REVIEWS.md (+ verdicts routed to owning skills)

## Standard

A first-grade checkpoint is cheap to sit through, expensive to skip, and impossible to misremember:

- **Cheap:** the presentation is a compact read — a summary the user absorbs in under a minute, plus the real artifact (file, screenshot) for those who want to look closer. A checkpoint that dumps raw artifacts on the user is the studio making the client do its job.
- **Expensive to skip:** each checkpoint exists because getting its question wrong is costly downstream — that is the performance argument. Approving structure before build prevents rebuilding pages; approving one real page before rolling out N prevents N-page rework; QA before the user ever sees staging prevents the client being first QA, which real studios treat as a cardinal error.
- **Impossible to misremember:** every verdict lands in design/REVIEWS.md near-verbatim, and approvals are written lines, not vibes. Real studios get written sign-off at milestones because "I thought we agreed" is the most expensive sentence in the industry.
- **Never a stall:** a checkpoint that cannot reach a human (non-interactive session, scheduled run) auto-passes with `Auto-passed (unattended)` logged, and the build continues on the pipeline's own judgment. Human-in-the-loop is a quality upgrade, never a deadlock.

## The six checkpoints

Modeled on the studio milestone cadence: client involvement peaks at discovery and design approval, thins during production, and returns for acceptance. Which ones block is the engagement level's call (root SKILL.md); the mechanics here are the same for all.

| # | Name | After | The question it settles | Present |
|---|------|-------|------------------------|---------|
| CP1 | Brief read-back | Phase 1 | "Did we understand the job?" | Brief summary + §Assumed facts as a correctable list |
| CP2 | Direction approval | Phase 2 | "Is this how it should look?" | The three mockups (`ultraweb:mockup` owns this round) |
| CP3 | Structure sign-off | Phase 4 | "Are these the right pages, saying the right things?" | Page list + one line per section per page |
| CP4 | First-page review | Phase 6, homepage first | "Is the real thing what the mockup promised?" | The built homepage: screenshots at 375 and 1440 + the running route |
| CP5 | Voice review | Phase 8 | "Does it sound like us?" | Every headline + one representative body block per page |
| CP6 | Preflight / UAT | Phase 11 green | "Do you accept this site?" | Gate summary, full-page screenshots per route, what-to-click list |

CP4 exists because of the build-order rule it enforces: **the homepage is built completely before any inner page.** It exercises the entire system — tokens, hero, navigation, footer, section rhythm — so a system-level defect is found and fixed on one page, not rolled across all of them. This is the single largest rework saving in the pipeline, and it is how studios present a "homepage design concept" before touching inner pages.

CP6 has a hard precondition: every gate in design/QA.md is green BEFORE the user sees anything. The user reviews a working site with real content — never lorem, never a broken form. They are the acceptance test, not the smoke test. If ship's deploy step runs, CP6's approval is what authorizes reaching for it; ship's own final deploy confirmation still applies.

## Process

1. Assemble the presentation per the table — summary first, artifacts attached. Screenshots wherever the artifact is visual; never describe pixels in prose when a screenshot exists.
2. Ask ONE structured question (AskUserQuestion): **Approve** (first option) / **Request changes** / at CP2–CP4 also **Bigger problem — revisit direction/scope**. Free text always available. Never ask open-ended "thoughts?" — the studio proposes, the client disposes.
3. Log the round in design/REVIEWS.md (format below), verdict near-verbatim.
4. On **Request changes**: treat the reply as ONE consolidated round. Route each item to its owning skill (table below), apply, re-present ONLY what changed. This is a revision round, not a new build.
5. Round discipline: **two consolidated rounds per checkpoint.** A third request means the problem is not at this checkpoint — something upstream is wrong. Stop revising, name the upstream phase, reopen it deliberately (via `ultraweb:iterate` semantics), and log the escalation. This mirrors industry practice: 2–3 rounds is the standard, and endless polishing is a scope failure, not diligence.
6. On **Approve** (or unattended): write the Approved line and continue the pipeline. Downstream phases may verify the line exists exactly as Phase 3 verifies MOCKUPS.md's.

## Verdict routing

| Feedback names… | Route to | Never |
|---|---|---|
| Colors, contrast, "too dark/bright" | `color` → `tokens` recompile | Inline hex edits in components |
| Fonts, "hard to read", type size | `typography` → `tokens` | Per-component font overrides |
| Layout, spacing, "cramped/empty" | `layout-grid`, the section's component skill | Arbitrary margin pokes |
| Wording, tone, a specific headline | `copywriting` | Editing copy without the voice rules |
| A missing/extra page or section | `brief` §Pages + `sitemap` — this is scope | Quietly adding it in place |
| "I don't like it" (direction-level) | Back to CP2 — re-run the mockup round | Redecorating a direction the user has rejected |
| Motion "too much/distracting" | `motion-language` → the offending motion skill | Deleting animation ad hoc |

Routing through the owning skill keeps the artifact contract intact: the fix lands in SYSTEM.md/tokens once and propagates, instead of forking the design at the complaint site.

## REVIEWS.md format

```md
# Reviews — <working site name>
Engagement level: <hands-off | guided | studio> — <how it was set: user words / default / unattended>
## CP4 — First-page review
Presented: homepage at /, screenshots 375+1440 (design/screenshots/cp4/)
Round 1: "nav feels heavy, otherwise great" → routed: navigation (weight variant)
**Approved** (round 2)
## CP6 — Preflight / UAT
Presented: 7/7 gates green, per-route screenshots, click-list (form, cart, 404)
**Approved** — cleared for ship
```

One block per activated checkpoint, in pipeline order. `**Approved**`, `**Approved with notes**`, or `**Auto-passed (unattended)**` — a checkpoint block without one of these is an open checkpoint, and Phase 12 refuses to run past an open CP6 the same way it refuses a red gate.

## Anti-patterns

- Presenting raw artifacts with no summary — the client hired a studio, not a file browser
- Blocking an unattended session on a question — auto-pass and log; never deadlock a scheduled run
- Accepting feedback as a drip-feed — one round is one consolidated batch; ask the user to gather it if it arrives piecemeal
- A third revision round at the same checkpoint — that is an upstream defect wearing a feedback costume; escalate, don't sand
- Fixing checkpoint feedback inline instead of routing to the owning skill — forks the design system at the complaint site
- Letting the user first-QA a broken site — CP6 strictly after gates are green
- Inner pages built before the homepage is approved at CP4 (guided/studio) — rolls unverified system decisions across the site
- Re-presenting the whole site after a change round — show what changed, link the rest

## Worked example — Kaffeewerk Ost, guided level

Guided activates CP2, CP4, CP6. CP2 ran inside `mockup` (Warm Organic + Swiss-grid twist approved). Phase 6 builds `/` completely first — roast-curve hero, nav, product strip, footer — and CP4 presents two screenshots plus the route. Verdict, round 1: *"the curve is perfect. The product cards feel cramped on the phone."* Routed to `cards` (group layout at 375px) — not an inline padding poke — re-present the one changed screenshot; **Approved** (round 2). Inner pages (`/shop`, `/abo`, `/roesterei`, `/kontakt`) roll out only now, inheriting the fixed card rhythm — the defect was paid for once instead of five times. After Phase 11 turns QA.md green, CP6 presents the gate table, five route screenshots, and a click-list (add to cart, checkout in test mode, contact form, 404 page). **Approved — cleared for ship**; `ship` still asks its own deploy confirmation before Vercel.

Rejected alternative: a checkpoint after every one of the twelve phases — that is not "more human in the loop", it is a client meeting every hour. The six live where the research says involvement earns its cost: discovery, design approval, acceptance.

## Composes with

- root `SKILL.md` — owns the engagement-level dial that decides which checkpoints block; this skill owns how any activated checkpoint runs.
- ultraweb:mockup — IS CP2; its MOCKUPS.md Approved line doubles as the CP2 ledger entry (REVIEWS.md links to it rather than duplicating).
- ultraweb:brief — CP1 presents its §Assumed facts; corrections land back in BRIEF.md as committed decisions.
- ultraweb:wireframe / ultraweb:sitemap — CP3 presents their SITEMAP.md; scope verdicts route to brief first.
- ultraweb:copywriting — CP5's owner for every voice verdict.
- ultraweb:gate-visual / ultraweb:gate-responsive — their screenshots are CP4/CP6 presentation material; checkpoints reuse, never re-shoot.
- ultraweb:ship — runs only past an Approved (or auto-passed) CP6; keeps its own deploy confirmation.
- ultraweb:iterate — the escalation path when a checkpoint's third round exposes an upstream defect, and the home of all post-ship feedback.
