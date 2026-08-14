## Composes with

- ultraweb:cart — owns the add-to-cart mutation, optimistic count, and drawer; the PDP owns the selected-variant state and the button that triggers it.
- ultraweb:pricing — the price display legal layer (Grundpreis, VAT-inclusive, shipping link); the buy-box reserves the slot, pricing authors the strings.
- ultraweb:gate-content — verifies the DACH price/legal copy and every string on the page; the PDP defers its Grundpreis/MwSt line to it.
- ultraweb:imagery — the per-variant photo treatment and honest placeholders for any variant shot not yet delivered.
- ultraweb:media-optimization — sizes the variant heroes, thumbnails, and the 2x zoom asset, and owns the LCP blur/preload pipeline.
- ultraweb:cards — the related-products / "complete the look" grid below the fold is a card composition, not a PDP concern.
- ultraweb:data-display — the spec sheet (Definition variant) and the price/delta alignment and `tabular-nums` rules.
- ultraweb:social-proof — owns the rating, reviews, and trust content; the PDP owns where they sit relative to the CTA.
- ultraweb:payments — the trust/returns badges near the CTA and the checkout the cart hands off to.
- ultraweb:overlays — the focus-trapped zoom lightbox dialog and its reduced-motion path.
- ultraweb:buttons — the CTA variant, size, and states; one primary, everything else ghost or icon.
- ultraweb:showpiece — the escape hatch when DIRECTION.md genuinely demands a rotatable 3D/WebGL configurator; this skill owns the crossfade fallback that covers the other 95% of products.
