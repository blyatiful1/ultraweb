# Authoring a design pack

This is the instruction given to the model that authors a pack. Use the most capable model available: the pack is paid for once and reused, and every site built from it inherits its faults.

Give the author this file and a character brief. The brief fixes what must differ from the other packs:

- the id and a working name
- the direction, in two or three sentences
- the clients it is for, and the clients it is not for
- the type classes, with a shortlist of families that no other pack uses
- what the three colourways are
- the signature element, and the three first screens
- the sibling packs with their type families, so the new pack is never mistaken for one of them

After the author finishes, run `node <plugin>/scripts/packs.mjs check <name>`, run the gates on the catalogue yourself, look at it at 1440 and 375px, and build one real site from the pack with a small model before shipping it.

In the text below, `<plugin>` is the plugin's install directory.

---

## The instruction

You are designing a design pack: a complete, reusable look for one-page websites. Later, a smaller and cheaper model builds many different sites from it, one per client, without you. It follows instructions and copies patterns exactly, and it has no visual judgment. So every visual decision is yours, and each one must be on disk as working code. Whatever you leave vague comes back generic.

You do not know the clients. Your character brief says what kind of client the pack is for.

The bar: a site built from this pack is compared, blind, with one that a strong model designed from scratch for the same client, and it should be preferred. A neutral template loses that comparison. The pack needs a character of its own and still has to adapt to the client.

Read no other instruction file. Work economically: plan the whole pack before you write, write each file in one piece, and keep checking to three rounds at most.

## What you deliver, in the project folder

1. `pack/pack.json`: the manifest
2. `pack/PACK.md`, 120 lines at most: the guide the builder reads
3. `pack/pack.css`, 48 KB at most: the complete stylesheet
4. `pack/catalogue.html`, 55 KB at most: every pattern and every element, once
5. `pack/pack.js`, 6 KB at most, if the pack needs it
6. the fonts, self-hosted in `pack/fonts/`

## 1. The character

Your character brief fixes the direction, the clients, the type classes and the signature element. Inside it, every decision is yours: proportions, rhythm, the exact faces, the devices that recur.

- A sibling pack must never be mistaken for yours. The brief lists the siblings and the type families that are taken.
- Do not use these families at all; they are everywhere: Inter, Geist, Space Grotesk, Fraunces, Instrument Serif, Playfair Display, DM Sans, Manrope, Poppins.
- These looks are habits. Do not build on one unless your brief asks for it: a cream ground with a serif and a terracotta accent; a near-black ground with one acid accent; rows of identical rounded cards with soft shadows; a small all-caps label above every heading; one headline word in italics or another colour; every section fading up on scroll.
- Colour is a parameter. Ship three colourways. Each sets the same custom properties (ground, text, muted text, band ground, band text, accent, line) and keeps every text pair at 4.5:1. A colourway is switched with `data-colourway` on `<html>`. Document how to add a fourth from a client's own colours: which properties to set and which pairs must reach 4.5:1.
- Display type never hyphenates. Do not set `hyphens: auto` on headings; a long word wraps whole or the heading's size steps down.

## 2. Elements

The pack designates its own interface elements, and the catalogue shows each one in its states (default, focus, disabled, and error where it applies):

- buttons: primary, secondary and a quiet text link
- form controls: text, email, telephone, date, select, textarea, checkbox and radio, each with its label, a hint and an error message
- a status mark (open or closed, available or sold out), a tag, and a notice in two tones (information and warning)
- a table with figures, and a way to switch between a few views (days, categories)
- a disclosure built on `details` and `summary`
- a quantity stepper, if the pack's clients sell things
- a picture slot that takes either a photograph or a drawing, with its caption, fixed proportions, and a visible "Stand-in photo" label style for pictures that are not the client's own

## 3. The patterns

