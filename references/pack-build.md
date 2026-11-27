# pack-build

Builds a one-page static site from a ready-made design pack. The design is finished; the work is choosing a pack, filling it with the client's content, and passing the gates.

Load when: the tier is sketch and the user asks for a fast or cheap build, names a pack, or the session runs on a small model. It replaces Phases 2 to 6 and `references/sketch.md`.
Reads: design/BRIEF.md or the user's request, `<plugin>/packs/`. Writes: `pack/`, design/NOTES.md, `site/`.

## 1. Choose the pack

```bash
node <plugin>/scripts/packs.mjs list
```

- Choose by the client's subject, not by taste: the pack whose "suits" names this kind of client and whose "not for" does not. Then check its character against the tone of the request.
- If the user named a pack, use it.
- If no pack suits the client, say so and build by `references/sketch.md` instead. A pack forced onto the wrong subject loses to a page designed for it.

```bash
node <plugin>/scripts/packs.mjs install <name> --into .
```

Read `pack/PACK.md` and `pack/catalogue.html` completely before you write anything. From here on you make no visual decision that `pack/PACK.md` does not offer you.

## 2. Plan: `design/NOTES.md`, 35 lines at most

- The pack you chose and the runner-up, with one reason each.
- Facts: who the client is, what is offered, who visits, the one action. Then a list of every fact you had to draft.
- The colourway, and the reason from the client's subject.
- The first screen: which of the pack's first screens, and what its main attraction shows. That is the one thing a visitor will describe to someone else, and it comes from this client's world: a drawing of their thing with its parts, their own table of times or prices, or a sentence only they could say. When the subject has an obvious picture, show it.
- Seven to nine sections chosen from the catalogue, in order, each with the content it will hold. Follow the pack's composition rules.

## 3. Build

- Copy `pack/pack.css`, `pack/pack.js` if it exists, and `pack/fonts/` into `site/` unchanged, keeping the paths the catalogue uses.
- Write `site/index.html`. For each section, copy the pattern's markup from the catalogue and replace the sample content with the client's. Keep the classes and the structure. Respect each pattern's limits.
- Add no CSS and no `style` attributes. A drawing is inline SVG that follows the pack's rule for drawings, and it shows the real thing with its real parts, labelled the way the trade labels them. A circle with two lines is an icon, not a drawing.
- Fill in the data attributes that the pack's behaviours read (opening hours, dates), as `pack/PACK.md` describes them. Write no script of your own.
- Write real detail: names, sizes, materials, prices, times, steps, conditions. No filler and no repeated sentences. Follow the pack's voice.
- A fact you had to draft carries the attribute `data-assumed` on its element (`references/brief.md`). Never draft a street address, a phone number, a registration number or a bank detail: leave them out.
- A photograph that is not the client's own is a stand-in: it carries `data-standin`, the pack's "Stand-in photo" label, and a credit (`references/imagery.md`).
- A form with no backend opens the visitor's mail program or says plainly that sending is not connected yet. It never shows a success message for something that did not happen.
- Add `site/404.html` from the pack's 404 pattern.
- Work through the sections in page order, one section per pass. After the last one, read the whole page once for voice and for repeats.

## 4. Finish

Follow `references/finish.md`, steps 1 to 9. Its one rule applies here too: change nothing a visitor would notice unless a check requires it. If a check fails on something that comes from the pack itself, fix it in `site/` with the smallest change and note it in the handoff as a fault of the pack.
