## Composes with

- gate-runner (agent) — runs the entire sweep in its own context; this gate is its script, and the Lead reads only the returned verdict
- ultraweb:layout-grid — owns overflow and orphan fixes: grid collapse rules, bleed discipline
- ultraweb:navigation — owns the mobile menu this gate exercises
- ultraweb:gate-accessibility — inherits the 44px concern (WCAG 2.5.8) and takes over keyboard, contrast, reduced-motion
- ultraweb:gate-visual — judges the same production server of record (:3100) and takes this gate's captures as a precondition; run responsive first so the judge scores fixed layouts, and its round-1 sweep rules check 8
- ultraweb:i18n — the sweep runs both locale trees; overflow from long PT strings and locale-switcher targets under 44 route here for the fix
