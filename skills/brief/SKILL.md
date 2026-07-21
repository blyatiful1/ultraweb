---
name: brief
description: Expand a single user prompt into design/BRIEF.md — the complete creative brief; site type and energy budget, a named audience persona, conversion goals, tone words with a tension pair, page list, per-page content inventory, and backend needs mapped to Tier-6 skills with an explicit rejected list. Decides everything a professional studio would decide itself and logs inventions as assumed facts — never interviews the user. Invoke as Phase 1 of the ultraweb pipeline right after taste, whenever a build starts from a raw prompt ("build me a site for X", "create a landing page for Y", "make a website for my business"), or when any downstream skill finds design/BRIEF.md missing, stale, or incomplete.
---

# brief — one prompt, every decision

**Stage:** Phase 1 — Understand - **Reads:** the user's prompt (invoke `ultraweb:taste` first) - **Writes:** design/BRIEF.md

## Standard

A first-grade brief is decisive, specific, and complete:

- **Decisive:** zero open questions. No options deferred, nothing "for later". `direction`, `sitemap`, `copywriting`, and every backend skill can run from this file without asking anything.
- **Specific:** it fails the swap test — swap in a competitor's name and the brief must break. "Audience: businesses" survives the swap and is therefore worthless.
- **Complete:** site type, audience, conversion, tone, pages, per-page content inventory, backend decision — all present, all committed.
- **Lean:** 40–80 lines. Every downstream phase re-reads this file; pad it and it stops being read.

## Process

1. Read the prompt twice. Extract every noun, constraint, and stated feature — nothing the user wrote may be dropped, softened, or contradicted.
2. Classify the site type — one of: SaaS/product, portfolio/agency, e-commerce, editorial/content, local business, event, web app, docs. Record the energy budget `taste` assigns it (SaaS: clarity + one wow; portfolio: spend boldly; e-commerce: imagery leads; editorial: type is 80% of the design; local business: warmth beats cleverness).
3. Name the audience as a person, not a demographic: "a 38-year-old head of ops comparing rostering tools on her phone between meetings" — never "businesses of all sizes". Add what she distrusts; `copywriting` and `social-proof` build against it.
4. Fix ONE primary conversion (book, buy, sign up, contact, subscribe) and at most one secondary. A page that serves neither does not exist.
5. Choose tone: 3 specific adjectives + 1 tension pair ("warm but exact", "playful but competent"). Reject any adjective that fits every site — "modern", "clean", "professional" are bans, not tone words. Write one sample sentence in the voice.
6. List pages — the fewest that serve the conversion; 1–5 covers most briefs. Do not invent About/Blog/Careers pages nobody asked for; do not collapse pages the prompt explicitly named.
7. Build the content inventory per page: the facts, claims, numbers, names, and proof points `copywriting` will need — opening hours, price points, team names, feature specifics, testimonial sources, stat claims. Where the prompt is silent, invent: plausible, specific, internally consistent. Log every invention in §Assumed facts.
8. Run the backend decision framework below. Record chosen Tier-6 skills AND rejected ones, each with a one-line reason.
9. Write design/BRIEF.md in the format below. Grep it for `?` — a question mark in a brief is a defect.

## Decide, never interview

The user's prompt WAS the interview. Default question count: zero. The pipeline's single permitted question (root SKILL.md) is reserved for exactly one case: no professional could infer what the site is even for. Everything else — name, pricing, tone, imagery, page structure, tech needs — you decide the way a studio would, then record it in §Assumed facts so the user can correct it after seeing the build. A wrong specific assumption costs one `iterate` pass; an interview costs the premise of the harness. Specific-and-wrong beats vague-and-safe every time.

## Backend decision framework

Map stated or implied features to Tier-6 skills. Take the cheapest set that fulfills the brief — every tier added is build time and failure surface. Ceiling for a brochure/marketing site: `server-actions` + `email`, nothing more.

| Brief says or implies | Pull in | Explicitly NOT |
|---|---|---|
| Contact / quote / booking-request form | `server-actions` + `email` | `database` — the recipient's inbox is the datastore |
| Newsletter signup | `server-actions` + `email` | `database`, unless the site itself manages subscribers |
| Blog, docs, changelog, case studies | `content-cms` (MDX) | a headless CMS, unless non-technical editors are stated |
| Accounts, login, anything saved per user | `auth` + `database` | — |
| Dashboards, comments, availability-aware booking, user-generated data | `database` (+ `auth` in almost every case) | — |
| Selling — one-time or subscription | `payments` + `database` | both, if "buy" is a link to an external checkout |
| User file uploads (avatars, attachments, submissions) | `storage` | — |
| Third parties calling in: webhooks, public API, a mobile client | `api-design` | route handlers for the site's own forms — `server-actions` owns those |

