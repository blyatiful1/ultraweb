---
name: retrofit
description: "Audit, critique or improve the design of an existing website that ultraweb did not build: run the gates, screenshot it, score it with the design judge and write design/RETROFIT.md mapping each gap to its fix. Use only when the user explicitly asks to audit, critique or improve their existing site."
---

# retrofit

Audit a site ultraweb did not build, report its gaps, and, if the user wants fixes, set it up so `iterate` can apply them.

`<plugin>` is `${CLAUDE_PLUGIN_ROOT}`. References are in `<plugin>/references/`.

## 1. Qualify

- If `design/DIRECTION.md` already exists, stop. This is an ultraweb site: use `iterate` for a change, or the root skill's resume for an unfinished build.
- Read `package.json` and the file tree. Record the framework, the styling setup and the routes. Any framework can be audited from a running URL; fixes through iterate assume a Next.js App Router site or a static site, so say so when the site is neither.
- Collect any written design statement (style guide, brand page, README section) for step 4.

## 2. Get it running, read-only

The audit phase does not change the project. Before running anything that writes, tell the user what it is and wait for their approval:

- `npm install` (writes `node_modules` and may change the lockfile).
- Any fix needed to make the site boot.

If the user gives a live URL, audit that instead and install nothing. Write audit outputs only to `qa/` and `design/RETROFIT.md`, and say so up front.

## 3. Measure

Run `node <plugin>/scripts/gates.mjs --url <url> --project <dir>`, reading `references/gates.md` first. Use `--routes` when the crawl would miss pages. Exit code 3 means no browser: report the audit as UNVERIFIED and give the install line the runner printed. The runner writes `qa/gates.json`, `qa/GATES.md` and screenshots in `qa/shots/`.

## 4. Score

Read `references/taste.md` and `references/judge.md`. Send one round to the `design-judge` agent with the paths in `qa/shots/`, the project root, `<plugin>`, and the design statement from step 1 in place of a DIRECTION.md, telling it to score against `references/taste.md`. It writes `qa/judge-round-1.md`. Take the per-axis scores from that file and report the worst axis next to the mean.

## 5. Write design/RETROFIT.md

```md
# Retrofit — <site> (<date>)
Verdict: <one sentence>. Gates: <PASS|FAIL|UNVERIFIED>. Judge mean <n>/10, worst axis <axis> <n>/10.

## Gaps
| # | Gap | Evidence (shot or file:line) | Severity P0-P3 | Fixed by | Phase |

## Plan
- A, quick fixes: content, metadata, accessibility fails
- B, system: tokens, type, color, layout rhythm
- C, new direction: only when distinctiveness scores 4 or lower, or no direction is identifiable
```

Every gap names one reference in the Fixed by column, for example `references/color.md` or `references/sections.md`. A gap without a named fix and evidence is not finished. Gate fails come first, from `qa/GATES.md`.

Present RETROFIT.md and stop. Change no code until the user approves a phase.

## 6. Hand off to iterate

When the user approves fixes, write the artifact set iterate requires, reverse-engineered from the site as it is:

- `design/BRIEF.md`: audience, purpose, pages, backend surface and market, following `references/brief.md`. Mark facts you inferred as inferred. An existing live site is in production mode.
- `design/DIRECTION.md`: the target direction. For phases A and B, describe the current look sharpened; for phase C, run `references/direction.md` with the user.
- `design/SYSTEM.md`: the current tokens (colors, type scale, spacing, radii, motion), with the planned changes marked.
- `design/SITEMAP.md`: the current routes and sections per page, following `references/structure.md`.
- `design/PROGRESS.md`: per `references/checkpoints.md`, with Mode, Tier, the RETROFIT.md plan as the phase list, and the audit's assumptions.

Then run each approved phase through `iterate` (`<plugin>/skills/iterate/SKILL.md`), one at a time, with RETROFIT.md as the change request. Get explicit confirmation of scope before phase C.
