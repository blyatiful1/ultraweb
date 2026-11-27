# Shopfront

The painted shop sign and the price board. Saturated colour from edge to edge, the name set huge in a fat slab (Alfa Slab One) with a sign-writer's block shade, an awning stripe with scalloped edges, round rubber stamps, a bolted enamel board with dot leaders, and a hanging "Open" plate that pack.js works out from the real opening hours. Body copy is a friendly humanist sans (Nunito Sans). Warm and direct, never cute: no mascots, no exclamation marks, no wobbly fonts.

**Suits:** counters and neighbourhoods: bakeries, cafés, delis, market stalls, barbers, repair shops, record and book shops, chippies, clubs and community halls. Anyone with a price list, opening hours and a door on a street.
**Not for:** luxury brands, software and apps, formal professional services (law, finance, medicine).

Files: `pack.css`, `pack.js`, `fonts/`, `catalogue.html` (every pattern and element, with `PATTERN:` / `ELEMENT:` comments that give slots and limits). Copy markup from the catalogue; never write new CSS.

Page head: `<html lang="en-GB" data-colourway="pillarbox">`, `<link rel="stylesheet" href="pack.css">`, `<script src="pack.js" defer></script>`, the font preload line, a `<title>` and meta description. Body starts with the skip link, then the drawing sprite `<svg>` copied whole from the catalogue.

## Colourways

| id | Ground | Band | Accent | Choose it for |
|---|---|---|---|---|
| `pillarbox` (default) | sign red #A51F17, cream text | yolk yellow | yellow | bakeries, delis, butchers, chip shops, market stalls, anything warm and daytime |
| `enamel` (light) | cool white #F1F4F8, ink text | cobalt #1E3FAE, white text | cobalt | barbers, ice cream, laundrettes, repair shops, bookshops, swimming clubs: clean, tiled, blue-and-white |
| `lamplight` (dark) | bottle green #0F2A22, cream text | gold | gold | pubs, late cafés, record shops, music clubs, community halls with evening events |

Choose by the trade's own colours first (its real awning, van or sign), then by time of day: daytime food → pillarbox; clean service → enamel; evening trade → lamplight.

**A fourth colourway from a client's colours:** copy one `[data-colourway]` block in pack.css, rename it, and set every property: `--ground --text --muted --line --band --band-text --accent --accent-text --panel --panel-text --panel-muted --ink --ink-text --sold --go --err-ground --sign --sign-shade --stripe-a --stripe-b --field --field-text`. These pairs must reach 4.5:1: text, muted, accent, err-ground and sign on ground; band-text on band; accent-text on accent; panel-text, panel-muted, ink and sold on panel; ink-text on ink; field-text and sold on field. Neither stripe may equal `--band` (the awning hangs over the band). `--sign-shade` is a darker (or, on light grounds, paler) tint of the ground.

## The main attraction: choosing a first screen

| First screen | Right when | Make it the client's own |
|---|---|---|
| `first-sign` (signature) | The name is the draw: a known local shop, regulars, a name with character. Default choice. | Real name, real hours in `data-hours`, a flourish line with the street and year, a stamp with a true fact ("Baked at 4am", "Cut since 1979", "Fixed while you wait"). |
| `first-board` | The prices and the daily list are why people come: cafés, delis, chippies, market stalls. | The client's real items and prices, today's specials marked, one real sold-out. 4 to 10 items. |
| `first-front` | The building or one object is the picture: a shopfront people recognise, a stall, a van, a single product. **When the subject has an obvious picture, this wins.** | Fascia word = the trade (BAKERY, BARBER, RECORDS); swap window parts for the client's products (`sf-cup`, `sf-scissors`, `sf-record`, `sf-book`, `sf-wrench`); or replace the drawing with one big product part. |

Whichever is used carries the page's only `h1` (the catalogue shows two of them as `h2`).

## Patterns

| Pattern | Use it for | The builder supplies | Limits |
|---|---|---|---|
| header | name, anchors, open chip | name, links, hours | 3–6 links, 1–2 words each |
| first-sign | the shop sign | name, flourish, hours, lede, 2 buttons, stamp | name ≤4 words; add `sign__name--long` for a 10–13 letter word, `--xlong` for 14–16 |
| first-board | the board as hero | name, lede, 4–10 items, board title/date/foot | item name ≤6 words |
| first-front | drawn shopfront on the band | heading, lede, fascia word, window parts | heading ≤8 words; fascia ≤9 capitals |
| board | full price list, with view switch | 2–5 views, 1–3 groups each, 2–12 items per group | view labels 1–2 words |
| band | one statement on the band colour | statement, attribution | 6–16 words; once per page |
| steps | a process in order | 3–6 steps: time/label, title, 1–3 sentences | title ≤4 words |
| spec-tag | one product's specification | name, price, 3–8 facts, text, tags, button | fact value ≤12 words |
| story | text beside a picture | 4:3 picture, caption, heading, 40–120 words, signature, optional stamp | heading ≤8 words |
| figures | a row of real numbers | 2–5 figures, label, optional detail | figure ≤6 characters |
| schedule | hours sign + dated list | 7 day rows (`data-day`), 2–8 dates | date title ≤6 words |
| people | who's behind the counter | 2–9: portrait, name, role, ask-about | name ≤3 words |
| preorder | pick items, quantities, pickup time | 2–12 items with prices, pickup times, email | item ≤6 words |
| faq | questions | heading, bubble line + phone, 3–10 questions | question ≤12 words |
| request | an enquiry form (cakes, bookings, repairs) | intro, product part, fields, mailto | ≤9 fields |
| visit | getting there | map labels, address, 2–5 ways, map link | address ≤4 lines |
| footer | name, address, hours, links | as header plus address | 2–5 links |
| not-found | 404 page | heading, sentence, home button | heading ≤8 words |

