---
name: gate-content
description: Copy and metadata completeness gate for ultraweb builds — greps the Metadata API exports to prove every page has a unique title (≤60 chars) and description (140–160 chars), sweeps dead copy and bare microcopy (buttons, confirm dialogs, tooltips), flags any DACH/EU discount missing its 30-day-lowest-price disclosure (PAngV/Omnibus), extracts each page's heading outline and checks the H1→H2 sequence reads as an argument for that page's conversion goal, audits voice consistency across sections, and crawls every internal link and anchor against the running server. Invoke in Phase 11 (Gates) of every ultraweb build, and whenever the user says "check the copy", "the button text", "broken links", "dead links", "duplicate titles", "30-day price", "voice consistency", "is the metadata complete", or "do the headings make sense".
---

# gate-content — the words, verified

**Stage:** Phase 11 — Gates - **Reads:** app/ source (metadata exports, JSX strings), running production server, design/SITEMAP.md (routes + per-page conversion goals), design/DIRECTION.md §Voice, design/BRIEF.md - **Writes:** design/QA.md §gate-content

## Standard

copywriting and seo write; this gate proves they finished. Every route ships one unique title and one unique description in the site's voice. Every heading sequence argues its page's conversion goal when read alone. Every link on the site resolves. Zero dead copy. This gate reads outputs and never rewrites — hits route back to copywriting or seo for the fix, then the exact check re-runs.

## Checklist

1. **Metadata completeness** — every SITEMAP.md route has `export const metadata` or `generateMetadata`; the root layout sets `metadataBase` and a title template; titles ≤60 chars, descriptions 140–160 chars; the OG card still reads at feed-thumbnail scale.
2. **Metadata uniqueness** — zero duplicate titles and zero duplicate descriptions site-wide; no description that is a paste of the page's H1 or first paragraph.
3. **Dead copy & microcopy** — zero hits on the taste absolutes and copywriting's expanded banned list; and the same rigor on controls: every button/link label is verb+object, never a bare "Submit"/"OK"/"Learn more"/"Click here"; every destructive confirm names its consequence, not "Are you sure?"; every tooltip adds information beyond its trigger or is deleted; no bare "Something went wrong" without an adjacent recovery; ≤1 "Learn more" per page.
4. **Heading narrative** — exactly one H1 per page; the H1→H2 sequence, read aloud in order, argues the page's conversion goal from SITEMAP.md. (Heading LEVELS and landmarks belong to gate-accessibility; the STORY is judged here.)
5. **Links resolve** — every internal href returns 200 on the production server; every `#anchor` matches an element id on its target page; external links respond, or are logged UNVERIFIED — never assumed green.
6. **Price-history disclosure (DACH/EU)** — brief-gated: on a storefront design/BRIEF.md marks German/DACH/EU, every strikethrough/"was" price carries the lowest total price of the prior 30 days ("Bisheriger Bestpreis: €X — letzte 30 Tage"), adjacent and readable, never in a footer or fine print. Guidance toward PAngV §11 / EU Omnibus, not a substitute for legal sign-off.
7. **Voice consistency** — on sites with ≥5 user-facing sections, every section reads in design/BRIEF.md's tone words; none drifts more than one tone-point off the site's median register. A judgment pass, not a grep — the copy desk a phased build otherwise never gets.

## How to verify

**1–2. Metadata.** `rg -n "export const metadata|generateMetadata" app -g "*.tsx"` → map hits onto the SITEMAP.md route list; any route without one fails. Collect every `title:` and `description:`; for dynamic routes, render 2–3 real slugs on the server and read `<title>` and `<meta name="description">` from the HTML instead of trusting the source. Uniqueness: sort the collected values, any duplicate fails (compare the page-owned part — the template suffix does not make a title unique). Lengths: count characters against title ≤60 and description 140–160. Confirm `metadataBase` in the root layout — without it OG URLs render relative and share cards break (seo owns the fix). In Next 16 `params` is a Promise inside `generateMetadata` — a missing `await` shows up here as a literal "[object Promise]" in the rendered title.

