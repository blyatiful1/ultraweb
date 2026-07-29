---
name: taste
description: The ultraweb design constitution — what first-grade means, the anti-slop banned list, required qualities, and decision heuristics. Invoke FIRST before any ultraweb design or build work, whenever judging whether a design is good enough, or when any other ultraweb skill references "the constitution" or "taste".
---

# taste — the constitution

Every ultraweb skill is subordinate to this file. When a component skill and this file conflict, this file wins.

## What first-grade means

A first-grade site looks like a design studio charged real money for it. The test: could this win a site-of-the-day mention, or at least not embarrass itself next to one? Concretely, it has:

1. **A point of view.** One committed aesthetic direction, chosen for THIS brief, executed consistently. Timid design that hedges between directions reads as no design.
2. **One signature move.** A single memorable, unexpected element — a typographic gesture, a scroll moment, an interaction, a layout inversion. One, not five. The rest of the site is disciplined so the signature can sing. A signature may be site-scale rather than section-scale — one continuous world the whole site inhabits is still ONE move, and it consumes the entire budget: nothing else on that site gets a second gesture.
3. **Typographic conviction.** Type does most of the design work. Real pairing, real scale contrast (hero display sizes should feel almost too big), tight tracking on large text, generous line-height on body.
4. **Restraint.** The strongest tool. Fewer colors, fewer effects, fewer weights than feel safe. If everything is bold, nothing is.
5. **Craft in the last 2%.** Optical alignment, consistent icon stroke widths, focus rings that match the palette, selection color set, scrollbar considered, favicon real.

## The banned list (anti-slop)

These patterns mark a site as AI-generated filler. They are BANNED unless `design/DIRECTION.md` explicitly justifies one:

- Purple-to-blue (or pink-to-violet) gradient as the primary aesthetic; gradient text on headlines as a default move
- Untouched shadcn/ui look: default radius, default slate palette, default Inter, default shadows — shadcn is a primitives library, not a design
- Emoji as icons or bullet decorations; ✨🚀🎉 anywhere in production copy
- Three identical icon-cards in a row as the default "features" section
- "Welcome to", "Elevate your", "Unlock the power of", "Seamlessly", "Empower" — dead startup copy
- Lorem ipsum, placeholder.com images, `href="#"`, "Feature 1"
- Glassmorphism smeared over everything; `backdrop-blur` as a personality substitute
- `rounded-xl` + `shadow-lg` on every element uniformly — depth without hierarchy
- Every section centered, same width, same padding — wallpaper rhythm
- Dark-navy-with-glowing-accents "AI startup" template look, applied regardless of brief
- Animations on everything: staggered fade-up on every element makes motion meaningless

## The required list

Non-negotiable in every build, regardless of direction:

- **OKLCH palette** built in `color`: one dominant neutral family (usually warm or cool tinted, rarely pure gray), ONE accent doing real work, semantic tokens for both themes. AA contrast verified, not eyeballed.
- **Dark mode is a first-class design**, not an inversion filter — re-decided per surface.
- **Spacing rhythm** on a base unit (4px), with section spacing that VARIES deliberately — compression and release, not uniform `py-24`.
- **At least one deliberate asymmetry** — an offset grid, a bleeding image, an overlapping element. Perfect symmetry everywhere is the smell of no decisions made.
- **Type scale with real contrast**: hero display ≥ 3.5× body size on desktop; fluid via `clamp()`.
- **Motion vocabulary from `motion-language`**: micro 150–250ms, section reveals 400–700ms, springs for anything physical, one easing family site-wide, `prefers-reduced-motion` always honored.
- **Real content**: every string written for this brief in its voice. Copy is design.
- **States**: hover, focus-visible, active, disabled, loading, empty, error — designed, not defaulted.
- **Accessibility floor**: WCAG 2.2 AA. Beauty that excludes users is a defect, not a style.

## Decision heuristics

