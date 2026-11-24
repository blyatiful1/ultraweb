# sections

Page-level sections for a marketing or product site: hero, site chrome (navigation, footer), feature sections, cards, social proof, FAQ, pricing.

Load when: building or restyling any of these sections in phase 5 or 6.
Reads: design/DIRECTION.md, design/SYSTEM.md, design/SITEMAP.md, the global CSS tokens. Writes: `components/sections/*`, `components/layout/*`.

Defaults that the rest of this file warns about (tracked all-caps eyebrows, numbered 01/02/03 lists, bento as the cure for sameness, grayscale logo marquees, arrow-suffixed links, an italic accent word in the headline, mono small labels, middle-dot meta strings) are options. Use one only when `design/DIRECTION.md` argues it from the brief, and say which one in a code comment.

## Hero

Decide the headline scale in `design/DIRECTION.md`. A display-size headline (several times body, fluid via `clamp()` from the `--text-display` token, tight tracking, line-height about 0.95 to 1.08) is one answer; a quiet headline beside dominant media is another. Check the 375px layout separately; it is designed, not squeezed.

| Variant | Use when | Traps |
|---|---|---|
| typographic | type-led or editorial directions; fastest LCP | needs one real typographic decision beyond size, derived from the subject |
| split | something real to show next to the text | 55/45 or 60/40, never 50/50. Mobile: text first; drop media that adds nothing at 375px |
| full-bleed media | the image carries the emotion | scrim sized to the text zone and computed for AA against the lightest and darkest pixels under the text. Video: muted, `playsInline`, poster, short loop, none under reduced motion |
| product-shot | one product or real UI is the anchor | real UI at 2x in a designed frame, depth from SYSTEM.md. A sticky image sequence gets most of a rotatable 3D object at a fraction of the weight |
| editorial-offset | agency, portfolio, fashion | hardest to hold together at 768px; design that layout explicitly |

CTA: one filled primary, at most one secondary (ghost or plain text link). The primary label is a verb phrase specific to the brief. At most one proof element in the hero, placed after the CTA.

### Above-the-fold performance

- Prefer text as the LCP element. Name the LCP element in a code comment.
- Image LCP: static import, `fill`, `sizes`, `placeholder="blur"`, and the `preload` prop on the image component. Never `loading="lazy"`. `priority` is the deprecated name; check the installed Next docs if unsure.
- Keep the hero a server component. Entrance animation uses CSS keyframes registered as `--animate-*` tokens in `@theme`. If the signature move needs the animation library, isolate it in one `"use client"` leaf using the lazy/`m.` form so the full bundle is not on first paint.
- An SVG signature move is never mounted hidden. The server paints the finished static SVG into the HTML; a client leaf rewinds and replays it after hydration. A path shipped at full `stroke-dashoffset` is invisible without JS and under reduced motion, and if it is the LCP candidate the metric slides to when the draw finishes.
- No layout shift: `min-h-[100svh]` or explicit aspect boxes, never a height that depends on image load. Do not use `h-screen`.
- One entrance sequence, 400 to 700 ms total, then stop. Nothing loops except an element the direction commissions.
- A heavy hero gets a designed loading moment, never a bare spinner. Its final frame is the hero's first frame, it is skippable, and it cuts instantly under reduced motion.

Exactly one `h1` per page, the hero headline (split words stay inside it as spans). Under reduced motion content appears instantly.

Greppable: `priority` on the image component; `bg-clip-text text-transparent`; `framer-motion` imports; carousel heroes; two filled CTAs.

## Site chrome: navigation and footer

### Navigation

Sticky with intent: hide on scroll down, return on scroll up, never an always-fixed 64 to 80px bar. At most 7 top-level destinations; more means a mega-menu (only with 12+ real destinations) or an IA fix in SITEMAP.md.

| Variant | Use when |
|---|---|
| slim bar | default; logo left, links right, one CTA as the only filled element |
| centered logo | editorial or boutique; decide which side carries the CTA |
| floating pill | detached bar inset from the top, solid surface; blur only if SYSTEM.md designed glass |
| mega-menu | 12+ destinations; panels open on click, close on Escape and focus-out, arrow keys move inside a panel |

Scroll behavior, plain React in a client leaf: ignore deltas under 8px, hide only after 96px of depth, animate `transform` only (never `top`). Force visible while the mobile menu is open, while focus is inside the header, and under reduced motion (then plain sticky). Add border or surface tint only after about 16px of scroll.

