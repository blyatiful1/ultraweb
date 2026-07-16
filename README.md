# ultraweb

**One prompt → first-grade Next.js website.** A Claude Code plugin: 59 interlocking skills + 3 subagents that give Claude the working discipline of a design studio — taste constitution, design-system-first pipeline, real quality gates, and current-stack engineering (Next.js 16, Tailwind v4, shadcn/ui, Motion, Better Auth, Drizzle).

## Install

Already installed if this folder is at `~/.claude/skills/ultraweb/` — it auto-loads as `ultraweb@skills-dir` on the next session (or run `/reload-plugins` now). To remove: delete the directory.

## Use

```
/ultraweb build me a website for a Berlin specialty coffee roastery with an online shop
```

That's it. The root skill runs the full pipeline: brief → aesthetic direction → design system → sitemap → scaffold → build → backend → copy → motion → gates → ship. Every phase writes its decisions to `design/*.md` files in the generated project, so later phases (and later sessions) stay coherent.

For changes to an existing ultraweb site: just ask ("make the hero bolder") — `ultraweb:iterate` scopes the change and re-runs only the affected gates. For an existing non-ultraweb site: `ultraweb:retrofit` produces a scored gap report.

## How it stays good

- **`taste`** — the constitution. Anti-slop banned list (no purple-gradient AI look, no untouched shadcn, no dead startup copy), required list (OKLCH palette, real type pairing, deliberate asymmetry, reduced-motion), decision heuristics. Every skill defers to it.
- **Quality gates** — seven gates (`gate-code`, `gate-responsive`, `gate-visual`, `gate-accessibility`, `gate-performance`, `gate-antislop`, `gate-content`) that verify empirically: real builds, real Playwright screenshots at 375/768/1440, computed contrast, Lighthouse. A site isn't done until `design/QA.md` is green.
- **`STACK.md`** — stack facts verified against live npm + official docs (last: 2026-07-16). Skills cite it instead of training memory: Next 16's `proxy.ts`, Turbopack-default, `preload` (not `priority`), Cache Components, Tailwind v4 `@theme`, Motion 12 `motion/react`, zod v4, Better Auth. When versions drift, update this one file.

## Map

| Tier | Skills |
|------|--------|
| Core | `ultraweb` (root pipeline), `taste`, `iterate` |
| Discovery | `brief`, `direction` (12-archetype catalog), `sitemap`, `wireframe`, `copywriting` |
| Design system | `tokens`, `color`, `typography`, `layout-grid`, `depth`, `shape-language`, `icons`, `imagery`, `motion-language` |
| Components | `hero`, `navigation`, `footer`, `feature-sections`, `cards`, `buttons`, `forms`, `data-display`, `pricing`, `social-proof`, `faq`, `ui-states` |
| Motion | `micro-interactions`, `scroll-motion`, `page-transitions`, `physics`, `showpiece` |
| Next.js | `scaffold`, `app-structure`, `routing`, `data-fetching`, `server-actions`, `media-optimization`, `seo`, `i18n` |
| Backend | `api-design`, `database`, `auth`, `email`, `payments`, `content-cms`, `storage` |
| Gates | `gate-code`, `gate-responsive`, `gate-visual`, `gate-accessibility`, `gate-performance`, `gate-antislop`, `gate-content` |
| Ship | `ship`, `handoff`, `retrofit` |

Subagents: `design-judge` (adversarial screenshot critic), `pixel-qa` (Playwright breakpoint sweeps), `stack-doctor` (toolchain repair without downgrades).

Full scope of every skill: [ROSTER.md](ROSTER.md).

## Requirements

- Node.js + npm (Next.js builds)
- Playwright MCP (bundled with the playwright plugin) — needed by `gate-responsive`/`gate-visual`/`pixel-qa`; without it those gates degrade to honest "unverified" reports, never fake passes.
