## Composes with

- **ultraweb:server-actions** — the default for internal mutations; this skill covers what actions can't
- **ultraweb:auth** — session checks inside handlers, 401/403 semantics
- **ultraweb:database** — handlers call the Drizzle query layer, never inline SQL
- **ultraweb:payments** — the Stripe webhook is a route handler with its own raw-body + signature rules
- **ultraweb:data-fetching** — RSC reads skip HTTP entirely; consult before adding any GET endpoint
- **ultraweb:brief** — its §Backend: needs list names every endpoint this skill builds; step 1 reads BRIEF.md and anything not traced there is cut
- **ultraweb:storage** — its upload token/presign route is a route handler that borrows this skill's error envelope and status-code discipline
