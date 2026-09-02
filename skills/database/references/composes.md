## Composes with

- **ultraweb:auth** — Better Auth's Drizzle adapter and CLI-generated tables live in this schema
- **ultraweb:server-actions** — mutations call the Drizzle layer here, then revalidate
- **ultraweb:api-design** — route handlers consume the query layer, never inline SQL
- **ultraweb:data-fetching** — caching and streaming semantics for the queries this skill writes
- **ultraweb:ship** — DATABASE_URL joins the env audit; migrations run before first deploy
- **ultraweb:brief** — BRIEF.md's §Backend noun list and brand voice are the source this schema's tables and seed rows are derived from
- **ultraweb:payments** — the orders/subscriptions tables plus the processed-event ledger defined here are what the Stripe webhook writes and marks idempotent
- **ultraweb:storage** — the file/image record table lives in this schema; storage writes the row that keeps the blob key and its DB row consistent
