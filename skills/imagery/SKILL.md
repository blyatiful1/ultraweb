---
name: imagery
description: Art direction for every visual asset in an ultraweb build — pick ONE photo treatment (duotone, grain, overlay/scrim) implemented as palette-driven CSS/SVG, generate gradient-mesh and feTurbulence noise textures from the OKLCH palette, and produce honest placeholders as on-brand generated SVG/CSS art, never gray boxes, placeholder.com, or stock clichés. Invoke during foundation to define SYSTEM.md §imagery, and during build whenever a section needs an image, texture, or background ("add a hero image", "needs texture", "the images look stock", "placeholder images", "background feels flat", "make the photos match the brand").
---

# imagery — treated, textured, never fake

**Stage:** Phase 3 — Foundation (treatments, SYSTEM.md §imagery); assets land in Phase 6 — Build - **Reads:** design/DIRECTION.md, design/BRIEF.md, design/SYSTEM.md §color, design/SITEMAP.md - **Writes:** design/SYSTEM.md §imagery + treatment CSS in app/globals.css + generated assets in public/images/

## Standard

Every image on the site passes through ONE named treatment derived from the OKLCH palette — untreated stock beside brand color reads as template. Zero gray boxes, zero placeholder.com, zero stock cliché (handshake, laptop-with-latte, team-laughing-at-salad). When no real photography exists — the usual case — generated SVG/CSS art is designed well enough to ship, and honestly labeled for replacement. Textures (mesh, grain) are subliminal: felt, not seen.

## Photo treatments — pick ONE

**Tint** — cheap duotone approximation for thumbnails, cards, hover states:

```css
.img-tint { position: relative; overflow: hidden; }
.img-tint > img { filter: grayscale(1) contrast(1.08); }
.img-tint::after {
  content: ""; position: absolute; inset: 0;
  background: var(--color-accent); mix-blend-mode: color; opacity: 0.9;
}
```

**True duotone** — luminance mapped to two palette colors, for hero-grade surfaces. Inline the filter once in the root layout:

```html
<svg width="0" height="0" aria-hidden="true">
  <filter id="duotone" color-interpolation-filters="sRGB">
    <feColorMatrix type="matrix"
      values=".299 .587 .114 0 0 .299 .587 .114 0 0 .299 .587 .114 0 0 0 0 0 1 0"/>
    <feComponentTransfer>
      <feFuncR type="table" tableValues="0.10 0.96"/>
      <feFuncG type="table" tableValues="0.09 0.90"/>
      <feFuncB type="table" tableValues="0.13 0.80"/>
    </feComponentTransfer>
  </filter>
</svg>
```

Apply via `filter: url(#duotone)`. Per channel, `tableValues` = shadow color then highlight color in sRGB 0-1 — convert the palette pair from oklch first; never eyeball the numbers.

**Grain** — feTurbulence noise overlay. Opacity 0.03-0.08, never more:

```css
.grain::after {
  content: ""; position: absolute; inset: 0; pointer-events: none;
  opacity: 0.05; mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
```

**Overlay/scrim** — gradient scrim guaranteeing text contrast over media:

```css
.scrim::after {
  content: ""; position: absolute; inset: 0;
  background: linear-gradient(to top, var(--scrim) 0%, transparent 60%);
}
```

`--scrim` = the dark neutral at 0.7-0.85 alpha. Verify AA against the LIGHTEST point the text overlaps — computed contrast, not eyeballed.

Combining: one treatment + grain is the ceiling. Grain rides on top of anything; duotone + scrim on the same image means the image was wrong to begin with.

## Generated textures

**Gradient mesh** — 3-4 stacked radial-gradients, colors from SYSTEM.md §color at 0.3-0.6 alpha. A purple-to-blue default mesh is on the banned list.

```css
.mesh {
  background:
    radial-gradient(at 20% 25%, var(--mesh-1) 0%, transparent 55%),
    radial-gradient(at 80% 15%, var(--mesh-2) 0%, transparent 50%),
    radial-gradient(at 55% 90%, var(--mesh-3) 0%, transparent 55%),
    var(--color-background);
}
```

**Noise** — the same feTurbulence data URI: `baseFrequency` 0.6-0.9 for fine grain, 0.15-0.3 for coarser paper texture. Keep `stitchTiles='stitch'` or the tile seams show.

Both are CSS backgrounds: zero network requests (data URIs), zero layout cost, `pointer-events: none` on overlay layers.

## Honest placeholders

