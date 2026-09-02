---
name: direction
description: Choose ONE aesthetic archetype from a catalog of 12 named directions — Editorial/Magazine, Swiss/International, Brutalist, Neo-grotesque Minimal, Warm Organic/Humanist, Refined Luxury Serif, Playful Geometric, Dark Tech (flagged as the most cliched pick), Retro-Futurist, Soft Depth, Data-Dense Utilitarian, Art-House Immersive — each with typography, color, and motion stances, when-to-use guidance, and signature-move ideas. In guided mode the shortlist becomes three contrasting mockup candidates (via ultraweb:mockup) and the user's approved pick is what gets committed; in autonomous mode it commits directly. Selects ONE signature move and writes design/DIRECTION.md including a mandatory "we will NOT" list. Invoke as Phase 2 of the ultraweb pipeline once design/BRIEF.md exists, whenever a build needs its aesthetic committed ("what style should this site be", "pick a design direction", "give it a point of view"), or when a design reads generic and needs one direction chosen and pushed.
---

# direction — commit to one aesthetic

**Stage:** Phase 2 — Direction - **Reads:** design/BRIEF.md, the shortlisted entries of `references/CATALOG.md`, the award canon's `ARCHETYPE-MAP.md` (+ the `taste` constitution; in guided mode, design/MOCKUPS.md's Approved line) - **Writes:** design/DIRECTION.md

## Standard

This is the highest-leverage decision of the build. A first-grade direction is ONE archetype from the catalog below, executed 20% past comfortable; ONE named signature move with a location and a budget; and a "we will NOT" list of ≥5 real temptations. The test: a stranger reading DIRECTION.md could sketch the homepage. If two different archetypes could have produced the same DIRECTION.md, it is not a direction — it is a hedge, and per `taste`, timid design that hedges reads as no design.

## Process

1. Read design/BRIEF.md: site type, energy budget, audience, tone tension. Do not touch the catalog before this — archetype-first is taste applied to nothing.
2. Shortlist archetypes whose **Use for** matches the site type — exactly THREE in guided mode (two at sketch tier), deliberately contrasting (different palette temperature, different type stance: three flavors of minimal is a fake choice); 2–3 in autonomous mode. Shortlist off the table's **Use for** column, then Read ONLY the shortlisted entries in `references/CATALOG.md` at the line numbers `grep -n '^### '` returns — the full catalog never enters this context, and at sketch tier those two entries plus the archetype map (step 6) are this skill's only `references/` reads. The tone tension usually decides what makes the list ("warm but exact" → Warm Organic vs Swiss; the tension says: Swiss grid, warm palette twist). **Fingerprint check:** if `~/.claude/ultraweb/taste.md` exists, read it now — as a TIEBREAKER between candidates the brief already ranks equal, never as an input that outranks BRIEF.md or `taste` (a Swiss-grid-loving operator still gets a warm organic shortlist for a roastery). When the profile influenced a seat, the shortlist must also carry the heretic seat per `ultraweb:mockup` §Fingerprint — the profile stays disconfirmable.
   **Reference input:** when the user pointed at a real site or screenshot ("like linear.app", "something like this"), analyze it into catalog vocabulary — which archetype it actually is, plus at most one named borrowable principle ("their sticky chapter nav") — and let that seed ONE shortlist seat. The reference seeds a seat, never skips the round: steal the principle, never the surface, and record the reference plus the borrowed principle in DIRECTION.md's References line.
