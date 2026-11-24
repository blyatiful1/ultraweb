# gates

How to run the deterministic checks and read the result. One script runs every gate; the lead reads a short summary.

Load when: Phase 5 (quick run), Phase 7 (full run), or any request to check a site's quality.
Reads: `qa/gates.json`, `qa/GATES.md`, `qa/waivers.json`. Writes: `qa/gates.json`, `qa/GATES.md`, `qa/shots/*.png`, `qa/raw/*.json`, `qa/gates-done.json` (only with `--done`).

## Running it

```
node <plugin>/scripts/gates.mjs --url <base-url> [--routes /,/pricing] [--project <dir>]
     [--out <dir>] [--only code,content,a11y,responsive,perf,tells] [--quick]
     [--js-budget <kB>] [--lighthouse] [--done "<reason>"]
```

| When | Command | Scope |
|---|---|---|
| Phase 5, after the homepage works | `--quick` | homepage only, 375 and 1440, light theme only |
| Phase 7, before acceptance | no `--quick` | all routes, 375/768/1440, light and dark where the site has both |
| Re-check one area after a fix | `--only a11y` | named gates, all routes |

Rules for the server:
- Next.js: `rm -rf .next && npm run build`, then `PORT=3100 npm start` in the background, and pass `--url http://localhost:3100`. Keep one port for the whole phase. Never audit `next dev`: scores and bundle sizes are meaningless there. Rebuild after every source, config or token change; the server serves the build, not the working tree.
- Static path: serve `site/` with any static server and pass its URL.
- Any other site: pass its URL.

Routes come from `--routes`, else `qa/routes.txt` (one per line), else a same-origin crawl from `/` (cap 25). Pass dynamic routes with at least two real slugs. A full run takes roughly ten seconds per route on a local server, so while fixing use `--routes` and `--only` for what the fix touched and finish with one full run.

Playwright is resolved from the project's `node_modules`, then the plugin directory, then globally. If none resolves the script prints an install line and exits 3.

Exit codes: 0 PASS, 1 FAIL, 3 UNVERIFIED or cannot run. stdout is at most 60 lines; read `qa/GATES.md` for the table and `qa/raw/*.json` only for a specific failing check.

## What each gate checks

Statuses: `pass`, `fail`, `review`, `skip`, `error`.

| Gate | Check | Threshold |
|---|---|---|
| code | `tsc --noEmit`, the project's lint script if present, `site-check.mjs` | exit 0; runs only when a `package.json` or source tree exists |
| content | internal links and `#anchors` | every internal href answers 200; every anchor id exists on its target page; no empty or `#` hrefs |
| content | headings | exactly one `h1` per route; no empty or generic headings |
| content | metadata | `<title>`, meta description and `<html lang>` present on every route; titles and descriptions unique across routes |
| content | placeholder text | zero lorem ipsum, "your text here" and similar, unreplaced `TODO-COPY` markers, placeholder image services |
| a11y | axe, tags `wcag2a`, `wcag2aa`, `wcag22aa` | zero violations |
| a11y | contrast | text 4.5:1; large text (24px, or 18.66px bold) 3:1; non-text UI and focus rings 3:1; pairs over images or gradients are `review` |
| a11y | keyboard walk | skip link first; no trap; visible focus ring on every stop |
| a11y | landmarks | one `main`; `nav`s distinguished; headings do not skip a level |
| a11y | alt and labels | every image has `alt`; controls have accessible names; no filename alt |
| a11y | targets | at least 24x24 CSS px (WCAG 2.2 target size) |
| a11y | forms | labels, `aria-describedby` error binding, `aria-invalid`, `autocomplete`; a required field must say so in its label text ("required", "Pflicht" or an asterisk), not only in a hint |
| a11y | text spacing | with the WCAG 1.4.12 override applied, nothing clips or overflows horizontally |
| responsive | overflow | no horizontal scroll at 375, 768 and 1440 |
| responsive | targets | at least 44x44 CSS px at 375; inline paragraph links exempt |
| responsive | screenshots | one per route and width in `qa/shots/` |
| perf | cold-load JS | transferred bytes on a cold load against the budget: 140 kB by default; pass `--js-budget <kB>` for an app-like route or a budget set in `design/DIRECTION.md` |
| perf | fonts | no failed font face; total font transfer at most 300 kB |
| perf | observed LCP and CLS | per route on the local production server: LCP above 2,500 ms fails; CLS above 0.05 fails |
| perf | Lighthouse | only with `--lighthouse` and only when Lighthouse is installed; report-only, it never fails the run |
| tells | census of AI-default patterns, section rhythm | report-only: every item is `review` |

### What `review` means

A `review` item never fails the run. It is something a script can count but not rule on. The lead lists `review` items in the Phase 7 summary and hands them to `design-judge`, who rules. A `review` item the judge confirms becomes a fix; the lead does not rule on its own build.

