## Worked example — Loop & Thread, one-time checkout for handmade goods

design/BRIEF.md: "Small-batch woven goods — every piece is one-off; when it sells, it's gone." Physical purchases, charged once, no recurring plan.

The buy button lives on `/products/[slug]`; each throw and runner is one Product + Price in the Dashboard (test mode), IDs allowlisted in `lib/prices.ts` as an as-const tuple the shop tiles and the checkout action both read. The action validates `formData.get('priceId')` through `z.enum(PRICE_IDS)` — never an amount — and creates a one-time session:

```ts
const session = await getStripe().checkout.sessions.create({
  mode: 'payment',                          // finished goods, charged once — not a plan
  line_items: [{ price: parsed.data, quantity: 1 }],
  success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/shop?canceled=1`,   // no /pricing route — back to the grid
})
```

Env stays `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`, no `NEXT_PUBLIC_` prefix; the raw-body webhook fulfills on `checkout.session.completed`. Session-id idempotency is not enough for one-off stock — two different sessions can race for the same piece — so the write is one transaction that marks it sold behind a unique constraint keyed on the inventory item, refunding the session on conflict (already gone). That transaction records an order-keyed outbox row rather than calling Resend inline, then acks Stripe promptly; ultraweb:email drains the outbox. Success page is designed to SYSTEM.md — Fraunces heading on undyed linen `oklch(0.94 0.012 80)`, walnut `oklch(0.35 0.04 60)` body, copy "Woven to order — your piece ships within five days," one CTA back to `/journal`.

Rejected: a "monthly textile club" subscription — the brief sells finished one-off pieces, not a recurring box, and recurring billing on single inventory would keep charging for goods already gone.

Handoff: `lib/prices.ts` is the single source ultraweb:pricing renders the shop buy tiles from; the webhook's fulfillment write records the order-keyed outbox row ultraweb:email drains for the confirmation.
