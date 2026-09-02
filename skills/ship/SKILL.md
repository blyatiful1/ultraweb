---
name: ship
description: Production-readiness pass and deploy for a finished ultraweb site — audit env vars (.env.example complete, no secret in any tracked file, no secret behind NEXT_PUBLIC_), prove the production server (a fresh npm run build + npm run start, or the still-valid server of record from Phase 11) with route-by-route fetches, deploy to Vercel ONLY when the user asked and after an explicit confirmation, then verify the live URL empirically (fetch every route, screenshot the homepage). Invoke in Phase 12 of the ultraweb pipeline once design/QA.md shows no FAIL (UNVERIFIED entries ride into the named-risk deploy confirmation), or whenever the user says "ship it", "deploy", "go live", "push to production", or "is this ready for prod". A red gate blocks this skill; it never overrides Phase 11.
---

# ship — prove it, then go live

**Stage:** Phase 12 — Ship - **Reads:** design/QA.md (no FAIL; UNVERIFIED listed for step 8), design/SITEMAP.md, .env.example, .env.local, repo - **Writes:** verified production build, Vercel deployment (only when asked), design/QA.md ship entry

## Standard

Shipped means three proven facts, not a feeling: (1) every env var the code reads is accounted for in .env.example and no secret exists in any tracked file, (2) the PRODUCTION server — `npm run start`, not dev — returned 200 for every route this session with zero errors in its output, (3) if deployed, the live URL was fetched and screenshotted, not assumed. Deploy is an outward-facing action: it happens only when the user asked for it, and only after one explicit confirmation immediately before the command. A red or missing gate in design/QA.md stops this skill on line one.

## Process

1. **Gate check.** Read design/QA.md — the gate entries AND the Lead's `## <gate> — rulings (<date>)` blocks, which are where the judgment items each gate left open were actually decided. Any gate red or absent → stop, name it, hand back to Phase 11. A gate standing at `PASS-ON-MEASURED` with no rulings block is unruled, not passed — the taste, voice, and legal-scoping items are still open — so refuse it exactly like a FAIL until the Lead rules and the block exists. No "it's just the perf gate". UNVERIFIED is a third state with a hard boundary: only checks a missing tool made genuinely impossible (no browser → the screenshot halves) may carry it — a failed build, a secret hit, fabricated proof, a missing production env var, a red accessibility finding, or a failed route is FAIL and is never rebadged UNVERIFIED. With UNVERIFIED entries present, preview and handoff may proceed; production deploy continues only through the named-risk confirmation in step 8.
2. **Enumerate env usage:** `grep -rnE "process\.env\.[A-Z0-9_]+" app components lib emails content --include='*.ts' --include='*.tsx'` → the canonical key list; also check bracket-notation access (`process.env["KEY"]`). Working-tree grep, NOT `git grep` — `git grep` sees only tracked files, and on a tree with uncommitted work it scans the boilerplate and returns a clean lie. This list drives steps 3–5 and 8.
3. **.env.example completeness.** Every key from step 2 present with a placeholder value and a one-line comment saying where the real value comes from:

```bash
# .env.example — every key the code reads; placeholders only, never real values
DATABASE_URL=postgresql://user:password@host:5432/db   # Neon dashboard → connection string
BETTER_AUTH_SECRET=generate-with-openssl-rand-base64-32
BETTER_AUTH_URL=https://example.com                    # Better Auth base URL — production domain
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx                     # resend.com → API keys
STRIPE_SECRET_KEY=sk_test_xxxxxxxx                     # Stripe dashboard → developers
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxx                   # per endpoint — dev and prod DIFFER
NEXT_PUBLIC_SITE_URL=https://example.com               # public: shipped to the browser
# ...plus whatever feature keys the brief pulled in — e.g. BLOB_READ_WRITE_TOKEN when storage ships uploads
```

   Key in code but not in .env.example → fail, add it. Key in .env.local but never read → delete or justify.
