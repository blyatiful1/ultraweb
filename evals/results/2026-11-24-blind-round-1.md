# Blind round 1, 2026-11-24

Six briefs, three arms, one build per cell, all by the smallest Claude model as one-page static sites. One grader (the plugin's owner) picked a favourite per brief from anonymised side-by-side captures: first screen, phone view and whole page, arms hidden behind letters shuffled per brief.

## Arms

- `plain`: no plugin or skill.
- `frontend-design`: Anthropic's frontend-design skill, about 9 KB.
- `ultraweb`: this plugin at `5664510`, sketch tier, autonomous mode, static path. No judge round.

## Picks

| Brief | Picked | Gates passed by |
|---|---|---|
| bakery | frontend-design | ultraweb only |
| game launch | frontend-design | ultraweb only |
| architecture | frontend-design | none (ultraweb failed one check, the others four each) |
| code review | ultraweb | ultraweb only |
| hotel | frontend-design | ultraweb only |
| nonprofit report | plain | ultraweb only |

frontend-design 4, ultraweb 1, plain 1.

## Cost and gates

| Arm | Mean tokens | Mean build time | Homepage gates passed |
|---|---|---|---|
| plain | 131k | 3 min 12 s | 0 of 6 |
| frontend-design | 141k | 3 min 57 s | 0 of 6 |
| ultraweb | 254k | 10 min 11 s | 5 of 6 |

Plain builds failed 3 to 10 checks, frontend-design builds 4 to 7 (forms, keyboard, contrast, tap targets most often).

## What the grader said

None of the eighteen pages used photographs, and the bakery and the architecture studio would have been better with them. Pictures should not be required, but those two wanted them.

## Reading

On looks the 9 KB skill beat ultraweb four to one, at a little over half the tokens. ultraweb's pages were correct and shorter: five to seven screens against five to sixteen, less drawn imagery, one ground where the winners used several. Its builder spent most of its effort on the process (about 190 KB of references, two mockups nobody chose between, five artifacts) and less on the page.

## Changes made in response

1. A single short reference, `references/sketch.md`, replaces the Phase 3 to 6 reading list for one-page static builds, and autonomous builds no longer make mockups.
2. `scripts/photos.mjs` finds openly licensed stand-in photographs with credits; `references/imagery.md` says when photographs lead and how stand-ins are marked; the gates list them and ship blocks them from production.
3. The builder is told to look at its own screenshots and fix what it sees. Only the verdict stays with the judge.
4. `scripts/measure/density.mjs`: an empty screen or body copy mostly under 16px now fails the gates. Calibrated on these eighteen builds; it would not by itself have changed this round's ultraweb pages.

Round 2 rebuilds the ultraweb arm with these changes and grades again against the same plain and frontend-design builds.

## Limits

One grader, one build per cell, one model, one tier. The grader had seen labelled first screens of two briefs (bakery and game launch, earlier builds) before grading. Captures and builds are not in the repository.
