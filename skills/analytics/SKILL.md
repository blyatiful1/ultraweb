---
name: analytics
description: Conversion measurement closing the pipeline's open loop — brief defines the goals, sitemap assigns one per route, this skill counts them: cookieless-first tool choice (EU-hosted Plausible or self-hosted Umami on the locked Postgres, per STACK.md), the §25 TTDSG/TDDDG reasoning that makes a consent banner unnecessary, an event taxonomy transcribed from design/SITEMAP.md's conversion-goal column, a typed track() helper that won't compile an unlisted event, CTA instrumentation named after the goal not the widget, and the rule that anything cookie-based loads behind ultraweb:consent while GA4-by-default stays banned. Invoke in Phase 7 whenever the brief names a conversion worth counting — trigger phrases — "add analytics", "track conversions", "measure the funnel", "set up Plausible", "do we need a cookie banner for analytics".
---

# analytics — count the goals you promised

**Stage:** Phase 7 — Backend - **Reads:** design/BRIEF.md (conversion goals), design/SITEMAP.md (the one goal assigned to every route) - **Writes:** lib/analytics.ts, the script mount in app/layout.tsx, `track()` calls in CTA leaves, the analytics paragraph of /datenschutz

## Standard

This closes the only loop the pipeline leaves open: `brief` decides what a conversion is, `sitemap` assigns exactly one goal to every route, `gate-content` checks each page's headings argue for that goal — and nothing until now counted whether the goal was ever reached. Measurement is therefore not a marketing bolt-on; it is the last artifact in that chain, and its event list is a transcription of SITEMAP.md, never a wishlist. The empirical test: a week after launch, answer per route — "did this page's one goal happen, and how often?" If the answer needs a spreadsheet, a session recording, or a data scientist, the taxonomy is wrong, not the client.

- **Cookieless by default.** EU-hosted Plausible/Fathom or self-hosted Umami, per STACK.md's analytics & compliance defaults. GA4-by-default is banned there and here.
- **Fewer events than pages.** A taxonomy longer than SITEMAP.md's goal column is autocapture typed out by hand.
- **The event is named after the goal, not the widget.** `abo-subscribe`, never `hero-cta-click`. Move the button, keep the number comparable.
- **Anything that touches the device goes behind ultraweb:consent.** One cookie and §25 engages — deny-by-default, no exceptions for "just analytics", and `taste`'s craft budget is not spent on a banner nobody needs.
- **No PII, no free text, no session replay.** Props come from closed sets. A page-level record must never become a personal one.
- **Money-backed goals are counted where they are confirmed.** A click is intent; a webhook is a purchase. Counting intent as revenue is a lie the dashboard will repeat for years.
- **The tag is one deferred first-party script**, never a tag manager — `gate-performance` weighs it with everything else.

## Process

1. Open `design/SITEMAP.md` and copy the **Conversion goal** column. That list, verbatim, is the event list. A route whose goal is "read next" gets no custom event — pageviews already answer it.
2. Pick the tool from the table below. Add its env vars to `.env.example` (the stats/events API key is server-only) and write the `/datenschutz` paragraph naming the tool, the data, the legal basis (GDPR Art. 6(1)(f)), and the retention — that notice is the compliance artifact; the banner is not.
3. Mount the script in `app/layout.tsx` behind a same-origin `next.config` rewrite — both halves or it is not first-party: the script URL *and* the endpoint the tag posts events to (its `data-api` attribute, pointed at the rewritten `/stats/event`). Verify the current recipe against the vendor's proxy docs; done properly it is one fewer third-party origin for anyone to argue about.
4. Write `lib/analytics.ts`: the event dictionary plus the typed helper. Nothing else in the codebase names an event as a string literal.
5. Instrument each goal's CTA in its `"use client"` leaf beside the state change; route server-confirmed goals (payment, subscription, account) through the events API from the webhook or action instead.
6. Verify empirically: `npm run build && npm run start`, click each goal exactly once, confirm exactly one event per click in the realtime view and — Network tab — that the events request goes to your own origin, not the vendor's. Then open DevTools → Application and confirm Cookies and Local Storage are **empty**. Any storage and §25 engages: consent is now required and `ultraweb:consent` owns the tag.
7. Hand the dictionary to `ultraweb:handoff` as the event reference; a maintainer who can't read the goal off the event name will invent a second taxonomy within a month.

