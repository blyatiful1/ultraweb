# legal-dach

This is engineering guidance, not legal advice; the client's counsel decides what the law requires.

Rules for Germany, Austria and Switzerland: consent and third-party requests, legal pages and their print path, accessibility-statement scope. Legal wording comes from the client or counsel, never the model.

Load when: the market includes DE, AT or CH, or the site loads a third-party script, embed or font, or has legal pages or a checkout.

Reads: design/BRIEF.md, design/SITEMAP.md. Writes: `components/consent/*`, `lib/consent.ts`, `app/api/consent/route.ts`, legal routes, `app/print.css`.

Price display: `references/commerce.md`.

## Consent: decide whether a banner exists at all

Audit what the pages do before writing a banner. Two separate questions:

1. Device storage and access. In Germany §25 TDDDG (from the ePrivacy rules) requires consent before storing or reading information on the visitor's device unless strictly necessary for the requested service (session, cart, CSRF, locale, the consent record itself).
2. Personal-data processing. GDPR needs a legal basis, such as consent (Art. 6(1)(a)) or legitimate interest (Art. 6(1)(f)), plus disclosure in the privacy policy, even when nothing is stored on the device. A request to a third-party host (fonts, map tiles, video frame, chat widget) discloses IP address and user agent before any storage, and a German court has awarded damages over a hotlinked web font.

Neither answers the other, and how they apply to an analytics tool is contested. Remove what can be removed, verify the rest, document it, flag it for counsel.

- Self-host fonts (next/font does); `fonts.googleapis.com` or `fonts.gstatic.com` in source is a defect to fix, not to banner.
- Maps first-party (tiles you control, or a static image plus a link); short video self-hosted; YouTube and Vimeo through the click-to-load shim below.
- Analytics: pick a tool that writes nothing to the device (`references/findability.md`) and check the production build's cookies, local storage and session storage are empty. Name tool, data and retention in the privacy policy. Never assert that no consent is needed; record "cookieless, storage verified empty <date>, legal assessment pending" in design/BRIEF.md.
- No third parties and no non-essential storage: no banner. Nothing speculative.

## When a banner is needed

- Deny by default: no script, pixel or third-party frame loads before an explicit click.
- Accept and Reject on the first layer with the same size, contrast, shape, motion and click count. Accept plus Settings only is what regulators criticise; a quieter "Settings" is fine.
- No pre-ticked categories; few categories (usually `analytics`, `embeds`); essential storage is never a choice.
- Build it from the site's tokens; drop-in platforms add their own third-party request.
- A footer "Cookie-Einstellungen" link reopens it; withdrawal costs no more than granting.
- Google tags unavoidable: Consent Mode defaults (`ad_storage`, `analytics_storage`, `ad_user_data`, `ad_personalization`) `denied`, `gtag('consent','update',...)` only after a grant, and still no tag load before consent.

Decision record: the controller has to be able to show what was agreed to. Keep a version, timestamp and categories in the cookie; a server-side log row (random consent id also in the cookie, timestamp, categories, banner version, no IP); and ask again after about six months or when the version changes.

```ts
// lib/consent.ts
import { z } from 'zod'
export const CONSENT_VERSION = 1
const Consent = z.object({ v: z.number(), id: z.string().uuid(), ts: z.number(), analytics: z.boolean(), embeds: z.boolean() })
export type Consent = z.infer<typeof Consent>

export function parseConsent(raw?: string): Consent | null {   // null = undecided, everything denied
  try {
    const r = Consent.safeParse(JSON.parse(decodeURIComponent(raw ?? '')))
    return r.success && r.data.v === CONSENT_VERSION && Date.now() - r.data.ts < 180 * 864e5 ? r.data : null
  } catch { return null }   // malformed cookie
}
```

`save()` builds the object with `crypto.randomUUID()`, writes the cookie (`Path=/; SameSite=Lax`, about 180 days), updates state and POSTs it to `/api/consent` with `keepalive: true`. The route validates with the same schema and inserts a row; a logging failure never blocks the visitor. Reject is logged too.

