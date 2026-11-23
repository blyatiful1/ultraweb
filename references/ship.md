# ship

Production readiness, deploy, post-deploy verification and the README the owner keeps.

Load when: the gates pass and the user accepted the build (or autonomous mode reached phase 8), or the user says ship, deploy, go live, or asks for a README or handoff.

Reads: qa/gates.json, design/BRIEF.md, design/SITEMAP.md, design/PROGRESS.md, `.env.example`, `package.json`. Writes: a verified production build, a deployment (only when asked), README.md, a ship entry in design/PROGRESS.md.

## Preconditions

- `qa/gates.json` has verdict `PASS` and the judge verdict is SHIP. A `FAIL` stops here; go back to the gates. `UNVERIFIED` (no browser, tool error) may ship only if the user names the unverified checks in the deploy confirmation.
- A failed build, a secret hit, a missing production env var or a failed route is never "unverified"; it is a blocker.

## Production blockers

Each is a refusal to ship until fixed or confirmed by the user.

- `rg -n "UNVERIFIED-PROOF" . -g '!design/**'` returns hits: a sample testimonial, logo, statistic or case study that is not real. Shipping it publishes fabricated proof under the client's name. Staging and demo builds may carry the tag; production may not.
- `rg -n "UNVERIFIED-LEGAL" .` returns hits: an Impressum, privacy or accessibility value the client has not supplied (`references/legal-dach.md`).
- Material claims in design/BRIEF.md still marked unconfirmed (opening hours, prices, guarantees, credentials).
- Placeholder text, `lorem`, `href="#"`, default favicon, framework-default 404.
- Secrets: the scan below returns anything.
- Brief says `production` but analytics, payment keys or auth URLs still point at test or localhost values.

## Environment audit

1. List every key the code reads from the working tree (not `git grep`, which sees only tracked files): `grep -rnE "process\.env\.[A-Z0-9_]+" app components lib emails content --include='*.ts' --include='*.tsx'`, plus bracket access `process.env["KEY"]`.
2. `.env.example` contains every key with a placeholder and a one-line comment saying where the value comes from. A key in code but not in `.env.example` fails; a key in `.env.local` never read is deleted or justified.
3. Secret scan on the working tree, excluding `node_modules`, `.next`, `.env.example` and `.env.local`: `grep -rnE "sk_live_|sk_test_|whsec_|-----BEGIN|://[^/@[:space:]]+:[^@[:space:]]+@"` plus patterns for the providers in use. Must return nothing. Also scan git history if keys were ever committed, and rotate any hit.
4. Every `NEXT_PUBLIC_*` value ships to the browser verbatim. Site URL and publishable keys are fine; API secrets, database URLs and webhook secrets never are (move the secret server-side, do not rename it).
5. SDK clients are constructed lazily so `next build` passes where a key is absent.

## Production smoke test

Build and serve the production bundle, not the dev server: `npm run build` exits 0, then `npm run start`. Fetch every route in design/SITEMAP.md plus `/robots.txt` and `/sitemap.xml`; each returns 200 with no errors in the server output. Run `scripts/gates.mjs` against it if the build changed since the last gate run. Dev green is not production green: production surfaces missing runtime env and real caching behaviour.

## Deploy

Deploy only when the user asked, and ask once, right before the command: "Deploying <project> to production: go?" A request in an earlier turn is not a confirmation. If unverified checks are being accepted, name them in the same question and record the accepted list.

- Use the Vercel MCP server when present, otherwise the Vercel CLI (`npx vercel`, no pinned major, `--prod` for production). Never deploy to find out whether a failing local build works there.
- Put every key from the audit into the project's environment for the right target (production, preview), including `NEXT_PUBLIC_*`, which are inlined at build time.
- Preview deployments for review: deploy without `--prod`. Vercel serves non-production deployments with a noindex header by default; confirm on the returned URL. On another host, add an `X-Robots-Tag: noindex, nofollow` header for non-production environments. Deployment protection may block the reviewer; say how to get in.
- Custom domain and DNS are out of scope unless asked; name them as follow-ups.

Post-deploy, on the live URL, by fetch or screenshot, not by assumption:

- Root returns 200 with the expected `<title>`; every sitemap route returns 200.
- `/robots.txt` and `/sitemap.xml` return 200 and use the production domain; no `localhost` anywhere in the live HTML, canonical or OG URLs.
- Screenshot the home page at 1440 and 375 and read the console for errors.
- External wiring: a new production Stripe webhook endpoint with its own `whsec_` and the three checkout events from `references/backend.md` (the CLI forwarding secret never validates production events); auth base URL and callback URLs set to the production domain; the mail domain verified; one env-dependent flow exercised end to end (submit the contact form, expect the mail).

Record in design/PROGRESS.md: date, live URL, user confirmation, accepted unverified checks, which gates run it was based on, rollback path (the previous deployment stays promotable from the platform).

## Handoff README

The README lets the owner change a headline in five minutes and lets a developer restyle the site by editing tokens in one file. Every path, command and version in it is checked against this repo in this session. Delete the create-next-app boilerplate.

Sections:

1. One sentence: what the site is and who it serves, from the brief.
2. Stack: versions read from `package.json` (exact numbers, never "latest"). List backend pieces only if built. A direction-gated dependency (animation or 3D library) gets the moment it drives on the same line, so the day that moment is cut the package leaves with it.
3. Run: `npm install`, `npm run dev`, `npm run build && npm run start`, copy `.env.example` to `.env.local`.
4. Content map: one row per user-visible surface, "what you see, which file owns the string". Build it by opening the components, not from memory.
5. Change the look: all styling flows from the tokens in `app/globals.css`. Give three worked one-line recipes (accent color in light and dark, radius, font swap). Rule: change the token or add a variant, never hardcode a value in a component.
6. The `design/` folder, one line per artifact (BRIEF, DIRECTION, SYSTEM, SITEMAP, PROGRESS). Read DIRECTION.md before any visual change. `qa/` is the receipt of the last gate run and can be deleted.
7. Quality gates: `npm run build`, `npx eslint .` (`next lint` was removed), and `node <plugin>/scripts/gates.mjs --url <url>` when the plugin is installed.
8. Deployed: live URL, host, redeploy command, env keys the host needs (copied from the ship entry).
9. Don't break these: the load-bearing decisions (one accent color unless DIRECTION.md says otherwise, dark mode decided per surface, reduced-motion paths, the consent gate if present), and one line per lesson the build recorded under `## Lessons` in design/PROGRESS.md, deduplicated. Demo builds list every `UNVERIFIED-PROOF` sample and its file.

Verify before done: every file path named exists, every command exits 0 (cite the ship entry for the build instead of re-running). The string "bootstrapped with" must not survive. No `tailwind.config.js` mentioned (tokens are CSS-first), no `npx shadcn-ui` (the package is `shadcn`).

Error monitoring is optional and off by default for a brochure site; an unwatched SDK is weight and a data liability. If added, turn off default PII capture and session replay, choose an EU region when the audience is EU, keep trace sampling low, and write down in the README where the DSN lives and who owns the account. Replay records the DOM and needs its own consent category (`references/legal-dach.md`).