Mobile menu: build it on a native `<dialog>` opened with `showModal()`, which gives focus trap, inert background and Escape for free; add a body scroll lock only if the page can still scroll behind it. Trigger is a `<button>` with `aria-expanded` and `aria-controls`; focus returns to it on close. Make it a designed moment: display-scale links, a short link stagger (reduced motion: instant), one element that belongs to this site. Entry and exit animate with `@starting-style` plus `allow-discrete` (see `references/primitives.md` overlays). Do not add a portal or focus-trap library, and do not route it through a generic sheet component with a link list dropped in.

Active link: `aria-current="page"` from the pathname plus a non-color indicator. Hover uses one move, identical on every nav link and reused in the footer.

Skip link: first focusable element, before the header; pair with `<main id="main" tabIndex={-1}>`. Style its visible state deliberately.

On multi-section pages, the location signal (section color) mirrors the active link but never replaces `aria-current`. Archive or index pages may offer unusual filter axes and a "surprise me" over a working crawlable list.

Greppable: `z-[9999]`; `hidden md:flex` links with no mobile menu; `<div onClick` hamburger; default `backdrop-blur`; hover-only dropdowns.

### Footer

The page visibly ends. Pick a closing gesture by site energy:

| Variant | Use when |
|---|---|
| oversized type | type-led directions: brand word at `clamp(4rem, 18vw, 16rem)`, optionally cropped by the viewport bottom; mark it `aria-hidden` when the name appears elsewhere in the footer |
| columnar sitemap | 8+ pages or docs: at most 4 columns, 4 to 6 links each |
| minimal strip | one-pagers and small sites; a columnar footer on a small site looks like cosplay |
| CTA finale | last conversion chance: repeats the hero offer in the same primary style, then a compact link strip |

Rules: design the seam between the last section and the footer (96 to 160px of release space or a hard surface cut). Re-decide the surface per theme and compute contrast on it, including the newsletter input border and placeholder. Every link resolves; zero `href="#"`. Year computed, never typed. Social icons: one size, one stroke, only channels the brand uses, `aria-label` each. A `nav` inside the footer gets `aria-label="Footer"`. Newsletter: visible label, one field, schema-validated server action, inline success and error (see forms in `references/primitives.md`). Footer hover reuses the header hover move.

## Feature sections

Three identical icon-cards in a row is the strongest AI-slop signal. Each section communicates one idea with a focal point findable in a second. Server components by default; interactivity is a client leaf.

Chooser by content shape:

| Content shape | Pattern |
|---|---|
| 2 to 4 features, each earns a paragraph and a real visual | alternating split |
| 3 to 5 sequential steps telling one story | sticky-scroll showcase |
| 3 to 5 parallel capabilities on one surface type | tabbed showcase |
| features of unequal weight, one clear lead | asymmetric grid with one large cell |
| process or values with weak imagery | plain typographic list |

- Alternating split: 45/55 or 40/60, never 50/50; visual at least 360px tall; mobile stacks text first.
- Sticky-scroll: CSS `position: sticky` does the pinning; use the animation library's scroll hook only when the visual must track progress continuously. Mobile and reduced motion degrade to a stacked list; all step text stays in the DOM in order. No scroll-jacking.
- Tabbed: restyle the generated tabs primitive and keep its wiring (arrow keys). Reserve the panel height for the tallest content. Auto-advance only if paused on hover and focus and off under reduced motion.
- Asymmetric grid: exactly one cell spans larger; no two adjacent cells the same size. If every feature is equally important the pattern is dishonest. A bento look is an option that needs a reason from the direction, once per page at most.
- Plain typographic list: numerals only when the order is real (steps). Do not number a non-sequence. Separate entries with hairlines or space, not boxes.

Adjacency rule: no two neighboring sections share a layout pattern, counting every section (hero, proof, pricing, FAQ). Neighbors should also differ in at least one of background, width, or density. Fix the order in SITEMAP.md; never decorate a twin.

Outline: one `h2` per section, features as `h3`; the outline should read as a story. Tabs and sticky steps keep all content readable without the interaction.

Greppable: `md:grid-cols-3` over three identical icon-heading-paragraph children; `Feature 1`; uniform `py-24`; every section `text-center mx-auto`.

## Cards

A card is a hierarchy problem in a small box: one focal element, at most three type levels, readable in two seconds. A group of cards is a composition problem: cap identical siblings at 3.

| Variant | Use when | Key rules |
|---|---|---|
| media-top | blog, case studies, products | fixed aspect ratio, clipped wrapper radius matches the card |
| icon-lede | abstract services | icon in a container shaped by SYSTEM.md; max 3 per row |
| stat | metrics | number at least 2.5x body, `tabular-nums`; show timeframe or source |
| editorial | text-led directions | headline plus meta, no image |
| feature-object | large cells in an asymmetric grid | visual to the edge, text pinned to a corner over a scrim, text at most half the cell |

