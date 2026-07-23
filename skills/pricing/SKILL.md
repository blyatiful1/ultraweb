---
name: pricing
description: Pricing sections for ultraweb builds — tier cards with exactly one featured plan, billing toggles with the annual math visible, honest comparison rows (numbers not adjectives, shared features pulled out of the matrix), a subscription/Abo delivery-cadence variant for recurring commerce, German unit-price (Grundpreis) + VAT-inclusive gross display, price typography, and per-tier CTA hierarchy. Invoke in Phase 6 whenever the sitemap includes pricing — SaaS tiers, service packages, membership plans, a single-price offer, a delivery-cadence subscription, or a feature-comparison table ("add a pricing page", "pricing section", "plans and pricing", "compare plans", "monthly/annual toggle", "subscription pricing", "Abo cadence", "Grundpreis", "inkl. MwSt.").
---

# pricing — honest tiers, one hero

**Stage:** Phase 6 — Build - **Reads:** design/BRIEF.md, design/SYSTEM.md, design/DIRECTION.md - **Writes:** components/sections/pricing.tsx (+ comparison matrix)

## Standard

A first-grade pricing section makes the right plan obvious in 5 seconds and survives a skeptical re-read: prices are real numbers, discount math is visible, every matrix row differentiates, and nothing needs an asterisk to be true. The price is the largest text in the section after the heading. Pricing is a trust surface — one dark pattern costs more than the section earns, and taste's restraint rule applies doubly here: a featured tier only reads as featured against calm neighbors. In DACH commerce the price is also a legal disclosure, not just a typeset number — the gross total, the Grundpreis, and the tax/shipping line are required, not decorative.

## Process

1. Read BRIEF.md for the business model: tiers, prices, billing periods, and which plan to feature. Unstated? Decide — feature the plan the typical visitor should buy (usually mid-tier), never the most expensive by default.
2. Pick a layout variant. Define tier data as one typed constant — names, prices per period, features, CTA per tier — the single source the section renders and ultraweb:payments later mirrors.
3. Build cards from `@theme` tokens; apply featured emphasis within the budget below.
4. Add the billing toggle only if two real periods exist, with the math visible.
5. Build the comparison matrix only for 10+ differentiating features; pull shared rows out first.
6. Apply CTA hierarchy per ultraweb:buttons; screenshot at 375px — cards stack cleanly, the featured tier leads the stack, tab order stays sensible.
7. Skeptical re-read: every claim ("no card required", "cancel anytime", "save 20%") must be literally true against BRIEF.md and the payments configuration.

## Layout variants

1. **Three-tier cards** — 2–4 tiers (3 converts best), featured in the center or second slot. For self-serve SaaS with genuine tier differences. Equal card heights via grid, CTAs bottom-aligned.
2. **Two-tier + enterprise strip** — Free/Pro as cards plus a full-width "Talk to sales" strip beneath. Enterprise is a conversation, never a third card wearing a fake price.
3. **Single-price spotlight** — one product, one price: centered price block, included features in two columns beneath. For services, lifetime deals, one-plan products — the strongest trust signal there is.
4. **Cards + comparison matrix** — cards summarize, a full table details 10+ features below. For products whose tiers differ subtly; the matrix follows ultraweb:data-display alignment and markup rules.
5. **Subscription / Abo cadence** — recurring commerce (a coffee bag every 2/4/6 weeks), not SaaS tiers: one product, a delivery-cadence picker, per-delivery price computed live. For roasteries, refill boxes, and standing orders — anywhere the decision is "how often", not "which tier". Grammar and controls below.

## The featured tier

- Exactly ONE. "Most popular" / "Recommended" appears only if BRIEF.md supports it as fact.
- Emphasis budget: TWO devices max from {accent border, elevated shadow, filled badge/header, primary CTA}. All four at once is a carnival; the other cards stay quiet so the featured one can sing.
- Two `featured` flags in one section is a build error, not a design choice.

## Price typography

- Amount: 3–3.75rem, semibold or heavier, `tabular-nums` — toggle flips must not shift a single pixel of layout.
- Currency symbol at 40–50% of amount size, top-aligned; cadence ("/month") ~1rem, muted, baseline-aligned.
- DOM reads as a sentence: currency, amount, cadence. If spans split it visually, `aria-label` the wrapper with the readable string ("19 dollars per month") — never let a screen reader spell digits.
- Annual context sits directly under the price, visible: "billed annually — $190/year". Not a tooltip, not a footnote.

## German price display (PAngV)

