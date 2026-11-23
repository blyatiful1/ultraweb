---
name: ultraweb
description: "Build, create or redesign a website or landing page through a guided session: a short interview, mockups to pick from, then design system, pages, copy, motion and browser-checked gates to a shippable site. Say \"continue\" to resume an interrupted build, or \"just build it\" for autonomous mode. For changes to an ultraweb site use iterate; for auditing another site use retrofit."
---

# ultraweb

Build a complete website from one request. You make the design and engineering decisions, record them in `design/*`, and stop for the human only at the checkpoints listed below.

## Plugin root and references

`<plugin>` means `${CLAUDE_PLUGIN_ROOT}`. If that variable is empty, find the directory that holds `.claude-plugin/plugin.json` with `"name": "ultraweb"` (check the newest `ultraweb@…` `installPath` in `~/.claude/plugins/installed_plugins.json`), and record the path on the first line of `design/PROGRESS.md`.

The references are plain files in `<plugin>/references/`. Read them with the Read tool, one phase at a time, when that phase starts. Do not read them all up front, and do not re-read a reference that is still in context. `references/taste.md` is read in Phase 2 and stays in force for the rest of the build.

The kit in `<plugin>/kit/` holds tested building blocks: a base stylesheet for static sites and mountable effects ("moments"). `<plugin>/kit/README.md` says how to use it. The scripts in `<plugin>/scripts/` do the work that is easy to get wrong by hand: `palette.mjs` (colour tokens with verified contrast), `deal.mjs` (the dealt mockup candidate), `moments.mjs` (choosing kit moments), `check-phase.mjs` (whether a phase is really finished) and `gates.mjs` (the quality gates).

## Modes

| Mode | Set by | Checkpoints |
|---|---|---|
| `guided` (default) | saying nothing either way | CP1 direction pick, CP2 homepage review, CP3 acceptance |
| `autonomous` | "just build it", "no questions", "surprise me", or no human can answer (scheduled run, CI, non-interactive session) | none |

In autonomous mode, decide every question a checkpoint would have asked and log the decision under `## Assumptions` in `design/PROGRESS.md`. Ask at most one question, and only when the request does not say what the site is for. An interactive session with a slow human waits at a checkpoint; only a session that cannot ask runs autonomously. The user can switch modes mid-build ("stop asking me", "check with me"); log the switch in PROGRESS.md.

## Tiers

Set the tier once from the request and record it in PROGRESS.md.

| Tier | Set by | What changes |
|---|---|---|
| `sketch` | "landing page", "one-pager", "quick", "rough" | One page. Static HTML/CSS in `site/` by default; Next.js only when the user asks or the folder already holds a Next project. 2 mockups. 1 judge round. Phase 6 is skipped unless the brief adds legal pages. `design/SITEMAP.md` is still written, with one page. |
| `standard` (default) | saying nothing | Multi-page Next.js site. 3 mockups. Up to 2 judge rounds. |
| `flagship` | "award-worthy", "go all out", "best possible" | Standard plus a commissioned showpiece (`references/showpiece.md`), real assets required for hero media, supplied by the client or generated in the session and recorded in BRIEF.md (settle this in Phase 1; placeholders block CP3), up to 4 judge rounds against `references/award/invariants.md`. |

Every tier runs the full gates in Phase 7. A sketch that later grows ("now add a shop") is an iterate at standard depth for the new surface.

## Pipeline

Run the phases in order. At each phase boundary update `design/PROGRESS.md` (format in `references/checkpoints.md`) and commit.

