---
name: iterate
description: "Make a targeted change to a site ultraweb built (it has design/BRIEF.md, DIRECTION.md, SYSTEM.md and SITEMAP.md): change copy, a section, a page, the palette or type, or add a feature, then re-run only the affected gates."
---

# iterate

Apply one change request to an existing ultraweb site without rebuilding it.

`<plugin>` is `${CLAUDE_PLUGIN_ROOT}`, or the path on the first line of `design/PROGRESS.md`.

## 1. Check the record

Read `design/PROGRESS.md` (including `## Lessons`), `design/BRIEF.md`, `design/DIRECTION.md`, `design/SYSTEM.md` and `design/SITEMAP.md`.

- All four design files present: continue.
- None present: this is not an ultraweb site. Say so and offer `retrofit` (`<plugin>/skills/retrofit/SKILL.md`).
- Some present: name the missing files to the user. If PROGRESS.md shows an unfinished build, offer to resume it (root `SKILL.md` §Resuming). Otherwise offer `retrofit` to reconstruct the rest. Do not start the change, and do not re-run the mockup round or any other phase on your own.

## 2. Classify

Pick the smallest layer that satisfies the request.

| Layer | Examples | Read from `<plugin>/references/` | Re-run gates |
|---|---|---|---|
| Content | wording, an image, data | `copy.md` | `--only content --routes <changed>` |
| Section | one section looks wrong | `sections.md`, `primitives.md` | `--only code,content,a11y,responsive --routes <changed>`, one judge round on those routes |
| Page | new or restructured page | `structure.md`, `copy.md`, `sections.md` | all gates on the new routes, one judge round |
| System | palette, type, spacing, motion feel | the matching file among `tokens.md`, `color.md`, `typography.md`, `layout.md`, `motion.md` | all gates on all routes, one judge round |
| Feature | backend behavior, forms, checkout | `backend.md` or `commerce.md` | `--only code,content,a11y --routes <affected>` |
| Direction | "I don't like the look", "make it like <site>" | `taste.md`, `direction.md`, `mockup.md` | everything after the rebuild |

A request that names a look or another site is a Direction change. Confirm the scope with the user before starting one: it reopens Phase 2 and redoes Phases 3 onward. Adding a showpiece or 3D scene is also a Direction change and needs an entry in DIRECTION.md first (`references/showpiece.md`).

If the same element gets a third change request, the layer was too small. Move up one layer and fix the cause.

## 3. Change

1. Update the design file for the layer first: copy deck in SITEMAP.md, tokens in SYSTEM.md, a new page in SITEMAP.md, a new decision in DIRECTION.md.
2. Make the code change at that layer. Change token values in the token CSS, never inside components.
3. Do not touch unrelated surfaces. Name, in one line each, anything nearby that the change now makes inconsistent, and leave it.
4. Edit files with the Edit and Write tools, not shell redirects.

## 4. Re-gate

Run `node <plugin>/scripts/gates.mjs --url <url> --only <gates> --routes <routes>` against a fresh production build, using the gates from the table. Read `references/gates.md` if it is not in context. Fix every fail, rebuild, and re-run the same command. Send judge rounds to the `design-judge` agent with the screenshots from `qa/shots/`. A FAIL is never reported as done.

## 5. Log

Append to `design/PROGRESS.md`: the request, the layer, the files and design artifacts changed, the gates run and their verdict. Add a `## Lessons` line if something surprised you. Commit as `ultraweb: iterate — <short summary>`. Report what changed, which artifacts were updated, and the gate results.
