---
name: gate-content
description: Copy and metadata completeness gate for ultraweb builds — reads the served HTML of every route to prove a unique title (≤60 chars) and description (140–160 chars), sweeps dead copy and bare microcopy (buttons, confirm dialogs, tooltips), traces every testimonial to the brief's proof inventory, flags any DACH/EU discount missing its 30-day-lowest-price disclosure (PAngV/Omnibus), extracts each page's heading outline so the H1→H2 sequence can be read as an argument for that page's conversion goal, audits voice consistency across sections, and crawls every internal link and anchor against the production server. Invoke in Phase 11 (Gates) of every ultraweb build, and whenever the user says "check the copy", "the button text", "broken links", "dead links", "duplicate titles", "30-day price", "voice consistency", "is the metadata complete", or "do the headings make sense".
---

# gate-content — the words, verified

**Stage:** Phase 11 — Gates, executed by the `gate-runner` agent (never loaded by the Lead) against the production server of record the Lead built and started in the Phase 11 preamble (`mkdir -p qa && rm -rf .next && npm run build > qa/build.log 2>&1`, then `PORT=3100 npm start > qa/prod.log 2>&1 &`); fourth of six, in the fixed sequence code → responsive → antislop → content → accessibility → performance - **Reads:** app/ source (metadata exports, JSX strings), `prodUrl`, design/SITEMAP.md (routes + per-page conversion goals), design/DIRECTION.md §Voice, design/BRIEF.md - **Writes:** design/QA.md §gate-content (append), qa/gate-content.log

## Standard

copywriting and seo write; this gate proves they finished. Every route ships one unique title and description in the site's voice, every heading sequence argues its page's conversion goal when read alone, every link resolves, zero dead copy. The gate reads outputs and never rewrites — hits route back to copywriting or seo, then the exact check re-runs.

## Checklist

1. **Metadata presence** — every SITEMAP.md route serves a `<title>`, a `<meta name="description">` and OG title/description/image; the root layout sets `metadataBase` and a title template; titles ≤60 chars, descriptions 140–160. [MEASURED]
2. **Metadata uniqueness** — zero duplicate titles and zero duplicate descriptions site-wide (compare the page-owned part, not the template suffix); no description that is a paste of the page's H1 or first paragraph. [MEASURED]
3. **OG card legibility** — the card still reads at feed-thumbnail scale, ~240px wide, a fifth of its authored width. Runner returns the image path, the headline string and its word count; the Lead views it once. [JUDGMENT → Lead]
4. **Dead copy & bare labels** — zero hits on the taste absolutes and copywriting's expanded banned list; zero bare "Submit"/"OK"/"Learn more"/"Click here" control labels; ≤1 "Learn more" per page. [MEASURED]
5. **Confirms, tooltips & errors** — runner reads every destructive-confirm body, every tooltip/trigger pair and every failure string, and reports which say only "Are you sure?", restate the trigger, or announce a failure with no way back. ui-states authors them; this is the re-check. [OBSERVED]
6. **Proof provenance** — zero `UNVERIFIED-PROOF` tags unless BRIEF.md marks the build demo/staging; every testimonial/review/press attribution appears in design/BRIEF.md's proof inventory. Runner returns the untraced names. [OBSERVED]
7. **Heading hygiene** — exactly one H1 per route; zero generic headings ("Features", "Our Services", "Welcome"); zero empty headings. (Heading LEVELS and landmarks belong to gate-accessibility.) [MEASURED]
8. **Heading narrative** — the H1→H2 sequence, read alone, argues the page's conversion goal from SITEMAP.md. Runner returns the outline verbatim per route; the Lead reads it as prose. [JUDGMENT → Lead]
9. **Links resolve** — zero dead `#`/empty hrefs, zero empty link texts, every internal href 200, every `#anchor` matching an id on its TARGET page, mailto/tel real; externals hit, or logged UNVERIFIED — never assumed green. [MEASURED]
10. **Price-history disclosure** — market-gated: where the site strikes a price, the lowest total price of the prior 30 days ("Bisheriger Bestpreis: €X — letzte 30 Tage") renders adjacent to it at body-sm or larger; runner returns each struck price with the string beside it. [OBSERVED]
11. **Price-history scoping** — whether PAngV §11 / EU Omnibus applies at all, and whether BRIEF.md's named 30-day history source is sound. Runner returns the BRIEF market line, the `Deployment mode:` line and the rendered disclosure strings. Guidance, never legal sign-off. [JUDGMENT → Lead]
12. **Voice consistency** — on sites with ≥5 user-facing sections, no section drifts more than one tone-point off the median register. Runner returns each section's strings quoted plus BRIEF.md's tone words; the Lead scores — the copy desk a phased build otherwise never gets. [JUDGMENT → Lead]

## How to verify

