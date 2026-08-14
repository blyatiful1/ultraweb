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
