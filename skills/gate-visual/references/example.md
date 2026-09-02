## Worked example — Studio Norra, Editorial Brutalist agency portfolio

DIRECTION.md contract the judge scored against each round: hero display in Archivo Expanded — "oversized, uppercase, tight tracking" — and signal red `oklch(0.6 0.21 25)` used ONLY for interaction states. Round 1 shot all five routes (`/`, `/work`, `/work/[slug]`, `/studio`, `/contact`) at 375, 768 and 1440, light + dark, into `qa/visual/round-1/`; rounds 2 and 3 shot 1440, round 3 adding 375 because the fix moved the type scale.

```markdown
## gate-visual — 2026-05-14 — PASS (SHIP, round 3)
| Round | Verdict | Lowest axis (page) | Worst defect → fix | Frames | Rationale (in qa/visual/) |
|---|---|---|---|---|---|
| 1 | NOT-CLOSE | distinctiveness 4 (/studio) | signal red painted as a static fill behind the team grid — DIRECTION.md reserves red for interaction states → fill reverted to ink `oklch(0.2 0.01 270)`, red restored to focus-visible + hover only (ultraweb:color owns) | 44 | round-1/VERDICT.md |
| 2 | FIX-THEN-SHIP | typography 6 (/work) | Archivo Expanded index headings capped at 3rem, no scale contrast vs Inter body → ceiling raised to `clamp(2.5rem, 8vw, 7rem)`, tracking tightened to `-0.03em` (ultraweb:typography owns) | 16 | round-2/VERDICT.md |
| 3 | SHIP | all ≥7 | — | 30 | round-3/VERDICT.md |
Banned-list violations: 0 in final sweep. Issues fixed: 2. Residual defects: none.
```

Rejected: bundling the /work type-scale fix into round 1 alongside the red-leak fix — two root causes in one diff hides which change moved distinctiveness vs typography; one defect per round kept both fixes independently verifiable against their round-N+1 capture. Handoff: the round history in design/QA.md is read by ultraweb:ship, which blocks the release while any gate row reads below SHIP.
