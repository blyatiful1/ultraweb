# ultraweb

[![Claude Code plugin](https://img.shields.io/badge/Claude%20Code-plugin-D97757)](https://code.claude.com/docs/en/plugins) [![Version](https://img.shields.io/badge/version-1.8.0-4C71F0)](.claude-plugin/plugin.json) [![Skills](https://img.shields.io/badge/skills-80-2EA44F)](ROSTER.md) [![Showcase](https://img.shields.io/badge/showcase-live-2EA44F)](https://ultraweb-site.vercel.app)

*A Claude Code plugin for AI web design: a guided design session — a few sharp scoping questions, three fast mockups, your approval — then a production-grade Next.js 16 + Tailwind CSS v4 website: design system, brand mark, copywriting, motion, backend, SEO, and seven empirically verified quality gates (screenshot-judged where a browser exists, honestly marked UNVERIFIED where not). Sized by a scope dial, reviewable on your own phone, and resumable if life interrupts the build.*

## You hire a design studio. It fits in one session.

Somewhere in a nicer timeline there's a small agency that does this properly. An art director who refuses the purple gradient. A design engineer who ships tokens before components. A critic who screenshots your site at 375px and tells you the truth about it. And before any of them lift a pen, someone sits you down, asks the four questions that actually matter for *your* site, and shows you three sketches to point at. They cost forty thousand euros and they're booked until spring.

**ultraweb is that studio, as a Claude Code plugin.** 80 skills and 3 subagents that hold each other to a written constitution until something good comes out the other end — a real Next.js site, built, judged, and fixed before you ever see it. (One lead agent runs the roster sequentially by default; parallel fan-out is opt-in.)

```text
/ultraweb build me a website for a Berlin specialty coffee roastery with an online shop
```

Answer a short round of questions about scope (yours will be about subscriptions and checkout — someone else's would be about reservations or case studies), pick one of three mockups, say yes. Then leave. The build tells you — in writing, in `design/PROGRESS.md` — exactly when it will next need you and for how many minutes.

Prefer the classic fire-and-forget? Say **"just build it, no questions"** and the studio decides everything itself, logging each assumption so you can correct it afterward.

## Where it sits

v0, Lovable, and Bolt hand you a page in ninety seconds; plain Claude Code will happily improvise a site from vibes. ultraweb is for the build where that isn't enough. What sets it apart in this row: a **written taste constitution**, an **adversarial critic that screenshots the result and scores it before you see it**, and a **paper trail** (`design/*.md`) that makes every decision inspectable and every future change surgical. The trade is honest: it is slower and it burns more tokens, because verification is the product. Use a prototype tool to explore an idea; use ultraweb to ship the site you'll defend.

And it doesn't force the full price on a small ask: say "landing page" or "quick" and the **sketch tier** runs a thinner pipeline — fewer mockups, one-page structure, single-round gates — at a fraction of the cost. `standard` is the default; `flagship` unlocks the 3D/showpiece budget and a five-round visual critique.

## See it defend itself

**[ultraweb-site.vercel.app](https://ultraweb-site.vercel.app)** — built by this pipeline, from one prompt, with no human touch-ups.

The whole paper trail is public at [blyatiful1/ultraweb-site](https://github.com/blyatiful1/ultraweb-site): every decision the studio made on the way (brief → direction → system → sitemap → QA), the skill-coverage ledger from that build (58 of the 72 that existed then; the harness has since grown to 80, and that run predates the guided session — it was a classic autonomous build), and each gate's receipts. The homepage renders its own report card. If the site were bad, you'd be able to prove it from the repo.

### The build, measured

Every number below was counted from the session transcripts of that build — the lead session plus all 37 agent transcripts. Counted, not estimated.

| Measurement | Value |
|---|---|
| Wall clock | 6 h 06 min, one session (2026-07-28) |
| Contexts | 38 — one lead, 37 delegated agents (35 across 6 workflow fan-outs, 2 direct) |
| API calls | 4,753 |
| Model split | 2,063 calls on Opus 5 (specialists) · 1,612 on Sonnet 5 (mechanical sweeps) · 1,078 on the lead |
| Tokens generated | 2,780,330 |
| Fresh context written to cache | 20.2 million tokens |
| Cache reads | 733.0 million tokens |
| Total tokens processed | 756.0 million |
| Quality gates | 7 of 7 green — after three fix rounds, not on the first try |
| Lighthouse, mobile, production | 93 performance · 94 accessibility · 94 best practices · 94 SEO |
| Cumulative layout shift | 0.00 |
| Commissioned animation weight | +22.9 KB gzip measured, against a ~23 KB budget set in writing before it was built |

Read the table twice. Once as an advertisement: one prompt became a gated, documented, production site in a working day. Once as a warning: that was a full-fat `standard` build at maximum thoroughness — the bill is real, and [the honest math is below](#the-bill). Since that run, the harness has grown context discipline, progressive skill loading, and the sketch tier, all aimed at the cost side of this table.

## Getting it

**From the marketplace,** inside any Claude Code session:

```text
/plugin marketplace add blyatiful1/ultraweb
/plugin install ultraweb@ultraweb
```

Confirm the dialog, run `/reload-plugins`, done. Later: `/plugin marketplace update ultraweb`.

**Working offline or from a fork?** Clone it anywhere and add the clone as a local marketplace — same namespacing, same 80 skills:

```bash
git clone https://github.com/blyatiful1/ultraweb.git ~/src/ultraweb
```

```text
/plugin marketplace add ~/src/ultraweb
/plugin install ultraweb@ultraweb
```

(Don't clone straight into `~/.claude/skills/` — a nested skills tree loads the orchestrator without its 79 specialists, which fails quietly as vague output. The pipeline's own preflight now catches that half-install and says so, but the marketplace path is the one that just works.)

**Did it work?** `/plugin` lists ultraweb, and `/ultraweb` answers when called. The build's own Phase 0 preflight re-verifies the install, the toolchain, and Playwright before any expensive work starts.

## Using it

One sentence about what you want — then a short conversation instead of a leap of faith.

**First, the interview.** The pipeline reads your sentence, works out what kind of site it is, and asks up to four multiple-choice questions about the forks it can't safely guess — scope, features, audience, content. The questions are generated from *your* prompt, not a fixed form; every one carries a "skip — you decide" default, so answering is never homework. Never about colors or fonts — you shouldn't have to describe taste in words. **Have a logo, photos, copy, a brand guide?** Point at the folder: the `assets` skill inventories what exists and the pipeline builds *with* your brand instead of inventing one over it.

**Then, the mockups.** Three deliberately different directions, rendered fast as self-contained static HTML — real palette, real type pairing, your copy sketched in — plus a one-tab contact sheet so you compare by scrolling, not by juggling tabs. Prefer one decision at a time? Say so and it runs as a **tournament**: A against B, winner against C. You pick, mix elements ("the warm one, but with B's grid"), or send the round back. Nothing expensive happens until you say yes; your approval is written into `design/MOCKUPS.md` and is literally the gate the build waits behind. The moment you approve, you get the **session map**: which phases run next, where the next checkpoint falls, and how many minutes of your time it will want.

**Then, the build — with you in the loop where it counts.** From your approved direction: design system (including your site's own **brand mark** — wordmark, favicon, OG template, drawn from the committed typeface) → pages → scaffold → build → backend → copy → motion → findability → gates → ship. Two more checkpoints are on by default, placed where real studios place client reviews: the **first-page review** — the homepage is built completely first and shown to you at phone and desktop widths, with a throwaway **preview URL** so you check it on your actual phone, not PNGs of localhost — and **preflight/UAT** — after all seven gates are green (you're the acceptance test, never the first QA), you get the gate report, per-page screenshots, a fresh preview URL, and a what-to-click list. Every verdict is logged near-verbatim in `design/REVIEWS.md`; feedback routes through the owning skill so a color complaint fixes the token, not one component.

**While it builds, you can watch.** The dev server the pipeline already runs serves a dev-only `/studio` route: phase progress, the gate table going green, the checkpoint ledger, a contact sheet of every screenshot — live off the files the build writes, at zero token cost, and hard-wired to 404 in production. And `design/PROGRESS.md` always answers "where are we, are you waiting on me, when do you need me next" — ask "status" any time, or just read the file.

**If life interrupts the build** — laptop closed, session died — nothing is lost: the artifacts are the memory, the pipeline commits at every phase boundary, and a new session in the same directory resumes from the record, re-presenting any checkpoint you were mid-answer on. It never re-runs a phase you already paid for.

**Want more or less of that?** Both dials are yours, any time. Say *"walk me through it"* for the full studio cadence, **"just build it"** for hands-off autonomous mode (also the automatic fallback when nobody's around to answer — a checkpoint never deadlocks a build), *"stop asking me"* mid-build to move the dial down. Every phase leaves a written record in `design/*.md`, which is how 80 skills manage to agree with each other three hours later.

**Already have an ultraweb site?** Just say what's wrong — *"the hero's too timid"* — and `ultraweb:iterate` scopes the change and re-runs only the gates you actually disturbed.

**Have some other site?** `ultraweb:retrofit` is the low-cost first taste: point it at any Next.js site and it hands back a scored, unflattering gap report — no redesign, no big bill, and every gap names the skill that would fix it. Honest label: it's an audit that writes — it adds `design/RETROFIT.md`, reconstructed `design/BRIEF.md`/`DIRECTION.md` and screenshots to your repo, runs `npm install` (which can update your lockfile — commit first), and if the site won't boot it applies the minimal fix that gets pixels on screen. Nothing else changes until you approve a phase.

**Built a few sites?** The studio remembers. Mockup verdicts and review feedback accrue into a **taste fingerprint** (`~/.claude/ultraweb/taste.md`) that breaks ties in your favor on the next build — with a mandatory "heretic seat" in every mockup round arguing against your profile, so it stays a preference, never a rut. Last 10 builds only; taste drifts.

## The bill

The showcase table above is the receipt for a maximum-thoroughness `standard` build: 4,753 API calls, 2.78 million tokens generated, 756 million tokens processed, six hours and six minutes. A full `/ultraweb` run is a studio engagement, not an API call. Where the money goes:

- **twelve phases**, each one actually loading and following its skills — now split into decision cores with reference files loaded only on need, under a written context discipline (each artifact read once per context) that targets the single largest line in that receipt: the ~154K-token resident prefix dragged through every call;
- **quality gates that loop** — screenshots at 375 / 768 / 1440, scored against a rubric, fix → re-gate → fix again until it goes green. The showcase needed three rounds. Hooks now kill banned-list slop at write time — thirty milliseconds of grep instead of an Opus fix round later;
- **and in fan-out mode**, an agent per page group and an agent per gate — 37 of them in the showcase build.

Model routing keeps it as honest as it can — mechanical sweeps drop to Sonnet 5, judgment stays up on Opus 5 — but cheaper per call is not the same as cheap. Rough sizing: a **sketch**-tier landing page should land an order of magnitude under the showcase numbers; **standard** is the receipt above as the ceiling for a comparable site; **flagship** buys more critique rounds and the 3D budget on top. Plan for it.

**How to spend less:** say what the job really is ("landing page" → sketch tier), build once, then talk to it. Full runs are for new sites and total redesigns; everything after that is `iterate`, which touches only what your change touched. The interview and mockup round are the cheap part by design — they exist precisely so the expensive part runs once, at a direction you already approved, instead of twice because the first guess was wrong.

## Why the output isn't slop

Four things do most of the work:

**`taste` — the constitution.** A banned list (no purple AI gradient, no untouched shadcn, no "Empower your workflow" copy), a required list (OKLCH palette, a real type pairing, deliberate asymmetry, honored reduced-motion), and the heuristics for deciding everything in between. Every other skill bows to it — and a plugin hook enforces the greppable half of it at write time on supported source writes (ts/tsx/jsx/js/css/mdx/json/md inside a build), with the Phase 11 gates re-sweeping the whole tree regardless.

**`award-canon` — the library.** 32 Awwwards Site-of-the-Year and SOTD-tier winners from 2017 to 2026, studied and rendered down into 25 named, transferable patterns — plus the invariants that survived every era, the jury's own scoring weights, and a list of moves that have visibly aged. Each claim carries its verified award tier; dead sites are marked *reconstructed*, never passed off as inspected. The prime directive: **steal the principle, never the surface.**

**Seven gates that don't take your word for it.** Code, responsive, visual, accessibility, performance, anti-slop, content — each verified empirically. Real builds. Real Playwright screenshots. Computed contrast. Lighthouse. The site isn't finished until `design/QA.md` is green, and nothing is allowed to fake green — including faking it when the tools are missing: no browser means an honest **UNVERIFIED**, declared in Phase 0 before the build spends a cent, never a quiet wave-through discovered five hours in. The three verdicts have teeth: PASS may ship, FAIL never ships, and UNVERIFIED may preview and hand off but reaches production only after you explicitly accept each named unverified risk.

**`STACK.md` — the reality check.** Stack facts checked against live npm and official docs rather than training memory, so skills cite Next 16's `proxy.ts` and `preload`, Tailwind v4's `@theme`, Motion's `motion/react`. Version pins live in `stack/versions.json` with a 30-day expiry and a refresh script; corpus invariants are enforced by a lint script in CI, not by memory.

And underneath all of it: nearly every skill ends with a real decision traced end to end, drawn from a recurring cast of eight fictional clients whose canonical facts live in [CAST.md](CAST.md) — a Berlin roastery, a port-logistics SaaS, an Oslo agency, a Lisbon restaurant, a law firm, a game studio, a foundation, a textiles shop. Skills sharing a client agree on its palette, its type, its routes. The examples don't just illustrate the skills; they demonstrate the handoff between them.

## The studio floor

| Department | Who's in it |
|------|--------|
| **Direction** | `ultraweb` (the pipeline itself), `taste`, `iterate`, `award-canon`, `checkpoint` (the client-review cadence), `status` (progress + resume) |
| **Discovery** | `brief` (with the guided scoping interview), `assets` (client-material intake), `direction` (12 archetypes), `mockup` (the pick/mix/revise round, tournament optional), `sitemap`, `wireframe`, `copywriting` |
| **Design system** | `tokens`, `color`, `typography`, `identity` (the brand mark), `layout-grid`, `depth`, `shape-language`, `icons`, `imagery`, `motion-language`, `theme-worlds` |
| **Components** | `component-api`, `hero`, `navigation`, `footer`, `feature-sections`, `cards`, `buttons`, `forms`, `data-display`, `pricing`, `social-proof`, `faq`, `ui-states`, `overlays`, `cart`, `product-detail`, `command-palette`, `marginalia` |
| **Motion** | `micro-interactions`, `scroll-motion`, `page-transitions`, `physics`, `showpiece`, `set-design`, `animejs`, `hidden-craft` |
| **Engineering** | `scaffold`, `app-structure`, `routing`, `data-fetching`, `server-actions`, `media-optimization`, `seo`, `i18n`, `print-craft`, `studio` (the live build dashboard) |
| **Backend** | `api-design`, `database`, `auth`, `email`, `payments`, `content-cms`, `storage`, `consent`, `analytics` |
| **QA** | `gate-code`, `gate-responsive`, `gate-visual`, `gate-accessibility`, `gate-performance`, `gate-antislop`, `gate-content` |
| **Delivery** | `preview` (review URLs at the checkpoints), `ship`, `handoff`, `retrofit` |

Three specialists work outside the main line, each pinned to its own model tier:

- **`design-judge`** — the adversarial critic. Looks at screenshots, scores them against the award-canon invariants and the jury model, and is under no obligation to be nice. *(Opus 5)*
- **`pixel-qa`** — sweeps every breakpoint with Playwright and reports what it actually saw. *(Sonnet 5)*
- **`stack-doctor`** — fixes broken toolchains without the classic cowardice of downgrading. *(Opus 5)*

The same policy governs all fan-out work: judgment stays on the lead model, specialist builds and critiques on Opus 5, mechanical sweeps on Sonnet 5.

Want the full scope of all 80? → [ROSTER.md](ROSTER.md). Want the per-site award study bank? → [skills/award-canon/references/CANON.md](skills/award-canon/references/CANON.md). The shared client cast? → [CAST.md](CAST.md).

## What you need

- **Claude Code** — CLI, desktop, or web.
- **Node + npm** — something has to build the Next.js app.
- **Playwright MCP** — the eyes. Without it, the visual, responsive, and accessibility gates record an honest *UNVERIFIED* instead of quietly waving your site through — and the Phase 0 preflight tells you so before the build starts, not five hours in.
- **Vercel CLI auth** *(optional)* — enables the preview URLs at the review checkpoints. Without it, you review screenshots; nothing blocks.
- **Token headroom** — see [the bill](#the-bill). Start a `standard` build when you have room for it; say "landing page" when you don't.

---

*Built by [Iwan Braun](https://github.com/blyatiful1). Steal the principle, never the surface.*
