## Worked example — Tidepool, port-logistics SaaS marketing site

design/BRIEF.md: "B2B analytics for container-terminal ops managers; primary conversion is self-serve Start free (Starter $0), Growth $490/mo is the tier we push, Fleet is custom (talk to sales)."

The one-pager test fails — two conversion modes plus a real docs collection — so the page budget lands on the SaaS-with-pricing row: six routes, each with one job.

| Page | Route | Conversion goal |
|---|---|---|
| Home | `/` | Start free |
| Product | `/product` | Start free |
| Pricing | `/pricing` | Start free (Fleet → Talk to sales exit) |
| Docs | `/docs` | Read next |
| Changelog | `/changelog` | Subscribe to launch notes |
| Login | `/login` | Sign in — Better Auth email + SSO |

Nav, ordered by visitor priority not org chart: Product · Pricing · Docs · Changelog, plus one CTA "Start free" → `/login`. Active-state: exact-match on `/`, prefix-match on `/docs/*`. Route group `(marketing)` wraps the five marketing pages; `/login` sits outside it as the app-shell entry, and the `/api/v1/*` handlers are not pages — they never enter the sitemap.

Legal: the brief names no DACH market, so the jurisdiction lookup yields `/privacy` + `/terms` only — had Tidepool been the Hamburg entity selling into Germany, `/impressum` + `/datenschutz` would join the list as mandatory, not optional.

Rejected: a `/contact` page for the Fleet "Talk to sales" exit — a product-led SaaS routes enterprise interest to a scheduler CTA on /pricing, not a form page nobody would link to; adding it would have been the reflex 5-pager instinct dressed up.

Handoff: this writes `design/SITEMAP.md` part 1 (pages, routes, nav); ultraweb:wireframe appends part 2 section blueprints, and ultraweb:navigation reads the Product · Pricing · Docs · Changelog order and the single "Start free" CTA verbatim.
