# Nocturne

The page is a place at one hour of the day. It opens on a drawn landscape in layers (sky, far, middle, near), lit by one moon or sun that everything agrees with: the glow sits round it, the lit sides of the buildings face it, the windows burn with lamplight. Below that, every ground is a sky tone. Wavy horizon lines divide the sections, and the band, the footer and the 404 page repeat the skyline. Headings are set in Gloock, a warm display serif; reading text is Hanken Grotesk. Times and figures are set big in the serif. Buttons are arched like a lit doorway, and every status mark is a moon phase. **Suits** places and experiences, especially after dark or outdoors: observatories, venues, inns and small hotels, tours, festivals, evening restaurants, and the launch of a book or game. **Not for** price-list trades, software, or shops that sell from a catalogue.

Files: `pack.css`, `pack.js`, `fonts/`, `img/` (stand-in photo). Copy the sprite (`<svg class="nc-sprite">`) and the patterns you use from `catalogue.html`. Each one has a `PATTERN:` or `ELEMENT:` comment above it.

## Colourways (`<html data-colourway="…">`)

| id | Hour | Ground / accent | Light source | Choose for |
|---|---|---|---|---|
| `night` (default) | Moonlit night | deep blue / lamplight gold | `nc-sk-moon` | observatories, venues, night tours, bars, launches |
| `dusk` | Last sun, first lamps | plum / ember coral | `nc-sk-sun` low, behind the far layer | inns, restaurants, festivals, sunset trips |
| `day` | Daylight | pale sky / sunlit ochre, sea-blue band | `nc-sk-sun` high, with clouds | daytime tours, gardens, coastal walks, family events |

Choose the hour when the client is at its best. If people come after dark, use night. If the draw is dinner or the evening, use dusk. Use day only when the experience happens in daylight. In dusk and day, swap the moon for `nc-sk-sun` and drop the stars group (day hides stars anyway).

**A fourth colourway from a client's colours:** copy the `[data-colourway="day"]` block in `pack.css` and give it a new id. Set the following.
- Page: `--ground --raise --field --text --muted --line --edge --band --band-text --accent --on-accent --focus`
- Sky: `--sky-top --sky-mid --sky-low --sky-text`
- Layers: `--far --mid --near --cloud --rim --lamp --moon --glow --star --star-op`
- Status and footer: `--ok --warn --off --foot --foot-text --foot-muted`

These pairs must each reach 4.5:1:
- text, muted, accent, ok, warn and off on both ground and raise
- text on field
- band-text on band
- on-accent on accent
- sky-text on sky-top, sky-mid and sky-low
- foot-text and foot-muted on foot

`--edge` needs 3:1 against ground and field. For a seamless join, set `--near` equal to `--ground` on dark colourways. Layers run lightest to darkest from far to near.

## Patterns

| Pattern | Use it for | The builder supplies | Limits |
|---|---|---|---|
| Header `nc-head` | brand and navigation | name, links to section ids, booking button last | 3–5 links of 1–2 words |
| **fs-scene** `nc-scene` | the place itself (signature) | h1, lede, tonight line, buttons, scene layers | h1 2–8 words; lede 15–40 words; subjects and light at x 700–1600 |
| fs-tonight `nc-tn` | the date is the news | h1, tonight attributes, next dates, buttons, quiet ground strip | 3–6 dates; time is 5 characters |
| fs-sky `nc-sky` | a name or phrase is the draw | title, sub-line, 2–4 meta figures, buttons, rising light strip | title 1–5 words; add `nc-h-long` for words over 11 letters |
| Index `nc-index` | offerings with a figure each | figure and unit, h3, 1–2 sentences, price, tags | 3–9 items; figure 1–5 characters |
| Split `nc-split` | text beside a picture | picture slot (arch suits buildings), h2, text, tick list | 1–3 paragraphs; `--flip` swaps sides |
| Steps `nc-steps` | how a visit runs | h3 with a time, 1–2 sentences | 3–9 steps; the moon waxes on its own |
| Band `nc-band` | one statement the client stands behind | 8–28 words, attribution, horizon in `nc-l-ground` | once per page |
| Figures `nc-figs` | real numbers that prove the place | number, unit, label | 3–6; real figures only |
| Spec `nc-spec` | facts of a room, boat, instrument | porthole drawing (400×400 kit scene) or square photo, term and value pairs | 4–10 rows; values up to 12 words |
| Nights `nc-nights` in `nc-views` | dated nights, shows, sailings | views, nights with `data-nc-date`, status marks | 2–5 views; 3–24 nights |
| People `nc-people` | guides, hosts, crew | square photo or initials, name, role, sentence | 2–9 |
| Questions `nc-faq` | what people ask | h2, lede, side drawing, `details` items | 3–12 questions |
| Ticket `nc-ticket` | booking request form | stub (date, lines, status, drawing), fields, mailto action | 3–9 fields |
| Getting there `nc-way` | the last mile after dark | 600×420 map with no text, caption key, address, 2–5 routes | map has role=img and aria-label |
| Footer `nc-foot` | every page | horizon, name, address, hours, links | 2–4 columns |
| 404 `nc-lost` | not found | h1, sentence, links, fog strip with a lone subject | h1 2–9 words |

