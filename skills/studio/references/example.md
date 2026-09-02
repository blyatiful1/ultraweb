## Worked example — Tidepool, port-logistics SaaS built in fan-out mode

Phase 5 closes with `scaffold` green: six routes planned, dev server on :3000, `design/` at the project root. `studio` then costs twenty minutes — `app/(studio)/` beside `(marketing)`, gated, force-dynamic, five panels, one client leaf. Little exists yet: the gate table reads *nothing yet — Phase 11 writes this*, the ledger reads *CP2 approved, round 1*, the contact sheet is empty.

Tidepool ships JetBrains Mono and a teal `oklch(0.68 0.12 200)` accent. `/studio` uses neither — `ui-monospace`, near-black on white, 1px borders — so nobody confuses the viewing platform with the instrument.

Phase 6 runs fan-out. The Lead builds `/` completely; CP4 opens and the top panel flips to *Waiting on you — CP4 first-page review, 2 screenshots, approve or name what's wrong* — which the user sees unprompted, the tab having been open on the second monitor for an hour. Approved, three Specialist agents launch, and the feed narrates them without a model — three `PostToolUse` lines (*Build /product…*, */pricing…*, */docs…*), then a `SubagentStop` as each lands. Nobody asks for a status for forty minutes.

By Phase 11 the contact sheet holds eighteen shots and the gate table reads `gate-code PASS`, `gate-responsive FAIL` (the pricing table overflowing at 375), `gate-visual` blank — the user sees the red row before the Lead reports it. `handoff` then documents the removal in one line: delete `app/(studio)/`.

Rejected alternative: symlinking `design/screenshots/` into `public/` so the contact sheet needs no code. Instant in dev — and it puts every QA screenshot into the production build output, the construction site leaking past the exact boundary this skill exists to hold. The `shot` handler costs fifteen lines and dies with the route group.
