# findability

Everything that decides whether the site is found, shared, rendered in the right language, loaded fast and measured: metadata and crawler files, internationalization, media delivery, analytics.

Load when: writing metadata, OG images, sitemap or robots, adding a second language, placing any image, font or video, or wiring analytics.

Reads: design/BRIEF.md, design/SITEMAP.md, design/SYSTEM.md, design/DIRECTION.md. Writes: metadata exports, `app/opengraph-image.tsx`, `app/sitemap.ts`, `app/robots.ts`, `app/manifest.ts`, `app/icon.tsx`, `lib/fonts.ts`, `lib/i18n.ts`, `lib/analytics.ts`, `app/[locale]/` when multilingual.

## Metadata

Every route ships a unique title (aim for 60 characters or fewer), a description of roughly 140 to 160 characters written in the site's voice, a canonical URL and JSON-LD for the entity the page really is. Titles and descriptions come from the copy deck, never keyword lists.

- Root layout first: `metadataBase` plus a title template. Without `metadataBase` every OG and canonical URL is relative and share scrapers drop the card.
- Page titles omit the brand; the template appends it. Only the home page uses `title.default`.
- `generateMetadata({ params })` awaits `params`. A missing record calls `notFound()` or returns `{}`.
- `metadata` cannot be exported from a `"use client"` file.
- Do not ship the `keywords` meta tag, `next/head`, or the same title on two pages.

```ts
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL!),
  title: { default: "Site name: what it is", template: "%s | Site name" },
  description: "One sentence in the site's voice.",
}
// page: alternates: { canonical: "/about" }, title: "About"
```

## OG image, icon, manifest

- `app/opengraph-image.tsx` exports `alt`, `size` (1200 by 630) and `contentType`, and returns `ImageResponse` from `next/og`. Dynamic routes get their own file reading the page's real title (`await params` there too).
- The renderer supports flexbox only. No grid. Every div with more than one child needs `display: "flex"`.
- It never reads `globals.css`. Resolve tokens to hex or rgb literals (read them from the token file the design system produced); do not rely on `oklch()` or CSS variables inside it.
- Load the brand font by passing its bytes: `fonts: [{ name, data: await readFile(...), weight: 700, style: "normal" }]` in the `ImageResponse` options. A system-stack bold at large size is the fallback.
- Design it as one section of the site: dominant type, real copy, the site's one accent. Reuse the identity component if the project has one; never re-derive the lockup.
- `app/icon.tsx` renders the real mark at small size; the framework default favicon is a defect. `manifest.ts` takes name, `theme_color` and `background_color` from the tokens.

## Sitemap, robots, JSON-LD

- `sitemap.ts` lists real routes from the sitemap artifact and the content source, with real `lastModified` dates where known. Drafts never appear. Use the production domain.
- `robots.ts` carries an explicit, recorded decision on AI-training crawlers (`GPTBot`, `ClaudeBot`, `Google-Extended`, `CCBot`, `Bytespider`, `Applebot-Extended` are the common user agents; the list changes). Default for trust-critical or editorial clients is to disallow; a docs-heavy product may allow for reach. Record the decision and reason in design/BRIEF.md. In the EU, a machine-readable reservation in robots.txt is commonly used as the text-and-data-mining opt-out; the legal effect is a question for the client's counsel (see `references/legal-dach.md`).
- A named user-agent group overrides `*`. `/llms.txt` is optional and unproven; never trade robots directives for it.
- JSON-LD in a server component, `<` escaped so content cannot close the script:

```tsx
<script type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
```

Types: `Organization` or `LocalBusiness` on home, `Article` on posts (headline, datePublished, author), `Product` with offers on product pages, `BreadcrumbList` on nested routes, `FAQPage` only where an FAQ is visible. Mark up only what is visible on the page. Validate with a rich-results test.

Verify: build, view source of every route (unique title, canonical, absolute OG URLs), request `/sitemap.xml`, `/robots.txt`, `/opengraph-image` directly.

## Internationalization

Skip this section entirely when the brief names one market. "Might add English later" builds nothing; a `[locale]` segment retrofits quickly. For two to four locales of marketing content use the pattern below with no library. For app-scale needs (ICU plurals, extraction tooling) pick a library deliberately.

