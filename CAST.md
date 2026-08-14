# CAST.md — the eight recurring clients

Canonical fact sheet for the eight clients traced across the ~70 skill files' Worked-example sections (`ROSTER.md` line 7). Skills don't invent a client's palette, type, routes, backend, or signature move — they cite this file. A value a skill states must match the row below; if a skill needs a value this sheet lacks, that skill sets it and records it here. Where skills already disagree, the majority/most-detailed value is canonical and the outlier is logged under **Known divergences** — those files are not edited by this pass. Every fact below is extracted (or paraphrased without invention) from `skills/*/SKILL.md` and the root `SKILL.md`/`ROSTER.md`.

---

## Kaffeewerk Ost

Berlin specialty coffee roastery + online shop — single-origin roasts sold one-off and as a recurring **Abo** (subscription).

| Field | Value |
|---|---|
| Archetype | **Warm Organic/Humanist**, pushed ~20% past comfortable, + twist: Swiss column discipline on commerce surfaces (`SKILL.md`, `direction`, `mockup`, `checkpoint`) |
| Ground | `oklch(0.97 0.008 75)` cream |
| Ink | `oklch(0.24 0.02 60)` |
| Accent | `oklch(0.62 0.16 45)` rust — light-ground only, fails AA on the dark bar (`identity`) |
| Type pairing | Fraunces (`opsz`, display) + Work Sans (UI/body) |
| Routes | `/`, `/shop`, `/shop/[slug]`, `/abo`, `/roesterei`, `/kontakt` |
| Backend | Stripe checkout + raw-body webhook · Drizzle (`products`/`orders`/`subscriptions`) · Resend receipts · TTDSG-direct consent |
| Signature move | The roast-profile temperature curve — hand-drawn SVG rise-and-plateau path; hero spine + section divider on `/`; on `/roesterei` three batch profiles trace in sequence with a bean marker |

## Tidepool

B2B analytics SaaS for container-terminal / port-logistics ops managers.

| Field | Value |
|---|---|
| Archetype | **Precision Instrument** — Neo-grotesque Minimal, calm, data-forward, dark-mode first-class (`command-palette`, `depth`, `navigation`, `overlays`, `icons`, `pricing`) |
| Ground (dark, default) | `oklch(0.18 0.015 250)` · card `oklch(0.22 0.015 250)` · popover `oklch(0.26 0.015 250)` |
| Ground (light) | `oklch(0.985 0.005 240)` — hue 245 |
| Accent | teal `oklch(0.68 0.12 200)` — no decorative glow (banned by name) |
| Type pairing | General Sans (UI/display) + JetBrains Mono (data/numerals, `tabular-nums`) |
| Routes | `/`, `/product`, `/pricing`, `/docs` (+`/docs/api`), `/changelog`, `/login`; `/api/v1/*` handlers (not sitemap pages) |
| Backend | Better Auth (email+password Growth, OIDC SSO Fleet) · Drizzle+Neon · versioned `GET /api/v1/berths` (zod, session-gated) · Stripe (single recurring price, Growth $490/mo only) |
| Signature move | Live berth-utilization timeline in the hero — static SVG shell as LCP, live vessel positions stream in behind Suspense, no cache |

## Studio Norra

Oslo agency portfolio — raw editorial authority that still has to sell the studio's craft.

| Field | Value |
|---|---|
| Archetype | **Editorial Brutalist** — exposed 12-col grid, oversized uppercase, deliberate rawness with high craft (`award-canon`, `gate-visual`, `layout-grid`, `motion-language`, `theme-worlds`) |
| Ground | paper `oklch(0.96 0.005 90)` |
| Ink | `oklch(0.2 0.01 270)` |
| Accent | signal red `oklch(0.6 0.21 25)` — interaction states ONLY, never at rest |
| Type pairing | Archivo Expanded (oversized uppercase display) + Inter (body) |
| Routes | `/`, `/work`, `/work/[slug]`, `/studio`, `/contact` |
| Backend | unset — no worked example cites a backend skill; first skill to use it decides, then records it here |
| Signature move | Cursor-proximity case-study image reveals on `/work` — real `<img>` DOM, `clip-path` + `useSpring` pointer-follower, 0kb WebGL. `/work`→`/work/[slug]` shared-element spring transition. Per-case-study `--world-<slug>` accent worlds |

## Casa Verde

Lisbon farm-to-table restaurant, EN/PT bilingual, reservations-driven.

