## Composes with

- ultraweb:scaffold — its final smoke test is this gate's preview: same commands, Phase 5
- ultraweb:app-structure — owns the boundary plan that check 5 audits against
- ultraweb:gate-performance — reads the same "use client" census for bundle weight; this gate owns correctness, that one owns cost
- ultraweb:ship — re-runs build + start against production env vars before deploy
- stack-doctor (subagent) — receives every build/type/tooling failure with the verbatim error
- ultraweb:routing — check 4 serves every route in the tree it owns; an unawaited `params`/`searchParams` caught by check 2 is handed back here to fix
- ultraweb:server-actions — when tsc or the boundary audit flags a form action's `(prevState, formData)` signature or its `useActionState` wiring, the fix lands there
- ultraweb:tokens — declares the `@theme` contract check 8 enforces; adding the token there is the only way to satisfy an undeclared-token failure
- ultraweb:color — its design-time AA pass becomes this gate's every-build assertion; a failing pair is handed back there to re-decide the lightness step
- ultraweb:component-api — a variant that resolves to an undeclared token or an AA-failing pair fails here at build time, not in visual review
- ultraweb:animejs — checks 6 and 7 enforce its v3-relic ban and its DIRECTION-citation gate
- ultraweb:set-design — checks 6 and 7 enforce its fiber-v9 idioms, its exact `three` pin and `@types/three` lock, and its DIRECTION-citation gate including the route scope
