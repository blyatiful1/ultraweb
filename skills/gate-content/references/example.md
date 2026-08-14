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