## Tool choice — cookieless first

| Situation | Tool | Why it wins |
|---|---|---|
| Default: hosted, zero ops, EU data residency | **Plausible** (Fathom equivalent) per STACK.md | no device storage, custom goals + props, one script |
| The build already runs the locked Postgres (`ultraweb:database`) and the client wants ownership or no per-site fee | **self-hosted Umami** on that instance | same instance, same backups; stores no raw IP (verify the current hashing/retention behaviour against the tool's docs before repeating it in /datenschutz) |
| Client contractually requires GA4 or an ad pixel | GA4 **behind ultraweb:consent**, denied by default | cookie-based → §25 consent applies; never the default, never the only source |
| "We might want analytics later" | nothing, today | `lib/analytics.ts` is a 30-minute retrofit; a speculative tag taxes every page now |

## Why there is no banner — §25 in one paragraph

§25 TDDDG (the 2024 rename of TTDSG §25, itself ePrivacy Art. 5(3)) governs one narrow act: storing information on, or reading information already stored on, the visitor's terminal equipment. A tool that sets no cookie, writes no `localStorage`, and derives no device fingerprint never performs that act — so consent is not *exempted*, the requirement never engages, and there is nothing a banner could honestly ask. What remains is ordinary GDPR processing of page-level data, lawful under Art. 6(1)(f) legitimate interest and disclosed in `/datenschutz`. Two traps: a "cookieless" claim you have not personally verified in the Application tab (fingerprinting *is* access to stored information, and some privacy-branded tools do it), and GA4 with anonymized IP — neither cookieless nor free of the US-transfer rulings (per STACK.md). This is the rare case where the strict reading pays: choosing the cookieless tool deletes the ugliest element on most German sites outright, and `taste`'s craft budget is better spent almost anywhere else.

## The taxonomy is a transcription of SITEMAP.md

| SITEMAP goal | Event | Props | Fired where |
|---|---|---|---|
| buy | `add-to-cart` | `slug` | client leaf, beside the cart mutation |
| buy (confirmed) | `order-complete` | — | server, Stripe webhook |
| subscribe | `abo-subscribe` | `plan` | server, subscription webhook |
| contact | `kontakt-send` | — | success state of the server action, not submit |
| sign up | `signup-complete` | — | server, after the account row commits |
| book | `termin-buchen` | `service` | success state of the booking action, not submit |
| read next | *(none)* | — | pageviews already answer it |

- A money goal may carry **exactly two** events and no third: the intent and its server-confirmed twin (`add-to-cart` → `order-complete`). Funnel steps are not goals — a `checkout-start` between them counts the widget, not the promise SITEMAP.md made.
- kebab-case verb-object, ≤2 props, every prop value from a **closed set** (slug, plan, tier, placement). An unbounded prop — free text, a search query, a user id — makes the dashboard unreadable and turns a page-level record into a personal one.
- Two CTAs pointing at the same goal fire the **same** event. If placement genuinely matters, add one enumerable prop (`{ placement: "hero" | "sticky" }`) — never a second event name.
- Never hand-track route changes, nav clicks, scroll depth, or hovers. On a local-business build the `tel:`/`mailto:` click often *is* the goal — instrument that instead of inventing engagement metrics.

## Instrumentation — one typed helper

```ts
// lib/analytics.ts — the dictionary IS the taxonomy; an event not listed here does not compile
export const EVENTS = {
  "add-to-cart":    ["slug"],   // /shop, /shop/[slug] — SITEMAP goal: buy
  "order-complete": [],         // Stripe webhook — goal: buy (confirmed); server-fired, listed here as documentation only
  "abo-subscribe":  ["plan"],   // /abo — goal: subscribe (server-fired, below)
  "kontakt-send":   [],         // /kontakt — goal: contact
} as const;

type Props<E extends keyof typeof EVENTS> = Record<(typeof EVENTS)[E][number], string>;
type Args<E extends keyof typeof EVENTS> = keyof Props<E> extends never ? [] : [Props<E>];  // declared props are mandatory; an event with none takes one argument

declare global {
  interface Window { plausible?: (name: string, o?: { props: Record<string, string> }) => void }
}

export function track<E extends keyof typeof EVENTS>(name: E, ...rest: Args<E>) {
  window.plausible?.(name, { props: (rest[0] ?? {}) as Record<string, string> });  // optional call: blocked or offline is a silent no-op, never a throw inside a click handler
}
```

```tsx
// components/shop/add-to-cart.tsx — "use client" leaf per ultraweb:app-structure; the event fires beside the mutation, never in render
"use client";
import { track } from "@/lib/analytics";
import { useCart } from "@/lib/cart";               // ultraweb:cart owns the mutation; this skill only counts it

export function AddToCart({ slug }: { slug: string }) {
  const { add } = useCart();
  return (
    <Button onClick={() => { add(slug); track("add-to-cart", { slug }); }}>In den Warenkorb</Button>
  );
}
```

The handler lives on the `<Button>`, so Enter and Space count exactly like a mouse click — a `<div onClick>` breaks the keyboard path *and* the number. Money-backed goals never fire here:

```ts
// app/api/stripe/webhook/route.ts — the conversion is counted where it is CONFIRMED (per ultraweb:payments)
await fetch("https://plausible.io/api/event", {          // verify the payload shape against current docs first
  method: "POST",
  headers: { "content-type": "application/json", "user-agent": "kaffeewerk-server" },
  body: JSON.stringify({
    domain: "kaffeewerk-ost.de", name: "abo-subscribe",
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/abo`, props: { plan: sub.items.data[0].price.lookup_key },
  }),
});
```

A server-fired event carries no visitor, so it counts the conversion honestly but joins no session — that is the trade for never counting an intent as a sale. Form goals fire from the action's success state per `ultraweb:server-actions`; a validation failure is not a conversion.

## Anti-patterns

Greppable — each should return zero:

- `rg -n "googletagmanager\.com|gtag\(" -g "*.ts*"` outside `components/consent` — GA4 by default; if the client insists, it loads denied-by-default behind the banner
- `rg -ni "autocapture|capture_pageview|trackAllClicks|rrweb|sessionRecording"` — collect-everything and session replay; replay records form fields, which is a data-protection incident wearing a product name
- `rg -l "\btrack\(" -g "!**/node_modules/**" | xargs rg --files-without-match '"use client"'` — any file calling `track()` outside a client leaf, i.e. in an RSC render body: `window` is undefined there, and a render is not an intent (a prefetch would count as a conversion)
- `rg -n "plausible\(|umami\.track\(" -g "*.tsx"` — a raw vendor call bypassing the dictionary; every event goes through `track()`
- `rg -n 'track\("(click|button|cta|hero|banner|section)'` — widget-named events; the name is the goal
- `rg -ni "document\.cookie|localStorage" lib/analytics.ts` — the moment the tag writes to the device, §25 engages and the banner comes back
- `rg -n "NEXT_PUBLIC_.*(PLAUSIBLE|UMAMI).*(KEY|TOKEN)"` — the events/stats API key is server-only; a public prefix ships it to every visitor
- `rg -n "track\(.*\b(email|name|query|userId)\b"` — PII or free text as a prop

And the constitutional one: an event you couldn't defend to the visitor in one sentence of the Datenschutzerklärung does not ship. Measurement earns its place by answering the brief's question — anything past that is surveillance with a dashboard.

## Worked example — Kaffeewerk Ost, the shop → Abo funnel

design/SITEMAP.md, Conversion goal column, verbatim: `/` → *"Buy"* (the exit to `/shop` lives in the Purpose column, per `ultraweb:sitemap` step 4), `/shop` → *"Buy"*, `/shop/[slug]` → *"Buy"*, `/abo` → *"Subscribe"*, `/roesterei` → *"Read next"*, `/kontakt` → *"Contact"*.

Decision: **Plausible, EU-hosted**, proxied first-party through a `/stats/*` rewrite — script URL and `data-api` endpoint together. Six routes, four goals, **four events** — `add-to-cart` `{slug}`, `order-complete`, `abo-subscribe` `{plan}`, `kontakt-send`. `/roesterei` gets none. The two `add-to-cart` surfaces — the rust `oklch(0.62 0.16 45)` "In den Warenkorb" button on the `/shop` grid card and the same button on `/shop/[slug]` — fire the *same* event with `{ slug: "roestung-14" }`, so the roast comparison survives a layout change; `{ placement: "grid" | "detail" }` is the one prop added when the client asks which surface converts. `order-complete` and `abo-subscribe` `{ plan: "250g-monatlich" }` fire from the Stripe webhook, so a card decline can never register as a sale. Verification: Application tab empty on a fresh load, the events POST landing on `kaffeewerk-ost.de/stats/event` and not on the vendor's origin, one event per click in realtime.

Rejected: GA4 plus a cookie banner, the agency's default — it sets cookies, so it drags back the banner `ultraweb:consent` just deleted for this exact client, and its US transfers were ruled unlawful (per STACK.md). Honestly conceded: **self-hosted Umami** was the closer call — the Drizzle Postgres is already locked and it costs no per-site fee — and it loses here only because Kaffeewerk has no one to own an upgrade; on any build that already runs a VPS, Umami is the better call.

Handoff: `ultraweb:consent` keeps its single `embeds` category — this skill added nothing to the banner; `ultraweb:gate-performance` counts the deferred script in the page budget; `ultraweb:gate-content` already checks each page's headings argue for the same goal this now counts; the dictionary ships in the `ultraweb:handoff` README.

## Composes with

- **ultraweb:consent** — the boundary: cookieless tools live outside it, anything writing to the device (GA4, ad pixels, replay) is a category in its context and loads only when granted. Choosing the tool here is how consent's banner stays deleted.
- **ultraweb:sitemap** — the conversion-goal column is transcribed into the event list; one goal per route, one event per goal, no invention.
- **ultraweb:brief** — upstream: it decides what counts as a conversion at all, and whether this skill runs.
- **ultraweb:buttons** — the CTA carrying each goal is where instrumentation lands; the handler goes on the button so keyboard activation counts too.
- **ultraweb:app-structure** — `track()` callers are `"use client"` leaves, never a layout, never an RSC render body.
- **ultraweb:server-actions** — form goals fire from the action's success state, never on submit; validation failures are not conversions.
- **ultraweb:payments** — the Stripe webhook is where `order-complete` / `abo-subscribe` are counted, beside the outbox row it already writes.
- **ultraweb:database** — hosts self-hosted Umami on the already-locked Postgres when that row of the tool table wins.
- **ultraweb:copywriting** — writes the /datenschutz analytics paragraph in the site's voice from the facts this skill supplies (tool, data, legal basis, retention).
- **ultraweb:gate-content** — checks the heading story argues for the route's goal; this skill checks the goal actually happened. Same column, two ends.
- **ultraweb:gate-performance** — the tag counts against the page transfer budget like any other script; a tag manager fails it.
- **ultraweb:ship** — env audit covers the server-only stats key, and the launch check confirms the first-party proxy answers in production.
- **ultraweb:handoff** — the event dictionary is a handoff artifact: what is measured, why, and which SITEMAP goal each event maps to.
