# Quarterly (id `periodical`)

The site is one issue of a small, well-made magazine. A masthead carries the issue line (number, season, a live status); every section opens with a folio (§ number, section name, issue run) and the colophon closes the issue. Newsreader sets both the reading text (18–19px, about 66 characters a line) and the headlines; Libre Franklin sets labels, figures and captions. Drop caps, pull quotes, sidebars, numbered figures and marginal notes do the work pictures do elsewhere. Square corners, hairlines and heavy rules; no cards, no shadows, no motion.
**Suits:** inns and restaurants with a story, wineries and farms, nonprofits and campaigns, studios that write, annual reports, schools and societies. **Not for:** quick transactional pages, software, anything with little to read.

Files: `pack.css`, `pack.js`, `fonts/` (copy all three), `catalogue.html` (copy markup from it, pattern by pattern; copy the hidden `<svg>` sprite once, straight after `<body>`).

## Colourways (`<html data-colourway="…">`)

| id | Ground / text | Accent | Band | Choose for |
|---|---|---|---|---|
| `paper` (default) | cool paper #f3f3ef / ink #17181a | ultramarine #2a3cb0 | navy ink | most clients: inns, farms, schools, reports |
| `night` | #121417 / #ebe8e1 | periwinkle #a9b8ff | deep blue | evening trades: suppers, bars with a story, concerts, a winter issue |
| `special` | cobalt #1f3fbf / #f7f5ef | yellow #ffd34d | paper band | a campaign, a festival, an anniversary or launch issue |

A fourth from the client's colours: on `[data-colourway="client"]` set `--ground --text --muted --band --band-text --accent --accent-ink --line` and `color-scheme`. These pairs must reach 4.5:1: text/ground, muted/ground, accent/ground, band-text/band, accent-ink/accent, and text, muted, accent against `--panel` (6% text mixed into ground). `--line` is decoration only. Put the client's brand colour in `--accent` if it passes; otherwise in `--band`.

## First screens (pick one; it holds the only `h1`)

| id | Class | Right when |
|---|---|---|
| cover-story | `.cover` | the subject has an obvious picture (a building, a place, a bottle, a person). Wins whenever a real photo exists. |
| contents-page | `.contents` | the main attraction is a list with figures: a menu, a wine list, prices, a year's results. Table 1 is the client's own table. |
| letter | `.letter` | the client is a voice: a founder, a family, a chair, a campaign. Type is the picture; no photo. |

Make it specific: the cover headline names the client's one fact (an age, a place, a promise), never a slogan; byline facts are real numbers (since, rooms, hectares, members); Fig. 1 shows the actual place. The contents list uses the page's own section numbers. The letter opens with a sentence only this owner could write, dated from a real place.

## Patterns

| Pattern | Use it for | The builder supplies | Limits |
|---|---|---|---|
| masthead `.masthead` | header + nav | name, issue line, status, section links with numbers | 4–7 links, 1–2 words each |
| cover `.cover` | first screen A | kicker, h1, standfirst, byline facts, actions, Fig. 1, cover lines | h1 3–9 words (`is-long` over 9); 3 cover lines |
| contents `.contents` | first screen B | issue line, h1, contents list, Table 1 | 4–8 entries; table 5–14 rows |
| letter `.letter` | first screen C | dateline, opening line, 3–6 paragraphs, signoff, aside | opening 8–22 words (`is-long` over 16) |
| feature `.article` + `.prose--margined` | the story, history, method | h2, standfirst, byline, paragraphs, notes, pull quote, sidebar | 4–12 paragraphs, 1–4 notes, 1 pull quote |
| listing `.listing` | offerings with prices | groups (head + unit), items (name, price, note, tag) | 1–4 groups × 3–9 items; names ≤6 words |
| fact file `.factfile` | particulars of one thing | figure, h2, term/value rows | 4–10 rows; terms ≤3 words |
| steps `.steps` | how it works, in order | title, 1–3 sentences, meta | 3–9 steps |
| spread `.spread` | one part told with a picture | h2, 2–4 paragraphs, quote, figure | add `spread--flip` to swap sides |
| band `.band` | one sentence the client stands by | statement, attribution | 8–30 words (`is-long` over 20) |
| numbers `.numbers` | a row of real figures | value, unit, label, source line | 3–8 figures, values ≤7 characters |
| almanac `.almanac` | events, seasons, dates | `data-date`, weekday/day/month, title, sentence, meta | 3–12 dates, oldest first |
| people `.people` | staff, growers, board | portrait, name, role, bio | 2–9 people; bio 15–40 words |
| letters `.letters` | questions | intro, contact link, question/answer pairs | 3–10 questions |
| reply card `.reply` | booking, enquiry, sign-up | address line, fields, submit | 3–10 fields |
| finding us `.directions` | getting there | map figure, address, routes, contact links | 2–5 routes |
| colophon `.colophon` | footer | name, status, 3–4 columns, end line | — |
| erratum `.erratum` | 404.html | h1, correction slip, link home | — |

