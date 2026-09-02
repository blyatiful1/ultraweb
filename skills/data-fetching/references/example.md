## Worked example — Tidepool, streaming the live berth timeline

design/BRIEF.md: "the hero carries a live-updating berth timeline — a static SVG must paint first, real vessel data fills in." On `/` that is a textbook block-then-stream split. The `<BerthTimelineShell>` static SVG is the LCP element — it blocks and paints instantly. Live vessel positions are per-request data (they change every poll), so they get **no cache** and stream behind a Suspense boundary whose skeleton matches the timeline's exact grid height — zero CLS on resolution:

```tsx
// app/(marketing)/page.tsx — shell paints as LCP, live rows stream in
<BerthTimelineShell />
<Suspense fallback={<BerthRowsSkeleton rows={24} />}>
  <BerthRows promise={getBerthActivity()} />   {/* async RSC, no 'use cache' */}
</Suspense>
```

Pricing and changelog are the opposite call: `getPlans()` carries `'use cache'` + `cacheLife('days')` + `cacheTag('plans')` (Starter $0 / Growth $490/mo / Fleet custom rarely move); `getChangelog()` carries `'use cache'` + `cacheLife('hours')` + `cacheTag('changelog')`, invalidated by the changelog publish action's `revalidateTag('changelog', 'hours')`. Rejected: wrapping the berth query in `cacheLife('seconds')` to "smooth database load" — a short TTL still serves a stale timeline that breaks the "live" promise, so per-request data streams uncached instead. Handoff: the query functions land in `lib/data/*` and their tags in the shared const map that **ultraweb:server-actions** reads — and because the berth stream is uncached, a berth-ingest write has nothing to revalidate here and must never touch the pricing `'plans'` tag; the skeleton is supplied by **ultraweb:ui-states**.
