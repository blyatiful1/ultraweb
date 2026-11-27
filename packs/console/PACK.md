# Console — design pack

**Character.** The product is the picture. A Console page shows the client's own interface, built in HTML and CSS: a window with tabs and a sidebar, a diff with line numbers, a terminal with a prompt, a table of real rows, metric tiles with real figures. Everything else is quiet and exact: Sora for type with a little geometry in it, JetBrains Mono for every figure, path and command, 1px hairlines instead of cards, a faint dot canvas behind windows, numbered pins that annotate the interface. Dense, measured, honest. No gradients, no glass, no glow.

**Suits:** developer tools, APIs, SaaS products, apps, databases and data services, open-source projects, infrastructure, AI and analytics products — anything with a screen, a CLI or an API you can show. **Not for:** places, restaurants and food, crafts, shops of physical goods, events, people-first services, anything without a product interface. Use another pack for those.

**Start a page** from `catalogue.html`: copy its `<head>` (set `lang="en"`, a real `<title>` and meta description), the icon sprite `<svg>` right after `<body>`, the skip link, header, `<main id="main">` and footer. Link `pack.css` and `pack.js` (defer); copy `fonts/`. Delete the catalogue-only blocks (`.cat-note`, `.cat-div`, the Elements section).

## Colourways — set `data-colourway` on `<html>`

| id | Ground / text | Accent | Windows | Choose it when |
|---|---|---|---|---|
| `light` (default) | warm grey-white / ink | signal blue | white | almost always; docs-heavy tools, APIs, B2B SaaS |
| `dark` | graphite / pale grey | soft blue | graphite | the product itself is dark (terminals, editors, observability, security) |
| `signal` | strong ultramarine / white | yellow | white | a confident launch page, a brand with one strong colour, consumer apps |

The band is always a deep ink ground. Terminals are always dark. **A fourth colourway** from a client's colours: copy the `signal` block in `pack.css` under a new id and set `--ground --text --muted --line --hl --accent --on-accent --focus --dots --pos --neg`, the band set `--band --band-text --band-muted --band-line --band-accent --band-on-accent`, and the window set `--win --win-2 --win-text --win-muted --win-line --win-accent --win-on-accent --win-hl`. These pairs must reach 4.5:1: text, muted, accent, pos, neg on ground; text on hl; on-accent on accent; band-text, band-muted, band-accent on band; band-on-accent on band-accent; win-text, win-muted, win-accent on win, win-2 and win-hl; win-on-accent on win-accent. Leave the diff, syntax and terminal tokens as they are unless the windows go dark.

## The first screen — choose one

| id | Use it when | Make it specific |
|---|---|---|
| `window` (signature) | the client has a UI: a dashboard, an app, an editor, a console | rebuild their real screen: their nav items in `.side`, their real column names and 4–8 plausible rows in `.dt`, their URL in `.win-title`; pin the 2–4 things that sell it and explain them in `.legend`. Swap the table for `.code`, `.chat` or a chart if that is the product. |
| `quickstart` | the product is installed: a library, CLI, SDK, self-hosted tool, API | their real install command(s) and real output; views for their package managers or languages; notes that cite output line numbers. |
| `claim` | the interface is not the point yet (infrastructure, reliability, a platform) or it is pre-launch | one sharp claim (`.t-hero--xl`) and one live widget: status, uptime bars, a `data-since` day count, a live figure. |

Prefer `window` whenever there is a screen to show: the picture of the product beats a claim. On a real site the chosen first screen holds the only `h1`.

## Patterns

