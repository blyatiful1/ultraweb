---
name: data-fetching
description: The server-side data layer for a Next.js 16 site — fetch semantics (NOT cached by default anymore), the Cache Components model (the cacheComponents flag, the 'use cache' directive, cacheLife/cacheTag, revalidateTag with its cacheLife-profile second argument), streaming slow data behind Suspense with layout-true skeletons, parallel fetching with Promise.all, and when a route handler earns its place over a direct call. Invoke during the build phase when wiring any data into pages or sections, when deciding what to cache and for how long, when a page feels slow and needs streaming, or when someone reaches for useEffect/an API route to load first-party data. Trigger phrases — "fetch the data", "cache this query", "revalidate", "stale data", "stream this section", "Suspense boundary", "the page waits on the database", "loading is slow".
---

# data-fetching — cache is opt-in now

**Stage:** Phase 6 — Build (engineering) - **Reads:** design/BRIEF.md, design/SITEMAP.md - **Writes:** lib/data/* query functions, Suspense boundaries in app/, `cacheComponents` flag in next.config.ts

## Standard

- Data is fetched on the server, in the component that needs it. RSC is the data layer — no `useEffect` fetching, no round-trip through your own API for your own data.
- Every data source has a **decided** cache lifetime and tag, written down in the query function — not a hoped-for default. Next 16 caches nothing you didn't ask it to.
- Every await either blocks deliberately (fast, above-fold, LCP-critical) or streams behind Suspense with a skeleton that matches the landed layout — zero CLS on resolution.
- Independent fetches run in parallel. A waterfall is only acceptable when request B genuinely needs A's result.

## Process

1. Read `design/BRIEF.md` and `design/SITEMAP.md`. List every data source per page and mark each one **block** (fast, above-fold, LCP-critical) or **stream**.
2. Write query functions in `lib/data/*`, each with a decided `cacheLife` profile and `cacheTag` — tag names in one exported const map shared with `server-actions`. Personalized/per-request data gets no cache; it streams.
3. Place Suspense boundaries per the block/stream decision, with layout-true skeletons from `ui-states`. Boundary placement is a hierarchy decision — make it deliberately.
4. Parallelize sibling fetches with `Promise.all`; grep for consecutive awaits whose arguments don't reference each other.
5. Verify: `npm run build` — confirm the route output marks the intended static shells and dynamic holes. Trigger one mutation and confirm the tagged data actually refreshes. Load a streaming page with network throttling and confirm the fallback resolves with zero layout shift. Record the result in `design/QA.md`.

## The Next 16 caching model

- **`fetch` is NOT cached by default.** The pre-16 "fetch caches everything" mental model produces stale-data bugs in reverse: here it produces a hammered database. Cache deliberately.
- Enable Cache Components: `cacheComponents: true` at the **top level** of next.config.ts. This is also how you get PPR — `experimental.ppr` is removed.
- `'use cache'` at the top of an async function (or file/component) marks it cacheable. `cacheLife()` and `cacheTag()` come from `next/cache`; profiles: `'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'max'`.

```ts
// lib/data/projects.ts
import { cacheLife, cacheTag } from 'next/cache'
import { db } from '@/db'

export async function getProjects() {
  'use cache'
  cacheLife('hours')
  cacheTag('projects')
  return db.query.projects.findMany()
}
```

- Invalidation after a write: `revalidateTag('projects', 'hours')` — **the second argument is a cacheLife profile in Next 16**. `revalidatePath('/work')` is unchanged. Mutations live in `server-actions`; the tags live here — keep tag names in one exported const map so both sides agree.
- Lifetime heuristics: marketing/CMS content `'hours'`–`'days'`; pricing and inventory `'minutes'`; personalized or per-request data — don't cache, stream it.
- With `cacheComponents` on, uncached dynamic reads belong inside a Suspense boundary: the static shell prerenders, the dynamic hole streams. That IS the model — when the build complains about dynamic data, add the boundary or `'use cache'`, don't disable the flag.

## Streaming with Suspense

Decide per section: **block** (data resolves <~100ms and paints the LCP element) or **stream** (everything else).

```tsx
// app/(marketing)/work/[slug]/page.tsx — shell paints instantly, reviews stream in
<ProjectHero project={project} />
<Suspense fallback={<ReviewsSkeleton />}>
  <Reviews slug={slug} />   {/* async RSC that awaits its own data */}
