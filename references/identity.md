# identity

The brand mark, built once, so the header, favicon, app icons and share images all come from the same source.

Load when: the site needs a wordmark or monogram, the favicon is a default, or an OG template is needed.
Reads: design/DIRECTION.md, design/BRIEF.md (assets), design/SYSTEM.md §type and §form. Writes: design/SYSTEM.md §identity, `public/brand/*`, components in `components/brand/`, the OG template component.

## Fork: formalize or invent

If the brief lists a client logo, formalize it. If not, invent a starting mark and say so in design/BRIEF.md under Assumptions: it is a placeholder the client may replace.

**Formalize.** Never redraw. Get the real vector (SVG, EPS, PDF); if only a raster exists, ask for the vector before tracing. Optimize it, replace hardcoded fills with `currentColor` (a token where the mark is legitimately two-color), strip `<style>` blocks and fixed width/height, keep proportions and letterforms untouched. Then add what the client lacks: a one-color variant, a favicon cut (details that close up below 32px are removed, not shrunk), a clear-space rule, a minimum size.

**Invent.** Keep it modest and honest.

- Preferred: set the name as live text in the site's display face, with weight, size and tracking chosen by eye at the lockup size and checked at 100 percent and at a small size. Use it as styled text for the header.
- For standalone files (favicon source, OG image, email), convert the text to outlines with a real tool (a font-parsing library such as opentype.js or fontTools to extract glyph paths, or the design tool's outline command) and keep the conversion script or note in the repo so it can be redone. Do not hand-write glyph path data from memory: curves and spacing come out wrong and unverifiable.
- At most one custom decision (a modified terminal, a joined pair, a monogram counter echoing the signature move), made with a tool whose output you can render and inspect. If you cannot check it, ship the plain setting.
- A monogram comes from one letter or pair of the wordmark, on a square viewBox, legible at 16px with counters open. Do not generate a mark with an image model and trace it.

## Geometry and color

Define a unit `x` from the mark (cap height or stem width) and write clear space and minimum sizes in multiples of `x`, plus a minimum pixel width and a print minimum in mm. Navigation padding respects it.

SVGs use `currentColor` so color comes from tokens; hardcoded hex ships a dark mark on a dark bar. Check the mark in one color, on the dark surface and on the accent.

## Outputs

- `public/brand/`: wordmark, one-color wordmark, monogram as SVG.
- `components/brand/`: wordmark, monogram and OG template as React components.
- Favicon and app icons (`app/icon.*`, `apple-icon.*`, manifest) all derive from the monogram; the icon file draws no separate shape.
- OG template: one component with named slots (title, optional image), the monogram once, colors from `lib/tokens.ts` (OG rendering cannot read CSS variables), fonts loaded explicitly. Routes pass strings; none re-derives the layout.
- Email: use a PNG export at 2x with explicit width and height; some clients drop SVG.

## Document

SYSTEM.md §identity records: origin, face and weight, tracking at a stated size, the custom decision, monogram, `x`, clear space, minimums, misuse cases (rotating, re-setting in another face, on the accent field, effects), and files.

Avoid: a wordmark in a face the site never loads, hex in brand SVGs, per-route OG layouts, several gestures in one mark, hand-written glyph paths.
