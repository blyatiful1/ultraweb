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
