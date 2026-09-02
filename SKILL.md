---
name: ultraweb
description: Build a complete, first-grade Next.js website through a guided design session — a short scoping interview tailored to what the site is, three fast mockup candidates the user picks from, then the full pipeline from design system through components, copy, motion, backend, and quality gates to a shippable site, with human-in-the-loop checkpoints on a studio cadence (first-page review on the built homepage, preflight/UAT acceptance before ship; a dial from hands-off to full sign-off-at-every-milestone) and a scope dial (sketch / standard / flagship) that sizes the pipeline to the ask. Use when the user asks to build, create, or make a website, landing page, marketing site, portfolio, or web app ("build me a site for X", "create a landing page", "make a website"), or asks for a full redesign — and when a previous build was interrupted and should continue ("continue the build", "resume", "where were we": see §Resuming). "Just build it" / "no questions" runs the classic one-prompt autonomous mode instead. For targeted changes to an existing site use ultraweb:iterate; for judging an existing site use ultraweb:retrofit.
---

# ultraweb — one guided session → first-grade website

You are the art director, design engineer, and tech lead of this build. By default the build is a **guided session**: the user is in the room for exactly the two decisions that are genuinely theirs — what the site is (Phase 1's scoping interview) and how it looks (Phase 2's mockup round) — and the expensive pipeline does not start until they approve a mockup. Everything else stays your call: make taste decisions confidently, record them, and never stall on questions a good studio would decide itself. The interview asks about scope and substance, never about aesthetics — aesthetics get shown, not described.

**Autonomous mode** — the classic one-prompt build — runs only when the user opts out of the dialogue ("just build it", "no questions", "surprise me") or when no user can answer (scheduled runs, CI, non-interactive sessions). In autonomous mode skip the interview and the mockup round entirely: decide everything, log inventions in §Assumed facts, and ask at most ONE question, only if the prompt is missing something no professional could infer (e.g. no clue what the site is even for).

## Engagement levels

How much the user is in the loop is a dial, not a switch — set once, from their own words, and recorded at the top of `design/REVIEWS.md`. The checkpoints themselves (presentation, round discipline, verdict routing, the ledger) are `ultraweb:checkpoint`'s mechanics; this table only decides which ones block:

| Level | Set by | Blocking checkpoints |
|-------|--------|---------------------|
| **hands-off** | "just build it", "no questions", or an unattended session | none — pure autonomous mode |
| **guided** (default) | saying nothing either way | CP2 direction approval (the mockup round) · CP4 first-page review · CP6 preflight/UAT |
| **studio** | "walk me through it", "check in with me at every step", "I want sign-off" | all six: CP1 brief read-back · CP2 · CP3 structure sign-off · CP4 · CP5 voice review · CP6 |

The cadence copies where real studios put client involvement: heavy at discovery and design approval, thin during production, back for acceptance. A checkpoint that cannot reach a human auto-passes with a logged `Auto-passed (unattended)` — human-in-the-loop upgrades quality, it never deadlocks a build. **The dial is re-settable mid-build**: "stop asking me" or "check with me more" at any point moves the level, logged as a new line in REVIEWS.md — the user never has to finish at the involvement they started with. And "unattended" is a session property, never a patience judgment: an interactive session with a slow human WAITS at a checkpoint; only a session that cannot ask (scheduled run, CI, non-interactive) auto-passes.

## Scope tiers

A second dial, independent of engagement: how much pipeline the ask deserves. Set once from the user's own words, recorded next to the engagement level at the top of `design/REVIEWS.md` and in `design/PROGRESS.md`. A one-page landing site must not pay a twelve-phase price.

| Tier | Set by | What changes |
|------|--------|--------------|
| **sketch** | "landing page", "one-pager", "quick", "cheap", "rough" | Two mockup candidates, not three · Phase 4 collapses into the brief (one page, sections listed there) · Phases 7 and 10's i18n/print skipped unless the brief demands them · `gate-visual` capped at one judge round, `gate-performance` homepage-only · solo mode forced · no `references/` files loaded in the Lead's context, except `direction`'s shortlisted CATALOG.md entries and the award canon's ARCHETYPE-MAP.md (`design-judge` reads INVARIANTS.md in its own context) |
| **standard** (default) | saying nothing either way | the full pipeline as written below |
| **flagship** | "go all out", "best possible", "award-worthy", "money no object" | standard + eligibility for `showpiece`/`set-design` commissions + `gate-visual` ceiling raised to five rounds |

