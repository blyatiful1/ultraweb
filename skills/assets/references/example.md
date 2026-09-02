## Worked example — Loop & Thread, a shoebox of shop assets

The user says "here's our stuff" and points at `~/loopthread-brand/`. Scan returns 47 files: 31 product photos, a scanned woven label, a 2019 brand PDF, two `.otf` files, an About doc.

- **Photography (31)** — 3000px flat-lays on undyed linen, already the direction's ground. Kept: 18, slotted to `/shop` cards and `/products/[slug]` galleries; the in-hand crops become the hover state `imagery` specs. Rejected: 13 phone shots under 1200px with mixed white balance.
- **Mark** — `label-scan.jpg`, 1200×800, a photograph of a woven label. Raster-only, so it is flagged for `identity` to formalize as a drawn wordmark referencing the weave, **not traced**. Clear space measures 1× mark height; no mono variant exists; knocked out on dark it dissolves — `identity` inherits both gaps.
- **Color** — thread green sampled at `oklch(0.42 0.06 148)`. Against the linen ground it computes 3.1:1 — AA fail for body text. Logged as adjusted: `oklch(0.36 0.07 148)`, 5.4:1, hue held, and `color` takes the adjusted value as a candidate for its accent, not as its ramp.
- **Type** — the 2019 guide names Sofia Pro; the `.otf` pair carries a desktop-only license. Substitution logged, and `typography` commits Fraunces + Karla on its own terms.
- **Voice** — the About doc yields "small-batch", "undyed", "milled in Donegal"; handed to `copywriting` as vocabulary, and the Du register it already uses is confirmed there.

Rejected alternative: sampling the palette from the product photos instead of the label — the photos are lit warm and would have taught `color` a linen tint that is a lighting accident, not a brand decision.
