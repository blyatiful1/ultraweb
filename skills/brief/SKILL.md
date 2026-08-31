---
name: brief
description: Expand a user prompt into design/BRIEF.md — the complete creative brief; site type and energy budget, a named audience persona, conversion goals, tone words with a tension pair, page list, per-page content inventory, and backend needs mapped to Tier-6 skills with an explicit rejected list. In guided mode (the default) it runs a short scoping interview whose questions are generated from what THIS prompt left open — site-type-specific forks about scope, features, and content, never aesthetics; in autonomous mode it decides everything a professional studio would decide itself. Either way it logs inventions as assumed facts and the finished file contains zero open questions. Invoke as Phase 1 of the ultraweb pipeline right after taste, whenever a build starts from a raw prompt ("build me a site for X", "create a landing page for Y", "make a website for my business"), or when any downstream skill finds design/BRIEF.md missing, stale, or incomplete.
---

# brief — one conversation, every decision

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
3. **Guided mode:** run the scoping interview (next section) — the site type from step 2 picks which forks are worth asking. Fold every answer into the brief as a committed decision. **Autonomous mode:** skip; decide everything per "Decide, never interview" below.
4. Name the audience as a person, not a demographic: "a 38-year-old head of ops comparing rostering tools on her phone between meetings" — never "businesses of all sizes". Add what she distrusts; `copywriting` and `social-proof` build against it.
5. Fix ONE primary conversion (book, buy, sign up, contact, subscribe) and at most one secondary. A page that serves neither does not exist.
6. Choose tone: 3 specific adjectives + 1 tension pair ("warm but exact", "playful but competent"). Reject any adjective that fits every site — "modern", "clean", "professional" are bans, not tone words. Write one sample sentence in the voice.
7. List pages — the fewest that serve the conversion; 1–5 covers most briefs. Do not invent About/Blog/Careers pages nobody asked for; do not collapse pages the prompt explicitly named.
8. Build the content inventory per page: the facts, claims, numbers, names, and proof points `copywriting` will need — opening hours, price points, team names, feature specifics, testimonial sources, stat claims. Where the prompt is silent, decide — but sort every invention into one of two classes and log it in §Assumed facts under that class. **Creative assumptions** (tone, visual direction, page structure, demo product names, copy angles) drive autonomous work freely. **Material claims** — opening hours, prices, addresses, delivery times, guarantees and refund terms, inventory, professional credentials, measured statistics — may be drafted as placeholders but are never production truth: log each ending `— material, unconfirmed`; it may render on a demo/staging build, and it BLOCKS a production ship until the user confirms or corrects it (`ship` greps the marker). An invented "open at 8" or "30-day refunds" harms a real visitor exactly like an invented testimonial. **The invention license stops entirely at third-party proof:** testimonials, reviews, press mentions, customer logos, and usage stats presented as measured are never invented — an empty proof inventory is recorded as empty, and `social-proof` builds honest credibility from it (or, on a build this brief explicitly marks demo/staging, labeled `UNVERIFIED-PROOF` samples). An invented endorsement logged in §Assumed facts is still a fabricated endorsement on the rendered page.
9. Run the backend decision framework below. Record chosen Tier-6 skills AND rejected ones, each with a one-line reason.
10. Write design/BRIEF.md in the format below. Grep it for `?` — a question mark in the FILE is a defect in either mode; the interview happens in conversation, and its answers land as decisions.

## The scoping interview — guided mode

The interview exists because two kinds of wrong assumptions are expensive: scope (a page or feature the user didn't want, or wanted and didn't get) and substance (selling the wrong thing to the wrong person). Those forks get asked; everything else still gets decided. Rules:

- **Generated, never templated.** Questions come from what THIS prompt left open, filtered through the site type. A prompt that already says "shop + subscriptions, German only" has answered those forks — asking again is noise.
- **Multiple-choice, concrete options.** Ask via the structured question tool (AskUserQuestion) — each question 2–4 real options a professional would shortlist, the recommended one first; the user can always free-type. Never open-ended "tell me about your business" essays.
- **Ceiling: one round of up to four questions.** A second round only if an answer opens a genuinely new fork (chose subscriptions → one follow-up on billing rhythm is legitimate). Two rounds is the hard stop.
- **Only forks that change the build.** If every option leads to the same site, the question is theater — cut it.
- **Never aesthetics.** Colors, fonts, style, "vibe" — banned. Phase 2's mockup round shows three real candidates; the user points instead of describing. An interview question about visuals steals that phase's job and does it worse.

Site-type fork banks (starting points, not scripts): **e-commerce** — catalog size, one-time vs subscription, own checkout vs external, shipping scope; **SaaS/product** — self-serve vs sales-led, public pricing, docs/changelog; **local business** — booking/reservations vs walk-in, languages, opening-hours source; **portfolio/agency** — index vs deep case studies, public vs gated/password-protected work, hireability CTA; **editorial** — cadence, authorship, newsletter capture; **event** — single date vs series, own registration vs ticket platform; **web app** — accounts from day one, what's saved per user; **docs** — versioning, search depth.

