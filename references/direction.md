# direction

Turns the brief into candidate directions that differ for real, then records the approved one in `design/DIRECTION.md`.

Load when: Phase 2, after `design/BRIEF.md` exists and `references/taste.md` has been read.
Reads: design/BRIEF.md, client assets. Writes: candidate specs for the mockup round, then design/DIRECTION.md.

## 1. Study the subject first

Do this before thinking about style. Write a subject sheet of ten to fifteen lines; it becomes the first section of DIRECTION.md.

- Materials and objects: what the client's world is physically made of (flour and steel trays, blueprints, receipts, enamel signs, pixel grids, shipping labels).
- Vernacular: how this trade already communicates (menus, timetables, spec sheets, score sheets, packaging, terminal output, price boards) and the layout and type conventions found there.
- Place and time: region, era, climate, light.
- Verbs: what people come to do (book, taste, compare, deploy, donate).
- Tension: the two qualities in the brief that pull apart ("exact but warm", "playful but trusted").
- Category default: what competitors' sites look like. Browse three when you can; otherwise state the default you expect. The point is to differ from it.
- Constraints from client assets: logo colours, existing photography, a brand typeface.

End the sheet with at least five concrete visual hooks, each tied to a line above ("the proofing schedule set as a timetable", "the till receipt as the price list").

## 2. Build the candidates

A candidate is a one-sentence concept plus a decision on each axis.

| Axis | Values |
|---|---|
| ground | light neutral, light tinted, dark, saturated colour, mid-tone, photographic |
| type class | grotesque, humanist sans, geometric sans, old-style serif, transitional serif, didone, slab, mono, display |
| colour | monochrome, one accent, two-colour pair, polychrome from a real source |
| layout | centred stack, asymmetric grid, full-bleed image-led, dense index, long narrative, split screen, spatial or horizontal |
| imagery | photography, illustration, type only, product UI, data or diagram, 3D render |
| corners | square, slight, round |
| density | airy, medium, dense |
| motion | 0 still, 1 quiet, 2 expressive, 3 immersive |

Standard and flagship tiers build three candidates; sketch builds A and C.

- **A** is the strongest concept from the subject sheet.
- **B** is a second concept from the sheet that differs from A on ground and type class at least.
- **C** is dealt. Run `node <plugin>/scripts/deal.mjs --exclude ground=<A's>,ground=<B's>,type=<A's>,type=<B's>,layout=<A's>,layout=<B's>`. It prints one value per axis and avoids combinations dealt or approved recently. Find the hook on the subject sheet that makes the deal fit this client. When one axis is impossible for the brief (the client has only photography, so imagery is fixed), re-run with `--fix imagery=photography` and note the fix. The dealt candidate exists because options chosen by judgment cluster around the same few looks.

Any two candidates must differ on ground, type class and layout principle. At most one candidate may sit in a default cluster from `references/taste.md`, and it carries the sentence that derives it from the brief.

When the user points at a reference ("like this site"), work out which principle makes it work. That principle seeds one candidate. Borrow the principle, not the surface.

Motion 3 and 3D imagery are available only at flagship tier or when the user asks for them, and only when the brief records the assets (`references/brief.md`).

## 3. Mockups and the pick

Hand the candidates to `references/mockup.md`. In guided mode the user picks, mixes or sends them back (CP1). In autonomous mode pick the candidate most specific to this brief; if two tie, the one whose signature move can be executed best within the tier's budget. Log the reason under Assumptions in `design/PROGRESS.md`.

After approval, record the approved axes so later builds are steered away from them:

```bash
node <plugin>/scripts/deal.mjs record --ground dark --type slab --colour one-accent --layout dense-index
```

## 4. The signature move

There is one. Write down four things.

- Name: one sentence a person who has not seen it would understand and want to see.
- Place: the page and section it lives in.
- Budget: what it may cost in JavaScript, assets and build time.
- Fallback: what reduced motion, a phone and no JavaScript each get.

It can be typographic, a layout inversion, an interaction, a scroll sequence, an image treatment or a 3D scene. A 3D or site-scale move loads `references/showpiece.md`. At flagship tier, read `references/award/patterns.md` for precedent and borrow a principle from it.

## 5. design/DIRECTION.md

Write it only after the approval exists in guided mode.

```md
# Direction: <the concept in one sentence>

## Subject
<the subject sheet and its hooks>

## Decisions
Ground: … (why, from the subject)
Type: <families and roles> (why; licence and source checked)
Colour: …
Layout principle: …
Imagery: …
Motion: <0–3>; what moves, what never moves
Theme: single (which) or dual (why)

## Signature move
Name / place / budget / fallback

## Assets
What exists, what will be generated and with which tool, what is missing

## Defaults used
Each default from references/taste.md present in this direction, with the sentence deriving it from the brief. Or "none".

## Will not
At least five entries: the runner-up candidates by concept, the defaults this direction will be tempted by, effects that are out of scope.

## Approved
Who, when, which candidate, changes requested
```

Two checks before moving on: a stranger reading the file could sketch the homepage, and the file could not be the direction of a competitor.

## Signs the direction is not ready

- The concept sentence uses "modern", "clean", "sleek" or "minimal" and little else.
- Style was chosen before the subject sheet was written.
- Two candidates share ground and type class.
- There are two signature moves, or none with a place and a budget.
- A default cluster appears with no deriving sentence.
- The type decision names a class but no family, or a family nobody checked exists and is licensed.
