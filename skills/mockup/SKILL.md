---
name: mockup
description: Render the direction shortlist as three fast, throwaway, self-contained static HTML previews — one per candidate archetype, each a hero plus 2–3 decision-carrying sections with a real OKLCH palette, real type pairing, and copy sketched in the brief's voice — plus a one-tab contact sheet, then run the pick/mix/revise loop (or pairwise tournament mode: "one at a time", "A or B") with the user until one candidate is explicitly approved, logging every round in design/MOCKUPS.md and feeding the cross-build taste fingerprint. Invoke as Phase 2 of the ultraweb pipeline in guided mode, after brief and the direction shortlist exist, whenever the user should see directions before the build commits to one ("show me some options", "let me pick a style", "mock it up first"). Never invoked in autonomous mode; never a substitute for the real build.
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
3. Write `design/mockups/index.html` — the contact sheet: all candidates in one scrollable page (each embedded via `<iframe>` at a phone-ish and a desktop-ish width, labeled A/B/C with its one-line identity). Comparing three designs must not require juggling three tabs in working memory; one tab, scroll, point.
4. Present the contact sheet (plus the individual files for full-size viewing), then ask ONE structured question: pick A/B/C, mix named elements across candidates, or request a revised round. Never ask them to describe what they want in prose first — the mockups exist so they can point.
   **Tournament mode** — offered when the user says comparing three at once is hard ("one at a time", "just show me two"), or asks for it: pairwise duels instead of a 3-up menu. A vs B, winner vs C — two questions, each a binary with a "what tipped it" follow-up in the same breath. Same candidates, same approval bar, two more minutes; the per-duel verdicts are cleaner preference signal than a 3-way pick and land in the fingerprint (below) as one line each.
5. Log the round in design/MOCKUPS.md (format below): every candidate's one-line identity, the user's verdict close to verbatim.
6. On "mix": the base candidate keeps its archetype; borrowed elements become ONE recorded twist ("A, with B's type pairing") — never a 50/50 hybrid, per `direction`'s hedging ban. On "revise": generate the new round from the user's stated objection, retiring the weakest candidate; three rounds without an approval means the shortlist is wrong — return to `direction` and re-shortlist.
7. Stop only at an explicit approval. Write it in design/MOCKUPS.md as the final line. That line is the pipeline's green light: `direction` turns the winner into DIRECTION.md, and no Phase 3+ work may start before it exists. Then feed the fingerprint (below).

## Fingerprint — what this round teaches the next build

The pick is the richest taste signal the harness ever receives, and throwing it away at project boundary wastes it. After the Approved line, when the user's setup has (or accepts) `~/.claude/ultraweb/`, append to `~/.claude/ultraweb/taste.md`: one line per round — winner's archetype, the named differentiator ("picked warmth over grid discipline"), the losers and any stated objection — and, in tournament mode, one line per duel to `~/.claude/ultraweb/duels.jsonl`. Three hard constraints keep this from becoming a rut:

- **Tiebreaker, never trump.** The profile may only break ties between candidates the BRIEF already ranks equal. A user who loves Swiss grids still gets a warm organic shortlist for a roastery — BRIEF.md and `taste` outrank the profile, always.
- **The heretic seat.** When a profile exists, one shortlist seat is always an explicit anti-profile candidate, labeled in MOCKUPS.md ("C — the heretic seat"), so the profile is disconfirmable every single round. The day the heretic wins, the profile was a rut.
- **Decay.** Only the last 10 builds count; older entries are pruned on write. Taste drifts, and a two-year-old preference is data about a stranger.

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
- Starting scaffold, foundation, or any Phase 3+ fan-out before the Approved line exists in MOCKUPS.md (the candidate renders themselves may fan out — that's the round's own work)
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
- ultraweb:direction — bidirectional: it hands over the 3-candidate shortlist (reading the fingerprint as tiebreaker and seating the heretic), and consumes the Approved line to write DIRECTION.md (mixes become the recorded twist).
- ultraweb:checkpoint — this round IS checkpoint CP2; MOCKUPS.md's Approved line doubles as the CP2 ledger entry, and the two-consolidated-rounds discipline is shared.
- ultraweb:award-canon — a candidate's signature-move idea cites its pattern precedent, same as the real direction will.
- ultraweb:iterate — post-build style regrets route through it; the mockup round is never re-run against a built site.
