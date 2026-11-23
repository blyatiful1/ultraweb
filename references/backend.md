# backend

The traps in the server side of a design-led site: contact form and email, accounts, a database, payments, content pipelines. This file does not teach the vendors' APIs.

Load when: the brief needs a form that sends mail, accounts, stored data, a checkout, or markdown content. Skip it for a brochure site with a mailto link.

Reads: design/BRIEF.md, design/SYSTEM.md. Writes: `app/actions/*`, `lib/email.ts`, `emails/*`, `lib/auth.ts`, `db/*`, `lib/stripe.ts`, `app/api/webhooks/*`, content config.

## Defer first

If the session has a vendor MCP server or skill for the service (Stripe, Supabase, Neon, Vercel, Resend), use it and the vendor's current docs for setup, schema work and API shapes; do not write an API from memory when a docs tool is present. Everything below is what tools do not warn you about. Versions come from `stack/versions.json`; pin companion packages (ORM and its CLI, auth library and its CLI) to the same line. Nothing here runs unless the brief names the need: no accounts or database on a brochure site, no CMS on a five-page site.

## Contact form (server action plus email)

Form wiring and state shape: `references/next.md`. On top of that:

- Order: zod validation, honeypot, rate limit, send. Cheap checks first.
- Honeypot: one extra text input (a plausible name like `website`), hidden with CSS off-screen (not `display:none`, some bots skip those), `tabIndex={-1}`, `autoComplete="off"`, `aria-hidden` on its wrapper. If it arrives filled, return `{ ok: true }` without sending, so the bot learns nothing.
- Rate limit by client IP. In-process counters fail on serverless. Use one of: a platform firewall rate-limit rule on the action's path, a Redis-backed limiter (for example `@upstash/ratelimit` with `Redis.fromEnv()`, sliding window, 5 per 10 minutes), or a small database table. Read the IP from `(await headers()).get('x-forwarded-for')?.split(',')[0]`. Construct it lazily. A limit hit returns a form-level error in the site's voice, not a throw.
- Add a vendor bot challenge only if abuse appears; in DACH it is a third-party request (`references/legal-dach.md`).
- Never put user text in `from` or `to`; strip CR and LF from `subject`; the visitor's address goes in `replyTo`.

```ts
// app/actions/contact.ts
'use server'
import { headers } from 'next/headers'
import { z } from 'zod'
import { getResend } from '@/lib/email'
import ContactNotification from '@/emails/contact-notification'

const schema = z.object({
  name: z.string().min(1, { error: 'Tell us your name' }).max(120),
  email: z.email({ error: 'Enter a valid email address' }),
  message: z.string().min(10, { error: 'Tell us a little more' }).max(5000),
  website: z.string().max(0).optional(),     // honeypot
})
type State = { ok: boolean; errors?: Record<string, string[]> }

export async function sendContact(_prev: State, formData: FormData): Promise<State> {
  const raw = Object.fromEntries(formData)
  if (typeof raw.website === 'string' && raw.website !== '') return { ok: true }
  const parsed = schema.safeParse(raw)
  if (!parsed.success) return { ok: false, errors: z.flattenError(parsed.error).fieldErrors }

  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (!(await allow(`contact:${ip}`))) {
    return { ok: false, errors: { form: ['Too many messages just now. Please try again in a few minutes.'] } }
  }
  const { name, email, message } = parsed.data
  const { error } = await getResend().emails.send({
    from: 'Site <contact@mail.example.com>',
    to: 'team@example.com',
    replyTo: email,
    subject: `${name.replace(/[\r\n]+/g, ' ')}: new inquiry`,
    react: ContactNotification({ name, email, message }),
  })
  if (error) return { ok: false, errors: { form: ['Message not sent. Try again or email us directly.'] } }
  return { ok: true }
}
```

`allow()` wraps your limiter and returns a boolean. Resend returns `{ data, error }` and does not throw on API errors, so a `try/catch` with no `error` check loses mail silently. Check `error` on every send.

Email rules:

