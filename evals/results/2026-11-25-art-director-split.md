# A strong model designs, the smallest builds, 2026-11-25

One new brief, two arms, one grader, blind.

**Brief.** An eight-room inn on a tidal island; the causeway floods twice a day, and the client wants the tide to be the main thing on the page. Both arms independently made a live tide chart with the safe crossing windows the centre of the first screen.

**Arms.**

- *Split:* the top Claude tier acts as art director and leaves a plan, the complete stylesheet, the first screen with its script, and a stub with one worked example for every other section. The smallest tier then fills the stubs and runs ultraweb's finish pass. Two prototype instruction files, 5 KB and 2 KB.
- *Single:* the middle tier with Anthropic's `frontend-design` skill and nothing else.

## Result

| | Split | Single |
|---|---|---|
| Grader preferred (blind) | yes, "even though it is broken at some points" | |
| Gates as they were that day | pass (25 pass, 3 review) | fail, 5 checks (axe, forms, text spacing, layout shift) |
| Cost at API list prices | $2.76 ($2.45 art direction + $0.31 build and finish) | $0.53 |
| Time | 15 min 8 s | 2 min 29 s |
| Model turns | 27 + 21 | 7 |
| Page | 80 KB, 8 sections | 34 KB, 4 sections |

The split cost 5.2 times as much and took 6 times as long.

## How the split actually divided

The art director wrote about nine tenths of the bytes: a 5 KB plan, a 29 KB stylesheet, a 12 KB chart script and 31 KB of the page (frame, first screen, and one finished example per section). The builder added 8 KB of content and a 404 page, changed nothing in the stylesheet or the script, marked 18 drafted facts, and its first full gate run passed. So this run measures "the top tier designs nearly everything", not a cheap design step followed by a large build.

Two things follow for the idea of ready-made design systems that a small model picks from.

1. The encouraging part: the smallest tier filled a finished system without damaging it, for $0.31, which is less than the single arm's whole build.
2. The art direction is only worth its price if it is paid once and reused. This one is built around a single subject (the tide chart), so it is not reusable as it stands. A reusable pack has to separate the system (tokens, type, section layouts) from the main attraction.

## The break the gates missed

At 1440 px the row of crossing times under the chart is set too large for its columns, and three pairs of times run into each other. That is the most important information on the page. The fault is in the art director's own first screen; its self-check looked at a scaled-down full-page screenshot and missed it, and none of the gate checks looked for text overlapping text.

`scripts/measure/text-overlap.mjs` and the check `responsive.text-overlap` are the response. Run against ten pages from these rounds at 375, 768 and 1440 px, the check reports that fault and one other (a button lying over a note in an earlier hotel page), and nothing else. With it, the split page fails the gates and the single page still passes that check.

## Cost figures

Each request is priced on its own at list rates, with cache reads and writes at their own rates and the smallest tier's higher rate card above 100K prompt tokens. In the session these ran in, every agent starts with about 100K tokens of harness context, so every figure here is higher than it would be in a plain session, and the number of turns drives the bill more than the size of the page. The token totals quoted in earlier result files are final context sizes, not billed tokens; at list prices the three smallest-tier runs of 2026-11-24 cost $0.32 (the shorter path), $0.18 (`frontend-design`) and $0.19 (the finish pass).

## Limits

One brief, one build per arm, one grader. The two arms differ in more than the split: the single arm had no finish pass and a different design text. The prototype instruction files are not in the repository.
