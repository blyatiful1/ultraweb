# finish

Makes a page that is already designed pass the gates without changing how it looks.

Load when: a page exists and its look is approved or was produced by another design skill, and the task is to make it correct. Also the last step of the sketch path when a design skill built the page.
Reads: the site, `qa/GATES.md`. Writes: fixes in the site, `design/BRIEF.md` when it is missing, the handoff README.

## The one rule

Change nothing a visitor would notice, unless a check requires it. When a check requires a visible change, make the smallest one that passes.

- Contrast too low: move the failing colour by the least amount that reaches the ratio. Keep its hue. Do not swap the palette.
- A link or button too small to tap: add padding or `min-height`. Do not change the type size. Then look at the phone screenshot: if a row of links now wraps, reduce the gap between them before accepting the wrap.
- A form field without a label: add a `<label>`. If the design shows none, hide it visually with a `.visually-hidden` class, never with `display: none`.
- No visible focus ring: add `:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }` for the controls that lack one.
- Text that is cut off or overlaps when spacing is increased: remove the fixed `height` or `overflow: hidden` that causes it.
- A keyboard trap or an unreachable control: fix the markup (a real `<button>`, a real `<a href>`) and keep the styling.

Never delete a section, shorten the copy, change a font or redesign anything to make a check pass. Do not correct content that no check names, such as a date, a name or a figure: list what looks wrong in the handoff and leave it to the owner.

## Steps

1. If `design/BRIEF.md` is missing, write one with the line `Deployment mode: demo`. The site check treats a project without that line as production and then fails every drafted fact.
2. Record the page as it is. Serve it, run `node <plugin>/scripts/gates.mjs --url <url> --project . --quick`, and copy `qa/shots/home-1440-light.png` and `qa/shots/home-375.png` into `qa/before/`.
3. Run the gates without `--quick`. `qa/GATES.md` names each failing check, the element and the measured value.
4. Fix every failing check under the one rule and run the gates again, three rounds at most. Stop at an `ESCALATE:` line.
5. Mark what was drafted. Every price, opening time, date, weight, size or count that the client did not state gets the attribute `data-assumed` on its element (`references/brief.md`). The attribute is invisible; it lets the owner find what to confirm.
6. Check that the forms tell the truth. A form with no backend opens the visitor's mail program or says plainly that sending is not connected yet. If it shows a success message for something that did not happen, change the message, not the design.
7. Fonts loaded from another server are a privacy problem in the EU. Fetch the same families and weights with `node <plugin>/scripts/fonts.mjs get "<Family>" --weights … --out site/fonts`, paste the rules it prints and remove the remote link. If the type then looks different (the script does not fetch optical-size or width axes), put the link back and list it in the handoff as open.
8. Run the quick gates once more and compare the two screenshots with the copies in `qa/before/`. Undo any difference that a check did not require.
9. Write the handoff README: how to view the site, each check fixed and how, every `data-assumed` fact, what still fails, and what is not connected yet.

## What this does not do

It does not judge or improve the design, and a green run is not a WCAG conformance claim (`references/gates.md`). For a design audit use `ultraweb:retrofit`.
