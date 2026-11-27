# Vitrine

Objects in a case. Each thing the client makes or offers sits alone on a pale **plate** (a picture slot one step lighter than the stone wall) with a **museum label** under it: number in Bodoni, title, material, dimensions and year, then price or "On request" with a status dot (red dot = sold, as in a gallery). Plates hang asymmetrically, rules are 1px hairlines, nothing moves fast. Bodoni Moda is used large and rarely (headings, numerals); Jost carries everything else at 16px or more. Suits makers of considered objects and spaces: ceramicists, jewellers, furniture makers, architects, interior studios, galleries, florists, boutique hotels, portfolios. Not for busy price-led shops, events, software or anything that needs urgency.

Files: `pack.css`, `pack.js`, `fonts/`, `img/standin-jar.jpg` (sample only). Copy the `<svg class="sprite">` block from `catalogue.html` once, right after `<body>`. Every pattern in `catalogue.html` carries a `PATTERN:` or `ELEMENT:` comment with its slots and limits; copy markup from there exactly.

## Colourways

Set on `<html data-colourway="…">`.

| id | Ground / plate | Text / accent | Band | Choose for |
|---|---|---|---|---|
| `stone` (default) | warm grey stone #E7E4DF / #F2F0EC | near-black / patina green | charcoal | most makers, architects, galleries; anything pale (porcelain, timber, linen) |
| `ink` | ink #141517 / #1D1F22 | bone / brass | pale bone | jewellers, lighting, evening hotels, dark or metallic work |
| `sage` | sage glaze #C9D0C0 / #D7DDCF | deep green-black / mulberry | moss | florists, gardens, glaze-led ceramics, country hotels |

A fourth colourway from a client's own material: copy the `[data-colourway="sage"]` block, rename it, and set `--ground --plate --text --muted --band --band-text --band-muted --accent --accent-text --line --error --warn --dot`. Plate is the ground moved 4–6% toward white (or toward light on dark grounds). Pairs that must reach 4.5:1: text, muted, accent, error and warn on **both** ground and plate; band-text and band-muted on band; accent-text on accent. `--line` and `--dot` are never text. Keep the ground a material (clay #D9C6B5, slate #3B4148…), never cream with terracotta.

## Patterns

| Pattern | Use it for | The builder supplies | Limits |
|---|---|---|---|
| header (`site-head`) | name, nav, live status, running index of plates | name + 2–4 word descriptor, nav links, `data-hours`, one link per plate id | 3–12 plate numbers; ≤5 nav links |
| `fs-object` | first screen: one object very large with its label | h1, lead, 1–2 buttons, one picture, full label | h1 4–12 words |
| `fs-index` | first screen: the client's list of works as centrepiece | h1, lead, status, button, 4–9 rows with thumbnail | title 2–6 words, size ≤14 chars |
| `fs-statement` | first screen: a sentence in display type + one small plate | statement, lead, buttons, one plate | statement ≤30 words |
| `case` | index of offerings on plates (asymmetric six-place rhythm) | numeral, h2, aside, plates with full labels and ids | 3–12 plates |
| `tp` (+`tp--flip`) | text beside a picture: maker, place, method | plate + label, h2, ≤3 paragraphs, one aside figure, link | 40–120 words |
| `spec` | specification list beside a held plate | plate, h2, line, term/value pairs | 4–12 pairs; term 1–3 words |
| `steps` | steps in order on a hairline | numeral, h2, steps with title, text, duration | 3–9 steps |
| `figs` | a row of real numbers | number, unit, one line each | 3–6; number ≤6 chars; only true figures |
| `band` | the one full-width statement | quote, source label, a line drawing part | once per page |
| `works` | list of works as tables in views | 2–5 views, each a table | ≤6 columns, 3–15 rows |
| `sched` | schedule: shows, open days, seasons | dates with `data-date`, `data-label`, title, place, time | 3–10 dates |
| `people` | people as portrait plates | portrait (photo or `v-person`), name, role, one line | 1–9 people |
| `faq` | questions as numbered disclosures | note + link, questions and answers | 3–10 |
| `req-form` | request form with the plate asked about | mailto address, fields, plate, notice | 3–9 fields |
| `visit` | getting there: drawn map, address, hours, ways | adapt the map SVG, address, hours rows, 2–4 ways | ≤7 hours rows |
| `lost` | 404 page: an empty plate | heading as h1, one line, two links | — |
| footer (`site-foot`) | name in display type, three columns, colophon | address, hours, contacts, plate range | 3 columns |

