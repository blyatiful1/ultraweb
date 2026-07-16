---
name: payments
description: Stripe payments for a Next.js 16 site — Stripe 22 with a lazy-instantiated client (no apiVersion pin; the SDK ships its own), Checkout Session creation in a server action redirecting to Stripe-hosted checkout, a webhook route handler that reads the raw body via await req.text() before constructEvent (the classic parsed-body signature failure), prices modeled in the Dashboard and allowlisted in code, strict test-mode discipline with the Stripe CLI, and success/cancel pages designed to the system — never bare. Invoke during the backend phase when the brief sells anything — one-time purchases, subscriptions, pricing-page checkout — when webhook signature verification keeps failing, or when fulfillment logic lives on the success page. Trigger phrases — "add Stripe", "checkout", "payments", "subscriptions", "billing", "buy button", "webhook signature error", "payment succeeded but nothing happened".
---

# payments — Stripe without the classic footguns

**Stage:** Phase 7 — Backend - **Reads:** design/BRIEF.md, design/SYSTEM.md, pricing tiers from ultraweb:pricing - **Writes:** lib/stripe.ts, lib/prices.ts, app/actions/checkout.ts, app/api/webhooks/stripe/route.ts, /checkout/success + cancel surfaces

## Standard

- Money code is trust code: the webhook is the single source of fulfillment truth, every signature is verified, and no amount ever comes from the client.
- Stripe-hosted Checkout by default — PCI scope stays with Stripe and the redirect flow needs zero client JS. Embedded/custom flows only if BRIEF.md demands them; verify against current docs first.
- Prices are modeled in the Stripe Dashboard; code references price IDs through one allowlist shared with the pricing section — displayed price and charged price cannot drift.
- Test mode until ship: `sk_test_` keys, Stripe CLI webhook forwarding, the 4242 card through the entire flow before any live key exists anywhere.
- Success and cancel are designed surfaces per SYSTEM.md — a bare "Payment successful." on white is a brand failure at the highest-trust moment of the site.

## Process

1. Read design/BRIEF.md: what's sold — one-time (`mode: 'payment'`) or recurring (`mode: 'subscription'`)? Create one Product + Price per purchasable in the Dashboard (test mode).
2. `npm i stripe`. Env: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `NEXT_PUBLIC_APP_URL` (`http://localhost:3000` in dev) in .env.local and .env.example. Never a `NEXT_PUBLIC_` prefix on either secret.
3. Write the lazy client, the checkout action, and the webhook route (below).
4. Put price IDs in `lib/prices.ts` consumed by BOTH the pricing section and the checkout allowlist — one source.
5. Local webhook loop: `stripe listen --forward-to localhost:3000/api/webhooks/stripe` → copy the printed `whsec_` into `STRIPE_WEBHOOK_SECRET`.
6. Drive the full flow with card 4242 4242 4242 4242: pricing → action → Stripe → success page; confirm the webhook fired and fulfillment wrote. Then drive the cancel path back to pricing.
7. Build the success/cancel surfaces to SYSTEM.md; pending state on the buy button per ultraweb:buttons.

## The client

```ts
// lib/stripe.ts
import Stripe from 'stripe'

let stripe: Stripe | null = null
export function getStripe(): Stripe {
  if (!stripe) stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)  // no apiVersion — the SDK pins its own
  return stripe
}
```

Lazy so `next build` passes on machines without the key — a module-scope `new Stripe(...)` in anything a page imports fails the build.

## Checkout — server action

```ts
// app/actions/checkout.ts
'use server'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { getStripe } from '@/lib/stripe'
import { PRICE_IDS } from '@/lib/prices'   // as-const tuple, shared with the pricing section

const priceSchema = z.enum(PRICE_IDS)      // allowlist: the client picks a plan, never a price

export async function checkout(formData: FormData) {
  const parsed = priceSchema.safeParse(formData.get('priceId'))
  if (!parsed.success) redirect('/pricing')

  const session = await getStripe().checkout.sessions.create({
    mode: 'subscription',                  // 'payment' for one-time
    line_items: [{ price: parsed.data, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=1`,
  })
  redirect(session.url!)                   // outside any try/catch — redirect throws internally
}
```

`{CHECKOUT_SESSION_ID}` is a literal — Stripe substitutes it on redirect; never template it yourself.

## Webhook — the raw-body rule

```ts
// app/api/webhooks/stripe/route.ts
import type Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'

