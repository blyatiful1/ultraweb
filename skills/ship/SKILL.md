---
name: ship
description: Production-readiness pass and deploy for a finished ultraweb site — audit env vars (.env.example complete, no secret in any tracked file, no secret behind NEXT_PUBLIC_), prove the production server with npm run build + npm run start and route-by-route fetches, deploy to Vercel ONLY when the user asked and after an explicit confirmation, then verify the live URL empirically (fetch every route, screenshot the homepage). Invoke in Phase 12 of the ultraweb pipeline once design/QA.md shows every gate green, or whenever the user says "ship it", "deploy", "go live", "push to production", or "is this ready for prod". A red gate blocks this skill; it never overrides Phase 11.
---

# ship — prove it, then go live

**Stage:** Phase 12 — Ship - **Reads:** design/QA.md (all gates green), design/SITEMAP.md, .env.example, .env.local, repo - **Writes:** verified production build, Vercel deployment (only when asked), design/QA.md ship entry

## Standard

Shipped means three proven facts, not a feeling: (1) every env var the code reads is accounted for in .env.example and no secret exists in any tracked file, (2) the PRODUCTION server — `npm run start`, not dev — returned 200 for every route this session with zero errors in its output, (3) if deployed, the live URL was fetched and screenshotted, not assumed. Deploy is an outward-facing action: it happens only when the user asked for it, and only after one explicit confirmation immediately before the command. A red or missing gate in design/QA.md stops this skill on line one.

## Process

1. **Gate check.** Read design/QA.md. Any gate red or absent → stop, name it, hand back to Phase 11. No "it's just the perf gate".
2. **Enumerate env usage:** `git grep -nE "process\.env\.[A-Z0-9_]+" -- '*.ts' '*.tsx'` → the canonical key list; also check bracket-notation access (`process.env["KEY"]`). This list drives steps 3–5 and 8.
3. **.env.example completeness.** Every key from step 2 present with a placeholder value and a one-line comment saying where the real value comes from:

```bash
# .env.example — every key the code reads; placeholders only, never real values
DATABASE_URL=postgresql://user:password@host:5432/db   # Neon dashboard → connection string
BETTER_AUTH_SECRET=generate-with-openssl-rand-base64-32
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx                     # resend.com → API keys
STRIPE_SECRET_KEY=sk_test_xxxxxxxx                     # Stripe dashboard → developers
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxx                   # per endpoint — dev and prod DIFFER
NEXT_PUBLIC_SITE_URL=https://example.com               # public: shipped to the browser
```

   Key in code but not in .env.example → fail, add it. Key in .env.local but never read → delete or justify.
