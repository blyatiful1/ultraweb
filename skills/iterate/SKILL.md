---
name: iterate
description: Targeted revision pipeline for an existing ultraweb-built site — scope a requested change ("make the hero bolder", "add a pricing page", "darker palette"), touch only the affected phases, and re-run only the affected quality gates. Use for any change request to a site that has design/* artifacts; use the root ultraweb skill only for building from scratch.
---

# iterate — surgical changes that keep the system coherent

A change request against an existing ultraweb site is NOT a rebuild and NOT a freestyle patch. The design system is law until deliberately amended.

## Process

1. **Load the record.** Read `design/BRIEF.md`, `DIRECTION.md`, `SYSTEM.md`, `SITEMAP.md`, `QA.md`. If they don't exist, this isn't an ultraweb site — run `ultraweb:retrofit` first.
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
- Screenshots before/after for any visual change; the after-shot goes through `design-judge` if the change was Page-level or bigger.
