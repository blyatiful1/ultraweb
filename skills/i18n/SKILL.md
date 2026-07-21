---
name: i18n
description: Internationalization for the Next.js 16 App Router without an i18n framework — [locale] segment routing, server-only dictionary pattern, Accept-Language negotiation in proxy.ts, hreflang via metadata alternates, Intl date/number formatting, RTL awareness — plus the discipline to skip all of it when the brief targets a single market. Invoke when design/BRIEF.md names two or more languages or markets, or when the user mentions translations, multilingual, locales, hreflang, language switcher, RTL, or "add a German/French/Spanish version".
---

# i18n — locales without a framework

**Stage:** Phase 10 — Findability (only when BRIEF.md names 2+ markets) - **Reads:** design/BRIEF.md (markets, languages), design/SITEMAP.md - **Writes:** app/[locale]/ tree, dictionaries/, lib/i18n.ts, proxy.ts negotiation, hreflang alternates

## When NOT to i18n — decide this first

- `design/BRIEF.md` names ONE market → skip this skill entirely. A German-only site is German copy (`ultraweb:copywriting`), not i18n infrastructure.
- "Might add English later" → still skip. A `[locale]` segment retrofits in under an hour; speculative scaffolding taxes every route today. Note the option in the handoff README, build nothing.
- 2–4 locales of marketing content → the pattern below, zero libraries. An i18n framework (ICU plurals, extraction tooling) is app-scale machinery; if the brief genuinely needs it, verify against current docs first and pick deliberately.

## Standard

Locale lives in the URL (`/de/arbeiten`), never only in a cookie. Every shipped locale is 100% written — a half-translated locale is worse than none. Dictionaries never reach the client bundle. hreflang is complete, including `x-default`. All dates and numbers go through `Intl` with an explicit locale. The longest locale (German runs ~30% longer than English) is the one verified at 375px.

## Process

1. **Locale registry** — one shared module, no framework:

```ts
// lib/i18n.ts
export const locales = ["en", "de"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";
```

2. **Segment**: move all pages under `app/[locale]/`; its layout is the root layout and owns `<html>`. Params are Promises in Next 16:

```tsx
// app/[locale]/layout.tsx
import { locales, type Locale } from "@/lib/i18n";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function RootLayout({ children, params }: {
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return <html lang={locale}>{/* body */}</html>;
}
```

3. **Dictionaries** — server-only, lazy, typed against the default locale:

```ts
// dictionaries/index.ts
import "server-only";
import type { Locale } from "@/lib/i18n";

const dictionaries = {
  en: () => import("./en").then((m) => m.default),
  de: () => import("./de").then((m) => m.default),
};

export const getDictionary = (locale: Locale) => dictionaries[locale]();
```

Write dictionaries as `.ts` modules, not JSON — parity becomes a type error:

```ts
// dictionaries/de.ts — a missing or extra key fails tsc
import type en from "./en";
export default { nav: { work: "Arbeiten", about: "Über uns" } } satisfies typeof en;
```

4. **Pages consume**: `const { locale } = await params; const t = await getDictionary(locale);` — pass `t.nav`, `t.hero` down as props. Leaf client components receive strings as props and never import dictionaries; `server-only` throws at build time if they try.
5. **Negotiation in proxy.ts** — `middleware.ts` is deprecated in Next 16:

```ts
// proxy.ts
import { NextResponse, type NextRequest } from "next/server";
import { locales, defaultLocale } from "@/lib/i18n";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.includes(".")) return;
  if (locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))) return;
  const preferred = (request.headers.get("accept-language") ?? "").split(",")[0]?.trim().split("-")[0];
  const locale = locales.find((l) => l === preferred) ?? defaultLocale;
  return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
}
```

Redirect, never rewrite — the locale must be visible, shareable, and crawlable.

6. **hreflang** via metadata alternates (requires the `metadataBase` that `ultraweb:seo` sets). Every locale variant lists ALL variants including itself, plus `x-default` pointing at the default locale:

```ts
alternates: {
  canonical: `/${locale}/work`,
  languages: { en: "/en/work", de: "/de/work", "x-default": "/en/work" },
},
```

7. **Switcher**: header links to the SAME route with the segment swapped — `ultraweb:navigation` places it as a designed element. Never a dropdown that reloads to the homepage.
8. **Formatting** — `Intl` is the library; pass the locale explicitly, always:

```ts
new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(date);
new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" }).format(price);
```

Bare `toLocaleDateString()` uses the runtime's locale; server and client disagree and you get a hydration mismatch.

## RTL awareness

Only when an RTL locale (ar, he, fa, ur) is actually in the brief: set `dir` on `<html>` per locale, and write ALL spacing and alignment with logical utilities from day one — `ps-*`/`pe-*`, `ms-*`/`me-*`, `text-start`/`text-end` — never `pl`/`pr`/`ml`/`mr`/`text-left`/`text-right`. shadcn `init --rtl` covers the primitives. Retrofitting physical properties to logical is a full-codebase sweep; deciding up front is free.

## Copy discipline

Each locale is WRITTEN by `ultraweb:copywriting` in that market's voice — never machine-transliterated English. Idioms, formality register (du/Sie), and CTA verbs are per-market decisions. `gate-responsive` screenshots run on the longest locale, not on English.

## Anti-patterns

- `middleware.ts` for locale detection — deprecated in Next 16; negotiation lives in `proxy.ts`
- locale only in a cookie — unshareable URLs, uncrawlable variants
- IP-geolocation auto-redirect — a VPN user in Vienna is not a language decision; Accept-Language plus a visible switcher
- dictionary import inside a `"use client"` file — ships every string to the client (`server-only` correctly explodes)
- `t("key.name")` string-lookup helpers — object access `t.nav.work` is typo-proof and typed for free
- hardcoded UI strings left outside the dictionary — grep components for quoted prose after wiring
- `toLocaleDateString(` / `toLocaleString(` with no locale argument — hydration mismatch
- shipping a locale with untranslated fallback strings mixed in — cut the locale instead
- installing an i18n framework for a 2-locale brochure site

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

Rejected: IP-geolocation auto-redirect. A Berlin tourist's phone geolocates to Portugal but their `accept-language` says `de` → serve English; region is not a language decision. Accept-Language in `proxy.ts` plus the visible switcher wins.

Handoff: the `dictionaries/pt.ts` + `dictionaries/en.ts` pair is written natively per market by `ultraweb:copywriting`; `ultraweb:gate-responsive` then screenshots the Portuguese locale (the longer of the two here) at 375px so "Colheita de hoje" and the harvest strip don't overflow.

## Composes with

- **ultraweb:copywriting** — writes every dictionary natively per locale.
- **ultraweb:seo** — owns `metadataBase`; this skill adds hreflang alternates and per-locale metadata.
- **ultraweb:routing** — the `[locale]` segment reshapes the whole route tree; coordinate loading/error files per segment.
- **ultraweb:navigation** — houses the locale switcher as a designed moment.
- **ultraweb:gate-responsive** — must run on the longest locale to catch overflow.
- **ultraweb:gate-content** — the completeness check runs per locale, not once.
