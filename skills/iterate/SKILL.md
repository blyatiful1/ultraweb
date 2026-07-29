---
name: iterate
description: Targeted revision pipeline for an existing ultraweb-built site — scope a requested change ("make the hero bolder", "add a pricing page", "darker palette"), touch only the affected phases, and re-run only the affected quality gates. Use for any change request to a site that has design/* artifacts; use the root ultraweb skill only for building from scratch.
---

# iterate — surgical changes that keep the system coherent

**Stage:** post-ship, any change request - **Reads:** design/BRIEF.md, design/DIRECTION.md, design/SYSTEM.md, design/SITEMAP.md, design/QA.md - **Writes:** the affected code + amended design/* artifact + design/QA.md entry

A change request against an existing ultraweb site is NOT a rebuild and NOT a freestyle patch. The design system is law until deliberately amended.

## Process

1. **Load the record.** Read `design/BRIEF.md`, `design/DIRECTION.md`, `design/SYSTEM.md`, `design/SITEMAP.md`, `design/QA.md`. If they don't exist, this isn't an ultraweb site — run `ultraweb:retrofit` first.
2. **Classify the request** into the shallowest layer that truly satisfies it:
   - **Content** — copy, images, data. Touch content only. Consult `copywriting`/`imagery`. Re-gate: `gate-content`.
   - **Component** — one section looks wrong / needs variants. Consult that section's skill (`hero`, `pricing`, …). Re-gate: `gate-visual` on affected pages + `gate-code`.
   - **Page** — new page or restructure. Amend `SITEMAP.md` first, then build via the component skills it names. Re-gate: `gate-visual`, `gate-responsive`, `gate-code`, `gate-content` on the new surface.
   - **System** — palette, type, spacing, motion feel ("make it warmer", "less corporate"). This amends `SYSTEM.md` + `app/globals.css` tokens — components should mostly follow via tokens. Consult the relevant foundation skill (`color`, `typography`, `motion-language`…). Re-gate: `gate-visual` + `gate-accessibility` (contrast changed!) + `gate-antislop` sweep.
   - **Direction** — "I hate the vibe". This is a re-run of `direction` + Phase 3 of the root pipeline. Confirm scope with the user before burning it down — this is the one case where asking beats deciding.
   - **Feature** — backend behavior. Consult the matching Tier-6 skill; re-gate `gate-code` + affected flows.
3. **Amend the artifact before the code.** Whatever layer you touched, update its design/* file in the same change — drifted artifacts poison every later iteration.
4. **Make the change** at the classified layer. Resist scope creep: "bolder hero" doesn't license retouching the footer. But DO flag (one line, no action) anything adjacent that the change now makes inconsistent.
5. **Re-gate the affected surface only** (per the classification above), append results to `design/QA.md`, and report: what changed, which artifacts were amended, gate results.

## Rules

- A request that names a look ("like linear.app", "more brutalist") is a **Direction**-layer conversation, not a CSS tweak — check before classifying it smaller.
- Never edit token VALUES ad hoc inside components to satisfy a local request — that forks the system. Change the token, or add a deliberate variant.
- If the same element gets its third revision request, the layer was misclassified — step up one layer and fix the cause (usually SYSTEM or DIRECTION).
- A request for SVG choreography — "make the logo draw itself", "animate the diagram", "scrub the illustration with scroll" — is a **Direction** question before it is a motion one: `ultraweb:animejs` installs only against a DIRECTION.md commission naming the moment. If the amendment grants it, the change adds a dependency, so `gate-performance`'s bundle audit re-runs alongside the classified gates; if a later request cuts the moment, the package leaves with it.
- A request to make the site itself three-dimensional — "make the whole thing 3D", "can it be a world you fly through", "like that immersive site" — is a **Direction rewrite**, not a motion tweak, and it is the largest amendment this skill can classify. It re-opens the archetype (only 12 qualifies), the intensity dial (3), the byte budget, and the static edition of every route, so **every** gate re-runs, not just the classified ones — a persistent canvas changes what `gate-accessibility` and `gate-visual` are even looking at. `ultraweb:set-design` installs only against a DIRECTION.md commission naming the skill, its route scope AND its byte budget, and granting it spends the site's entire signature budget: any previously commissioned animejs or physics moment is cut in the same amendment, or the request is declined. If a later request cuts the world, the renderer, the model, the decoders and the posters all leave with it.
- Screenshots before/after for any visual change; the after-shot goes through `design-judge` if the change was Page-level or bigger.

## Worked example — Kaffeewerk Ost, "make the hero bolder"

The roastery's design/DIRECTION.md reads: *Warm Workshop — signature move: the roast-profile curve motif; type: Fraunces display.* The request sounds Component-sized, but the classification check catches it: hero scale lives in the global `--text-display` token, so "bolder" amends design/SYSTEM.md §type — that is **System** scope (patching the size inside hero.tsx instead would fork the system, the exact anti-pattern the rules below ban). The amendment follows `ultraweb:hero` scale rules: `--text-display` moves from `clamp(2.75rem, 1.5rem + 5.5vw, 6rem)` to `clamp(3rem, 1.5rem + 6.5vw, 7.5rem)` and display tracking tightens to -0.035em — token-only, so every display headline follows and no component markup changes. Rejected: pushing the accent color into the headline — "bolder" earns scale, not decoration (taste: the fix is hierarchy or asymmetry, never another effect). Re-gate per the System row: `gate-visual` + `gate-accessibility` + `gate-antislop` sweep; System scope is bigger than Page, so the after-shots go through `design-judge` (Opus 5), and `design/QA.md` gets the delta entry.

## Composes with

- ultraweb:taste — every request is checked against the constitution before classification; vibe words ("bolder", "warmer", "less corporate") resolve to its vocabulary.
- ultraweb:retrofit — the entry point when design/* artifacts DON'T exist; iterate takes over only after retrofit has built the record.
- ultraweb:brief — Feature-layer requests ("add a newsletter") amend design/BRIEF.md first, exactly as a fresh build would.
- ultraweb:handoff — the maintenance notes it writes tell site owners which requests are token edits they can make themselves vs. iterate-worthy changes.
- The seven gate-* skills — the classification table above decides which re-run, and `gate-performance` joins whenever a change touches media, motion, or bundle weight; a change is done when its slice of design/QA.md is green again.