Rules: locale lives in the URL (`/de/arbeiten`), never only a cookie. Every shipped locale is fully written; cut a half-translated locale. Dictionaries never reach the client bundle. hreflang is complete including `x-default`. Dates and numbers go through `Intl` with an explicit locale. Check the longest locale at 375 px.

```ts
// lib/i18n.ts
export const locales = ["en", "de"] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = "en"
```

- Move pages under `app/[locale]/`; its layout is the root layout and owns `<html lang={locale}>`. Add `generateStaticParams` returning the locales. `params` is a Promise.
- Dictionaries: `.ts` modules, lazy imported, `import "server-only"` in the loader. Type the other locales with `satisfies typeof en` so a missing or extra key fails `tsc`. Pages call `const t = await getDictionary(locale)` and pass strings down as props. Client leaves receive strings and never import dictionaries.
- Access with object paths (`t.nav.work`), not string-lookup helpers.
- Negotiation in `proxy.ts`: skip `/_next`, `/api` and paths with a file extension, skip paths that already carry a locale, otherwise redirect (never rewrite) to the best `Accept-Language` match or the default. Return `NextResponse.next()` on the skip paths. No IP-geolocation redirects.
- hreflang through metadata: `alternates: { canonical: "/de/work", languages: { en: "/en/work", de: "/de/work", "x-default": "/en/work" } }`. Every variant lists all variants including itself.
- The switcher links to the same route in the other locale, not to the home page.
- `new Intl.DateTimeFormat(locale, { dateStyle: "long" })` and `new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" })`. A bare `toLocaleDateString()` uses the runtime locale and causes hydration mismatches.
- RTL (only if an RTL locale is in the brief): set `dir` on `<html>` and use logical utilities (`ps-*`, `pe-*`, `ms-*`, `me-*`, `text-start`) from the first line; retrofitting is a full sweep.

### German typesetting (when a `de` locale exists)

- Hyphenate compounds: `hyphens: auto` on prose (needs the `lang` the layout sets). Keep it off display type; break headlines with `&shy;` at a chosen seam or `text-wrap: balance`.
- Quotes: `„…“` (low open, high close); guillemets `»…«` in editorial register; Swiss German uses `«…»`. Write the real glyphs in the dictionary and set `:lang(de) { quotes: "„" "“" "‚" "‘" }` for `<q>`.
- `ß`: Swiss German never uses it (always `ss`). In uppercase text, `text-transform: uppercase` yields `SS`; the capital `ẞ` only renders if the font ships that glyph, so check it or keep `SS`.
- Numbers and money only through `Intl.NumberFormat("de-DE")`: decimal comma, thousands period, trailing currency with no-break space (`1.234,56 €`). A hand-typed `1.5` reads as fifteen hundred.
- Non-breaking space (`&nbsp;`) between value and unit and in spaced abbreviations: `15&nbsp;€`, `20&nbsp;%`, `z.&nbsp;B.`
- Headlines run 15 to 35 percent longer. Re-check each hero at 375 px against the fluid type scale: tighten the minimum, add a `&shy;`, or balance the wrap.
- Easy-language (Leichte Sprache) is a separate written register, not a translation. Offer it only for civic, foundation or public-sector briefs, as a real route written natively (for example `/de/leichte-sprache/...`), never a PDF or machine-simplified text.

## Media delivery

Targets: LCP of 2.0 s or better on throttled Fast 4G mid hardware, CLS 0 from images, fonts and video, each image delivered within about 1.5 times its rendered pixel size, fonts self-hosted with no third-party request, at most one preloaded image per page (exactly one when the LCP element is an image, none when it is text). `scripts/gates.mjs` measures it.

### next/image

- `priority` is deprecated: use `preload`. `onLoadingComplete` became `onLoad`.
- Repo assets: static import. Width, height and the blur placeholder are inferred.
- Crop to a container: `fill` plus `sizes`, always together. `fill` needs a `relative` parent with real dimensions and `object-cover` on the image.
- `sizes` declares rendered width; wrong values ship a huge rendition to a small card. Full-bleed `100vw`; half split `(min-width: 768px) 50vw, 100vw`; three-up grid `(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw`.
- Remote images: allowlist the host in `images.remotePatterns`, pass real `width` and `height`, supply a real `blurDataURL` or use `placeholder="empty"` over a token-colored background. A remote image never reserves zero space.
- Inline SVG logos and icons as JSX so they inherit `currentColor`. Feed the optimizer a source at least 2x the largest rendered size; do not pre-compress.

