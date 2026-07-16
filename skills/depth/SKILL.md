---
name: depth
description: Design the elevation language for an ultraweb build — an oklch tinted-shadow scale (never pure black) shipped as --shadow-* @theme tokens, the border-vs-shadow decision rule, semantic elevation levels 0-4, a dark-mode elevation strategy, and glass rules (rare, one surface max) — written to design/SYSTEM.md §depth during the foundation phase. Invoke in Phase 3 of the ultraweb pipeline after color has decided the neutral ramp, or whenever shadows look gray or muddy, everything floats identically, dark-mode cards read flat, or someone asks about "shadows", "elevation", "depth", "glassmorphism", or "borders vs shadows".
---

# depth — tinted light, earned elevation

**Stage:** Phase 3 — Foundation - **Reads:** design/DIRECTION.md, design/SYSTEM.md §color - **Writes:** design/SYSTEM.md §depth + --shadow-* @theme tokens handed to ultraweb:tokens

## Standard

Depth is a hierarchy tool, not decoration. First-grade means: shadows are tinted with the palette's own hue — gray shadows on tinted backgrounds look dirty — every elevated element can state WHY it floats, borders and shadows have distinct jobs, dark mode re-decides elevation from scratch, and ≤3 elevation levels are visible in any one viewport. The test: hide the shadows; hierarchy should still mostly read from size, position, and contrast. Shadows confirm, never carry.

## Process

1. Read DIRECTION.md for the depth stance: **flat-minimal** (borders lead, ≤2 shadow levels), **layered-soft** (full 5-token scale), **dramatic** (large diffuse shadows — still tinted).
2. Pull the neutral ramp hue from SYSTEM.md §color. The shadow hue IS that hue.
3. Construct the 5-token scale (below): alpha 0.05-0.12, two layers per token from `md` up.
4. Map semantic elevation levels 0-4 to tokens and border pairings.
5. Decide the dark-mode strategy: surface lightness steps + borders; shadows demoted.
6. Glass: grant at most ONE surface if the direction earns it; otherwise write "no glass" explicitly in §depth.
7. Write SYSTEM.md §depth (stance, scale, level map, dark rules, glass verdict); hand tokens to ultraweb:tokens.

## Tinted shadow construction (oklch)

Formula: shadow color = `oklch(0.2 C H / A)` where H = the neutral ramp hue, C = 0.03-0.06 (higher chroma for saturated palettes, ~0.03 for warm neutrals), A layered 0.05-0.12. Never `rgb(0 0 0 / x)`, never `#000`.

Example for a cool palette (hue 265):

```css
@theme {
  --shadow-xs: 0 1px 2px oklch(0.2 0.04 265 / 0.06);
  --shadow-sm: 0 1px 2px oklch(0.2 0.04 265 / 0.05), 0 2px 6px oklch(0.2 0.04 265 / 0.06);
  --shadow-md: 0 2px 4px oklch(0.2 0.04 265 / 0.05), 0 8px 20px oklch(0.2 0.04 265 / 0.08);
  --shadow-lg: 0 4px 8px oklch(0.2 0.04 265 / 0.06), 0 16px 36px oklch(0.2 0.04 265 / 0.10);
  --shadow-xl: 0 8px 16px oklch(0.2 0.04 265 / 0.08), 0 28px 56px oklch(0.2 0.04 265 / 0.12);
}
```

Two layers = tight key shadow (contact) + wide ambient (light falloff). `--shadow-*` is a Tailwind v4 namespace: these tokens become `shadow-xs`…`shadow-xl` utilities directly.

## Border vs shadow — the decision rule

**Persistent structure gets a border; transient float gets a shadow.**

- Always present at page level — resting cards, inputs, table rows, panels → 1px border (neutral ramp at 8-12% alpha) and/or a background shift.
- Appears, disappears, or moves — dropdowns, popovers, modals, toasts, drag ghosts, sticky nav once scrolled → shadow.
- Both together: resting cards on white need border + `shadow-xs` (shadow alone has no edge on white). On a tinted section background, border alone is usually enough.

## Elevation levels

| Level | Surface | Treatment (light mode) |
|---|---|---|
| 0 | page, flat sections | none — background shifts only |
| 1 | resting cards, inputs | border + `shadow-xs` |
| 2 | hover-raised cards, sticky nav scrolled | `shadow-md`, transition 150-250ms |
| 3 | dropdown, popover, tooltip | `shadow-lg` |
| 4 | modal, command palette, toast | `shadow-xl` + backdrop |

An element climbs ONE level on interaction (1→2 on hover); nothing skips levels. ≤3 levels visible per viewport — if the whole page sits at level 1, nothing is elevated.

## Dark mode — elevation is lightness, not shadow

Shadows are near-invisible on dark surfaces. Re-decide per level:

- Each level up = surface lightness +0.03-0.05 L on the neutral ramp (bg 0.16 → card 0.20 → popover 0.24).
- Pair with a 1px border `oklch(1 0 0 / 0.08)`, rising to `/ 0.14` at levels 3-4.
- Keep shadows only for levels 3-4, alpha doubled (0.2-0.35) — they read as void behind the surface, not light.

Never ship light-mode shadow tokens unmodified into `.dark`.

## Glass — rare, earned, singular

- Max ONE glass surface per site. Default candidate: the sticky header. A hero panel is the alternative — never both.
- Recipe: background at surface lightness with alpha 0.65-0.8 + `backdrop-blur-md` (12px) or `-lg` (16px) + 1px border `oklch(1 0 0 / 0.15)` + a shadow from the scale.
- Text on glass must pass AA against the WORST background it can scroll over — computed in gate-accessibility, never eyeballed.
- No body text on glass over imagery. No glass on glass. Glassmorphism-as-aesthetic is on the taste banned list — DIRECTION.md must justify even the one surface.

## Anti-patterns

- Pure-black shadows — grep `rgba(0, 0, 0`, `rgba(0,0,0`, `rgb(0 0 0`, `shadow-black`; any `#000` inside a box-shadow.
- `rounded-xl shadow-lg` on everything (taste ban) — depth without hierarchy; grep `shadow-lg` density.
- No `--shadow-*` overrides in `@theme` — stock Tailwind gray shadows are part of the untouched-shadcn look; if the tokens aren't there, this skill didn't run.
- More than one `backdrop-blur` in the codebase — grep `backdrop-blur`, count ≤1.
- Neumorphism: inset shadows sculpting inputs and buttons.
- `drop-shadow` or `text-shadow` on text for "pop".
- Animating `box-shadow` on scroll-linked elements — paint cost; cross-fade a pseudo-element's opacity between two shadow states instead.

## Composes with

- ultraweb:color — supplies the neutral ramp hue for shadows and the dark-mode surface steps.
- ultraweb:tokens — the scale ships as `--shadow-*` tokens in app/globals.css `@theme`.
- ultraweb:cards — consumes levels 1-2 and the border+shadow pairing for rest/hover.
- ultraweb:navigation — sticky header takes level 2 on scroll and is the default (only) glass candidate.
- ultraweb:micro-interactions — animates level transitions within the 150-250ms budget.
- ultraweb:gate-accessibility — computationally verifies text contrast on any glass surface.
