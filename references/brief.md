# brief

Turn the user's prompt and any client material into design/BRIEF.md, the file every later phase reads instead of asking.

Load when: Phase 1, or whenever design/BRIEF.md is missing, stale or contradicted by the user.
Reads: the prompt, any files or folders the user named. Writes: design/BRIEF.md; creative assumptions to `## Assumptions` in design/PROGRESS.md.

## Procedure

1. Read the prompt twice. List every noun, constraint and named feature. Nothing the user wrote may be dropped, softened or contradicted ("German only", "no stock photos", a named page).
2. Classify the site type: product/SaaS, portfolio/studio, e-commerce, editorial, local business, event, web app, docs.
3. Set the tier from the user's words: `sketch` (one page, "landing page", "quick"), `standard` (multi-page, the default), `flagship` (the user asks for award-level, immersive or showpiece work). Set the mode: `guided` (default) or `autonomous` ("just build it", "no questions", or no human reachable).
4. Guided mode: run the interview below. Autonomous mode: skip it and decide every fork the way a studio would, logging each decision under `## Assumptions` in design/PROGRESS.md.
5. Run the asset intake below.
6. Write design/BRIEF.md in the format below. Then grep it for `?`, `TBD`, `TODO`, `etc.`, `various`. Each hit is a defect: decide it.

## The interview (guided mode)

Ask only about forks where the options lead to different sites.

- Use the structured question tool. Multiple choice, 2 to 4 concrete options per question, recommended option first, plus "skip, you decide". A skipped question is decided and logged like an unasked one.
- At most 4 questions per round. A second round only when an answer opens a new fork (subscriptions: yes, so ask billing rhythm). Two rounds is the hard stop.
- Scope and substance only: pages, features, audience, offer, content sources, languages, booking or checkout ownership, which real assets exist.
- Never ask about colors, fonts, style, mood or references to copy. The mockup round shows those (`references/mockup.md`).
- Never re-ask what the prompt already answered.

Fork starters by site type:

| Site type | Forks worth asking |
|---|---|
| e-commerce | catalog size; one-time or subscription; own checkout or external; shipping scope |
| product/SaaS | self-serve or sales-led; public pricing; docs or changelog |
| local business | reservations or walk-in; languages; who keeps hours and menu current |
| portfolio/studio | index or deep case studies; gated work; hire CTA |
| editorial | cadence; authorship; newsletter |
| event | single date or series; own registration or ticket platform |
| web app | accounts from day one; what is saved per user |

## What to decide and record

- **Audience:** one person in a situation, not a demographic. "A head of ops comparing rostering tools on her phone between meetings." Add what she distrusts. If the audience line still works after swapping in a competitor's name, rewrite it.
- **Conversion:** one primary action (buy, book, sign up, contact, subscribe) and at most one secondary. A page that serves neither is cut.
- **Tone:** three adjectives plus one tension pair ("warm but exact"). "Modern", "clean", "professional", "sleek" are not tone words. Write one sample sentence in the voice.
- **Subject world:** the raw material `references/direction.md` derives the look from. List 8 to 15 concrete things from the client's own world: materials, tools, processes, places, documents, packaging, signage, trade vocabulary, the artefacts customers actually handle. "Burlap sacks stencilled with lot numbers, roast-curve printouts, the cupping table" is usable. "Coffee, warmth, community" is not.
- **Pages:** the fewest that serve the conversion. Do not invent About, Blog or Careers pages nobody asked for. Do not merge pages the prompt named.
- **Content inventory:** per page, the facts, names, numbers and proof copy will need.
- **Backend:** pick the smallest set that does the job. A contact form needs a server action and email, not a database. A CMS for three launch posts is MDX. Accounts imply auth plus database. AI chat or AI search is rejected unless the user asked for it; record the reason either way. List chosen and rejected items, one line each.

### Invented facts