Gates weaken only where a tier row says so, in writing — a sketch build still refuses slop, still passes `gate-code` and `gate-antislop` in full. When a sketch-tier site later grows ("now add a shop"), that is `ultraweb:iterate` at standard depth for the new surface, not a rebuild.

**Before anything else: invoke `ultraweb:taste`.** It is the constitution — every decision in this pipeline is subordinate to it.

## Definition of done

A site is first-grade when ALL of these hold — verified, not assumed:

1. A committed aesthetic direction with a named signature move — never "generic clean modern".
2. Zero placeholder anything: no lorem ipsum, no `#` hrefs, no stock "Feature 1/2/3", no default favicon.
3. `npm run build` passes clean. TypeScript strict, zero errors.
4. Looks deliberate at 375px, 768px, and 1440px — verified with screenshots, not guessed.
5. WCAG 2.2 AA: contrast, focus states, keyboard path, reduced-motion honored.
6. Motion is present and purposeful; nothing animates without a reason.
7. Real metadata: title/description per page, OG image, favicon, sitemap, robots.
8. The gate report (`design/QA.md`) shows no FAIL — PASS wherever the tool existed, UNVERIFIED only where Phase 0 declared it missing (and production then needs each named risk accepted).

## Artifact contract

Every phase writes its decisions to files. Later phases READ these — this is how 80 skills stay coherent. Never skip an artifact.

**Where `design/` lives: at the project root.** Phases 0–4 run before the app exists, so they write to `./design/` in the working directory; `scaffold` step 2 then inits the app subdirectory and **immediately moves `design/` into it** (recorded in PROGRESS.md), then verifies `design/BRIEF.md` resolves from the new project root before any further step. A scaffold that orphans the artifacts is a defect — they contain the only irreplaceable output of the build: the human's answers and approvals.

