# Mid-tier round, 2026-11-24

One brief, three new builds, the middle Claude tier as the builder instead of the smallest. Everything else matches round 3 in `2026-11-24-rounds-2-and-3.md`: the bike-workshop brief, the one-page static setup, the same three arms, one build per cell, the same single grader. The grader saw an anonymised A/B/C montage and picked before seeing the key, so this round was blind.

## Result

| Arm | Grader preferred | Gates | Tokens | Time |
|---|---|---|---|---|
| ultraweb (sketch, autonomous) | yes | pass (27 pass, 1 review) | 266k | 15 min 34 s |
| frontend-design | | fail, 8 checks | 151k | 6 min 33 s |
| plain | | fail, 8 checks | 120k | 4 min 10 s |

The failing checks were the same family in both other arms: axe, contrast, form labelling, target size at 24 and 44 px, text spacing and small body text; the plain build also overflowed at 375 px.

None of the three builds used photographs. The ultraweb page opens on a 72 px-plus condensed headline over a measured drawing of a frame (top tube, seat tube, angles, wheelbase), which is the subject's own vernacular; the frontend-design page opens on a wide grotesque headline over a row of four drawn bikes with prices.

## Compared with the smallest tier on the same brief

| Builder | Grader preferred | ultraweb tokens | frontend-design tokens |
|---|---|---|---|
| smallest tier (round 3) | frontend-design | 210k to 270k | 179k |
| middle tier (this round) | ultraweb | 266k | 151k |

The gate result did not change with the builder: ultraweb passed, the other two arms failed, on both tiers. The preference did. One reading is that ultraweb's path (subject sheet, direction, copy before layout, a look pass) asks for more judgment than the smallest tier brings, and pays off once the builder can use it. One brief and one build per cell cannot separate that from chance.

## What it costs

ultraweb used about 1.8 times the tokens of the frontend-design build and 2.4 times the wall time. That ratio is in line with the earlier rounds.

## Limits

One grader, one brief, one build per cell. A repeat on at least two more briefs is needed before the tier effect is claimed. First screens are in `docs/compare/bikes-mid-*.jpg`.
