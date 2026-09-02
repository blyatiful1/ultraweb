---
name: assets
description: Ingest the client's existing material before the pipeline invents anything — scan the folder, paths, or files the user named, classify every find (vector logo, raster logo, photography, illustration, copy documents, brand-guide PDF, font files), map each one to the page slot that will consume it and the treatment it must pass through, and extract constraints into design/ASSETS.md: sampled OKLCH values as candidates for color, the existing typeface when its license permits web embedding, logo clear-space and mono-variant facts for identity. Invoke in Phase 1 immediately after brief whenever the user points at material that already exists — "use our logo", "here are our photos", "we have a brand guide", "our current site is X", a named folder, or attached files. When nothing exists it writes the one line that keeps the brief honest.
---

# assets — ingest what exists before inventing

**Stage:** Phase 1 — Understand (immediately after `brief`) - **Reads:** the paths/folder/files the user named + design/BRIEF.md - **Writes:** design/ASSETS.md

## Standard

A first-grade intake is exhaustive, classified, and honest about its own authority:

- **Exhaustive:** every file in the named source is accounted for — used, superseded, or rejected with a reason. A silently ignored asset becomes the client's first review comment: "why isn't our logo on it?"
- **Classified by what it can become**, not by extension. A 4000px flat-lay is hero media; the same shot at 380px is a thumbnail. Classification records that ceiling, so `imagery` never plans a full-bleed around a file that cannot carry one.
- **Slotted:** each kept asset names the page slot that consumes it and the ONE treatment it passes through. An inventory that stops at "we have 40 photos" hands the build a shoebox, not a decision.
- **Advisory, never sovereign:** extracted palette and type facts are CANDIDATES. `taste` and contrast math still govern; a client hex that fails AA loses. What the client owns is input to the design, not a veto over it.
- **Honest about absence:** no assets is a finding, not a blank. It gets written down so §Assumed facts stays truthful about what the studio invented.

## Process

1. **Resolve the sources.** Enumerate the folder, paths, or attachments the user named — `find <dir> -type f -not -path '*/.*' | sort` — then `file` each hit for its real type. A named URL is not an asset source: hand it to `direction` and move on.
2. **Classify every find** into one of seven buckets: vector logo (`.svg`, `.ai`, `.eps`, live-path `.pdf`) · raster logo · photography · illustration/pattern · copy documents (`.docx`, `.md`, `.txt`, exported site copy) · brand-guide PDF · font files (`.otf`, `.ttf`, `.woff2`). Anything unclassifiable is listed as `unknown` with its type string — never dropped.
3. **Record the ceiling per asset:** pixel dimensions and orientation for raster, viewBox for vector, page count for documents. Photography under 1600px on the long edge cannot hold a hero — say so in the row instead of discovering it in Phase 6.
4. **Assign the slot and the treatment.** Slot comes from BRIEF.md §Pages and §Content inventory (`/shop` grid card, hero, about portrait); when `wireframe` later names the real section, tighten the column to that name. Treatment names what the asset must survive: `imagery`'s single named treatment, `media-optimization`'s pipeline, background removal, re-crop.
5. **Sample color candidates.** Pull 3–6 values from the vector source or the brand guide, converted to `oklch(L C H)` — never carried forward as hex. They are proposals for `color`'s ramp, labeled as such.
6. **Contrast pass, non-negotiable.** Compute every candidate proposed as a foreground or surface against its intended pair. Failing AA: keep the hue, move L (cap C if the hue can't hold it), log BOTH values and both ratios. An unreadable client color is a defect with a brand story attached.
7. **Check the typeface license before committing anything.** A named face enters SYSTEM.md only if web embedding is permitted — open-licensed, or a webfont license the client actually holds. Desktop-only licenses, "we bought it for the logo", and unverifiable claims all resolve the same way: name the nearest licensable alternative on `typography`'s terms and log the substitution with its reason. Never ship an unlicensed `.otf` out of a client folder as a webfont.
8. **Read the mark, don't redraw it.** Record clear-space in mark-heights, minimum legible size, whether a mono variant exists, and whether it survives knocked out on dark. Vector → `identity` formalizes the lockup around it. Raster-only → flag it for `identity` and stop: **never auto-trace a client mark.** A traced logo is a forgery with wrong curves, and it gets compared against the printed one.
9. **Mine the copy documents for voice, not paragraphs.** Extract the phrases the client genuinely uses — product names, process terms, how they describe their craft — and hand them to `copywriting` as source. Their existing About page is evidence of voice, never approved copy.
10. **If nothing exists**, write the file anyway with exactly the line `No client assets provided — everything visual is invented.` and mirror it into BRIEF.md §Assumed facts. That line is why the first review is a correction and not a betrayal.
11. Write design/ASSETS.md in the format below. Every Foundation-phase skill reads it before inventing.

## ASSETS.md format

```md
# Assets — <client>
Source: <path or "none provided"> · <n> files scanned, <n> kept

| Asset | Class | Ceiling | Slot | Treatment |
|---|---|---|---|---|
| `label-scan.jpg` | raster logo | 1200×800 | header, footer, favicon | → identity: formalize as vector, never traced |
| `throw-flatlay-*.jpg` (12) | photography | 3000px | /shop cards, /products/[slug] gallery | linen-ground treatment + blob pipeline |
| `brand-2019.pdf` | brand guide | 6pp | constraints only | — |

## Color candidates (input to `color`, not law)
- `oklch(0.42 0.06 148)` — thread green, sampled from label. AA fail on linen (3.1:1) → **use `oklch(0.36 0.07 148)`** (5.4:1), hue held.

## Type
- Named in guide: <face> — <license verdict> → <committed face or nearest licensable alternative, with reason>

## Mark
- Clear space: <n>× mark height · min size: <n>px · mono variant: yes/no · knockout: holds/fails

## Voice source
- <document> → phrases handed to `copywriting`

## Not used
- <file> — <one-line reason>
```

## Anti-patterns

- Auto-tracing a raster logo and calling it the vector — wrong curves, forged authority
- Adopting a client hex that fails AA because "it's their brand color" — the ratio is not negotiable, the hue is
- Treating a brand-guide PDF as SYSTEM.md — it is evidence; `color`, `typography`, and `identity` still decide
- Installing a font found in a client folder without a license check
- "40 photos in /assets" as an inventory — no ceiling, no slot, no treatment is a shoebox
- Pasting the client's existing About page in as copy — `copywriting` writes every string on the site
- Skipping the file when nothing was supplied, leaving the brief silently implying the visuals came from the client
- Chasing the reference site the user linked instead of handing it to `direction`

## Worked example — Loop & Thread, a shoebox of shop assets

Moved to `references/example.md` — read only when this build's case is genuinely ambiguous; the sections above are the decision material.

## Composes with

Moved to `references/composes.md` — the handoff map; load it when orchestrating this skill against its neighbors.
