# Small-model smoke test, 2026-11-24

Not an evaluation. Two briefs, one build per arm, graded unblinded by the same session that wrote the plugin changes. It was run to find out whether the smallest Claude model could follow version 2 at all, and what it produced. Read it as a bug hunt with screenshots.

## Setup

- Model: the smallest Claude tier, for every build.
- Briefs: `evals/briefs/bakery.md` and `evals/briefs/game-launch.md`, prompt pasted verbatim plus "a one-page static site".
- Arm `plain`: no plugin, "make it as good as you can".
- Arm `ultraweb`: the root skill followed phase by phase, sketch tier, autonomous mode, static path. No judge round, because the test harness could not launch the judge agent.
- Gates: the final `scripts/gates.mjs`, `--only content,a11y,responsive,perf,tells`, homepage only, run on all builds after the fact.

## Results

| Brief | Arm | Tokens | Wall clock | Gates | Failing checks |
|---|---|---|---|---|---|
| bakery | plain | 113k | 1 min 50 s | FAIL, 8 of 30 | links, axe, contrast, forms, keyboard, 24 px targets, 44 px targets |
| bakery | ultraweb | 278k | 9 min 13 s | PASS | none |
| game launch | plain | 118k | 2 min 17 s | FAIL, 9 of 30 | links, alt and labels, axe, contrast, forms, keyboard, text spacing, 44 px targets |
| game launch | ultraweb, first run | 243k | 8 min 41 s | PASS | none |
| game launch | ultraweb, after the fixes below | 259k | 11 min 20 s | PASS | none |

## What the screenshots showed

- **Bakery, plain.** Cream ground, serif display, brown accent, tracked eyebrow, pill badge, three stat cards, gradient boxes standing in for bread photographs: the warm-editorial default. Rich in detail (prices, weights, an open-or-closed line), all of it invented without marking.
- **Bakery, ultraweb.** A concept taken from the brief (the night bake as a timetable), German legal pages, a 404, a share image, nothing fabricated. Visually sparse: no imagery, three plain cards, no prices or weights, hours below the first screen.
- **Game launch, plain.** An illustrated night scene with a lighthouse, beam and moon filling the first screen. The most attractive first screen of the five.
- **Game launch, ultraweb, first run.** A pale page built on a "keeper's log" document metaphor, a small crude drawing, motion at the lowest level, and a "will not" list that ruled out the kit's shader and particle moments. Correct and timid: clearly weaker than the plain build.
- **Game launch, ultraweb, after the fixes.** A full-bleed night coast with a sweeping beam and a strong headline. About level with the plain build on first impression, behind it on illustration detail, ahead on hierarchy, copy, honesty of placeholders and every measured check.

## What changed because of it

1. The guidance was all restraint, and a small model applies restraint to the idea itself. `references/taste.md` now has a first-screen rule, and `references/direction.md` an ambition floor per site kind that `scripts/check-phase.mjs` enforces.
2. Careful builds came out thin because nothing could be invented. `references/brief.md` now says to draft realistic prices and hours, mark each with `data-assumed`, and build as a demo; the gates list the drafts and ship blocks them from production.
3. Fourteen smaller defects in scripts and references, from the builds' own friction reports (a colour value one script dealt and another rejected, a false keyboard trap on date inputs, a cascade trap in the kit stylesheet, `aria-label` on a paragraph, wrong paths in two references).

## What it does not show

- That ultraweb makes a small model's sites better looking. On these two briefs it made them correct, accessible and honest, at 2.1 to 2.5 times the tokens and four to five times the wall clock, and after one round of fixes roughly level on looks.
- Anything about kit moments in practice: both guided builds declined the picked moment and drew their own first screen.
- Anything about stronger models, the standard or flagship tiers, the Next path, or the judge loop.

The blind protocol in `evals/README.md` is still the missing measurement.
