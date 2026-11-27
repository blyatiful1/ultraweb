# Fieldbook

**Character.** A site set like a surveyor's field book or a workshop drawing. Archivo Narrow headlines, tall and tight; Archivo for reading; IBM Plex Mono for every figure. Hard 1–2px rules, no rounded corners, no shadows. A left margin column carries each section's **bubble** (a split circle: sheet number over sheet count). The signature device is the **dimension line** (`.fb-dim`): a rule with slashed end ticks carrying a real figure ("6 courses · £55–£1,180", "400 m · 6 min walk"). It sits under every section heading, inside the type hero, under the band statement and the 404. The rhythm is measured: big type, a measured line, then the facts.
**Suits:** makers, trades, workshops, inns, boatyards, bike shops, bakeries, studios, clubs, guides: anyone with dimensions, times, prices or a place on a map. **Does not suit:** soft wellness, luxury fashion, children's parties, anything that sells mood without figures.

## Colourways
Set on `<html data-colourway="…">`. All text pairs reach 4.5:1.

| Name | Ground / text | Band | Accent | Choose for |
|---|---|---|---|---|
| `paper` (light, default) | grey-green paper / ink | navy | cobalt | workshops, trades, studios, anything daytime |
| `blueprint` (dark) | deep navy / white | pale paper | apricot | evenings, music, bars, inns, night trades, engineering |
| `survey` (strong) | survey yellow / black | black | brick red | outdoor, building, cycling, markets, loud one-person trades |

Pick by the subject's working light: indoor craft = paper; night or water = blueprint; site, road or field = survey.
**A fourth colourway** from the client's colours: add `[data-colourway="name"] { … }` setting all eight properties: `--ground --text --muted --band --band-text --accent --on-accent --line`. Check that these pairs reach 4.5:1: text/ground, muted/ground, accent/ground, band-text/band, on-accent/accent. `--line` needs 3:1 on ground (it draws field borders). Accent is never text on the band (`.fb-on-band` swaps it to band-text automatically). Put the client's strongest colour in `--accent` or `--ground`, never both.

## Catalogue (`catalogue.html` shows each once)

| Pattern | Use it for | The builder supplies | Limits |
|---|---|---|---|
| header | name, descriptor, nav | name, descriptor, links to section ids | 3–6 links, 1–2 words each; last = main action |
| first-screen-drawing (a) | a made thing, building, machine, place | title, lede, 1–2 actions, legend rows, SVG drawing with numbered callouts | title ≤ 9 words; legend 3–5 |
| first-screen-timetable (b) | classes, sailings, menus, fixtures | title, lede, rows with `data-when` ISO date-time | 3–8 rows in date order; price ≤ 7 chars |
| first-screen-type (c) | services, promises, no single object | 3 title lines, 2 dims, lede, actions, 2–4 facts | 9 words in all; dims ≤ 22 chars |
| index | what is sold, each with a figure | name, price/figure, description, 1–3 meta | 3–9 items; `fb-index--two` for 7–9 |
| text-figure | one technique, detail, room, ingredient | h2, dim, 1–3 paragraphs, 2–4 notes, SVG on graph paper | 40–140 words; `--flip` alternates sides |
| spec | facts of one product or room, as a title block | label + short value, optional `<small>` | 4–12 cells; `fb-spec__wide` for long values |
| steps | a process in order | time figure, h3, text per step | 3–7 steps |
| band | one statement the client stands behind | statement, dim figure, attribution | one per page; ≤ 24 words |
| readings | true numbers, drawn to scale | value, unit, label, note, `--v` 0–1 | 2–4; only checkable figures |
| calendar | a month of dates, events, closures | month grid, marks, key, agenda | one month; 2–8 agenda items |
| people | who a visitor meets | initials, name, role, text, 1–3 record rows | 1–6 people |
| questions | real pre-booking questions | question + answer (`details`) | 3–9 |
| request-form | booking, quote, callback | `mailto:` address, 3–8 fields | required = "(required)" in label |
| getting-there | address, map, hours | SVG map, address, ways, hours JSON + table | 2–4 ways; ≤ 6 map labels |
| footer | title block | name, 2–4 blocks, base line | 3–5 blocks |
| 404 | `404.html` | heading (h1 there), one sentence, 1–2 links | heading 3–8 words |

## Composition
- Order: header → one first screen → index → text-figure or spec → steps → **band** → readings → calendar → people → questions → request-form → getting-there → footer. Drop what the client lacks; keep the order.
- Two grounds only: the colourway ground, and the band once. Never two bands.
- The band sits in the middle third, after a section that ends in figures (steps, spec, index), never first or last.
- Never neighbours: spec + readings; index + calendar; two text-figures on the same side; two sections whose heads both open with a bubble and no figure between. Readings may follow the band directly as its proof.
- Bubbles number the sections that have a head, `01` to the count, in page order. Band and readings carry none.
- Every dimension line carries a real figure from the client, at most 24 characters. Never decoration text.

## The main attraction
- (a) **Drawing** when the client makes or keeps one thing a visitor can picture: a stool, a boat, a loaf, a room, a bike. Draw its elevation or plan in `class="fb-svg"` (strokes use `currentColor`; `.acc` for the accent; `.fill` for the tinted surface), add 2–3 real dimension lines and 3–5 numbered callouts that match the legend.
- (b) **Timetable** when visitors come for a when: classes, crossings, tastings, matches. Use the client's real next dates and prices; pack.js strikes past rows and names the next.
- (c) **Type** when the offer is a promise or a service. Split a 6–9 word claim into 3 lines; the two dims measure it with the client's own numbers.
- When the subject has an obvious picture (a building, an object, a place), the drawing wins over the timetable or type alone, even when visitors also come for a when: put the dates in the calendar section.
- Make it specific: the drawing is the client's actual object with its actual sizes; the table is this month; the type quotes their tolerance, year or distance. Never a generic icon.

## Voice
Plain, exact, first person plural. Headings state a fact or a promise in 3–8 words, no puns, no exclamation marks. Body copy gives numbers instead of adjectives ("six benches", not "intimate classes") and short sentences. Figures in numerals.
- Joinery school: "Build a stool that outlives you"
- Ferry inn: "Last boat back at 22:40"
- Bicycle mechanic: "Most repairs done by 5 the same day"

## Rules for the builder
1. Link `pack.css` and `pack.js` (defer), keep `lang="en"`, a `<title>` and a meta description. Copy the skip link and `<main id="main">`.
2. Copy pattern markup from `catalogue.html` exactly; change only text, figures, SVG and the slots named in its `PATTERN:` comment.
3. Exactly one `h1`: the first screen's title. Section titles are `h2`, items `h3`. Delete the catalogue notice and grey `fb-cat-label` lines.
4. No photographs and no stock icons: draw with inline SVG using `fb-svg` classes, `role="img"` and an `aria-label` that says what it shows.
5. Never add colours, fonts, shadows, rounded corners or animations. Change colour only through a colourway.
6. Never `href="#"`. Forms without a backend keep `mailto:` and the note that sending opens the mail program.
7. Respect every limit in the catalogue table; if content is longer, cut it, do not shrink type.
8. Check at 375, 768 and 1440px: nothing overlaps or runs off the screen.