Answers become committed decisions in the brief, attributed plainly ("subscriptions: yes — user, interview R1"). Everything unasked follows the autonomous doctrine below.

## Decide, never interview — autonomous mode (and everything unasked)

In autonomous mode the user's prompt WAS the interview: default question count zero, and the pipeline's single permitted question (root SKILL.md) is reserved for exactly one case — no professional could infer what the site is even for. And in BOTH modes, everything the interview didn't cover — name, pricing, tone, imagery, page structure, tech needs — you decide the way a studio would, then record it in §Assumed facts so the user can correct it after seeing the build. A wrong specific assumption costs one `iterate` pass; an exhaustive interview costs the premise of the harness. Specific-and-wrong beats vague-and-safe every time.

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
| "Ask anything" chatbot, AI assistant, AI/semantic search, generative UI | **Default reject** — an AI-feature skill enters `needs` only with an accepted variant + reason logged | any AI chat/search widget the brief doesn't demand — reflexive "every modern site has one" sprawl |

Write the outcome as two lists: **Backend: needs** (skill → the feature demanding it) and **Backend: rejected** (skill → one-line reason). The rejected list is what stops Phase 7 scope creep.

AI features are the one class that defaults to **rejected**: an assistant, chatbot, or AI/semantic search earns a place in **needs** only with an explicit variant and one-line reason, and a downstream AI-feature skill must find that acceptance logged here before it may build — it may never self-justify inclusion. Tidepool's B2B SaaS docs accept a grounded docs-RAG with inline citations; Ledger & Lane (law firm) rejects — unvetted legal answers are a liability and undercut the firm's authority; Casa Verde (restaurant) rejects — menu and hours change faster than any index, so stale answers erode trust.

## BRIEF.md format

```md
# Brief — <working site name>
Deployment mode: production
## Site type & energy budget
## Audience            (one named persona: situation, device, what they distrust)
## Goals               (primary conversion; secondary if any; what success means)
## Tone                (3 adjectives + 1 tension pair; one sample sentence in the voice)
## Pages               (each: name, route, job, which conversion it serves)
## Content inventory   (per page: facts, claims, numbers, proof the copy needs)
## Compliance facts    (see below — only for briefs naming a market/jurisdiction)
## Backend: needs      (Tier-6 skill → the feature demanding it)
## Backend: rejected   (Tier-6 skill → one-line reason it's out)
## Assumed facts       (every invention, one line each, classed creative or material —
##                      material entries end with the material-unconfirmed marker from
##                      Process step 8 and block production until confirmed)
```

The skeleton shows the literal default (`production`); write `staging` or `demo` in its place only on the user's explicit request — never copy an options list into the file, the grammar takes exactly one value.

**Deployment mode** is a machine-read field, exactly the literal `Deployment mode: production` (or `staging`/`demo`) on its own line — the antislop hook, gate-content, and ship grep it to decide whether labeled `UNVERIFIED-PROOF` samples are lawful. Rules: exactly ONE such line; allowed values exactly those three; a missing, duplicated, or misspelled line fails BRIEF validation and every consumer fails closed to production semantics. Default is `production`; only an explicit user request makes a build staging/demo, and switching a demo build to production re-triggers proof and material-claims validation.

**§Compliance facts** exists so legal scoping happens where the facts are cheap (the user knows them) instead of being guessed at gate time. When the brief names a market or jurisdiction, record: seller's seat (country), targeted consumer markets, B2C or B2B, whether the site concludes consumer contracts online (shop/booking/ticketing — yes/no), employee count and turnover/balance relative to the €2M microenterprise thresholds, the evidence source for each (user statement vs assumed), and a `counsel-needed:` flag for anything asserted rather than known. `sitemap` consumes this to decide legal routes; `gate-accessibility` re-derives scope from the finished build and flags drift. These are user facts — ask for them in guided mode when a DACH/EU market is named; in autonomous mode record them as §Assumed facts entries with the counsel flag set.

## Anti-patterns

Grep a finished BRIEF.md for these:

- `TBD`, `TODO`, `?`, `to be decided`, `ask the user`, `depending on` — questions live in the interview, never in the file; the finished brief defers to nobody, including future-you
- An interview question about colors, fonts, or style — that fork belongs to the mockup round, which shows instead of asking
- Re-asking something the prompt already answered, or a question whose every option builds the same site
- `modern`, `clean`, `professional`, `sleek` as tone words — they describe nothing
- `various`, `etc.`, `and more` in a content inventory — the inventory exists so `copywriting` never improvises
- A `database` for a contact form; `auth` "for later"; a CMS for a 3-post launch blog; an AI chat/search widget with no accepted-variant reason logged — backend maximalism
- Pages without a stated job ("About — about the company")
- An audience section that survives the swap test
- A stated user constraint silently dropped ("must be in German", "no stock photos")

## Worked example — Framewalk, Steam-launch site for "Hollow Cartographer"

Moved to `references/example.md` — read only when this build's case is genuinely ambiguous; the sections above are the decision material.

## Composes with

Moved to `references/composes.md` — the handoff map; load it when orchestrating this skill against its neighbors.