| Phase | Name | Read at phase start | Writes |
|---|---|---|---|
| 0 | Preflight | `scaffold.md` §Preflight | capability report in PROGRESS.md |
| 1 | Brief | `brief.md` | `design/BRIEF.md` |
| 2 | Direction | `taste.md`, `direction.md`, `mockup.md`, `checkpoints.md` (+ `award/patterns.md` at flagship) | `design/mockups/*.html`, CP1, `design/DIRECTION.md` |
| 3 | System | `tokens.md`, `color.md`, `typography.md`, `layout.md`, `form.md`, `imagery.md`, `identity.md` (when there is no client mark), `motion.md` §Vocabulary | `design/SYSTEM.md`, token CSS from `palette.mjs` |
| 4 | Structure and copy | `structure.md`, `copy.md` | `design/SITEMAP.md` with routes, sections and copy deck |
| 5 | Scaffold and homepage | `scaffold.md`, `next.md` (Next builds only), `sections.md`, `primitives.md`, `judge.md`, and `<plugin>/kit/README.md` | working homepage, quick gates, one judge round, CP2 |
| 6 | Build out | `sections.md`, `primitives.md`, `motion.md`; `commerce.md`, `backend.md`, `legal-dach.md`, `findability.md` as the brief needs; `showpiece.md` only when DIRECTION.md commissions it | every route in SITEMAP.md |
| 7 | Gates | `gates.md`, `judge.md` | `qa/gates.json` PASS, `qa/judge-round-N.md` ending SHIP |
| 8 | Acceptance and ship | `checkpoints.md` §CP3, `ship.md` | CP3, deploy if asked, handoff README |

All reference paths above are relative to `<plugin>/references/`. When a later phase needs a reference read in an earlier phase that is no longer in context (after a compaction or resume), read it again.

Phase notes that are not in the references:

- **Phase 0.** Check node, npm and git, that the folder is writable, and that `node <plugin>/scripts/gates.mjs --help` runs. If Playwright cannot be resolved, the gates exit 3 (UNVERIFIED). Say so before any expensive work and ask once whether to continue; in autonomous mode log it and continue.
- **Phase 2.** Nothing from Phase 3 onward starts in guided mode until CP1 has a logged pick. Three rounds without a pick means the shortlist is wrong: re-derive the candidates from the brief instead of revising the same ones.
- **Phase 3.** Generate the colour tokens with `node <plugin>/scripts/palette.mjs` from the ground and hues in DIRECTION.md (`--help` lists the options); it prints a contrast table and exits 1 when a pair cannot pass. Do not work out contrast by hand. After any manual edit to the token file run `node <plugin>/scripts/palette.mjs check <file>`.
- **Phase 5.** Build the homepage completely before any other page. It exercises the tokens, header, footer and section rhythm, so system defects are fixed once. Run `node <plugin>/scripts/gates.mjs --url <prod-url> --quick` against a production build (never `next dev`), fix every fail, run one judge round, then open CP2.
- **Phase 5 and 6, motion.** The signature move and any other effect come from the kit when the kit has one that fits: `node <plugin>/scripts/moments.mjs pick --fits <site kind> --max-intensity <motion level in DIRECTION.md>`, then mount it exactly as its README says. Write an effect by hand only when DIRECTION.md commissions something the kit does not have.
- **Phase 6.** Inner pages inherit the fixes made at CP2. Build them from SITEMAP.md, one route at a time.
- **Phase 7.** Run `node <plugin>/scripts/gates.mjs --url <prod-url>` against a production build (`npm run build && npm start` for Next, a static server for `site/`). Fix fails, rebuild, re-run with `--only` and `--routes` limited to what the fix touched, then one full run at the end. Then run the judge rounds the tier allows. When the runner prints a line starting `ESCALATE:`, stop fixing and report the failing checks to the user.

## Rules that hold all build long

