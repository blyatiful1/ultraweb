---
name: color
description: Construct the site's OKLCH palette from the chosen direction — a hue-tinted neutral ramp plus ONE working accent, built on disciplined lightness steps and chroma limits, named as semantic tokens (background/foreground/primary/muted/border/ring…), with a dark theme re-decided surface by surface (never inverted) and every foreground/surface pair verified for WCAG AA contrast computationally, not by eye. Invoke in the Foundation phase right after ultraweb:direction, whenever a palette must be built or rebuilt, or when the user says "pick the colors", "build the palette", "fix the contrast", "the colors feel off", "add dark mode", or "design the dark theme".
---

# color — OKLCH palette, verified not eyeballed

**Stage:** Phase 3 — Foundation (first system skill, right after direction) - **Reads:** design/DIRECTION.md, design/BRIEF.md - **Writes:** design/SYSTEM.md §color (the full :root/.dark value table ultraweb:tokens encodes)

## Standard

- Everything is `oklch(L C H)`, L 0–1. Perceptually uniform: equal L reads as equal lightness across hues, so ramps and contrast become arithmetic. Never hex, hsl, or stock Tailwind palette names.
- One tinted neutral family + ONE accent doing real work (taste requirement). A second accent needs an explicit DIRECTION.md justification.
- Neutrals carry hue: C 0.005–0.025 across the ramp. `oklch(x 0 0)` pure gray is the smell of no decision.
- Dark theme is re-decided surface by surface. Lightness inversion is a defect, not a theme.
- Every foreground/surface pair passes WCAG AA computationally — script output pasted into SYSTEM.md, both themes. "Looks fine" is not a result.

## Process

1. Read DIRECTION.md: the archetype fixes a temperature (warm/cool), an accent hue neighborhood, and an energy level → choose accent hue H and peak chroma.
2. Derive the neutral hue: reuse the accent hue for harmony, or rotate 150–210° for tension. Set neutral C in 0.005–0.025.
3. Build both ramps on the canonical L steps below; check gamut (identical-looking neighbors = clipping).
4. Assign semantic tokens for light; RE-DECIDE every value for dark using the rules below.
5. Run the contrast script on every pair, both themes; tune L (not C) until green; record the value table + script output in SYSTEM.md §color.

## Ramp construction

Canonical lightness steps (same for neutral and accent ramps):

```
step  50    100   200   300   400   500   600   700   800   900   950
L     0.985 0.96  0.92  0.86  0.77  0.67  0.58  0.49  0.40  0.31  0.22
```

- Accent chroma tapers: ≤0.04 at 50/100, climbing to a peak of 0.12–0.19 at 500–600, back to ≤0.08 at 950. Constant chroma reads neon at the ends and clips out of gamut.
- Neutral chroma stays flat 0.005–0.025, with the peak (≈0.02) in the middle steps where tint is most visible.
- Hue holds within ±5° across the accent ramp — EXCEPT yellows/oranges (H 70–110): shift hue 10–20° toward red as L drops, or the dark steps turn muddy-green.
- sRGB gamut: C above ~0.15 clips at high or low L for many hues. Browsers gamut-map silently; the symptom is two neighboring steps rendering identically. Fix by lowering C, never L.
- Ramps are the quarry, not the API — components consume only the semantic tokens below.

## Semantic tokens

Name roles, not colors. The canonical set, as FULL oklch values in `:root`/`.dark` (never HSL triplets):
`background/foreground · card/card-foreground · popover/popover-foreground · primary/primary-foreground · secondary/secondary-foreground · muted/muted-foreground · accent/accent-foreground · destructive · border · input · ring` plus `--shadow-color` for ultraweb:depth. Extend (`--success`, `--warning`) only when BRIEF.md has flows that need them — defined in BOTH themes or not at all. Contrast is verified on PAIRS: every `*-foreground` against its own surface, plus foreground on background/muted/card.

## Dark re-decision rules

