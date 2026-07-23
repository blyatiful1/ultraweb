---
name: gate-antislop
description: Zero-tolerance sweep for the taste banned list in ultraweb builds — greppable commands for every mechanical cliché (purple-to-blue gradient combos, gradient headline text, emoji ranges in TSX, lorem ipsum, href="#", "Welcome to"/"Elevate your" dead copy, uniform rounded-xl+shadow-lg depth) plus screenshot checks for the visual clichés (three identical icon cards, wallpaper section rhythm, dark-navy-glow template, untouched shadcn look). Invoke in Phase 11 (Gates) of every ultraweb build, and whenever the user says "this looks AI-generated", "generic", "slop", "cliché", "looks like every other startup site", or "check for banned patterns".
---

# gate-antislop — the banned list, enforced

**Stage:** Phase 11 — Gates - **Reads:** all source (app/, components/, emails/, content/), screenshot set from gate-visual/gate-responsive, design/DIRECTION.md (the only source of exceptions) - **Writes:** design/QA.md §gate-antislop

## Standard

Every taste banned-list item swept mechanically. This gate is deterministic: a hit is a defect unless design/DIRECTION.md names that exact pattern and justifies it for this brief — "it looks intentional" is not a justification. Judgment calls (is this hero boring?) belong to gate-visual, not here. Zero tolerance means zero unjustified hits, not few.

## Checklist

Fifteen checks, each pass/fail in QA.md. Items 1–10 are the grep rows, 11–15 the screenshot checks.

1. **Slop gradient combos** — no purple/violet/fuchsia/pink/indigo gradient combos; raw CSS gradient stops judged.
2. **Gradient headline text** — every `bg-clip-text` hit has a DIRECTION.md citation.
3. **Emoji in code/copy** — zero emoji; icons come from the icons skill.
4. **Lorem/placeholders** — no lorem ipsum, placeholder domains, "Feature 1/2/3", TODO/TBD/FIXME.
5. **Dead links** — no bare `href="#"`.
6. **Dead startup copy** — none of the banned phrases, including copywriting's expanded list.
7. **Uniform depth** — no radius+shadow pair repeated on ≥6 elements across different sections.
8. **Glass smear** — at most 2 distinct glass surfaces without a citation.
9. **Glow-orb furniture** — no blur-orb background decoration without a citation.
10. **Motion on everything** — entrance animation on ≤60% of a page's sections.
11. **Three identical icon-cards** — no features row of three same-size icon-on-top cards.
12. **Wallpaper rhythm** — ≥2 distinct section padding values per page, with compression and release.
13. **All-centered symmetry** — at least one deliberate asymmetric moment per page.
14. **Dark-navy AI-startup template** — no navy-glow template look unless DIRECTION.md's archetype IS that, by name.
15. **Untouched shadcn look** — tokens visibly restyled from scaffold defaults, in code and in screenshots.

## How to verify

### Grep sweep (checklist 1–10)

Run every command, every time, against app/, components/, emails/, and content/. Config/data modules are in scope for the copy greps — nav labels, feature arrays, email subjects, and metadata constants live in plain `.ts` files. Each hit gets: a fix, or a DIRECTION.md citation recorded in QA.md.

1. **Slop gradient combos** — a `from-` hit paired with `to-(blue|indigo|violet|purple|cyan)-` on the same element is the cliché:
   `rg -n "from-(purple|violet|fuchsia|pink|indigo)-\d+" -g "*.tsx"`
   Also sweep raw CSS and judge the stops: `rg -n "linear-gradient" -g "*.css"`
2. **Gradient headline text** — every single hit needs a DIRECTION.md citation:
   `rg -n "bg-clip-text" -g "*.tsx"`
3. **Emoji in code/copy** — icons come from the icons skill, never emoji:
   `rg -n "[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}\x{FE0F}]" -g "*.tsx" -g "*.ts" -g "*.mdx" -g "*.md"`