Gating: the provider is the only client boundary in the layout (`references/next.md`). A third-party `<Script>` renders only when its category is granted. Embeds use a two-click placeholder in the site's tokens that mounts the real `<iframe>` after a click; a "no-cookie" video host still makes requests, so gate the frame.

Verify on a fresh load with the network tab open: no third-party request before a click; choices persist across reload and reject really blocks. Grep for: reject with a different `variant` than accept, `defaultChecked` on a category, YouTube or Maps `<iframe src` outside the shim.

## Newsletter and withdrawal notice

- Single opt-in for marketing mail is risky in Germany because consent must be provable: build double opt-in and keep the confirmation timestamp (`references/backend.md`).
- Consumer shops: the buyer is normally told of the 14-day withdrawal right before committing. One line beside the checkout button links a client-supplied `/widerruf` page. For digital goods delivered at once the waiver needs explicit buyer consent (a checkbox). Confirm both with counsel.

## Impressum and Datenschutz pages

- `/impressum` and `/datenschutz` exist, link from the footer on every page and work without JavaScript; add `/agb` and `/widerruf` for shops.
- Required Impressum content depends on business form and profession. Take every value (legal name, address, registry, VAT id, supervisory authority) from the client. A missing value is a placeholder tagged `UNVERIFIED-LEGAL`; ship blocks on it (`references/ship.md`). Never invent registry or tax ids.
- The privacy policy lists what the site actually does: hosting, analytics and retention, mail provider, form data, embeds, fonts. Derive the tool list from `package.json` and the code, then give it to the client for review. A policy naming absent tools or omitting installed ones is a defect.

## Print path for legal and document pages

Legal pages, invoices, quotes and letters are routinely saved as PDF records. Every site gets a lean reset in `app/print.css`, imported after Tailwind (unlayered rules beat layered utilities). Marketing pages get no designed print layout.

```css
@media print {
  *, *::before, *::after { background: transparent !important; box-shadow: none !important;
    color: #000 !important; text-shadow: none !important; }
  body { font: 12pt/1.5 serif; }
  header nav, footer, [data-print="hide"], [role="dialog"], video, [aria-hidden="true"] { display: none !important; }
  details, [hidden] { display: revert !important; }  details > summary { display: none !important; }
  img { max-width: 100% !important; }
  main a[href^="http"]::after { content: " (" attr(href) ")"; font-size: 9pt; word-break: break-all; }
  h2, h3 { break-after: avoid; }  section, .clause, tr { break-inside: avoid; }
  thead { display: table-header-group; }  p { orphans: 3; widows: 3; }
  @page { size: A4; margin: 18mm; }
}
```

- A print-only letterhead (`display: none` on screen) carries the legal identity. Quotes and invoices add a "prepared for, date" line and right-aligned tabular figures.
- `print-color-adjust: exact` only on a logo whose color matters. Print type in `pt`.
- `@page` margin boxes (`@bottom-right { content: counter(page) }`) render nothing in the main browsers' print engines (only paged-media engines support them). Rely on the browser's own header and footer for page numbers; CSS page numbering or running headers mean Paged.js or a server-side PDF route.

## Accessibility statement scope (BFSG, BaFG)

WCAG 2.2 AA is the build floor everywhere. A published statement is a separate decision; "every DACH site needs one" is wrong. Ask in order, stop at the first no:

1. Jurisdiction. Germany: BFSG. Austria: BaFG. Switzerland only: no statutory duty for private providers at the time of writing (the BehiG web rule binds authorities); no statement.
2. Service scope. The duty covers consumer-facing e-commerce services: a service where an individual consumer's request leads toward a consumer contract (shop, booking, ticketing, banking). A site that never takes such a request falls outside it.
3. Microenterprise. A service provider with fewer than 10 employees and at most about 2 million euro turnover or balance total is exempt (BFSG §3(3), BaFG §6(1)); products stay covered.

All three yes: publish the required accessibility information at `/barrierefreiheit`, footer-linked beside Impressum and Datenschutz, claiming only the measured level. A clean automated run supports the statement without proving legal conformity. Never write "vollständig barrierefrei" while any check fails. Enforcement sits with the market surveillance authority, not the BGG Schlichtungsstelle.

Record the three answers in design/BRIEF.md, also when out of scope. Counsel decides whether the law applies.