- Container-aware layout is required. A reusable card reflows from its own width, never from viewport breakpoints. Name the wrapper (`@container/card`) and query it (`@sm/card:grid-cols-[9rem_1fr]`). A card using `md:flex-row` breaks when placed in a narrow cell. This is core Tailwind; no plugin.
- Primitives from the component library carry `data-slot` attributes. Target parts with `data-[slot=...]`, not child combinators.
- Whole-card link: stretch the title's `<a>` over the card (`after:absolute after:inset-0`). The accessible name is the real title, never "Learn more". No nested interactive elements inside a stretched-link card; a card with a secondary action is not a link card.
- One hover motif site-wide, encoded once in the card component: lift 2 to 4px with a shadow step, or inner image zoom to about 1.03, or a border shift. 150 to 250 ms, transform, opacity and shadow only. Never scale the whole card past 1.02. Under reduced motion fall back to a border or shadow change. Focus-visible draws the same ring as buttons on the card boundary; active returns the lift.
- Padding 24 to 32px; the title-to-body gap is tighter than the card-to-card gap. Meta text uses the muted token, never the accent.
- Loading skeleton mirrors this exact layout. A card that cannot be visited does not render as a card.
- Variation in groups: change size, variant or content shape past 3 siblings; offset alternate columns 24 to 48px in editorial grids; mix variants rather than cloning.
- Images: `fill` plus `sizes` in the aspect-locked wrapper, no `preload` (below the fold). Card headings are `h3`; hover-revealed content also shows on focus-within.

Greppable: `rounded-xl shadow-lg` on every card; `hover:scale-105`; `Learn more` as every card's CTA; border and heavy shadow together at rest; `md:` classes driving a card's internal layout.

## Social proof

A visitor who has been burned by fake reviews must believe this section. Fake-looking proof costs more trust than none.

Rules:
- Every testimonial: name, role, company, and that person's real photo or an initials tile from SYSTEM.md tokens. Never a generated portrait beside a real name. "John D." attribution is out.
- Quotes are specific: a task, a number, a before and after, 15 to 40 words.
- Zero fabricated proof: no invented quotes, review counts, star ratings without a source, or logos the client has not earned. On a demo or staging build (BRIEF.md says so) sample quotes are allowed only if each is labeled "Sample quote" in the UI and tagged `UNVERIFIED-PROOF` in source, so the content gate can find them. Never ship them to production. Publishing a real quote needs the right to publish it; unknown permission blocks production.
- Stats: at most 4 per band, precise beats round unless the round number is the fact, caption each with timeframe or source.

No proof yet, in order of strength: (1) cut the section; (2) a founder's note with real name and face; (3) verifiable product facts from the brief or the user (an invented "ships in 48h" is fabrication); (4) real, user-confirmed guarantees and published pricing.

Variants:

| Variant | Use when |
|---|---|
| single spotlight | one strong quote; placed before the final CTA |
| wall | 3 to 6 quotes, deliberately varied card heights, roles tagged so segments recognize themselves |
| logo wall | 5 to 12 real logos in a static grid |
| stat band | metrics are the strongest proof |
| case-study teaser | real case studies exist: logo, one result metric, one-line outcome, link |

- Logos: one visual weight and normalized optical height (about 24 to 32px cap height), not equal bounding boxes. Treat color per SYSTEM.md; uniform grayscale is the common default and needs a reason from the direction. A marquee only at 8 or more logos, only when the direction wants motion: CSS transform loop at 30 to 60s, track duplicated once with the clone `aria-hidden`, paused on hover and focus-within (WCAG 2.2.2), a static wrapped grid under reduced motion. Never marquee testimonials.
- Placement: logo wall near the hero, testimonials after the feature story, a single spotlight before the final CTA. Never two proof sections back to back.
- Non-clickable quotes and logos get no hover lift; no testimonial carousel or marquee.
- Markup: `<figure>`, `<blockquote>`, `<figcaption>`; logos `alt="{Company} logo"`; avatars with explicit width and height.

Greppable: `John D.`, `Happy Customer`, `Jane Doe`, `game changer`, `Trusted by` over logos not in BRIEF.md, star glyph rows.

## FAQ

An FAQ removes the last objection before conversion. Phrase questions as users ask them ("Can I cancel anytime?"), answers 1 to 4 sentences with the answer first, 5 to 8 questions per section (more: group under subheads or move to a page). Objection-ranked, most conversion-blocking first. Overflow goes to a categorized page. Questions about pricing sit directly under the pricing section and are removed from the main FAQ.

