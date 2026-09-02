## Worked example — Kaffeewerk Ost, mark for the Berlin roastery

ASSETS.md: "No client assets provided" → invent branch, logged in §Assumed facts as a starting mark. DIRECTION.md: Warm Organic/Humanist, signature move = the roast-profile temperature curve. SYSTEM.md §type: Fraunces (`opsz`) + Work Sans.

- **Wordmark:** `KAFFEEWERK OST` in Fraunces 600, `opsz 60`, one line, tracking **+0.06em** at 28px cap-height — caps in a high-contrast serif close up without it.
- **The one custom cut:** the doubled F in KAFFEE takes a single continuous crossbar across both letters, its right terminal lifted 4° onto the roast curve's tangent. Everything else stays Fraunces as drawn.
- **Monogram:** `K` on a 32×32 grid; the wedge between arm and leg is cut as the roast curve, so the negative space IS the signature move at favicon scale. Feeds `icon.tsx`, `apple-icon.tsx`, `manifest.ts` — one source, three surfaces.
- **Geometry:** `x` = the K's stem width. Clear space 2x; minimum wordmark 128px (below that the shared crossbar closes); monogram floor 16px; print 22mm.
- **Color:** `currentColor` everywhere; the curve's stroke takes `--color-accent` (rust `oklch(0.62 0.16 45)`) on the light ground only — on the dark bar it drops below AA.
- **OG template:** cream ground, monogram top-left at 96px, title in Fraunces 72/1.05, the curve a rust hairline bleeding off the bottom edge; `seo` passes each route's real title in.
- **Misuse:** no re-setting in Work Sans · no wordmark on the rust field · no rotation or arc · no drop shadow · no second curve in the lockup.

Rejected alternative: a coffee-bean silhouette monogram — every roastery in Berlin owns one, it says nothing this brief said, and it spends the signature move's budget on a cliché the curve already spends better.
