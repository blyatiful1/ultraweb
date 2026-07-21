---
name: gate-content
description: Copy and metadata completeness gate for ultraweb builds — greps the Metadata API exports to prove every page has a unique title (≤60 chars) and description (140–160 chars), sweeps dead copy patterns, extracts each page's heading outline and checks the H1→H2 sequence reads as an argument for that page's conversion goal, and crawls every internal link and anchor against the running server. Invoke in Phase 11 (Gates) of every ultraweb build, and whenever the user says "check the copy", "broken links", "dead links", "duplicate titles", "is the metadata complete", or "do the headings make sense".
---

# gate-content — the words, verified

**Stage:** Phase 11 — Gates - **Reads:** app/ source (metadata exports, JSX strings), running production server, design/SITEMAP.md (routes + per-page conversion goals), design/DIRECTION.md §Voice, design/BRIEF.md - **Writes:** design/QA.md §gate-content

## Standard

copywriting and seo write; this gate proves they finished. Every route ships one unique title and one unique description in the site's voice. Every heading sequence argues its page's conversion goal when read alone. Every link on the site resolves. Zero dead copy. This gate reads outputs and never rewrites — hits route back to copywriting or seo for the fix, then the exact check re-runs.

## Checklist

1. **Metadata completeness** — every SITEMAP.md route has `export const metadata` or `generateMetadata`; the root layout sets `metadataBase` and a title template; titles ≤60 chars, descriptions 140–160 chars.
2. **Metadata uniqueness** — zero duplicate titles and zero duplicate descriptions site-wide; no description that is a paste of the page's H1 or first paragraph.
3. **Dead copy** — zero hits on the taste absolutes and copywriting's expanded banned list; no "Submit" on any form, no bare "Something went wrong", ≤1 "Learn more" per page.
4. **Heading narrative** — exactly one H1 per page; the H1→H2 sequence, read aloud in order, argues the page's conversion goal from SITEMAP.md. (Heading LEVELS and landmarks belong to gate-accessibility; the STORY is judged here.)
5. **Links resolve** — every internal href returns 200 on the production server; every `#anchor` matches an element id on its target page; external links respond, or are logged UNVERIFIED — never assumed green.

## How to verify

**1–2. Metadata.** `rg -n "export const metadata|generateMetadata" app -g "*.tsx"` → map hits onto the SITEMAP.md route list; any route without one fails. Collect every `title:` and `description:`; for dynamic routes, render 2–3 real slugs on the server and read `<title>` and `<meta name="description">` from the HTML instead of trusting the source. Uniqueness: sort the collected values, any duplicate fails (compare the page-owned part — the template suffix does not make a title unique). Lengths: count characters against title ≤60 and description 140–160. Confirm `metadataBase` in the root layout — without it OG URLs render relative and share cards break (seo owns the fix). In Next 16 `params` is a Promise inside `generateMetadata` — a missing `await` shows up here as a literal "[object Promise]" in the rendered title.

**3. Dead copy.** `rg -ni "welcome to|elevate your|unlock the power|seamlessly|empower" app components -g "*.tsx" -g "*.mdx"`, then every phrase from copywriting's expanded list. Plus: `rg -n ">Submit<" -g "*.tsx"` (0 hits), `rg -ni "oops|went wrong" -g "*.tsx"` (each hit needs a recovery path in the same string), `rg -c "Learn more" -g "*.tsx"` (≤1 per page; prefer a specific label).

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

## Pass criteria

All 5 items green for every route in SITEMAP.md, with dynamic routes sampled at ≥2 real slugs. External links verified or explicitly listed UNVERIFIED. After any copy rewrite (which copywriting performs, in voice), re-run item 3 AND re-read the heading story — a rewrite can fix a phrase and break the argument.

## QA.md entry

```md
## gate-content — PASS (2026-07-16)
metadata: 6/6 routes · titles unique (max 54ch) · descriptions unique (141–158ch) · metadataBase ok
dead copy: 0 hits (28 patterns swept) · headings: 1 H1/page, story reads on all 6 pages
links: 47 internal 200 · 9 anchors resolve · 12 external ok · 1 UNVERIFIED (partner site timeout)
fixed: /pricing description 96ch → rewritten by copywriting · residual: 1 unverified external
```

## Anti-patterns

- Checking only static `metadata` exports and skipping dynamic routes — render real slugs and read the served HTML
- Calling titles "unique" because the template suffix differs — compare the page-owned part
- Passing the heading story because each heading is grammatical — the test is the SEQUENCE arguing the conversion goal
- Crawling the sitemap instead of the rendered pages — links live in JSX, footers, and MDX bodies
- Greening external links without hitting them, or hiding a timeout as a pass — UNVERIFIED is an honest state, a fake green is not
- Fixing a duplicate description by shuffling word order — same information, same defect; copywriting rewrites from the page's actual content

## Worked example — Ledger & Lane, first-run gate on /insights and /practice

SITEMAP.md goals read here: `/insights/[slug]` → earn trust, route to /contact; `/practice/[area]`
→ "book a consultation." First run against `npm start`, logged to design/QA.md §gate-content:

```text
metadata  /insights/[slug] <title> rendered "[object Promise] | Ledger & Lane" —
          generateMetadata read `params` without `await` (Next 16: params is a Promise)
unique    /practice/estate and /practice/probate shipped one description string, verbatim
headings  /practice/litigation H1→H2 = "Litigation / Our Approach / Team / FAQ" —
          a table of contents, not offer→proof→ask for "book a consultation"
links     footer bar-association disclosure used href="#" — 0 of 3 disclosures resolved
```

Fixes by owner: `await params` in the [slug] generateMetadata (ultraweb:seo); two practice
descriptions rewritten from each area's own content and the litigation headings recut to
offer→proof→ask (ultraweb:copywriting); disclosures pointed at real state-bar URLs (ultraweb:footer).
Re-run PASS: 6/6 titles unique (max 57ch), descriptions 142–159ch, 1 H1/page, 24 internal 200.

Rejected: a static `metadata` export on [slug] to dodge the await bug — it stamps one article's
title onto every slug, and the gate samples 3 real slugs and re-fails it. Handoff: QA.md flips to
PASS; ultraweb:gate-accessibility takes the heading LEVELS this gate deliberately left it.

## Composes with

- ultraweb:copywriting — wrote every string; all copy fixes route back through its voice spec and length limits.
- ultraweb:seo — wired the metadata this gate audits; owns metadataBase, canonical, and template fixes.
- ultraweb:sitemap — the route list defining crawl coverage and each page's conversion goal.
- ultraweb:wireframe — the section order the heading story should mirror.
- ultraweb:gate-accessibility — owns heading levels and landmarks; this gate owns the narrative.
- ultraweb:gate-antislop — overlapping dead-copy greps; antislop sweeps clichés broadly, this gate ties copy to completeness.
- ultraweb:footer — owns the disclosure and utility links this gate crawls for 200s and anchor resolution; broken ones route back here.
- ultraweb:content-cms — owns the MDX article pipeline; a sampled /insights/[slug] with a missing or duplicate frontmatter title, or a dead in-body link, is fixed here.
- ultraweb:i18n — on localized builds, supplies the per-locale route list and hreflang pairs this gate dedupes titles across before calling metadata complete.
