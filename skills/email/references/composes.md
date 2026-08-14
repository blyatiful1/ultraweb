## Composes with

- **ultraweb:server-actions** — the contact action owns validation and error-as-state; this skill owns the send inside it. For the newsletter, that action writes the pending record and the `/newsletter/confirm` route flips it to subscribed; this skill only sends the confirmation mail between them.
- **ultraweb:forms** — designs the contact form whose submit lands here; its success state reports what the email did.
- **ultraweb:footer** — its newsletter row's server action lands here as the double-opt-in confirmation, never a fire-and-subscribe subscribe; the row owns the input and the "check your inbox" success state, this skill owns the confirmation template and send.
- **ultraweb:auth** — Better Auth's magic-link/verification flows call a send function; the template and Resend call live here, the token logic stays there.
- **ultraweb:database** — the pending (unconfirmed) subscriber record, its signed single-use token, and the ~48h expiry live in the schema there; this skill sends the confirmation mail that flips a pending row to subscribed.
- **ultraweb:copywriting** — subject lines, preview text, and body copy are site voice, not boilerplate.
- **ultraweb:tokens** — its `lib/tokens.ts` resolved-hex export is what theme.ts reads; email clients can't parse oklch or custom properties, so the flattened sRGB values are the only mirror that can't drift.
- **ultraweb:ship** — env audit covers RESEND_API_KEY and the verified production sender domain.
- **ultraweb:brief** — reading design/BRIEF.md is process step 1; it decides which flows (contact, auth, receipt) send mail at all, or whether this skill is skipped.
- **ultraweb:payments** — its raw-body Stripe webhook writes the order-keyed outbox row this skill drains to send the receipt/order-confirmation (idempotent per event/order ID, never inline in the handler); the template and Resend call live here, the payment event stays there.
