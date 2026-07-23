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
- Type is the award record's cheapest, most durable win (`award-canon`: Type as Evidence) — commit to ONE heroic face and let extreme scale contrast *alone* build documentary hierarchy; jurors read that conviction in seconds.
- That scale also feeds Kinetic Reveal Type — the headline animating as the signature moment (background-clip wipe, per-char stagger) built from real DOM text with CSS/Motion, owned by `scroll-motion`/`showpiece`, never body copy. Pioneer Corn (SOTD + Developer Award, July 2020; overall SOTY unconfirmed) rendered ALL type as canvas MSDF with no DOM text — reconstructed from the write-up, cautionary not exemplary: the razor-crisp glyphs are inseparable from an accessibility failure.
- Tight tracking on large text, generous leading on body — the numbers below, not vibes.
- Loaded via next/font/google: auto self-hosted, zero runtime Google requests, variable fonts need no weight.
- Line-breaking is the browser's job: `text-wrap: balance` on every H1–H3, `text-wrap: pretty` on multi-line body/prose. Evens the headline rag, kills body widows, handles German compounds — zero cost, and hand-authored `<br>` for line control is banned.
- Free display craft the type designer already shipped: `font-feature-settings: 'kern' 1, 'liga' 1, 'calt' 1` at hero/H1 scale, and `text-box-trim: trim-both; text-box-edge: cap alphabetic` for exact cap-height alignment (retires the negative-margin hack; Firefox ignores it and loses a pixel of leading, not the layout).

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

### Foundry tier — when Google Fonts is the tell

Inter / Manrope / Space Grotesk have become the new default-shadcn look; the type layer is where AI sameness shows first. On **Refined Luxury Serif, Brutalist, or Art-House Immersive** with budget, escalate past the Google tier — load via `next/font/local` (fallback-metric caveat below). Grilli Type and Dinamo are Swiss (Zürich/Basel), Pangram Pangram is Berlin — a real DACH provenance, not a forced one.

| Foundry | Faces | Fits |
|---|---|---|
| Klim | Tiempos, Founders Grotesk, Söhne | Refined Luxury Serif, quiet authority |
| Grilli Type | GT America, GT Walsheim, GT Sectra | editorial, boutique premium |
| Pangram Pangram | Neue Machina, Ogg | Brutalist, avant-garde |
| Dinamo | Whyte, Diatype | Neo-grotesque, tech-precise |

Default to the Google tier. A foundry licence is a one-time cost you justify in DIRECTION.md, never a reflex.

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
- Variable axes ARE tokens: when the display face ships a `wght` (or `opsz`/`wdth`) axis, request the range via next/font instead of static cuts — one file, smaller payload — and hand `--font-wght-min`/`--font-wght-max` to ultraweb:tokens for runtime use (see Breathing Type).
- Foundry/licensed faces load through `next/font/local`, which drops next/font/google's automatic fallback-metric matching — so keep `adjustFontFallback` on with an explicit `fallback` face, or match metrics by hand (`size-adjust`/`ascent-override` — a serif over Georgia wants `size-adjust: ~0.88`). `font-display: swap` alone still reflows; verify CLS = 0 (ultraweb:gate-performance) before shipping a foundry font.

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
- Viewport clamp() is for section-level headlines only. Type inside a reusable component that renders at many widths (stat-card numbers, bento-cell heads) sizes to its box, not the viewport: `font-size: clamp(1rem, 6cqi, 2.5rem)` inside a `container-type: inline-size` wrapper (`@supports` back to the plain clamp()). ultraweb:cards is the direct beneficiary.

## Weight, tracking, leading

- Weights contrast: body 400 against a display weight at least 200 away (600–800 typical). Never use two adjacent mid weights (500 AND 600) in one hierarchy — they read as rendering errors, not hierarchy. Single-weight and expressive rows (2, 4, 8, 11) earn contrast from style and size instead of weight.
- Tracking: display ≥40px gets −0.01em to −0.03em (grotesques take more, serifs less); body 0; uppercase labels 11–13px at +0.06 to +0.12em, weight 500–600. Positive tracking on large lowercase text is banned.
- Leading: display (≥48px) 0.95–1.05; headings 1.1–1.2; body 1.55–1.7; captions 1.4.
- Measure: body 60–75ch — set a ch-based max-width; full-container paragraphs are a defect.
- Load the `opsz` axis wherever it exists (Fraunces, Newsreader, DM Sans, Bricolage) — display cuts sharpen for free.
- One curated OpenType flourish, or none: if the face ships stylistic sets/alternates (check its specimen) and the direction wants personality (Playful Geometric, Retro-Futurist), enable exactly ONE — `font-feature-settings: 'ss01' 1` or `'dlig' 1` — on display tokens only, never body, logged in SYSTEM.md. Two is indecision.

## Breathing Type — the one variable-axis accent (opt-in)

