# sketch

The whole path for a one-page static site, in one file.

Load when: the tier is sketch and the site is built in `site/`. It replaces the Phase 3 to 6 reading list.
Reads: design/BRIEF.md, design/DIRECTION.md, `<plugin>/kit/README.md`. Writes: design/SYSTEM.md, design/SITEMAP.md, `site/`.

## Where the effort goes

The page is the work. The artifacts below are short; write each in a few minutes and spend the rest on what a visitor sees. Read another reference only when a line here names it for a need this page really has: `legal-dach.md` for a German, Austrian or Swiss site, `commerce.md` for things sold on the page, `showpiece.md` for a commissioned 3D scene, `motion.md` for motion the kit does not cover.

## 1. Words first: design/SITEMAP.md

List the routes (the page, a 404, legal pages where the market needs them), then the sections in order with one idea each, then every heading, paragraph and button label. The phase checker reads two tables, so use exactly these headings and columns:

```md
## Routes
| Route | Purpose | Goal | Nav |
|---|---|---|---|
| / | the whole offer on one page | pre-order | yes |
| /404.html | not found | back to / | no |

## Copy deck
| Slot | Limit | Text |
|---|---|---|
| /.hero.h1 | 8 words | … |
```

- A one-page site usually needs six to nine sections. Each one holds something a visitor came for: what is offered, prices, hours, steps, specifications, people, where and how.
- Use the facts in the brief. Where a fact is missing, draft a realistic one and mark it as `references/brief.md` says. A page with real-looking detail can be judged; a thin one cannot.
- Headings name the thing. Buttons are a verb and an object. A heading that would fit a competitor's site is rewritten.
- One line on the voice: who is speaking, to whom, how formal.

## 2. System: design/SYSTEM.md and `site/styles.css`

About fifteen lines: the palette command you ran, the type families and why, the sizes, the spacing step, the radius, the grounds.

- Colour: `node <plugin>/scripts/palette.mjs --ground … --hue … --format css --out site/styles.css` with the ground and hues from DIRECTION.md. Run it first: `--out` replaces the whole file, so everything else is added below its output afterwards with the Edit tool. Never work out contrast by hand.
- Type: one family, or two that clearly differ, chosen from the subject's own world. Self-host the woff2 files in `site/fonts/` (for a Google Fonts family, take the URLs from its CSS; a variable family is one file declared once with a weight range). Body copy 17 to 19px on desktop and never under 16px; the largest size comes from the direction and is usually much larger than feels safe.
- Add the type tokens the kit reads (`--font-display`, `--font-sans`, `--text-hero`, `--text-h1`, `--text-h2`, `--text-h3`, `--text-lead`) and `--space-section` below the palette in `styles.css`.
- Grounds: plan at least two across the page, the page ground plus one contrasting band or colour block, unless the direction argues for one ground throughout.

## 3. Pictures

A page with nothing to look at loses to one that shows the thing. Decide what this page shows before building.

| Site kind | What to show |
|---|---|
| place, shop, food, hotel | photographs: the client's own; otherwise stand-ins |
| studio, portfolio | the work itself: the client's images; otherwise stand-ins that carry a visible "Stand-in photo" label, plus plans or diagrams drawn in SVG |
| launch, game | a drawn scene filling the first screen, or an asset-free kit moment as the world |
| product | the real interface built in HTML and CSS, large and legible |
| editorial, report | graphics made from the real numbers, and photographs for the stories |

Pictures are a decision, not a requirement. A type-led page is right when the direction says so and the type is large enough to be the picture.

**Stand-in photographs.** When the client has none:

```bash
node <plugin>/scripts/photos.mjs search "rye sourdough loaf on a wooden board" --shape wide --thumbs design/photo-previews
node <plugin>/scripts/photos.mjs get <id> --out site/img/loaf.jpg            # add --role proof for the client's own work, people or rooms
node <plugin>/scripts/photos.mjs credits --dir site/img                       # the footer credit line
```

- Look at the previews before choosing. Pick photographs that share light and colour so they read as one set.
- Queries describe the subject only. Never put the client's name in a query.
- Every stand-in `<img>` carries `data-standin`, real `alt` text, `width` and `height`, and `loading="lazy"` below the first screen. The credit line goes in the footer.
- A stand-in never claims to be the client's. No caption such as "our bakery". A picture that stands for the client's own work, people or premises (`--role proof`) shows a small visible label, "Stand-in photo".
- Stand-ins make the build a demo: set `Deployment mode: demo` in the brief and list each one in the handoff. Ship blocks production while one remains.
- Reject a photograph that does not clearly show the named subject; two that fit beat six that do not. When the ones that fit differ in light or colour, give them one shared treatment in CSS (for example `filter: grayscale(1)` with a tint from the palette) so they read as a set.
- If the search is unavailable or out of quota (exit 3), build without photographs and say so in PROGRESS.md.

**A drawn scene.** One `<svg>` with a `viewBox`, `preserveAspectRatio="xMidYMid slice"` when it fills a screen, four depth layers (sky, far, middle, near) from light to dark or dark to light, one light source that everything agrees with, colours from the tokens, no text inside the drawing, and `aria-hidden="true"` unless it carries meaning (then `role="img"` and a `<title>`).

## 4. Build `site/`

Start from `site/kit/starter.html` as `<plugin>/kit/README.md` describes.

- First screen: meet the ambition floor in `references/direction.md` for this site kind. For a place: the name, what it is, the hours or address, and the main action, all visible on a phone.
- Rhythm: no two neighbouring sections share a layout. Use the second ground. Give one section a full-width colour block. A screen that is mostly bare ground is a section that needs content or should be shorter.
- Motion: `node <plugin>/scripts/moments.mjs pick --fits <Site kind> --max-intensity <motion level>`, at most two moments, mounted exactly as their READMEs say. Decline a pick that competes with the signature move.
- Forms tell the truth. With no backend, the form opens the visitor's mail program or says plainly that sending is not connected yet. It never shows a success message for something that did not happen.

The gates fail these, so build them right the first time:

- one `h1`; headings that do not skip a level; `lang`, `<title>` and a meta description
- a skip link first in the page; a visible focus ring on every control; no keyboard trap
- every field has a `<label>`; a required field says "required" in its label text; `autocomplete` on name, email and phone fields; an error message tied to its field with `aria-describedby`
- every link and button at least 44px tall on a phone; nothing wider than the screen at 375px
- text colours only from the palette tokens; body copy 16px or larger
- every image has `alt`, `width` and `height`; no placeholder services; no `#` links

## 5. Look at it

Run `node <plugin>/scripts/gates.mjs --url <url> --quick`, then open the screenshots it wrote (`qa/shots/home-1440-light.png` and `qa/shots/home-375.png`) and look at them. Scroll the page in the capture if you can, or capture further screens.

1. What on the first screen would a stranger describe to someone else? If nothing, the first screen is not done.
2. Is any screen mostly empty ground?
3. Is the body copy comfortable to read at arm's length?
4. Do the sections look different from one another, or is it one layout repeated?
5. On the phone, is the main action visible without scrolling?

Fix what you see and run the quick gates again. This is looking, which is always allowed. Giving the page a verdict stays with the judge and the user.

## 6. Finish

Run the full gates and the fix loop in `references/gates.md`. Add the 404, a favicon, a share image, and the legal pages the market needs. Write the handoff README in the project root. For a static site it has five parts: how to view it (`python3 -m http.server -d site`), what is in `site/`, every `data-assumed` fact the owner must confirm, every stand-in photograph with what the owner must supply, and what is not connected yet (form endpoint, domain, legal details).