**Runner contract.** In: `gate: gate-content` · `pluginRoot` · `projectRoot` · `prodUrl` · `devUrl` · `artifacts` (BRIEF, DIRECTION, SYSTEM, SITEMAP, QA, PROGRESS paths) · `tier` · `market` · `themeStrategy` · `rerunOnly` (optional — those check numbers only). Out: verdict `PASS` / `PASS-ON-MEASURED` / `FAIL` / `UNVERIFIED` (`PASS` only when `judgment-open` is empty); each failed check as `check · file:line · one line · owner skill · MECHANICAL|DESIGN`; each judgment-open item with its evidence; the QA.md entry appended; `qa/gate-content.log`. Full stdout/stderr of every failing or unverified command goes to `<projectRoot>/qa/gate-content.log`; the return carries the path, never the contents. The runner never builds, starts or installs anything, and edits no source and no `design/*` file but the QA.md append. No browser → checks 7, 8, 9, 10, 11's rendered disclosure strings and 12's rendered half are UNVERIFIED with the runner's NO BROWSER line; every curl and rg check still runs, check 3 included.

**1–2. Metadata.** Over the wire, no browser needed: per SITEMAP.md route (dynamic routes at ≥2 real slugs) `curl -s <prodUrl><route> | rg -o '<title>[^<]*|<meta name="description" content="[^"]*|<meta property="og:(title|description|image)" content="[^"]*'` — a route missing any of these fails. Measure the captured strings: title ≤60, description 140–160. Uniqueness: strip the template suffix, then `sort | uniq -d` over titles and over descriptions; a description equal to the page's H1 or first paragraph fails too. `rg -n "metadataBase" app` must hit — without it OG URLs render relative and share cards break (seo owns the fix). A literal `[object Promise]` in a title is a missing `await params` in `generateMetadata` (Next 16). Report a bare route at file:line via `rg -n "export const metadata|generateMetadata" app -g "*.tsx"`.

**3. OG legibility.** `curl -s -o <projectRoot>/qa/og-card.png <prodUrl>/opengraph-image`; return the path, the headline string and its word count. The Lead rules at ~240px: a headline confident at full size and a gray smear at thumbnail scale is a defect, fixed with fewer words set larger in ultraweb:seo's ImageResponse template.

**4. Dead copy & bare labels.** `rg -ni "welcome to|elevate your|unlock the power|seamlessly|empower" app components -g "*.tsx" -g "*.mdx"`, then every phrase from copywriting's expanded list. `rg -n ">(Submit|OK|Cancel|Learn More|Learn more|Click here|Click Here)<" -g "*.tsx"` — each hit is a bare generic; the fix is a verb+object that names the action ("Send message", "Delete invoice"). Do NOT flag short-but-specific labels — "Save", "Send" carry a verb and an object; the defect is genericness, not length. `rg -c "Learn more" -g "*.tsx"` (≤1 per page).

**5. Confirms, tooltips & errors.** `rg -n "AlertDialog|confirm\(|Tooltip" app components -g "*.tsx"` and `rg -ni "oops|went wrong" -g "*.tsx"`; read each hit's body string and its trigger label and report what is there. A destructive confirm must state the consequence ("Delete this project? This can't be undone."); a bare "Are you sure?" fails. A tooltip repeating words already visible in its trigger adds nothing — the fix is deletion, not a rewrite. An error string must name the way back in the same string ("Retry", "Contact support"); a dead end fails.

**6. Proof provenance.** `rg -n "UNVERIFIED-PROOF" . -g '!design/**'` (root-wide, gitignore-aware) — zero hits on a production build; a hit passes only when BRIEF.md's `Deployment mode:` reads `staging` or `demo` AND the rendered quote carries a visible "Sample" label (screenshot it as evidence). Where social-proof's structured store is used, assert every record's `status` is `"verified"`. Then collect every `<figcaption>`/attribution in testimonial and review components and report each name+company absent from BRIEF.md's proof inventory: untraceable attribution is fabricated social proof, a launch blocker whose fix is social-proof's no-proof ladder, never a better-sounding fake.

**7–8. Headings.** Per route, `browser_run_code_unsafe` with `filename: <plugin>/scripts/measure/heading-narrative.mjs` — it asserts `generic.length === 0 && empty === 0` and returns `outline` (level + text in document order). Check 7 fails on any `generic` or `empty` entry, and on an `outline` without exactly one `level: 1`. Check 8's evidence is that `outline`, verbatim per route; the Lead reads it as prose against the SITEMAP conversion goal — it must state the offer, build the argument, land on the ask, and a route whose outline is a grammatical table of contents (`Pricing / Our Plans / Features / FAQ`) fails on the sequence, not on any one heading.

**9. Links.** Per route, `filename: <plugin>/scripts/measure/links-collect.mjs` — it asserts `deadHash.length === 0 && emptyText.length === 0 && broken.length === 0`, fetching up to 200 unique same-origin hrefs with `page.request.get`. The result lands in the runner's context: write it to `<projectRoot>/qa/gate-content-links-collect.json` with the Write tool, grep `broken`, `deadHash`, `emptyText` there, never echo the list. From that file's `links` list, every href carrying a `#` resolves on its TARGET page, not the current one: `curl -s <prodUrl><target route> | rg 'id="<frag>"'`, or one `browser_evaluate` per target route asserting `getElementById` non-null there. `mailto:`/`tel:` carry real values, never example.com or 555; externals `curl -sI -o /dev/null -w '%{http_code}'`, accept 200/301/302, log timeouts and 403-to-bots as UNVERIFIED rather than green. Spot-check `curl -s -o /dev/null -w '%{http_code}' <prodUrl>/__gate-content-404` returns 404 — a not-found page served 200 masks every broken link.