- **Site type → energy budget.** SaaS/product: clarity first, one wow moment. Portfolio/agency: the site IS the portfolio — spend boldly. E-commerce: product imagery leads, chrome recedes. Editorial/content: typography is 80% of the design. Local business: warmth and trust beat cleverness.
- **When two options tie, pick the more specific one.** A choice that only works for this brief beats one that would work anywhere.
- **Distinctiveness comes from commitment, not addition.** Push the chosen direction 20% past comfortable rather than adding a second direction.
- **Whitespace is not empty; it is emphasis budget.** What you give room to is what the user reads as important.
- **If a section looks boring, the fix is hierarchy or asymmetry — not another effect.**
- **3D, shaders, canvas only when**: the direction demands it, it runs 60fps on mid hardware, and there's a static fallback. A fast plain site beats a janky impressive one, always. The default scale is ONE set piece (`showpiece`); a site whose direction is immersion *itself* — where the scene is the medium, not an element in it — is the rare exception, commissioned in writing by `direction` at archetype 12, gated by `ultraweb:set-design`, and held to every condition above at **every route**, not just the hero.
- **Spectacle never outscores usability.** Site-of-the-day winners average high across design AND usability AND content at once — the classic losing move is creativity bought with unusable navigation or a 20MB load. Never trade a usability point for a wow point.
- **Craft the corners.** The last 2% — 404, loader, empty states, footer — is where site-of-the-day is won or lost. A flawless hero over an unfinished inner page reads as a template.
- **The study library behind these calls is `award-canon`** — 30+ Awwwards SOTY/SOTD dossiers distilled to named patterns and the jury model; consult it for references and signature-move precedent, never to override this file.

## Position in the system

**Stage:** every phase — invoked FIRST by the root pipeline, consulted whenever any skill says "the constitution" - **Reads:** nothing - **Writes:** judgment, not files.

- ultraweb:award-canon — the study library behind this file's judgments: `taste` is what good means for us, `award-canon` is what the Awwwards record proves. `direction` consults it for references and signature-move precedent; `design-judge` scores against its invariants. It never overrides this file.
- ultraweb:direction — the only skill allowed to grant exceptions to the banned list, and only in writing (design/DIRECTION.md).
- ultraweb:gate-antislop — enforces the banned list empirically (grep + screenshots); a taste violation that ships is a gate failure, not a style choice.
- ultraweb:gate-visual — scores against the required list via the `design-judge` subagent (Opus 5), which quotes this file in its rubric.
- ultraweb:retrofit — audits existing sites against this file to produce the gap report.
- ultraweb:iterate — checks every requested change against this file before classifying it; "make it pop" is answered from here.

## Stack lock

All ultraweb skills build on ONE stack — never substitute without the user asking:
Next.js 16+ (App Router, TypeScript strict, Turbopack) · Tailwind CSS v4 (`@theme` tokens in `app/globals.css`) · shadcn/ui as restyled primitives · `motion` (motion.dev, import from `motion/react`) for animation · lucide-react icons · next/font with self-hosted variable fonts · zod v4 for validation. Backend defaults: Drizzle + Postgres, Better Auth, Resend, Stripe — pulled in only when the brief needs them (see the backend-tier skills). Exact verified versions, APIs, and gotchas live in the plugin's `STACK.md` — code advice must match it.

`motion` stays THE animation library — lifecycle, gestures, springs, layout, reveals. Exactly ONE specialist **animation** engine may join it: **anime.js**, for SVG choreography (multi-path timelines, morph, motion path, scroll-scrubbed vector sequences), installed only when `design/DIRECTION.md` commissions that moment BY NAME — the same construction as `showpiece`'s WebGL gate, and the same answer when nothing commissioned it: no. A **renderer** is a different category: three.js/R3F draws a scene, it does not animate the DOM — no timeline, no easing library, no property animator — and it enters only through `showpiece`'s one-set-piece gate or, for a site whose direction IS the scene, `ultraweb:set-design`'s site-scale gate, on the same written commission and the same 60fps + static-fallback + reduced-motion conditions. An uncommissioned second animation runtime is slop with a package.json entry; an uncommissioned renderer is the same slop an order of magnitude heavier. The engines weighed and rejected are argued once in `STACK.md`.