1. **The artifacts are the memory.** After any compaction, resume or new session, read `design/PROGRESS.md` and the current phase's references before doing anything else. Never rely on a summary of a reference you no longer have in context.
2. **One phase's references at a time.** Read a reference when its phase starts. Read each `design/*` file once per context, and again only after something in this context changed it.
3. **Edit files with the Edit and Write tools**, not `sed -i`, `>` redirects or heredoc scripts. Shell writes echo whole regions back into context and bypass review. Appending a line to a log with `>>` is fine.
4. **Gates come from the script.** Run `node <plugin>/scripts/gates.mjs`; read its summary and `qa/GATES.md`, not raw logs. A FAIL never ships. UNVERIFIED may produce a preview, but a production deploy needs the user to accept each unverified check by name. Never edit `qa/gates.json` by hand, and use `qa/waivers.json` only for a real false positive, with the reason written in it.
5. **The judge runs in a fresh context.** Visual critique goes to the `design-judge` agent. Never score your own screenshots, and never mark a judge round SHIP yourself.
6. **Never fabricate proof.** No invented testimonials, client logos, ratings, press quotes, awards or statistics presented as real. When the brief has none, design the page without them or use visibly labeled sample content that `ship.md` blocks from production.
7. **Commit at every phase boundary** with the message `ultraweb: phase N — <name>`. Local commits only; never push or add remotes unless asked.
8. **A phase is done when the checker says so.** Before marking phase N complete in PROGRESS.md, run `node <plugin>/scripts/check-phase.mjs N` and fix everything it lists. It checks that the artifacts exist and are complete; it does not judge quality.
9. **Assemble before you invent.** Use the scripts and the kit for colour, dealing, effects and checks. They are tested; a hand-written replacement is not. Follow each reference and README literally, and when a step is unclear do the listed step rather than improvising a different one.
10. **Be honest about cost.** A standard build is a multi-hour job with a large token bill, and a flagship build costs more. Say this once when the build starts, and suggest the sketch tier when the request is a single page.

## Delegation

Without delegation you write everything in this context. When the Agent tool is available and the user has not asked for a single context, delegate only these:

| Work | To | When |
|---|---|---|
| Round-1 mockup candidates | one general agent per candidate, launched together | standard and flagship |
| Visual critique | the `design-judge` agent | every judge round, every tier |
| Inner pages after CP2 | one agent per route or route group | flagship, or when the user asks |

Every brief must contain the plugin root, the absolute paths of the artifacts the agent reads (`design/BRIEF.md`, `design/DIRECTION.md`, `design/SYSTEM.md`, `design/SITEMAP.md` as relevant), the exact references it must read, the files it may write, and what it must return. Agents never edit `design/DIRECTION.md` or `design/SYSTEM.md`; changes to those are yours. The judge runs on the strongest available model alias. Delegation shrinks your context and raises total spend.

## Resuming

When a session starts in a folder that contains `design/`, or the user says "continue", "resume" or "where were we", follow §Resume in `references/checkpoints.md` before any other work. In short:

1. If `design/PROGRESS.md` exists, it is authoritative. Read it, including `## Lessons`, and continue at the phase it names.
2. If it is missing, reconstruct the position from artifacts that every tier writes:

| Evidence | Phase done |
|---|---|
| `design/BRIEF.md` | 1 |
| `design/DIRECTION.md` (written only after CP1) | 2 |
| `design/SYSTEM.md` and the token CSS file | 3 |
| `design/SITEMAP.md` with a copy deck | 4 |
| the homepage file (`app/page.tsx` or `site/index.html`) and a CP2 entry | 5 |
| a file for every route listed in SITEMAP.md | 6 |
| `qa/gates.json` with verdict PASS and a judge round ending SHIP | 7 |

   Check the result against `git log --oneline`.
3. A checkpoint that was opened but has no logged verdict is still open. Present it again and say the user was mid-review; never assume approval.
4. Never redo a completed phase. Rewriting DIRECTION.md or SYSTEM.md on resume destroys the user's decisions.
5. Rewrite PROGRESS.md from what you found, print a three-line summary, and continue.

## Other entry points

- `iterate` (`skills/iterate/SKILL.md`): a change request to a site that has the full artifact set (BRIEF, DIRECTION, SYSTEM, SITEMAP). When artifacts are missing, iterate stops and offers a resume or retrofit.
- `retrofit` (`skills/retrofit/SKILL.md`): an audit of a site ultraweb did not build. It is read-only until the user approves fixes, and then writes the full artifact set so iterate can take over.
- `gates` (`skills/gates/SKILL.md`): run the checker on any site without a build.

A folder with partial artifacts is a resume, not an iterate or a retrofit.

## Done means

- `qa/gates.json` verdict PASS, or UNVERIFIED with every gap accepted by the user by name.
- The last judge round ends SHIP within the tier's round limit, or the remaining defects have been reported to the user.
- No placeholder text, `#` links, default favicon or unlabeled sample content.
- Metadata, sitemap, robots and an OG image exist for every public route.
- In guided mode, CP3 has a logged approval.