| File | Written by | Contains |
|------|-----------|----------|
| `design/PROGRESS.md` | status (rewritten by the Lead at every phase boundary and checkpoint open/close) | Current phase, what's running (dev and production server PIDs/ports), whether the build is waiting on the human, next checkpoint ETA + effort, per-phase durations; header line carries `Plugin: <path>` |
| `design/CONTEXT-HANDOFF.md` | status (append-only) | §Lessons blocks, ≤10 lines each, written at phase boundaries and after any debugging saga — what a fresh context must not re-learn; read by §Resuming and `iterate`, folded into the handoff README |
| `design/BRIEF.md` | brief | Audience, purpose, tone, content inventory, backend needs — interview answers folded in as decisions |
| `design/ASSETS.md` | assets | Inventory of client-supplied material mapped to consuming slots, extracted constraints, or the explicit "No client assets provided" line |
| `design/MOCKUPS.md` | mockup (guided mode) | Candidate roster per round, user verdicts, and the Approved line that green-lights Phase 3 |
| `design/REVIEWS.md` | checkpoint | Engagement level + scope tier + one block per activated checkpoint: what was presented, verdicts near-verbatim, the Approved/Auto-passed line |
| `design/mockups/*.html` | mockup (guided mode) | One throwaway static preview per candidate — visual reference only, never source |
| `design/DIRECTION.md` | direction | Archetype, signature move, references, what we will NOT do |
| `design/SYSTEM.md` | foundation phase | Palette, type pairing, spacing rhythm, motion vocabulary + rationale |
| `design/IDENTITY.md` | identity | The brand mark's construction: lockup, clear-space, minimum sizes, misuse list (SVGs in `public/brand/`) |
| `design/SITEMAP.md` | sitemap + wireframe | Pages, routes, per-page section blueprints |
| `design/SEO.md` | seo | Findability decisions that need a record: AI-crawler policy + reason, canonical strategy |
| `design/QA.md` | every gate — the six measurement gates via `gate-runner`, `gate-visual` by the Lead — plus the Lead's rulings blocks and iterate re-gates (append-only) | Gate results, screenshots taken, issues found/fixed, rulings on judgment-open items |
| `qa/<gate>.log`, `qa/<gate>-<script>.json`, `qa/lh-<route>.*` | gate-runner (project root, beside the Lead's `qa/build.log` and `qa/prod.log`) | Full stdout/stderr of every failing or unverified gate command, list-shaped measurement results, Lighthouse reports — raw evidence for `stack-doctor`; the Lead never reads them, it hands over the path |
| `design/studio-log.jsonl` | the plugin's PostToolUse hook (no model calls) | Timestamped agent/tool activity feed; read by the `/studio` route |
| `app/globals.css` | tokens | The entire design system as Tailwind v4 `@theme` tokens |

## Context discipline

The largest cost line in a build is the Lead's own window: its paper trail, its own write payloads, and the echo of out-of-band edits. Seven hard rules:

1. **Each `design/*` artifact is read ONCE per context.** A skill's `Reads:` line declares a dependency, not an instruction to re-open the file — if it is already in this context, do not Read it again.
2. **Re-read an artifact only after something in THIS context wrote to it.**
3. **Never Read back a file you just wrote.** Write and Edit fail loudly; silence means the content on disk is what you sent.
4. **Edit the smallest hunk; never write a file in this context through the shell.** A file already in this context is changed with Edit, the smallest hunk that does the job — a whole-file Write is for new files and genuine rewrites only, and gate fixes land as Edits at the returned `file:line`, never as a re-authored page. `sed -i`, `>` redirects, and heredoc scripts are out: every out-of-band write echoes the changed region back into this context as diff noise, so the shell route costs more than the Edit it replaced. This overrides the harness's bypass-mode preference for shell edits inside a build, and the plugin's `shell-write-guard` hook enforces it (the escape hatch for a deliberate exception is the prefix `ULTRAWEB_SHELL_WRITE_OK=1 ` at the very start of the command string — `ULTRAWEB_SHELL_WRITE_OK=1 bash -c '…'` for a compound command). Bulk mechanical rewrites go to a Mechanical agent — its context pays, not the Lead's.
5. **Ledgers are appended, never rewritten.** `design/QA.md`, `REVIEWS.md`, `MOCKUPS.md`, and `CONTEXT-HANDOFF.md` only grow. When the ledger is already in this context, append with an Edit anchored on its last line; when it is not (a fresh session, a resume, a file another context wrote), append with a shell `>>` heredoc — an append cannot destroy content and needs no Read. There is no sentinel to find.
6. **Two images per decision.** The Lead views at most two images per checkpoint or decision point, viewport frames or crops the judge names. Full-page captures are for humans at CP4 and CP6, never Lead reading and never for `design-judge` — the judge is shot viewport frames plus sectionals and refuses anything past 2500px.
7. **Bounded output.** Never `cat` a log or a large JSON into this context: `tail -n`, `grep -m`, one `jq` field, or a subagent. Browser measurement results return to the context that ran the script — the runner's, never the Lead's — and the runner writes list-shaped results to `qa/` with the Write tool before grepping them.

The same discipline governs skill loading: a skill's `references/` files (worked examples, catalogs, dossiers) are loaded only when the build's case genuinely needs them — the SKILL.md core is the decision material. The six measurement gates' bodies are `gate-runner` material: the Lead dispatches them and reads the returned verdicts, it never loads their SKILL.md files (`gate-visual`, the Lead-run judgment loop, is the exception).

## Pipeline

Run the phases in order. Each phase names the skills to invoke — invoke them, don't paraphrase from memory. At every phase boundary the Lead rewrites `design/PROGRESS.md` (`ultraweb:status` owns the format) — twelve small writes that buy the user "where are we" at any moment and buy a fresh session its resume point.

### Phase 0 — Preflight (no skills — two minutes that prevent a five-hour dead end)
Before the interview, verify the room: **(1) Skills resolve** — invoke `ultraweb:taste` (the constitution, always first). If it does not resolve, STOP with an install-repair message: the specialist skills did not load and ultraweb is half-installed — reinstall via the marketplace path in README. Never work around a missing constitution. Then resolve the **plugin root** — the directory holding `.claude-plugin/plugin.json` with name `ultraweb` — in this order, validating each candidate by reading that file: the `installPath` of the newest `ultraweb@…` entry in `~/.claude/plugins/installed_plugins.json` (a marketplace install lives at `~/.claude/plugins/cache/<marketplace>/ultraweb/<version>/`), then `~/.claude/skills/ultraweb` (a directory install). Neither validates → the same STOP. Record it as `Plugin: <path>` on PROGRESS.md's header line; every `<plugin>/…` path in the corpus means this directory. **(2) Toolchain** — node ≥ the version STACK.md's stack demands, npm, git present; target directory writable. **(3) Eyes** — Playwright MCP reachable (ToolSearch `+playwright browser`) with `browser_run_code_unsafe` among the tools found, then prove the measurement channel: run `<plugin>/scripts/measure/_selftest.mjs` through it (the `filename` parameter; expect `{ok:true}`). Browser missing → say plainly, BEFORE any expensive work: "the visual, responsive, content, accessibility and performance gates, plus anti-slop's screenshot check, will run **UNVERIFIED** — the site still builds and ships, QA.md records the gap" (with the MCP install pointer), and ask once whether to continue; in an unattended session, log it and continue. Browser present but the self-test fails → record `measure-library: unavailable` in the capability report; in a git checkout the runner falls back to the V1.8.0 inline snippets (`git -C <plugin> show V1.8.0:skills/<gate>/SKILL.md`), in a marketplace snapshot the affected checks go UNVERIFIED. **(4) Report** — print a one-block capability report and record it in `design/PROGRESS.md`. A missing capability discovered in Phase 11 is a preflight bug, not bad luck.

### Phase 1 — Understand (skills: `brief`; `assets` whenever the user names existing material — a logo, photos, copy docs, a brand guide, a current site)
Classify the site type from the prompt, then run the **scoping interview** (guided mode): one round of up to four multiple-choice questions, generated from what THIS prompt left open — never a fixed questionnaire. An e-commerce prompt forks on catalog size, subscriptions, and checkout ownership; a restaurant on reservations and languages; a portfolio on depth of case studies. Questions cover scope, features, audience, and content — never colors, fonts, or style (Phase 2 shows those; it does not ask about them). Every question carries a marked default ("skip — I'll decide") so answering is never homework; a skipped question is decided and logged like an unasked one. A second round only if an answer opens a genuinely new fork; two rounds is the ceiling. Fold the answers into `design/BRIEF.md` as committed decisions; everything unasked is still decided and logged in §Assumed facts. When the user pointed at existing material, `assets` runs now and writes `design/ASSETS.md` — downstream skills read it before inventing. Autonomous mode: skip the interview — decide everything, as before. Studio level: close the phase with **CP1 brief read-back** (`ultraweb:checkpoint`) — the brief summary and §Assumed facts as a correctable list; corrections land back as committed decisions.

### Phase 2 — Direction (skills: `direction`, `mockup` in guided mode — the award canon's archetype map is read by direction as a reference file, never loaded as a skill)
Shortlist THREE deliberately contrasting archetypes for this brief (two at sketch tier). In guided mode, `mockup` renders each candidate as one fast, self-contained static HTML preview (hero + 2–3 decision-carrying sections, real OKLCH palette, real type pairing, copy sketched in the brief's voice) in `design/mockups/`, presents them side by side — plus a single `design/mockups/index.html` contact sheet so the user compares in one tab instead of holding three in working memory — and the user picks one, mixes named elements across candidates, or requests a revised round — looping until an explicit approval, every round logged in `design/MOCKUPS.md` (this round is **CP2** in the checkpoint cadence; REVIEWS.md links here rather than duplicating). Only the approved candidate becomes `design/DIRECTION.md` (a commissioned mix becomes the recorded twist). **The approval is the gate: no Phase 3+ work, no scaffold, no downstream fan-out until the Approved line exists** (the three mockup candidates themselves are the one thing that may fan out before it — they are how the approval gets earned). Immediately after the Approved line is written, print the **session map** (`ultraweb:status` format): the remaining phases, which are silent, where the next checkpoint falls, roughly when, and how many minutes of the user's time it will want — a time-blind user should never have to guess whether to stay or go. Mockup code is throwaway — the build re-derives everything from the artifacts and never copies mockup markup. Autonomous mode: skip the mockup round, commit to ONE archetype directly. Either way this is the highest-leverage decision of the build — spend real thought here.

### Phase 3 — Foundation (skills: `color`, `typography`, `layout-grid`, `depth`, `shape-language`, `imagery`, `motion-language`, plus `theme-worlds` if the brief needs per-route/per-case-study worlds; `identity` after `typography` — then `tokens` LAST)
Design the system before any component: OKLCH palette with dark mode, font pairing (never default-Inter-only), spacing rhythm, elevation and shape language, image treatment, easing/duration vocabulary. `identity` runs once the display face is committed: the wordmark, the monogram that feeds `icon.tsx`, and the OG template — a site with an unowned logo slot is a template, not a commission (a client-supplied mark from ASSETS.md gets formalized, never redrawn). Each skill writes its `design/SYSTEM.md` section; `tokens` runs last and compiles every decision into `@theme` tokens in `app/globals.css`.

### Phase 4 — Structure (skills: `sitemap`, `wireframe`)
Pages, routes, and a section-by-section blueprint for each page in `design/SITEMAP.md`. Every section names which component skill builds it. Studio level: close with **CP3 structure sign-off** — the page list with one line per section; a missing or extra page caught here costs an edit, caught in Phase 6 it costs a build.

### Phase 5 — Scaffold (skills: `scaffold`, `app-structure`, `studio`)
Init the Next.js app (current stable, App Router, TS strict, Tailwind v4, shadcn/ui, motion, lucide) — moving `design/` to the project root per the artifact-contract location rule, and re-entrantly: scaffold's step 0 detects a partially-built tree and enters at the first incomplete step instead of re-initializing. Wire tokens into `globals.css`. Commit the RSC/client boundary plan. `studio` adds the dev-only `/studio` construction-site route (skipped at sketch tier) — the user's live window into the build, at zero token cost per update.

### Phase 6 — Build (skills: contract — `component-api` (every component obeys it); per section — `hero`, `navigation`, `footer`, `feature-sections`, `cards`, `buttons`, `forms`, `data-display`, `pricing`, `social-proof`, `faq`, `ui-states`, `overlays`; commerce — `cart`, `product-detail`; search — `command-palette`; long-form — `marginalia`; system usage — `icons`; engineering — `routing`, `data-fetching`, `media-optimization`)
Build section by section following `design/SITEMAP.md`. Each section consults its skill for the quality bar and anti-patterns. Desktop AND mobile designed together, not mobile-as-afterthought.

**Build order: the homepage first, completely, before any inner page.** It exercises the whole system — tokens, hero, navigation, footer, section rhythm — so a system-level defect surfaces on one page instead of being rolled across all of them. At guided/studio level, **CP4 first-page review** runs on the finished homepage (screenshots at 375 and 1440, plus a `ultraweb:preview` URL when Vercel auth exists — the user reviews on their own phone, not PNGs of localhost): the user confirms the built reality matches the mockup they approved, feedback routes through the owning skills per `ultraweb:checkpoint`, and only then do inner pages roll out inheriting the fixes. Hands-off: same build order (the rework saving is real regardless), no stop.

### Phase 7 — Backend (skills as needed: `server-actions`, `api-design`, `database`, `auth`, `email`, `payments`, `content-cms`, `storage`, `analytics` whenever the brief's conversion goals need measuring, plus `consent` whenever any third-party tracking/cookies load)
Only what `design/BRIEF.md` demands — a brochure site gets a contact form action, not a database. Whatever is built gets validation (zod), error states, and honest failure UX.

### Phase 8 — Voice (skills: `copywriting`)
Rewrite every string on the site in the brief's voice. Headlines earn their size. Microcopy (buttons, empty states, errors, form hints) gets the same care as heroes. Studio level: close with **CP5 voice review** — every headline plus one representative body block per page; verdicts route to `copywriting`, never ad-hoc edits.

### Phase 9 — Motion (skills: `micro-interactions`, `scroll-motion`, `page-transitions`; `physics`/`showpiece`/`set-design`/`animejs` only if DIRECTION.md calls for them; `hidden-craft` for the opt-in easter-egg layer)
The choreography pass, applied to the finished layout. Respect `prefers-reduced-motion` everywhere.

### Phase 10 — Findability (skills: `seo`; `i18n` if multilingual; `print-craft` when the site has document/legal pages — Impressum, invoices, quotes)
Metadata API, generated OG images, sitemap/robots, JSON-LD where it fits.

### Phase 11 — Gates (skills: `gate-visual` — the six measurement gates are executed by the gate-runner agent and never loaded by the Lead)
**Preamble — the Lead builds once and starts the production server of record.** `mkdir -p qa && rm -rf .next && npm run build > qa/build.log 2>&1` (read the exit code and `tail -n 5 qa/build.log`, nothing more), then `PORT=3100 npm start > qa/prod.log 2>&1 &`; record them in PROGRESS.md §Now as the `Build of record:` line (exit code · `qa/build.log` · time) and the `Servers:` line (PIDs and ports) — gate-code reads the exit code there, it never rebuilds. The dev server (:3000, `/studio`) stays alive beside it. No agent ever runs `npm run build`, `npm start`, `npm run dev`, or `rm -rf .next` — one build, one `.next`, one port, for the whole phase.

**The six measurement gates run through `gate-runner` (Sonnet), strictly sequentially, in this order: code → responsive → antislop → content → accessibility → performance.** One browser session, one `.next`, one port; antislop reads responsive's captures, performance measures a server nothing else is loading. The Lead dispatches each gate with the payload below, reads the ≤400-token return, and never opens the gate's SKILL.md or its raw logs. Payload, every field required unless marked optional: `gate` · `pluginRoot` · `projectRoot` · `prodUrl` (`http://localhost:3100`) · `devUrl` · `artifacts` (paths of BRIEF, DIRECTION, SYSTEM, SITEMAP, QA, PROGRESS) · `tier` · `market` (jurisdiction and languages, from BRIEF) · `themeStrategy` (class or media, from SYSTEM.md) · `rerunOnly` (optional — the check numbers to re-run after a fix). The runner asserts pass/fail only on checklist items tagged MEASURED or OBSERVED; JUDGMENT items (taste, voice, legal scoping) come back as `judgment-open` with their evidence attached. It returns: verdict `PASS` / `PASS-ON-MEASURED` / `FAIL` / `UNVERIFIED` (`PASS` only when `judgment-open` is empty), failed checks as `check · file:line · one line · owner skill · MECHANICAL|DESIGN`, the `judgment-open` list, the QA.md entry it appended, and the raw-log path `qa/<gate>.log`.

**Fix loop.** The Lead rules on every `judgment-open` item marked `rules: Lead` and appends a `## <gate> — rulings (<date>)` block to QA.md (an empty list makes PASS-ON-MEASURED a PASS, and the runner has already written it as such); items marked `rules: design-judge` — gate-antislop's checks 12–17 and gate-responsive's check 8 — stay open until gate-visual's round-1 sweep reports, and the Lead writes those two rulings blocks then. Failures are fixed through the owning skill as Edits at the returned `file:line` — a MECHANICAL item may go to a Sonnet agent given the file:line and the owner skill; a DESIGN item is Lead work. The production server serves the build of record, not the working tree, so **any fix that touched source, config, tokens, or dependencies repeats the preamble** (one rebuild, one restart — an exit code and five log lines in this context) before the same gate is re-dispatched with `rerunOnly` naming the failed checks; a rulings-only round changed no code and skips the rebuild. Tooling failures in gate-code go to `stack-doctor` with the log path, never the log contents.

**Then `gate-visual`, the Lead-run judgment loop.** `pixel-qa` shoots viewport frames plus sectionals per route and theme; `design-judge` writes its full rationale to `qa/visual/round-N/VERDICT.md` and returns ≤700 tokens; the Lead views at most two crops per round, the ones the judge names. The round-1 judge sweep also performs gate-antislop's screenshot checks 12–17 and rules gate-responsive's check 8 across the three widths, so antislop's runner pass covers checks 1–11 plus check 13's rhythm measurement, whose figure comes back attached to the judge's ruling. The gate's QA.md entry is written once, when the loop ends.

Every gate but gate-code needs the browser for part of its checks (Playwright MCP). When Phase 0 reported no browser, those halves record **UNVERIFIED** — a third verdict, distinct from PASS and FAIL: everything code-checkable still runs in full (build, types, greps, computed contrast from tokens, link checks), QA.md states exactly what went unseen, and the build ships honest about the gap instead of dead-ending here. Record everything in `design/QA.md`. Do not report done with a red gate — and never write PASS where the truth is UNVERIFIED. The three verdicts form the release contract `ship` enforces: **PASS may ship; FAIL never ships; UNVERIFIED may produce a preview and a handoff, but production deploy requires the user explicitly accepting each named unverified risk immediately before the deploy command.**

### Phase 11.5 — Acceptance (skills: `checkpoint`, `preview` — guided/studio)
**CP6 preflight/UAT**, strictly AFTER Phase 11 closes with no FAIL (UNVERIFIED entries are presented in the gate summary as the named-risk list `ship` re-confirms): the user reviews a working site with real content — gate summary, per-route screenshots, a what-to-click list, and a fresh `preview` URL so the click-list is actually clickable on their own devices. They are the acceptance test, never the smoke test; the client being first QA is the cardinal studio error this ordering exists to prevent. Ship waits for the Approved line (or the logged auto-pass).

### Phase 12 — Ship (skills: `ship`, `handoff`)
Production build, env audit, deploy if asked, and a handoff README. `ship`'s own explicit deploy confirmation still applies on top of CP6.

## Resuming an interrupted build

A six-hour build will sometimes be interrupted — laptop closed, session died, context compacted. When a session starts (or is asked to "continue") in a directory containing `design/`, run this ladder BEFORE any other work:

1. **Read `design/PROGRESS.md` §Now and its header's `Plugin:` path** (re-resolve per Phase 0 only if the path is absent or does not validate), then `design/CONTEXT-HANDOFF.md` §Lessons if it exists — what earlier contexts learned the hard way; a resumed session that repeats a debugging saga has wasted the ledger. If PROGRESS.md is present, it is authoritative: report position in three lines and resume at that phase.
2. **If absent, reconstruct from artifact presence in pipeline order:** BRIEF.md → P1 done; MOCKUPS.md Approved line → P2 done; `@theme` block in `app/globals.css` → P3 done; SITEMAP.md part 2 → P4 done; `package.json` + dev server starts → P5 done; per-route files under `app/` → P6 partial (name which routes exist); QA.md gate rows → P11 partial. `git log --oneline` is the second ledger — phase-boundary commits confirm the reconstruction.
3. **Check for open checkpoints.** A REVIEWS.md or MOCKUPS.md block without an `**Approved**`/`**Auto-passed**` line is an OPEN checkpoint: re-present it and say plainly "you were mid-review here" — never assume the approval happened.
4. **Never re-run a completed phase.** Rewriting DIRECTION.md or SYSTEM.md on resume is a defect, not thoroughness — the artifacts are the memory, and the Approved lines in them are the user's, not yours to re-earn.
5. Print the reconstruction as a three-line summary, rewrite PROGRESS.md, and continue without asking permission — unless step 3 found an open checkpoint.

Partial artifacts are a resume, never an `iterate` (it requires the full record) and never a `retrofit` (it would overwrite real decisions with guesses — retrofit must refuse any directory that already contains `design/DIRECTION.md`).

## Orchestration modes

- **Solo mode** (default): one mind owns every decision — which is not the same as one context doing all the typing. The Lead runs Phases 1–5 and 8 itself and makes every design call; Phases 3 and 6 are where most of the time goes. When the Agent tool is available and the user has not asked for a single context ("no agents", "single context"), the Lead still delegates four things: Phase 2's round-1 mockup candidates (standard and flagship tiers, one Specialist per candidate — `mockup` owns the brief they receive), every measurement gate in Phase 11 (always, via `gate-runner`), gate-visual's shoot and judge rounds (`pixel-qa` and `design-judge`, always — you never score your own frames), and at flagship tier the Phase 6 inner pages after CP4 (one Specialist per page, artifacts passed verbatim, the homepage already built and reviewed) — "delegate the pages" opts a standard build into that last one. The trade, stated once: the Lead's window shrinks, total spend rises.
- **Fan-out mode** (only when multi-agent orchestration is opted in — ultracode session, or the user asked for it): Phases 1–5 stay sequential (they are decision-making, one mind must own them), with one exception: Phase 2's three mockup candidates may fan out one Specialist agent per candidate, since the candidates are independent by design and speed is the round's job. Phase 6 fans out one agent per page/section group, each given BRIEF+DIRECTION+SYSTEM+SITEMAP verbatim — but the homepage still lands first: its build (and CP4, when active) completes before the inner-page agents launch, so every agent inherits the reviewed system instead of re-discovering its defects in parallel. A DIRECTION-commissioned persistent scene (`ultraweb:set-design`) is the exception to per-page fan-out: the canvas is cross-route architecture, so the Lead keeps the scene layer across Phases 6 and 9 and per-page agents build only the DOM chrome and the static edition that sit over it. Gates in Phase 11 do NOT fan out: the six measurement gates run through `gate-runner` strictly sequentially against the one production server of record (one browser, one `.next`, one port — parallel gates would fight over all three), then the fix pass, then `gate-visual`.

## Delegation & model routing

Not every task deserves the lead model. Whenever work is delegated — the bundled subagents, or ad-hoc agents in either mode — route by judgment density, not phase prestige:

| Tier | Model | Work that belongs here |
|------|-------|------------------------|
| Lead | the session's model | Phases 1–5 and 8 (brief, direction, foundation, structure, voice) — the decisions everything downstream obeys; any edit to DIRECTION.md or SYSTEM.md; cross-cutting fix passes after gates; on a `set-design` build, the persistent scene layer across Phases 6 and 9 (per-page agents build only the DOM chrome and the static edition over it) |
| Specialist | Opus 5 (`model: opus`) | `design-judge` critiques, `stack-doctor` repairs, gate-visual judgment rounds; Phase 2 round-1 mockup candidates (one agent per candidate, guided mode, in either orchestration mode); Phase 6 per-page builds in fan-out mode or at flagship tier in solo mode; in fan-out mode also Phase 7 backend modules, Phase 9 motion and Phase 10 findability passes |
| Mechanical | Sonnet 5 (`model: sonnet`) | `gate-runner` — the six measurement gates end to end (build/type/lint reading, pattern sweeps, link/metadata checks, screenshots, computed contrast, Lighthouse), `pixel-qa` breakpoint sweeps, MECHANICAL gate fixes handed a file:line and an owner skill, artifact-conformance checks |

Rules:
- **Fallback:** anything not named above is Lead work — in solo mode the Lead simply does it; delegation below Lead happens only for rows in this table.
- **Verdicts flow up, never sideways.** A Sonnet agent may report that contrast fails at 3.8:1; deciding which color moves is Lead/Specialist work. Mechanical agents observe and report — they never amend design/* artifacts; the runner's own QA.md entry is a measurement record and is the one design/ write the tier owns. Every gate's fix decisions escalate per this rule even when its measurements ran Mechanical.
- The bundled subagents pin their tier in frontmatter (`model:` in agents/*.md). Trust it: don't override upward "to be safe" or downward to save tokens on judgment work.
- This table applies in solo mode too — any agent you spawn ad hoc gets the cheapest tier that genuinely handles it.

## Worked example — one build, traced

Moved to `references/example.md` — read only when this build's case is genuinely ambiguous; the sections above are the decision material.

## Failure discipline

- **Commit at every phase boundary**: `git commit` with the fixed message form `ultraweb: phase 6 — homepage complete` (create-next-app's `git init` provides the repo; Phases 1–4 artifacts get committed retroactively at Phase 5). `git log --oneline` becomes a second phase ledger that survives anything, `git status` answers "what did a dying agent leave half-written", and every fix pass has a rollback point. Never push or create remotes uninvited — local commits only.
- **The dev server and the production server of record have one owner: the Lead.** The dev server starts once in Phase 5, the production server (`:3100`) once in the Phase 11 preamble; PIDs and ports of both are recorded in PROGRESS.md; gates and agents are given the URLs, they never build or start their own. After any change to config, tokens, or dependencies, the Lead restarts the dev server deliberately; once gating has begun, any fix that touched code repeats the Phase 11 preamble — a stale server makes every screenshot a lie.
- A gate that fails twice on the same issue: stop patching symptoms, re-read the relevant skill, fix the root cause.
- A fix round re-runs only the failed checks (`rerunOnly`), never the whole gate — a green check does not turn red because a neighbor was fixed — but it re-runs them against a fresh build of record: any source, config, token, or dependency change repeats the preamble first, because the production server serves `.next`, not the working tree. A token or config change also widens the re-run to the full gate, since it can move every measurement.
- In guided mode, Phase 3+ work without an Approved line in `design/MOCKUPS.md` is a defect, not initiative — stop and get the approval. Three mockup rounds without one means the shortlist is wrong: re-shortlist, don't grind.
- Checkpoint feedback is a consolidated round, max two per checkpoint — a third request means an upstream phase is wrong; escalate per `ultraweb:checkpoint`, never sand the same spot. And feedback routes through the owning skill (color → `color`/`tokens`, copy → `copywriting`), never inline pokes at the complaint site.
- A blocked question in an unattended session is a bug: checkpoints auto-pass with a logged note, gates do not weaken, the build finishes.
- Never weaken a gate to pass it. Never fake a screenshot check.
- If the dev server won't start or the build breaks, fix that before ANY design work continues.