- Pass the React Email component in the `react` property, not a hand-built HTML string. Preview templates in the React Email dev server (not the app's port).
- Create the Resend client lazily in a helper (module-scope construction breaks `next build` without the key); `RESEND_API_KEY` is server-only.
- Dev sends reach only the account owner until a domain is verified. Production needs a verified sending domain (a subdomain isolates reputation); `onboarding@resend.dev` never ships.
- Email CSS is old: inline style props, table-based `@react-email/components`, one column of 600 px or less, resolved hex colors from the token output (no `oklch()`, no CSS variables), PNG logos with explicit width and height, no SVG, background images, flex or grid. Web fonts need a system fallback; Gmail and Outlook drop them. Avoid pure white and black so forced dark mode does not produce mud.
- Newsletter signup is double opt-in: submit writes a pending record with a signed, single-use token that expires (about 48 hours) and sends a confirmation mail; the address becomes a subscriber only on the click. Success copy says "Check your inbox", never "Subscribed". German context: `references/legal-dach.md`.

## Auth (Better Auth)

Use Better Auth for new builds; Auth.js is in maintenance mode and its v5 stayed in beta. Leave existing Auth.js projects alone. Never hand-roll hashing or session tokens.

- Install the pinned line from `stack/versions.json`. Run the schema CLI at the same version as the installed library and merge the generated tables (user, session, account, verification) into the Drizzle schema, one schema, one migration history.
- `nextCookies()` goes last in the plugins so server actions can set cookies.
- Require email verification before sign-in, and do not await the mail send inside the callback (awaiting it creates a timing difference that reveals whether an account exists):

```ts
export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg' }),
  emailAndPassword: { enabled: true, requireEmailVerification: true },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      void sendVerificationMail(user.email, url)       // do not await
    },
  },
  rateLimit: { storage: 'database' },                   // default storage is memory: useless on serverless
  plugins: [nextCookies()],
})
```

- Rate limiting defaults to production only with per-instance memory storage. On serverless use `database` or a secondary store, plus stricter custom rules for sign-in and password reset.
- Handler: `app/api/auth/[...all]/route.ts` with `toNextJsHandler(auth)`.
- Protect in three layers, all three. 1: `proxy.ts` checks cookie presence (`getSessionCookie` from `better-auth/cookies`) and redirects; UX only, no database call. 2: the page or layout rendering private data calls `auth.api.getSession({ headers: await headers() })`. 3: every server action and route handler re-checks the session, because a forged request never meets the proxy or the page.
- A client `useSession()` value is display data, never evidence for a security decision.
- Sign-in and sign-up pages are designed like any page: tokens, both themes, focus states, error copy in the site's voice ("That email and password do not match").
- Verify the loop: sign up, verify, sign out, hit a protected page (redirects), sign in (lands back).

## Database (Drizzle on Postgres)

Use the provider's MCP or CLI for projects and branches. The schema comes from the brief's nouns; zero persistent nouns means no database.

- Install `drizzle-orm` and `drizzle-kit` from the same release line. The stable line and the release-candidate line differ; choose one, record it in design/BRIEF.md, and never mix.
- Money is integer cents. `text` over `varchar(n)` (limits live in zod). Timestamps everywhere. Unique `slug` on URL-routed rows. `pgEnum` for closed sets. Index every filtered or joined column.
- Serverless HTTP driver (`drizzle-orm/neon-http` with `drizzle({ client: neon(url), schema })`) runs single statements. Interactive multi-statement transactions need the websocket driver (`drizzle-orm/neon-serverless`).
- `drizzle-kit push` only while data is disposable; before the first deploy switch to `generate` plus `migrate` and commit the migration folder.
- Seed in the brief's voice (real-sounding names, varied title lengths, 8 to 12 rows per table); screenshots photograph it.

**The `.env` trap.** drizzle-kit loads `.env` from the project root and nothing else: not `.env.local`, not NODE_ENV variants. Next.js reads `.env.local` for the app. A project that keeps `DATABASE_URL` only in `.env.local` runs fine under `next dev` while every drizzle-kit command fails with an undefined URL. Pick one: keep `DATABASE_URL` in a gitignored `.env`, or load Next's own loader at the top of `drizzle.config.ts` (`import { loadEnvConfig } from '@next/env'; loadEnvConfig(process.cwd())`, with `@next/env` installed as a declared dev dependency). Never keep the same key in both files; the tools silently disagree. `dialect: 'postgresql'` is mandatory in `defineConfig`; `generate:pg` command names are gone.

Queries run directly in Server Components; caching is in `references/next.md`.

## Payments (Stripe)

Use the Stripe MCP or skill for product and price setup in test mode. Rules that cost money when missed:

- Stripe-hosted Checkout by default.
- Create the client lazily; set no `apiVersion` (the SDK pins its own).
- The client picks a plan, never a price. Allowlist price ids in one file shared by the pricing section and the checkout action, validate with `z.enum`.
- The checkout action calls `redirect(session.url)` outside any try/catch. `{CHECKOUT_SESSION_ID}` in `success_url` is a literal Stripe fills in.
- Payment methods: prefer enabling methods in the Dashboard and omitting `payment_method_types` so eligibility (currency, country) is decided by Stripe. Pinning is allowed when the brief requires it. Some methods are delayed (SEPA Direct Debit, bank transfers): they are the reason for the async events below.

Webhook, with the raw body and the payment-status check:

```ts
// app/api/webhooks/stripe/route.ts
import type Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'

export async function POST(req: Request) {
  const body = await req.text()                       // RAW text; req.json() breaks the signature
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
      const s = event.data.object
      if (s.payment_status === 'paid') await fulfill(event.id, s.id)
      // 'unpaid' = delayed method, money not here yet: wait for the async events.
      // 'no_payment_required' (100% coupon): fulfil only if the product may be free.
      break
    }
    case 'checkout.session.async_payment_succeeded':
      await fulfill(event.id, event.data.object.id)
      break
    case 'checkout.session.async_payment_failed':
      await markFailed(event.id, event.data.object.id)   // tell the buyer, release reserved stock
      break
  }
  return new Response(null, { status: 200 })
}
```

- Subscribe the endpoint (Dashboard or CLI forwarding) to `checkout.session.completed`, `checkout.session.async_payment_succeeded` and `checkout.session.async_payment_failed`, or the delayed-method buyer is never fulfilled.
- Fulfilment is idempotent. Store the processed event id (unique constraint) and no-op on repeats; Stripe redelivers on any non-2xx or timeout. For one-off stock, two different sessions can race for the same item, so reserve inventory in one transaction.
- Fulfilment truth lives in the webhook, never on the success page. That page retrieves the session and confirms only when `payment_status === 'paid'`; `unpaid` shows "payment is processing"; a missing session redirects home.
- Keep the handler fast: write the row, send mail afterwards. A slow handler times out and triggers retries.
- Test mode until ship: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`, put the printed `whsec_` in `STRIPE_WEBHOOK_SECRET`, then `stripe trigger checkout.session.completed` and confirm both a 200 and the fulfilment row. Fire the same event twice to prove idempotency. The CLI secret differs from the production endpoint secret.
- Live keys exist only in the deploy platform's environment; `sk_live_` in the repo or `NEXT_PUBLIC_` on a secret is a defect.
- Success and cancel are designed surfaces; cancel returns to pricing with one calm line ("Nothing was charged").
- Price display rules and withdrawal-notice placement: `references/commerce.md` and `references/legal-dach.md`.

## Content and MDX

| Situation | Pipeline |
|---|---|
| 8 or fewer standalone long-form pages | plain `@next/mdx`; `.mdx` files are routes |
| Blog, changelog, docs, case studies with listings and tags | `@content-collections/core` plus `@content-collections/next` (the bare npm name `content-collections` is an installer CLI), or velite |
| Non-developer editors, weekly cadence, preview or scheduling, or hundreds of related documents | a headless CMS as a data source, cached per `references/next.md` |

Contentlayer is dead; never install it.

Plain `@next/mdx` has two mandatory wires, and both fail silently: `pageExtensions: ['md', 'mdx', 'ts', 'tsx']` in `next.config.ts` (otherwise `.mdx` pages return 404 with no error) and a root `mdx-components.tsx` beside `app/`, exporting `useMDXComponents`. Pin `@next/mdx` to the exact `next` version. It parses no YAML frontmatter; a `---` block renders as text. In a `page.mdx` route, `export const metadata = { ... }` instead.

Collections validate frontmatter with a zod schema at build, so a typo is a build error. Break a field once to prove the build fails. Compute slug, reading time and sort order at build, never at request time.

**Draft leak.** Filtering drafts in `generateStaticParams` is not enough: `dynamicParams` defaults to `true`, so a draft still renders on demand at its direct URL. Also call `notFound()` in the page and in `generateMetadata` when `post.draft`, or export `dynamicParams = false`. Filter drafts out of listings and `sitemap.ts` as well.

Prose styling: map h1 to h6, p, a, blockquote and code in `mdx-components.tsx` to token-styled elements; no default gray prose classes. Measure 65 to 75 characters, leading 1.65 to 1.75, more space above an h2 than below, code and quote surfaces with their own dark values rather than inversion.

**Code blocks.** Highlight with Shiki at build time inside a Server Component (or `@shikijs/rehype` in the MDX pipeline). Client highlighters (`prismjs`, `highlight.js`, `react-syntax-highlighter`) ship a parser to redo finished work. Load explicit languages, not the full barrel. Only the copy button is a `"use client"` leaf.

Token-to-palette mapping: a stock editor theme with its colors left alone is the tell. Use Shiki's CSS-variables theme and define the variables from the site's tokens, once per theme mode:

```ts
// lib/highlight.ts (server only)
import { createHighlighter } from 'shiki'
import { createCssVariablesTheme } from 'shiki/core'

const theme = createCssVariablesTheme({ name: 'site', variablePrefix: '--shiki-', fontStyle: true })
const highlighter = createHighlighter({ themes: [theme], langs: ['ts', 'tsx', 'css', 'bash'] })

export async function highlight(code: string, lang: string) {
  return (await highlighter).codeToHtml(code, { lang, theme: 'site' })
}
```

```css
:root {   /* map each to a palette token; the full set: foreground, background, and token-
  constant, string, comment, keyword, parameter, function, string-expression, punctuation, link */
  --shiki-foreground: var(--color-fg);  --shiki-background: var(--color-code-surface);
  --shiki-token-keyword: var(--color-accent);
}
.dark { /* re-decide each value for dark; do not invert */ }
```

This theme is coarse. For finer control build a theme object from the palette (TextMate `tokenColors` with resolved colors) and pass it as the theme.
