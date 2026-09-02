## Composes with

- **ultraweb:app-structure** — this skill decides what streams and what blocks; app-structure decides what is client at all.
- **ultraweb:database** — the Drizzle query patterns these cached functions wrap.
- **ultraweb:server-actions** — writes call `revalidateTag`/`revalidatePath` against the tags defined here.
- **ultraweb:api-design** — when a route handler genuinely earns its place, its shape lives there.
- **ultraweb:ui-states** — every Suspense fallback, empty, and error surface is designed there.
- **ultraweb:gate-performance** — verifies streaming actually protects LCP and that fallbacks land with zero CLS.
- **ultraweb:content-cms** — the typed MDX/content-collection queries (docs, changelog) this skill wraps in `'use cache'` + `cacheLife`; content-cms owns how that content is loaded, this skill decides its lifetime and tag.
