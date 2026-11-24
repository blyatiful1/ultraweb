# ship

Production readiness, deploy, post-deploy verification and the README the owner keeps.

Load when: the gates pass and the build is accepted (or autonomous mode reached phase 8), or the user says ship, deploy, go live, or asks for a README.

Reads: qa/gates.json, design/*.md, `.env.example`, `package.json`. Writes: a verified build, a deployment (only when asked), README.md, a ship entry in design/PROGRESS.md.

## Preconditions

- `qa/gates.json` has verdict `PASS` and the judge verdict is SHIP. A `FAIL` stops here; go back to the gates. `UNVERIFIED` (no browser, tool error) may ship only if the user names the unverified checks in the deploy confirmation.
- A failed build, secret hit, missing production env var or failed route is a blocker, never "unverified".

## Production blockers

Each blocks shipping until fixed or the user confirms.

- `rg -n "UNVERIFIED-PROOF" . -g '!design/**'` returns hits: a sample testimonial, logo, statistic or case study that is not real. Shipping it publishes fabricated proof under the client's name. Staging and demo builds may carry the tag; production may not.
- `rg -n "data-standin" .` hits: a stand-in photograph the owner has not replaced or approved (`references/imagery.md`).
- `rg -n "data-assumed" .` hits: a drafted price, hour or other fact the owner has not confirmed (`references/brief.md`).
- `rg -n "UNVERIFIED-LEGAL" .` hits: an Impressum, privacy or accessibility value the client has not supplied (`references/legal-dach.md`).
- Material claims in design/BRIEF.md still unconfirmed (hours, prices, guarantees, credentials).
- Placeholder text, `lorem`, `href="#"`, default favicon, framework-default 404.
- The secret scan below returns anything, or analytics, payment keys or auth URLs still point at test or localhost values.

## Environment audit

1. List every key the code reads from the working tree (not `git grep`, which sees only tracked files): `grep -rnE "process\.env\.[A-Z0-9_]+" app components lib emails content --include='*.ts' --include='*.tsx'`, plus bracket access `process.env["KEY"]`.
2. `.env.example` contains every key with a placeholder and a one-line comment saying where the value comes from. A key in code but not in `.env.example` fails; a key in `.env.local` never read is deleted or justified.
3. Secret scan of the working tree (exclude `node_modules`, `.next`, `.env.example`, `.env.local`): `grep -rnE "sk_live_|sk_test_|whsec_|-----BEGIN|://[^/@[:space:]]+:[^@[:space:]]+@"` plus patterns for the providers in use. Must return nothing. Rotate any key that was ever committed.
4. Every `NEXT_PUBLIC_*` value ships to the browser verbatim. Site URL and publishable keys are fine; API secrets, database URLs and webhook secrets never are (move the secret server-side, do not rename it).
5. SDK clients are constructed lazily so `next build` passes without a key.

## Production smoke test

Serve the production bundle, not the dev server: `npm run build` exits 0, then `npm run start`. Fetch every route in design/SITEMAP.md plus `/robots.txt` and `/sitemap.xml`: 200 each, no server errors. Re-run `scripts/gates.mjs` if the build changed since the last run. Production exposes missing runtime env and real caching that dev hides.

## Deploy

Deploy only when asked, and confirm once right before the command: "Deploying <project> to production: go?" An earlier request is not a confirmation. Name any accepted unverified checks in the same question and record them.

- Use the Vercel MCP server when present, otherwise the Vercel CLI (`npx vercel`, no pinned major, `--prod` for production). Never deploy to see whether a failing local build works there.
- Put every audited key into the project environment for the right target, including `NEXT_PUBLIC_*` (inlined at build time).
- Review previews: deploy without `--prod`. Vercel serves non-production deployments with a noindex header by default; confirm on the returned URL. Elsewhere add `X-Robots-Tag: noindex, nofollow` for non-production. If deployment protection blocks the reviewer, say how to get in.
- Custom domain and DNS: only if asked.

Post-deploy, on the live URL, by fetch or screenshot, not by assumption:

- Root returns 200 with the expected `<title>`; every sitemap route 200.
- `/robots.txt` and `/sitemap.xml` return 200 and use the production domain; no `localhost` anywhere in the live HTML, canonical or OG URLs.
- Screenshot the home page at 1440 and 375; read the console.
- External wiring: a new production Stripe webhook endpoint with its own `whsec_` and the three checkout events from `references/backend.md` (the CLI forwarding secret never validates production events); auth base URL and callback URLs set to the production domain; the mail domain verified; one env-dependent flow exercised end to end (submit the contact form, expect the mail).

Record in design/PROGRESS.md: date, live URL, user confirmation, accepted unverified checks, the gates run relied on, and the rollback path (the previous deployment stays promotable).

## Handoff README

The README lets the owner change a headline in five minutes and a developer restyle by editing tokens in one file. Check every path, command and version against this repo in this session. Delete the create-next-app boilerplate.

Sections:

1. One sentence: what the site is and who it serves.
2. Stack: versions read from `package.json` (exact numbers, never "latest"). List backend pieces only if built. A direction-gated dependency (animation or 3D library) gets the moment it drives on the same line, so the day that moment is cut the package leaves with it.
3. Run: `npm install`, `npm run dev`, `npm run build && npm run start`, copy `.env.example` to `.env.local`.
4. Content map: one row per user-visible surface, "what you see, which file owns the string". Build it from the components, not memory.
5. Change the look: all styling flows from the tokens in `app/globals.css`. Give three worked one-line recipes (accent color in light and dark, radius, font swap). Rule: change the token or add a variant, never hardcode a value in a component.
6. The `design/` folder, one line per artifact (BRIEF, DIRECTION, SYSTEM, SITEMAP, PROGRESS); read DIRECTION.md before any visual change. `qa/` is the last gate run's receipt and can be deleted.
7. Quality gates: `npm run build`, `npx eslint .` (`next lint` was removed), and `node <plugin>/scripts/gates.mjs --url <url>` when the plugin is installed.
8. Deployed: live URL, host, redeploy command, env keys the host needs (copied from the ship entry).
9. Don't break these: load-bearing decisions (accent rules from DIRECTION.md, dark mode decided per surface, reduced-motion paths, the consent gate if present), one deduplicated line per lesson under `## Lessons` in design/PROGRESS.md, and for demo builds every `UNVERIFIED-PROOF` sample with its file.

Before done: every named path exists, every command exits 0. No "bootstrapped with", no `tailwind.config.js` (tokens are CSS-first), no `npx shadcn-ui` (the package is `shadcn`).

Error monitoring is optional and off for a brochure site; an unwatched SDK is weight and a data liability. If added: no default PII capture, no session replay (it records the DOM and needs its own consent category, `references/legal-dach.md`), EU region for an EU audience, low trace sampling, and the README says where the DSN lives and who owns the account.
