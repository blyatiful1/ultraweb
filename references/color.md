# color

Build the OKLCH palette from the direction, name it as semantic tokens, re-decide it for dark, and verify contrast by measurement.

Load when: building or changing a palette, adding dark mode, or fixing contrast.
Reads: design/DIRECTION.md, design/BRIEF.md. Writes: design/SYSTEM.md §color (the value table that `references/tokens.md` encodes).

## What DIRECTION.md decides, and what this file decides

DIRECTION.md picks the ground (near-white, near-black, a saturated brand field, a mid-tone, a pastel), the accent hue and how much color the page carries. This file gives ranges and procedure; it has no house palette. A saturated or mid-tone ground is as valid as a tinted off-white or off-black. Pure `oklch(L 0 0)` gray needs a reason in DIRECTION.md, but a neutral that carries a hint of the ground's hue is usually right.

## Ramp construction

1. Write the ground and the text color first. Everything else is derived from the contrast between them.
2. Pick the accent hue H. Choose the neutral hue: the accent hue for harmony, or a rotation of 120-210 degrees for tension, or the ground's own hue when the ground is saturated.
3. Build each ramp on a lightness ladder (about 11 steps from L 0.98 to 0.2). Space the steps for perceptual evenness, not equal increments, then adjust where the ramp is used.
4. Chroma tapers at the ends. Near white and near black keep C low (under about 0.04); the peak sits mid-ramp. Constant chroma looks neon at the ends and leaves the sRGB gamut.
5. Hue drift: hold H within about 5 degrees along an accent ramp, except yellows and oranges, which turn muddy toward dark unless the hue shifts 10-20 degrees toward red as L drops.
6. Gamut: when two neighboring steps render identically, the color is out of gamut and being clipped. Lower C, not L.7. Ramps are the source material. Components use only the semantic tokens.

Semantic set (full `oklch()` in `:root` and `.dark`): `background, foreground, card, popover, primary, secondary, muted, accent, destructive` each with a `-foreground` where it holds text, plus `border, input, ring` and `--shadow-color` (see `references/form.md`). Add `success` and `warning` only when the brief has flows that need them, in both themes. Use one accent unless DIRECTION.md argues for two.

## Dark theme: re-decide each surface

Do not flip lightness and do not use `dark:invert`. Decide each token again:

- Background: L about 0.12-0.24 for a dark ground, keeping a trace of the ground's hue. Pure `oklch(0 0 0)` makes elevation impossible. For a brand whose dark theme is a saturated field, start from that field.
- Elevation is lightness. Each level up is +0.03 to +0.05 L on the neutral ramp (for example background 0.16, card 0.20, popover 0.24). Light mode uses shadow for the same job.
- Borders: the surface they sit on plus 0.06-0.10 L, tinted with the same hue, not white at low alpha. Raise by about 0.05 at the highest levels.
- Accent: usually raise L by 0.10-0.18 and cut C by 10-25 percent compared with light mode. The light accent on a dark ground either glows or fails contrast.
- `muted-foreground` is the pair that most often fails in dark. Check it first.
- Images and gradients need their own dark treatment (`references/imagery.md`).

## Contrast: targets and arithmetic

Targets: 4.5:1 for body text and `muted-foreground`; 3:1 for large text (24px, or 18.66px bold, so display type qualifies) and for non-text UI (input borders, focus ring against its surroundings, icon strokes, state indicators). WCAG 2 ratios are the pass criterion.

For first guesses, relative luminance Y of a low-chroma color is close to L cubed. Contrast is (Y_light + 0.05) / (Y_dark + 0.05). Worked: L 0.72 text on an L 0.16 ground gives (0.373 + 0.05) / (0.004 + 0.05), about 7.8:1, so that pair clears 4.5:1 with room to spare. Dark mid-tone text on a light ground needs L at or below roughly 0.55 on an L 0.98 ground. Saturated hues carry more luminance than the cube estimate for the same L, so for any chromatic or mid-tone pair, measure.

Do not record contrast numbers in SYSTEM.md unless they came from the measurement below.

## Verification

Run the gates script (`<plugin>/scripts/gates.mjs`, a11y gate); it uses `<plugin>/scripts/measure/contrast-matrix.mjs` to measure every visible text node against its effective, composited background in each theme. During palette construction, before there is a page, test token pairs the same way: render swatches in a scratch HTML file, run the script against it, or convert with a color library and apply the formula above. Check, in both themes:

- every `*-foreground` on its own surface; foreground on background, card and muted;
- accent text and accent-filled buttons on every ground they appear on;
- text over images and gradients, at the lightest point the text overlaps;
- non-text pairs at 3:1.

Tune L, not C, until a pair passes.

## Color-vision deficiency

Contrast measures lightness; color-vision deficiency is about hue. Check that pairs which carry meaning differ in lightness or have a second cue (icon, label, position, pattern): `destructive` vs `success`, `warning` vs `destructive`, and adjacent chart series. A pair that merges under simulation is fixed with a lightness gap of about 0.15 L or a second channel. Hue nudges tend to fix one deficiency and break another.

## Defaults to avoid unless DIRECTION.md argues them

Purple-to-blue or pink-to-violet gradients; gradient text on headlines; near-black with one glowing accent as an unexamined default; cream plus serif plus warm accent as an unexamined default; stock Tailwind palette names (`bg-gray-`, `text-slate-`) in components; accent used as large background washes.

## Anti-patterns (grep)

`from-purple-` `to-violet-` `from-pink-` · `bg-gray-` `text-slate-` `bg-zinc-` · `#`-hex, `rgb(`, `hsl(` anywhere; `oklch(` outside the token file and SYSTEM.md · `dark:invert` · any contrast claim without measured output.
