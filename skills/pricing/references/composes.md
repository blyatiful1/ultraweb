## Composes with

- ultraweb:buttons — one primary CTA per view; per-tier button hierarchy
- ultraweb:data-display — the comparison matrix inherits its table, alignment, and `tabular-nums` rules; the Grundpreis unit-price line follows its one-precision-per-column rule
- ultraweb:copywriting — tier names, feature phrasing, and discount wording in the brief's voice
- ultraweb:payments — Stripe products/prices mirror the tier constant 1:1; each Abo cadence maps to one recurring Price by interval; drift between page and checkout is a trust breach
- ultraweb:gate-content — verifies the DACH price/legal copy (MwSt, Grundpreis, shipping link) and the EU Omnibus 30-day price-history behind any Streichpreis
- ultraweb:cart / ultraweb:product-detail — reserve the DACH price slot (gross, Grundpreis, "inkl. MwSt.") and defer the string authoring here
- ultraweb:ui-states — loading and error design for Stripe-fetched prices and checkout-session CTAs
- ultraweb:faq — pricing objections (refunds, cancellation, limits) belong in an FAQ directly below the tiers
- ultraweb:micro-interactions — toggle crossfade and card hover timing