**OG legibility.** The mechanical half is ultraweb:seo's and stays there — its verify step fetches `/opengraph-image` on the running server, and its ImageResponse rules fix the card's dimensions; run them from there rather than restating them here. What no fetch can assert is the only thing that matters in a feed: legibility at the size the card is actually served. Social clients render it around 200–260px wide, roughly a fifth of its authored width. Screenshot the fetched image, scale it to ~240px, and read it. A headline that is confident at full size and dissolves into a gray smear at thumbnail scale is a defect, not a rendering artifact — the fix is fewer words set larger, and it lands in ultraweb:seo's template.

**3. Dead copy & microcopy.** `rg -ni "welcome to|elevate your|unlock the power|seamlessly|empower" app components -g "*.tsx" -g "*.mdx"`, then every phrase from copywriting's expanded list. Plus: `rg -ni "oops|went wrong" -g "*.tsx"` (each hit needs a recovery path in the same string), `rg -c "Learn more" -g "*.tsx"` (≤1 per page; prefer a specific label).

**Microcopy sweep** — the same banned-phrase rigor extended from headlines to the highest-read-rate strings on the site: controls, dialogs, tooltips. `rg -n ">(Submit|OK|Cancel|Learn More|Learn more|Click here|Click Here)<" -g "*.tsx"` — each hit is a bare generic; the fix is a verb+object that names the action ("Send message", "Save changes", "Delete invoice"). Do NOT flag short-but-specific labels — "Save", "Search", "Send" already carry a verb and an object; the defect is genericness, not length. Destructive confirms: read every AlertDialog / confirm component — its body must state the consequence ("Delete this project? This can't be undone."); a bare "Are you sure?" with [Yes]/[No] fails. Tooltips: each must add information the visible trigger label doesn't already say, or be removed. ui-states defines the authoring standard for these strings (and the error/empty wording); this gate is the mechanical re-check — the same widen-the-banned-gate move gate-antislop runs on visual clichés.

**4. Heading narrative.** Per route on the running server, `browser_evaluate`: `[...document.querySelectorAll("h1,h2,h3")].map(h=>h.tagName+": "+h.innerText.trim())`. Read the H1→H2 sequence as prose against the page's conversion goal in SITEMAP.md: it must state the offer, build the argument, and land on the ask. Headlines earn their size; copywriting's formulas are the fix for any failing sequence.

Worked example — pricing page, conversion goal "start a trial":

```text
PASS                                        FAIL
H1: Pay for closed books, not seats.        H1: Pricing
H2: One price. Every ledger.                H2: Our Plans
H2: What finance teams switch for           H2: Features
H2: Your first close is on us.              H2: FAQ
```

The left column argues offer → proof → ask on its own. The right column is a table of contents — grammatical, complete, and saying nothing; it fails even though every individual heading is "fine".

**5. Link crawl.** Routes first, from design/SITEMAP.md against `npm start`:

```sh
for r in / /about /pricing /journal; do
  printf "%s %s\n" "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000$r)" "$r"; done
```

Spot-check one garbage URL returns 404 — a custom not-found page served with status 200 would mask every broken link. Then per page, `browser_evaluate`: `[...document.querySelectorAll("a[href]")].map(a=>a.getAttribute("href"))`, dedupe, and classify:

- internal paths → curl, expect 200 (301 to a trailing-slash variant is fine; 307-to-login only on routes the SITEMAP marks protected)
- `#anchors` → `document.getElementById(...)` non-null on the TARGET page, not the current one
- `mailto:` / `tel:` → real values in valid syntax, never example.com or 555 placeholders
- externals → `curl -sI -o /dev/null -w '%{http_code}'`, accept 200/301/302; log timeouts and 403-to-bots as UNVERIFIED in QA.md rather than green

