# Design packs

A design pack is a complete look for one-page sites, authored once by a strong model and reused. A small model chooses a pack by the client's subject, fills its patterns with the client's content, adds no CSS of its own and runs the finish pass (`references/pack-build.md`).

```bash
node scripts/packs.mjs list                         # what each pack is and which clients it suits
node scripts/packs.mjs install <name> --into .      # copy the pack to ./pack/
node scripts/packs.mjs check                        # structural checks on every pack
```

| Pack | Character | For | Signature |
|---|---|---|---|
| `fieldbook` | a surveyor's field book: narrow tall headlines, mono figures, hard rules | makers, trades, workshops, clubs, anyone with dimensions, times and prices | dimension lines carrying real figures; dimensioned drawings with callouts |
| `nocturne` | a place at a particular hour: a layered landscape under one moon or sun | observatories, venues, inns, tours, festivals, evening restaurants, launches | the scene kit of ready SVG parts; a "tonight" line worked out from dates |
| `periodical` (Quarterly) | one issue of a small magazine: masthead, columns, drop caps, marginal notes | inns and restaurants with a story, farms and wineries, nonprofits, studios that write, reports | the folio system and marginal notes |
| `shopfront` | the painted shop sign and the price board: colour edge to edge, a fat slab name, stamps | bakeries, cafés, delis, barbers, repair shops, record and book shops, clubs | the board with dot leaders and sold-out marks; an Open plate from opening hours |
| `vitrine` | objects in a case: each thing on a numbered plate with a museum label | ceramicists, jewellers, furniture makers, architects, galleries, florists, boutique hotels | the plate and label system; a picture slot complete with a drawing |
| `console` | the product's own interface as the picture: windows, code, tables | developer tools, SaaS, APIs, apps, data services, open-source projects | the window kit: app chrome, diff and code blocks, terminal, metric tiles |

Each pack holds:

- `pack.json`: the manifest `packs.mjs list` prints
- `PACK.md`: the guide the builder reads (character, colourways, patterns, composition rules, voice)
- `pack.css`, and `pack.js` for up to three small behaviours driven by data attributes
- `catalogue.html`: every pattern and interface element once, with a comment before each saying what it is for and what the builder supplies
- `fonts/`: self-hosted

Every pack has three colourways, three first screens, its own buttons, form controls, status marks, notices, table, disclosure and picture slot, and no type family in common with another pack. `tests/packs.test.mjs` runs the structural check and the accessibility and responsive gates on every catalogue.

## What is and is not known

- Fieldbook went through one graded comparison (`evals/results/2026-11-25-pack-test.md`): at about half the per-site cost of the comparison arm, the grader preferred its page for one brief of two. It lost where its character did not fit the subject.
- The other five packs were authored after that round. Each passes its checks; none has been through a graded comparison.
- A pack forced onto the wrong subject loses to a page designed for it. `pack-build.md` tells the builder to say so and build without a pack when none suits.

## Adding a pack

`AUTHORING.md` is the instruction given to the authoring model, together with a character brief. Authoring one pack cost between $4 and $7 at API list prices in the session these were made in.
