---
name: gate-antislop
description: Zero-tolerance sweep for the taste banned list in ultraweb builds — greppable commands for every mechanical cliché (purple-to-blue gradient combos, gradient headline text, emoji ranges in TSX, lorem ipsum, href="#", "Welcome to"/"Elevate your" dead copy, uniform rounded-xl+shadow-lg depth, the AI-era "AI-powered"/sparkle-badge tells) plus screenshot checks for the visual clichés (three identical icon cards, wallpaper section rhythm, dark-navy-glow template, reflexive bottom-right chat bubble, untouched shadcn look). Invoke in Phase 11 (Gates) of every ultraweb build, and whenever the user says "this looks AI-generated", "generic", "slop", "cliché", "looks like every other startup site", or "check for banned patterns".
---

# gate-antislop — the banned list, enforced

**Stage:** Phase 11 — Gates - **Reads:** all source (app/, components/, emails/, content/), screenshot set from gate-visual/gate-responsive, design/DIRECTION.md (the only source of exceptions) - **Writes:** design/QA.md §gate-antislop

## Standard

Every taste banned-list item swept mechanically. This gate is deterministic: a hit is a defect unless design/DIRECTION.md names that exact pattern and justifies it for this brief — "it looks intentional" is not a justification. Judgment calls (is this hero boring?) belong to gate-visual, not here. Zero tolerance means zero unjustified hits, not few.

## Checklist

Seventeen checks, each pass/fail in QA.md. Items 1–11 are the grep rows, 12–17 the screenshot checks.

1. **Slop gradient combos** — no purple/violet/fuchsia/pink/indigo gradient combos; raw CSS gradient stops judged.
2. **Gradient headline text** — every `bg-clip-text` hit has a DIRECTION.md citation.
3. **Emoji in code/copy** — zero emoji; icons come from the icons skill.
4. **Lorem/placeholders/fabricated proof** — no lorem ipsum, placeholder domains, "Feature 1/2/3", TODO/TBD/FIXME; no fake-proof tells (`★★★★★`, "Happy Customer", "John D."-style anonymous attribution); no `UNVERIFIED-PROOF` demo tag unless design/BRIEF.md marks the build demo/staging.
5. **Dead links** — no bare `href="#"`.
6. **Dead startup copy** — none of the banned phrases, including "AI-powered"/"powered by AI" and copywriting's expanded list.
7. **Uniform depth** — no radius+shadow pair repeated on ≥6 elements across different sections.
8. **Glass smear** — at most 2 distinct glass surfaces without a citation.
9. **Glow-orb furniture** — no blur-orb background decoration without a citation.
10. **Motion on everything** — entrance animation on ≤60% of a page's sections.
11. **AI-era reflexes** — no bare four-point sparkle as an "AI" badge, no "AI-powered" copy, no reflexive bottom-right chat bubble unless design/BRIEF.md's AI-gate scoped an assistant.
12. **Three identical icon-cards** — no features row of three same-size icon-on-top cards.
13. **Wallpaper rhythm** — ≥2 distinct section padding values per page, with compression and release.
14. **All-centered symmetry** — at least one deliberate asymmetric moment per page.
15. **Dark-navy AI-startup template** — no navy-glow template look unless DIRECTION.md's archetype IS that, by name.
16. **Untouched shadcn look** — tokens visibly restyled from scaffold defaults, in code and in screenshots.
17. **Corner chat-bubble** — no reflexive bottom-right chat launcher unless the brief's AI-gate calls for one; consent-banner unfairness (Accept-primary/Reject-buried) noted in passing → ultraweb:consent.

## How to verify

### Grep sweep (checklist 1–11)

Run every command, every time, against app/, components/, emails/, and content/. Config/data modules are in scope for the copy greps — nav labels, feature arrays, email subjects, and metadata constants live in plain `.ts` files. Each hit gets: a fix, or a DIRECTION.md citation recorded in QA.md.

1. **Slop gradient combos** — a `from-` hit paired with `to-(blue|indigo|violet|purple|cyan)-` on the same element is the cliché:
   `rg -n "from-(purple|violet|fuchsia|pink|indigo)-\d+" -g "*.tsx"`
   Also sweep raw CSS and judge the stops: `rg -n "linear-gradient" -g "*.css"`
