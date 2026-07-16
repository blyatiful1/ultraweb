---
name: wireframe
description: Section-by-section blueprint for every page of an ultraweb build — decides section order and narrative arc, which component skill builds each section, layout-variant hint, exact content-density budget, width/rhythm class, mobile order, and the single flagged spot where the signature move lives; appends part 2 to design/SITEMAP.md. Invoke in Phase 4 (Structure) right after ultraweb:sitemap and before any section is coded; also when the user asks "what sections should this page have", "plan the page layout", "where should the wow moment go", or when a Phase 6 build agent needs the blueprint for its page.
---

# wireframe — pages as narrative blueprints

**Stage:** Phase 4 — Structure - **Reads:** design/BRIEF.md, design/DIRECTION.md (signature move), design/SITEMAP.md part 1 - **Writes:** design/SITEMAP.md part 2 (per-page section blueprints)

## Standard

A first-grade page is a story with a rhythm, planned before code: hook → tension → proof → resolution → ask. Every section has one job, a named builder skill, and a density budget in counts, not adjectives. Read the section names alone, top to bottom — if that outline doesn't argue the page's conversion goal, no component polish will save it. The blueprint is the contract Phase 6 build agents execute verbatim.

## Process

1. Read part 1 of `design/SITEMAP.md`. For each page, take its purpose sentence and conversion goal — the blueprint walks the reader from arrival to that goal.
2. Read `design/DIRECTION.md` and extract the signature move. Decide its ONE home now — before planning sections — so it shapes the page instead of being bolted on.
3. Draft the narrative arc per page as section names only: 5–8 sections for a landing page, 3–5 for interior pages. Check the arc reads as an argument before adding any detail.
4. Assign each section a builder skill from the map below. If no skill fits, the section is probably two sections — or none.
5. Set per section: layout-variant hint, density budget, width class, rhythm note. Alternate dense and sparse — after a heavy section comes air.
6. Decide mobile order per page: what reorders, collapses, or drops at 375px. A section with no mobile answer is unfinished.
7. Append part 2 to `design/SITEMAP.md` in the format below, one page at a time.

## Blueprint format

One line per section:

`N. <section-name> — skill: <tier-3 skill> — variant: <named variant> — density: <exact counts> — width: <full-bleed | contained | narrow> — rhythm: <note> — job: <one clause>` — plus ` — SIGNATURE: <what>` on exactly one line site-wide.

Worked example:

```
### / (Home) — goal: book a demo
1. hero — skill: hero — variant: typographic — density: H1 ≤8 words + sub ≤20 + 1 primary CTA + 1 ghost — width: contained — rhythm: open, extra air below — job: state the claim — SIGNATURE: oversized kinetic headline (reduced-motion/static fallback: headline set at full size, no animation)
2. proof-strip — skill: social-proof — variant: logo wall — density: 5 logos, monochrome, 1 line of context — width: narrow — rhythm: tight after hero — job: earn ten more seconds
3. problem — skill: feature-sections — variant: numbered editorial list — density: 3 items, H3 + ≤25 words each — width: narrow — rhythm: compressed — job: name the enemy
4. product — skill: feature-sections — variant: alternating split — density: 2 splits, screenshot + H2 + ≤40 words each — width: full-bleed images, contained text — rhythm: offset grid, image bleeds left (page's asymmetry) — job: show, don't claim
5. numbers — skill: data-display — variant: stat block — density: 3 stats, figure + ≤6-word label — width: contained — rhythm: tight — job: quantify the promise
6. testimonial — skill: social-proof — variant: single spotlight quote — density: ≤30 words + name, role, face — width: narrow — rhythm: airy, slow the read — job: let a human close
7. cta — skill: feature-sections — variant: full-width closer — density: H2 ≤8 words + 1 CTA — width: full-bleed — rhythm: double space before cta — job: the ask, nothing else
Mobile: 4 stacks image-first; 5 drops to 2 stats; nothing reorders.
```

Header (`skill: navigation`) and footer (`skill: footer`) are site-level: blueprint them once at the top of part 2, not per page.

## Section → skill map

| Section job | Skill | Never |
|---|---|---|
| First viewport | hero | a carousel |
| Capability story | feature-sections | three identical icon-cards by default |
| Credibility | social-proof | fake-looking logos or quotes |
| Numbers, tables, charts | data-display | screenshots of tables |
| Plans and price | pricing | more than 1 highlighted tier |
| Objection handling | faq | marketing restated as questions |
| Contact / capture | forms | a bare mailto link |
| Repeating items (posts, work) | cards | a uniform grid of identical weights |
| Async or empty surfaces | ui-states | unstyled framework defaults |

## Signature placement rules

- Exactly ONE `SIGNATURE` flag per site. Two signatures equal zero signatures (taste).
- It lives where attention already peaks: the home hero, or the first scroll transition after it. Never the footer, never an interior page a visitor may skip.
- Budget the neighbors DOWN: the two sections adjacent to the signature get the quietest variants on the page.
- If the signature is motion-driven (scroll-motion, physics, or showpiece territory), the blueprint line names its static / reduced-motion fallback.

## Rhythm and width discipline

- ≥2 width classes per page; all-contained is wallpaper rhythm and banned by taste.
- Flag at least one deliberate asymmetry per page (offset grid, bleeding image, overlap) — name the section that carries it in its rhythm note.
- Section spacing follows the arc: compression through the argument, release around the signature and the closing CTA. Encode as rhythm notes ("tight after hero", "double space before cta"); exact values belong to layout-grid.

## Anti-patterns

- `skill: feature-sections — variant: three-cards` repeated as the answer to every content section
- A section line without `skill:` — an unbuildable blueprint invites Phase 6 agents to improvise slop
- Two `SIGNATURE` flags, or a signature deferred "to be decided during build"
- `width: contained` on every section of a page
- 9+ sections on a page with one conversion goal — the arc is padded; cut to ≤8
- An "About us" section whose job clause restates its name — no job, no section
- A page blueprint with no `Mobile:` line — desktop-only planning
- Density budgets in adjectives ("some features", "a few logos") instead of counts

## Composes with

- ultraweb:sitemap — writes part 1; this skill appends part 2 to the same design/SITEMAP.md
- ultraweb:direction — source of the signature move this blueprint places and protects
- ultraweb:layout-grid — turns width classes and rhythm notes into the real spacing system
- ultraweb:hero — executor of blueprint line 1 on every page, variant hint included
- ultraweb:copywriting — density budgets become its per-section length ceilings
- ultraweb:gate-content — verifies the headline-only read still tells the story planned here
