---
name: direction
description: Choose ONE aesthetic archetype from a catalog of 12 named directions — Editorial/Magazine, Swiss/International, Brutalist, Neo-grotesque Minimal, Warm Organic/Humanist, Refined Luxury Serif, Playful Geometric, Dark Tech (flagged as the most cliched pick), Retro-Futurist, Soft Depth, Data-Dense Utilitarian, Art-House Immersive — each with typography, color, and motion stances, when-to-use guidance, and signature-move ideas. Selects ONE signature move and writes design/DIRECTION.md including a mandatory "we will NOT" list. Invoke as Phase 2 of the ultraweb pipeline once design/BRIEF.md exists, whenever a build needs its aesthetic committed ("what style should this site be", "pick a design direction", "give it a point of view"), or when a design reads generic and needs one direction chosen and pushed.
---

# direction — commit to one aesthetic

**Stage:** Phase 2 — Direction - **Reads:** design/BRIEF.md (+ the `taste` constitution) - **Writes:** design/DIRECTION.md

## Standard

This is the highest-leverage decision of the build. A first-grade direction is ONE archetype from the catalog below, executed 20% past comfortable; ONE named signature move with a location and a budget; and a "we will NOT" list of ≥5 real temptations. The test: a stranger reading DIRECTION.md could sketch the homepage. If two different archetypes could have produced the same DIRECTION.md, it is not a direction — it is a hedge, and per `taste`, timid design that hedges reads as no design.

## Process