**6. Price-history disclosure (DACH/EU).** Fires only when design/BRIEF.md marks the build German/DACH/EU commerce with discounted pricing — otherwise N/A, logged as such (the brief-gate is the check). Find every reduced-price surface: `rg -n "line-through|text-decoration:\s*line-through|<del|<s\b|compareAt|listPrice|statt |reduziert" -g "*.tsx" -g "*.ts"`. Each hit must render — adjacent to the struck price and at body-sm or smaller — the lowest total price of the prior 30 days: "Bisheriger Bestpreis: €79 (letzte 30 Tage)" or "Niedrigster Preis der letzten 30 Tage: €79", never pushed to a footer, tooltip, or fine print. Confirm BRIEF.md names the 30-day-history data source (real backend / hardcoded demo / spreadsheet); a discount rendered with no history source fails — it is a defect, not a TODO. This is guidance toward PAngV §11 / EU Omnibus (Directive 2019/2161), flagged as such in QA.md, not legal sign-off. pricing owns the line-through discount UI and unit price (Grundpreis); this gate owns the reduction disclosure that completes it.

**7. Voice consistency.** Skip on brochure sites under 5 user-facing sections; log N/A. Otherwise extract each section's strings — read hero/nav/pricing/footer/forms/CTA/error/404 copy from source, or `browser_evaluate` the rendered text per landmark — and score each block's register against design/BRIEF.md's tone words. Flag any section more than one tone-point off the site's median register: a corporate-flat confirmation string under a playful hero, a terse legal footer under a warm brand. Hero, pricing, and footer are authored in different phases by different passes, so drift is structural, not hypothetical — this is the copy desk phasing removes. Judgment, not a grep; output the flagged list with rationale and route rewrites to copywriting, which fixes in voice.

## Pass criteria

All applicable items green for every route in SITEMAP.md, with dynamic routes sampled at ≥2 real slugs. Items 1–5 always apply; item 6 applies only to DACH/EU storefronts with discounts, item 7 only to sites with ≥5 user-facing sections — each inapplicable item is logged N/A, never silently skipped. External links verified or explicitly listed UNVERIFIED. After any copy rewrite (which copywriting performs, in voice), re-run items 3 and 7 AND re-read the heading story — a rewrite can fix a phrase, break the argument, or drift the voice.

## QA.md entry

```md
## gate-content — PASS (2026-07-16)
metadata: 6/6 routes · titles unique (max 54ch) · descriptions unique (141–158ch) · metadataBase ok · OG card legible at 240px
dead copy: 0 hits (28 patterns swept) · microcopy: 0 bare labels · 3 confirms name consequence · 2 tooltips pruned
headings: 1 H1/page, story reads on all 6 pages · voice: 6 sections within 1 tone-point of median
price-history: N/A (brief has no discounts) · links: 47 internal 200 · 9 anchors resolve · 12 external ok · 1 UNVERIFIED (partner timeout)
fixed: /pricing description 96ch → rewritten by copywriting · residual: 1 unverified external
```

## Anti-patterns

- Checking only static `metadata` exports and skipping dynamic routes — render real slugs and read the served HTML
- Calling titles "unique" because the template suffix differs — compare the page-owned part
- Passing the heading story because each heading is grammatical — the test is the SEQUENCE arguing the conversion goal
- Crawling the sitemap instead of the rendered pages — links live in JSX, footers, and MDX bodies
- Greening external links without hitting them, or hiding a timeout as a pass — UNVERIFIED is an honest state, a fake green is not
- Fixing a duplicate description by shuffling word order — same information, same defect; copywriting rewrites from the page's actual content
- Flagging "Save"/"Send"/"Search" as bare microcopy — the defect is genericness, not brevity; a verb with a real object passes, "Submit"/"OK"/"Learn more" do not
- Treating the 30-day-lowest disclosure as a taste nicety — on a DACH/EU storefront a discount without it is a PAngV/Omnibus legal defect that fails even when the layout looks clean
- Satisfying the price-history rule by parking the line in a footer, tooltip, or fine print — it must sit adjacent to the struck price and be readable
- Passing voice because no banned phrase appears — a section can be grep-clean and still be written in the wrong register; item 7 is judgment, and route rewrites through copywriting