</Suspense>
```

- `loading.tsx` is a whole-segment boundary; in-page `<Suspense>` is granular. Prefer granular on mixed-speed pages so fast content never waits for slow content.
- Skeletons come from `ui-states` and mirror real layout — same heights, same grid. A fallback that reflows on resolution reads as jank and costs CLS.
- Never nest a fast section inside a slow section's boundary — boundary placement is a hierarchy decision, make it deliberately.

## Parallel fetching

```ts
const [project, related] = await Promise.all([getProject(slug), getRelatedProjects(slug)])
```

- Sibling data → `Promise.all`. Mixed speeds → start the slow promise early, pass it (unawaited) into a Suspense-wrapped child that awaits it.
- Greppable smell: two consecutive `await` lines whose arguments don't reference each other — that's a waterfall costing a full round-trip.

## Route handlers vs direct calls

- **Default: direct call.** An RSC importing a query function is the whole architecture. Your site never `fetch()`es its own origin.
- Route handlers earn their place for exactly three jobs: external consumers (webhooks, third parties — see `api-design`), client-driven reads after load (search-as-you-type, infinite scroll), and non-HTML responses (files, feeds).
- Mutations are never GET route handlers — `server-actions` owns writes.

## Anti-patterns

- `useEffect` + `fetch(` for initial page data — greppable pair; move it into the RSC.
- `fetch('http://localhost:3000/api/` or `fetch(process.env.NEXT_PUBLIC_URL` from a server component — self-fetching; call the function.
- Assuming fetch caches (pre-16 model) — if a value must be stable and fast, it has an explicit `'use cache'` + `cacheLife`.
- Ad-hoc tag strings scattered across files — one typo silently breaks invalidation; centralize tag names.
- Sequential awaits over independent tables — waterfall.
- A spinner fallback under a content grid — skeletons match layout or CLS eats the performance budget.
- Client component taking `data` as a prop it fetched via its own API round-trip — pass server data down instead.

## Worked example — Tidepool, streaming the live berth timeline

design/BRIEF.md: "the hero carries a live-updating berth timeline — a static SVG must paint first, real vessel data fills in." On `/` that is a textbook block-then-stream split. The `<BerthTimelineShell>` static SVG is the LCP element — it blocks and paints instantly. Live vessel positions are per-request data (they change every poll), so they get **no cache** and stream behind a Suspense boundary whose skeleton matches the timeline's exact grid height — zero CLS on resolution:

```tsx
// app/(marketing)/page.tsx — shell paints as LCP, live rows stream in
<BerthTimelineShell />
<Suspense fallback={<BerthRowsSkeleton rows={24} />}>
  <BerthRows promise={getBerthActivity()} />   {/* async RSC, no 'use cache' */}
</Suspense>
```

Pricing and changelog are the opposite call: `getPlans()` carries `'use cache'` + `cacheLife('days')` + `cacheTag('plans')` (Starter $0 / Growth $490/mo / Fleet custom rarely move); `getChangelog()` is `cacheLife('hours')`. Rejected: wrapping the berth query in `cacheLife('seconds')` to "smooth database load" — a short TTL still serves a stale timeline that breaks the "live" promise, so per-request data streams uncached instead. Handoff: the query functions land in `lib/data/*` and their tags in the shared const map that **ultraweb:server-actions** reads — the cached berth-window query carries `cacheTag('berths')`, so a berth-ingest write fires `revalidateTag('berths', 'minutes')`, not the pricing `'plans'` tag; the skeleton is supplied by **ultraweb:ui-states**.

## Composes with

- **ultraweb:app-structure** — this skill decides what streams and what blocks; app-structure decides what is client at all.
- **ultraweb:database** — the Drizzle query patterns these cached functions wrap.
- **ultraweb:server-actions** — writes call `revalidateTag`/`revalidatePath` against the tags defined here.
- **ultraweb:api-design** — when a route handler genuinely earns its place, its shape lives there.
- **ultraweb:ui-states** — every Suspense fallback, empty, and error surface is designed there.
- **ultraweb:gate-performance** — verifies streaming actually protects LCP and that fallbacks land with zero CLS.
- **ultraweb:content-cms** — the typed MDX/content-collection queries (docs, changelog) this skill wraps in `'use cache'` + `cacheLife`; content-cms owns how that content is loaded, this skill decides its lifetime and tag.