## Elements

| Element | Classes |
|---|---|
| Buttons | `btn`, `btn btn--secondary`, `btn--big` (first screens), `link` (quiet, with arrow) |
| Fields | `field` > label, control, `hint`, `error`; `field is-error`; `check` for checkbox and radio; `form form--two` grid |
| Marks | `status`, `status--closed`, `status--sold`; `tag` in `tags`; `mark mark--special`, `mark mark--sold` inside item names |
| Notices | `notice` (information), `notice notice--warn` |
| Table and views | `table` in `table-wrap`, `num` cells; `views` + `views__switch` + `views__panel` |
| Disclosure | `details.disclose` > `summary` + `disclose__body` |
| Stepper | `stepper[data-stepper]` with −1 button, labelled number input, +1 button |
| Picture slot | `pic` (4:3), `pic--square`, `pic--tall`, `pic--wide`, `pic--round`; `pic__standin` label |
| Devices | `awning` (stripe), `flourish` (ruled line), `hang` (strings and nail), `stamp` SVG, `lamp` |
| Drawing parts | sprite symbols `sf-loaf sf-croissant sf-cup sf-cake sf-scissors sf-record sf-book sf-wrench sf-person sf-bus sf-bike sf-door`; wrap in `.part` on a plain ground |

## Composition

- Order: header → one first screen → board or spec-tag → band → steps or story → figures → schedule → people → preorder or request → faq → visit → footer. Leave out what the client lacks; never invent sections to fill.
- Grounds: the page ground, the band (at most twice, never adjacent, never next to first-front), and the panel inside boards, tags, tickets and forms. Sections use `sec on-ground` unless they are the band.
- The board appears once as a hero or once as a section, not both. One stamp per screen at most. Forms always sit on the panel.
- Never put two two-column patterns (story, spec-tag, faq, request, visit) next to each other without a full-width one (board, band, steps, figures, people) between, where the content allows.
- The awning goes at the top of the header and of the band, and the thin one above the footer. Nowhere else.

## Behaviours (pack.js)

1. **Open-now sign.** `data-open-sign` (full plate) or `data-open-sign="short"` (chip), with `data-hours="mon closed; tue-fri 07:00-15:00; sat 07:00-14:00, 15:00-17:00; sun 08:00-13:00"` and `data-tz="Europe/London"`. Ranges wrap (`fri-mon`), times past midnight work (`fri 18:00-01:00`). Later signs may omit `data-hours` and `data-tz`; they reuse the first. Inside: `data-open-state` gets Open/Closed (change with `data-open-label`, `data-closed-label`), `data-open-detail` gets today's hours and the next change. `data-clock="24"` for 24-hour times. Write the week's hours as the fallback text. Any `data-hours-table` marks the row whose `data-day` (or list `data-day="tue,wed,thu,fri"`) is today.
2. **View switch.** `<div class="views" data-views>` with a `views__switch` (keep `hidden`; the script shows it) of `<button data-view-btn="id">` and panels `data-view="id"`. `data-views="today"` opens the button whose `data-view-days="sat"` lists today; `data-views="id"` opens that one. Without JavaScript all panels show in turn.
3. **Pre-order.** `<form data-order data-order-email="..." data-currency="£" action="mailto:..." method="post" enctype="text/plain">`. Each item input: `type="number" name="Item name" data-price="4.80" min="0" max="12" autocomplete="off"` inside `span.stepper[data-stepper]` with buttons `data-step="-1"` and `data-step="1"`. `data-order-summary` and `data-order-total` are `output`s. Sending opens the visitor's email with the list, pickup and contact; say so under the button.

Motion: only the lamp's slow glow, and only when the visitor allows motion.

## Voice

Say it the way the person behind the counter would: short, concrete, a bit dry. Name the thing, the time and the price. Headings are plain statements, sentence case, no puns, no exclamation marks, never a single-word label like "About". Body copy is first person plural, present tense, 1–3 short sentences per block.

- Bakery: "If it's on the board, it was flour this morning."
- Barber: "Walk in before four, out by half past."
- Record shop: "New in on Fridays, the bargain bin on Sundays."

## Rules for the builder

1. Copy markup from catalogue.html; change text, never class names or structure. No new CSS, no inline colours.
2. One `h1` (in the first screen); then `h2` per section, `h3` inside. Never skip a level.
3. Use only the client's real hours, prices and numbers. Leave out figures you don't have.
4. Every picture that isn't the client's own keeps `<span class="pic__standin">Stand-in photo</span>`.
5. Every link has a real target: an anchor on the page, `tel:`, `mailto:` or a full URL. Never `#`.
6. Required fields say "(required)" in the label; name, email and phone fields keep `autocomplete`.
7. Forms post to `mailto:` and the hint says it opens the visitor's email program.
8. Meaningful drawings keep `role="img"` and an `aria-label`; decorative ones get `aria-hidden="true"`.
9. Respect the word limits in the tables; when a heading's longest word is long, use the `--long` size step, never `hyphens`.