- Three first screens, each a different way to carry a client's main attraction. Your brief names the signature one. Each names its slots in comments.
- At least ten section patterns that between them cover: an index of offerings with figures; a specification list; steps in order; text beside a picture; a full-width band statement; a row of real numbers; a schedule or calendar; people; questions; a request form; a getting-there block. Also a header with navigation, a footer and a 404 layout.
- No two patterns are the same layout with different content. Each has something to look at that is not a paragraph.
- Each pattern holds up under what a builder puts in it: a short heading and a long one, three items and nine, long words, large figures. Nothing overlaps and nothing overflows at 375, 768 or 1440px. The automatic checks fail text that runs into other text.
- Drawings are inline SVG that uses `currentColor` and the pack's custom properties, so they take the colourway. Where your brief asks for ready-made drawing parts, ship them as SVG `<symbol>`s the builder places with `<use>`.

## 4. Behaviour: `pack/pack.js`

At most three small behaviours, each driven by data attributes that the builder fills in, so that live figures work without the builder writing any script. Typical ones: a status worked out from opening hours; the next date picked from a list of dates; a switch between views. Every behaviour shows sensible content without JavaScript and respects `prefers-reduced-motion`. No libraries and no network requests.

## 5. `pack/catalogue.html`

- Every pattern once, in a plausible page order, then an Elements section, all filled with realistic sample content for one invented client of the kind your brief names. The page says plainly that it is the catalogue.
- Before each pattern and each element, an HTML comment beginning `PATTERN:` or `ELEMENT:` gives its name, what it is for, what the builder must supply, and its limits (words in a heading, fewest and most items).
- It links `pack.css`, `pack.js` and the fonts by relative paths, with nothing loaded from another server.
- It is also the proof: it must pass the checks in section 8.

## 6. `pack/PACK.md`

- The character in one paragraph; which clients this pack suits and which it does not.
- The colourways as a table, and how to choose one from a client's subject.
- The patterns as a table: `| Pattern | Use it for | The builder supplies | Limits |`. The elements as a shorter table.
- Composition rules: the order of sections, which patterns may not be neighbours, how many grounds, where the band goes.
- The main attraction: how to choose among the three first screens, and how to make the chosen one specific to the client. Say when each is the right choice. When the subject has an obvious picture (a building, an object, a place), the first screen that shows it wins over a table or type alone.
- The behaviours in `pack.js`: each data attribute and an example.
- Voice: how headings and body copy are written in this pack, with three sample headings from three different clients.
- Rules for the builder, six to ten lines.

## 7. `pack/pack.json`

```json
{
  "name": "lowercase-id",
  "title": "Display Name",
  "character": "One sentence a builder can choose by.",
  "suits": ["kinds of client"],
  "notFor": ["kinds of client"],
  "colourways": ["three ids, the default first"],
  "firstScreens": ["three ids"],
  "signature": "The element only this pack has.",
  "fonts": ["families used"]
}
```

## 8. The floor, and checking your work

The automatic checks fail each of these: no visible focus ring on a control; a link or button under 44px tall on a phone; body copy under 16px; text under 4.5:1 against its ground; anything wider than the screen at 375px; text running into other text; more than one `h1` or a skipped heading level; a missing `lang`, `<title>` or meta description; no skip link; a form field without a `<label>`, or a required field that does not say "required" in its label text; no `autocomplete` on name, email and phone fields; an SVG that carries meaning without `role="img"` and an `aria-label`; a `#` link; motion that ignores `prefers-reduced-motion`. A form with no backend opens the visitor's mail program or says plainly that sending is not connected yet.

Fonts: `node <plugin>/scripts/fonts.mjs get "<Family>" --weights 400,700 --out pack/fonts` saves the files and prints the `@font-face` rules to paste.

Serve the pack folder (`python3 -m http.server <port> -d pack`, in the background) and run the checks on the catalogue:

```bash
node <plugin>/scripts/gates.mjs --url http://localhost:<port> --routes /catalogue.html --project . --only a11y,responsive
```

Fix what fails. Then look at the page yourself at full size, one screen at a time, at 1440 and at 375px wide: take screenshots of each screen with Playwright and open them. A scaled-down picture of the whole page hides exactly the faults that matter. Look at the other two colourways on the first screen and on one band. Fix what you see.
