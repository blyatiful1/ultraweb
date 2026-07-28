# ultraweb

**One prompt → first-grade Next.js website.** A Claude Code plugin: 72 interlocking skills + 3 subagents that give Claude the working discipline of a design studio — a taste constitution, an award-canon study library distilled from Awwwards-winning sites, a design-system-first pipeline, real quality gates, and current-stack engineering (Next.js 16, Tailwind v4, shadcn/ui, Motion, Better Auth, Drizzle).

**See it argue for itself:** [ultraweb-site.vercel.app](https://ultraweb-site.vercel.app) — the showcase site, built BY this pipeline from one prompt. Its complete paper trail is public at [blyatiful1/ultraweb-site](https://github.com/blyatiful1/ultraweb-site): the `design/` artifacts (brief → direction → system → sitemap → QA), the 58/72 skill-coverage ledger, and every gate's command evidence. The homepage renders its own gate report, because the build report is the reference.

> [!IMPORTANT]
> **This pipeline uses a lot of tokens.** A full `/ultraweb` build runs a 12-phase studio pipeline with multi-round, screenshot-driven quality gates — expect it to consume far more tokens (and run far longer) than a typical prompt. That's deliberate: it's the price of the quality discipline described below. See [What it costs](#what-it-costs) for the why, and how to keep it down.

## Install

**Marketplace (recommended).** Inside any Claude Code session:

```
/plugin marketplace add blyatiful1/ultraweb
/plugin install ultraweb@ultraweb
```

Confirm the install in the dialog, then run `/reload-plugins` (or restart) — done. Update later with `/plugin marketplace update ultraweb`.

**Manual (skills directory).** Clone into your Claude skills folder:

```bash
git clone https://github.com/blyatiful1/ultraweb.git ~/.claude/skills/ultraweb
```

It auto-loads as `ultraweb@skills-dir` on the next session (or run `/reload-plugins` now). Update with `git pull`; remove by deleting the directory.

**Verify:** `/plugin` should list ultraweb, and `/ultraweb` should be available as a command.

## Use

```
/ultraweb build me a website for a Berlin specialty coffee roastery with an online shop
```

That's it. The root skill runs the full pipeline: brief → aesthetic direction → design system → sitemap → scaffold → build → backend → copy → motion → gates → ship. Every phase writes its decisions to `design/*.md` files in the generated project, so later phases (and later sessions) stay coherent.

For changes to an existing ultraweb site: just ask ("make the hero bolder") — `ultraweb:iterate` scopes the change and re-runs only the affected gates. For an existing non-ultraweb site: `ultraweb:retrofit` produces a scored gap report.

## What it costs

`/ultraweb` is a full design-studio pipeline, not a single generation call — and it's priced accordingly in tokens. A complete build:

- runs **12 phases**, each invoking real skills (loaded and followed, not summarized from memory);
- **accumulates context** — every phase writes `design/*.md` artifacts that later phases read back, so the working set grows as the build proceeds;
- ends in **multi-round quality gates** that screenshot every page at 375 / 768 / 1440 and critique it against a scored rubric, looping fix → re-gate until green;
- and, in **fan-out mode**, spawns one agent per page/section group and one per gate — multiplying all of the above.

Net: a single end-to-end build routinely costs **far more than an ordinary Claude Code task**, and takes a while to run. Plan for it. Model routing keeps the bill as honest as it can — mechanical sweeps run on Sonnet 5, judgment stays on the lead / Opus 5 tier (see [Map](#map)) — but cheaper *per call* is not cheap *overall*.

**Keeping it down:** build once, then iterate. For any change to an existing ultraweb site, ask in plain language ("make the hero bolder") and `ultraweb:iterate` scopes the edit and re-runs only the gates your change actually touches — not the whole pipeline. Reserve full `/ultraweb` runs for new sites and full redesigns.

## How it stays good

- **`taste`** — the constitution. Anti-slop banned list (no purple-gradient AI look, no untouched shadcn, no dead startup copy), required list (OKLCH palette, real type pairing, deliberate asymmetry, reduced-motion), decision heuristics. Every skill defers to it.
- **`award-canon`** — the study library. 31 Awwwards Site-of-the-Year/SOTD-tier winners (2017–2026) researched and distilled into 25 named, transferable patterns, plus the invariants that held across every era, the jury scoring model (Design 40% / Usability 30% / Creativity 20% / Content 10%), and a dated-fashions list. Every claim carries its verified award tier; dead sites are flagged as reconstructed, not inspected. `direction` consults it for references and signature-move precedent; `design-judge` scores against its invariants. Prime directive: **steal the principle, never the surface.**
- **Quality gates** — seven gates (`gate-code`, `gate-responsive`, `gate-visual`, `gate-accessibility`, `gate-performance`, `gate-antislop`, `gate-content`) that verify empirically: real builds, real Playwright screenshots at 375/768/1440, computed contrast, Lighthouse. A site isn't done until `design/QA.md` is green.
- **`STACK.md`** — stack facts verified against live npm + official docs (last: 2026-07-28). Skills cite it instead of training memory: Next 16's `proxy.ts`, Turbopack-default, `preload` (not `priority`), Cache Components, Tailwind v4 `@theme`, Motion 12 `motion/react`, zod v4, Better Auth, CSS scroll-driven animation support. When versions drift, update this one file.
- **Worked examples** — nearly every skill closes with a real-project decision traced end to end, drawn from a shared bank of eight recurring clients (a Berlin roastery, a port-logistics SaaS, an Oslo design agency, a Lisbon restaurant, a law firm, a game studio, a community foundation, a textiles shop). Skills that share a client agree on its palette, type, and routes — so the examples themselves demonstrate how the skills hand off to each other.

## Map

| Tier | Skills |
|------|--------|
| Core | `ultraweb` (root pipeline), `taste`, `iterate`, `award-canon` |
| Discovery | `brief`, `direction` (12-archetype catalog), `sitemap`, `wireframe`, `copywriting` |
| Design system | `tokens`, `color`, `typography`, `layout-grid`, `depth`, `shape-language`, `icons`, `imagery`, `motion-language`, `theme-worlds` |
| Components | `component-api`, `hero`, `navigation`, `footer`, `feature-sections`, `cards`, `buttons`, `forms`, `data-display`, `pricing`, `social-proof`, `faq`, `ui-states`, `overlays`, `cart`, `product-detail`, `command-palette`, `marginalia` |
| Motion | `micro-interactions`, `scroll-motion`, `page-transitions`, `physics`, `showpiece`, `animejs` (DIRECTION-gated SVG choreography), `hidden-craft` |
| Next.js | `scaffold`, `app-structure`, `routing`, `data-fetching`, `server-actions`, `media-optimization`, `seo`, `i18n`, `print-craft` |
| Backend | `api-design`, `database`, `auth`, `email`, `payments`, `content-cms`, `storage`, `consent`, `analytics` |
| Gates | `gate-code`, `gate-responsive`, `gate-visual`, `gate-accessibility`, `gate-performance`, `gate-antislop`, `gate-content` |
| Ship | `ship`, `handoff`, `retrofit` |

Subagents: `design-judge` (adversarial screenshot critic — Opus 5, rubric extended with the award-canon invariants and jury model), `pixel-qa` (Playwright breakpoint sweeps — Sonnet 5), `stack-doctor` (toolchain repair without downgrades — Opus 5). Each pins its model tier in frontmatter; the root skill's **Delegation & model routing** table extends the same policy to all fan-out work: judgment stays on the lead model, specialist builds and critiques run on Opus 5, mechanical sweeps run on Sonnet 5.

Full scope of every skill: [ROSTER.md](ROSTER.md). The per-site award study bank: [skills/award-canon/CANON.md](skills/award-canon/CANON.md).

## Requirements

- Claude Code (CLI, desktop, or web)
- Node.js + npm (Next.js builds)
- Playwright MCP (bundled with the playwright plugin) — needed by `gate-responsive`/`gate-visual`/`pixel-qa`; without it those gates degrade to honest "unverified" reports, never fake passes.
- Token headroom — see [What it costs](#what-it-costs). A full build is a heavy, long-running job; budget for it.
