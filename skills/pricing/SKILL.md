---
name: pricing
description: Pricing sections for ultraweb builds — tier cards with exactly one featured plan, billing toggles with the annual math visible, honest comparison rows (numbers not adjectives, shared features pulled out of the matrix), price typography, and per-tier CTA hierarchy. Invoke in Phase 6 whenever the sitemap includes pricing — SaaS tiers, service packages, membership plans, a single-price offer, or a feature-comparison table ("add a pricing page", "pricing section", "plans and pricing", "compare plans", "monthly/annual toggle").
---

# pricing — honest tiers, one hero

**Stage:** Phase 6 — Build - **Reads:** design/BRIEF.md, design/SYSTEM.md, design/DIRECTION.md - **Writes:** components/sections/pricing.tsx (+ comparison matrix)

## Standard

A first-grade pricing section makes the right plan obvious in 5 seconds and survives a skeptical re-read: prices are real numbers, discount math is visible, every matrix row differentiates, and nothing needs an asterisk to be true. The price is the largest text in the section after the heading. Pricing is a trust surface — one dark pattern costs more than the section earns, and taste's restraint rule applies doubly here: a featured tier only reads as featured against calm neighbors.

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

## The featured tier

- Exactly ONE. "Most popular" / "Recommended" appears only if BRIEF.md supports it as fact.
- Emphasis budget: TWO devices max from {accent border, elevated shadow, filled badge/header, primary CTA}. All four at once is a carnival; the other cards stay quiet so the featured one can sing.
- Two `featured` flags in one section is a build error, not a design choice.

## Price typography

- Amount: 3–3.75rem, semibold or heavier, `tabular-nums` — toggle flips must not shift a single pixel of layout.
- Currency symbol at 40–50% of amount size, top-aligned; cadence ("/month") ~1rem, muted, baseline-aligned.
- DOM reads as a sentence: currency, amount, cadence. If spans split it visually, `aria-label` the wrapper with the readable string ("19 dollars per month") — never let a screen reader spell digits.
- Annual context sits directly under the price, visible: "billed annually — $190/year". Not a tooltip, not a footnote.

## Billing toggle

- Segmented control — two buttons with `aria-pressed` (or styled radios), not a bare switch whose on/off maps to nothing.
- The annual segment states the deal concretely: "2 months free" or "save 20%" — whichever is literally true. Pick one framing sitewide.
- Price change crossfades 150–250ms, opacity/transform only; `tabular-nums` plus a fixed-width amount slot keeps cards from reflowing.
- Default to the period most customers actually buy — not annual just to flatter the number.
- Keyboard operable, token focus ring, selected state readable without color (weight/fill).

## Honest comparison rows

- A row earns its place only if tiers differ on it. Everything shared moves to one line above the matrix: "All plans include X, Y, and Z."
- Limits are numbers: "10 projects", "5 GB" — never "More projects" or "Enhanced support".
- Check cells: lucide `Check`/`Minus` at the system stroke width, plus visually-hidden "Included"/"Not included" text. Never ✓/✗ glyphs alone, never emoji.
- Card bullets: 4–7 per tier, left-aligned, differentiators first; upper tiers open with "Everything in <tier>, plus:".
- No fake anchoring: `line-through` prices only for a real, dated previous price.
- "Free" states its bounds ("Free forever — 3 projects"); "no card required" only if checkout is genuinely configured that way.

## States

- Toggle: default / hover / active / focus-visible per segment, plus the selected state.
- Cards: hover lift ≤4px translate, 150–250ms, transform/opacity only; featured card does NOT grow on hover (it's already emphasized).
- Under `prefers-reduced-motion`: the toggle's price change swaps instantly (no crossfade) and the hover lift is dropped — reduced-motion policy per ultraweb:motion-language.
- CTAs: the featured tier holds the section's ONLY primary button; others secondary or ghost (ultraweb:buttons). Checkout-session creation shows a loading state on the clicked CTA only; if session creation fails, an inline error with retry appears next to that CTA (ultraweb:ui-states) — never a silently dead button.
- Prices fetched from Stripe: skeleton price blocks sized to the final layout — a price popping in and shifting cards reads as a glitch on the least forgiving section of the site. If the fetch fails, render from the typed tier constant (the single source from Process step 2) — never blank cards where prices should be.

## A11y

- Tier cards as `<ul>`/`<li>`; each card's heading is the tier name at a consistent heading level.
- The matrix is a real `<table>` with `<th scope="col">` (tiers) and `<th scope="row">` (features), per ultraweb:data-display.
- "Most popular" is text inside the card — never conveyed by color or position alone.
- Toggle state is announced via `aria-pressed`; don't wrap the price grid in `aria-live` — the user triggered the change and can re-read.
- A scrolling matrix wrapper gets `tabindex="0"` + `role="region"` + `aria-label`.

## Anti-patterns

- two `featured` / `popular` flags true in one section
- `$Custom` or "Custom pricing" typeset as a price — write "Contact sales"
- `line-through` anchor prices with no real prior price
- a matrix row where every tier shows a check — move it to "All plans include"
- "per user/month, billed annually" revealed only on hover or after click
- ✅/❌ emoji as matrix marks
- "Contact us" on every tier of a self-serve product — hidden prices read as expensive
- 9+ bullets per card; centered multi-line feature bullets
- price digits split across spans with no `aria-label` on the wrapper

## Composes with

- ultraweb:buttons — one primary CTA per view; per-tier button hierarchy
- ultraweb:data-display — the comparison matrix inherits its table, alignment, and `tabular-nums` rules
- ultraweb:copywriting — tier names, feature phrasing, and discount wording in the brief's voice
- ultraweb:payments — Stripe products/prices mirror the tier constant 1:1; drift between page and checkout is a trust breach
- ultraweb:ui-states — loading and error design for Stripe-fetched prices and checkout-session CTAs
- ultraweb:faq — pricing objections (refunds, cancellation, limits) belong in an FAQ directly below the tiers
- ultraweb:micro-interactions — toggle crossfade and card hover timing
