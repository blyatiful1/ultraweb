---
name: gate-antislop
description: Zero-tolerance sweep for the taste banned list in ultraweb builds — greppable commands for every mechanical cliché (purple-to-blue gradient combos, gradient headline text, emoji ranges in TSX, lorem ipsum, href="#", "Welcome to"/"Elevate your" dead copy, uniform rounded-xl+shadow-lg depth, the AI-era "AI-powered"/sparkle-badge tells) plus screenshot checks for the visual clichés (three identical icon cards, wallpaper section rhythm, dark-navy-glow template, reflexive bottom-right chat bubble, untouched shadcn look). Invoke in Phase 11 (Gates) of every ultraweb build, and whenever the user says "this looks AI-generated", "generic", "slop", "cliché", "looks like every other startup site", or "check for banned patterns".
---

# gate-antislop — the banned list, enforced

**Stage:** Phase 11 — Gates, third of six (code → responsive → **antislop** → content → accessibility → performance), executed by the `gate-runner` agent against the production server of record the Lead built and started in the Phase 11 preamble (`mkdir -p qa && rm -rf .next && npm run build > qa/build.log 2>&1`, then `PORT=3100 npm start > qa/prod.log 2>&1 &`); the Lead never loads this file - **Reads:** all source (app/, components/, emails/, content/), design/DIRECTION.md (the only source of exceptions), design/BRIEF.md (the AI-gate), gate-responsive's capture paths - **Writes:** design/QA.md §gate-antislop, qa/gate-antislop.log, qa/gate-antislop-wallpaper-rhythm.json

## Standard

Every taste banned-list item swept mechanically. Deterministic: a hit is a defect unless design/DIRECTION.md names that exact pattern and justifies it for this brief — "it looks intentional" is not a justification. Is-this-hero-boring belongs to gate-visual. Zero tolerance means zero unjustified hits, not few.

## Checklist

Seventeen checks. The runner's verdict covers 1–11, nothing else; check 13's measurement comes back attached to its judgment-open item. Checks 12–17 are ruled by `design-judge` in gate-visual's round-1 sweep, reported as `antislop-<n>: pass|violation`; the runner forwards the evidence each item names and rules on none.

1. **Slop gradient combos** — no purple/violet/fuchsia/pink/indigo gradient combos; raw CSS gradient stops judged. [MEASURED]
2. **Gradient headline text** — every `bg-clip-text` hit has a DIRECTION.md citation. [MEASURED]
3. **Emoji in code/copy** — zero emoji; icons come from the icons skill. [MEASURED]
4. **Lorem/placeholders/fabricated proof** — no lorem ipsum, placeholder domains, "Feature 1/2/3", TODO/TBD/FIXME; no fake-proof tells (`★★★★★`, "Happy Customer", "John D."-style anonymous attribution); no `UNVERIFIED-PROOF` demo tag unless design/BRIEF.md marks the build demo/staging. [MEASURED]
5. **Dead links** — no bare `href="#"`. [MEASURED]
6. **Dead startup copy** — none of the banned phrases, including "AI-powered"/"powered by AI" and copywriting's expanded list. [MEASURED]
7. **Uniform depth** — no radius+shadow pair repeated on ≥6 elements across different sections. [MEASURED]
8. **Glass smear** — at most 2 distinct glass surfaces without a citation. [MEASURED]
9. **Glow-orb furniture** — no blur-orb background decoration without a citation. [MEASURED]
10. **Motion on everything** — entrance animation on ≤60% of a page's sections; an uncited second engine or renderer is itself a hit. [MEASURED]
11. **AI-era reflexes** — no bare four-point sparkle as an "AI" badge, no "AI-powered" copy, no fixed bottom-right launcher unless design/BRIEF.md's AI-gate scoped an assistant. [MEASURED]
12. **Three identical icon-cards** — no features row of three same-size, same-layout, icon-on-top cards (feature-sections holds the replacement patterns). Evidence: the 1440 capture paths. [JUDGMENT → design-judge]
13. **Wallpaper rhythm** — ≥2 distinct section padding values per page, with visible compression and release (layout-grid designs the rhythm). Fail is `verdict === 'wallpaper'` (every section on the route sharing one padding value); a one-section route is `ok`. Evidence: verdict + `distinctPaddings` per route from `wallpaper-rhythm.mjs`, which the runner measures and returns attached to the item, plus the capture paths. [JUDGMENT → design-judge]
14. **All-centered symmetry** — every section centered at one container width with no asymmetric moment on the page: fail; taste requires one deliberate asymmetry. Evidence: the capture paths. [JUDGMENT → design-judge]
15. **Dark-navy AI-startup template** — near-black blue ground, glowing accent borders, blur orbs, on a brief that is not that: fail unless DIRECTION.md's archetype IS that, by name. Evidence: capture paths + the DIRECTION.md archetype line, quoted. [JUDGMENT → design-judge]
16. **Untouched shadcn look** — screenshots reading as a component demo: default radius, slate ramp, stock shadows, stock focus blue. Evidence: capture paths + the runner's globals.css report. [JUDGMENT → design-judge]
17. **Corner chat-bubble** — a floating round chat/assistant blob pinned bottom-right is the Intercom reflex; a brief-scoped assistant moves to nav, a footer CTA, or its own /ask route. Evidence: viewport capture paths + the BRIEF AI-gate line + check 11's hits; an Accept-primary/Reject-buried consent banner seen in passing goes to ultraweb:consent. [JUDGMENT → design-judge]

