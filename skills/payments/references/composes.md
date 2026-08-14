## Composes with

- **ultraweb:pricing** — the tiers it renders and the checkout allowlist share `lib/prices.ts`; one source, zero drift.
- **ultraweb:server-actions** — checkout follows its rules: zod at the boundary, `redirect()` outside try/catch.
- **ultraweb:database** — fulfillment writes orders/subscriptions plus the processed-event ledger that makes the webhook idempotent.
- **ultraweb:ui-states** — pending state on the buy button, the success confirmation, the canceled reassurance line.
- **ultraweb:email** — receipt/confirmation mail sent by draining the order outbox the webhook writes, not inline in the handler.
- **ultraweb:ship** — env audit swaps to live keys, the production webhook endpoint secret, and `NEXT_PUBLIC_APP_URL` to the production origin at deploy, nowhere earlier.
- **ultraweb:brief** — reads its design/BRIEF.md to decide one-time (`mode: 'payment'`) vs recurring (`mode: 'subscription'`) and how many Products/Prices to model in the Dashboard.
- **ultraweb:api-design** — the Stripe webhook is a route handler built to its conventions: raw-body reading, explicit status-code contract (400 on bad signature, 200 on ack), no caching on the endpoint.
- **ultraweb:i18n** — the DACH payment-method mix, EUR currency, and locale are one localization surface; the SEPA/Klarna set is a per-market decision made alongside language, not a global default.
- **ultraweb:forms** — the checkout form's field order, payment-method icon layout, and where the Widerrufsrecht line sits follow its rules; this skill owns the session params and the disclosure copy, not the form chrome.
