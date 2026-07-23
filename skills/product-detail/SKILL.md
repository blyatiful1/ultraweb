---
name: product-detail
description: Design and build the product detail page (PDP) — media gallery, the buy-box hierarchy (name → price → variant picker → one Add-to-cart), spec sheet, and trust signals — anchored by the Swatch-Driven Hero Crossfade — selecting a colour/material swatch crossfades the gallery, updates price inline, and writes URL state with no full reload and no WebGL. Invoke in Phase 6 for any product page — trigger phrases — "product page", "PDP", "product detail", "variant picker", "colour swatches", "size selector", "add-to-cart layout", "product gallery", "material preview", "lightweight configurator".
---

# product-detail — where the buy decision is made

**Stage:** Phase 6 — Build - **Reads:** design/DIRECTION.md, design/SYSTEM.md, design/SITEMAP.md, design/BRIEF.md - **Writes:** app/(shop)/products/[slug]/page.tsx, components/pdp/*

## Standard

The PDP is the page where the visitor decides. First-grade means: **every variant is visible before commitment, and no full-page reload is needed to see a different option.** Concretely — one aspect-locked gallery with real zoom, a buy-box whose hierarchy reads top-to-bottom as name → price → variant → one primary CTA, a spec sheet that beats a bullet list, trust placed where doubt peaks, and a mobile buy-box that stays reachable. The page shell is a React Server Component; only the variant island is `"use client"` (`ultraweb:app-structure`). One content dependency is non-negotiable and gets flagged in BRIEF.md up front: **one pre-optimized photo per variant** — the anchor pattern below is worthless without it.

## Process

1. Read the wireframe for section order and BRIEF.md for the per-variant photo inventory; if one shot per variant is missing, flag it before building — not after.
2. Lock ONE gallery aspect ratio for the whole product range; wire the main image as the LCP (`preload`, `sizes`, `placeholder="blur"`).
3. Build the buy-box hierarchy name → price → variant → CTA with exactly one primary button.
4. Implement the Swatch-Driven Hero Crossfade as the single client island: server picks the default variant from `searchParams`; selection crossfades, re-prices, writes the URL, and announces via `aria-live`.
5. Spec via `data-display` Definition, trust via `social-proof`, then the mobile sticky buy-box bar.
6. Optional riders (below) only if the brief asks. Verify: no reload on select, zero CLS on crossfade, AA, reduced-motion path, both themes.

## The signature — Swatch-Driven Hero Crossfade

The anchor. Convincing material choice does **not** require real-time rendering: a well-shot photo per swatch, crossfaded on selection, delivers the perceived craft of a full configurator at near-zero cost (`award-canon` — steal the principle, skip the WebGL). Vitra, Herman Miller, and IKEA all ship exactly this. The server component reads `searchParams` (a Promise in Next 16) to choose the SSR-correct default variant and hands it to one client island; selection then (a) crossfades the gallery, (b) re-prices inline for any upcharge, (c) writes `?variant=` via `router.replace(..., { scroll: false })` so the choice is shareable and back-button-able — never a navigation, never a refetch.

```tsx
"use client"; // components/pdp/variant-gallery.tsx — the ONLY client island on the PDP
export function VariantGallery({ variants, initial }: { variants: Variant[]; initial: string }) {
  const router = useRouter();
  const active = variants.find(v => v.slug === (useSearchParams().get("variant") ?? initial))!;
  return (
    <>
      <div className="relative aspect-[4/5]">          {/* aspect LOCKED → zero CLS on swap */}
        {variants.map(v => (
          <Image key={v.slug} src={v.hero} alt={v.alt} fill sizes="(max-width:768px) 100vw, 55vw"
            placeholder="blur" preload={v.slug === initial}          {/* preload initial only; priority is deprecated */}
            className="object-cover transition-opacity duration-[--dur-micro] ease-[--ease-standard]"
            style={{ opacity: v.slug === active.slug ? 1 : 0 }} />    {/* crossfade, not a hard cut */}
        ))}
      </div>
      <fieldset className="mt-4">
        <legend className="sr-only">Colour</legend>
        {variants.map(v => (
          <label key={v.slug} data-checked={v.slug === active.slug}
            className="... data-[checked=true]:ring-2 data-[checked=true]:ring-ring">
            <input type="radio" name="variant" value={v.slug} checked={v.slug === active.slug} className="sr-only"
              onChange={() => router.replace(`?variant=${v.slug}`, { scroll: false })} />
            <span aria-hidden style={{ background: v.chip }} /><span className="sr-only">{v.name}</span>
          </label>
        ))}
      </fieldset>
    </>
  );
}
```

- **Swatches are native radios**, visually hidden, chip rendered on the `<label>` — arrow-key navigation and the checked state come free; the selected chip gets the ring (`--ring`). A 40px thumbnail (a real fabric/finish crop, not a flat colour) is the honest choice for textiles; a solid `--chip` swatch suits hard goods.
- **Crossfade** = two stacked `fill` images in the aspect box, one motion-language duration token (micro band, ~200ms), opacity only — no motion library, no hard swap. Under `prefers-reduced-motion` it collapses to an instant swap.
- **Out-of-stock variants stay visible**, disabled with a struck ring — hiding a colour erases the range the shopper came to see.
- Prefetch the non-initial hero images on first swatch focus/hover so the first crossfade is instant; only the initial variant's image is `preload`ed (it's the PDP's LCP).

## Media gallery

- **Aspect discipline:** one ratio for the entire product range (4/5 for apparel/textiles, 1/1 for objects), locked so neither a swatch crossfade nor a thumbnail swap shifts layout. Shoot every variant to that ratio.
- **Thumbnails vs. swatches are different jobs:** a swatch changes the *variant* (crossfade); a thumbnail rail changes the *angle within the current variant* (instant swap). Rail is vertical beside the stage on desktop, a horizontal scroll-snap strip on mobile — each thumb a real `<button>` named by its angle ("Detail weave"), not a bare dot.
- **Zoom is real, not decorative:** click-to-open a focus-trapped lightbox (`ultraweb:overlays`) showing the media-optimization 2x asset — the baseline every product buyer expects. A hover-magnify lens is an optional desktop upgrade, never the only zoom (touch has no hover). No auto-pan under reduced-motion.

## The buy-box

Hierarchy is fixed, because it maps to how the decision forms: **product name (the page `<h1>`) → price → one value line → variant picker (colour swatches + size) → quantity → Add to cart → shipping/returns microcopy → collapsible spec.** Rules:

- **Exactly one primary CTA** — the filled "Add to cart". Save/wishlist is a ghost or icon button, never a second filled button; a "Buy now" express path, if any, is secondary (`ultraweb:buttons`). Add-to-cart itself — the mutation, the optimistic count, the drawer — belongs to `ultraweb:cart`; the PDP owns the selected-variant state and the button, cart owns what happens on click.
- **Size selector** is a segmented chip group beside the swatches; out-of-stock sizes render disabled, and selecting a size resolves the final SKU and availability.
- **Price** uses `data-display` alignment — `tabular-nums`, one currency format via `Intl.NumberFormat`. On an upcharge variant the price re-renders and shows the delta ("+€20") in the same tabular figures; the whole price/availability block sits in `aria-live="polite"` so a swatch change is announced.
- **Desktop stickiness:** the buy-box column is `position: sticky; top: …` so a long gallery or spec scroll never carries the CTA off-screen.
- **DACH price display** (Grundpreis per kg/l/m, "inkl. MwSt.", shipping-cost link) is a legal slot the buy-box *reserves* but does not author — the exact strings and format defer to `ultraweb:pricing` and `ultraweb:gate-content`. Never invent the MwSt/Grundpreis line inline.

## Spec, description & trust

- **Spec sheet** via the `data-display` Definition variant — a two-column label/value table (Material, Dimensions, Weight, Care, Origin), one precision per column, units stated once. It beats a bulleted list every time.
- **Description** is real copy (`ultraweb:copywriting`), never lorem; long prose and the spec go in an accordion or tabs so the buy-box clears the fold on mobile.
- **Trust** content is `ultraweb:social-proof`'s job; the PDP owns *placement*: a compact star rating beside the price that anchor-links to the review block (one proof element that supports the CTA, not competes with it), the full reviews lower, customer photos passed through `ultraweb:imagery`'s treatment, and payment/returns badges from `ultraweb:payments` near the CTA where purchase doubt peaks.

## Mobile buy-box stickiness

On mobile the buy-box can't be a sticky side column. Ship a **sticky bottom action bar** that appears once the inline Add-to-cart scrolls out of view: compact price + current variant summary + the same primary CTA. It respects `env(safe-area-inset-bottom)`, reserves page padding so it never covers content, and hides when the cart drawer opens. Reduced-motion: it appears without the slide. This bar is the mobile conversion anchor — most mobile add-to-carts happen here, not at the inline button.

## Optional riders (P2 — build only if the brief calls for them)

- **Guided-selling quiz-to-cart** — a 2–4 step chooser ("what are you making?" → recommends a variant/bundle → pre-fills the buy-box or adds to cart) for choice-heavy catalogues. It is an *addition*, never a gate: the direct PDP always works without it.
- **Digital Product Passport panel** — for textiles, the EU ESPR Digital Product Passport (fibre composition, recycled content, care/repair, origin, plus a scannable code) is phasing in later this decade. Render it as a `data-display` Definition panel with a QR/link, populated from **real** data only and honestly stubbed until the passport exists — never fabricated compliance text. Treat it as an optional section here; the legal data model is out of this skill's scope.

## A11y

- Swatches in a `<fieldset><legend>` as native radios (arrow-key group nav, `:checked` for free); each label's accessible name is the variant name, never just a colour chip.
- The price + availability region is `aria-live="polite"` so screen-reader users hear the update after selecting a variant; the gallery `alt` describes the *current* variant ("Aran throw in Loden, draped").
- Zoom lightbox is a `role="dialog"`, focus-trapped, Esc-closable, focus returned on close (`ultraweb:overlays`).
- A disabled Add-to-cart (no size chosen) carries a reason, not a dead button; the mobile sticky bar's CTA is the same accessible action, not a focus trap.

## Anti-patterns

- Variant select that navigates or refetches — a per-colour `<a href>`, or a `router.push` that re-renders the page. Variant change is a client-side crossfade, no reload.
- Hiding out-of-stock variants instead of disabling them — the shopper can't judge a range they can't see.
- Two filled CTAs (Add to cart + Buy now both filled); "Add to cart" competing with a filled wishlist.
- Price or delta without `tabular-nums`; a hand-formatted currency string instead of `Intl.NumberFormat`.
- Swatches as `<div onClick>` — no radio semantics, no keyboard, no `aria-checked`, no ring.
- Gallery aspect not locked → layout shift on crossfade (CLS); `priority` on the gallery image (deprecated — use `preload`); `loading="lazy"` on the LCP gallery image.
- Emoji as swatch/size markers; a gray-box placeholder for a missing variant photo (`ultraweb:imagery` owns honest placeholders).
- A carousel as the only gallery — no thumbnail affordance, no zoom.
- Mobile sticky bar covering content (no safe-area, no reserved padding).
- Inventing the Grundpreis/MwSt line inline instead of deferring to `pricing`/`gate-content`.
- Reaching for a motion library to fade one image — CSS opacity is enough.

## Worked example — Loop & Thread, the Aran Lambswool Throw

design/DIRECTION.md: "Warm Editorial — the material is the hero; honest daylight photography, generous type." SYSTEM.md hands over a madder accent `oklch(0.62 0.13 40)` on a warm-paper base `oklch(0.97 0.01 85)`.

The throw ships in six colourways — Oat, Loden, Rust, Slate, Heather, Char. The gallery is locked to **4/5**; the six 40px swatches are real fabric crops at that same ratio. Tapping **Loden** crossfades the 4/5 hero Oat → Loden in one micro-duration token, moves the ring, and writes `/products/aran-throw?variant=loden` with `scroll: false` — no reload. Five colourways hold at **€149**; the herringbone **Heather** weave carries an upcharge, so selecting it re-renders **€169** with a **"+€20"** delta in `tabular-nums`, announced via the `aria-live` price region. The thumbnail rail swaps folded / draped / detail-weave angles for the *active* colourway; a click-to-zoom lightbox shows the 2x weave detail textile buyers actually inspect.

Buy-box: `<h1>` "Aran Lambswool Throw" → **€149** with a reserved Grundpreis slot ("€99,33 / kg", "inkl. MwSt." — filled by `pricing`) → one value line → colourway swatches + size (Single 130×180 / Large 150×200, Large +€40, sold-out sizes disabled) → quantity → the one filled CTA **"In den Warenkorb"** → free-returns microcopy → a 4.8★ (212) rating anchor-linking to the reviews. Spec is a `data-display` Definition panel (100% lambswool · herringbone/plain weave · 1.5 kg · cool wash · woven in Donegal). On mobile a sticky bottom bar — "€149 · Loden · In den Warenkorb", safe-area padded — appears once the inline CTA scrolls away. One optional rider is used: a "Materialpass" DPP panel (fibre composition, 0% recycled, care, repair, origin, QR) flagged ESPR-driven and honestly stubbed.

Rejected: a real-time WebGL fabric configurator — six pre-shot colourway photos crossfaded give the same material confidence at a fraction of the weight (the whole principle). Also rejected: the guided-selling quiz — a single throw doesn't need one (it belongs on the yarn catalogue, not here), and hiding the two sold-out sizes — they stay visible-but-disabled so the range reads honestly.

Handoff: `ultraweb:cart` owns the add-to-cart mutation + drawer; `ultraweb:media-optimization` sizes the six colourway heroes + the 2x zoom asset; `ultraweb:social-proof` fills the review content and customer photos; `ultraweb:pricing`/`ultraweb:gate-content` own the Grundpreis/MwSt legal strings; `ultraweb:overlays` owns the zoom dialog.

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
