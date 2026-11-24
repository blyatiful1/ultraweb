# commerce

Cart, product detail page, and German price-display rules, stated once.

Load when: the brief includes a shop, product pages, subscriptions or any displayed consumer price for the German-speaking market.
Reads: design/BRIEF.md, design/SYSTEM.md, `lib/prices.ts`. Writes: `components/cart/*`, `components/pdp/*`, `app/actions/cart.ts`, `app/(shop)/products/[slug]/page.tsx`.

Other references defer here for price strings. Checkout field order and the wider legal set are in `references/legal-dach.md`.

## Price display rules (DACH)

State each rule once; every price surface (cards, PDP, cart, pricing section, checkout) renders from these.
- Gross: German B2C prices are VAT-inclusive. The primary amount is the total; no "+ MwSt." reveal and no tax added at a later step. Checkout charges the same amount.
- Grundpreis: goods sold by weight, volume or length carry a secondary unit price beside the primary: smaller, muted, `tabular-nums`, one unit base site-wide (per 100 g everywhere, not per 100 g in one list and per kg in another).
- Disclosure at every add-to-cart and checkout button: "inkl. MwSt., zzgl. Versandkosten", with the shipping words linking to the terms page. Visible text, not a footnote or hover.
- Format: comma decimal, symbol after the amount ("1 249,00 €"), via `Intl.NumberFormat` with the locale.
- Streichpreis (struck-through earlier price): show only a real, dated prior price, and it must be the lowest price of the previous 30 days (EU Omnibus). Never an invented "was".
- Button wording: the order button says what happens ("Zahlungspflichtig bestellen" or the current legally required equivalent; confirm wording with the client's counsel). A generic "Weiter" on the final step is not acceptable.

## Cart

The cart is server-owned state: a cookie-keyed cart in the database, read on the server, changed only by server actions. Only the drawer's open state is client state, kept in a leaf component, never lifted into the root layout. The displayed total is a server-computed preview from `lib/prices.ts`; the charged total comes from the payment provider using the same price IDs, so they cannot drift. Never sum `data-price` attributes on the client, and never accept a price or total from the client.

Variants:
1. Slide-over drawer (default): built on `<dialog>` via `references/primitives.md` overlays; the shopper stays on the page. No-JS fallback is the cart page.
2. Dedicated `/cart` page: back-button friendly; for large baskets, gift options, order notes, split shipping.
3. Mini-cart popover: anchored to the header icon, 2 to 3 thumbnails, subtotal, two CTAs; paired with a drawer or page.

Add to cart: a real `<form action={addToCart}>` (the PDP owns the button and quantity). With JS the header count updates optimistically and the drawer opens or a toast names the added item ("Im Korb: Name"); without JS it posts and lands on `/cart`. 

Line items: thumbnail at real aspect (no `preload`), name linking to the PDP, variant meta muted, unit price, stepper, right-aligned line subtotal in `tabular-nums`. Stepper: real minus and plus buttons with `aria-label`, a labeled numeric input, floor of 1 (below is remove), plus disabled at the stock ceiling, writes debounced and optimistic. Remove sets the line to 0 and shows an undo toast that restores from a snapshot; no confirm modal for one line.

Free-shipping bar: only with a real threshold from config ("Noch 6,50 € bis zum kostenlosen Versand"), flips to a confirmed state when met, `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and a text equivalent. An invented threshold is a dark pattern.

Cross-sell: exactly one recommendation, chosen on the server, shaped as a single line-item card. No carousel, no 3-plus tile wall. If there is no honest pick, render nothing.

Empty cart: one in-voice line and one action back into the shop, at most one curated nudge. The drawer and `/cart` share one empty-state component.

Server action. Cache invalidation after the mutation must use the cache API as documented for the installed Next version; the tag-revalidation function's signature has changed between versions and may now require a second argument or have a read-your-writes variant for server actions. Verify against current Next docs before writing it. The skeleton:

```ts
"use server"; // app/actions/cart.ts
const addSchema = z.object({ priceId: z.enum(PRICE_IDS), qty: z.coerce.number().int().min(1).max(99) });
// parse with safeParse, call addLine(cartId(), parsed.data), then invalidate the cart tag per current Next docs.
// Return { ok: true } or { ok: false, error } with a worded message; the client never sends a price or total.
```

Optimistic count: `useOptimistic` on the header trigger, bumped in a transition; it reverts on `{ ok: false }`. Add, set-quantity and remove may be optimistic. Checkout is not: it hands off to the payment provider with an honest pending state, never an optimistic "order placed".

Accessibility: the drawer is a modal dialog; the count is announced through one polite live region on the trigger label ("Warenkorb, 3 Artikel"); the undo control is keyboard operable within the toast's lifetime.

Greppable: `window.location` on add; summed `data-price`; remove with no undo; net prices to German consumers; optimistic "order placed".

## Product detail page

The buy decision. Every variant is visible before commitment and no reload is needed to see another option. The page shell is a server component; only the variant island is a client component. Flag in BRIEF.md up front that the pattern needs one pre-optimized photo per variant; without it, do not build the crossfade.

Buy-box order: product name (the page `h1`), price, one value line, variant picker (swatches, size), quantity, the one filled Add to cart, shipping and returns microcopy, collapsible spec. One primary CTA; wishlist is ghost or icon; an express "Buy now" is secondary. The PDP owns selected-variant state and the button; the cart owns what happens on click. Render the price strings from the DACH rules above; never inline. Desktop: the buy-box column is `position: sticky`. Sizes are a segmented chip group; out-of-stock sizes are disabled. An upcharge variant re-renders the price and shows the delta in `tabular-nums`; the price and availability block is `aria-live="polite"`.

Swatch-driven crossfade: the server reads `searchParams` (a Promise in current Next; check docs) to pick the default variant, and passes it to one client island. Selecting a swatch crossfades the gallery, re-prices, and writes `?variant=` with `router.replace(..., { scroll: false })` so the choice is shareable and survives back. No navigation or refetch. If the page reads search params on the client, check whether it needs a Suspense boundary.

```tsx
"use client"; // components/pdp/variant-gallery.tsx
const active = variants.find((v) => v.slug === (useSearchParams().get("variant") ?? initial)) ?? variants[0];
// Stacked images in one aspect-locked box; only the initial one is preloaded.
<div className="relative aspect-[4/5]">{/* locked: no layout shift on swap */}
  {variants.map((v) => (
    <Image key={v.slug} src={v.hero} alt={v.alt} fill sizes="(max-width:768px) 100vw, 55vw"
      preload={v.slug === initial} className="object-cover transition-opacity duration-200"
      style={{ opacity: v.slug === active.slug ? 1 : 0 }} />
  ))}
</div>
// Swatches: <fieldset><legend className="sr-only">Colour</legend> of sr-only radios; onChange calls
// router.replace(`?variant=${v.slug}`, { scroll: false }). The label shows the chip; its text is the variant name.
```

- Swatches are native radios (arrow keys and checked state free); textiles use a real fabric crop thumbnail, hard goods a solid chip. The crossfade is opacity on stacked images, about 200 ms from the motion tokens, instant under reduced motion, no animation library.
- Out-of-stock variants stay visible and disabled; hiding erases the range. Prefetch other hero images on first swatch focus.
- Gallery: one aspect ratio for the whole range, every variant shot to it. A thumbnail rail changes the angle (instant swap, buttons named by angle; vertical on desktop, scroll-snap strip on mobile); a swatch changes the variant. Zoom opens a modal dialog with the 2x asset; a hover lens is optional, never the only zoom, and does not auto-pan under reduced motion. A carousel as the only gallery is wrong.
- Spec: definition table from `references/primitives.md`. Long description and spec go in an accordion or tabs so the buy-box clears the mobile fold.
- Trust: a rating beside the price linking to reviews (real reviews only; proof rules in `references/sections.md`), payment and returns badges near the CTA.
- Mobile: a sticky bottom action bar appears once the inline Add to cart scrolls out, with compact price, variant summary and the same CTA. It respects `env(safe-area-inset-bottom)`, reserves page padding, and hides while the cart drawer is open.

Greppable: `router.push` or per-colour `<a href>` for variants; hidden out-of-stock variants; two filled CTAs; swatches as `<div onClick>`; `priority` on the gallery image; an inline MwSt or Grundpreis line.
