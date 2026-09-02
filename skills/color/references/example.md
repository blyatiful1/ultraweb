## Worked example — Framewalk, "Hollow Cartographer" Steam launch

design/DIRECTION.md: "Atmospheric Dark — earned by the game's fog-and-lantern art, not a template. ONE phosphor accent; the primary CTA everywhere is 'Wishlist on Steam'."

Dark is the default surface, re-decided per rule (never inverted). Neutrals carry the fog's blue-green tint (C 0.02, H 200) so the ground reads atmospheric rather than the banned AI-startup navy:

- `--background: oklch(0.16 0.02 200)` · `--foreground: oklch(0.92 0.01 190)`
- `--card: oklch(0.20 0.02 200)` (elevation as +0.04 L, not shadow) · `--border: oklch(0.24 0.02 205)`
- `--muted-foreground: oklch(0.72 0.015 200)` — the pair that fails most; held at L 0.72 to clear 4.5:1 on the L-0.16 ground
- `--primary: oklch(0.78 0.15 160)` phosphor · `--primary-foreground: oklch(0.16 0.02 200)`

Full pair matrix scripted — every foreground/surface pair in both themes, plus the non-text UI pairs (border, ring, icon strokes at ≥3:1) — output recorded in SYSTEM.md. Excerpt: fg/bg 14.9:1, primary-fg/primary 8.6:1, muted-fg/bg 5.1:1 (muted the closest to the 4.5:1 line) — all clear AA.

Rejected: pushing the phosphor to `oklch(0.80 0.19 160)` "to glow more" clipped sRGB (500 and 600 steps rendered identically), so chroma held at 0.15 and the accent stays reserved for actions — keeping the site off the banned glowing-accents-template line. A warm lantern-amber second accent was also cut: one accent doing real work (taste), the lantern warmth lives in ultraweb:imagery, not tokens.

Handoff: the value table lands in design/SYSTEM.md §color → ultraweb:tokens encodes it into `:root`/`.dark`, and ultraweb:buttons paints the lone "Wishlist on Steam" CTA from `--primary`/`--primary-foreground`.