Neither script needs a `window.__ultraweb` seed. Fallback (Phase 0 recorded `measure-library: unavailable`): the V1.8.0 inline snippets — `git -C <plugin> show V1.8.0:skills/gate-content/SKILL.md`, a git checkout only; in a marketplace snapshot checks 7–9 go UNVERIFIED.

**10–11. Price history (DACH/EU).** Fires only when `market` and BRIEF.md mark German/DACH/EU commerce with discounted pricing — otherwise N/A, logged as such (the gate is the check). `rg -n "line-through|text-decoration:\s*line-through|<del|<s\b|compareAt|listPrice|statt |reduziert" -g "*.tsx" -g "*.ts"` finds every reduced-price surface; each must carry, in the same component and adjacent to the struck price at body-sm or larger, "Bisheriger Bestpreis: €79 (letzte 30 Tage)" — pair each hit against `rg -n "Bestpreis|letzten? 30 Tage"`, which proves co-location only: one `browser_evaluate` per struck price returns the sibling string and its computed `fontSize`. Never accept the line from a footer, tooltip or fine print. Check 11's evidence adds BRIEF.md's named history source (real backend / hardcoded demo / spreadsheet) to those strings; a discount with no named source is a defect, not a TODO. pricing owns the line-through UI and the Grundpreis; this gate owns the disclosure that completes it.

**12. Voice.** Skip below 5 user-facing sections; log N/A. Otherwise collect each section's strings — hero, nav, pricing, footer, forms, CTA, error, 404 — from source, or with one `browser_evaluate` per landmark, and return them quoted alongside BRIEF.md's tone words. The Lead scores each block's register and flags any section more than one tone-point off the median: a corporate-flat confirmation under a playful hero, a terse legal footer under a warm brand. Hero, pricing and footer are authored in different phases, so drift is structural; rewrites route to copywriting.

## Pass criteria

Checks 1–9 always apply; 10–11 only on a DACH/EU storefront with discounts, 12 only at ≥5 user-facing sections — each inapplicable check is logged N/A, never silently skipped. Dynamic routes are sampled at ≥2 real slugs. External links verified or explicitly listed UNVERIFIED. `PASS-ON-MEASURED` is the runner's ceiling while any judgment item is open; the Lead's rulings block turns it into PASS. A copy rewrite touches source, and the production server serves the build of record, not the working tree: the Lead repeats the Phase 11 preamble (one rebuild, one restart) before re-dispatching with `rerunOnly: [4,5,6,7,8,12]` — one rewrite can fix a phrase, break the argument and drift the voice in the same edit. A rulings-only round changed no code and skips the rebuild.

## QA.md entry

The runner APPENDS this with a `>>` heredoc — it never rewrites QA.md and never reads it for an anchor. On `rerunOnly` it appends a dated `re-run` block listing only the re-run checks and their new results.

```md
## gate-content — PASS (2026-07-16)
metadata: 6/6 routes · titles unique (max 54ch) · descriptions unique (141–158ch) · metadataBase ok · OG card legible at 240px
dead copy: 0 hits (28 patterns swept) · microcopy: 0 bare labels · 3 confirms name consequence · 2 tooltips pruned
proof trace: 4/4 testimonials in BRIEF inventory · UNVERIFIED-PROOF: 0 hits
headings: 1 H1/page, story reads on all 6 pages · voice: 6 sections within 1 tone-point of median
price-history: N/A (brief has no discounts) · links: 47 internal 200 · 9 anchors resolve · 12 external ok · 1 UNVERIFIED (partner timeout)
fixed: /pricing description 96ch → rewritten by copywriting · residual: 1 unverified external
```

## Anti-patterns

- Reading only static `metadata` exports and skipping the served HTML — a dynamic route lies in source and tells the truth over the wire; and a title is not unique because its template suffix differs
- Passing the heading story because each heading is grammatical — the test is the SEQUENCE arguing the conversion goal, and it is the Lead's ruling, never the runner's
- Greening external links without hitting them, or hiding a timeout as a pass — UNVERIFIED is an honest state, a fake green is not
- Treating the 30-day-lowest line as a taste nicety — on a DACH/EU storefront a discount without it is a legal defect that fails a clean layout
- Echoing a link list or a metadata dump into the return — lists are written to `qa/` with the Write tool and grepped, failures go to `qa/gate-content.log`

## Worked example — Ledger & Lane, first-run gate on /insights and /practice

Moved to `references/example.md` — read only when this build's case is genuinely ambiguous; the sections above are the decision material.

## Composes with

Moved to `references/composes.md` — the handoff map; load it when orchestrating this skill against its neighbors.
