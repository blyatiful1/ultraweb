---
name: email
description: Transactional email for a Next.js 16 site — Resend 6 (the { data, error } return; it does NOT throw on API errors, check error explicitly) with @react-email/components templates that carry the design system's palette and type into the inbox, the React component passed via the react property, a contact-form flow wired through a server action, the react-email dev preview server, and RESEND_API_KEY handling with a lazy client so builds pass without the key. Invoke during the backend phase whenever the brief needs outbound mail — contact-form notifications, magic links, welcome or receipt emails — when a template looks default or off-brand, or when sends fail silently. Trigger phrases — "contact form email", "send an email", "transactional email", "email template", "Resend", "magic link email", "the form submits but no email arrives".
---

# email — mail the brand, not defaults

**Stage:** Phase 7 — Backend - **Reads:** design/BRIEF.md, design/SYSTEM.md - **Writes:** emails/*.tsx, emails/theme.ts, lib/email.ts, send calls in app/actions/*

## Standard

- The inbox is a brand surface. Every template carries SYSTEM.md's palette, type hierarchy, and voice — a first-grade site sending a default-gray email breaks trust at the exact moment it's being decided.
- Resend 6 returns `{ data, error }` and does NOT throw on API errors. Every send checks `error` explicitly; an unchecked send is silent mail loss.
- The React Email component goes in the `react` property of `emails.send` — never a hand-rolled HTML string.
- Every template is previewed in the react-email dev server before it's wired to a send.
- Email CSS is 2009-grade: style props only, table-safe components from `@react-email/components`, ≤600px container, hex colors (no oklch), system-stack font fallbacks. The design must hold when Gmail strips the web font.
- Transactional only: contact notifications, magic links, receipts, welcomes. No marketing machinery unless BRIEF.md demands it.

## Process

1. Read design/BRIEF.md: which flows send mail? Contact form → notification to the team (and optionally a confirmation to the sender). Auth → magic-link/verification templates for ultraweb:auth to call. Commerce → receipt. No flows → skip this skill entirely.
2. `npm i resend @react-email/components` and `npm i -D react-email`. Create `emails/` at the project root.
3. Write `emails/theme.ts`: SYSTEM.md tokens translated to email-safe values (oklch → hex, display font + system fallback stack).
4. Build one template per flow. Preview: `npx react-email dev --dir emails --port 3001` (3000 belongs to `next dev`). Iterate until it reads as this site's brand, not React Email's starter.
5. Write the lazy send helper; wire it into the server action per ultraweb:server-actions — failures return as state, never throw at the user.
6. Env: `RESEND_API_KEY` in .env.local and listed in .env.example. Dev sends use `onboarding@resend.dev` (delivers only to the account owner's address until a domain is verified); production requires a verified sending domain — prefer a subdomain (`mail.acme.com`) to isolate reputation.

## The send call

```ts
// lib/email.ts
import { Resend } from 'resend'

let client: Resend | null = null
export function getResend(): Resend {
  if (!client) client = new Resend(process.env.RESEND_API_KEY)  // lazy: builds pass without the key
  return client
}
```

```ts
// inside app/actions/contact.ts, after zod validation (state shape per ultraweb:server-actions)
import { getResend } from '@/lib/email'
import ContactNotification from '@/emails/contact-notification'

const { data, error } = await getResend().emails.send({
  from: 'Acme <contact@mail.acme.com>',
  to: 'team@acme.com',
  replyTo: parsed.data.email,                 // team replies land with the sender
  subject: `${parsed.data.name} — new inquiry`,
  react: ContactNotification(parsed.data),    // component in the react property; called as a fn so the action stays .ts
})
if (error) return { ok: false, errors: { form: ['Message not sent — try again or email us directly.'] } }
```

## Templates

```tsx
// emails/contact-notification.tsx
import { Html, Head, Preview, Body, Container, Text, Hr, Link } from '@react-email/components'
import { t } from './theme'

export default function ContactNotification({ name, email, message }: { name: string; email: string; message: string }) {
  return (
    <Html>
      <Head />
      <Preview>{`${name}: ${message.slice(0, 80)}`}</Preview>
      <Body style={{ margin: 0, backgroundColor: t.bg, fontFamily: t.font, color: t.fg }}>
        <Container style={{ maxWidth: 560, padding: '40px 24px' }}>
          <Text style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 24px' }}>New inquiry</Text>
          <Text style={{ fontSize: 15, lineHeight: '24px', whiteSpace: 'pre-wrap', margin: 0 }}>{message}</Text>
          <Hr style={{ borderColor: t.border, margin: '32px 0' }} />
          <Text style={{ fontSize: 13, color: t.muted, margin: 0 }}>
            {name} · <Link href={`mailto:${email}`} style={{ color: t.accent }}>{email}</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
```

```ts
// emails/theme.ts — SYSTEM.md translated for email clients. Mirrors app/globals.css BY HAND:
// email CSS can't parse oklch and never sees globals.css. Update both when tokens change.
export const t = {
  bg: '#faf9f7', fg: '#1c1917', muted: '#78716c', border: '#e7e5e4', accent: '#0d7a68',
  font: "'Söhne', -apple-system, 'Segoe UI', Helvetica, sans-serif",  // display face + system stack
}
```

Rules:

- Hierarchy in miniature: one heading, one body block, one accent use — the restraint taste demands of a page, at 560px.
- `<Preview>` is designed copy (the inbox's second line) — write it in the brief's voice, never let it default to the first template string.
- CTA buttons: `<Button>` from `@react-email/components`, solid accent background, ≥44px tall via padding — never a bare link for the primary action.
- Web fonts go through the `<Font>` component in `<Head>` with an explicit fallback family — Gmail and Outlook render the fallback, so check the preview in the system stack too. Exact props: verify against current docs first.
- Dark mode in email clients is forced and unreliable: keep bg/fg away from pure `#fff`/`#000` so auto-inversion doesn't produce mud.

## Anti-patterns

- `try {` around `emails.send` with no `error` check — Resend 6 does not throw on API errors; the catch never fires and mail vanishes silently.
- `html:` with a template-literal string when a React template exists — the `react` property renders the component; hand-rolled HTML drifts off-brand.
- `oklch(` anywhere under `emails/` — email clients can't parse it; theme.ts holds the hex translations.
- `className=` in a template without react-email's Tailwind wrapper — dead classes; and that wrapper takes a v3-style config that ignores the site's v4 `@theme` (verify against current docs first) — style props + theme.ts are the reliable path.
- `import '@/app/globals.css'` or `next/font` inside `emails/` — site CSS never reaches an inbox.
- `NEXT_PUBLIC_RESEND` — the key is server-only; a public prefix ships it in the client bundle.
- `new Resend(` at module scope of anything a page imports — build fails on machines without the key; lazy-init in the helper.
- `from: 'onboarding@resend.dev'` reaching production — dev-only sender; swap to the verified domain before ship.
- ✨/🚀 in subject lines — taste bans emoji in production copy, and subject lines are production copy.

## Worked example — Kaffeewerk Ost, order confirmation after Stripe checkout

design/BRIEF.md: "Resend order confirmations after every purchase — sensory and direct, no marketing fluff." One transactional flow; the send drains the order-keyed outbox row the Stripe webhook writes per ultraweb:payments — never inline in the handler, so a webhook retry can't resend.

`emails/theme.ts` translates SYSTEM.md's warm-neutral tokens to hex by hand — oklch never reaches an inbox:

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

## Composes with

- **ultraweb:server-actions** — the contact action owns validation and error-as-state; this skill owns the send inside it.
- **ultraweb:forms** — designs the contact form whose submit lands here; its success state reports what the email did.
- **ultraweb:auth** — Better Auth's magic-link/verification flows call a send function; the template and Resend call live here, the token logic stays there.
- **ultraweb:copywriting** — subject lines, preview text, and body copy are site voice, not boilerplate.
- **ultraweb:tokens** — theme.ts is a hand-maintained mirror of the `@theme` tokens; when tokens change, re-translate.
- **ultraweb:ship** — env audit covers RESEND_API_KEY and the verified production sender domain.
- **ultraweb:brief** — reading design/BRIEF.md is process step 1; it decides which flows (contact, auth, receipt) send mail at all, or whether this skill is skipped.
- **ultraweb:payments** — its raw-body Stripe webhook writes the order-keyed outbox row this skill drains to send the receipt/order-confirmation (idempotent per event/order ID, never inline in the handler); the template and Resend call live here, the payment event stays there.
