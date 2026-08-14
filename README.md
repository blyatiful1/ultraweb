# ultraweb

[![Claude Code plugin](https://img.shields.io/badge/Claude%20Code-plugin-D97757)](https://code.claude.com/docs/en/plugins) [![Version](https://img.shields.io/badge/version-1.5.0-4C71F0)](.claude-plugin/plugin.json) [![Skills](https://img.shields.io/badge/skills-74-2EA44F)](ROSTER.md) [![Showcase](https://img.shields.io/badge/showcase-live-2EA44F)](https://ultraweb-site.vercel.app)

*A Claude Code plugin for AI web design: a guided design session — a few sharp scoping questions, three fast mockups, your approval — then a production-grade Next.js 16 + Tailwind CSS v4 website out: design system, copywriting, motion, backend, SEO, and seven screenshot-verified quality gates.*

## You hire a design studio. It fits in one session.

Somewhere in a nicer timeline there's a small agency that does this properly. An art director who refuses the purple gradient. A design engineer who ships tokens before components. A critic who screenshots your site at 375px and tells you the truth about it. And before any of them lift a pen, someone sits you down, asks the four questions that actually matter for *your* site, and shows you three sketches to point at. They cost forty thousand euros and they're booked until spring.

**ultraweb is that studio, as a Claude Code plugin.** 74 skills and 3 subagents that argue with each other on your behalf until something good comes out the other end — a real Next.js site, built, judged, and fixed before you ever see it.

```text
/ultraweb build me a website for a Berlin specialty coffee roastery with an online shop
```

Answer a short round of questions about scope (yours will be about subscriptions and checkout — someone else's would be about reservations or case studies), pick one of three mockups, say yes. *Then* go make coffee yourself. It'll be a while.

Prefer the classic fire-and-forget? Say **"just build it, no questions"** and the studio decides everything itself, logging each assumption so you can correct it afterwards.

---

## See it defend itself

**[ultraweb-site.vercel.app](https://ultraweb-site.vercel.app)** — built by this pipeline, from one prompt, with no human touch-ups.

The whole paper trail is public at [blyatiful1/ultraweb-site](https://github.com/blyatiful1/ultraweb-site): every decision the studio made on the way (brief → direction → system → sitemap → QA), the 58/72 skill-coverage ledger from that build (the harness has since grown to 74, and that run predates the guided session — it was a classic autonomous build), and each gate's receipts. The homepage renders its own report card. If the site were bad, you'd be able to prove it from the repo.

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
| Skill coverage | 58 of 72 (80.6%) at build time, all 14 exclusions recorded with reasons |
| Lighthouse, mobile, production | 93 performance · 94 accessibility · 94 best practices · 94 SEO |
| Cumulative layout shift | 0.00 |
| Commissioned animation weight | +22.9 KB gzip measured, against a ~23 KB budget set in writing before it was built |

Read the table twice. Once as an advertisement: one prompt became a gated, documented, production site in a working day. Once as a warning: it took three quarters of a billion processed tokens to get there. Both readings are correct, and both are the point.

---

> [!IMPORTANT]
> **This thing is expensive.** A full build runs twelve phases and loops through screenshot-driven critique until it stops finding problems. It burns far more tokens, and far more minutes, than a normal prompt — the table above is what one full run actually looks like. That's not inefficiency; that's the part that makes it good. [The honest math is below.](#the-bill)

## Getting it

**From the marketplace,** inside any Claude Code session:

```text
/plugin marketplace add blyatiful1/ultraweb
/plugin install ultraweb@ultraweb
```

Confirm the dialog, run `/reload-plugins`, done. Later: `/plugin marketplace update ultraweb`.

**Or by hand,** straight into your skills folder:

```bash
git clone https://github.com/blyatiful1/ultraweb.git ~/.claude/skills/ultraweb
```

Loads itself next session as `ultraweb@skills-dir`. Update with `git pull`, uninstall with `rm -rf`.

**Did it work?** `/plugin` lists ultraweb, and `/ultraweb` answers when called.

## Using it

One sentence about what you want — then a short conversation instead of a leap of faith.

**First, the interview.** The pipeline reads your sentence, works out what kind of site it is, and asks up to four multiple-choice questions about the forks it can't safely guess — scope, features, audience, content. The questions are generated from *your* prompt, not a fixed form: a shop gets asked about subscriptions, a restaurant about reservations, a portfolio about case-study depth. Never about colors or fonts — you shouldn't have to describe taste in words.

**Then, the mockups.** Three deliberately different directions, each rendered fast as a self-contained static HTML preview — real palette, real type pairing, your copy sketched in, no build step. You pick one, mix elements ("the warm one, but with B's grid"), or send the round back. Nothing expensive happens until you say yes; your approval is written into `design/MOCKUPS.md` and is literally the gate the build waits behind.

**Then, the build.** From your approved direction, the pipeline runs as before: design system → pages → scaffold → build → backend → copy → motion → findability → gates → ship. Every phase leaves a written record in `design/*.md` inside your project, which is how 74 skills manage to agree with each other three hours later. The mockup files stay behind as reference — the site is re-derived from the decisions, never copy-pasted from a sketch.

**Autonomous mode** — the original one-prompt behavior — is still there: say "just build it" / "no questions", and it decides everything itself (also the automatic fallback when nobody's around to answer, e.g. scheduled runs).

**Already have an ultraweb site?** Just say what's wrong — *"the hero's too timid"* — and `ultraweb:iterate` scopes the change and re-runs only the gates you actually disturbed.

**Have some other site?** `ultraweb:retrofit` reads it and hands back a scored, unflattering gap report.

## The bill

The showcase table above is the receipt: 4,753 API calls, 2.78 million tokens generated, 756 million tokens processed, six hours and six minutes. A full `/ultraweb` run is a studio engagement, not an API call, and here is where those numbers come from:

- **twelve phases**, each one actually loading and following its skills — not vibing them from memory;
- **an accumulating context** — every phase writes artifacts the later phases read back, so the working set grows as the build does. This is why 96.9 percent of all processed tokens were cache reads: the paper trail gets re-read on nearly every call. Prompt caching prices those far below fresh input, and the expensive habit doubles as the quality mechanism — a pipeline that re-reads its own decisions can't drift;
- **quality gates that loop** — screenshots at 375 / 768 / 1440, scored against a rubric, fix → re-gate → fix again until it goes green. The showcase needed three rounds;
- **and in fan-out mode**, an agent per page group and an agent per gate — 37 of them in the showcase build.

Model routing keeps it as honest as it can — mechanical sweeps drop to Sonnet 5, judgment stays up on Opus 5 — but cheaper per call is not the same as cheap. It is still, plainly, an order of magnitude beyond an ordinary Claude Code task. Plan for it.

**How to spend less:** build once, then talk to it. Full runs are for new sites and total redesigns. Everything after that is `iterate`, which touches only what your change touched. The interview and mockup round are the cheap part by design — a handful of questions and three static HTML sketches — and they exist precisely so the expensive part runs once, at a direction you already approved, instead of twice because the first guess was wrong.

## Why the output isn't slop

Four things do most of the work:

**`taste` — the constitution.** A banned list (no purple AI gradient, no untouched shadcn, no "Empower your workflow" copy), a required list (OKLCH palette, a real type pairing, deliberate asymmetry, honored reduced-motion), and the heuristics for deciding everything in between. Every other skill bows to it.

**`award-canon` — the library.** 32 Awwwards Site-of-the-Year and SOTD-tier winners from 2017 to 2026, studied and rendered down into 25 named, transferable patterns — plus the invariants that survived every era, the jury's own scoring weights, and a list of moves that have visibly aged. Each claim carries its verified award tier; dead sites are marked *reconstructed*, never passed off as inspected. The prime directive: **steal the principle, never the surface.**

**Seven gates that don't take your word for it.** Code, responsive, visual, accessibility, performance, anti-slop, content — each verified empirically. Real builds. Real Playwright screenshots. Computed contrast. Lighthouse. The site isn't finished until `design/QA.md` is green, and nothing is allowed to fake green.

**`STACK.md` — the reality check.** Stack facts checked against live npm and official docs rather than training memory, so skills cite Next 16's `proxy.ts` and `preload`, Tailwind v4's `@theme`, Motion 12's `motion/react`. When the ecosystem moves, one file moves.

And underneath all of it: nearly every skill ends with a real decision traced end to end, drawn from a recurring cast of eight fictional clients — a Berlin roastery, a port-logistics SaaS, an Oslo agency, a Lisbon restaurant, a law firm, a game studio, a foundation, a textiles shop. Skills sharing a client agree on its palette, its type, its routes. The examples don't just illustrate the skills; they demonstrate the handoff between them.

## The studio floor

| Department | Who's in it |
|------|--------|
| **Direction** | `ultraweb` (the pipeline itself), `taste`, `iterate`, `award-canon` |
| **Discovery** | `brief` (with the guided scoping interview), `direction` (12 archetypes), `mockup` (the pick/mix/revise round), `sitemap`, `wireframe`, `copywriting` |
| **Design system** | `tokens`, `color`, `typography`, `layout-grid`, `depth`, `shape-language`, `icons`, `imagery`, `motion-language`, `theme-worlds` |
| **Components** | `component-api`, `hero`, `navigation`, `footer`, `feature-sections`, `cards`, `buttons`, `forms`, `data-display`, `pricing`, `social-proof`, `faq`, `ui-states`, `overlays`, `cart`, `product-detail`, `command-palette`, `marginalia` |
| **Motion** | `micro-interactions`, `scroll-motion`, `page-transitions`, `physics`, `showpiece`, `set-design`, `animejs`, `hidden-craft` |
| **Engineering** | `scaffold`, `app-structure`, `routing`, `data-fetching`, `server-actions`, `media-optimization`, `seo`, `i18n`, `print-craft` |
| **Backend** | `api-design`, `database`, `auth`, `email`, `payments`, `content-cms`, `storage`, `consent`, `analytics` |
| **QA** | `gate-code`, `gate-responsive`, `gate-visual`, `gate-accessibility`, `gate-performance`, `gate-antislop`, `gate-content` |
| **Delivery** | `ship`, `handoff`, `retrofit` |

Three specialists work outside the main line, each pinned to its own model tier:

- **`design-judge`** — the adversarial critic. Looks at screenshots, scores them against the award-canon invariants and the jury model, and is under no obligation to be nice. *(Opus 5)*
- **`pixel-qa`** — sweeps every breakpoint with Playwright and reports what it actually saw. *(Sonnet 5)*
- **`stack-doctor`** — fixes broken toolchains without the classic cowardice of downgrading. *(Opus 5)*

The same policy governs all fan-out work: judgment stays on the lead model, specialist builds and critiques on Opus 5, mechanical sweeps on Sonnet 5.

Want the full scope of all 74? → [ROSTER.md](ROSTER.md). Want the per-site award study bank? → [skills/award-canon/CANON.md](skills/award-canon/CANON.md).

## What you need

- **Claude Code** — CLI, desktop, or web.
- **Node + npm** — something has to build the Next.js app.
- **Playwright MCP** — the eyes. Without it, the visual and responsive gates degrade to an honest *"unverified"* instead of quietly waving your site through.
- **Token headroom** — see [the bill](#the-bill). The showcase run processed 756 million tokens in six hours. Start it when you have room for it.

---

*Built by [Iwan Braun](https://github.com/blyatiful1). Steal the principle, never the surface.*