export async function POST(req: Request) {
  const body = await req.text()            // RAW body. req.json() destroys the signed payload.
  const sig = req.headers.get('stripe-signature')
  if (!sig) return new Response('No signature', { status: 400 })

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return new Response('Invalid signature', { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      await fulfill(event.data.object)     // idempotent, keyed on session id — Stripe redelivers
      break
    }
  }
  return new Response(null, { status: 200 })
}
```

- Fulfillment is idempotent: record processed session/event IDs (ultraweb:database) and no-op on repeats — Stripe retries any non-2xx or timeout.
- Fulfillment truth lives HERE, never on the success page: users close tabs before the redirect, and success URLs get revisited with stale IDs.
- Keep the handler fast — do the DB write, defer heavy side effects (receipt email after the write); a slow handler times out and triggers retries.

## Test-mode discipline

- `sk_test_` + the `whsec_` from `stripe listen` live in .env.local; live keys exist only in the deploy platform's env, entered at ship — never in any file in the repo tree.
- Card 4242 4242 4242 4242 (any future expiry, any CVC) proves the happy path; a declined test card proves Stripe-side handling — your designed surface for abandonment is the cancel path.
- The CLI's `whsec_` differs from the Dashboard endpoint's secret — at ship, create the production webhook endpoint and swap `STRIPE_WEBHOOK_SECRET`.

## Success and cancel — designed pages

- `/checkout/success`: server component, `await searchParams` (Next 16: it's a Promise), `getStripe().checkout.sessions.retrieve(id)`, render confirmation ONLY when `payment_status === 'paid'` — what was bought, what happens next, one CTA onward. Missing or unpaid session → redirect home, not an error page.
- Cancel is not a page, it's a return: `cancel_url` lands on `/pricing?canceled=1`, which renders one quiet reassurance line ("Nothing was charged.") above the tiers still on screen.
- Both surfaces get full SYSTEM.md treatment — the success page carries the same craft as the hero; the user just paid.

## Anti-patterns

- `await req.json()` in the webhook route — parsed body ≠ signed payload; `constructEvent` fails every time. THE classic.
- `apiVersion:` in the Stripe constructor — the SDK pins its own; a hardcoded version rots and breaks types on upgrade.
- `new Stripe(` at module scope — build fails without the key; lazy-init.
- `unit_amount` or `amount:` derived from formData — client-supplied prices; the allowlisted price ID is the only client input.
- Fulfillment on the success page (`sessions.retrieve` then a DB grant, no webhook) — closed tabs and replayed URLs make it wrong; grant in the webhook, display on the page.
- `sk_live_` anywhere in the repo tree — live keys belong only in deploy-platform env.
- `NEXT_PUBLIC_STRIPE_SECRET` — a secret with a public prefix ships to the browser.
- A success page rendering "Payment successful" without retrieving and checking the session — celebrates unpaid and forged visits.
- Bare unstyled success/cancel surfaces — designed pages, per Standard.

## Composes with

- **ultraweb:pricing** — the tiers it renders and the checkout allowlist share `lib/prices.ts`; one source, zero drift.
- **ultraweb:server-actions** — checkout follows its rules: zod at the boundary, `redirect()` outside try/catch.
- **ultraweb:database** — fulfillment writes orders/subscriptions plus the processed-event ledger that makes the webhook idempotent.
- **ultraweb:ui-states** — pending state on the buy button, the success confirmation, the canceled reassurance line.
- **ultraweb:email** — receipt/confirmation mail sent from the webhook after the fulfillment write.
- **ultraweb:ship** — env audit swaps to live keys, the production webhook endpoint secret, and `NEXT_PUBLIC_APP_URL` to the production origin at deploy, nowhere earlier.
