# ultraweb

[![Claude Code plugin](https://img.shields.io/badge/Claude%20Code-plugin-D97757)](https://code.claude.com/docs/en/plugins) [![Version](https://img.shields.io/badge/version-1.9.0-4C71F0)](.claude-plugin/plugin.json) [![Skills](https://img.shields.io/badge/skills-80-2EA44F)](ROSTER.md) [![CI](https://github.com/blyatiful1/ultraweb/actions/workflows/lint.yml/badge.svg)](https://github.com/blyatiful1/ultraweb/actions/workflows/lint.yml) [![Showcase](https://img.shields.io/badge/showcase-live-2EA44F)](https://ultraweb-site.vercel.app) [![License: MIT](https://img.shields.io/badge/license-MIT-lightgrey)](LICENSE)

A [Claude Code](https://code.claude.com) plugin that builds production Next.js 16 + Tailwind CSS v4 websites through a guided design session. You describe the site in one sentence, answer a few scoping questions, pick one of three mockups, and the pipeline builds, tests, and ships the rest: design system, components, copy, motion, backend, SEO, and seven quality gates verified with a real browser.

It ships as **80 skills** and **4 subagents** that share a written design constitution and a paper trail in `design/*.md`, so every decision is recorded and every later change is surgical.

- **Showcase:** [ultraweb-site.vercel.app](https://ultraweb-site.vercel.app), built by this pipeline from one prompt, source and full paper trail at [blyatiful1/ultraweb-site](https://github.com/blyatiful1/ultraweb-site).
- **Full skill reference:** [ROSTER.md](ROSTER.md)

## Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Quick start](#quick-start)
- [Usage](#usage)
- [How it works](#how-it-works)
- [Skills](#skills)
- [Subagents](#subagents)
- [Cost](#cost)
- [Repository layout](#repository-layout)
- [Development](#development)
- [Documentation](#documentation)
- [License](#license)

## Requirements

| Requirement | Why | Without it |
|---|---|---|
| Claude Code (CLI, desktop, or web) | Runs the plugin | Nothing works |
| Node.js (CI runs 22), npm, git | Scaffolds and builds the Next.js app | Preflight stops the build |
| [Playwright MCP](https://github.com/microsoft/playwright-mcp) with the `browser_run_code_unsafe` tool | Screenshots, contrast, Lighthouse, accessibility measurements | Browser-dependent gates record **UNVERIFIED** instead of passing; the site still builds and ships |
| Vercel CLI, authenticated (optional) | Preview URLs at the review checkpoints | You review screenshots instead of a URL |
| Token headroom | A full build is a multi-hour, multi-million-token job | See [Cost](#cost) |

Phase 0 of every build checks all of this before spending anything and prints a capability report.

## Installation

From inside any Claude Code session:

```text
/plugin marketplace add blyatiful1/ultraweb
/plugin install ultraweb@ultraweb
/reload-plugins
```

To update later:

```text
/plugin marketplace update ultraweb
```

To install from a clone (offline work or a fork):

```bash
git clone https://github.com/blyatiful1/ultraweb.git ~/src/ultraweb
```

```text
/plugin marketplace add ~/src/ultraweb
/plugin install ultraweb@ultraweb
```

Do not copy the repo into `~/.claude/skills/`. A nested skills tree loads the orchestrator without its specialists and fails quietly. Preflight detects this and refuses to build.

**Verify:** `/plugin` lists ultraweb, and `/ultraweb` responds when called.

## Quick start

```text
/ultraweb build me a website for a Berlin specialty coffee roastery with an online shop
```

What happens next:

1. **Interview.** Up to four multiple-choice questions generated from your prompt, about scope, features, audience, and content. Never about colors or fonts. Every question has a "you decide" default.
2. **Mockups.** Three deliberately different directions as static HTML, plus a contact sheet. Pick one, mix elements, or send the round back. Nothing expensive runs until you approve.
3. **Build.** The full pipeline runs from your approved direction. It pauses at the first-page review and at final acceptance, and writes progress to `design/PROGRESS.md`.
4. **Ship.** After all gates are green, you get a gate report, screenshots, a preview URL, and a what-to-click list. Then it deploys and writes the handoff README.

Skip the conversation entirely with **"just build it, no questions"**. The pipeline decides everything and logs each assumption.

## Usage

### Entry points

| You say | Skill | What it does |
|---|---|---|
| `/ultraweb build me a site for …` | `ultraweb` (root) | Full guided build from scratch, or a total redesign |
| "the hero's too timid", "add a pricing page" | `ultraweb:iterate` | Targeted change to an existing ultraweb site. Touches only the affected phases, re-runs only the affected gates |
| "audit my Next.js site" | `ultraweb:retrofit` | Scores an existing non-ultraweb Next.js site against the constitution and writes `design/RETROFIT.md` with each gap mapped to the skill that fixes it. It adds files, runs `npm install`, and applies the minimal fix if the site does not boot, so commit first |
| "status", "where are we", "continue" | `ultraweb:status` | Reports position from `design/PROGRESS.md` and resumes an interrupted build |
| a folder of logos, photos, copy, or a brand guide | `ultraweb:assets` | Inventories client material so the build uses your brand instead of inventing one |

### Engagement level

How often the build stops for you. Set from your own words, changeable mid-build with "stop asking me" or "check with me more".

| Level | Trigger | Blocking checkpoints |
|---|---|---|
| hands-off | "just build it", "no questions", or an unattended session | none |
| guided (default) | saying nothing | mockup approval, first-page review, preflight/UAT |
| studio | "walk me through it", "I want sign-off" | all six: brief read-back, mockup approval, structure sign-off, first-page review, voice review, preflight/UAT |

A checkpoint that cannot reach a human auto-passes with a logged note. It never deadlocks a build.

### Scope tier

How much pipeline the job gets. Set once from your prompt.

| Tier | Trigger | What changes |
|---|---|---|
| sketch | "landing page", "one-pager", "quick", "cheap" | Two mockups, one-page structure, single visual-critique round, homepage-only performance gate. An order of magnitude cheaper |
| standard (default) | saying nothing | The full pipeline |
| flagship | "go all out", "award-worthy", "money no object" | Standard plus the 3D and showpiece budget and up to five visual-critique rounds |

Every tier still passes the code and anti-slop gates in full.

### Watching and resuming

- `design/PROGRESS.md` always answers where the build is, whether it is waiting on you, and when it needs you next.
- The dev server exposes a dev-only `/studio` route: phase progress, the gate table, the checkpoint ledger, and a contact sheet of every screenshot. It returns 404 in production.
- If a session dies, start a new one in the same directory and say "continue". The artifacts are the memory. Completed phases are never re-run, and any checkpoint you were mid-answer on is re-presented.

### Taste memory

Mockup verdicts and review feedback from your last ten builds accrue into `~/.claude/ultraweb/taste.md`. It breaks ties in your favor on the next build, and every mockup round includes one candidate that deliberately argues against it.

## How it works

### Pipeline

| Phase | Name | Skills |
|---|---|---|
| 0 | Preflight | none: verifies install, toolchain, and browser |
| 1 | Understand | `brief`, `assets` |
| 2 | Direction | `direction`, `mockup` |
| 3 | Foundation | `color`, `typography`, `layout-grid`, `depth`, `shape-language`, `imagery`, `motion-language`, `theme-worlds`, `identity`, then `tokens` |
| 4 | Structure | `sitemap`, `wireframe` |
| 5 | Scaffold | `scaffold`, `app-structure`, `studio` |
| 6 | Build | `component-api` plus the component, commerce, and engineering skills below |
| 7 | Backend | as needed: `server-actions`, `api-design`, `database`, `auth`, `email`, `payments`, `content-cms`, `storage`, `analytics`, `consent` |
| 8 | Voice | `copywriting` |
| 9 | Motion | `micro-interactions`, `scroll-motion`, `page-transitions`; `physics`, `showpiece`, `set-design`, `animejs` only when the direction commissions them; `hidden-craft` |
| 10 | Findability | `seo`, `i18n`, `print-craft` |
| 11 | Gates | six measurement gates via the `gate-runner` subagent, then `gate-visual` |
| 11.5 | Acceptance | `checkpoint`, `preview` |
| 12 | Ship | `ship`, `handoff` |

The `taste` skill is loaded before anything else. It is the constitution every other skill defers to: a banned list (purple AI gradients, untouched shadcn, "Empower your workflow" copy), a required list (OKLCH palette, a real type pairing, deliberate asymmetry, honored reduced-motion), and the heuristics in between. `award-canon` supplies the reference library: 25 named patterns distilled from Awwwards Site-of-the-Year and Site-of-the-Day winners from 2017 to 2026.

### Artifacts

Every phase writes its decisions to files. Later phases read them. This is how 80 skills stay coherent across a six-hour build.

| File | Contains |
|---|---|
| `design/PROGRESS.md` | Current phase, running servers, whether the build is waiting on you, next checkpoint |
| `design/BRIEF.md` | Audience, purpose, tone, content inventory, backend needs |
| `design/ASSETS.md` | Inventory of client-supplied material |
| `design/MOCKUPS.md`, `design/mockups/*.html` | Mockup candidates, your verdicts, and the approval that gates the build |
| `design/REVIEWS.md` | Engagement level, scope tier, and one block per checkpoint with verdicts near-verbatim |
| `design/DIRECTION.md` | Archetype, signature move, references, what the site will not do |
| `design/SYSTEM.md`, `app/globals.css` | Palette, type, spacing, motion vocabulary; the same system as Tailwind v4 `@theme` tokens |
| `design/IDENTITY.md` | The brand mark: wordmark, favicon, OG template |
| `design/SITEMAP.md` | Pages, routes, per-page section blueprints |
| `design/SEO.md` | Canonical strategy, crawler policy |
| `design/QA.md` | Every gate result, screenshots taken, issues found and fixed, rulings |
| `design/CONTEXT-HANDOFF.md` | Lessons a resumed session must not re-learn |
| `qa/` | Raw evidence: build and server logs, per-gate logs, Lighthouse reports, visual-critique verdicts |

### Quality gates

Seven gates run against a production build on a real server, not against the dev server or the model's word.

| Gate | Checks |
|---|---|
| `gate-code` | `npm run build` clean, TypeScript strict, lint |
| `gate-responsive` | Screenshots at 375, 768, and 1440 px, overflow culprits |
| `gate-visual` | The design critic scores the screenshots against the award-canon invariants and sends fixes back, up to five rounds |
| `gate-accessibility` | WCAG 2.2 AA: computed contrast, keyboard walk, landmarks, labels, reduced-motion, axe |
| `gate-performance` | Lighthouse, cold-load JavaScript, font requests, layout shift |
| `gate-antislop` | Banned-list sweep of the whole tree plus a screenshot check |
| `gate-content` | No placeholders, no `#` links, real metadata on every page, link integrity |

Every checklist item is tagged MEASURED, OBSERVED, or JUDGMENT. Measured and observed items are asserted by scripts in `scripts/measure/`. Judgment items are handed back with evidence for the lead to rule on. The three verdicts have teeth: PASS may ship, FAIL never ships, and UNVERIFIED reaches production only after you accept each named risk.

### Hooks

The plugin registers three hooks in `hooks/hooks.json`:

- **antislop** (after Write and Edit): greps supported source writes inside a build for banned-list patterns and blocks them at write time.
- **shell-write-guard** (before Bash): blocks shell writes such as `sed -i`, `>` redirects, and heredocs to source files and `design/*.md` inside a build. Prefix a command with `ULTRAWEB_SHELL_WRITE_OK=1` for a deliberate exception.
- **studio-log** (after Task and on subagent stop): appends agent activity to `design/studio-log.jsonl` for the `/studio` dashboard, with no model calls.

### Stack

Skills cite the current stack, not training memory: Next.js 16 with `proxy.ts`, Tailwind v4 with `@theme`, Motion via `motion/react`, and so on. The API facts live in [STACK.md](STACK.md). Version pins live in `stack/versions.json`, refreshed by `scripts/verify-stack.mjs`, and expire after 30 days. A weekly CI job runs the scaffold recipe against the live npm registry so ecosystem drift breaks a badge here before it breaks a client build.

## Skills

The corpus is one orchestrator (the root `SKILL.md`) plus 79 specialists in `skills/<name>/SKILL.md`. Each specialist is a decision core; worked examples and compose maps live in `skills/<name>/references/` and load only when needed. Scope, inputs, and outputs for every skill are in [ROSTER.md](ROSTER.md).

| Department | Skills |
|---|---|
| Direction | `ultraweb` (the pipeline), `taste`, `award-canon`, `iterate`, `checkpoint`, `status` |
| Discovery | `brief`, `assets`, `direction`, `mockup`, `sitemap`, `wireframe`, `copywriting` |
| Design system | `tokens`, `color`, `typography`, `identity`, `layout-grid`, `depth`, `shape-language`, `icons`, `imagery`, `motion-language`, `theme-worlds` |
| Components | `component-api`, `hero`, `navigation`, `footer`, `feature-sections`, `cards`, `buttons`, `forms`, `data-display`, `pricing`, `social-proof`, `faq`, `ui-states`, `overlays`, `cart`, `product-detail`, `command-palette`, `marginalia` |
| Motion | `micro-interactions`, `scroll-motion`, `page-transitions`, `physics`, `showpiece`, `set-design`, `animejs`, `hidden-craft` |
| Engineering | `scaffold`, `app-structure`, `routing`, `data-fetching`, `server-actions`, `media-optimization`, `seo`, `i18n`, `print-craft`, `studio` |
| Backend | `api-design`, `database`, `auth`, `email`, `payments`, `content-cms`, `storage`, `consent`, `analytics` |
| QA | `gate-code`, `gate-responsive`, `gate-visual`, `gate-accessibility`, `gate-performance`, `gate-antislop`, `gate-content` |
| Delivery | `preview`, `ship`, `handoff`, `retrofit` |

Most skills end with a worked example drawn from a shared cast of eight fictional clients whose canonical facts live in [CAST.md](CAST.md). Skills that share a client agree on its palette, type, and routes, so the examples demonstrate the handoff between skills, not just the skill.

## Subagents

Four specialists in `agents/`, each pinned to a model tier. Judgment stays on the lead model, specialist critique and repair on Opus 5, mechanical sweeps on Sonnet 5.

| Agent | Model | Role |
|---|---|---|
| `design-judge` | Opus 5 | The adversarial critic. Scores screenshots against the award-canon invariants and is under no obligation to be nice |
| `stack-doctor` | Opus 5 | Repairs broken toolchains without downgrading |
| `pixel-qa` | Sonnet 5 | Sweeps every breakpoint with Playwright and reports what it saw |
| `gate-runner` | Sonnet 5 | Runs one measurement gate end to end against the production server, asserts every measured item, and returns a verdict of at most 400 tokens so gate prose never enters the lead's context |

By default one lead runs the pipeline sequentially and delegates mockup candidates, measurement gates, and visual-critique rounds. Say "single context" to keep everything in one window, or opt into multi-agent orchestration to fan out page builds one agent per page group.

## Cost

A full `standard` build is a studio engagement, not an API call. The showcase site is the reference receipt, counted from the session transcripts:

| Measurement | Value |
|---|---|
| Wall clock | 6 h 06 min in one session |
| Contexts | 1 lead plus 37 delegated agents |
| API calls | 4,753 |
| Tokens generated | 2.78 million |
| Total tokens processed | 756 million, of which 733 million were cache reads |
| Gate rounds to green | 3 |
| Lighthouse (mobile, production) | 93 performance, 94 accessibility, 94 best practices, 94 SEO |

That run was maximum thoroughness at `standard` tier, before the context diet in v1.9.0. Treat it as the ceiling for a comparable site. A `sketch`-tier landing page should land an order of magnitude lower. `flagship` costs more.

To spend less: say what the job really is so the sketch tier kicks in, build once, then use `iterate` for everything after. The interview and mockup round are cheap by design so the expensive part runs once, at a direction you already approved.

## Repository layout

```text
.claude-plugin/   plugin.json and marketplace.json (name, version, hook wiring)
SKILL.md          the orchestrator: pipeline, dials, artifact contract, resume ladder
skills/<name>/    79 specialist skills, each with SKILL.md and optional references/
agents/           the 4 subagents with their model pins
hooks/            antislop, shell-write-guard, studio-log, and hooks.json
scripts/          corpus linter, context budget, stack verifier, scaffold recipe
scripts/measure/  the browser measurement library the gates run through Playwright
stack/            versions.json, the single authority for pinned versions
references/       the root skill's worked example
tests/            linter self-tests, hook fixtures, manifest and measurement tests
docs/             design notes and telemetry from real builds
ROSTER.md         every skill with scope, inputs, and outputs
STACK.md          verified API facts for the stack
CAST.md           the eight recurring example clients
```

## Development

No `package.json` at the root: the tooling runs on plain Node 22.

```bash
# Corpus invariants: frontmatter, counts, references, agent pins, version badges
node scripts/lint-skills.mjs

# What the lead loads per phase, fails over the ceiling
node scripts/context-budget.mjs

# Unit tests (the measurement-library test needs Playwright and axe-core installed)
node --test tests/*.test.mjs

# Hook fixture tests
bash tests/hook-antislop.test.sh
bash tests/hook-shell-write-guard.test.sh

# Refresh stack pins (report only, or --write to fold them in)
node scripts/verify-stack.mjs
```

CI runs all of the above on every push, plus shellcheck on the hooks and a weekly scaffold build against the live ecosystem.

**Adding a skill:** create `skills/<name>/SKILL.md` with exactly `name` and `description` in the frontmatter, a `**Stage:**` line, and a worked example that names a CAST.md client. Put the example body in `skills/<name>/references/example.md`. Add the skill to ROSTER.md and to the table above. The linter checks all of it.

## Documentation

- [ROSTER.md](ROSTER.md): the complete skill map with reads and writes.
- [STACK.md](STACK.md): verified facts about Next.js, Tailwind, Motion, and the backend stack.
- [CAST.md](CAST.md): the shared example clients.
- [skills/award-canon/references/CANON.md](skills/award-canon/references/CANON.md): the per-site award study bank.
- [docs/context-diet-2026-09-01.md](docs/context-diet-2026-09-01.md): what changed in v1.9.0 and why.
- [docs/context-telemetry-2026-09-01.md](docs/context-telemetry-2026-09-01.md): the context-window accounting that motivated it.

## License

[MIT](LICENSE). Built by [Iwan Braun](https://github.com/blyatiful1).
