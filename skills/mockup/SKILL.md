---
name: mockup
description: Render the direction shortlist as three fast, throwaway, self-contained static HTML previews — one per candidate archetype, each a hero plus 2–3 decision-carrying sections with a real OKLCH palette, real type pairing, and copy sketched in the brief's voice — then run the pick/mix/revise loop with the user until one candidate is explicitly approved, logging every round in design/MOCKUPS.md. Invoke as Phase 2 of the ultraweb pipeline in guided mode, after brief and the direction shortlist exist, whenever the user should see directions before the build commits to one ("show me some options", "let me pick a style", "mock it up first"). Never invoked in autonomous mode; never a substitute for the real build.
---

# mockup — three sketches, one approval

**Stage:** Phase 2 — Direction (guided mode) - **Reads:** design/BRIEF.md + the 3-archetype shortlist from `direction` - **Writes:** design/mockups/*.html + design/MOCKUPS.md

## Standard

A first-grade mockup round is fast, divergent, and honest:

- **Fast:** each candidate is minutes of work, not hours. One self-contained HTML file, no build step, no screenshots, no gates. The round's entire job is to let the user choose before the expensive pipeline starts — a slow mockup defeats its own purpose.
- **Divergent:** the three candidates must be distinguishable at arm's length — different archetype, different palette temperature, different type pairing. If two could be mistaken for each other in a thumbnail, one of them is a wasted seat: regenerate it.
- **Honest:** a mockup shows the basic idea the direction would commit to — real palette, real type, the signature move indicated statically, copy in the brief's voice. It does NOT show polish the build hasn't earned: no motion, no interactivity, no faked screenshots of features the brief rejected.
- **Throwaway:** mockup code never ships. The build re-derives everything from DIRECTION.md and SYSTEM.md; importing mockup markup into the app is a defect. The files stay in `design/mockups/` as visual reference only.

## Process

1. Read design/BRIEF.md and the shortlist. Each candidate arrives as: archetype + one signature-move idea + a palette/type sketch. Do not deepen them first — the mockup IS the exploration.
2. For each candidate, write ONE self-contained file `design/mockups/<letter>-<archetype-slug>.html`:
   - Inline `<style>` only; zero JavaScript; fonts via a Google Fonts `<link>` with honest fallback stacks (the one permitted external request).
   - Palette as OKLCH custom properties on `:root` — the same values DIRECTION.md would commit to.
   - Hero + the 2–3 sections that carry the most decision weight for THIS site type: e-commerce → product grid; restaurant → menu excerpt; SaaS → feature split; portfolio → work index; editorial → article opener. Not a full page inventory.
   - The signature move rendered as a static frame (the SVG motif drawn, the layout gesture placed) — enough to judge, not implemented.
   - Copy sketched in the brief's tone — headline, one section of body, real CTAs. No lorem, no "Feature 1/2/3". Sketch-grade is fine; placeholder-grade is not.
   - One honest small-screen pass: fluid widths and readable text at 375px. No breakpoint engineering beyond that.
   - The `taste` banned list applies in full — a mockup that wins with a banned move poisons the build that follows it.
3. Present all three files to the user side by side, then ask ONE structured question: pick A/B/C, mix named elements across candidates, or request a revised round. Never ask them to describe what they want in prose first — the mockups exist so they can point.
4. Log the round in design/MOCKUPS.md (format below): every candidate's one-line identity, the user's verdict close to verbatim.
5. On "mix": the base candidate keeps its archetype; borrowed elements become ONE recorded twist ("A, with B's type pairing") — never a 50/50 hybrid, per `direction`'s hedging ban. On "revise": generate the new round from the user's stated objection, retiring the weakest candidate; three rounds without an approval means the shortlist is wrong — return to `direction` and re-shortlist.
6. Stop only at an explicit approval. Write it in design/MOCKUPS.md as the final line. That line is the pipeline's green light: `direction` turns the winner into DIRECTION.md, and no Phase 3+ work may start before it exists.

## MOCKUPS.md format

```md
# Mockups — <working site name>
## Round 1
- **A — <archetype>** (`design/mockups/a-<slug>.html`): <palette one-liner> · <type pairing> · <signature-move idea>
- **B — …**
- **C — …**
**Verdict:** <user's choice/objection, near-verbatim>
## Round 2 (if any)
…
## Approved
<candidate + any commissioned mix> — approved by user, <round>. Green light for Phase 3.
```

## Anti-patterns

- A mockup with JavaScript, a build step, or a framework — the speed bar IS the spec
- Three candidates that share a palette temperature or type pairing — a fake choice
- Lorem ipsum, gray boxes, or `href="#"` in a mockup — sketch-grade copy is still real copy
- Polishing a candidate past sketch grade before approval — spending the build's budget on a maybe
- Shipping mockup markup into the app "since the user liked it" — the build derives from artifacts, never from sketches
- Starting scaffold, foundation, or any fan-out before the Approved line exists in MOCKUPS.md
- Asking the user open-ended style questions alongside the mockups — the files answer, the user points

## Worked example — Kaffeewerk Ost, Berlin roastery shop + subscriptions

BRIEF.md names e-commerce + `/abo`, tone tension *craft and tactile, but it has to sell*. `direction` shortlists three contrasting seats: **A — Warm Organic/Humanist**, **B — Swiss/International**, **C — Refined Luxury Serif**.

- `a-warm-organic.html`: cream ground `oklch(0.97 0.008 75)`, rust accent, Fraunces + Work Sans; hero with the hand-drawn roast-curve SVG as a static spine; a 3-product shop grid; the Abo pitch strip.
- `b-swiss.html`: white ground, signal-red accent, one neo-grotesque at two weights; visible grid lines; the same three products set as an index list.
- `c-luxury-serif.html`: ivory ground, espresso ink, a high-contrast display serif; display type set into a full-bleed bean image; hushed product row.

Verdict, Round 1: "A — but B's grid feels more organized." Logged; the mix is commissioned as A's archetype with one recorded twist (Swiss column discipline on the shop grid), not a hybrid. User approves. MOCKUPS.md gets its Approved line; `direction` writes DIRECTION.md as *Warm Organic/Humanist + twist: Swiss grid discipline on commerce surfaces*; the three HTML files stay behind as reference and not one line of their markup enters the app.

Rejected alternative: rendering the candidates as AI-generated concept images — faster to look at, but nothing in them is real (no actual palette values, no actual type), so the built site drifts from the picture the user approved. The mockup's whole authority is that what they pick is made of the same decisions the build will inherit.

## Composes with

- ultraweb:taste — the banned list applies to mockups at full strength; a candidate may not win with a move the build could never keep.
- ultraweb:brief — upstream; site type picks the decision-carrying sections, tone writes the sketch copy.
- ultraweb:direction — bidirectional: it hands over the 3-candidate shortlist, and consumes the Approved line to write DIRECTION.md (mixes become the recorded twist).
- ultraweb:award-canon — a candidate's signature-move idea cites its pattern precedent, same as the real direction will.
- ultraweb:iterate — post-build style regrets route through it; the mockup round is never re-run against a built site.
