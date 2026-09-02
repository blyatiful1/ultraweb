## Worked example — Framewalk, "Hollow Cartographer" launch site (Atmospheric Dark)

DIRECTION.md commits Atmospheric Dark with a bioluminescent signal-green accent `oklch(0.78 0.15 160)`; BRIEF.md's whole conceit is cartography and exploration. Two gestures, chosen; a third deliberately declined.

**Console signature:** a small compass-rose fragment and "you drifted off the charted edge" in signal-green, then a hiring nudge to `/careers` — the metaphor carried into devtools, no secrets logged, mounted once as a client leaf in the root layout.

**The 404 (`app/not-found.tsx`):** "This region is uncharted." It ships the working error page first — `<h1>`, a "Return to charted territory →" link to `/`, and the primary nav, all keyboard-first. Layered on top as progressive enhancement (a reduced-motion-guarded client leaf) is a faint ASCII grid with a marker the visitor can walk with the arrow keys toward a home beacon — a nod to the game's core loop. Pressing the link works without ever touching the marker; the fragment gates nothing.

**Deliberately skipped:** a separate Konami egg. Framewalk spends its one hidden gesture on the 404 fragment; a second hidden toy would tip into a scavenger hunt and pull attention from the game the site is selling. A one-line `humans.txt` credits the four-person studio — fitting for an indie team — and that's the ceiling.

Rejected: making the 404 fragment a **gate** (reach the beacon to unlock the home link) — it fails "never gates, stay useful"; and a full-page Konami screen-shake — it competes with the game and risks key-hijack a11y.

Handoff: `ultraweb:ui-states` established that `not-found.tsx` must be designed with a path home — hidden-craft only adds personality over that; `ultraweb:copywriting` wrote every console line, the 404 headline, and the humans.txt credit; `ultraweb:gate-accessibility` keyboard-audits the egg (no key hijack, Esc + focus return, operable from keyboard); `ultraweb:gate-performance` confirms zero LCP cost on the error path.
