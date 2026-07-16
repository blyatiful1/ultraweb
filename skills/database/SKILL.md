---
name: database
description: Build the data layer with Drizzle ORM + Neon Postgres exactly per the locked stack — schema derived from the brief's nouns, drizzle-orm/neon-http client wiring, drizzle.config.ts with dialect postgresql, the generate/migrate/push workflow, the deliberate 0.45-vs-1.0-rc version pin, an on-brand seed script, and direct query patterns inside React Server Components. Invoke during the backend phase whenever the brief needs persistent data (accounts, listings, orders, saved content) or the user says "database", "schema", "Drizzle", "Postgres", "Neon", "migration", or "store this".
---

# database — the brief's nouns, typed

**Stage:** Phase 7 (Backend) - **Reads:** design/BRIEF.md, design/SITEMAP.md - **Writes:** db/schema.ts, db/index.ts, db/seed.ts, drizzle.config.ts, drizzle/ migrations

## Standard

The schema reads like the brief: every table a noun from BRIEF.md, every column earning its place, relations explicit, timestamps everywhere. Queries run directly in server components or a thin `db/queries.ts` — never behind a fetch to your own API. The database rebuilds from the repo alone: `drizzle-kit migrate` + seed, and the site looks inhabited, not test-data-empty.

## Process

1. Extract the nouns. "A course platform with instructors and reviews" → `users`, `courses`, `enrollments`, `reviews`. Zero persistent nouns → stop; a brochure site gets no database.
2. Install: `npm i drizzle-orm @neondatabase/serverless` and `npm i -D drizzle-kit`. **Pin deliberately:** npm `latest` is drizzle-orm 0.45.x while the official docs install `@rc` (1.0.0-rc). Choose 0.45.x for the stable line or the rc to match current docs — record the choice and reason in BRIEF.md's backend section, and pin drizzle-orm and drizzle-kit from the same line, never mixed.
3. Wire client and config (exact shapes below). `DATABASE_URL` from the Neon dashboard connection string into `.env`.
4. Write `db/schema.ts`: one `pgTable` per noun, relations, an index on every column you filter or join by.
5. Iterate with `npx drizzle-kit push` (schema straight to DB, no files) ONLY while the data is disposable. The moment data matters — and always before first deploy — switch to `npx drizzle-kit generate` (emits SQL) + `npx drizzle-kit migrate` (applies it), and commit `drizzle/`.
6. Write and run `db/seed.ts`. Verify with a real query (`db.query.<table>.findMany()`) before building UI on top.

## Locked wiring

```ts
// db/index.ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export const db = drizzle({ client: neon(process.env.DATABASE_URL!), schema });
```

```ts
// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql", // mandatory — config fails without it
  dbCredentials: { url: process.env.DATABASE_URL! },
});
```

Commands are `drizzle-kit generate` / `migrate` / `push` — the old `generate:pg` variants are dead. The neon-http driver is stateless one-shot HTTP: ideal for serverless/RSC reads and single-statement writes; for interactive multi-statement transactions verify the websocket driver against current docs first.

## Schema rules

```ts
import { pgTable, text, integer, boolean, timestamp, uuid, index } from "drizzle-orm/pg-core";

export const courses = pgTable("courses", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  priceCents: integer("price_cents").notNull().default(0),
  published: boolean("published").notNull().default(false),
  authorId: text("author_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
}, (t) => [index("courses_author_idx").on(t.authorId)]);
```

- Money is integer cents. Never float.
- `text` over `varchar(n)` — Postgres treats them identically; length limits live in zod at the boundary, not in DDL.
- Every table gets `createdAt` with `.defaultNow()`; mutable tables add `updatedAt` with `.$onUpdate()`.
- Anything routed by URL (SITEMAP.md dynamic segments) gets a unique `slug`.
- Closed value sets are `pgEnum`, not free text.
- Auth tables come from the Better Auth CLI (`ultraweb:auth`) — merge them into this schema file and migrate through this workflow: one schema, one migration history.

## RSC query patterns

```tsx
// app/courses/page.tsx — server component: no fetch, no API hop
import { db } from "@/db";

export default async function CoursesPage() {
  const courses = await db.query.courses.findMany({
    where: (c, { eq }) => eq(c.published, true),
    orderBy: (c, { desc }) => desc(c.createdAt),
    limit: 24,
  });
  // render
}
```

- Independent queries in one component go through `Promise.all` — serial awaits add a full round trip each.
- DB calls have no fetch-cache semantics; they run every request. To cache: `cacheComponents: true` in next.config, wrap the query function with `'use cache'` + `cacheTag("courses")`, then `revalidateTag("courses")` after mutations (Next 16 also accepts a cacheLife profile as second arg).
- Detail pages: `await params` before touching the slug — params are Promises in Next 16.
- An empty result is a designed state (`ultraweb:ui-states`), never a blank div.

## Seed script

```ts
// db/seed.ts — run with: npx tsx --env-file=.env db/seed.ts
import { db } from "./index";
import { courses } from "./schema";

await db.insert(courses).values([/* 8–12 rows per listed table */]);
```

Seed data is what `gate-visual` screenshots. Write it in the brief's voice: real-sounding names, plausible prices, varied lengths — one short title, one two-liner, so layouts prove they survive both. Lorem in the seed becomes lorem on the site; banned either way.

## Anti-patterns

- `from "pg"`, `new Pool(` — wrong driver; Neon serverless uses `@neondatabase/serverless`
- `drizzle(sql)` positional wiring from pre-2025 tutorials — the locked form is `drizzle({ client: neon(url) })`
- `generate:pg`, `push:pg` — dead drizzle-kit commands
- `defineConfig` without `dialect: "postgresql"` — hard error
- `drizzle-kit push` against a database whose data you keep
- `fetch("/api/` inside an RSC that owns the db — self-HTTP round trip
- `real(`, `doublePrecision(` for money
- Seed rows named "Test 1", "Foo", or lorem anything
- drizzle-orm from `latest` with drizzle-kit from `rc` (or vice versa) — one line, both packages

## Composes with

- **ultraweb:auth** — Better Auth's Drizzle adapter and CLI-generated tables live in this schema
- **ultraweb:server-actions** — mutations call the Drizzle layer here, then revalidate
- **ultraweb:api-design** — route handlers consume the query layer, never inline SQL
- **ultraweb:data-fetching** — caching and streaming semantics for the queries this skill writes
- **ultraweb:ship** — DATABASE_URL joins the env audit; migrations run before first deploy
