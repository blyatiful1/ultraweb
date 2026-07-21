---
name: routing
description: Designs the app/ route tree for a Next.js 16 App Router site — route groups for layout scoping, dynamic segments with awaited params (they are Promises in Next 16), parallel routes with their mandatory default.tsx, intercepting routes for URL-addressable modals, and per-segment loading.tsx/error.tsx/not-found.tsx plus global-not-found.tsx, all designed to the design system instead of framework defaults. Invoke during the build phase when translating design/SITEMAP.md into app/ directories, when adding a dynamic or catch-all route, when a modal needs its own shareable URL, or when any 404/error/loading surface still looks default. Trigger phrases — "set up the routes", "dynamic route", "route group", "slug page", "modal with a URL", "intercepting route", "custom 404", "loading state for this page", "error page".
---

# routing — the URL tree is architecture

**Stage:** Phase 6 — Build (engineering) - **Reads:** design/SITEMAP.md, design/SYSTEM.md - **Writes:** app/ route directories, loading.tsx/error.tsx/not-found.tsx per segment, app/global-not-found.tsx

## Standard

- The route tree implements `design/SITEMAP.md` verbatim — every listed page exists, zero orphan routes. A mismatch gets fixed in the artifact first, then the code.
- URLs are clean and human: `/work/atlas-rebrand`, never `/pages/work?id=3`. Route-group parens never leak into URLs.
- Every segment that fetches data has a `loading.tsx` whose skeleton matches the real layout (zero jump when content lands). Every segment that can fail has an `error.tsx` written in the site's voice with a working recovery action.
- 404s are designed pages — headline in the display face, one line of on-brand copy, a route home — never the framework default.
- Modals that represent content (image detail, quick view, share targets) get intercepting routes so deep links, refresh, and back-button all behave.

## Process

1. Read `design/SITEMAP.md`. Group pages by the **layout they share**, not by taxonomy: `(marketing)` for header+footer pages, `(app)` for an auth-gated shell, `(auth)` for chromeless sign-in. Groups exist to scope layouts — a group with no own layout.tsx is noise.
2. Create dynamic segments for every content collection: `[slug]` for one param, `[...slug]` only when depth genuinely varies. Add `generateStaticParams` for collections known at build time.
3. For each modal-with-URL in the sitemap, build the parallel + intercepting pair (below). Verify `default.tsx` exists in every slot **before** the first build attempt.
4. Design the segment UI files: `loading.tsx` and `error.tsx` per data-bearing segment (skeletons and error surfaces come from `ui-states`), `not-found.tsx` on collection segments, `app/global-not-found.tsx` for everything unmatched.
5. Route protection lives in `proxy.ts` exporting `proxy(request)` — `middleware.ts` is deprecated in Next 16.
6. Verify: `npm run build` clean (a missing slot `default.tsx` fails here), then click every sitemap URL plus one garbage URL in the dev server.

## Dynamic segments — params is a Promise

Next 16: `params` and `searchParams` are Promises. Always `await`, in pages, layouts, AND `generateMetadata`:

```tsx
// app/(marketing)/work/[slug]/page.tsx
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = await getProject(slug)
  if (!project) notFound()   // from 'next/navigation' → renders the segment's not-found.tsx
  // ...
}
```

`generateMetadata({ params }, parent)` awaits the same promise. Missing data calls `notFound()` — never renders an empty shell.

## Parallel + intercepting routes (modals)

```
app/
  layout.tsx                    ← export default function Layout({ children, modal }) — slot arrives as a prop
  @modal/
    default.tsx                 ← return null. REQUIRED: Next 16 build FAILS without it
    (.)photo/[id]/page.tsx      ← renders as modal on soft navigation
  photo/[id]/page.tsx           ← renders as full page on hard nav / refresh / shared link
```

- Interception matchers: `(.)` same level, `(..)` one level up, `(...)` from app root.
- **Every parallel route slot requires `default.tsx`** — usually `return null`. This is the #1 build failure in this pattern.
- Dismiss with `router.back()` in a client modal wrapper; Escape and backdrop-click both call it (a11y: focus-trap the dialog, return focus on close).
- Both renderings show the same content — the modal is a presentation upgrade, not the only door.

## Segment UI files

| File | Rules |
|------|-------|
| `loading.tsx` | Auto-wraps the segment in Suspense. Skeleton mirrors the real page structure — grid stays a grid, not a centered spinner. |
| `error.tsx` | MUST be `'use client'`. Receives `{ error, reset }`. Designed message + a real button wired to `reset()`. Never expose `error.message` raw to users. |
| `not-found.tsx` | Per-segment 404, triggered by `notFound()`. On-brand copy, link back to the collection. |
| `app/global-not-found.tsx` | App-wide 404 for unmatched URLs (new in 16). Renders outside the root layout — it must supply its own `<html>`/`<body>` and import fonts/globals itself. Style it; this page gets shared in screenshots. |

## Anti-patterns

- `middleware.ts` — deprecated; greppable filename. Use `proxy.ts` (codemod: `npx @next/codemod@latest rename-middleware-to-proxy .`).
- `const { slug } = params` without `await` — params is a Promise; greppable: `params.slug` outside an awaited destructure, `{ params }: { params: {` typed as a plain object.
- A `@slot` directory with no `default.tsx` — the build fails; fix the file, don't delete the slot.
- Framework-default 404/error screens reaching production.
- Route groups named `(pages)`, `(routes)`, `(components)` — groups are layout scopes; name them for the shell they share.
- `loading.tsx` = centered spinner for a card grid — skeleton must match layout or it causes a visual double-take.
- `[...slug]` catch-all as a lazy router when SITEMAP.md names a finite page list.
- `href="#"` anywhere in nav wiring — banned by taste; every link resolves to a real segment.

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
  global-not-found.tsx           ← dark 404 carrying the berth-timeline motif, own <html>
```

`docs/[[...slug]]/page.tsx` does `const { slug } = await params`, then `notFound()` on an unknown path.
Rejected a single flat `/docs` with client-side routing — it breaks deep links and refresh, the two
things doc readers depend on. Route protection sits in `proxy.ts` (not `middleware.ts`), redirecting
unauthenticated app-shell hits to `/login`.

Tree lands as `app/` directories; **ultraweb:app-structure** draws the RSC/client boundary inside each
segment next, and **ultraweb:seo** attaches `generateMetadata` awaiting these same params.

## Composes with

- **ultraweb:sitemap** — the tree implements SITEMAP.md part 1; amend the artifact before deviating.
- **ultraweb:app-structure** — owns RSC/client boundaries and layout-vs-template choices inside the segments this skill creates.
- **ultraweb:ui-states** — designs every skeleton, error, and empty surface that loading.tsx/error.tsx/not-found.tsx render.
- **ultraweb:page-transitions** — route-level motion sits on this tree; template.tsx decisions coordinate there.
- **ultraweb:seo** — per-segment `generateMetadata` awaits the same params this skill defines.
- **ultraweb:gate-code** — the build gate catches missing slot defaults and boundary errors; run it after any tree change.
- **ultraweb:scaffold** — creates the `app/` directory and `next.config` this tree populates, and re-verifies Next 16 versions before the route files land here.
- **ultraweb:i18n** — owns the `[locale]` segment (or `/en`, `/pt` groups) this tree nests every route inside; localized `not-found` and awaited params flow back through here.