Write the outcome as two lists: **Backend: needs** (skill → the feature demanding it) and **Backend: rejected** (skill → one-line reason). The rejected list is what stops Phase 7 scope creep.

## BRIEF.md format

```md
# Brief — <working site name>
## Site type & energy budget
## Audience            (one named persona: situation, device, what they distrust)
## Goals               (primary conversion; secondary if any; what success means)
## Tone                (3 adjectives + 1 tension pair; one sample sentence in the voice)
## Pages               (each: name, route, job, which conversion it serves)
## Content inventory   (per page: facts, claims, numbers, proof the copy needs)
## Backend: needs      (Tier-6 skill → the feature demanding it)
## Backend: rejected   (Tier-6 skill → one-line reason it's out)
## Assumed facts       (every invention, one line each, so the user can correct)
```

## Anti-patterns

Grep a finished BRIEF.md for these:

- `TBD`, `TODO`, `?`, `to be decided`, `ask the user`, `depending on` — the brief interviews nobody, including future-you
- `modern`, `clean`, `professional`, `sleek` as tone words — they describe nothing
- `various`, `etc.`, `and more` in a content inventory — the inventory exists so `copywriting` never improvises
- A `database` for a contact form; `auth` "for later"; a CMS for a 3-post launch blog — backend maximalism
- Pages without a stated job ("About — about the company")
- An audience section that survives the swap test
- A stated user constraint silently dropped ("must be in German", "no stock photos")

## Worked example — Framewalk, Steam-launch site for "Hollow Cartographer"

Prompt read: "site for my indie game Hollow Cartographer, launching on Steam — needs a devlog and a way for people to hear about launch."

- **Site type & energy budget:** product/marketing (one game), *clarity first + one wow* — the wow is the hero, not the chrome.
- **Audience:** "a 29-year-old atmospheric-exploration fan clearing her Steam discovery queue at 11pm on a laptop — distrusts indie trailers that over-promise and ship vaporware." `copywriting` and `social-proof` build against that distrust with a real devlog cadence, not adjectives.
- **Conversion:** primary "Wishlist on Steam"; secondary launch-news email capture. Every page serves one or the other.
- **Tone:** hushed, cartographic, ominous — tension pair *eerie but inviting*. Sample line: "You are the last person to map a place that does not want to be mapped." (Rejected "atmospheric, immersive, polished" — survives the swap test, so worthless.)
- **Pages:** `/` (hook + wishlist), `/game` (what it is + system reqs), `/devlog` + `/devlog/[slug]` (proof of progress), `/press` (assets + fact sheet).
- **Backend: needs** → `content-cms` (MDX devlog) · `server-actions` + `email` (launch-news capture). **Rejected** → `payments` (the "buy" is an external Steam link, not our checkout); `database`/`auth` (no accounts, no per-user state).

Rejected alternative: a second filled "Buy on Steam" CTA beside Wishlist — pre-launch there is nothing to buy, and a competing button splits intent; the direction's rule is one primary CTA everywhere.

Handoff: lands in `design/BRIEF.md`; `ultraweb:direction` reads §Site type + the *eerie but inviting* tension to shortlist the Atmospheric-Dark archetype, and `ultraweb:sitemap` expands §Pages into the five routes.

## Composes with

- ultraweb:taste — invoke first; its site-type → energy-budget heuristic drives step 2.
- ultraweb:direction — consumes §Site type and the tone tension to shortlist archetypes.
- ultraweb:sitemap — expands §Pages into routes and nav structure.
- ultraweb:copywriting — writes exclusively from §Content inventory, in §Tone's voice.
- ultraweb:auth, ultraweb:database, ultraweb:payments, ultraweb:email, ultraweb:content-cms, ultraweb:storage, ultraweb:api-design — enter Phase 7 only as §Backend: needs names them.
- ultraweb:iterate — user corrections to §Assumed facts route through it, never a rebuild.