When the display face loads a live `wght` axis, ONE element per page — a logotype, a nav link, a single hero word — may interpolate weight on hover/focus via `font-variation-settings: 'wght' var(--font-wght-hover)`, transitioned on ultraweb:motion-language's `--ease-micro`. This is glyph-level motion, distinct from the transform/opacity vocabulary, and scarcity is the whole point. Gated to Editorial/Magazine, Neo-grotesque Minimal, Art-House Immersive — never Warm Organic or Refined Luxury Serif. Non-negotiable caps: one element per page (it IS the signature move), display tokens only, and frozen at rest weight under `prefers-reduced-motion`. Break a cap and it becomes the gimmicky over-motion the constitution bans.

## Anti-patterns

- `Inter(` as the only next/font import — the default look the pipeline exists to kill.
- `<link href="https://fonts.googleapis.com` — runtime Google requests; next/font self-hosts everything.
- `text-7xl`, `text-8xl`, `text-9xl` — escaping the fluid scale via Tailwind defaults (tokens wipes them; their presence means stale globals.css).
- `tracking-widest` on headlines; `tracking-wide` on anything lowercase above 24px.
- `leading-none` on multi-line text; body leading below 1.4.
- `font-medium` and `font-semibold` mixed inside one hierarchy — pick one mid weight.
- Three or more families: grep lib/fonts.ts exports; more than display + body + mono is indecision.
- Hand-authored `<br>` inside a headline component to force wrapping — `text-wrap: balance` does it and survives copy edits (ultraweb:gate-antislop greps for this).
- More than one stylistic set, or any `ss0x`/`dlig` on body text — expressive OpenType is a display-only, single-dose move.

## Worked example — Ledger & Lane, type system for a two-partner law firm

design/DIRECTION.md: "Quiet Authority — restraint as credibility; a ruled-line typographic system structures every page like a legal document."

Decision: **Newsreader** carries both display and article body; **Public Sans** takes UI. Newsreader's `opsz` axis keeps the serif sober at hero scale where a high-contrast face would turn ornate, and it earns hierarchy from optical size + italics (row 4), not a weight gap — display 500, body 400, no mid-weight collision.

```ts
import { Newsreader, Public_Sans } from "next/font/google";

export const display = Newsreader({ subsets: ["latin"], variable: "--font-newsreader", axes: ["opsz"], style: ["normal", "italic"] });
export const body = Public_Sans({ subsets: ["latin"], variable: "--font-public-sans" });
```

Scale: `--text-6xl: clamp(2.75rem, 2.1rem + 2.67vw, 4.5rem)` (44→72px) on the H1 "Considered counsel for consequential decisions."; body 17px, leading 1.65, measure 66ch; practice-area kickers 12px uppercase +0.08em / 600. Hero tracking −0.015em (serif, restrained). Gold `oklch(0.72 0.09 85)` touches only the single CTA per page. The H1 "Considered counsel…" gets `text-wrap: balance` + `text-box-trim: trim-both` so its cap-height sits exactly on the ruled baseline; `dlig` fires on the wordmark's ampersand ("Ledger & Lane") alone. No Breathing Type — Quiet Authority doesn't fidget.

Rejected: the library pairs Newsreader with **Archivo** (row 4); its grotesque voice fought the "legal document" register — Public Sans's neutral, near-governmental tone reads as the paper itself. Also weighed and declined: escalating to the foundry tier (Klim's Tiempos, in budget), since Newsreader's `opsz` delivers the same sober authority on the Google tier and no licence was justified — the escalation rule refusing to fire.

Handoff: lands in design/SYSTEM.md §type + lib/fonts.ts; ultraweb:tokens bridges `--font-newsreader`/`--font-public-sans` and the clamp scale into `@theme inline`, and ultraweb:hero pulls `--text-6xl` for the ruled hero.

## Composes with

- ultraweb:direction — the archetype's type stance selects the pairing row; never choose fonts before DIRECTION.md exists.
- ultraweb:tokens — receives the font variables and clamp() scale into `@theme`.
- ultraweb:copywriting — display sizes only work on headlines short enough to set huge (≤8 words); negotiate copy length against scale.
- ultraweb:hero — the biggest consumer of `--text-5xl`/`--text-6xl` and the display tracking rules.
- ultraweb:cards — receives the container-query (`cqi`) pattern that sizes stat/bento type to its own box, not the viewport.
- ultraweb:motion-language — Breathing Type transitions on its `--ease-micro` token and obeys its reduced-motion policy.
- ultraweb:media-optimization — owns the wider font-loading/LCP pipeline these choices feed.
- ultraweb:content-cms — hands off the long-form prose type (article body face, measure, leading) that MDX article rendering applies.
- ultraweb:gate-performance — verifies the next/font loading set here holds LCP and adds no font-swap CLS.
- ultraweb:gate-visual — its design-judge rubric scores the hero ≥3.5× body floor and pairing conviction this skill commits.
- ultraweb:award-canon — Type as Evidence (ONE face, scale contrast alone) and Kinetic Reveal Type are the canon patterns this scale serves; the never-render-type-to-canvas caution comes from there.
