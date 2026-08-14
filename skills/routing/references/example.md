## Worked example — Tidepool, port-logistics analytics route tree

`design/SITEMAP.md`: marketing pages `/`, `/product`, `/pricing`, `/changelog`; a docs tree at
`/docs`; `/login` as the door to the gated app shell. `design/SYSTEM.md` fixes General Sans (display) +
JetBrains Mono (numerals) on dark surface `oklch(0.18 0.015 250)`.

Grouped by shared layout, not by taxonomy:

```
app/
  (marketing)/layout.tsx         ← header + footer chrome
    page.tsx  product/  pricing/  changelog/
  (docs)/layout.tsx              ← sidebar shell, independent scroll
    docs/[[...slug]]/page.tsx     ← docs depth genuinely varies → catch-all earns its place
  (auth)/login/page.tsx          ← chromeless; Better Auth email + SSO
  api/v1/                        ← route handlers, no page chrome
  layout.tsx                     ← root: speculationrules block, moderate eagerness, excludes /login + the gated shell + /api
  global-not-found.tsx           ← dark 404 carrying the berth-timeline motif, own <html>
  global-error.tsx               ← 'use client'; the 500 in the same dark surface + motif, own <html>/<body>
```

`docs/[[...slug]]/page.tsx` does `const { slug } = await params`, then `notFound()` on an unknown path.
The root layout's `speculationrules` block prerenders across the marketing + docs surface on `moderate`
eagerness but excludes `/login` and the gated app, so a hover never trips Better Auth or holds a session.
The 404 and 500 both wear the berth-timeline motif — the accidental page gets the hero's craft, not the
default string. Rejected a single flat `/docs` with client-side routing — it breaks deep links and
refresh, the two things doc readers depend on. Route protection sits in `proxy.ts` (not `middleware.ts`),
redirecting unauthenticated app-shell hits to `/login`.

Tree lands as `app/` directories; **ultraweb:app-structure** draws the RSC/client boundary inside each
segment next, and **ultraweb:seo** attaches `generateMetadata` awaiting these same params.