| Element | Classes | Notes |
|---|---|---|
| buttons | `.btn`, `.btn--secondary`, `.quiet` | disabled = dashed; one `.btn` per section |
| fields | `.field > label + .input`, `.hint`, `.err` | "(required)" in `<span class="req">` inside the label; errors start "Error:" and use `aria-invalid` |
| choices | `.check` (checkbox, radio), `.stepper` (number) | wrap in `fieldset` + `.legend` |
| status / tag / notice | `.status--open/closed/available/sold`, `.tag`, `.notice`, `.notice--warn` | sold is always the red dot |
| table | `.table-wrap` > `.table`, `.r` figures, `.no` numbers | wrapper keeps `tabindex="0" role="region" aria-label` |
| disclosure | `.qa` > `details` | numbering is automatic |
| picture slot | `.slot` (4:5), `--square`, `--land`, `--wide`, `--tall`; `.slot--drawn`; `.slot__no`; `.standin` | `<img>` covers; a drawing sits on the shelf line |

## Composition

- Order: header → first screen → `case` (or `works` if the first screen is `fs-index`) → `tp` → `spec` or `steps` → `figs` → `band` → `sched` → `people` → `faq` → `req-form` → `visit` → footer. Drop what the client lacks; keep the order.
- Two grounds only: the wall and the band. Plates are the third tone and never hold text blocks.
- One `band`, after the middle; never next to the first screen or the footer.
- Not neighbours: `tp` and `spec` (both plate + text); `case` and `people` (both plate walls); two `tp` in a row unless the second is `tp--flip`.
- Number sections with Roman numerals in `.sec-head__no` (I, II, III…) in page order. Plate numbers (01, 02…) are the client's own and match the running index, the case and the list of works. Labels that are not works use letters (A, B) or lower-case roman (i, ii) for people.

## The main attraction

- **fs-object** when the subject has one obvious picture: a piece, a room, a building, a bouquet. This wins whenever such a picture exists. Use the client's best piece (photo) or the matching drawing part; the label must be real (material, size, year, price or On request).
- **fs-index** when the range is the point: a maker with a season of pieces, a gallery show, a hotel's rooms (rooms as works: "Room 4, Garden", size in m², rate). Each row links to its plate.
- **fs-statement** when the idea leads and no single object stands for it: an architect's approach, an interior studio, a florist's season. One plate only, small, bottom right.
- Make it specific: the h1 names what they make and how, in their words; the plate is their own thing with true figures; the status shows their real hours.

## Drawings

Parts (`<use href="#…">`): filled `v-jar v-bottle v-bowl v-beakers v-lamp v-stool v-ring v-pendant v-branch v-person`; line (add `drawing--line`) `v-chair v-elevation v-plan`. Use each part's own `viewBox` (listed in the sprite) with `preserveAspectRatio="xMidYMax meet"`, `role="img"` and an `aria-label`, or `aria-hidden="true"` when the label beside it says the same. Pick the part nearest the client's object; architects use `v-elevation`/`v-plan`, hotels `v-plan`, florists `v-branch`, jewellers `v-ring`/`v-pendant`. A photograph replaces the drawing in the same slot; mark any photo not the client's own with `<span class="standin">Stand-in photo</span>`.

## Behaviours (`pack.js`)

- `data-hours="Thu-Sat 10:00-17:00; Sun 11:00-16:00"` on a `.status`: replaces the written text with "Open now, until 17:00" or "Closed now, opens Thursday at 10:00". Days Mon–Sun, ranges with `-`, entries separated by `;`. Write a sensible fallback inside: `<p class="status" data-hours="…">Open Thursday to Sunday</p>`.
- `data-next-date` on a list (give it an `id`); each item `data-date="2027-01-23"`, optional `data-end`, and `data-label="Throwing workshop, 23 January"`. Past items grey out, the next gets a "Next" (or "Now on") tag in its `[data-next-slot]`. Any `data-next-from="#date-list"` element receives the next item's label.
- `data-views="Kinds of work"` on a box whose children carry `data-view="Vessels"`; each child starts with `<h3 class="views__title">`. Builds the tabs; without JavaScript all views show in turn. `data-view-default` picks the first one shown.

## Voice

Plain, exact, unhurried. Headings say what is there, in sentence case, with no exclamation and no "Discover"/"Elevate". Body copy is short sentences with materials, measures and dates. Labels are catalogue entries, not sales lines.
- Ceramicist: "Stoneware made to be used for a lifetime"
- Architect: "Houses drawn for the light of one valley"
- Boutique hotel: "Nine rooms above the old ropewalk"

## Rules for the builder

1. One `h1` (the first screen's heading); section headings `h2`, inside them `h3`.
2. Every plate has a full label; never a picture without its number and title.
3. Prices as written by the client, or "On request"; sold pieces keep their plate with the red dot.
4. Display headings: no `hyphens`, no word longer than 13 letters; shorten the heading instead.
5. Forms: `action="mailto:…"` plus the notice saying nothing is sent from the page, until a backend exists.
6. Links never `href="#"`; every plate number in the running index points at an existing id.
7. Do not add shadows, rounded corners, gradients, scroll animations or new colours.
8. Keep `aria-label` on meaningful drawings and maps; decorative ones get `aria-hidden="true"`.