## Fix loop

1. Run the gates. Read the failing checks; each carries a selector or file and a one-line measurement.
2. Fix at the returned selector or file. Fix the cause (a token, a component), not one element, when the same pair fails on several surfaces.
3. Rebuild and restart the server, then re-run. Use `--only` for the affected gates, and the full run before closing the phase.
4. `qa/gates.json` carries a `round`. Every run except a `--quick` one counts, and a PASS clears the count. At four counted failing rounds in a row the script prints a line starting `ESCALATE:`. Stop fixing and report to the user: the failing checks, what was tried, and the likely cause.

Do not weaken a check, raise a budget, or add `eslint-disable`, `@ts-ignore` or `as any` to turn a run green.

### Waivers

`qa/waivers.json` holds at most 5 entries, each `{check, route?, selector?, reason}`. A waived failure is reported as `waived`. Waive only a check you can show is a false positive (for example a contrast pair over a video the script cannot resolve, where you measured the worst frame by hand). Disliking the result, lacking time, or an unfixable design is not a reason. Every waiver is reported to the user in the Phase 7 summary with its reason.

### Stopping

The Stop hook blocks a session ending with a FAIL in `qa/gates.json`, at most twice. If you are finished for a reason the gates cannot settle, run `gates.mjs --done "<reason>"`; this writes `qa/gates-done.json`, and the hook stands down. State the reason to the user.

## Judgment items a script cannot settle

Check these yourself, or give them to `design-judge`. Keep each to one line in the report.

- Reduced motion: emulate `prefers-reduced-motion: reduce`, reload, scroll to the bottom, and look. Content must be present and any animated SVG must end drawn.
- Focus order: the tab order matches the visual order, and the focused element is not hidden under a sticky header.
- Heading outline: read the `h1` and `h2` sequence alone. It should argue the page's goal; a grammatical table of contents fails.
- Alt text meaning: the script confirms alt exists, not that it describes the image or that `alt=""` is honest.
- Screen reader: a spot check with a real screen reader is not automated here. Automated checks cover part of WCAG. Never claim conformance from a green run; say "no automated failures found" and list what was not tested.
- Voice and consistency of copy across sections.

## Performance

Measured natively, with no Lighthouse: encoded script bytes on a cold reload at network idle, font requests, and the LCP and CLS values the browser reports during the load. This is a lab load on one machine, so treat a number within a few percent of its budget as a tie.

Add `--lighthouse` when the user asks for a Lighthouse score, when a route sits near a budget, or at flagship tier. It runs Lighthouse on mobile emulation against the production URL. A score within 2 points of 90 deserves the median of 3 runs.

INP cannot be measured in a lab load. It needs real interactions. The script does not report it. With Lighthouse, Total Blocking Time is available as a proxy only; it correlates with INP but is not INP. For a real INP number, script a specific interaction in Playwright and read the Event Timing entries, or use field data. Do not report a passing INP from this tool.

## Next-specific code checks worth keeping

The `code` gate runs tsc, lint and `site-check.mjs`. Add these greps in a Next project; each should return nothing unless noted.

- `ls middleware.ts`: absent when the stack uses `proxy.ts` (check `stack/versions.json` and the framework's current docs).
- `grep -rn "framer-motion" package.json app components`: the package is `motion`.
- `grep -rn "onLoadingComplete" app components`: removed from the image component.
- `grep -rn "priority" app components --include="*.tsx"`: deprecated image prop; check the current replacement.
- `grep -rn "tailwind.config\|@tailwind base\|theme.extend" . --exclude-dir=node_modules`: Tailwind v3 relics where the project uses CSS-first config.
- `grep -rn "next lint" package.json`: removed command; call ESLint directly.
- `grep -rn "@ts-ignore\|@ts-expect-error\|as any" app components lib`: each hit needs a justification comment.
- `grep -rln "use client" app components`: report the count and the list as a `review` number. Zero hits in any `layout.tsx` and in page roots, unless justified. There is no pass or fail band; a count that keeps climbing as pages are added means interactivity is sitting too high in the tree.
- Unused dependencies: run `npx knip` or `npx depcheck` rather than a hand-written loop.

## Verdicts and what may ship

| Verdict | Meaning | May ship |
|---|---|---|
| PASS | no unwaived failures, no errors, browser ran | yes, after the judge's SHIP and the user's acceptance |
| FAIL | at least one unwaived `fail` | never |
| UNVERIFIED | no browser, or any check errored | a preview and a handoff; production deploy only after the user accepts each named gap, immediately before the deploy command |

Never write PASS for an UNVERIFIED run. An `error` is not a pass: re-run once, then report it as UNVERIFIED with the reason.
