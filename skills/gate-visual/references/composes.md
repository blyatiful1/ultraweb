## Composes with

- design-judge (subagent) — the scorer; this gate is its delivery mechanism
- pixel-qa (subagent) — the camera; shoots every round's evidence
- ultraweb:direction — DIRECTION.md is the contract every round is judged against; a defect in the direction itself goes back there, not to component fixes
- ultraweb:gate-antislop — run it before this gate so judge rounds spend on real design defects, not greppable clichés
- ultraweb:typography — owns the most common round-1 defect: undersized display type and weak scale contrast
- ultraweb:layout-grid — owns the second most common: wallpaper rhythm and missing asymmetry
- ultraweb:gate-responsive — precondition: its PASS must be recorded in design/QA.md before round 1, so the judge scores settled layouts instead of the overflow and orphan defects the responsive gate already owns
- ultraweb:award-canon — supplies the invariants and jury model the Distinctiveness axis is scored against; the design-judge rubric quotes them