## Worked example — Ledger & Lane, first-run gate on /insights and /practice

SITEMAP.md goals read here: `/insights/[slug]` → earn trust, route to /contact; `/practice/[area]`
→ "book a consultation." First run against `npm start`, logged to design/QA.md §gate-content:

```text
metadata  /insights/[slug] <title> rendered "[object Promise] | Ledger & Lane" —
          generateMetadata read `params` without `await` (Next 16: params is a Promise)
unique    /practice/estate and /practice/probate shipped one description string, verbatim
headings  /practice/litigation H1→H2 = "Litigation / Our Approach / Team / FAQ" —
          a table of contents, not offer→proof→ask for "book a consultation"
micro     /contact consultation form shipped a bare "Submit"; the "Cancel appointment?"
          dialog offered [Yes]/[No] and named no consequence
price     N/A — Ledger & Lane sells no discounted goods; item 6 logged N/A (the brief-gate holding)
voice     /insights/data-breach-duties drifted into corporate-generic ("leverage our
          expertise") against the firm's declared "measured, plainspoken authority"
links     footer bar-association disclosure used href="#" — 0 of 3 disclosures resolved
```

Fixes by owner: `await params` in the [slug] generateMetadata (ultraweb:seo); two practice
descriptions rewritten from each area's own content and the litigation headings recut to
offer→proof→ask (ultraweb:copywriting); disclosures pointed at real state-bar URLs (ultraweb:footer);
"Submit" → "Request this consultation" and the cancel dialog recut to "Cancel this appointment?
We'll release the slot." + [Keep it] / [Cancel appointment] (ultraweb:copywriting, standard from
ultraweb:ui-states); the drifting insights article rewritten to the firm's register (ultraweb:copywriting).
Re-run PASS: 6/6 titles unique (max 57ch), descriptions 142–159ch, 1 H1/page, 24 internal 200 ·
0 bare labels, cancel dialog names its consequence · voice within one tone-point across 7 sections ·
item 6 N/A (no discounted goods in the brief).

Rejected: a static `metadata` export on [slug] to dodge the await bug — it stamps one article's
title onto every slug, and the gate samples 3 real slugs and re-fails it. Handoff: QA.md flips to
PASS; ultraweb:gate-accessibility takes the heading LEVELS this gate deliberately left it.

## Composes with

- ultraweb:copywriting — wrote every string; all copy fixes route back through its voice spec and length limits.
- ultraweb:seo — wired the metadata this gate audits; owns metadataBase, canonical, the OG fetch and dimension checks this gate defers to, and every template fix.
- ultraweb:sitemap — the route list defining crawl coverage and each page's conversion goal.
- ultraweb:wireframe — the section order the heading story should mirror.
- ultraweb:gate-accessibility — owns heading levels and landmarks; this gate owns the narrative.
- ultraweb:gate-antislop — overlapping dead-copy greps; antislop sweeps clichés broadly, this gate ties copy to completeness, and item 3's microcopy sweep is the same widen-the-banned-gate mechanism applied to controls.
- ultraweb:ui-states — defines the authoring standard for confirm/error/empty strings; item 3's microcopy sweep is the mechanical re-check that the standard actually shipped.
- ultraweb:buttons — owns the label component and its states; a bare-generic label flagged in item 3 is relabelled to verb+object here.
- ultraweb:pricing — owns the line-through discount UI and unit price (Grundpreis); item 6's 30-day-lowest disclosure is the completeness check that closes that seam for DACH/EU discounts.
- ultraweb:footer — owns the disclosure and utility links this gate crawls for 200s and anchor resolution; broken ones route back here.
- ultraweb:content-cms — owns the MDX article pipeline; a sampled /insights/[slug] with a missing or duplicate frontmatter title, or a dead in-body link, is fixed here.
- ultraweb:i18n — on localized builds, supplies the per-locale route list and hreflang pairs this gate dedupes titles across before calling metadata complete.
