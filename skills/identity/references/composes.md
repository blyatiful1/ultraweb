## Composes with

- ultraweb:typography — upstream and binding: it commits the display face this mark is cut from; a re-paired face means a redrawn wordmark.
- ultraweb:brief + ultraweb:assets — the upstream fork: ASSETS.md decides formalize-vs-invent, §Assumed facts carries the starting-mark admission.
- ultraweb:shape-language — the motif family the monogram's grid obeys; motifs are decoration, this mark is identity, and the two must not contradict.
- ultraweb:tokens — downstream: mark colors are token references compiled into `@theme`, never literals in the SVG.
- ultraweb:navigation — consumes the lockup at nav size and honors the clear-space rule as real padding.
- ultraweb:footer — the closing lockup, usually the mono variant, larger than the header's.
- ultraweb:seo — imports the monogram for `icon.tsx`/`apple-icon.tsx`/`manifest.ts`, renders `og-template.tsx` inside `ImageResponse`.
- ultraweb:email — takes a 2x PNG export with explicit `width`/`height`; Outlook drops SVG, so email never imports the components.
- ultraweb:print-craft — the mark is the ONE element granted `print-color-adjust: exact`; the rest goes to ink economy.
- ultraweb:hidden-craft — the console signature is an ASCII reduction of this monogram, accent inlined since the console cannot read tokens.
- ultraweb:icons — the mark is not an icon: `components/icons.tsx` never re-exports it, lucide never substitutes for it.
- ultraweb:media-optimization — SVGO on every file in `public/brand/`, `mergePaths` off where the mark animates later.
