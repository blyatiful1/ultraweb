## Worked example — Studio Norra, Oslo agency portfolio layout

design/DIRECTION.md: "Editorial Brutalist — exposed 12-col grid, oversized uppercase Archivo Expanded, deliberate rawness with high craft. Signature: cursor-proximity image reveals on the /work index."

Exposed grid means the columns must stay legible, so the site commits to two recurring asymmetries: **Margin Note 3/9** (a sticky rail carrying the case number + eyebrow beside the wide case body on /work/[slug] and /studio) and **Staggered Rail** for the /work index, where column two drops `mt-24` so the cursor-reveal thumbnails never resolve into a tidy card grid — the boldest split hosts the signature move. Container tiers handed to tokens:

```css
@theme {
  --container-prose: 65ch;    /* case-study running text */
  --container-content: 72rem; /* /studio, /contact */
  --container-wide: 88rem;    /* /work index + full-bleed case imagery */
}
```

Rhythm on /work/[slug]: `release` hero exit (`py-28 md:py-40`), then a `compressed` credits/role strip (`py-12 md:py-16`), then `standard` narrative sections — never three py-24s in a row. The featured case study takes the site's one **Editorial Collage** — three cursor-reveal thumbnails rotated 3deg and overlapped, one bleeding to the `--container-wide` edge — while the long /work archive below the third fold wraps in `content-visibility: auto` (`contain-intrinsic-size: auto 1100px`), so offscreen case rows cost no layout or paint until scrolled to. Rejected a centered 6/6 gallery for the index: equal halves flatten the exposed-grid tension the direction is built on, and 6/6 is reserved for true comparisons. Output lands in design/SYSTEM.md §layout (tiers + split names + rhythm map); ultraweb:tokens mints the `--container-*` tokens and ultraweb:wireframe blueprints each /work section against the split names.
