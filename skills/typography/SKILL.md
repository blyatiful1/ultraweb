---
name: typography
description: Choose and implement the site's type system — a display/body pairing from a curated library of 12 Google-Fonts combos mapped to direction archetypes, loaded via next/font/google with CSS variables, a fluid clamp() type scale (390→1440px, hero ≥3.5× body), and hard weight/tracking/leading rules. Invoke in the Foundation phase right after ultraweb:direction, whenever fonts must be chosen or the scale defined, or when the user says "pick the fonts", "font pairing", "set up typography", "the type feels generic", "make the headlines bigger", or "which font should this use".
---

# typography — type does the design work

**Stage:** Phase 3 — Foundation (parallel with color) - **Reads:** design/DIRECTION.md - **Writes:** design/SYSTEM.md §type + lib/fonts.ts

## Standard

- A real pairing chosen for THIS direction — never default-Inter-only (pipeline ban).
- ≤2 families (+1 optional mono for code/labels/figures), ≤4 loaded weights site-wide.
- Hero display resolves to ≥3.5× body at 1440px (taste floor); fluid via clamp(), zero breakpoint jumps.
- Tight tracking on large text, generous leading on body — the numbers below, not vibes.
- Loaded via next/font/google: auto self-hosted, zero runtime Google requests, variable fonts need no weight.

## Process

1. Read DIRECTION.md's type stance; match against the Energy column below. Shortlist two rows, set the REAL H1 copy in both at 96px (a scratch HTML file is enough), pick by eye.
2. Write lib/fonts.ts (snippet below): export display + body (+ mono if earned), each with a CSS `variable`.
3. Apply the variables on `<html>` in app/layout.tsx; hand variable names + scale values to ultraweb:tokens for the `@theme inline` bridge.
4. Write SYSTEM.md §type: pairing + one-line why, loaded weights, tracking/leading table, scale values.
5. Verify: render a page, screenshot at 390 and 1440. Hero must feel almost too big at 1440 (taste); body measure 60–75ch.

## Pairing library (all on next/font/google)

Match DIRECTION.md's archetype energy to a row. "Display wt" are the ONLY display weights you load.

| # | Display + Body | Energy | Display wt | Notes |
|---|---|---|---|---|
| 1 | Fraunces + Instrument Sans | warm editorial, crafted product | 550–650 | `axes: ["opsz"]` — big sizes sharpen automatically |
| 2 | Instrument Serif + Geist | quiet luxury, minimal product | 400 only | display face only — set it huge or not at all |
| 3 | Playfair Display + Source Sans 3 | classic luxury, heritage | 600 | high-contrast serif: never below 28px |
| 4 | Newsreader + Archivo | editorial, essays, journal | 500 | `axes: ["opsz"]`; the italics are the personality |
| 5 | Space Grotesk + IBM Plex Sans | tech-precise, dev tools | 500–700 | Plex is static: `weight: ["400","600"]` |
| 6 | Bricolage Grotesque + Inter Tight | loud contemporary agency | 600–800 | `axes: ["opsz"]`; heavy cuts carry the attitude |
| 7 | Syne + Manrope | avant-garde portfolio | 700–800 | Syne 800 is the signature — headline-only doses |
| 8 | DM Serif Display + DM Sans | friendly boutique premium | 400 only | same superfamily; DM Sans takes `axes: ["opsz"]` |
| 9 | Archivo + Archivo | brutalist poster, one-family | 800 | `axes: ["wdth"]`, display at wdth 125, uppercase |
| 10 | Crimson Pro + Work Sans | literary, humanist warmth | 500–600 | long-form body can flip: Crimson Pro for prose |
| 11 | Anton + Public Sans | sport, impact, poster | 400 only | already condensed — never negative-track it |
| 12 | Unbounded + Figtree | bold futurist | 500–700 | slop-adjacent (dark-navy-glow); needs DIRECTION.md justification |

Mono accent when earned: JetBrains Mono, Geist Mono, or IBM Plex Mono — code, labels, tabular figures.

## Loading — lib/fonts.ts

```ts
import { Fraunces, Instrument_Sans } from "next/font/google";

export const display = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", axes: ["opsz"] });
export const body = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument" });

// app/layout.tsx:
// <html className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
```

- Variable fonts: no `weight` needed. Single-weight faces (Instrument Serif, DM Serif Display, Anton) REQUIRE `weight: "400"` — omitting it fails the build.
- Static families take an array: `weight: ["400", "600"]` — load only what SYSTEM.md uses.
- ultraweb:tokens bridges into utilities: `@theme inline { --font-display: var(--font-fraunces); --font-sans: var(--font-instrument); }`.

## Fluid scale

Linear interpolation between V1 = 390px and V2 = 1440px; min/max in px:

```
slope     = 100 × (max − min) / (V2 − V1)          → the vw coefficient
intercept = (min − slope × V1 / 100) / 16          → rem
--text-5xl: clamp(2.5rem, 1.66rem + 3.43vw, 4.75rem)   /* 40px → 76px */
```

- Body stays near-static (16→18px max); display grows fast. The scale RATIO widens: ×1.2 steps at 390px stretching to ×1.33–1.45 at 1440px.
- Hero (`--text-5xl`/`--text-6xl`): 40–48px min, 76–100px max. 76/16 = 4.75× body — clear of the 3.5× floor.
- Full worked values live in the ultraweb:tokens globals.css example — reuse them, don't re-derive.

## Weight, tracking, leading

- Weights contrast: body 400 against a display weight at least 200 away (600–800 typical). Never use two adjacent mid weights (500 AND 600) in one hierarchy — they read as rendering errors, not hierarchy. Single-weight and expressive rows (2, 4, 8, 11) earn contrast from style and size instead of weight.
- Tracking: display ≥40px gets −0.01em to −0.03em (grotesques take more, serifs less); body 0; uppercase labels 11–13px at +0.06 to +0.12em, weight 500–600. Positive tracking on large lowercase text is banned.
- Leading: display (≥48px) 0.95–1.05; headings 1.1–1.2; body 1.55–1.7; captions 1.4.
- Measure: body 60–75ch — set a ch-based max-width; full-container paragraphs are a defect.
- Load the `opsz` axis wherever it exists (Fraunces, Newsreader, DM Sans, Bricolage) — display cuts sharpen for free.

## Anti-patterns

- `Inter(` as the only next/font import — the default look the pipeline exists to kill.
- `<link href="https://fonts.googleapis.com` — runtime Google requests; next/font self-hosts everything.
- `text-7xl`, `text-8xl`, `text-9xl` — escaping the fluid scale via Tailwind defaults (tokens wipes them; their presence means stale globals.css).
- `tracking-widest` on headlines; `tracking-wide` on anything lowercase above 24px.
- `leading-none` on multi-line text; body leading below 1.4.
- `font-medium` and `font-semibold` mixed inside one hierarchy — pick one mid weight.
- Three or more families: grep lib/fonts.ts exports; more than display + body + mono is indecision.

## Composes with

- ultraweb:direction — the archetype's type stance selects the pairing row; never choose fonts before DIRECTION.md exists.
- ultraweb:tokens — receives the font variables and clamp() scale into `@theme`.
- ultraweb:copywriting — display sizes only work on headlines short enough to set huge (≤8 words); negotiate copy length against scale.
- ultraweb:hero — the biggest consumer of `--text-5xl`/`--text-6xl` and the display tracking rules.
- ultraweb:media-optimization — owns the wider font-loading/LCP pipeline these choices feed.
