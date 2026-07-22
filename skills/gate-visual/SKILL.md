---
name: gate-visual
description: The self-critique loop that separates working from first-grade — screenshots every page light and dark via the pixel-qa subagent, delegates scoring to the design-judge subagent against design/DIRECTION.md and the taste rubric (hierarchy, typography, spacing, color, distinctiveness, craft — 1–10 each), fixes the worst-ranked defect, re-shoots, and repeats — minimum 2 full rounds, stopping only on a SHIP verdict. Invoke in Phase 11 of the ultraweb pipeline after gate-code and gate-responsive are green, after any major visual change to an ultraweb site, or when the user says "is it actually good", "critique the design", "judge the site", or "run the visual gate". Writes per-round scores, defects fixed, and screenshot paths to design/QA.md.
---

# gate-visual — critique until it ships

**Stage:** Phase 11 — Gates (after gate-code + gate-responsive) - **Reads:** running dev server, design/DIRECTION.md, design/SYSTEM.md, agents/design-judge.md, agents/pixel-qa.md - **Writes:** design/QA.md entry + qa/visual/round-N/*.png + design fixes

## Standard

The site is judged the way a client would judge it: from pixels, by a critic with no stake in the code. You never grade your own work — the design-judge subagent runs in fresh context and scores screenshots against DIRECTION.md and the taste constitution. First-grade means a SHIP verdict: ≥7/10 on all six rubric axes for every page, zero banned-list violations, and the committed direction plus signature move visibly delivered — not described in DIRECTION.md and absent on screen.

Score Distinctiveness against the award-canon invariants (`award-canon`): a committed point of view, ONE signature move executed ~20% past comfortable (two competing signatures LOWER the score, not raise it), and craft in the corners — 404, footer, and loader matching the homepage. The jury weights Design + Usability at ~70% and Creativity at ~20%, so a janky wow move is a net loss; ≥7 on all axes clears the Honorable-Mention floor and puts SOTD contention in reach.

## Checklist

1. Preconditions green: gate-code, gate-responsive
2. Every page screenshotted, light AND dark
3. Scored by design-judge, never self-scored
4. Worst-ranked defect fixed each round
5. ≥2 full rounds completed
6. Final verdict SHIP recorded with evidence

## The loop

1. **Preconditions:** gate-code and gate-responsive show PASS in design/QA.md. Judging a broken or overflowing site burns judge rounds on defects other gates own.
2. **Shoot (round N):** delegate to pixel-qa — full-page screenshots of every route at 1440×900, light AND dark theme, saved to `qa/visual/round-N/<route>-<theme>.png`. Dark mode is a first-class design per the taste required list — a light-only shoot judges half the site.
3. **Judge:** delegate to design-judge with the round-N directory + project root. It reads DIRECTION.md and SYSTEM.md first, scores each page 1–10 on hierarchy / typography / spacing / color / distinctiveness / craft, sweeps for banned-list violations (each an automatic defect), and returns a ranked defect list + verdict: SHIP / FIX-THEN-SHIP / NOT-CLOSE.
4. **Fix worst-first:** take the #1 ranked defect plus any lower defects sharing its root cause — one undersized type scale usually explains three separate "weak hierarchy" hits. The judge names the owning skill per defect; go there for the fix rules. Resist fixing #7 because it's easier than #1.
5. **Re-shoot, re-judge:** fresh captures — affected pages minimum, all pages if the fix touched tokens in globals.css — into `round-N+1/`, then a fresh judge round on the new directory. A fix without a new screenshot doesn't exist.
6. **Repeat until SHIP** — but never fewer than 2 full judge rounds, even when round 1 says SHIP: a first-round SHIP gets re-tested, not trusted. Hard cap 5 rounds: past that you're polishing noise or fighting the direction — record residual defects in design/QA.md, surface them to the user with the judge's verbatim wording, and stop looping.

## Delegation payloads

Both subagents work only as well as what you hand them. Payloads, exactly:

- **pixel-qa:** dev-server URL, the full route list from design/SITEMAP.md, viewport 1440×900, both themes (toggle via the theme switch or `.dark` on `<html>`), full-page capture, output directory `qa/visual/round-N/`. Nothing else — no hints about what to look for.
- **design-judge:** the round-N screenshot directory, the project root (it reads design/DIRECTION.md and design/SYSTEM.md itself), and the taste constitution path. Never a summary of the direction in your own words — paraphrase drifts, and the judge must score against the written contract.
- **Returning fixes:** the judge's defect lines name the owning skill ("hero headline undersized — see typography scale rules"). Open that skill before editing; a fix that ignores the owner's rules usually trades one defect for another.

## How to verify

- Captures exist before judging: `ls qa/visual/round-N/` lists every route × both themes — a missing file means shoot again, not "judge what we have"
- Judging happened in fresh context: design-judge was invoked as a subagent with file paths — never scored inline in your own reasoning
- Scores in QA.md are the judge's verbatim numbers — never rounded up, averaged, or paraphrased into "mostly strong"
- Each round's fix is a nameable diff (file + what changed) paired with the round-N+1 capture that shows it
- Score trajectory is monotone or explained: an axis that DROPS after a fix means the fix fought the direction — revert and re-read DIRECTION.md before variation three

## Pass criteria

Final round verdict SHIP; every page ≥7 on all six axes (design-judge cannot say SHIP otherwise — enforce it if it tries); zero banned-list violations in the final sweep; ≥2 completed rounds; full round history — scores, defects, fixes, screenshot paths — in design/QA.md. FIX-THEN-SHIP is not a pass: apply the named fixes and run the next round.

## QA.md entry

```markdown
## gate-visual — 2026-07-16 — PASS (SHIP, round 3)
| Round | Verdict | Lowest axis (page) | Worst defect → fix | Evidence |
|-------|---------|--------------------|--------------------|----------|
| 1 | NOT-CLOSE | typography 5 (/) | hero display too small, no scale contrast → clamp() ceiling raised, tracking tightened per typography | qa/visual/round-1/ |
| 2 | FIX-THEN-SHIP | spacing 6 (/pricing) | uniform section padding, wallpaper rhythm → compression/release per layout-grid | qa/visual/round-2/ |
| 3 | SHIP | all ≥7 | — | qa/visual/round-3/ |
Banned-list violations: 0 in final sweep. Issues fixed: 2. Residual defects: none.
```

## Anti-patterns

- Self-scoring: "I reviewed the screenshots and they look strong" — the judge scores, you fix
- Homepage-only rounds — every route ships, every route gets judged
- Light-mode-only screenshots — dark mode is a design, not a filter
- "Fixed" with no round-N+1 capture — unverified by definition
- Coaching the judge beyond DIRECTION.md/SYSTEM.md ("note the hero is intentionally sparse") — if the direction needs defending, write it into DIRECTION.md where the judge reads it
- Fixing "boring" with effects — taste's rule: the fix is hierarchy or asymmetry, never a gradient, a glow, or another animation
- Stopping at FIX-THEN-SHIP because round-3 fatigue set in
- Arguing scores down — disagreement resolves by re-reading taste + DIRECTION.md, and taste wins
- Shotgunning ten fixes in one round — untraceable; one root cause per round keeps cause and effect visible
- Cropping or cherry-picking captures to flatter a fix — the judge sees full pages at full attention or the round is void

## Worked example — Studio Norra, Editorial Brutalist agency portfolio

DIRECTION.md contract the judge scored against each round: hero display in Archivo Expanded — "oversized, uppercase, tight tracking" — and signal red `oklch(0.6 0.21 25)` used ONLY for interaction states. Round 1 shot all five routes (`/`, `/work`, `/work/[slug]`, `/studio`, `/contact`) at 1440×900, light + dark, into `qa/visual/round-1/`.

```markdown
## gate-visual — 2026-05-14 — PASS (SHIP, round 3)
| Round | Verdict | Lowest axis (page) | Worst defect → fix | Evidence |
|-------|---------|--------------------|--------------------|----------|
| 1 | NOT-CLOSE | distinctiveness 4 (/studio) | signal red painted as a static fill behind the team grid — DIRECTION.md reserves red for interaction states → fill reverted to ink `oklch(0.2 0.01 270)`, red restored to focus-visible + hover only (ultraweb:color owns) | qa/visual/round-1/ |
| 2 | FIX-THEN-SHIP | typography 6 (/work) | Archivo Expanded index headings capped at 3rem, no scale contrast vs Inter body → ceiling raised to `clamp(2.5rem, 8vw, 7rem)`, tracking tightened to `-0.03em` (ultraweb:typography owns) | qa/visual/round-2/ |
| 3 | SHIP | all ≥7 | — | qa/visual/round-3/ |
Banned-list violations: 0 in final sweep. Issues fixed: 2. Residual defects: none.
```

Rejected: bundling the /work type-scale fix into round 1 alongside the red-leak fix — two root causes in one diff hides which change moved distinctiveness vs typography; one defect per round kept both fixes independently verifiable against their round-N+1 capture. Handoff: the round history in design/QA.md is read by ultraweb:ship, which blocks the release while any gate row reads below SHIP.

## Composes with

- design-judge (subagent) — the scorer; this gate is its delivery mechanism
- pixel-qa (subagent) — the camera; shoots every round's evidence
- ultraweb:direction — DIRECTION.md is the contract every round is judged against; a defect in the direction itself goes back there, not to component fixes
- ultraweb:gate-antislop — run it before this gate so judge rounds spend on real design defects, not greppable clichés
- ultraweb:typography — owns the most common round-1 defect: undersized display type and weak scale contrast
- ultraweb:layout-grid — owns the second most common: wallpaper rhythm and missing asymmetry
- ultraweb:gate-responsive — precondition: its PASS must be recorded in design/QA.md before round 1, so the judge scores settled layouts instead of the overflow and orphan defects the responsive gate already owns
- ultraweb:award-canon — supplies the invariants and jury model the Distinctiveness axis is scored against; the design-judge rubric quotes them