### SVG optimization

Run each shipped SVG through SVGO once, with a config that knows whether the file is animated or referenced.

- `cleanupIds: false` on anything animated or referenced. The default minifies ids and silently breaks `<use href="#...">`, gradient and filter references, and CSS or JS selectors that target them.
- Keep the viewBox (`removeViewBox: false`); without it the graphic cannot scale.
- No `mergePaths` on morph targets or multi-path draw animations: merging destroys per-path handles and the point-count parity a morph needs.
- Strip editor metadata, comments, empty groups and hardcoded fills on icons meant to inherit `currentColor`. Never re-run a lossy preset over a file already tuned.

### Fonts

Declare fonts in one file, `lib/fonts.ts`; a font declared anywhere else is a defect. `next/font/google` and `next/font/local` self-host, so there are no requests to Google. Variable fonts omit `weight` (the whole axis is one file). Two families at most. Use a `-src` variable name so the token layer can bridge it:

```ts
// lib/fonts.ts
import localFont from "next/font/local"
export const display = localFont({ src: "./fonts/Display-Variable.woff2", variable: "--font-display-src", display: "swap" })
```

Apply `display.variable` on `<html>`, then bridge in the theme layer: `--font-display: var(--font-display-src)` inside `@theme inline`. Do not add a hand-written `@font-face` or manual `size-adjust` beside next/font; it adjusts fallback metrics itself.

### LCP protection

1. Only the LCP image gets `preload`. Two preloaded images protect neither.
2. Never animate the LCP element from `opacity: 0`; an invisible element cannot be an LCP candidate and the metric slides to the end of the reveal. Animate its siblings.
3. LCP text is server-rendered with its font variable applied from first paint, never inside a late-mounting client component.
4. No LCP element inside a `dynamic()` import or lazy boundary.
5. Hero background media is a real `<Image fill preload>`. CSS `background-image` cannot be optimized or preloaded.

### Video

- Ambient loops: self-hosted MP4 of 4 MB or less, `<video autoPlay muted loop playsInline preload="metadata" poster=...>`. `muted` is required for autoplay and `playsInline` stops iOS going fullscreen. The poster is a real optimized still at the video's exact dimensions, and it is the LCP candidate, not a video frame.
- Pause ambient video under `prefers-reduced-motion`. Meaningful video ships a captions `<track>`; silent decorative loops get `aria-hidden`.
- Third-party embeds (YouTube, Vimeo): facade, with the iframe injected on click. In the DACH market the facade is also the consent gate (`references/legal-dach.md`).
- Below-fold video: `preload="none"`.

Greppable defects: `priority=` on next/image, `layout="fill"`, `<img ` in TSX (except inside `opengraph-image`), `fill` without `sizes`, `unoptimized`, `fonts.googleapis.com`, `bg-[url(` for content imagery.

## Analytics

Default to a privacy-friendly, hosted or self-hosted tool (Plausible, Fathom, self-hosted Umami) over a cookie-based suite. Whether a given setup needs consent is a separate question; see `references/legal-dach.md`. Tools that set cookies or identifiers load only behind the consent gate there.

- Mount one deferred script. Prefer proxying the script and its event endpoint through a same-origin rewrite so there is no third-party origin; follow the vendor's current proxy instructions for both halves.
- Events come from the conversion goals in design/BRIEF.md and design/SITEMAP.md, fewer than pages. Name them after the goal, not the widget (`newsletter-subscribe`, never `hero-cta-click`), kebab-case verb-object, at most two properties, every property from a closed set (plan, slug, placement). No free text, emails or user ids as properties.
- Two CTAs for one goal fire the same event.
- Count money where it is confirmed: server-side from the payment webhook, not on the button click.
- Fire form goals from the action's success state, not on submit. Wrap calls in one typed `track()` helper so an unlisted event name does not compile; call it only from client leaves, and make a missing tag a silent no-op.
- No session replay, autocapture or tag manager on a marketing site.
- Verify in a production build: one event per goal click, requests go to your own origin, and the browser's storage panels are empty if the claim is "no device storage".