1. Read design/BRIEF.md: site type, energy budget, audience, tone tension. Do not touch the catalog before this — archetype-first is taste applied to nothing.
2. Shortlist 2–3 archetypes whose **Use for** matches the site type. The tone tension usually decides between them ("warm but exact" → Warm Organic vs Swiss; the tension says: Swiss grid, warm palette twist).
3. Tiebreak per `taste`: the direction more specific to THIS brief wins; if still tied, the one whose signature move you can execute strongest within the energy budget.
4. Dark Tech check: if it made the shortlist, attempt to disqualify it first. Was it chosen because the audience genuinely lives in dark terminals — or by reflex? It survives only with a written justification sentence in DIRECTION.md.
5. Commit to ONE. A deviation is allowed as one recorded twist ("Swiss, on warm paper instead of white") — never a 50/50 hybrid. Mixing two archetypes is choosing none.
6. Choose ONE signature move — from the archetype's ideas or invented — sized to the energy budget. Name it, place it (page + section), and bound it (what it may cost: one canvas scene, one scroll sequence, one typographic gesture). One move; the rest of the site stays disciplined so it can sing. Consult the archetype's **Canon** line (and `award-canon`'s per-archetype map): it names the reference winners — qualities to chase, never URLs to reskin — and the canon pattern whose *principle* the move borrows. Those pattern names are the vocabulary for the References line.
7. Write the "we will NOT" list, ≥5 entries, drawn from three sources: (a) the runner-up archetypes by name, (b) every `taste` banned-list item this direction will be tempted by (glassmorphism for Soft Depth, gradient text for Retro-Futurist, glow-everything for Dark Tech), (c) effects and scope explicitly out (no parallax, no dark mode hero video, no second accent).
8. Write design/DIRECTION.md in the format below. Re-read it against the `taste` banned list: any banned item that appears must carry its justification sentence inline, or it goes.

## The catalog — 12 archetypes

### 1. Editorial / Magazine
- **Type:** high-contrast display serif at 4–6× body for headlines; grotesque or humanist sans body at 60–75ch measure; caps eyebrows with +0.08em tracking; pull quotes and drop caps that earn their place.
- **Color:** paper — warm off-white ground (oklch L≈0.97, warm hue), near-black ink, ONE editorial accent (oxblood, cobalt, or signal-red family) on <5% of the surface.
- **Motion:** restrained — 150–200ms micro only; at most one 400ms fade-up per section; no parallax.
- **Use for:** editorial/content sites, magazines, newsletters, long-form marketing, thought-leadership.
- **Signature moves:** oversized issue-number/date typography as section markers; a full-bleed pull quote at 8–12vw between sections; visible hairline column rules as permanent structure.
- **Canon** (`award-canon`): Type as Evidence + Type as the Image make the words the picture; Scroll-as-Journey paces the long read — chase The Other Side of Truth's documentary conviction (SOTY 2022).

### 2. Swiss / International
- **Type:** one neo-grotesque family, 2 weights, nothing else; hard scale jumps (hero 5–8× body); flush-left rag-right; −0.02em tracking on display.
- **Color:** white/black + ONE saturated primary (signal red, cobalt, or yellow); flat — no gradients, no shadows, depth via borders.
- **Motion:** instant-feeling — 150ms ease-out micro; reveals slide strictly on grid axes (x or y, never diagonal); no springs.
- **Use for:** agencies, studios, architecture, conferences, portfolios that want authority.
- **Signature moves:** visible grid lines as permanent chrome; giant vertically-set labels along viewport edges; index-list hover where rows swap one shared image preview.
- **Canon** (`award-canon`): Type as the Image + The Three-Token Contract — a monochrome frame with chroma entering only through content, Synchronized Studio's discipline (SOTD 2020).

### 3. Brutalist
- **Type:** system mono or an aggressive grotesque; ALL-CAPS headers; hero up to 10–15vw; 3–4px underlines; default-blue links allowed as a statement.
- **Color:** pure white/black plus one clashing accent (acid green, cyan); 1–2px solid borders everywhere shadows would be.
- **Motion:** abrupt — 150ms at linear or steps(); hover states swap rather than fade; marquees ≤60px/s so they stay readable.
- **Use for:** art projects, fashion drops, music, event one-pagers, attention-courting portfolios. Never trust-critical domains (finance, health, legal).
- **Signature moves:** hard-positioned cursor-following element; overlapping z-index collage hero; exposed metadata (file sizes, timestamps, coordinates) as decoration.
- **Canon** (`award-canon`): Type as the Image at heroic scale; add at most one Prove-It Gesture as the deliberate interaction (KPR/Resn's press-and-hold, SOTY 2022) — never a wall of them.

### 4. Neo-grotesque Minimal
- **Type:** single grotesque, 2 weights max; hero 3.5–4.5× body — big but calm; body line-height 1.6–1.7; near-zero tracking.
- **Color:** tinted neutral ramp of 8+ steps; the accent nearly invisible — interactive elements only; contrast comes from spacing, not color.
- **Motion:** soft and slow — 200–250ms micro, 500–700ms reveals, one expo-style ease-out family; opacity + 8–12px translate only.
- **Use for:** SaaS/product, developer tools, premium services, designers who don't need to shout.
- **Signature moves:** one enormous whitespace gap (2–3× normal section spacing) before the key claim; single-word section headers at display scale; 1px hairline dividers as the only ornament.
- **Canon** (`award-canon`): Type as Evidence + The Three-Token Contract + One Physics + Semantic Motion Only — Lusion v3's quiet shell, loud disciplined motion (SOTY 2023).

### 5. Warm Organic / Humanist
- **Type:** rounded or humanist sans, or a soft serif; hero 3.5–4× body; comfortable leading; nothing sharp.
- **Color:** earth-tinted neutrals (cream, clay, sage) in oklch warm hues; ONE working accent (terracotta/clay family) for CTAs; sage or ochre as supporting surface tints, never interactive.
- **Motion:** gentle low-stiffness springs; 250ms micro; reveals scale from 0.97 + fade; nothing snaps.
- **Use for:** local businesses, food/hospitality, wellness, crafts, community orgs, nonprofits.
- **Signature moves:** hand-drawn SVG underline or circle on the key word of the headline; 3–5% opacity grain/paper texture overlay; per-brief cut organic section dividers (drawn for this site — a template wave is slop).
- **Canon** (`award-canon`): One Material World (one hand-made primitive site-wide) + Invert the Genre Palette + Semantic Motion Only's living idle — Nomadic Tribe's gouache warmth (SOTY 2019).

### 6. Refined Luxury Serif
- **Type:** high-contrast or old-style display serif at weight ≤500; hero 4–5× body but airy; labels in letter-spaced caps (+0.15em) or small caps; serif body welcome.
- **Color:** near-monochrome — espresso/charcoal ink on ivory; metallic tones only as hairlines or small marks, never large fills; dark mode reads candlelight, not black.
- **Motion:** slow and smooth — 400–700ms reveals on a long ease-out; hover image scale 1.0→1.04; nothing bounces, ever.
- **Use for:** luxury goods, high-end hospitality, jewelry, architecture, premium real estate, fine dining.
- **Signature moves:** display type set INTO full-bleed imagery; a 4–6s hero image cross-fade sequence; a caps wordmark pinned to the viewport edge on scroll. Symmetry may lead here — but `taste` still requires one deliberate asymmetric moment.
- **Canon** (`award-canon`): Type as Evidence + One Physics (weighted-fluid easing reads "expensive") + The Persistent Hero Object, all held by The Three-Token Contract's near-monochrome.

### 7. Playful Geometric
- **Type:** geometric sans, heavy display weights (700–900), rounded terminals welcome; hero 4–6× body; chunky throughout.
- **Color:** light neutral ground + ONE working accent for CTAs; 2–3 further saturated brights (oklch C 0.15–0.2) as decorative shape/section fills only; color-blocked sections instead of gray dividers.
- **Motion:** springy — visible overshoot; hover scale 1.05 with ±2–3° rotation; 40–80ms staggered entrances, hero only.
- **Use for:** kids/education, consumer apps, creative tools, festivals, brands selling fun.
- **Signature moves:** oversized geometric shapes bleeding off-canvas behind content; physical squash on press (scale 0.95 active); one shape-scale element that reacts to the cursor (via `physics`).
- **Canon** (`award-canon`): One Physics (springy overshoot) + The Prove-It Gesture + Interaction as Argument — Don't Board Me's cartoon physics (Users'-Choice SOTY 2024).

### 8. Dark Tech — WARNING: the most cliched choice
The dark-navy-glowing-accents look is the `taste` banned list's "AI startup template". Picking it requires a written DIRECTION.md justification — the audience genuinely lives in dark IDEs/terminals, or the brand already lives dark — plus a differentiating execution. When in doubt, take Neo-grotesque Minimal with dark mode leading instead.
- **Type:** grotesque + mono pairing — mono for labels, data, and real code set properly; hero 4–5× body.
- **Color:** near-black tinted ground (oklch L 0.15–0.20 with a hue, never pure #000); ONE glow accent on <5% of the surface; borders at 8–12% white; purple-to-blue gradients stay banned.
- **Motion:** precise — 150–200ms; terminal-flavored reveals (typing, scan) only if the product is genuinely dev-native; restraint is what separates it from the template.
- **Use for:** developer tools, infrastructure, security, CLI products — only when the audience lives there.
- **Signature moves:** a real running terminal/code demo as the hero (actual product, not decoration); low-contrast ambient log-tail animation; keyboard shortcuts surfaced as visible UI.
- **Canon** (`award-canon`): Progressive Spectacle Tiers (DARK/Netflix, Users'-Choice SOTY 2020) + Content-Derived Color (Active Theory v4, SOTY 2018); the escape from the cliché is Invert the Genre Palette — Star Atlas went light and warm.

### 9. Retro-Futurist
- **Type:** extended/wide grotesque or chrome-era display; caps at +0.1em tracking; mono details for the "system" flavor.
- **Color:** commit to ONE era, never mixed — 70s (orange/brown/cream), 80s (chrome + sunset tones), Y2K (silver, bubble gloss). An 80s sunset gradient touches the banned list — usable only with the explicit DIRECTION.md justification this archetype provides, and never as gradient body text.
- **Motion:** era-appropriate at 200–250ms micro; chrome shine sweeps, subtle scan lines; no true flashing (WCAG 2.2), reduced-motion path mandatory.
- **Use for:** music/entertainment, fashion, gaming, event brands, nostalgia-trading products.
- **Signature moves:** chrome-gradient treatment on the ONE hero headline only; a grid-horizon or starfield canvas backdrop (gated by `showpiece`); era-correct sticker/badge cluster elements.
- **Canon** (`award-canon`): Invert the Genre Palette + One Material World (analog grain) + Fake-Depth Before Real Depth — Prometheus Fuels' warm-analog conviction (SOTY 2021).

### 10. Soft Depth
- **Type:** friendly grotesque or humanist sans, medium weights; hero 3.5–4.5× body.
- **Color:** light tinted ground with 3–4 layered surface tints as elevation steps; mid-chroma accent; shadows TINTED with the ground hue, never gray-on-white; 2–3 elevation levels max.
- **Motion:** smooth lift — hover raises elevation (shadow + 2–4px translate-y) in 200ms; layered parallax capped at 8–12px offsets; light springs.
- **Use for:** consumer SaaS, approachable fintech, productivity tools, health apps.
- **Signature moves:** floating product-UI card collage hero at slight z-offsets; a consistent light-source narrative — every shadow cast from one angle site-wide; pressed-state surfaces that go inset. Glassmorphism stays banned; this archetype is its disciplined replacement, not its excuse.
- **Canon** (`award-canon`): Fake-Depth Before Real Depth (layered 2D, baked light, matcaps — "no lights, just illusions") + One Physics — Bruno Simon's warm faux-3D (SOTY 2019).

### 11. Data-Dense Utilitarian
- **Type:** mono or grotesque with tabular numerals mandatory; body 14px minimum, leading 1.4; caps labels at 11–12px +0.06em; the hero still hits the 3.5× `taste` floor — everything else stays small.
- **Color:** quiet tinted ground; chroma reserved for data semantics (status, deltas, categories) — chart colors ARE the palette; AA verified at small sizes, not eyeballed.
- **Motion:** near-none — 150ms state changes; numbers tick; zero decorative reveals; skeletons match real layout exactly (`ui-states`).
- **Use for:** dashboards, analytics, pro fintech, admin panels, consoles, live-data products.
- **Signature moves:** a live-updating stat or feed as hero proof; one dense table treated as the typographic centerpiece; row counts, timestamps, and coordinates as designed chrome.
- **Canon** (`award-canon`): Type as Evidence + Weight as a Feature + Semantic Motion Only; embody a hero stat with Framed Data (the number in a thematic SVG frame — real DOM text + static fallback) — Orano's instrument aesthetic (Dev SOTY 2018).

### 12. Art-House Immersive
- **Type:** experimental display faces at 10–20vw — type as image; body text minimal and staged, appearing in defined moments.
- **Color:** cinematic — deep grounds, imagery leads; palettes may shift per scene, but every scene keeps the one-working-accent discipline and all values stay in `@theme` tokens.
- **Motion:** the medium itself — scroll-driven scenes and canvas/WebGL set pieces carry 60–70% of the design effort; 60fps verified on mid hardware, static fallback mandatory, reduced-motion serves full content statically (`showpiece` gates all of it).
- **Use for:** portfolio/agency showpieces, campaign microsites, film/music releases. Never conversion-critical or content-heavy sites.
- **Signature moves:** a scroll-scrubbed frame or 3D sequence as the narrative spine; display type that assembles or distorts with scroll velocity (`physics`); one continuous scene morphing across all "pages" (`page-transitions`).
- **Canon** (`award-canon`): The Persistent Hero Object + One Material World + Scroll-as-Camera + The Loader is the Overture + The Masked Cut, all under Progressive Spectacle Tiers + Weight as a Feature — Igloo (SOTY 2024), Lusion v3 (SOTY 2023). Borrow the principle; the canvas-only surface rarely lasts.

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
- Catalog stance pasted verbatim with no brief-specific concretization (which hue? which section? which words?)

## Worked example — Kaffeewerk Ost, Berlin roastery shop + subscriptions

design/BRIEF.md: "Single-origin roastery, e-commerce (shop + `/abo` subscriptions). Tone tension: craft and tactile, but it has to sell — a workshop, not a supermarket shelf."

Shortlist: Warm Organic/Humanist vs Swiss/International. The "tactile but exact" tension tempts Swiss, but Swiss's flat white + signal-red grid reads as a supermarket circular — craft warmth beats grid authority for a roastery. So **Warm Organic/Humanist**, pushed 20% past comfortable (real paper grain, not a hint of it); no recorded twist needed.

Signature move: **the roast-profile temperature curve** — a hand-drawn SVG rise-and-plateau path — lives on `/` as the hero's spine and recurs as the section divider. Budget: ONE reusable path, no per-section variation, scroll draw-in only.

Type stance: Fraunces (display, hero ~4× body) + Work Sans (body, 1.6 leading). Color stance: warm tinted neutral ground `oklch(0.97 0.008 75)` → ink `oklch(0.24 0.02 60)`, ONE accent rust `oklch(0.62 0.16 45)` on CTAs and price only; dark mode reads roasted, not black.

We will NOT (excerpt): borrow Swiss's signal-red or flat grid; add a second accent; write dead startup copy — voice stays sensory and direct ("Röstung No. 14. Washed Yirgacheffe. Apricot, black tea, honey."); smear glassmorphism; add parallax.

Rejected: Refined Luxury Serif — it would make €18 beans feel like a €180 bottle; the brief wants approachable craft, not hushed luxury.

Handoff → design/DIRECTION.md. ultraweb:color, ultraweb:typography, and ultraweb:motion-language concretize the three stances into SYSTEM.md; ultraweb:shape-language systematizes the temperature curve; ultraweb:wireframe places it in the hero of `/`.

## Composes with

- ultraweb:taste — the constitution; every stance above operates inside its required list, and step 8's banned-list re-read is non-negotiable.
- ultraweb:brief — upstream; site type, energy budget, and tone tension drive the shortlist.
- ultraweb:color, ultraweb:typography, ultraweb:motion-language — translate the three stances into SYSTEM.md decisions; they concretize, never re-decide.
- ultraweb:wireframe — places the signature move in a concrete section of a concrete page.
- ultraweb:showpiece — executes any canvas/3D signature move under its 60fps + static-fallback gate.
- ultraweb:gate-visual — judges every screenshot against DIRECTION.md; the We-will-NOT list is its checklist.
- ultraweb:gate-antislop — enforces the We-will-NOT list's banned-list items empirically (grep + screenshots); direction's step 8 re-read is what it later verifies shipped clean.
- ultraweb:physics — when the chosen signature move is cursor- or scroll-velocity-driven (Playful Geometric, Art-House), direction hands it the motion spec and physics owns the spring/inertia execution.
- ultraweb:shape-language — direction names the signature SVG/shape motif (e.g. the roast-curve divider); shape-language systematizes it into reusable primitives so it recurs consistently.
- ultraweb:award-canon — consulted when picking references and the signature move: each archetype's **Canon** line and the per-archetype map supply the reference winners and the pattern-name vocabulary; borrow the principle, never a winner's surface.