- Background: L 0.14–0.22, tinted (keep C ≥0.01). Never `oklch(0 0 0)`.
- Elevation flips: surfaces get LIGHTER as they rise — card ≈ background L +0.03–0.05. In light mode elevation is shadow; in dark it is lightness.
- Accent: raise L by +0.10–0.18 and cut C by 10–25% vs the light-mode accent. The light-mode value on a dark ground either glows or fails contrast.
- Borders: background L +0.06–0.10 — lighter than the surface, doing the separation work shadows did in light mode.
- `muted-foreground` still needs ≥4.5:1 — it is the pair that fails most often in dark themes.
- Re-verify every pair. A green light theme proves nothing about dark.

## Verify AA computationally

Thresholds: **≥4.5:1** body text and muted-foreground; **≥3:1** large text (≥24px, or ≥18.66px bold — hero display qualifies) and non-text UI (input borders, ring vs background, icon strokes — WCAG 1.4.11).

Playwright MCP: `browser_navigate` to `about:blank`, then `browser_evaluate`. The canvas resolves oklch to gamut-mapped sRGB, so the math runs on what browsers actually paint:

```js
() => {
  const pairs = [ // [name, fg, bg] — every *-foreground/surface pair, BOTH themes
    ["fg/bg light", "oklch(0.24 0.02 60)", "oklch(0.98 0.008 85)"],
    ["primary-fg/primary light", "oklch(0.98 0.01 85)", "oklch(0.53 0.16 45)"],
  ];
  const ctx = Object.assign(document.createElement("canvas"), { width: 1, height: 1 }).getContext("2d");
  const rgb = c => { ctx.fillStyle = c; ctx.fillRect(0, 0, 1, 1); return [...ctx.getImageData(0, 0, 1, 1).data]; };
  const lum = ([r, g, b]) => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  return pairs.map(([n, fg, bg]) => { const [hi, lo] = [lum(rgb(fg)), lum(rgb(bg))].sort((a, b) => b - a); return `${n}: ${((hi + 0.05) / (lo + 0.05)).toFixed(2)}:1`; });
}
```

Offline alternative: `culori` and its WCAG contrast helper — verify against current docs first. Aiming heuristics (the script decides; these only place the first guess): on an L≈0.98 ground, text needs L ≤≈0.55; on an L≈0.17 ground, text needs L ≥≈0.72.

## Anti-patterns

- `from-purple-`, `to-blue-`, `from-pink-`, `to-violet-` — the banned gradient aesthetic (taste), regardless of how it is smuggled in.
- `bg-gray-`, `text-slate-`, `bg-zinc-` — stock untinted palette instead of tokens.
- `#`-hex, `rgb(`, `hsl(` anywhere; `oklch(` outside globals.css and SYSTEM.md.
- Zero-chroma ramps (`oklch(0.5 0 0)` and friends) — gray pretending to be a decision.
- Dark theme produced by flipping L only, or `dark:invert`.
- Any AA claim without script output recorded in SYSTEM.md.
- Accent as decoration: chroma-0.19 background washes, gradient heroes. The accent marks actions and emphasis; surfaces belong to the neutrals.

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

## Composes with

- ultraweb:direction — supplies temperature, accent hue neighborhood, and energy; a palette chosen before DIRECTION.md exists is guessing.
- ultraweb:tokens — encodes this skill's value table verbatim into `:root`/`.dark` + the `@theme inline` bridge.
- ultraweb:depth — consumes `--shadow-color` and the dark elevation-by-lightness rule.
- ultraweb:imagery — pulls duotone and overlay colors from these ramps so photography sits inside the palette.
- ultraweb:gate-accessibility — re-runs contrast on RENDERED pages; this skill clears the values, the gate clears reality.
- ultraweb:buttons — paints the single filled CTA from the `primary`/`primary-foreground` pair this skill verifies; the accent exists to mark that one action, so its contrast is cleared here first.
