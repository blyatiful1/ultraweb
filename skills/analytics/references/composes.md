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