- **Creative assumptions** (names of demo products, page structure, copy angles) are fine. Log them in PROGRESS.md.
- **Material claims** (hours, prices, weights, addresses, delivery times, refund terms, credentials, measured statistics): when the client has not supplied one, draft a realistic value instead of leaving the page thin. A site with real-looking detail can be judged; an empty one cannot. Each drafted value gets three marks: a line in §Material claims ending with `— material, unconfirmed`; the attribute `data-assumed` on its element in the markup; and, because drafts exist, `Deployment mode: demo` at the top of the brief. The gates list every `data-assumed` element for review, and ship blocks production until the owner has confirmed each one and the marks are removed. Never draft a street address, phone number, registration number or bank detail: leave those out and list them as missing. Stand-in photographs (`references/imagery.md`) are drafts of the same kind: they also make the build a demo.
- **Third-party proof** (testimonials, reviews, press, customer logos, usage numbers) is never invented. An empty proof inventory is recorded as empty. On a build whose deployment mode is `demo` or `staging`, labeled samples carrying the literal tag `UNVERIFIED-PROOF` are allowed; production rejects the tag.

## Client-asset intake

Run it every time. Either list every asset the client supplied, or record their absence explicitly.

1. Enumerate the named sources: `find <dir> -type f -not -path '*/.*' | sort`, then `file` each hit for its real type. A URL the user pointed at is a reference for direction, not an asset.
2. Classify each file by what it can become: vector logo, raster logo, photography, illustration, copy document, brand guide, font file, video, 3D/scan, unknown. Never drop an unknown; list it with its type string.
3. Record the ceiling. Raster: pixel size and orientation (under 1600 px on the long edge cannot carry a full-bleed hero). Vector: viewBox. Video: resolution and length. Documents: page count.
4. Record what each asset constrains:
   - Logo: clear space in mark heights, minimum size, whether a mono version exists, whether it survives knocked out on dark. Raster-only logo: flag it and never auto-trace it.
   - Brand colors: sample 3 to 6 values and convert to `oklch()`. They are candidates. Check contrast against the intended pair; a failing value keeps its hue and moves lightness, and both values are logged.
   - Typeface: enters the system only if web embedding is licensed (open license or a webfont license the client holds). A desktop license or "bought for the logo" is not a license; pick a licensable alternative and log why.
   - Copy documents: extract the client's own terms and phrases for `references/copy.md`. Existing pages are evidence of voice, not approved copy.
   - Photography: which page slot it can fill and the one treatment it needs (re-crop, background removal, grade).
5. No client assets: write the literal line `No client assets provided — everything visual is invented.` in §Assets.

### Flagship asset rule

A flagship site needs real assets to carry it. At flagship tier, §Assets must name, for the hero and the signature move, either existing client material that clears the ceiling, or material that will be produced in this build (photography the client will supply by a named date, generated imagery with the tool named, an authored 3D scene, a commissioned illustration set). If neither can be named, drop the tier to standard, tell the user why in one sentence, and record the downgrade in PROGRESS.md.

## BRIEF.md format

40 to 90 lines. Every later phase re-reads it, so keep it lean.

```md
# Brief — <working name>
Tier: sketch | standard | flagship
Mode: guided | autonomous
Deployment mode: production
Site kind: product | studio | shop | editorial | place | launch
## Site type
## Audience
## Conversion
## Tone
## Subject world
## Pages
## Content inventory
## Material claims
## Backend
needs: …
rejected: …
## Assets
## Compliance
```

Write exactly one value on each of the first four lines. `Site kind:` is machine-read by the phase checker and the kit picker; choose the closest: `product` (software, app, developer tool, service sold online), `studio` (agency, portfolio, personal site), `shop` (things bought on the page), `editorial` (articles, reports, documentation), `place` (somewhere people go: bakery, hotel, clinic, venue), `launch` (a game, a film, an event, a campaign, a product reveal). `Deployment mode:` is machine-read by the hooks, the gates and ship: one line, value `production`, `staging` or `demo`. Use `production` when every material fact came from the user, and `demo` when any was drafted (see Invented facts) or the user asked for a demo. A missing, duplicated or misspelled line counts as production.

§Compliance is written only when the brief names a market: seller's country, target markets, B2C or B2B, whether contracts are concluded online, and whether each fact came from the user or is assumed. Ask for these in guided mode when an EU market is named; `references/legal-dach.md` consumes them.

## Anti-patterns

- An interview question about color, type, style or mood
- A question whose every answer builds the same site
- `modern`, `clean`, `professional`, `sleek` in §Tone
- A §Subject world of abstractions ("innovation", "trust", "community")
- A database for a contact form; auth "for later"
- An invented testimonial, review count or customer logo
- A flagship brief whose §Assets says "none" and names nothing that will be produced
- A client hex adopted as-is when it fails contrast
- An auto-traced raster logo
