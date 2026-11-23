# structure

Decide the routes, each page's job and section order, where the signature move lives, and the copy-deck slots, and write them to `design/SITEMAP.md`.

Load when: Phase 4 starts, or an iterate adds or restructures a page.
Reads: `design/BRIEF.md`, `design/DIRECTION.md`. Writes: `design/SITEMAP.md` (copy for the deck slots comes from `references/copy.md`).

Every tier writes SITEMAP.md. A sketch build has one page and still gets the file, because resume and iterate depend on it.

## Pages and routes

1. List every content item and every conversion the brief names.
2. Run the one-page test first. If the content fits in about 5 to 8 sections and there is one conversion goal, plan one page plus the legally required pages and stop. Do not add pages to look substantial.
3. Group the rest into pages. Write one purpose sentence per page. Merge two pages whose purpose sentences say nearly the same thing.
4. Give each page exactly one primary conversion goal: buy, book, sign up, contact, subscribe, or read the next page. Name any secondary goal as an exit to another page.
5. Name routes in kebab-case: singular for one thing (`/pricing`), plural for collections (`/work`). Keep marketing routes at most two segments deep. Use a dynamic segment only for a collection with at least 4 real planned items; hardcode smaller sets.
6. Header navigation: 3 to 5 labels plus one visually distinct call to action, ordered by visitor priority. Everything else goes in the footer. Keep the same order on mobile.
7. Legal pages depend on the market and are decided now. For a business in Germany, Austria or Switzerland read `references/legal-dach.md`. Elsewhere, add `/privacy` when personal data is processed and `/terms` when there is a transaction. Legal pages live in the footer.
8. List the routes that need a designed `loading`, `error` or `not-found` state.

Starting budgets, to adjust from the brief:

| Brief | Pages |
|---|---|
| one product or service, one audience | 1 + legal |
| SaaS with pricing | 3 to 5 |
| portfolio or studio | 3 to 6, with a work index and case pages |
| shop | home, collection, product, cart, checkout, legal |
| editorial | home, index, article, about |

## Sections

For each page, write the section order before any detail. Each section carries one idea. Read the section names top to bottom: if that list does not argue for the page's conversion goal, reorder or cut before going further.

For each section record:

- **Idea**: the one thing the visitor should take away, in one clause.
- **Content**: exact counts (number of items, words per heading and body, images).
- **Width**: full-bleed, contained or narrow. Use at least two widths per page.
- **Weight**: dense or open. Follow a dense section with an open one.
- **Mobile**: what reorders, collapses or is dropped at 375 px.

Do not fill a page with the usual section kit: hero, logo strip, three feature cards, stats row, testimonial carousel, FAQ, call-to-action band. Each section must come from this brief's content. A section that exists only because landing pages usually have one is cut. Do not mark sections with 01/02/03 numerals or small tracked uppercase labels unless DIRECTION.md argues for them; the same applies to the other defaults listed in `references/taste.md`.

Proof sections (testimonials, client logos, numbers, press) exist only when the brief lists real proof. Without it, plan the page without a proof section; never plan sample proof for production.

Design the 404 page, the footer and any loading state as part of the structure, at the same level of care as the homepage.

## Signature move

DIRECTION.md names one signature move. Place it before planning the other sections, so the page is built around it.

- Put it where attention already peaks: the homepage's first viewport or the first transition below it. Never in the footer or on a page visitors may skip.
- Mark exactly one section on the whole site `SIGNATURE`. A site-wide scene still gets one mark, on the route where it is first entered, with the routes it persists across listed beside it.
- Keep the two neighboring sections quiet.
- When the move is motion, write its reduced-motion version on the same line.

## Copy deck

Every section gets named slots that `references/copy.md` fills in this same file. Slot names are `<route>.<section>.<slot>`, for example `/.hero.heading`, `/.hero.action`, `/pricing.plans.note`. Give each slot a length limit. Include the slots that are easy to forget: page title and meta description per route, button labels, form labels, hints and errors, empty states, the 404 text, and image alt text that carries meaning.

## SITEMAP.md format

```md
# Sitemap

## Routes
| Route | Purpose | Goal | Nav |
|---|---|---|---|
| / | <one sentence> | <one goal> | header |
| /privacy | data protection notice | — | footer |

Header: <labels in order> + action: <label> → <route>
Footer: <groups and links>
Designed states: <routes needing loading / error / not-found>

## Pages
### / — goal: <goal>
1. <section name> — idea: <clause> — content: <counts> — width: <class> — weight: <dense|open> — SIGNATURE: <move, reduced-motion version>
2. <section name> — idea: … — content: … — width: … — weight: …
Mobile: <what changes at 375>

## Copy deck
| Slot | Limit | Text |
|---|---|---|
| /.meta.title | 60 chars | |
| /.hero.heading | 8 words | |
```

Leave the Text column empty here; Phase 4 fills it with `references/copy.md` before Phase 5 starts.

## Mistakes to catch

- A page whose purpose is "describes our services". That is a section on another page.
- A page with no conversion goal.
- A `/blog` with zero or one planned post.
- A section line without an idea, or with content given as "some" or "a few".
- Every section at the same width.
- Two `SIGNATURE` marks, or the signature deferred to the build.
- More than 8 sections on a page with one goal.
- A page without a `Mobile:` line.
