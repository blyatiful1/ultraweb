## Composes with

- ultraweb:preview — the non-production sibling: throwaway review URLs at CP4/CP6 with only the build + secret-scan preconditions; production (`--prod`) stays exclusively here, behind green gates and the explicit confirmation
- ultraweb:studio — step 7 verifies its route 404s in production; the dev-only gate is load-bearing
- ultraweb:gate-code — must be green before ship starts; step 7's build is final confirmation, not a substitute
- ultraweb:gate-performance — re-run Lighthouse against the deployed URL when real-world numbers matter
- ultraweb:seo — wrote the metadata whose live absolute URLs step 9 verifies
- ultraweb:handoff — runs immediately after; documents the deploy target and the env keys audited here
- pixel-qa (subagent) — drives the post-deploy live-URL screenshots
- stack-doctor (subagent) — receives any production build/start failure verbatim
- ultraweb:payments — owns the Stripe webhook handler that ship points a NEW production `whsec_` endpoint at during post-deploy wiring
- ultraweb:email — verified the Resend sending domain ship confirms live before exercising the order-confirmation email flow
- ultraweb:database — owns the schema/migrations behind the `DATABASE_URL` ship audits and must have run against the production database before deploy