| Pattern | Use it for | The builder supplies | Limits |
|---|---|---|---|
| header `.site-head` | brand + navigation | name, version or stars, 3–5 section links, one CTA | labels 1–2 words |
| hero window | signature first screen | claim, lede, 2 buttons, window contents, pins + legend | claim 3–9 words; 2–4 tabs; 3–8 side items; 4–8 rows |
| hero quickstart `.qs` | install as centrepiece | commands, real output, 2–4 views, 2–4 notes | 3–10 lines per view |
| hero claim `.claim` | claim + live widget | claim, lede, status, figure, 30 bars, source line | claim 3–8 words |
| metrics `.tiles` | a row of real numbers | 3–6 tiles: label, figure + unit, delta, sparkline, source | figure ≤ 8 chars; never invented |
| index `.idx` | offerings with figures: endpoints, modules, services | 3–12 rows: kind, linked name, one line, figure + unit | line < 20 words |
| split `.split` | text beside a picture | h2, paragraph, 3–5 ticks, a window (diff, code, chat) or `.pic` | diff 6–16 lines; `--rev` flips |
| steps `.steps` | steps in order | 3–6 steps: title, ≤ 40 words, optional code | code 1–8 lines |
| band `.band` | one full-width statement | statement, one sentence, 1–3 keycaps, mono note | 4–12 words; once per page |
| benchmark `.bench` | comparative performance | 3–6 rows: name, version, `--v` %, figure; method line | real, reproducible only |
| spec `.spec` | a specification list | 2–4 groups × 3–8 label/value rows | values < 40 chars |
| integrations `.intg` | what it connects to | 6–24 cells: 1–3 letter glyph, name, category, tag | no third-party logos without rights |
| compare `.cmp` | comparison table | 2–4 columns (client first), 4–10 rows, `data-label` on each td | cell < 14 chars; be fair |
| pricing `.tiers` | tiers | 2–4 tiers: name, price, unit, sentence, 3–6 ticks, button; one `.is-pick` | stepper only in the picked tier |
| changelog `.log` | releases | 2–8 releases, 1–6 tagged entries each | Added/Fixed/Changed/Removed |
| schedule `.track-list` | release train, events, office hours | 3–6 dated items in order | `data-date` on each |
| people `.people` | maintainers, team | 3–12: initials or photo, name, handle, role, optional commit bar | role < 10 words |
| questions `.faq` | FAQ | intro + 3–10 `details.disc` | question < 14 words |
| request `.req-grid` | contact / demo form | heading, 2–4 next steps with times, form in a `.win` | mailto unless a backend exists |
| visit `.visit` | getting there | SVG map (role="img", aria-label), address, stop, hours, online links | remote-only: list regions instead |
| 404 `.nf` | not-found page | failed path in a terminal, 2–4 links | — |
| footer `.site-foot` | close | install line, 3 link columns, status, licence, version | 3–6 links per column |

## Elements

| Element | Classes | Notes |
|---|---|---|
| buttons | `.btn`, `.btn--secondary`, `.link` (`.link--arrow`) | disabled via `disabled`/`aria-disabled`; 1–4 words |
| form field | `.field` > label + `.input`/`.select`/`.textarea` + `.hint` + `.err`; `.is-error` shows the error | always inside `.win` or `.surface`; "(required)" in the label; autocomplete on name, email, tel |
| choices | `.fieldset` > `.choice` > input + span | radio and checkbox |
| status / tag / notice | `.status[data-state=up|degraded|down]`, `.tag(--add|--del|--warn|--accent)`, `.notice(--warn)` | `.status--live` pulses |
| window kit | `.win`, `.win-bar`, `.win-dots`, `.win-title`, `.win-tabs`/`.win-tab`, `.app` + `.side` + `.main`, `.toolbar`, `.win-foot` | non-interactive tabs are `<span>`; interactive ones are `<button>` in a views box |
| code / diff | `pre.code` > one `span.l` per line; `.add`, `.del`, `.hl`, `.gap`; tokens `.k .s .c .n .f` | start number: `style="counter-reset: ln 41"` starts at 42 |
| terminal | `.win.term` > `pre.shell(.shell--num)` > `span.cmd` / `.o` / `.ok` / `.er` / `.ac` | a click on `.cmd` selects the whole command |
| table | `table.dt`, `.num`, `.id`, `data-label` on every td | rows stack under 640px |
| metric tile, chart, chat, kbd | `.tile`, `svg.chart` (role="img"), `.chat .msg--user/.msg--bot`, `.kbd`, `.kbd--xl` | — |
| disclosure, stepper, pins | `details.disc`, `.stepper[data-stepper]`, `.pin` + `ol.legend` | pins sit inline, never on top of text |
| picture slot | `figure.pic(--wide|--square|--tall)` > `.pic-frame` + figcaption; `.standin` | label every picture that is not the client's own "Stand-in photo" |