4. **Secret scan of tracked files:** `git grep -nE "sk_live_|sk_test_|whsec_|re_[A-Za-z0-9]{16}|vercel_blob_rw_|-----BEGIN|://[^/@[:space:]]+:[^@[:space:]]+@" -- . ':(exclude).env.example'` must return nothing — .env.example is the only file permitted to contain pattern-shaped placeholder values, and eyeball it separately: every value there must be an obvious placeholder (all-x, CHANGEME), never a real key. Then `git check-ignore .env.local` must exit 0, and `git ls-files | grep -E "^\.env"` may list only `.env.example`. Any hit: the key is burned the moment it was committed — rotate it first, then purge the file.
5. **NEXT_PUBLIC_ review.** Every `NEXT_PUBLIC_*` value ships to the browser verbatim. Site URL, publishable/anon keys: fine. API secrets, DB URLs, webhook secrets behind that prefix: never — moving the secret server-side is the fix, not renaming it.
6. **Build-time env safety.** SDK clients must be lazy-instantiated so `npm run build` doesn't crash where a key is absent (STACK: Stripe client lazy-instantiation). A module-scope `new Stripe(process.env.STRIPE_SECRET_KEY!)` that throws at import time is a ship blocker.
7. **Production smoke test — the core of this skill.** Kill any dev server. `npm run build` → exit 0. `npm run start` → fetch every route in design/SITEMAP.md on localhost:3000 expecting 200, plus `/robots.txt` and `/sitemap.xml` → zero errors in server output → kill it. Dev green ≠ prod green: the production server surfaces missing runtime env and real caching behavior (`fetch` is not cached by default; `'use cache'` boundaries now actually run).
8. **Deploy — only when asked.** If the user never asked for deployment: report ready-to-ship status with the audit summary and stop here. If they asked: confirm once, plainly ("Deploying <project> to Vercel production — go?"), and wait for the answer. Then push EVERY key from step 2 — including `NEXT_PUBLIC_*`, which are inlined at build time and must exist in the Vercel environment (the step-5 review already guarantees no secret hides behind the public prefix) — into the Vercel project environment (dashboard, or `vercel env` — verify flags against current CLI docs first) and deploy with `npx vercel --prod` (pin the CLI — a repo-local `vercel` devDependency or `npx vercel@<pinned>` — so a floating version can't silently shift deploy behavior; or the Vercel MCP deploy tool when available).
9. **Post-deploy verification** — run the checklist below on the live URL, empirically. Never report a deploy done from the CLI's success line alone.
10. **Record.** Append the ship entry (format below) to design/QA.md.

## Post-deploy verification

Every item is a fetch or a screenshot — no item passes by assumption:

- Live root URL → 200 with the expected `<title>` in the response body
- Every route in design/SITEMAP.md → 200 (loop the fetches; one 404 fails the deploy)
- `/robots.txt` and `/sitemap.xml` → 200, sitemap entries use the production domain
- Live homepage screenshotted at 1440 and 375 via Playwright MCP, saved to design/screenshots/ship/
- OG image and canonical URLs in live HTML are absolute production URLs — `localhost` anywhere in live markup is a fail
- Zero console errors on the live homepage (Playwright MCP console read)

Then wire the outside world:

- **Stripe:** create a NEW production webhook endpoint pointing at the live `/api` route and set its own `whsec_` — the dev CLI-forwarding secret never validates production events
- **Auth:** base/callback URLs set to the production domain (verify exact Better Auth env names against current docs)
- **Resend:** sending domain verified — never ship on the shared test domain
- Exercise one env-dependent flow end to end where one exists (submit the contact form, expect the email)

## QA.md ship entry

```markdown
## Ship — <date>
- Env keys audited: <n> in code, all in .env.example, secret scan clean
- Smoke test: npm run build exit 0 · npm run start → <n>/<n> routes 200
- Deployed: <live URL> (user confirmed <date/turn>) | NOT deployed (not requested)
- Live verification: <n>/<n> routes 200, robots+sitemap OK, screenshots: <paths>
- External wiring: stripe webhook <done/n-a> · auth URLs <done/n-a> · resend domain <done/n-a>
- Rollback: previous deployment promotable from Vercel dashboard
```

## Deploy rules

- User asked ≠ user confirmed. One confirmation, immediately before the deploy command — not buried in a plan three turns ago.
- Never deploy to compensate for a failing local smoke test ("maybe it works on Vercel"). Fix locally first.
- Note the rollback path in the QA.md entry: the previous Vercel deployment remains promotable from the dashboard.
- Custom domain, DNS, analytics wiring: out of scope unless the user asks — name them as follow-ups, don't do them.

## Anti-patterns

- `sk_live_`, `whsec_`, or a credentialed URL in a tracked file — greppable, unforgivable; rotate on sight
- `NEXT_PUBLIC_STRIPE_SECRET_KEY` — a secret behind the public prefix is published to every visitor
- Deploying with a red or missing gate in design/QA.md
- `vercel --prod` without the user asking AND confirming this session
- "Shipped" claimed from `npm run build` output alone — no `npm run start`, no route fetches, no live-URL check
- `localhost:3000` in deployed HTML (OG image, canonical, sitemap entries)
- Reusing the dev `whsec_` in the production Stripe endpoint
- Real values pasted into .env.example "temporarily"
- Module-scope SDK construction that throws when the env key is missing

## Worked example — Loop & Thread, shipping the textiles shop to production

design/QA.md handed up all gates green; design/SITEMAP.md lists `/`, `/shop`, `/shop/alpine-wool-throw`, `/journal`, `/about`. Env enumeration returns exactly the eight keys the code reads, each an obvious placeholder in .env.example:

```bash
STRIPE_SECRET_KEY=sk_test_xxxxxxxx              # Stripe dashboard → developers
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxx            # prod endpoint differs from the dev CLI secret
DATABASE_URL=postgresql://user:password@host/db # Neon → connection string
BETTER_AUTH_SECRET=generate-with-openssl-rand-base64-32
BETTER_AUTH_URL=https://loopandthread.com       # Better Auth base URL — production domain
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxx       # Vercel → Storage → Blob (product photos)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx              # resend.com → API keys
NEXT_PUBLIC_SITE_URL=https://loopandthread.com  # public: shipped to the browser
```

Secret scan clean, `git check-ignore .env.local` exits 0. `npm run build` exit 0; `npm run start` then returns 200 for all five routes plus `/robots.txt` and `/sitemap.xml`, zero server errors. Only after the user answered "Deploying Loop & Thread to Vercel production — go?" do all eight keys go into the Vercel env and `npx vercel --prod` run.

Rejected: reusing the Stripe CLI-forwarding `whsec_` for production — it never validates live events, so post-deploy I create a NEW webhook endpoint at the live `/api/stripe/webhook` with its own secret.

Handoff: the ship entry lands in design/QA.md and ultraweb:handoff runs next, documenting the deploy target and the eight audited keys.

## Composes with

- ultraweb:gate-code — must be green before ship starts; step 7's build is final confirmation, not a substitute
- ultraweb:gate-performance — re-run Lighthouse against the deployed URL when real-world numbers matter
- ultraweb:seo — wrote the metadata whose live absolute URLs step 9 verifies
- ultraweb:handoff — runs immediately after; documents the deploy target and the env keys audited here
- pixel-qa (subagent) — drives the post-deploy live-URL screenshots
- stack-doctor (subagent) — receives any production build/start failure verbatim
- ultraweb:payments — owns the Stripe webhook handler that ship points a NEW production `whsec_` endpoint at during post-deploy wiring
- ultraweb:email — verified the Resend sending domain ship confirms live before exercising the order-confirmation email flow
- ultraweb:database — owns the schema/migrations behind the `DATABASE_URL` ship audits and must have run against the production database before deploy