4. **Secret scan.** Precondition: `git rev-parse --git-dir` succeeds AND `git status --porcelain` is empty — the pipeline's phase-boundary commits make this true; an uncommitted or repo-less tree FAILS this step rather than passing it, because every `git`-based check below is meaningless without a committed tree. Primary sweep on the working tree: `grep -rnE "sk_live_|sk_test_|whsec_|re_[A-Za-z0-9]{16}|vercel_blob_rw_|-----BEGIN|://[^/@[:space:]]+:[^@[:space:]]+@" . --exclude-dir=node_modules --exclude-dir=.next --exclude=.env.example --exclude=.env.local` must return nothing; run `git grep` with the same pattern as an additional tracked-file pass. `.env.example` is the only file permitted pattern-shaped placeholder values — eyeball it separately: every value must be an obvious placeholder (all-x, CHANGEME), never a real key. Then `git check-ignore .env.local` must exit 0, and `git ls-files | grep -E "^\.env"` may list only `.env.example`. Any hit: the key is burned the moment it was committed — rotate it first, then purge the file.
5. **NEXT_PUBLIC_ review.** Every `NEXT_PUBLIC_*` value ships to the browser verbatim. Site URL, publishable/anon keys: fine. API secrets, DB URLs, webhook secrets behind that prefix: never — moving the secret server-side is the fix, not renaming it.
6. **Build-time env safety.** SDK clients must be lazy-instantiated so `npm run build` doesn't crash where a key is absent (STACK: Stripe client lazy-instantiation). A module-scope `new Stripe(process.env.STRIPE_SECRET_KEY!)` that throws at import time is a ship blocker.
7. **Production smoke test — the core of this skill.** Reuse the production server of record when it is still up on `:3100` (PID, port and build exit code in PROGRESS.md §Now) and **no source, config, token, or dependency change has landed since the build that started it** — that server serves the build of record, not the working tree, so on an unchanged tree it IS a production build already proven and rebuilding buys nothing; any such change since, and the reuse is illegal, however green the port looks. Changed, or the port is dead → kill any dev server and build and start one as below. Either way the ship entry records which of the two paths this smoke test took. The greppable half of this step is executable: with the ultraweb plugin available, `node <plugin>/scripts/site-check.mjs .` runs the deployment-mode, proof, material-claims, secret, NEXT_PUBLIC_, env-example, and anti-slop checks as one mutation-tested pre-pass — run it first, then the steps below remain the authority for anything it can't see. First the honesty greps, over the production input set — the repo root, minus `.git`/`node_modules`/`.next` (rg's gitignore-awareness handles those), minus `design/` and any test/fixture trees:

   These three fire on a `Deployment mode: production` brief — and on any staging/demo brief the moment it is being switched to production (brief's rule: the switch re-triggers them):

   - `rg -n "UNVERIFIED-PROOF" . -g '!design/**'` → zero hits; a labeled sample testimonial is a staging artifact, and shipping one to production publishes fabricated social proof under the client's name — a blocker on the same tier as a leaked secret.
   - Proof store: every record in the canonical proof data (`social-proof`'s model) carries `status: "verified"` AND `permission: "confirmed"` — a record missing either field fails closed; rejecting non-conforming records in the store is provable, guessing which data "got bundled" is not. site-check machine-checks stores under `data/`/`content/`; a CMS-backed store it skips by name is verified by hand here.
   - `rg -n "material, unconfirmed" design/BRIEF.md` → zero hits; an unconfirmed material claim (hours, prices, guarantees, credentials) is invented truth, and production waits until the user confirms or corrects it.

   Then, unless the server of record is being reused, `npm run build` → exit 0 and `npm run start`. Either way, fetch every route in design/SITEMAP.md on the production server — `localhost:3100` when reusing, `localhost:3000` when you started one — expecting 200, plus `/robots.txt` and `/sitemap.xml` — and `/studio` expecting **404** (the construction-site route must be dead in production; a 200 here is a ship blocker) → zero errors in server output → kill it only if you started it; the server of record is the Lead's and Phase 11 may still need it. Dev green ≠ prod green: the production server surfaces missing runtime env and real caching behavior (`fetch` is not cached by default; `'use cache'` boundaries now actually run).
8. **Deploy — only when asked.** If the user never asked for deployment: report ready-to-ship status with the audit summary and stop here. If they asked: confirm once, plainly ("Deploying <project> to Vercel production — go?"), and wait for the answer. When QA.md carries UNVERIFIED entries, the SAME prompt must name them: "Deploy <project> to production despite these named unverified checks: <list>?" — a generic "ship anyway" never authorizes risks that were not named, and the exact accepted list is recorded in the QA.md ship entry. Then push EVERY key from step 2 — including `NEXT_PUBLIC_*`, which are inlined at build time and must exist in the Vercel environment (the step-5 review already guarantees no secret hides behind the public prefix) — into the Vercel project environment (dashboard, or `vercel env` — verify flags against current CLI docs first) and deploy with a PINNED CLI — `npx vercel@56 --prod` (verify the current major with `npm view vercel version` at ship time) — never floating `npx vercel`, so an upstream release can't silently shift deploy behavior; or the Vercel MCP deploy tool when available.
9. **Post-deploy verification** — run the checklist below on the live URL, empirically. Never report a deploy done from the CLI's success line alone.
10. **Record.** Append the ship entry (format below) to design/QA.md per the ledger rule: an Edit anchored on the file's last line when QA.md is already in this context, a `>>` heredoc when it is not (a fresh session, a resume, a file the runner wrote). Never rewrite the file, never Read it back to find an anchor. Anything ship adds to design/REVIEWS.md — a named-risk acceptance, a deploy confirmation — is appended the same way.

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
- Smoke test: <npm run build exit 0 · npm run start | reused production server of record :3100 (qa/build.log exit 0)> → <n>/<n> routes 200
- Deployed: <live URL> (user confirmed <date/turn>) | NOT deployed (not requested)
- Accepted unverified risks: <the named list from the deploy prompt | none>
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
- Reading a `PASS-ON-MEASURED` row as a pass when no rulings block follows it — the judgment items were never decided
- `vercel --prod` without the user asking AND confirming this session
- "Shipped" claimed from `npm run build` output alone — no `npm run start`, no route fetches, no live-URL check
- `localhost:3000` in deployed HTML (OG image, canonical, sitemap entries)
- Reusing the dev `whsec_` in the production Stripe endpoint
- Real values pasted into .env.example "temporarily"
- An `UNVERIFIED-PROOF` sample quote reaching production — demo proof is staging-only; deploying it publishes a fabricated endorsement
- Module-scope SDK construction that throws when the env key is missing

## Worked example — Loop & Thread, shipping the textiles shop to production

Moved to `references/example.md` — read only when this build's case is genuinely ambiguous; the sections above are the decision material.

## Composes with

Moved to `references/composes.md` — the handoff map; load it when orchestrating this skill against its neighbors.