| Field | Value |
|---|---|
| Archetype | **Sunlit Rustic** — full-bleed photography carries the emotion, chrome recedes (`imagery`, `wireframe`, `faq`) |
| Ground | warm cream `oklch(0.97 0.01 85)` |
| Ink | unset — no skill states a body-ink value; first skill to use it decides, then records it here |
| Accent | terracotta `oklch(0.66 0.13 45)` |
| Type pairing | Fraunces (italic on section h2 / success heading) + Karla (labels, UI, body) |
| Routes | `/en`, `/en/menu`, `/en/story`, `/en/reservations`, mirrored at `/pt/*`; default locale `pt` |
| Backend | `server-actions` (zod v4 `reservationSchema`, atomic seat claim) + Resend confirmation · `i18n` (zero-library, EN/PT dictionaries) · AI/RAG **rejected** — menu/hours change too fast |
| Signature move | The day's-harvest strip — horizontally-scrolling row of today's market finds, full-bleed, above the menu preview (native swipe on mobile, static under reduced motion) |

## Ledger & Lane

Boutique two-partner DACH law firm — "Considered Counsel" / Quiet Authority.

| Field | Value |
|---|---|
| Archetype | **Quiet Authority** — restraint as credibility; a ruled-line system structures every page like a legal document (`typography`, `retrofit`) |
| Ground | warm paper `oklch(0.975 0.005 80)` |
| Ink | ink navy `oklch(0.25 0.02 260)` |
| Accent | muted gold `oklch(0.72 0.09 85)` — one-gold-per-page rule |
| Type pairing | Newsreader (`opsz`, display + body, serif) + Public Sans (UI) — Archivo rejected, too grotesque |
| Routes | `/`, `/practice/[area]`, `/attorneys`, `/insights/[slug]`, `/contact`, `/impressum`, `/mandat` (engagement letter) |
| Backend | contact flow (implied `server-actions`); MDX `/insights` (`content-cms`, `BlogPosting` JSON-LD); `aiCrawlerPolicy: disallow` per UrhG §44b · AI/RAG **rejected** — legal liability |
| Signature move | Ruled-line hairline system — full-width hairlines drawn in on scroll (footer's closer); H1 cap-height trimmed to the ruled baseline |
| Market | German/DACH entity — Amtsgericht Charlottenburg HRB, USt-IdNr; cited as the DACH/BFSG and German-facing example elsewhere. (`footer`'s "NY & CT bar admissions" is the divergent outlier — see below.) |

## Framewalk

Indie game studio — Steam-launch marketing site for "Hollow Cartographer".

| Field | Value |
|---|---|
| Archetype | **Atmospheric Dark** — earned by the game's fog-and-lantern art, not a template (`color`, `hero`, `buttons`, `physics`) |
| Ground | `oklch(0.16 0.02 200)` (fog-tinted, deliberately not the banned AI-startup navy) |
| Ink / foreground | `oklch(0.92 0.01 190)` · card `oklch(0.20 0.02 200)` · border `oklch(0.24 0.02 205)` · muted-fg `oklch(0.72 0.015 200)` |
| Accent | phosphor `oklch(0.78 0.15 160)`, primary-fg `oklch(0.16 0.02 200)`; the ONLY filled button anywhere is "Wishlist on Steam" |
| Type pairing | Space Grotesk (display) + Inter (UI/body), self-hosted via `next/font` |
| Routes | `/`, `/game`, `/devlog`, `/devlog/[slug]`, `/press` |
| Backend | `content-cms` (MDX devlog) · `server-actions`+`email` (launch-news capture) · **rejected**: `payments`, `database`/`auth` (no accounts) |
| Signature move | Three-layer parallax fog in the hero answering the cursor (Trailing spring, stiffness 180/damping 18/mass 1); static composite under reduced motion. Console-signature + playable ASCII-compass `not-found.tsx` |
| Related property | "Hollow Cartographer: Deepwater" — a separate launch microsite (`/`, `/deepwater`, `/bestiary`, `/bestiary/[slug]`, `/wishlist`), archetype **Art-House Immersive**, WebGL cave-descent scene (`set-design`). Distinct property, not a divergence of the site above. |

## Aldermoor Trust

Community foundation — grants, volunteer stories, donations (UK market).

| Field | Value |
|---|---|
| Archetype | **Open Civic** — accessibility-first, all pairings AAA where possible (`gate-accessibility`, `scaffold`) |
| Ground | warm paper `oklch(0.97 0.008 85)` |
| Ink | `oklch(0.24 0.02 85)` |
| Accent | deep green `oklch(0.45 0.1 155)` — AAA on body (13.6:1), 5.2:1 for the link role |
| Type pairing | Source Serif 4 (prose/body); no display face named anywhere — unset, first skill to use it decides |
| Routes | `/`, `/grants`, `/stories/[slug]`, `/volunteer`, `/donate`; long-form `/report/2025` |
| Backend | `content-cms` — MDX via content-collections, volunteer-edited in-repo; headless CMS **rejected** (cadence/volume too low) · `/donate` payment flow: unset — no worked example specifies it yet |
| Signature move | On `/`, story-card left rule growing into a reading-progress indicator on scroll (must rest visible under reduced motion). On `/report/2025`, Sidenote Gutter + Running Folio + green-tinted Read-o-meter |
| Craft policy | Trust-critical brand — ships **no** hidden-craft gesture (paired with Ledger & Lane as the two opt-outs) |

## Loop & Thread

Small-batch handmade textiles shop — throws and runners, milled in Donegal, one-off stock.

| Field | Value |
|---|---|
| Archetype | **Soft Craft** — tactility through generous radius, close-up photography, unhurried motion (`shape-language`) |
| Ground | linen `oklch(0.94 0.012 80)` |
| Ink | walnut `oklch(0.35 0.04 60)` |
| Accent | indigo `oklch(0.45 0.08 265)` |
| Type pairing | Fraunces (display) + Karla (body) — variable-axis, self-hosted |
| Routes | `/`, `/shop`, `/products/[slug]` (e.g. `/products/aran-throw`), `/journal`, `/about` |
| Backend | Stripe one-time checkout (`mode: 'payment'`, unique-constraint inventory claim) · Better Auth · Drizzle+Neon · Vercel Blob (client-direct review-photo upload, 8MB cap) · Resend |
| Radius | Round band, shifted up one notch: sm 0.625rem · md 0.875rem · lg 1.25rem (cards) · xl 1.5rem (hero media). Motif: Arc & capsule |
| Signature move | Flat-lay → in-hand crop hover crossfade (flat-lay is the LCP element and preloads; crop lazy-loads) |
| Register | **Du** (informal German register), paired with Framewalk as the D2C/playful-register clients |

---

## Known divergences

Outliers only — canonical values are the rows above. The four divergences found by the 2026-08-14 extraction (component-api Tidepool label, footer Ledger & Lane jurisdiction, product-detail Loop & Thread archetype/palette, assets Loop & Thread route) have since been fixed in place; the entries below stay as the audit trail.

- **Kaffeewerk Ost — expected "Warm Workshop" divergence not found.** A repo-wide search (`grep -rin "workshop"`) found no skill naming the archetype "Warm Workshop" — every worked example (`SKILL.md`, `mockup`, `direction`, `cart`, `copywriting`, `identity`, `iterate`, `checkpoint`) uses **Warm Organic/Humanist**. `direction/SKILL.md:155` and `skills/studio/SKILL.md` use the plain word "workshop" in unrelated prose (a tone metaphor; the dev-only `/studio` "workshop chrome"). No correction needed; noted for the audit trail.

- **Tidepool — archetype label, minor.** `skills/component-api/SKILL.md:48` titles its example "**(Neo-grotesque Minimal)**" alone, dropping the "Precision Instrument" name every other citation carries (`command-palette/SKILL.md:110`: "Precision Instrument — Neo-grotesque Minimal, dark-first"). Canonical name: **Precision Instrument**.

- **Ledger & Lane — jurisdiction conflict.** `skills/footer/SKILL.md:82` states "NY & CT bar admissions" (a US firm), conflicting with `print-craft/SKILL.md:107` (Amtsgericht Charlottenburg HRB, USt-IdNr), `seo/SKILL.md:157,173` (German-facing, `aiCrawlerPolicy` reasoned from UrhG §44b), and `gate-accessibility/SKILL.md:124` (cited as the DACH/BFSG example). Canonical: DACH/German entity; `footer/SKILL.md:82` is the divergent file.

- **Loop & Thread — archetype name + palette.** `skills/product-detail/SKILL.md:117` names it **"Warm Editorial"** with madder accent `oklch(0.62 0.13 40)` on warm-paper `oklch(0.97 0.01 85)`. Every other citation (`shape-language/SKILL.md:97` — "Soft Craft"; `payments/SKILL.md:168`; `storage/SKILL.md:93` — linen + indigo `oklch(0.45 0.08 265)`; `social-proof/SKILL.md` — walnut/indigo class names) agrees on **Soft Craft** with the linen/walnut/indigo triad. `product-detail/SKILL.md:117` is the divergent file.

- **Loop & Thread — route naming.** `skills/assets/SKILL.md:77` places galleries at `/shop/[slug]`; every other citation (`product-detail/SKILL.md:119`, `payments/SKILL.md:154`, `storage/SKILL.md:89`, `ship/SKILL.md:92`) uses `/products/[slug]`. Canonical: `/products/[slug]`; `assets/SKILL.md:77` is the divergent file.
