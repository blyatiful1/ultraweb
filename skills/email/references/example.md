## Worked example — Kaffeewerk Ost, order confirmation after Stripe checkout

design/BRIEF.md: "Resend order confirmations after every purchase — sensory and direct, no marketing fluff." One transactional flow; the send drains the order-keyed outbox row the Stripe webhook writes per ultraweb:payments — never inline in the handler, so a webhook retry can't resend.

`emails/theme.ts` reads SYSTEM.md's warm-neutral palette from `lib/tokens.ts` as resolved hex — oklch never reaches an inbox:

```ts
export const t = {
  bg: '#f7f3ec', fg: '#2b241f', muted: '#7a6f64', border: '#e6ded2',
  accent: '#b3572f',                                   // rust, oklch(0.62 0.16 45) → hex
  font: "'Fraunces', Georgia, 'Times New Roman', serif",  // display face + system serif fallback
}
```

`emails/order-confirmation.tsx` leads with one Fraunces heading — "Deine Röstung ist unterwegs" — then a line-item block naming the roast in the brief's voice ("Röstung No. 14 · Washed Yirgacheffe — Apricot, black tea, honey"), one rust `<Button>` to an absolute `${process.env.NEXT_PUBLIC_SITE_URL}/shop/${order.productSlug}` — an email has no origin to resolve a relative path — for a reorder, and a hairline `<Hr>`. Subject: `Röstung No. 14 — bestätigt`.

Rejected: rendering the site's signature roast-profile temperature-curve SVG inline in the email — Gmail strips inline SVG to a broken-image box, so the motif stays on the web and the email keeps the `<Hr>` divider instead.

Handoff: the `getResend().emails.send({ react: OrderConfirmation(order) })` call drains the order-keyed outbox row the raw-body Stripe webhook writes per ultraweb:payments — not inline in the handler. The drain is idempotent end to end: claim the row atomically by its Stripe event/order ID and pass that same ID to Resend as the send's idempotency key (covered on `POST /emails` for 24h — so even a crash between an accepted send and the sent-flag write can't duplicate), give claims an expiring lease so a crashed drainer's rows get reclaimed, skip any row already marked sent, and mark it sent only after Resend returns no `error` (it's `{ data, error }`, never a throw) — a failed send releases the claim so the next drain retries, and a redelivered webhook can't resend a confirmation already recorded. ultraweb:copywriting supplied the subject and the tasting-note line.