- German B2C prices are gross: the primary amount is the total VAT-inclusive price (PAngV) — no "+ MwSt." reveal, and nothing adds tax at a later step. This is the amount Price typography renders; checkout charges it unchanged.
- Grundpreis: any good sold by weight/volume/length carries a secondary unit price beside the primary — smaller, muted, `tabular-nums`, one precision and one unit base sitewide (ultraweb:data-display's one-precision-per-column rule). Kaffeewerk Ost's 250 g bag reads "14,90 € · 5,96 €/100 g"; never mix per-100 g with per-kg in the same list.
- Disclosure sits at every add-to-cart / checkout CTA: "inkl. MwSt., zzgl. Versandkosten", the shipping words linking to the terms page — not a footnote, not hover-only. German number format throughout: comma decimal, symbol after the amount ("1 249,00 €").
- This section is the canonical author of the MwSt/Grundpreis strings — ultraweb:cart and ultraweb:product-detail reserve the slot and defer here; ultraweb:gate-content verifies them.
- A Streichpreis (line-through prior price) triggers the EU Omnibus duty: the shown prior price must be the lowest of the last 30 days, never an invented "was". Render the strike only for a real dated prior price (the honest-rows rule); the 30-day-history disclosure is owned by ultraweb:gate-content.

## Billing toggle

- Segmented control — two buttons with `aria-pressed` (or styled radios), not a bare switch whose on/off maps to nothing.
- The annual segment states the deal concretely: "2 months free" or "save 20%" — whichever is literally true. Pick one framing sitewide.
- Price change crossfades 150–250ms, opacity/transform only; `tabular-nums` plus a fixed-width amount slot keeps cards from reflowing.
- Default to the period most customers actually buy — not annual just to flatter the number.
- Keyboard operable, token focus ring, selected state readable without color (weight/fill).

## Cadence pricing (Abo)

Variant 5's grammar — a delivery rhythm, not a billing period:

- Cadence is a 2–3-item segmented control (the billing-toggle rule — never a dropdown). Each option shows the per-delivery gross price live via `useOptimistic`, `tabular-nums` in a fixed-width slot so switching rhythm shifts nothing: "14,90 € alle 2 Wochen".
- Control is the conversion lever, not discount: pause, skip-next, and swap surface ABOVE the checkout CTA — never buried in a post-purchase portal. "Jederzeit pausieren oder kündigen" sits by the CTA and must be literally true against the cancellation flow (ultraweb:payments).
- No dark subscription: the longest/priciest cadence is never pre-selected, no pre-checked add-on, no cost appearing only after a step — default the cadence most customers actually pick. If a longer interval is cheaper per delivery, state it as fact, never as the default choice.
- Each cadence maps to one Stripe recurring Price by its interval, allowlisted in `lib/prices.ts` — the picker selects an interval, never an amount; page and checkout cannot drift (ultraweb:payments).

## Honest comparison rows

- A row earns its place only if tiers differ on it. Everything shared moves to one line above the matrix: "All plans include X, Y, and Z."
- Limits are numbers: "10 projects", "5 GB" — never "More projects" or "Enhanced support".
- Check cells: lucide `Check`/`Minus` at the system stroke width, plus visually-hidden "Included"/"Not included" text. Never ✓/✗ glyphs alone, never emoji.
- Card bullets: 4–7 per tier, left-aligned, differentiators first; upper tiers open with "Everything in <tier>, plus:".
- No fake anchoring: `line-through` prices only for a real, dated previous price.
- "Free" states its bounds ("Free forever — 3 projects"); "no card required" only if checkout is genuinely configured that way.

## States

- Toggle: default / hover / active / focus-visible per segment, plus the selected state.
- Cadence picker: same segment states as the toggle; the per-delivery price swaps instantly under `prefers-reduced-motion`, no crossfade.
- Cards: hover lift ≤4px translate, 150–250ms, transform/opacity only; featured card does NOT grow on hover (it's already emphasized).
- Under `prefers-reduced-motion`: the toggle's price change swaps instantly (no crossfade) and the hover lift is dropped — reduced-motion policy per ultraweb:motion-language.
- CTAs: the featured tier holds the section's ONLY primary button; others secondary or ghost (ultraweb:buttons). Checkout-session creation shows a loading state on the clicked CTA only; if session creation fails, an inline error with retry appears next to that CTA (ultraweb:ui-states) — never a silently dead button.
- Prices fetched from Stripe: skeleton price blocks sized to the final layout — a price popping in and shifting cards reads as a glitch on the least forgiving section of the site. If the fetch fails, render from the typed tier constant (the single source from Process step 2) — never blank cards where prices should be.

## A11y

- Tier cards as `<ul>`/`<li>`; each card's heading is the tier name at a consistent heading level.
- The matrix is a real `<table>` with `<th scope="col">` (tiers) and `<th scope="row">` (features), per ultraweb:data-display.
- "Most popular" is text inside the card — never conveyed by color or position alone.
- Toggle state is announced via `aria-pressed`; don't wrap the price grid in `aria-live` — the user triggered the change and can re-read.
- The cadence picker is a real segmented control (radios or `aria-pressed`) under a group label ("Lieferrhythmus"); the Grundpreis reads after the price in DOM order, never spelled digit-by-digit.
- A scrolling matrix wrapper gets `tabindex="0"` + `role="region"` + `aria-label`.

## Anti-patterns

- two `featured` / `popular` flags true in one section
- `$Custom` or "Custom pricing" typeset as a price — write "Contact sales"
- `line-through` anchor prices with no real prior price
- a Streichpreis with no genuine 30-day-low prior price — the EU Omnibus escalation of the fake-anchor breach
- "+ MwSt." or a net figure as the primary B2C price, or tax added at a later step — German B2C is gross
- a weight/volume product with no Grundpreis, or mixed unit bases (per-100 g beside per-kg) in one list
- a pre-selected longest/priciest Abo cadence, or a pre-checked add-on upsell — a dark-subscription pattern
- pause / skip / cancel reachable only after purchase, not before the checkout CTA
- a matrix row where every tier shows a check — move it to "All plans include"
- "per user/month, billed annually" revealed only on hover or after click
- ✅/❌ emoji as matrix marks
- "Contact us" on every tier of a self-serve product — hidden prices read as expensive
- 9+ bullets per card; centered multi-line feature bullets
- price digits split across spans with no `aria-label` on the wrapper

## Worked example — Tidepool, pricing page for a port-logistics SaaS

design/BRIEF.md: "Three tiers — Starter $0, Growth $490/mo, Fleet custom. Feature Growth; dark mode is the primary surface." Direction is Precision Instrument: calm, data-forward.

Three-tier cards, Growth in the center slot. The tier data is one typed constant — the single source pricing.tsx renders and ultraweb:payments later mirrors:

```ts
const tiers = [
  { name: "Starter", price: 0,    cta: "Start free",        featured: false },
  { name: "Growth",  price: 490,  cta: "Start 14-day trial", featured: true  },
  { name: "Fleet",   price: null, cta: "Contact sales",     featured: false },
] as const;
```

Price is set in JetBrains Mono with `tabular-nums` — amount 3.5rem, the `$` at ~45% top-aligned, "/mo" ~1rem muted. Featured emphasis stays inside the two-device budget: an accent-teal `oklch(0.68 0.12 200)` border plus the section's only primary CTA (filled teal); Starter and Fleet get ghost buttons and no hover growth. That teal border is re-checked against the dark surface `oklch(0.18 0.015 250)` — dark mode is decided here, not inverted.

Rejected: giving Fleet a "$Custom" price to hold three symmetric cards. Custom typeset as a price is a dark pattern — Fleet's card leads "Let's scope your fleet" over a Contact sales CTA, with no Stripe price behind it. No billing toggle either: BRIEF lists monthly only, and a segmented control mapping to one real period is theater.

Handoff: the tier constant lands in components/sections/pricing.tsx; ultraweb:payments reads it to create the single Stripe recurring price ($490/mo Growth) — Starter and Fleet carry no Stripe price, so page and checkout cannot drift.

## Composes with

- ultraweb:buttons — one primary CTA per view; per-tier button hierarchy
- ultraweb:data-display — the comparison matrix inherits its table, alignment, and `tabular-nums` rules; the Grundpreis unit-price line follows its one-precision-per-column rule
- ultraweb:copywriting — tier names, feature phrasing, and discount wording in the brief's voice
- ultraweb:payments — Stripe products/prices mirror the tier constant 1:1; each Abo cadence maps to one recurring Price by interval; drift between page and checkout is a trust breach
- ultraweb:gate-content — verifies the DACH price/legal copy (MwSt, Grundpreis, shipping link) and the EU Omnibus 30-day price-history behind any Streichpreis
- ultraweb:cart / ultraweb:product-detail — reserve the DACH price slot (gross, Grundpreis, "inkl. MwSt.") and defer the string authoring here
- ultraweb:ui-states — loading and error design for Stripe-fetched prices and checkout-session CTAs
- ultraweb:faq — pricing objections (refunds, cancellation, limits) belong in an FAQ directly below the tiers
- ultraweb:micro-interactions — toggle crossfade and card hover timing
