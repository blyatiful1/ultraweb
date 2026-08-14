## Worked example — Tidepool, port-logistics SaaS boundary plan

design/SITEMAP.md part 2 lists six routes (`/`, `/product`, `/pricing`, `/docs`, `/changelog`, `/login`) and the hero's signature: a live berth timeline that streams updates.

The boundary plan (SITEMAP.md part 3) keeps every layout and page server; client leaves stay in the low teens:
- `components/hero/berth-timeline.tsx` (`"use client"`) — polls `/api/v1/berths` and animates the timeline; the RSC renders the static SVG fallback and passes the seed as a serializable prop, so first paint needs no JS.
- `components/pricing/billing-toggle.tsx` — monthly/annual lives in the URL (`?billing=annual`, awaited from `searchParams`), not `useState`, so a shared link lands on the annual view with Growth ($490/mo) still featured.
- `app/login/_components/login-form.tsx` (`"use client"`) — `useActionState` over a `'use server'` Better Auth sign-in action; no handler crosses the boundary.
- `components/layout/focus-on-navigate.tsx` (`"use client"`) — a `usePathname()` effect mounted once in the root layout; after a nav click from `/` to `/pricing` it moves focus to that page's `<h1 id="main-heading" tabIndex={-1}>` so a keyboard user isn't stranded on the old header link. The skip-first-mount guard keeps a deep-linked `/docs#webhooks` hash target focused.
- Theme: next-themes `defaultTheme="dark"` — the only context in the root layout (Precision Instrument is dark-first).

Rejected: making `app/pricing/page.tsx` a client component to own the toggle — it would drag the whole tier table into the bundle for one query param. The URL carries the state instead.

Handoff: SITEMAP.md part 3 is the contract ultraweb:navigation (header client leaf) and ultraweb:server-actions (the login action) build against; ultraweb:gate-performance later greps the tree against the low-teens count.