4. **Lorem/placeholders** —
   `rg -ni "lorem|ipsum|placeholder\.com|placehold\.it|Feature [123]\b|TODO|TBD|FIXME" -g "*.tsx" -g "*.ts" -g "*.mdx" -g "*.md"`
5. **Dead links** — skip-link `href="#main"` does not match the bare pattern:
   `rg -n 'href="#"' -g "*.tsx"`
6. **Dead startup copy** — then every phrase from ultraweb:copywriting's expanded list:
   `rg -ni "welcome to|elevate your|unlock the power|seamlessly|empower" -g "*.tsx" -g "*.ts" -g "*.mdx" -g "*.md"`
7. **Uniform depth** — the same radius+shadow pair on ≥6 elements across different sections is depth without hierarchy, fail:
   `rg -n "rounded-(xl|2xl|3xl)[^\"']*shadow-(md|lg|xl)|shadow-(md|lg|xl)[^\"']*rounded-(xl|2xl|3xl)" -g "*.tsx"`
8. **Glass smear** — more than 2 distinct surfaces needs a DIRECTION.md citation (depth's rule: glass is rare and justified):
   `rg -c "backdrop-blur" -g "*.tsx"`
9. **Glow-orb furniture** — the navy-template tell: absolutely-positioned colored divs with heavy blur as background decoration; each needs a citation:
   `rg -n "blur-(2xl|3xl)" -g "*.tsx"`
10. **Motion on everything** — entrance animation on >60% of a page's sections makes motion meaningless (motion-language owns the "what never animates" list):
    `rg -c "whileInView|animate=|variants=" -g "*.tsx"` per section file

**Untouched-shadcn check (code side):** open app/globals.css — a neutral ramp with zero chroma throughout (pure-gray oklch), radius tokens unchanged since scaffold, and a lone default sans means the primitives shipped as the design. Cross-check every token against the decisions in design/SYSTEM.md.

### Screenshot sweep (checklist 11–15)

Use the full-page 375/1440 screenshot set. Judge each check mechanically:

1. **Three identical icon-cards** — any features section rendering three same-size, same-layout, icon-on-top cards in a row: fail (feature-sections holds the replacement patterns).
2. **Wallpaper rhythm** — per page, `browser_evaluate`: `[...document.querySelectorAll("main section")].map(s=>{const c=getComputedStyle(s);return c.paddingTop+"/"+c.paddingBottom})` — one identical value across all sections is uniform-py wallpaper: fail. Pass needs ≥2 distinct values with visible compression and release (layout-grid designs the rhythm).
3. **All-centered symmetry** — every section centered, same container width, no asymmetric moment on the entire page: fail; taste requires at least one deliberate asymmetry.
4. **Dark-navy AI-startup template** — near-black blue ground, glowing accent borders, blur orbs, applied to a brief that is not that: fail unless DIRECTION.md's archetype IS that, by name.
5. **Untouched shadcn look** — screenshots reading as a component demo (default radius, slate, stock shadows, stock focus blue): fail.

## Exception protocol

1. A hit survives only if design/DIRECTION.md names the exact pattern — "we WILL use gradient text on the hero H1; it is the signature move" — written there BEFORE this gate runs, or added by re-invoking direction, after which gate-visual must re-judge the change.
2. Exceptions are per-pattern, per-location. A justified hero gradient does not license gradient text in cards; one justified glass surface does not license four.
3. Each exception is recorded in QA.md as: pattern → file:line → the DIRECTION.md quote.
4. No DIRECTION.md line → defect, even if it looks great. Beauty without a recorded decision is exactly the failure mode this gate exists to catch.

## Pass criteria

Zero unjustified hits across all 10 grep rows and all 5 screenshot checks, every page, both viewports. Each justified exception follows the protocol above. Every fix re-runs the exact grep or re-shoots the affected section — a green claim without the rerun is unverified.

## QA.md entry

```md
## gate-antislop — PASS (2026-07-16)
greps: 10/10 clean (bg-clip-text: 1 hit at hero.tsx:14 justified — DIRECTION.md "signature move: ink-wash headline")
screens: icon-card rows none · rhythm 3 distinct paddings/page · asymmetry present (hero offset on /) · no template look · shadcn restyled
fixed: 2x "Seamlessly" in features copy · backdrop-blur on 4 cards → border treatment per depth scale
residual: none
```

## Anti-patterns

- Whitelisting a hit because it "looks fine" — only a written DIRECTION.md justification counts, and it names the exact pattern
- Sweeping app/ but skipping components/, emails/, and MDX content — copy slop hides in the leaves
- Fixing wallpaper rhythm by randomizing paddings — rhythm is designed in layout-grid, not noised until the grep passes
- Deleting the emoji but leaving "Welcome to" — the sweep is a set, not a menu; run every row every time
- Rewriting banned copy into synonyms of itself ("Elevate your" → "Uplift your") — route rewrites through copywriting's voice spec
- Treating this gate as the design review — it catches clichés, not blandness; boring-but-clean escalates to gate-visual

## Worked example — Tidepool, dark-first port-logistics analytics

design/DIRECTION.md: "Precision Instrument — calm, data-forward, dark mode first-class. Signature move: the live berth timeline; no decorative glow." The dark ground is licensed; navy-glow furniture is not.

Phase-11 sweep, written to design/QA.md §gate-antislop:

```md
## gate-antislop — FAIL→PASS (2026-07-16)
greps: 8/10 clean · check 3 (emoji) 1 hit — content/changelog/2026-06-berth-eta.mdx:3, heading "⚓ Berth ETA v2"; no DIRECTION exception → defect
check 9 (glow-orb) 1 hit — components/hero.tsx:34, absolute blur-3xl div oklch(0.68 0.12 200 / .35) behind the timeline; "Precision Instrument" is not the navy-glow archetype → defect
screens: rhythm 3 distinct paddings/page · asymmetry present (timeline bleeds right on /) · icon-card rows none · shadcn restyled (teal accent, radius tightened from scaffold)
fixed: changelog emoji → lucide Ship, 16px, stroke matched to accent teal — routed to ultraweb:icons
fixed: hero glow-orb deleted; the live berth timeline (JetBrains Mono numerals) carries the hero, no crutch — routed to ultraweb:showpiece
re-grep: check 3 + check 9 clean · hero reshot: reads as an instrument, not a template
residual: none
```

Rejected the shortcut of citing the orb in DIRECTION.md just to survive the sweep — furniture is not the signature move, and a citation minted only to pass a gate is exactly the beauty-without-a-decision this gate exists to catch. Handoff: the corrected QA.md §gate-antislop feeds ultraweb:gate-visual, which re-judges the reshot hero against the required list.

## Composes with

- ultraweb:taste — the banned list this gate mechanizes; on any ambiguity, the constitution wins.
- ultraweb:direction — the only document that can justify an exception, pattern by pattern.
- ultraweb:copywriting — owns the expanded banned-phrase list and rewrites every copy hit in voice.
- ultraweb:feature-sections — the fix when the three-icon-cards check fails.
- ultraweb:layout-grid — the fix for wallpaper rhythm and missing asymmetry.
- ultraweb:gate-visual — supplies the screenshot set and takes the subjective judgments this gate refuses to make.
- ultraweb:icons — when check 3 flags an emoji, the replacement lucide glyph, its size, and its stroke weight come from here, never an ad-hoc inline SVG.
- ultraweb:imagery — when check 4 flags a placeholder.com src, the real photograph or generated asset that replaces it is specced here.
- ultraweb:shape-language — when check 7 flags one radius+shadow pair across ≥6 elements, the corner-and-depth system that re-differentiates them is owned here.
- ultraweb:social-proof — when the three-identical-cards check (11) fires on a logo wall or testimonial row rather than feature cards, the varied replacement lives here, not feature-sections.
