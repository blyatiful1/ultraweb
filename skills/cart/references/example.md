## Worked example — Kaffeewerk Ost, the cart for a Berlin roastery

design/BRIEF.md: Warm Organic e-commerce shop + `/abo` subscriptions; free shipping over 39 € is real; signature = the roast-profile temperature curve.

Slide-over drawer is the default — buying a second bag shouldn't cost the collection page. Add-to-cart on `/shop/[slug]` is `<form action={addToCart}>`; with JS the count bumps optimistically and the drawer peeks open on warm cream `oklch(0.97 0.01 85)`, without JS it posts and lands on `/cart`. Line items: a 4/5 bag thumbnail, name → PDP, grind + 250/1000 g as muted Karla meta, `−`/`+` steppers, line subtotal in `tabular-nums`. Totals are computed server-side from `lib/prices.ts` — the same allowlist `ultraweb:payments` charges from — shown gross with "inkl. MwSt., zzgl. Versand" beneath the total.

The signature move lands here: the free-shipping progress isn't a plain bar but the roast-curve motif filling toward first crack — "Noch 6,50 € bis zum kostenlosen Versand," flipping to "Kostenloser Versand freigeschaltet" at 39 €. One cross-sell slot: the current featured single-origin as a single line-shaped card ("Passt dazu: Äthiopien Yirgacheffe"), never a grid. Empty drawer: "Noch nichts im Korb — der Hausröst wartet" + one CTA to the bestseller.

Rejected: a "Kunden kauften auch" carousel of six tiles — one honest pick converts and the rest is noise in the least forgiving spot on the site. Also rejected: summing the total from the tiles' `data-price` — `/abo` subscription lines price differently, and only the server (and Stripe) computes the charged amount.

Handoff: drawer, line items, and the empty state land in `components/cart/*`, the three mutations in `app/actions/cart.ts`; `ultraweb:overlays` owns the drawer scrim and focus trap, `ultraweb:product-detail` owns the add button that opens this, and `ultraweb:payments` takes the cart to a Checkout Session from the same price allowlist so the previewed total and the charged total can't drift.
