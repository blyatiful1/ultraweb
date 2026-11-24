# imagery

Art direction for photographs, illustration and placeholders: one treatment, derived from the palette, honest where assets are missing.

Load when: a section needs an image or texture, photos do not match the brand, or no real photography exists.
Reads: DIRECTION.md, BRIEF.md (assets), SYSTEM.md §color, SITEMAP.md. Writes: design/SYSTEM.md §imagery, treatment CSS in the token file, generated assets in `public/images/`.

## Photographs

Places, shops, food, hotels and portfolios are carried by photographs of the real thing. Type and drawing cannot stand in for bread, a room or a building. Use them when the site kind asks for them; a type-led or drawn page stays a legitimate direction.

Sources, in order:

1. The client's own photographs (the Assets section of the brief).
2. An image-generation tool, when the session has one. Generated pictures follow the stand-in rules below and never depict a real person, product or place as if photographed.
3. Openly licensed stand-ins: `node <plugin>/scripts/photos.mjs search "<subject>" --thumbs design/photo-previews`, look at the previews, then `get <id> --out site/img/<name>.jpg`. Queries describe the subject only, never the client.

Stand-in rules:

- Mark every one `data-standin` on its `<img>`, and print the credit line from `photos.mjs credits` in the footer; most licences require it.
- A stand-in never claims to be the client's. A picture that stands for the client's own work, people or premises (`--role proof`) carries a small visible label, "Stand-in photo". For a portfolio this applies to every project image.
- Stand-ins make the build a demo: `Deployment mode: demo`, each listed in the handoff with what the owner must supply. Ship blocks production while one remains.
- Choose photographs that share light and colour temperature, crop them to the layout's ratios with `object-fit: cover`, give each `width`, `height` and real `alt` text, and lazy-load everything below the first screen.

## Stance

DIRECTION.md says what the site leads with (photography, illustration, product shots, type). Record that, then inventory every image slot in SITEMAP.md and decide per slot: real asset, generated art, or no image. Real client or subject imagery beats everything below; flagship builds require it. Reject stock-cliche photos and redesign the slot.

Optional palette moves, argued in DIRECTION.md: sample the accent from the actual hero object (2-3 OKLCH values at build time), or name the category's default color story and choose a credible alternative. Derived colors never set body text and still pass contrast.

## Photo treatment: one, or none

One treatment for all photography, or none when the photography is already art-directed and consistent. Untreated stock beside strong brand color is the thing to avoid. Treatments are CSS on a wrapper, never baked into files, so dark mode can re-decide them.

**Tint** (cheap, for thumbnails and hover states). Colors come from tokens:

```css
.img-tint { position: relative; overflow: hidden; }
.img-tint > img { filter: grayscale(1) contrast(1.08); }
.img-tint::after { content: ""; position: absolute; inset: 0; background: var(--color-primary); mix-blend-mode: color; }
```

**True duotone** (luminance mapped between two palette colors). Inline one SVG filter in the root layout and apply `filter: url(#duotone)`:

```html
<svg width="0" height="0" aria-hidden="true"><filter id="duotone" color-interpolation-filters="sRGB">
  <feColorMatrix type="matrix" values=".299 .587 .114 0 0 .299 .587 .114 0 0 .299 .587 .114 0 0 0 0 0 1 0"/>
  <feComponentTransfer><feFuncR type="table" tableValues="SHADOW_R HIGHLIGHT_R"/>
  <feFuncG type="table" tableValues="SHADOW_G HIGHLIGHT_G"/><feFuncB type="table" tableValues="SHADOW_B HIGHLIGHT_B"/></feComponentTransfer>
</filter></svg>
```

Each `tableValues` pair is shadow then highlight for that channel, sRGB 0-1; convert from the palette's OKLCH, do not eyeball. Duotone removes true color; avoid it where color sells (food, fabric, product).

**Scrim** (text over media). Verify contrast against the lightest point under the text:

```css
.scrim::after { content: ""; position: absolute; inset: 0; background: linear-gradient(to top, var(--scrim) 0%, transparent 60%); }
```

`--scrim` is the dark neutral at about 0.7-0.85 alpha.

## Texture: options, each argued

Grain and gradient mesh are options. Use one only when DIRECTION.md says why the surface needs it; a flat ground is often better.

- **Grain:** inline SVG `feTurbulence` data-URI overlay (`baseFrequency` about 0.6-0.9, `stitchTiles='stitch'`), opacity 0.03-0.08, `pointer-events: none`.
- **Gradient mesh:** three or four stacked radial gradients using palette colors at 0.3-0.6 alpha over the ground. Lower alpha about 30 percent in dark mode.
- **Parametric geometry** for structural directions where noise is wrong: generate the tile from a formula so it repeats and rescales. Wave: `y = A·sin(2πx/λ)` sampled at about 16 points per period into cubic segments, with λ dividing the tile width exactly so the seam closes; stack two or three phase-shifted copies at falling opacity. Lattice: an SVG `<pattern>` with one mark per cell (cell 24-64px, mark at low opacity). Hatch: parallel rules at one fixed angle on the spacing unit. Record amplitude, wavelength and cell size in SYSTEM.md; dividers (`references/form.md`) reuse them.

## Honest placeholders

1. First choice: no image; a section designed in type and layout beats one waiting for a photo.
2. Otherwise generate SVG or CSS art at the slot's final aspect ratio from palette colors and one or two geometric forms. Save to `public/images/`.
3. Name files `placeholder-<slot>.svg` and list each in SYSTEM.md §imagery with what should replace it; the ship step republishes the list.
4. Never: gray boxes, an empty `bg-muted` div, placeholder.com, picsum, hotlinked stock, "image coming soon".

## Delivery

- Raster photos: `placeholder="blur"` with a blur data URL; every `fill` image has `sizes`; the LCP image is marked for preload (per the Next version's API in `stack/versions.json`; the old `priority` prop is deprecated).
- Generated SVG: plain `<img>` or CSS background. Decorative images `alt=""`; content images get descriptive alt.
- Optimize every SVG before shipping; keep ids and `viewBox` on anything animated. Logo handling is in `references/identity.md`.
- Screenshot treated surfaces in light and dark.

## Anti-patterns (grep)

`placeholder.com` `placehold.co` `picsum.photos` `images.unsplash.com` · `alt="image"` `alt="photo"` · `bg-muted` on an empty div as an image slot · grain opacity above 0.08.