2. **Gradient headline text** — every single hit needs a DIRECTION.md citation:
   `rg -n "bg-clip-text" -g "*.tsx"`
3. **Emoji in code/copy** — icons come from the icons skill, never emoji:
   `rg -n "[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}\x{FE0F}]" -g "*.tsx" -g "*.ts" -g "*.mdx" -g "*.md"`
4. **Lorem/placeholders/fabricated proof** —
   `rg -ni "lorem|ipsum|placeholder\.com|placehold\.it|Feature [123]\b|TODO|TBD|FIXME" -g "*.tsx" -g "*.ts" -g "*.mdx" -g "*.md"`
   Fake-proof tells (social-proof's banned strings) and its demo-only tag:
   `rg -n "★★★★★|Happy Customer|John D\.|UNVERIFIED-PROOF" -g "*.tsx" -g "*.ts" -g "*.mdx"` and `rg -ni "highly recommend|game.changer|best decision" -g "*.tsx" -g "*.mdx"`
   `UNVERIFIED-PROOF` passes ONLY when design/BRIEF.md explicitly marks the build demo/staging AND the quote is visibly labeled in the rendered UI; on a production build every hit is a defect, and ship re-checks it as a launch blocker. A testimonial attribution that appears in no BRIEF.md proof inventory is fabricated proof even without the tag — escalate it to gate-content's trace check, never wave it through as copy.
5. **Dead links** — skip-link `href="#main"` does not match the bare pattern:
   `rg -n 'href="#"' -g "*.tsx"`
6. **Dead startup copy** — the banned phrases, the AI-era filler "AI-powered / powered by AI / AI-driven", then every phrase from ultraweb:copywriting's expanded list:
   `rg -ni "welcome to|elevate your|unlock the power|seamlessly|empower|ai-powered|powered by ai|ai-driven" -g "*.tsx" -g "*.ts" -g "*.mdx" -g "*.md"`
7. **Uniform depth** — the same radius+shadow pair on ≥6 elements across different sections is depth without hierarchy, fail:
   `rg -n "rounded-(xl|2xl|3xl)[^\"']*shadow-(md|lg|xl)|shadow-(md|lg|xl)[^\"']*rounded-(xl|2xl|3xl)" -g "*.tsx"`
8. **Glass smear** — more than 2 distinct surfaces needs a DIRECTION.md citation (depth's rule: glass is rare and justified):
   `rg -c "backdrop-blur" -g "*.tsx"`
9. **Glow-orb furniture** — the navy-template tell: absolutely-positioned colored divs with heavy blur as background decoration; each needs a citation:
   `rg -n "blur-(2xl|3xl)" -g "*.tsx"`
10. **Motion on everything** — entrance animation on >60% of a page's sections makes motion meaningless (motion-language owns the "what never animates" list):
    `rg -c "whileInView|animate=|variants=" -g "*.tsx"` per section file
    The cap counts moments, not libraries, so it is engine-agnostic. First find the files that ship the second engine — by import specifier, never by API name, since `animate(` is also motion/react and WAAPI: `rg -l 'from "animejs"' app components lib`. Inside those files only, `rg -c "animate\(|createTimeline\(|onScroll\("` counts toward the same 60%. And the dependency itself is a slop tell when uncited: a second animation engine with no DIRECTION.md line commissioning the moment that earned it is decoration bought with bytes — the same beauty-without-a-decision this gate exists to catch (gate-performance prices it; here it simply fails). A DIRECTION-commissioned persistent scene is **ONE** moment spanning every route, not one per route — do not mis-fire the cap by counting each route's chrome against it; count instead whether anything *else* on that site also animates, because the scene has spent the whole signature budget and a second commissioned gesture anywhere fails this check on its constitutional half. The renderer gets identical treatment and fails on a stricter reading: `rg -l 'from "three"|from "@react-three/' app components lib` with no DIRECTION.md line naming `ultraweb:set-design` **with its route scope and byte budget** is the harness's most expensive uncommissioned spectacle.
11. **AI-era reflexes** — the 2024-26 wave's own clichés, named and banned the way gradient-text was: the four-point sparkle as a bare "AI" badge, and the reflexive bottom-right chat bubble. The ✨ glyph is already caught by check 3; the lucide icon is not — this hits the Sparkle/Sparkles/WandSparkles family:
    `rg -n "Sparkle" -g "*.tsx"` — a lone sparkle "AI" badge fails; it passes only paired with a direction-specific second icon (shape-language) or cited.
    Corner chat-bubble — a fixed bottom-right launcher is the Intercom reflex; grep the position, then confirm intent (also sweep raw `position:fixed` with `bottom`/`right` in `*.css`):
    `rg -n "fixed[^\"']*bottom-[\d\[][^\"']*right-[\d\[]|bottom-[\d\[][^\"']*right-[\d\[][^\"']*fixed" -g "*.tsx"` — a chat/assistant widget passes only if design/BRIEF.md's AI-gate scoped one, and even then it moves to nav, a footer CTA, or a dedicated /ask route tied to the signature move, never dropped in the corner by default.

**Untouched-shadcn check (code side):** open app/globals.css — a neutral ramp with zero chroma throughout (pure-gray oklch), radius tokens unchanged since scaffold, and a lone default sans means the primitives shipped as the design. Cross-check every token against the decisions in design/SYSTEM.md.

### Screenshot sweep (checklist 12–17)

Use the full-page 375/1440 screenshot set. Judge each check mechanically:

1. **Three identical icon-cards** — any features section rendering three same-size, same-layout, icon-on-top cards in a row: fail (feature-sections holds the replacement patterns).
2. **Wallpaper rhythm** — per page, `browser_evaluate`: `[...document.querySelectorAll("main section")].map(s=>{const c=getComputedStyle(s);return c.paddingTop+"/"+c.paddingBottom})` — one identical value across all sections is uniform-py wallpaper: fail. Pass needs ≥2 distinct values with visible compression and release (layout-grid designs the rhythm).
3. **All-centered symmetry** — every section centered, same container width, no asymmetric moment on the entire page: fail; taste requires at least one deliberate asymmetry.
4. **Dark-navy AI-startup template** — near-black blue ground, glowing accent borders, blur orbs, applied to a brief that is not that: fail unless DIRECTION.md's archetype IS that, by name.
5. **Untouched shadcn look** — screenshots reading as a component demo (default radius, slate, stock shadows, stock focus blue): fail.
6. **Corner chat-bubble** — on the viewport screenshot (a fixed launcher rides the viewport, not the page): a floating round chat/assistant blob pinned bottom-right, when design/BRIEF.md's AI-gate scoped no assistant — fail. A justified assistant is not the reflex corner blob; it lives in nav, a footer CTA, or its own /ask route. While here, eyeball any cookie/consent banner — Accept styled primary with Reject buried or missing is a dark pattern; flag it and hand the detail to ultraweb:consent.

## Exception protocol

1. A hit survives only if design/DIRECTION.md names the exact pattern — "we WILL use gradient text on the hero H1; it is the signature move" — written there BEFORE this gate runs, or added by re-invoking direction, after which gate-visual must re-judge the change. For the AI-era checks (11, 17) the justifying document is design/BRIEF.md's AI-gate — an assistant the brief actually scoped — not DIRECTION.md, and even a scoped assistant is relocated out of the reflex corner.
2. Exceptions are per-pattern, per-location. A justified hero gradient does not license gradient text in cards; one justified glass surface does not license four.
3. Each exception is recorded in QA.md as: pattern → file:line → the DIRECTION.md quote.
4. No DIRECTION.md line → defect, even if it looks great. Beauty without a recorded decision is exactly the failure mode this gate exists to catch.

## Pass criteria

Zero unjustified hits across all 11 grep rows and all 6 screenshot checks, every page, both viewports. Each justified exception follows the protocol above. Every fix re-runs the exact grep or re-shoots the affected section — a green claim without the rerun is unverified.

## QA.md entry

```md
## gate-antislop — PASS (2026-07-16)
greps: 11/11 clean (bg-clip-text: 1 hit at hero.tsx:14 justified — DIRECTION.md "signature move: ink-wash headline")
screens: icon-card rows none · rhythm 3 distinct paddings/page · asymmetry present (hero offset on /) · no template look · shadcn restyled · no corner chat-bubble
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

Moved to `references/example.md` — read only when this build's case is genuinely ambiguous; the sections above are the decision material.

## Composes with

Moved to `references/composes.md` — the handoff map; load it when orchestrating this skill against its neighbors.