3. **Guided mode:** hand the shortlist to `ultraweb:mockup` — each candidate gets an archetype, a palette/type sketch, and one signature-move idea taken from that archetype's shortlisted entry (the brief names the archetype and hands over that seat's sketch; each candidate Reads its ONE entry at the grep line itself, never the whole catalog), and comes back as a static preview the user picks from, mixes, or sends back for revision. The commit is whatever earns the Approved line in design/MOCKUPS.md; a commissioned mix arrives as the base archetype plus one recorded twist, pre-decided. Do NOT write DIRECTION.md before that line exists. **Autonomous mode:** tiebreak per `taste` yourself, on the shortlisted entries alone: the direction more specific to THIS brief wins; if still tied, the one whose signature move you can execute strongest within the energy budget.
4. Dark Tech check: if it made the shortlist, attempt to disqualify it first. Was it chosen because the audience genuinely lives in dark terminals — or by reflex? It survives only with a written justification sentence in DIRECTION.md — and in guided mode it still needs the justification even if the user picked its mockup: approval buys the look, not an exemption from the constitution.
5. Commit to ONE — on the full shortlisted entries, never on a table row; the row shortlists, the entry decides. A deviation is allowed as one recorded twist ("Swiss, on warm paper instead of white" — or the mockup round's commissioned mix) — never a 50/50 hybrid. Mixing two archetypes is choosing none.
6. Choose ONE signature move — from the archetype's ideas or invented — sized to the energy budget. Name it, place it (page + section), and bound it (what it may cost: one canvas scene, one scroll sequence, one typographic gesture). One move; the rest of the site stays disciplined so it can sing. Consult the committed entry's **Signature moves** and **Canon** lines — the shortlisted entries are already in this context; no further entry is opened — and the award canon's archetype map, read as a file — `ARCHETYPE-MAP.md` in `<plugin>/skills/award-canon/references/`: Phase 2 loads no canon skill, and that map is the only canon file it reads. Together they name the reference winners — qualities to chase, never URLs to reskin — and the canon pattern whose *principle* the move borrows. Those pattern names are the vocabulary for the References line. If the move is SVG choreography — multi-path draw, morph, motion path, a scroll-scrubbed vector sequence — it must name **ultraweb:animejs** in DIRECTION.md, in writing, alongside its bounds; the engine is installed in Phase 9 against that sentence and no other justification. The sentence is necessary, not sufficient: `ultraweb:animejs` still runs its own four-part gate (≥2 capabilities, intensity ≥2 — 3 if scrubbed or pinned, authored SVG) and returns the moment here if any arm fails. Unnamed means uninstalled: a single drawn path is motion's `pathLength` or CSS, free. If the move is the *site itself* — one persistent scene the whole site inhabits, a scroll-driven camera as the narrative spine, one material world every route shares — it must name **ultraweb:set-design** in DIRECTION.md, in writing, alongside three bounds and not two: which routes the canvas survives, the byte budget in gzip, and what the complete static edition of each of those routes contains. The renderer is installed in Phase 9 against that sentence and no other justification. The sentence is necessary, not sufficient: `ultraweb:set-design` runs its own five-part gate (archetype 12 or an equally immersion-led recorded twist, intensity 3, an authored scene asset carrying a camera clip and a material-name contract, a static edition per route that would pass gate-visual alone, and a site type with the energy budget) and returns the move here if any arm fails. Unnamed means one set piece at most, and one hero scene is `showpiece`'s, not this: escalation is a scope decision, never a default. Same construction as `showpiece`'s canvas gate and `animejs`'s engine gate — this file is the only authority that can commission any of the three.
7. Write the "we will NOT" list, ≥5 entries, drawn from three sources: (a) the runner-up archetypes by name, (b) every `taste` banned-list item this direction will be tempted by (glassmorphism for Soft Depth, gradient text for Retro-Futurist, glow-everything for Dark Tech), (c) effects and scope explicitly out (no parallax, no dark mode hero video, no second accent).
8. Write design/DIRECTION.md in the format below. Re-read it against the `taste` banned list: any banned item that appears must carry its justification sentence inline, or it goes.

## The catalog — 12 archetypes

| # | Archetype | Use for | Type / color | Canon patterns |
|---|---|---|---|---|
| 1 | Editorial / Magazine | editorial, magazines, newsletters, long-form marketing | high-contrast display serif 4–6× body; warm paper ground, ONE ink accent | Type as Evidence · Type as the Image · Scroll-as-Journey |
| 2 | Swiss / International | agencies, studios, architecture, conferences, authority portfolios | one neo-grotesque, 2 weights; white/black + ONE saturated primary, flat | Type as the Image · The Three-Token Contract |
| 3 | Brutalist | art, fashion, music, events; never trust-critical | mono or aggressive grotesque, ALL-CAPS to 15vw; white/black + one clashing accent | Type as the Image · The Prove-It Gesture |
| 4 | Neo-grotesque Minimal | SaaS, developer tools, premium services | single grotesque, hero 3.5–4.5×; 8-step tinted neutral ramp, near-invisible accent | Type as Evidence · The Three-Token Contract · One Physics · Semantic Motion Only |
| 5 | Warm Organic / Humanist | local business, food, wellness, crafts, nonprofits | rounded humanist or soft serif; cream/clay/sage tints, terracotta accent | One Material World · Invert the Genre Palette · Semantic Motion Only |
| 6 | Refined Luxury Serif | luxury goods, hospitality, jewelry, fine dining | high-contrast serif at weight ≤500, caps labels; espresso ink on ivory | Type as Evidence · One Physics · The Persistent Hero Object · The Three-Token Contract |
| 7 | Playful Geometric | kids, education, consumer apps, festivals | geometric sans 700–900; light ground, ONE working accent + decorative brights | One Physics · The Prove-It Gesture · Interaction as Argument |
| 8 | Dark Tech — the most cliched pick; justification mandatory | devtools, infra, security — audience genuinely lives dark | grotesque + mono; tinted near-black ground, ONE glow accent under 5% | Progressive Spectacle Tiers · Content-Derived Color · Invert the Genre Palette |
| 9 | Retro-Futurist | music, fashion, gaming, events, nostalgia products | extended or chrome-era display; ONE era palette (70s/80s/Y2K), never mixed | Invert the Genre Palette · One Material World · Fake-Depth Before Real Depth |
| 10 | Soft Depth | consumer SaaS, fintech, productivity, health apps | friendly grotesque; light tinted ground, 3–4 surface tints, hue-tinted shadows | Fake-Depth Before Real Depth · One Physics |
| 11 | Data-Dense Utilitarian | dashboards, analytics, admin panels, live-data products | mono or grotesque with tabular numerals; quiet ground, chroma reserved for data | Type as Evidence · Weight as a Feature · Semantic Motion Only · Framed Data |
| 12 | Art-House Immersive | portfolio showpieces, campaign microsites, film/music releases | experimental display at 10–20vw; cinematic deep grounds, imagery leads | The Persistent Hero Object · One Material World · Scroll-as-Camera · The Loader is the Overture · The Masked Cut |

Full entries: `references/CATALOG.md` — read only the shortlisted ones: `grep -n '^### ' <plugin>/skills/direction/references/CATALOG.md`, then Read with offset/limit. Each entry carries the full type/color/motion stances, the **Use for** list, the signature-move ideas, and the **Canon** line the table abbreviates.

## DIRECTION.md format

```md
# Direction — <archetype> (+ <twist, if any>)
**Why this, for this brief:** 2–3 sentences tied to audience + tone tension.
**Signature move:** <name> — <page + section it lives in> — <its budget/bounds>.
**Type stance:** the archetype stance, made concrete for this brief.
**Color stance:** ditto — name the ground tint, the accent family, the dark-mode intent.
**Motion stance:** ditto — durations, easing family, what never animates.
**References:** 2–3 named qualities to chase (not URLs to copy).
**We will NOT:** ≥5 entries — runner-up archetypes by name, tempting banned-list
items, out-of-scope effects. Gate-visual and gate-antislop enforce this list.
```

Any `taste` banned-list item this direction uses (Dark Tech's look, a retro gradient) carries its justification sentence here — this file IS the "unless DIRECTION.md explicitly justifies" mechanism.

## Anti-patterns

- `modern and clean` / `clean and modern` / `sleek` / `cutting-edge` as the direction — describes every site, so no site
- `minimalist with a touch of` — hybrid hedging; one archetype, one recorded twist
- DIRECTION.md with no `We will NOT` section — unenforceable direction is decoration
- Dark Tech with no justification sentence — the reflex pick, banned by default
- Two or more signature moves — five gestures means zero signatures
- Archetype chosen before BRIEF.md exists or without citing its tone tension
- Guided mode: DIRECTION.md written before the Approved line exists in design/MOCKUPS.md — the user's pick IS the commit
- A shortlist of three near-identical candidates handed to the mockup round — divergence is what makes the choice real
- Catalog stance pasted verbatim with no brief-specific concretization (which hue? which section? which words?)

## Worked example — Kaffeewerk Ost, Berlin roastery shop + subscriptions

Moved to `references/example.md` — read only when this build's case is genuinely ambiguous; the sections above are the decision material.

## Composes with

Moved to `references/composes.md` — the handoff map; load it when orchestrating this skill against its neighbors.
