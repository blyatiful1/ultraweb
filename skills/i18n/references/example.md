## Worked example — Casa Verde, EN/PT restaurant menu + reservations

design/BRIEF.md: "Lisbon locals and visiting tourists — Portuguese first, English for visitors." Two markets, marketing-scale menu copy → the segment pattern below, zero libraries.

`lib/i18n.ts`: `locales = ["pt", "en"] as const`, `defaultLocale = "pt"` — the restaurant is physically in Lisbon, so Portuguese is the crawlable default and the `x-default` target. Dictionaries carry the voice, not just labels:

```ts
// dictionaries/pt.ts — a missing or extra key fails tsc against en
import type en from "./en";
export default {
  nav: { menu: "Ementa", story: "A Casa", reserve: "Reservar" },
  harvest: { label: "Colheita de hoje" },
} satisfies typeof en;
```

The reservation confirmation date runs through `new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(booking.date)` — "21 de julho de 2026" for `pt`, "July 21, 2026" for `en` — before the zod-validated server action hands the booking to Resend.

Rejected: IP-geolocation auto-redirect. A Berlin tourist's phone geolocates to Portugal, but region is not a language decision — their `accept-language` says `de`, which the site doesn't ship, so the unmatched language falls to the `pt` default and they reach English through the visible switcher. Accept-Language in `proxy.ts` plus that switcher wins, never the phone's location.

Handoff: the `dictionaries/pt.ts` + `dictionaries/en.ts` pair is written natively per market by `ultraweb:copywriting`; `ultraweb:gate-responsive` then screenshots the Portuguese locale (the longer of the two here) at 375px so "Colheita de hoje" and the harvest strip don't overflow.