## Elements

| Element | Markup | Notes |
|---|---|---|
| buttons | `.btn`, `.btn--secondary`, `.link-quiet` | one `.btn` per section at most; disabled = `disabled` / `.is-disabled` |
| fields | `.field` > label + `.hint` + input + `.error` | "(required)" in label text; error sets `aria-invalid="true"` |
| choices | `label.choice` > input + span | 44px hit area, drawn box |
| stepper | `.stepper[data-stepper]` | buttons carry `hidden`; JS reveals them |
| status / tag | `.status` (`--closed`, `--out`), `.tag`, `.tag--solid` | |
| notice | `.notice--info`, `.notice--warn` | title ≤6 words, body ≤40 |
| table + views | `table.ledger` (`.num` cells), `.views` radio tabs | 2–5 views; unique radio `name` per switch |
| disclosure | `details.disclosure` | |
| picture | `.frame.frame--4x5` (3x4, 1x1, 5x4, 3x2, 16x9) + `figcaption` with `.fig__no` | `.frame__label` "Stand-in photo" on any picture not the client's |

## Composition

- Order: masthead, first screen, then story (feature or spread), offerings (listing / contents), particulars (fact file, steps), band, numbers or almanac, people, letters, reply card, finding us, colophon. 7–11 sections in all.
- Number every section after the first screen in order with its folio (`§ 02`, `§ 03`…); nav, contents list and cover lines use the same numbers. The issue run (`No. 1 · Spring 2027`) is identical in every folio.
- Two grounds only: the colourway ground and the band. At most two bands, never adjacent, never first or last; put the first band after the third section.
- Never neighbours: spread and fact file; two picture-led sections; listing and contents-page; steps and numbers.
- One feature (marginal notes) per page. Pull quote and sidebar appear once each.
- Figures are numbered Fig. 1, 2… in page order; tables Table 1, 2…

## Behaviours (`pack.js`)

- `data-hours="mon closed; tue-sat 12:00-15:00 18:00-23:00; sun 12:00-17:00"` on a `.status`: rewrites it to "Open now · until 23:00" or "Closed now · opens Tuesday 12:00" in the visitor's clock. Optional `data-open-text`, `data-closed-text`. Write the plain hours as its text for no-JS.
- `data-dates` on an `<ol class="almanac" id="…">`, `data-date="2027-02-13"` (and `data-date-end`) on each item, `data-label` for its name: past items get `.is-past`, the soonest upcoming gets `.is-next` and shows its `.almanac__flag`. `data-dates="hide-past"` hides past ones. Any element with `data-next-for="<list id>"` receives the next item's `data-label`.
- `data-stepper` on `.stepper`: wires the `[data-step="-1"]` / `[data-step="1"]` buttons, respects `min`, `max`, `step`.

## Voice

Write like a good editor: plain, specific, unhurried. Headlines are statements of fact in sentence case, no exclamation marks, no puns, no "Welcome to". Standfirsts are one italic sentence that says what the section is about. Numbers are written as figures with units. Body copy uses the first person plural for the client.
- An inn: "Two hundred and forty winters at the crossing"
- A winery: "Eleven hectares of chalk, and what grows in it"
- A school society: "The Linnean Club has met every Thursday since 1907"

## Rules for the builder

1. Copy markup from `catalogue.html` exactly; change content, not classes or structure.
2. One `h1` (in the first screen); every section has an `h2`; no level skipped.
3. Running text always goes in `.prose`, `.letter__body` or the pattern's own column so lines stay under 68 characters.
4. Notes are `<span class="note" role="note">` inside the paragraph, straight after its `<sup class="ref">`.
5. Every picture is in a `.frame` with a ratio class and a numbered caption; label stand-ins.
6. Drawings are inline SVG with `class="drawing"`, `currentColor`, `.lit` for the one accent shape, and `role="img"` + `aria-label`.
7. Forms without a backend use `action="mailto:…" method="post" enctype="text/plain"` and say so in `.reply__foot`.
8. No `href="#"`, no extra fonts, no colours outside the custom properties, no animation.
