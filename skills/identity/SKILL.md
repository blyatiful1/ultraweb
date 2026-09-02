---
name: identity
description: Draw or formalize the site's brand mark in pure vector, before tokens compile — a wordmark in the committed display face with the optical work named (tracking, one custom cut or ligature, a clear-space rule), a monogram feeding app/icon.tsx, apple-icon.tsx and manifest.ts, an OG template component seo's ImageResponse renders instead of re-deriving a layout per page, and design/IDENTITY.md plus public/brand/*.svg as the single source. A real client mark in design/ASSETS.md is formalized, never redrawn; an invented one is recorded as a starting mark. Invoke in Phase 3 after typography commits the display face and before tokens, or when someone says "design a logo", "we need a wordmark", "brand mark", "monogram", "logo lockup", "clear space rules", "the favicon is still the default", or "make an OG template".
---

# identity — the mark everything else inherits

**Stage:** Phase 3 — Foundation (after `typography`, before `tokens`) - **Reads:** design/DIRECTION.md, design/ASSETS.md, design/SYSTEM.md §type + §shape - **Writes:** design/IDENTITY.md + public/brand/*.svg + components/brand/{wordmark,monogram,og-template}.tsx

## Standard

A site with an unowned logo slot is a template. First-grade means the mark is authored here, once, and every surface downstream pulls from it:

- **Set in the committed face.** The wordmark is the display face from SYSTEM.md §type. If the pairing changes, the wordmark is redrawn — a mark in a face the site never loads is a lie about the design system.
- **The optical work is named, in numbers.** Tracking at a stated reference size, the baseline the letters sit on, and ONE custom decision — a cut terminal, a drawn ligature, a corrected join. A wordmark with zero custom work is typing, not identity.
- **Clear space is self-relative.** Define one unit `x` from the mark itself (cap-height, or the monogram's stem width) and express clear space and minimums in `x`. Pixels break the first time someone scales the lockup.
- **The monogram is derived, not invented twice.** It comes out of the wordmark's construction and shape-language's motif family: square viewBox, legible at 16px, every hairline still open.
- **Color is a token reference.** SVGs ship `currentColor` and components inherit it; a hardcoded hex in `public/brand/` is a defect `tokens` cannot fix.
- **Pure vector, zero generation.** Hand-authored path data, no image models, no tracing, no new dependency — this is the one asset that must survive scaling, monochroming, embroidery, and fax.
- **A real mark is formalized, never redrawn.** If ASSETS.md lists a client logo, this skill adds clear space, a mono variant, and a favicon cut. Redrawing a brand someone already owns is vandalism billed as design.
- **An invented mark says so.** Recorded in BRIEF.md §Assumed facts as a starting mark the client may replace, documented well enough for a successor to extend.

## Process

1. **Read design/ASSETS.md first.** It decides the branch: "No client assets provided" → invent; a supplied logo (SVG, EPS, PDF, or a raster whose vector is findable) → formalize. Never both.
2. **Formalize branch.** SVGO the file (`ultraweb:media-optimization`), swap every `fill="#…"`/`stroke="#…"` for `currentColor` (one token where the mark is legitimately two-color), strip `<style>` blocks and inline `width`/`height`. Touch no proportion, letterform, or spacing. Then add what the client lacks: a 1-bit mono variant, a favicon cut (details that close below 32px get removed, not shrunk), clear space, minimums, misuse list. Ask for the real vector before tracing a JPEG.
3. **Invent branch — set it.** Type the name in the display face at the lockup's reference size, in the weight and optical size SYSTEM.md committed. Judge it at 100% and at 16px in the same session.
4. **Invent branch — do the optical work.** Correct spacing pair by pair, then record the tracking value that results. Pick the ONE custom decision and write down what it does — a cut crossbar, a ligature on a named pair, a terminal that ties to the direction's signature move. Everything else stays the type designer's.
5. **Derive the monogram.** One letter or bound pair from the wordmark, square viewBox, motif family's grid. Give its counter a job — that is where the signature move earns its second appearance for free.
6. **Fix the geometry.** Set `x`, then clear space (`1x`–`2x` all sides, which the nav bar respects), minimum wordmark width, minimum monogram size, print minimum in millimeters.
7. **Author the files** per the contract below: three SVGs in `public/brand/` are the source, three components in `components/brand/` are how React consumes them.
8. **Build the OG template.** One component, named slots (title, eyebrow, optional image), the monogram placed once, palette from tokens. `ultraweb:seo` renders it in `ImageResponse` with per-page strings — no route re-derives an OG layout.
9. **Write design/IDENTITY.md** — construction, geometry, misuse list (five entries minimum, each a mistake someone will actually make), plus the honesty line if the mark is invented.
10. **Verify empirically.** Render the monogram at 16, 32, 180px and the wordmark at its minimum width; check both in mono, on the dark surface, on the accent. Anything that closes, muddies, or fails AA is fixed here, not discovered in Phase 11.

## IDENTITY.md format

```md
# Identity — <client>
**Origin:** invented starting mark (logged in BRIEF.md §Assumed facts) | formalized from design/ASSETS.md
## Construction
- Wordmark: <face> <weight>, opsz <n>, tracking <±n>em at <ref size>
- Custom cut: <the one decision, and what it does>
- Monogram: <letter/pair>, <n>×<n> viewBox, counter = <the idea>
## Geometry
- x = <the unit, defined from the mark>
- Clear space <n>x · min wordmark <n>px · min monogram 16px · print <n>mm
## Color
`currentColor` default · accent role `--color-<token>` · mono 1-bit, no tints
## Misuse
- <five+ named misuses>
## Files
public/brand/: wordmark.svg · wordmark-mono.svg · monogram.svg
components/brand/: wordmark.tsx · monogram.tsx · og-template.tsx
```

## Anti-patterns

- A wordmark in a face the site never loads — the type system and the logo disagreeing in public
- Generating the mark with an image model, then tracing it: a blob with 400 nodes, no construction, nothing to document
- A monogram that is the wordmark's first letter cropped out of the lockup, side bearings still attached
- Hardcoded hex in `public/brand/*.svg`, so dark mode ships a black mark on a black bar
- Letting `icon.tsx` draw its own shape "just for the favicon" — two marks, one site
- A per-page OG layout re-derived in each `opengraph-image.tsx`, drifting from the mark by the third route
- Three gestures in one mark (a ligature AND a clever counter AND a symbol) — the one-move budget applies to the logo too
- Shipping the mark and skipping IDENTITY.md: the client hired a studio, not a file browser

## Worked example — Kaffeewerk Ost, mark for the Berlin roastery

Moved to `references/example.md` — read only when this build's case is genuinely ambiguous; the sections above are the decision material.

## Composes with

Moved to `references/composes.md` — the handoff map; load it when orchestrating this skill against its neighbors.