Default to native `<details>/<summary>`: no JS, works before hydration, find-in-page reaches closed answers. Hide the marker (`list-none`, `[&::-webkit-details-marker]:hidden`), rotate a single icon with `group-open:`. Give all items the same `name` to make them exclusive. Animating the height (`interpolate-size`, `::details-content`) needs a support check; instant open is acceptable. Use a client accordion only for choreographed collapse, controlled open state (deep link, analytics), or exclusive plus animated together. Never unmount closed answers.

Keep Q/A in one typed array exported from the component. Mark up FAQPage JSON-LD from that array only for visible pairs (see `references/findability.md`); do not expect rich results, which Google restricts.

Question text body to 1.125em medium weight, never display size; answer in the muted token; the whole row is the 44px target; `h3` goes inside the summary.

Greppable: `useState(false)` next to a question list; `href="#"` in answers; all items open by default; first item auto-opened with an entrance animation; 15+ questions in one list.

## Pricing

The right plan is obvious in 5 seconds and the section survives a skeptical re-read. The price is the largest text after the heading. Every claim ("cancel anytime", "no card required", "save 20%") must be literally true against BRIEF.md and the payments setup. German legal price rules live in `references/commerce.md`.

1. Read the business model from BRIEF.md. Feature the plan the typical visitor should buy, not the most expensive. Define tiers in one typed constant that the section renders and the payments code mirrors.
2. Variants: three-tier cards (2 to 4 tiers, equal heights, CTAs bottom-aligned); two tiers plus an enterprise strip ("Contact sales", never a fake price); single-price spotlight; cards plus a comparison matrix (10+ differentiating rows); subscription cadence (below).
3. Featured tier: exactly one, "Most popular" only if the brief supports it. At most two emphasis devices from accent border, elevated shadow, filled badge, primary CTA. It does not grow on hover. Two featured flags is a build error.
4. Price typography: amount 3 to 3.75rem, `tabular-nums`, currency symbol at 40 to 50% of size, cadence muted. Wrap split spans in an `aria-label` that reads as a sentence. Annual context sits directly under the price, visible, never a tooltip.
5. Billing toggle only when two real periods exist: segmented control with `aria-pressed`, the saving stated concretely and truthfully, default to the period most customers buy, crossfade 150 to 250ms with a fixed-width amount slot (instant under reduced motion). Do not wrap the grid in `aria-live`.
6. Matrix rows exist only where tiers differ; shared items go in one "All plans include" line. Limits are numbers. Check cells use icons plus visually hidden "Included" / "Not included". The matrix is a real table with `scope` headers and follows the table rules in `references/primitives.md` data display. Card bullets: 4 to 7, differentiators first, upper tiers start "Everything in X, plus:".
7. Subscription cadence (recurring commerce): a 2 to 3 option segmented control showing the live per-delivery price in a fixed-width slot; pause, skip and swap appear above the checkout CTA; never pre-select the longest or priciest cadence, pre-check an add-on, or reveal cost late; each cadence maps to one allowlisted price ID, the picker selects an interval never an amount.
8. States: CTA loading only on the clicked tier; checkout-session failure shows an inline retry next to that CTA. Prices fetched from the payment provider use skeletons sized to the final layout; on failure render from the typed constant, never blank cards.
9. `line-through` prices only for a real, dated prior price (see commerce.md for the 30-day rule).

Greppable: two `featured` flags; "Custom pricing" typeset as a price; a matrix row where every tier has a check; emoji matrix marks; 9+ bullets per card.

## Long-form furniture (only on essay, report or docs pages)

Skip on landing and marketing pages. Active-section labels and a table-of-contents rail use IntersectionObserver, never a per-frame scroll handler; the rail is a real `nav` with `aria-current="location"`, a decorative running head that echoes a heading is `aria-hidden`. Sidenotes live in a reserved margin column on wide screens, collapse to a numbered superscript with a native popover below the gutter breakpoint, and to an endnotes list with back-links at phone width; nothing scrolls horizontally. One tenant per margin column: rail or sidenotes, not both.

## Search or command palette (only with real content depth)

Build it only when the site has many pages, docs or a blog and a technical audience. It is an accelerator: the same content stays reachable by normal links, a visible trigger exists (not a hidden shortcut), and a no-JS `/search` page using a GET form with real anchors is built first and marked `noindex`. The shortcut ignores keypresses while focus is in an input, textarea or contenteditable. Use a library that provides the combobox/listbox roles rather than hand-rolling them, and give the dialog an accessible name. Build the index at build time, and detect the platform key after mount to avoid a hydration mismatch.
