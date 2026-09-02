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
2. **Render the candidates — delegate round 1** when all three hold: the Agent tool is available, the tier is not sketch, and the user has not asked for a single context ("no agents", "single context"). One Specialist agent (`model: opus`) per candidate, launched in one batch, each handed the turnkey brief in `references/candidate-brief.md` filled in for its seat. This holds in solo mode too (root SKILL.md §Orchestration modes): one mind still owns the shortlist and the pick — only the typing fans out. When a condition fails, and always at sketch tier, write the candidates in this context and load no brief; the bullets below are the whole spec. Either way each candidate is ONE self-contained file `design/mockups/<letter>-<archetype-slug>.html`:
   - Inline `<style>` only; zero JavaScript; fonts via a Google Fonts `<link>` with honest fallback stacks (the one permitted external request).
   - Palette as OKLCH custom properties on `:root` — the same values DIRECTION.md would commit to, every foreground/surface pair clearing WCAG AA.
   - Real type pairing, display + body, hero at least 3.5× body size. Default-Inter-only is not a pairing.
   - Hero + the 2–3 sections that carry the most decision weight for THIS site type: e-commerce → product grid; restaurant → menu excerpt; SaaS → feature split; portfolio → work index; editorial → article opener. Not a full page inventory.
   - The signature move rendered as a static frame (the SVG motif drawn, the layout gesture placed) — enough to judge, not implemented.
   - Copy sketched in the brief's tone — headline, one section of body, real CTAs. No lorem, no "Feature 1/2/3". Sketch-grade is fine; placeholder-grade is not.
   - One honest small-screen pass: fluid widths and readable text at 375px. No breakpoint engineering beyond that.
   - The `taste` banned list applies in full — a mockup that wins with a banned move poisons the build that follows it.

   Each agent returns the file path plus a ≤10-line spec: archetype, the OKLCH values it used, the type pairing, the signature move as drawn, and any refusal or deviation. Keep those specs — `direction` writes DIRECTION.md from the approved candidate's spec, not by re-reading its markup (ONE Read of the approved HTML is allowed when the spec leaves a decision genuinely open). An agent that returns no spec is asked for one; never reconstruct it by opening the file.
3. Write `design/mockups/index.html` — the contact sheet: all candidates in one scrollable page (each embedded via `<iframe>` at a phone-ish and a desktop-ish width, labeled A/B/C with its one-line identity). Comparing three designs must not require juggling three tabs in working memory; one tab, scroll, point.
4. Present the contact sheet (plus the individual files for full-size viewing) — **the user opens them in their own browser, and you view no image in this phase.** Nothing serves `design/mockups/` before Phase 5 and the browser MCP refuses `file://`, so the round's own record is the returned specs — or, on the in-context path, the ten lines per candidate you wrote from. Then ask ONE structured question: pick A/B/C, mix named elements across candidates, or request a revised round. Never ask them to describe what they want in prose first — the mockups exist so they can point.
   **Tournament mode** — offered when the user says comparing three at once is hard ("one at a time", "just show me two"), or asks for it: pairwise duels instead of a 3-up menu. A vs B, winner vs C — two questions, each a binary with a "what tipped it" follow-up in the same breath. Same candidates, same approval bar, two more minutes; the per-duel verdicts are cleaner preference signal than a 3-way pick and land in the fingerprint (below) as one line each.
5. Log the round in design/MOCKUPS.md (format below): every candidate's one-line identity, the user's verdict close to verbatim. It is a ledger — it only grows: append with an Edit anchored on its last line when the file is already in this context, with a `>>` heredoc when it is not (a fresh session, a resume). Never rewrite it.
6. On "mix": the base candidate keeps its archetype; borrowed elements become ONE recorded twist ("A, with B's type pairing") — never a 50/50 hybrid, per `direction`'s hedging ban. On "revise": generate the new round from the user's stated objection, retiring the weakest candidate; three rounds without an approval means the shortlist is wrong — return to `direction` and re-shortlist. Revision rounds do not fan out again: write the revised candidate here, or send ONE agent the brief plus the user's verdict verbatim (never your paraphrase of it — the objection's exact words are the spec).
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
- Starting scaffold, foundation, or any Phase 3+ fan-out before the Approved line exists in MOCKUPS.md (the candidate renders are the one exception — they are how the approval gets earned, and they delegate in either orchestration mode)
- Reading the three candidate files into this context to judge them — the specs are ten lines each; that is the whole pick
- Rewriting MOCKUPS.md to tidy an earlier round — a round's verdict is the user's words, and a ledger corrects by appending
- Asking the user open-ended style questions alongside the mockups — the files answer, the user points

## Worked example — Kaffeewerk Ost, Berlin roastery shop + subscriptions

Moved to `references/example.md` — read only when this build's case is genuinely ambiguous; the sections above are the decision material.

## Composes with

Moved to `references/composes.md` — the handoff map; load it when orchestrating this skill against its neighbors.