1. **First choice: no image.** A section designed typographically over mesh/texture/geometry beats a section waiting for a photo.
2. **Generated SVG art**: mesh background + 1-2 geometry elements from ultraweb:shape-language + optional oversized low-opacity monogram or word. Built at the slot's final aspect ratio, saved to `public/images/`.
3. **Name honestly** (`placeholder-team.svg`, never `team.svg`) and list every generated asset in SYSTEM.md §imagery with what should replace it — handoff republishes the list.
4. **Never**: gray boxes, `bg-muted` divs standing in for images, placeholder.com/picsum, hotlinked Unsplash, "image coming soon".

## next/image wiring

- Raster photos: `placeholder="blur"` with a blurDataURL; `fill` always pairs with `sizes`; the LCP image gets `preload` — `priority` is deprecated in Next 16.
- Generated SVGs: plain `<img>` or CSS background — next/image adds nothing for SVG. Decorative pieces get `alt=""` (or live as backgrounds); content images get real alt text describing content, never "image".
- Treatment layers (scrim, grain, tint) are CSS on a wrapper, never baked into exported assets — dark mode must be able to re-decide them.

## Dark mode

Treatments are re-decided per theme, not inverted: scrim flips toward the dark neutral, grain blend usually moves overlay → soft-light, mesh alpha drops ~30% so it doesn't glow. Screenshot every treated surface in BOTH themes before calling it done.

## Process

1. Read DIRECTION.md: does this direction lead with photography, illustration, or pure type/graphic? Record the stance in SYSTEM.md §imagery.
2. Pick ONE treatment; implement it as reusable classes in app/globals.css (+ the inline SVG filter in the root layout if true duotone).
3. Generate the texture kit (mesh vars, noise data URI) from the palette.
4. Inventory every image slot in SITEMAP.md; per slot decide: real asset / generated art / none.
5. Build generated assets at final aspect ratios; wire raster through next/image (blur, sizes, `preload` for LCP).
6. Verify: screenshot every treated surface in both themes; run the anti-pattern greps.

## Anti-patterns

Greppable — each should return zero:
- `placeholder.com` / `placehold.co` / `picsum.photos` / `images.unsplash.com`
- `alt="image"` / `alt="photo"` / `alt="placeholder"`
- `bg-gray-200` or `bg-muted` on an empty div posing as an image slot

Visual — caught by screenshots:
- Two treatments on one site (duotone heroes, untreated cards) — one hand, one treatment
- Grain layer opacity above 0.08 — texture became dirt
- Mesh in default purple-blue — banned unless DIRECTION.md justifies it
- Stock-cliché photos even when "real" — reject the asset, redesign the slot

## Worked example — Casa Verde, Lisbon farm-to-table restaurant

design/DIRECTION.md: "Sunlit Rustic — full-bleed photography carries the emotion, chrome recedes." SYSTEM.md §color hands over the terracotta accent `oklch(0.66 0.13 45)` over a warm cream base `oklch(0.97 0.01 85)`.

Photography leads, so the treatment must warm the food, not restyle it. One named treatment — a flat terracotta wash at 0.12 alpha plus subliminal grain — lives once in app/globals.css:

```css
.photo-sunlit { position: relative; overflow: hidden; }
.photo-sunlit::after {
  content: ""; position: absolute; inset: 0; pointer-events: none;
  background: oklch(0.66 0.13 45 / 0.12); mix-blend-mode: multiply;
}
```

Grain rides on top at opacity 0.05 — felt, not seen. Rejected: true duotone — it strips the real color out of the tomatoes and herbs and kills the appetite-appeal that full-bleed food photography exists for; duotone suits a mood piece, not a menu.

The class plus the generated `placeholder-harvest-01.svg` slots (olive-on-cream geometry until the shoot lands) record into SYSTEM.md §imagery. ultraweb:hero pulls `.photo-sunlit` onto the full-bleed reservation hero, ultraweb:cards applies the lighter `.img-tint` to the day's-harvest strip thumbnails, and ultraweb:handoff republishes the placeholder-replacement list so the kitchen can swap in real photos.

## Composes with

- ultraweb:color — every treatment and mesh derives from its OKLCH palette
- ultraweb:media-optimization — owns the delivery pipeline (sizes, blur, LCP preload) for what this skill creates
- ultraweb:hero — full-bleed media variants consume the scrim + treatment classes
- ultraweb:shape-language — geometry, masks, and clip-paths that shape image containers
- ultraweb:gate-antislop — sweeps for the placeholder and cliché strings above
- ultraweb:handoff — republishes the generated-placeholder replacement list
- ultraweb:cards — card thumbnails and hover states apply the `.img-tint` treatment authored here
- ultraweb:feature-sections — media-panel and textured backgrounds in feature blocks pull this skill's mesh + treatment classes
- ultraweb:social-proof — testimonial and review-with-photo images pass through this skill's treatment before they ship
- ultraweb:showpiece — hands off when a background must become an animated shader/canvas instead of CSS mesh or feTurbulence noise