## Composition

1. Order: header → first screen → metrics or index → split → steps → band → benchmark/spec/integrations/compare (pick what applies) → pricing → changelog/schedule → people → questions → request → visit → footer. 8–13 sections in all.
2. Show the product at least three times: the first screen, the split and one of steps/steps-code/index. A section with no window, table, figure or code is the exception.
3. Exactly one `.band`, placed past the middle, never next to the first screen or the footer. Two grounds only: the colourway ground and the band.
4. Never neighbours: two hairline-grid patterns (`.tiles`, `.intg`, `.tiers`); `.bench` next to `.cmp`; two `.split`s; `.changelog` next to `.schedule` (separate them with people or questions).
5. Use the dot `.canvas` only on the first screen.
6. Every `h2` is followed by its own content; levels go h1 → h2 → h3 without skipping.

## Behaviours (`pack.js`)

- **Views** — tabs that switch panels. `<div data-views="npm">` (default view) holds `<div data-view-tabs aria-label="…">` with `<button class="win-tab" data-view-tab="npm">npm</button>`, and panels `<pre class="shell" data-view="npm" data-label="npm">`. Without JS all panels show, each captioned by `data-label`.
- **Dates** — `<span data-since="2026-10-17">41</span>` becomes the number of days since that date (write today's value as fallback). `<ol class="track-list" data-next>` with `<li data-date="2026-12-09">` marks past items `.is-past` and the next `.is-next`; its `<span class="tag tag--accent when" data-countdown>` reads "Today", "Tomorrow" or "In 6 days".
- **Stepper** — `<div class="stepper" data-stepper data-price="12" data-currency="$">` with `button[data-step="-1"]`, `input type="number" min max`, `button[data-step="1"]`; a sibling `<output data-total>` shows the total. Without JS it is a plain number input.

## Voice

Write like a good changelog: concrete nouns, real numbers, present tense, no adjectives that cannot be measured. Headings are sentences that end with a full stop, 3–10 words, saying what the product does or proves — never "Revolutionise your workflow". Body copy is short: one idea per sentence, units always stated, code names in mono. Admit limits plainly.
- An API for invoices: "One endpoint per invoice. Webhooks for everything else."
- A time-series database: "Ten billion rows, queried in 40 milliseconds."
- An open-source design tool: "Every file is plain JSON in your repository."

## Rules for the builder

- Fill every window with the client's real interface vocabulary: their menu items, column names, commands, file names. Never lorem ipsum, never "Feature one".
- Every figure comes from the client and carries a source line; if you have none, leave the metrics and benchmark patterns out.
- Mono (`.mono`, `.meta`, `.fig`, code) is for figures, paths, commands, versions and dates only; sentences stay in Sora.
- Do not add colours, gradients, shadows, rounded cards or new fonts. Use the tokens.
- One `h1`. Headings never hyphenate; a word over 12 letters takes `.t-hero--long` / `.t-sec--long`.
- Links point to real sections or pages, never `#`. Forms without a backend use `mailto:` and say so beside the button.
- Decorative SVGs get `aria-hidden="true"`; meaningful ones get `role="img"` and an `aria-label` stating what they show.
- Check every page at 375, 768 and 1440px: no horizontal scroll, no text over text.