| Element | Class |
|---|---|
| Buttons | `nc-btn nc-btn--primary`, `nc-btn--secondary`, `nc-quiet` (disabled: `disabled` or `aria-disabled="true"`) |
| Fields | `nc-field` > label, `nc-input`, `nc-hint`, `nc-error`; error: `is-error` and `aria-invalid`; selects inside `nc-select` |
| Choices | `fieldset.nc-choices` > `label.nc-check` > input |
| Status, tag, notice | `nc-status[data-state=on/open/available/pending/few/off/closed/soldout/next]`, `nc-tag`, `nc-note`, `nc-note--warn` |
| Table and views | `nc-table-wrap` > `table.nc-table` (`is-fig` cells); `nc-views` > `fieldset.nc-switch` and `div.nc-view` per option |
| Disclosure, stepper, picture | `details.nc-q`; `nc-stepper[data-nc-stepper]`; `figure.nc-pic` (`--arch`, `--wide`, `--square`) and `nc-standin` |

## Composition

- Order: header, one first screen, an index or split, steps or spec, band, figures, nights, people, questions, ticket, getting there, footer. Drop sections you lack content for, but keep the ticket near the end and getting there last.
- Grounds: sky (first screen and 404), ground (most sections) and band (once). Never put two bands on one page. The band never sits next to a first screen or the footer. Put it near the middle.
- Never neighbours: index and nights (both lists), split and spec (both picture-and-text), two sections that each carry a drawing. Put `<span class="nc-ridge">` (inside `.nc-wrap`, `aria-hidden`) between two plain ground sections at most twice per page.
- Use one subject per scene, with at most one second subject. Use one light source per page; the band moon repeats it.

## The main attraction: choose the first screen

- **fs-scene** is the default. Use it whenever the subject has an obvious picture: a building, a place, a boat, a tent. It beats type or a table. Make it specific to the client:
  - Pick the horizon that is true to the place: `nc-hz-sea` for a coast, `nc-hz-roofs` for a town, `nc-hz-trees` for forest, `nc-hz-hills` or `nc-hz-ridge` for upland.
  - Pick the subject that is the client: dome (observatory), house (inn, restaurant), tower (lighthouse, castle, church), tent (festival, circus), boat (trips, a harbour bar).
  - Place the light on the side the subject faces. The subjects' lit side faces right; to mirror one, use `transform="scale(-1 1)"` with a negative x. Use the same centre for the glow and the moon or sun.
  - Over sea, add `nc-sk-glint` directly under the light (same centre x, top at the sea line).
  - Write an aria-label that names the real place.
- **fs-tonight** suits a client whose next date is the reason to visit: a show tonight, a sailing, an opening, a launch countdown. Use it only if `data-dates` is real and kept up to date.
- **fs-sky** suits a client whose picture is abstract (a book, a game, a festival brand) and whose name or phrase sells it. Keep a rising sun or moon in the ground strip.

## Behaviours (`pack.js`, defer-loaded)

1. **Stars**: `<g class="nc-stars" data-nc-stars="150" data-seed="11" data-area="0 0 1600 600"></g>` goes first inside a scene svg. `data-nc-stars` is the count (up to 400), `data-seed` sets the pattern, `data-area` is x y w h in svg units, kept above the horizon. A few stars twinkle unless reduced motion is set. Without JS, a CSS star field still shows.
2. **Tonight**: put these attributes on any element:
   - `data-nc-tonight`
   - `data-dates="2026-12-04 2026-12-05T20:00"` (times after T override the default)
   - `data-time="21:30"`, `data-decide="16:00"` (optional), `data-ends="23:30"`
   - `data-off="2026-12-05"` (called-off dates)
   - `data-tz="Europe/London"`

   Children marked `data-nc-t` are filled in: `line`, `day` (Tonight or a weekday), `date`, `time`, `decide`, `next`, `state` (status words), and `mark` (sets `data-state`). Several keys can share one element, e.g. `data-nc-t="mark state"`. The element gets a `data-state` of `on`, `pending`, `off`, `next` or `none`. Override the wording with `data-say-on|pending|off|next` (tokens `{time} {decide} {date} {next}`) and `data-word-on|…`. Every `[data-nc-date]` on the page gets `is-past` (hidden), `is-tonight`, `is-next` or `is-off`. Always write sensible fallback text inside each slot.
3. **Stepper**: `<div class="nc-stepper" data-nc-stepper>` holds a button with `data-step="-1" hidden`, an `input type=number` with min and max, and a button with `data-step="1" hidden`. Each button has an aria-label.

The view switch needs no script: radios plus CSS `:has()`.

## Voice

Write as the person who keeps the lamps lit: plain, warm, exact. Give times as 21:30, distances in units, honest weather. Headings are short statements of what you will feel or find, never slogans or questions; sentence case, no exclamation marks. Body copy says what happens, when, and what to bring. Samples:
- Observatory: "The dark is the main attraction"
- Harbour inn: "Six rooms, one lamp left on"
- Folk festival: "Three nights in a field above the river"

## Rules for the builder

1. Copy markup from `catalogue.html` exactly. Change the words and the scene layers, never the class structure.
2. Use one h1 per page, in the first screen. Never skip a heading level.
3. Every scene svg carries `role="img"` and an `aria-label` describing the real place. Decorative strips are `aria-hidden="true"`.
4. Never add `hyphens` to headings. If a word is over 11 letters at h1 size, add `nc-h-long`.
5. Use only real figures, dates and times. Mark every photo that is not the client's own with `<span class="nc-standin">Stand-in photo</span>`.
6. Forms keep `(required)` in the label text, `autocomplete` on name, email and tel, and a mailto action with the notice, unless a real endpoint exists.
7. No `#` links: point to section ids or real pages.
8. Set colours only through the colourway properties. Never hard-code a hex in a page.
9. Delete unused symbols from the sprite, but never hide the sprite with `display:none`.
