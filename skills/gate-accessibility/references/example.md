## Worked example — Aldermoor Trust, community foundation grants + stories

design/DIRECTION.md set the bar as the aesthetic itself: "Open Civic — accessibility-first, all pairings AAA where possible." The gate ran the full pass on all five routes from design/SITEMAP.md (`/`, `/grants`, `/stories/[slug]`, `/volunteer`, `/donate`), both themes, 375 + 1440.

Contrast (step 1, canvas-normalized) cleared the AA floor with room: Source Serif 4 story body on warm paper `oklch(0.97 0.008 85)` measured 13.6:1 (AAA); the deep green accent `oklch(0.45 0.1 155)` on that paper measured 5.2:1 — AA and AAA-large, acceptable for the link role, logged as below the AAA aspiration. Keyboard walk: 31 stops, focus-visible ring on all, Escape closed the mobile nav and returned focus to the toggle.

The catch was step 5. On `/`, the signature story cards — the left rule that grows into the reading-progress indicator — entered via a scroll-linked `whileInView` with `initial={{ opacity: 0 }}` and no reduced-motion guard. Under `page.emulateMedia({ reducedMotion: "reduce" })` the entrance was skipped, so all six cards stayed at opacity 0, invisible forever; the re-shot `/` was blank below the fold.

Fix owned by ultraweb:scroll-motion, per motion-language's policy: the reduced-motion branch now returns the cards at rest (opacity 1, rule at full height) instead of the banned blanket `* { animation: none }`. Re-ran step 5 on `/` under reduce → six cards visible.

Step 8 surfaced a quieter defect: under the text-spacing override, the `/grants` cards — grant title `line-clamp-2` inside a fixed `h-56` — clipped the longest programme name mid-word. ultraweb:cards traded the hard height for `min-h-56` + `flex-col`; re-shot at 375/768/1440 under the override, every card grew clean. Step 9 didn't fire — design/BRIEF.md sets market=UK, so the BFSG `/barrierefreiheit` check logged N/A; a DACH commercial brief (e.g. Ledger & Lane) would instead have to ship that statement and match its claimed conformance level to this run's residuals.

Lands in design/QA.md §gate-accessibility, which flipped to PASS.
