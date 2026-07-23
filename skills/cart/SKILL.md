---
name: cart
description: Design and build the cart surface and its state — the add-to-cart feedback moment (never a full page reload), the slide-over drawer vs dedicated /cart page decision, line-item anatomy with quantity steppers and remove-with-undo, an empty cart designed as a merchandising moment, honest server-computed running totals with a free-shipping progress bar, exactly ONE cross-sell slot under the anti-three-cards rule, and optimistic updates wired to server actions. Three named variants (slide-over drawer, dedicated page, mini-cart popover). Invoke in Phase 6/7 whenever a commerce build needs a cart — add-to-cart, mini-cart, cart drawer, /cart page, quantity steppers, free-shipping bar, or "nothing owns the cart" — or when the user says "add a cart", "mini cart", "cart drawer", "the cart reloads the page", "update the cart total", or "cross-sell in the cart".
---

# cart — a conversion surface, not a receipt

**Stage:** Phase 6 — Build (actions wired in Phase 7) - **Reads:** design/SYSTEM.md, design/BRIEF.md, lib/prices.ts - **Writes:** components/cart/*, app/actions/cart.ts, a cookie-keyed cart store

## Standard

The cart is where intent becomes revenue, so it earns the same craft as the hero — and the same restraint. First-grade means: adding an item never reloads the page; the running total is honest and computed server-side from the one price source, so the number shown is the number charged; every line is editable and every edit is reversible; the empty cart is a way back in, not a dead end. The governing rule, from the cross-sell exemplars: **the cart tells you exactly one thing you can do to get more value, and that one thing appears once.** One well-chosen cross-sell and a real free-shipping bar reduce abandonment; a wall of upsell tiles is wallpaper and taste bans it here as everywhere. The cart is server-owned state (cookie-keyed, DB-backed); only the drawer's open/close is client leaf state.

## Variants

Pick by how much room the basket needs and whether browsing continuity matters — a site may use two (a drawer that links to a full page).

1. **Slide-over drawer** (default) — slides in over the current page from the trailing edge; the shopper stays on the collection or product page. Best for typical baskets where continuity converts. Built on `ultraweb:overlays` for scrim, focus trap, and scroll-lock.
2. **Dedicated `/cart` page** — a real, back-button-friendly, SEO-addressable route. Best for high-consideration or large baskets, gift options, order notes, or split shipping — and it is the no-JS destination the drawer degrades to.
3. **Mini-cart popover** — an anchored preview dropping from the header cart icon: count, 2–3 thumbnails, subtotal, and two CTAs (View cart / Checkout). A glance, not an editing surface; pair it with a drawer or page for the real work.

## The add-to-cart moment

The single most important interaction on a commerce site — and the one most often botched with a full reload.

- The add button is a real `<form action={addToCart}>` (`ultraweb:product-detail` owns the button, its variant, and qty). With JS: the header count bumps optimistically and the drawer peeks open or a designed toast confirms — no navigation. Without JS: the form posts, the server mutates, the page re-renders and lands on `/cart`.
- Confirm the specific noun, not "Added!": the item that was added is visible in the drawer, or the toast names it ("Im Korb: Äthiopien Yirgacheffe"). The confirmation the user is already looking at IS the confirmation (`ultraweb:ui-states`).
- A lighter option where the cart is secondary (a restaurant with one merch item): skip the drawer entirely — a sonner toast + a count badge, no overlay.

## Line items, steppers, remove-with-undo

- **Anatomy:** thumbnail at its real aspect (`next/image`, no `preload` — below the fold), name linking to the PDP, variant meta muted (grind, size — never accent), unit price, quantity stepper, and a line subtotal right-aligned in `tabular-nums` (`ultraweb:data-display`). One focal per row: the product, not the price.
- **Stepper:** real `−`/`+` `<button>`s flanking the count, each with an `aria-label`; the editable field is `inputMode="numeric"` with a real label. Floor is 1 (below it is remove); `+` disables at the stock ceiling. The write is debounced and optimistic.
- **Remove:** never a bare delete and never a confirm modal for one line — set the line to 0 and fire a sonner undo toast ("Entfernt: Chemex-Filter — Rückgängig") that restores from the pre-remove snapshot. Reversible beats interrogating.

## Totals, free shipping, and DACH prices

- Subtotal, shipping, and total right-aligned in `tabular-nums`, one currency format sitewide. The displayed total is a server-computed preview from `lib/prices.ts`; the charged total is Stripe's from the same price IDs — they **cannot** drift. Never sum `data-price` attributes on the client.
- **Free-shipping bar:** only with a real threshold from config — "Noch 6,50 € bis zum kostenlosen Versand" plus a progress bar, remaining amount in `tabular-nums`; it flips to a confirmed state ("Kostenloser Versand freigeschaltet") when met. Inventing a threshold to nudge is a dark pattern (`ultraweb:gate-content`).
- **DACH:** German B2C prices are gross (VAT-inclusive) per PAngV — show gross with "inkl. MwSt., zzgl. Versand" beside the total. The full VAT breakdown and the shipping-terms link defer to `ultraweb:pricing` and `ultraweb:gate-content`; don't spell the legal detail here.

## The one cross-sell slot

- Exactly ONE recommendation, server-chosen and contextual ("Passt dazu: …"), shaped as a single line-item card — never a carousel, never a ≥3-tile "customers also bought" wall. The anti-three-cards rule from `ultraweb:cards` and `ultraweb:feature-sections` applies inside the cart with extra force: this is the least forgiving place for filler.
- If there is no honest, relevant pick, render nothing — an absent cross-sell beats a weak one.
- Its "Hinzufügen" re-runs the same optimistic add; adding it moves no page.

## Empty cart — a merchandising moment

- Designed as `ultraweb:ui-states`' First-Use Empty: one line of brand voice + exactly ONE primary action back into the shop (or the featured roast). Never a bare "Your cart is empty."
- At most one curated nudge (a bestseller, the seasonal roast) — still ONE, still under the cross-sell rule, never a grid.
- The drawer's empty body and `/cart`'s empty state are one shared component.

## State + optimistic wiring

Cart state lives on the server: a cookie-keyed cart in the DB (`ultraweb:database`), read on the server, mutated only by `'use server'` actions. Drawer open/close is client leaf state (`ultraweb:app-structure`) — never lift it into a layout.

```tsx
// app/actions/cart.ts
'use server'
import { revalidateTag } from 'next/cache'
import { z } from 'zod'
import { PRICE_IDS } from '@/lib/prices'   // the same allowlist ultraweb:pricing renders and ultraweb:payments charges

const addSchema = z.object({ priceId: z.enum(PRICE_IDS), qty: z.coerce.number().int().min(1).max(99) })

export async function addToCart(_prev: unknown, formData: FormData) {
  const parsed = addSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { ok: false as const, error: 'Konnten wir nicht hinzufügen — bitte erneut.' }
  await addLine(cartId(), parsed.data)     // server owns the cart; the client never sends a price or a total
  revalidateTag('cart')
  return { ok: true as const }
}
```

```tsx
// header cart trigger — instant feedback, snaps back if the action returns { ok: false }
const [optimisticCount, bump] = useOptimistic(count, (n, delta: number) => n + delta)
// in the add form's action: startTransition(() => { bump(qty); openDrawer() })
```

`add`, `setQuantity`, and `remove` are all reversible, so `useOptimistic` is right for them (`ultraweb:server-actions`). Checkout is not — it hands off to `ultraweb:payments` with an honest pending state, never an optimistic "order placed."

## A11y

- The drawer follows `ultraweb:overlays`: `role="dialog"` + `aria-modal`, focus trapped and returned to the cart trigger on close, Escape closes, the page behind doesn't scroll.
- Count badge announced by one `aria-live="polite"` on the trigger's label ("Warenkorb, 3 Artikel") — not a chorus per line.
- Steppers are real buttons with `aria-label`; the qty field has an associated label; the undo toast's control is keyboard-operable within its lifetime.
- The free-shipping bar is a `role="progressbar"` with `aria-valuenow/min/max` and a text equivalent — never conveyed by width or color alone.

## Anti-patterns

- `window.location` / a full reload on add-to-cart — the in-place moment is the whole point.
- A cross-sell carousel or a ≥3-tile "customers also bought" wall in the cart — wallpaper; one slot only.
- A total summed from `data-price` attributes client-side — it drifts from the Stripe-charged amount; server-compute it.
- `<input type="number">` alone as the quantity control, or no stock ceiling on `+`.
- A bare "Your cart is empty" with no action — a dead end where a merchandising moment belongs.
- Remove with no undo, or a confirm modal for a single line.
- Net prices shown to DE consumers, or VAT/shipping hidden until checkout — a surprise total.
- A free-shipping bar with an invented threshold.
- Optimistic "order placed" on checkout — cart edits are optimistic, checkout never is (irreversible).
- Lifting drawer-open state into the root layout — it's leaf client state.

## Worked example — Kaffeewerk Ost, the cart for a Berlin roastery

design/BRIEF.md: Warm Organic e-commerce shop + `/abo` subscriptions; free shipping over 39 € is real; signature = the roast-profile temperature curve.

Slide-over drawer is the default — buying a second bag shouldn't cost the collection page. Add-to-cart on `/shop/[slug]` is `<form action={addToCart}>`; with JS the count bumps optimistically and the drawer peeks open on warm cream `oklch(0.97 0.01 85)`, without JS it posts and lands on `/cart`. Line items: a 4/5 bag thumbnail, name → PDP, grind + 250/1000 g as muted Karla meta, `−`/`+` steppers, line subtotal in `tabular-nums`. Totals are computed server-side from `lib/prices.ts` — the same allowlist `ultraweb:payments` charges from — shown gross with "inkl. MwSt., zzgl. Versand" beneath the total.

The signature move lands here: the free-shipping progress isn't a plain bar but the roast-curve motif filling toward first crack — "Noch 6,50 € bis zum kostenlosen Versand," flipping to "Kostenloser Versand freigeschaltet" at 39 €. One cross-sell slot: the current featured single-origin as a single line-shaped card ("Passt dazu: Äthiopien Yirgacheffe"), never a grid. Empty drawer: "Noch nichts im Korb — der Hausröst wartet" + one CTA to the bestseller.

Rejected: a "Kunden kauften auch" carousel of six tiles — one honest pick converts and the rest is noise in the least forgiving spot on the site. Also rejected: summing the total from the tiles' `data-price` — `/abo` subscription lines price differently, and only the server (and Stripe) computes the charged amount.

Handoff: drawer, line items, and the empty state land in `components/cart/*`, the three mutations in `app/actions/cart.ts`; `ultraweb:overlays` owns the drawer scrim and focus trap, `ultraweb:product-detail` owns the add button that opens this, and `ultraweb:payments` takes the cart to a Checkout Session from the same price allowlist so the previewed total and the charged total can't drift.

## Composes with

- ultraweb:payments — the cart hands its line items to a Checkout Session; both read `lib/prices.ts`, so the previewed total and the charged total share one source and cannot drift.
- ultraweb:pricing — price typography, `tabular-nums`, and the gross/VAT framing the totals inherit; the legal VAT/shipping detail defers there and to gate-content.
- ultraweb:server-actions — add/setQuantity/remove are its actions: zod at the boundary, errors as data, `useOptimistic` for the reversible edits, `revalidateTag('cart')`.
- ultraweb:ui-states — the empty cart is its First-Use Empty; the remove-undo toast, pending steppers, and a failed-add error are its states.
- ultraweb:cards — the cross-sell and each line item are card compositions; the anti-three-cards rule it enforces is why the cart carries ONE cross-sell, not a wall.
- ultraweb:overlays — owns the drawer's scrim, focus trap, Escape, scroll-lock, and focus return; the cart supplies the contents.
- ultraweb:product-detail — owns the add-to-cart button on the PDP that opens this surface and the variant/qty it submits.
- ultraweb:forms — the quantity field and add form follow its field anatomy and no-JS `<form action>` contract.
- ultraweb:navigation — the cart trigger and its live count badge live in the header this reads and bumps.
- ultraweb:motion-language — the drawer slide (section tier) and the count bump (micro), with the reduced-motion fallback: instant open, no slide.