## How to verify

**Runner contract.** The Lead passes `gate` · `pluginRoot` · `projectRoot` · `prodUrl` · `devUrl` · `artifacts` (BRIEF, DIRECTION, SYSTEM, SITEMAP, QA, PROGRESS) · `tier` · `market` · `themeStrategy`, plus optional `rerunOnly` (check numbers). Out: verdict `PASS` | `PASS-ON-MEASURED` | `FAIL` | `UNVERIFIED` (`PASS` only when judgment-open is empty); each failed check as `check · file:line · one line · owner skill · MECHANICAL|DESIGN`; the judgment-open evidence for 12–17; the QA.md entry appended; the path `qa/gate-antislop.log`.
The runner never runs `npm run build`, `npm start`, `npm run dev`, `rm -rf .next` or `npm install`, and edits nothing — no source, no `design/*` beyond the QA.md append.
Full stdout/stderr of every failing or unverified command goes to `<projectRoot>/qa/gate-antislop.log`; the return carries the path, never the contents.
Degraded mode: no browser → checks 12–17 are all UNVERIFIED, named as such (13 for its measurement; 12/14–17 because gate-visual's round-1 sweep cannot run); rows 1–11 still run in full — pure code sweeps.

### Pattern sweep (checks 1–11)

`node <plugin>/scripts/site-check.mjs .` runs the deterministic absolutes (slop strings, dead links, fake-proof tells, UNVERIFIED-PROOF) as a pre-pass; the rows below remain the authority and cover what it doesn't.

Run every command, every time, over the production input set: the repo root (`rg` is gitignore-aware, so `node_modules`/`.next` drop out) minus `design/` and any test/fixture trees — `rg <pattern> . -g '!design/**'`. Copy hides outside app/ — `src/`, `lib/` config modules, data files (nav labels, feature arrays, email subjects, JSON) — so the `-g "*.tsx"` rows sweep root-wide. Each hit gets a fix or a citation.

1. `rg -n "from-(purple|violet|fuchsia|pink|indigo)-\d+" -g "*.tsx"` — a `from-` hit paired with `to-(blue|indigo|violet|purple|cyan)-` on the same element is the cliché. Raw CSS too, stops judged: `rg -n "linear-gradient" -g "*.css"`
2. `rg -n "bg-clip-text" -g "*.tsx"`
3. `rg -n "[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}\x{FE0F}]" -g "*.tsx" -g "*.ts" -g "*.mdx" -g "*.md"`
4. `rg -ni "lorem|ipsum|placeholder\.com|placehold\.it|Feature [123]\b|TODO|TBD|FIXME" -g "*.tsx" -g "*.ts" -g "*.mdx" -g "*.md"`
   Fake-proof tells and the demo-only tag: `rg -n "★★★★★|Happy Customer|John D\.|UNVERIFIED-PROOF" . -g '!design/**'` and `rg -ni "highly recommend|game.changer|best decision" . -g '!design/**'`
   `UNVERIFIED-PROOF` passes ONLY when design/BRIEF.md marks the build demo/staging AND the quote is visibly labeled in the rendered UI; on a production build every hit is a defect, and ship re-checks it as a launch blocker. An attribution in no BRIEF.md proof inventory is fabricated even untagged — escalate to gate-content's trace check.
5. `rg -n 'href="#"' -g "*.tsx"` — skip-link `href="#main"` does not match the bare pattern.
6. `rg -ni "welcome to|elevate your|unlock the power|seamlessly|empower|ai-powered|powered by ai|ai-driven" -g "*.tsx" -g "*.ts" -g "*.mdx" -g "*.md"` — plus every phrase from ultraweb:copywriting's expanded list.
7. `rg -n "rounded-(xl|2xl|3xl)[^\"']*shadow-(md|lg|xl)|shadow-(md|lg|xl)[^\"']*rounded-(xl|2xl|3xl)" -g "*.tsx"` — count distinct sections, not hits.
8. `rg -c "backdrop-blur" -g "*.tsx"` — depth's rule: glass is rare and justified.
9. `rg -n "blur-(2xl|3xl)" -g "*.tsx"` — the navy-template tell: absolutely-positioned colored divs with heavy blur as background decoration.
10. `rg -c "whileInView|animate=|variants=" -g "*.tsx"` per section file — past 60% of a page's sections motion means nothing (motion-language owns the "what never animates" list). The cap counts moments, not libraries: find a second engine by import specifier, never by API name (`animate(` is also motion/react and WAAPI) — `rg -l 'from "animejs"' app components lib`, then inside those files only `rg -c "animate\(|createTimeline\(|onScroll\("` counts toward the same 60%. A commissioned persistent scene is **ONE** moment across every route, not one per route: don't count each route's chrome against the cap; count whether anything *else* animates — the scene spent the whole signature budget. Renderer, stricter: `rg -l 'from "three"|from "@react-three/' app components lib` with no DIRECTION.md line naming `ultraweb:set-design` **with its route scope and byte budget** fails.
11. `rg -n "Sparkle" -g "*.tsx"` — the Sparkle/Sparkles/WandSparkles family (the ✨ glyph is check 3's); a lone sparkle "AI" badge fails, and passes only paired with a direction-specific second icon or cited.
    `rg -n "fixed[^\"']*bottom-[\d\[][^\"']*right-[\d\[]|bottom-[\d\[][^\"']*right-[\d\[][^\"']*fixed" -g "*.tsx"` — grep the position, then confirm intent; sweep raw `position:fixed` with `bottom`/`right` in `*.css` too. A chat/assistant widget passes only on a BRIEF.md AI-gate, and even then it leaves the corner.

Then read app/globals.css for check 16's evidence: a zero-chroma neutral ramp, scaffold-default radius tokens and a lone default sans mean the primitives shipped as the design. Report it against design/SYSTEM.md; do not rule on it.

### Rhythm measurement (check 13)

Run `<plugin>/scripts/measure/wallpaper-rhythm.mjs` through `browser_run_code_unsafe` (`filename:` loads the script; no `window.__ultraweb` seed needed) against `prodUrl`, once per route. The result returns into the runner's context, never the Lead's: `verdict === 'wallpaper'` is the route's fail condition, forwarded not ruled on. Write the list-shaped `sections[]` to `<projectRoot>/qa/gate-antislop-wallpaper-rhythm.json` with the Write tool and grep it for the offending route; forward `verdict` and `distinctPaddings` as check 13's evidence. Fallback (Phase 0 recorded `measure-library: unavailable`): the V1.8.0 inline snippet — `git -C <plugin> show V1.8.0:skills/gate-antislop/SKILL.md`, a git checkout only; in a marketplace snapshot check 13 goes UNVERIFIED.

### Screenshot checks (12–17)

Not the runner's. `design-judge` performs them in gate-visual's round 1 from its own captures (`qa/visual/round-1/`) — viewport frames plus sectionals, per route and theme; no full-page frame exists to ask for, and check 17's fixed launcher rides the viewport anyway. The capture paths the runner forwards are the Lead's evidence, not the judge's input; the Lead rules from the judge's return.

## Exception protocol

1. A hit survives only if design/DIRECTION.md names the exact pattern — "we WILL use gradient text on the hero H1; it is the signature move" — written there BEFORE this gate runs, or added by re-invoking direction, after which gate-visual re-judges the change. For the AI-era checks (11, 17) the justifying document is design/BRIEF.md's AI-gate, not DIRECTION.md, and even a scoped assistant leaves the reflex corner.
2. Exceptions are per-pattern, per-location. A justified hero gradient does not license gradient text in cards; one justified glass surface does not license four.
3. Each exception is recorded in QA.md as: pattern → file:line → the DIRECTION.md quote.
4. No DIRECTION.md line → defect, even if it looks great — beauty without a recorded decision is the failure mode this gate exists to catch.

## Pass criteria

Zero unjustified hits across all 11 pattern rows, `verdict: ok` from wallpaper-rhythm on every route, no violation on 12–17 in gate-visual's round-1 sweep (or, in degraded mode, UNVERIFIED on 12–17). Each exception follows the protocol above. Every fix re-runs the exact grep or re-measures the route — the production server serves the build of record, not the working tree, so any source, config, token or dependency fix repeats the Phase 11 preamble before the Lead re-dispatches with `rerunOnly` naming those checks; a token or config change widens that to the full gate.

## QA.md entry

The runner APPENDS this with a `>>` heredoc: never rewrites QA.md, never reads it for an anchor. On `rerunOnly` it appends a dated `re-run` block listing only the re-run checks and their new results. The rulings block below is the LEAD's, appended once gate-visual's round 1 reports: the summary line plus `design-judge`'s six `antislop-<n>` lines verbatim.

```md
## gate-antislop — PASS-ON-MEASURED (2026-07-16)
greps: 11/11 clean (bg-clip-text: 1 hit at hero.tsx:14 justified — DIRECTION.md "signature move: ink-wash headline")
rhythm: / 3 distinct paddings · /work 2 · verdict ok (wallpaper-rhythm.mjs)
fixed: 2x "Seamlessly" in features copy · backdrop-blur on 4 cards → border treatment per depth scale
residual: none
judgment-open: 12–17 → design-judge (gate-visual round 1)
```

```md
## gate-antislop — rulings (2026-07-18)
antislop 12–17: ruled 2026-07-18 from gate-visual round 1 — 1 violation
antislop-12: pass
antislop-13: pass
antislop-14: violation — /work, every section centered at 72rem
antislop-15: pass
antislop-16: pass
antislop-17: pass
```

## Anti-patterns

- Whitelisting a hit because it "looks fine" — only a written DIRECTION.md justification counts, and it names the exact pattern
- Sweeping app/ but skipping components/, emails/, and MDX content — copy slop hides in the leaves
- Fixing wallpaper rhythm by randomizing paddings — rhythm is designed in layout-grid, not noised until the grep passes
- Rewriting banned copy into synonyms of itself ("Elevate your" → "Uplift your") — route rewrites through copywriting's voice spec
- Treating this gate as the design review — it catches clichés, not blandness; boring-but-clean escalates to gate-visual

## Worked example — Tidepool, dark-first port-logistics analytics

Moved to `references/example.md` — read only when this build's case is genuinely ambiguous; the sections above are the decision material.

## Composes with

Moved to `references/composes.md` — the handoff map; load it when orchestrating this skill against its neighbors.
