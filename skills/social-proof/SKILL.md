---
name: social-proof
description: Design testimonial sections, logo walls, stat bands, and case-study teasers that read as genuine credibility instead of decoration — full attribution rules (name+role+company+face), monochrome logo-wall treatment at consistent heights, marquee discipline (pause on hover, static under reduced-motion), and honest-number rules for stats. Invoke during ultraweb Phase 6 when design/SITEMAP.md names a proof, testimonial, logos, stats, or trust section, or when the user asks for testimonials, customer quotes, reviews, a logo wall, "trusted by", "as seen in", social proof, stats bar, or case-study highlights.
---

# social-proof — proof that reads as true

**Stage:** Phase 6 — Build - **Reads:** design/BRIEF.md, design/SYSTEM.md, design/SITEMAP.md - **Writes:** components/sections/testimonials.tsx / logo-wall.tsx / stats.tsx / case-teaser.tsx (as SITEMAP.md names them)

## Standard

The bar: a visitor who has been burned by fake reviews believes this section. Fake-looking proof is worse than no proof — it actively spends trust. Concretely:

- Every testimonial carries full attribution: name + role + company, plus that person's real photo or a token-styled initials tile (§Attribution anatomy — never a generated portrait beside a real name). "John D." or role-only attribution is banned.
- Quotes are specific: a task, a number, a before/after. A quote that could sit on any competitor's site is filler.
- Logos are monochrome at one visual weight, normalized to consistent optical height — never a rainbow of mismatched bounding boxes.
- Stats are believable: max 4 per band; precise numbers ("2,340 teams") beat round bragging ("1M+ users") unless the round number is the actual fact. The award record is blunt (`award-canon`): a real number with a cited source out-persuades a decorated one — a framed or animated stat still needs its timeframe/source caption, or the frame is lipstick on fiction.
- Zero fabricated proof, period — not just from real companies. A testimonial no real person gave, a review count nobody counted, a star rating with no source is deception rendered in the site's own voice; a code comment doesn't make it honest, and "plausible" makes it worse. If BRIEF.md supplies no proof, don't manufacture it — walk the no-proof ladder below. The one sanctioned exception: a build whose design/BRIEF.md carries `Deployment mode: demo` or `Deployment mode: staging` may carry sample quotes, and each must be BOTH visibly labeled in the rendered UI ("Sample quote" / "Beispielstimme") AND tagged `UNVERIFIED-PROOF` in the source — gate-antislop and gate-content grep for that tag, and ship blocks production on any hit. Never name real brands the client hasn't earned.

## No proof yet — the honest ladder

A young product has no testimonials; it still has truths. In order of strength:

1. **Cut the section** — tell sitemap the proof section is deferred; an absent testimonial wall beats a fictional one, and the page's argument tightens without it.
2. **A founder's note** — signed with the founder's real name and face, stating why the product exists. It reads as conviction, not evidence, and that honesty is the credibility.
3. **Verifiable product facts** — "Every order ships from our Leipzig workshop within 48h", a public changelog, an uptime page. Facts a visitor could check out-persuade praise they can't. The facts must come from the prompt or the user's answers, never from §Assumed facts inventions — an invented "ships in 48h" is fabricated proof wearing a fact costume (brief's material-claims rule blocks it from production regardless).
4. **Guarantees and transparency** — a real refund policy, published pricing, a "how it's made" section. Skin in the game is proof of confidence. Real means user-confirmed: an assumed guarantee is a material claim, blocked from production until the user confirms it.

## The proof store — provenance as data

Real proof enters the build through ONE canonical store (`data/proof.ts`, or the CMS collection `content-cms` types) — never as string literals scattered through components:

```ts
export type ProofRecord = {
  status: "verified" | "sample";       // "sample" renders ONLY on staging/demo builds
  quote: string;
  attribution: { name: string; role?: string; company?: string };
  source: string;                      // URL, file, or contact record it came from
  permission: "confirmed" | "unknown"; // the client's right to publish it
  verifiedAt: string;                  // YYYY-MM-DD
};
```

- The rendered "Sample quote" label derives from `status === "sample"` — the component adds it, so no developer has to remember to.
- Every `status: "sample"` record carries `UNVERIFIED-PROOF` in the store file — the write-time hook and both gates grep it, and `ship` rejects every record whose status isn't `"verified"` on a production build, CMS-sourced data included. Rejecting non-verified records in the store is provable; guessing what "got bundled" is not.
- `permission: "unknown"` on a real quote BLOCKS a production ship (`site-check` and ship enforce `permission: "confirmed"` alongside the status check) — publishing praise without the confirmed right to publish it is its own harm. On staging/demo it is a handoff item.

## Process

1. Read BRIEF.md: what proof actually exists (quotes, customers, metrics, press)? Inventory it before designing around proof you don't have.
2. Pick the variant below that matches the proof inventory and DIRECTION energy — quantity of proof drives layout, not the other way around.
3. Build with SYSTEM tokens only: quote type from §type (quotes may run 1.125–1.5× body, never display size), spacing from §layout, borders/shadows from §depth.
4. Write or rewrite quotes with `ultraweb:copywriting` — trim to 15–40 words, keep the concrete detail, cut the adjectives.
5. Verify: screenshot at 375/1440, run the greppable anti-pattern sweep below.

## Variants

- **Single Spotlight** — one long, specific quote at 1.5–2× body size, attribution below, generous whitespace. Use when one killer quote exists; editorial/portfolio directions; placed just before the final CTA where doubt peaks.
- **Testimonial Wall** — 3–6 quotes in a masonry/column layout with deliberately varying card heights (uniform heights read as generated). Use for SaaS with plural audience segments; tag each quote's role so segments see themselves.
- **Logo Wall** — 5–12 customer/press logos, static grid or marquee (rules below). Normalize to a 24–32px optical cap height, not equal bounding boxes; monochrome via `grayscale opacity-70` or `currentColor` SVGs; optional full-color on hover.
- **Stat Band** — 3–4 numbers with labels in one row (stacks at 375px). Numbers at display weight with `tabular-nums`; consult `ultraweb:data-display` for numeral alignment. Use when metrics are the strongest proof. A single hero stat may take the Framed Data treatment (`award-canon`, mechanics owned with `ultraweb:data-display`): the count-up sits inside a thematic SVG mask/clip-path frame, static framed number as the reduced-motion fallback — real DOM text, never a canvas glyph. One framed figure per band, not four.
- **Case-Study Teaser** — logo + one result metric + one-line outcome + link to the full story. Use only when BRIEF.md has real case studies; the strongest variant when it's available.

## Placement

- Logo wall: directly under the hero — borrowed authority before the visitor scrolls into claims.
- Testimonials: after the feature story, where claims need a witness; one Single Spotlight just before the final CTA.
- Stat band: between feature sections as a rhythm break — it doubles as the compression beat in SYSTEM §layout's spacing rhythm.
- Never stack two proof sections back-to-back; interleave with substance or the proof reads as padding.

## Marquee rules

- Static grid by default; marquee only at ≥8 logos. Never marquee testimonials — text the user can't finish reading is hostile.
- CSS transform loop via an `--animate-*` token (keyframes in `@theme`), 30–60s per cycle, linear easing. Duplicate the track once for the seamless loop; the clone gets `aria-hidden="true"`.
- Pause on hover AND `:focus-within` (`animation-play-state: paused`) — WCAG 2.2.2 requires a pause for auto-moving content lasting over 5s.
- `prefers-reduced-motion: reduce` → render a static wrapped grid, not a paused marquee. A frozen half-cropped row looks broken.

## Attribution anatomy

Quote first, attribution after: name (medium weight, body size) · role, company (muted token, 0.875em) · avatar 36–44px, radius per SYSTEM §shape. The avatar beside a REAL attributed quote is that person's actual photo — or no photo at all (an initials tile styled from SYSTEM tokens); a generated portrait next to a real name is a false representation exactly like an invented quote. Generated portraits are lawful only on `status: "sample"` demo records, where the visible Sample label already declares the fiction. Never a default silhouette icon. Render via `next/image` with explicit `width`/`height` so the row never shifts.

## States

- Non-clickable quotes and logos get NO hover lift — hover affordance on a dead element is a lie.
- Case-study teasers (clickable): hover transform/opacity 150–250ms per SYSTEM §motion, `focus-visible` ring from palette tokens, active press state. The whole card is the link target.
- Logo hover: monochrome → full color at 150–200ms, optional, only when logos link somewhere.
- Loading: proof is static content in an ultraweb build — render it server-side, no skeleton. If proof comes from a CMS fetch, apply the all-states contract from `ultraweb:ui-states`.

## A11y

- Quote markup: `<figure>` wrapping `<blockquote>` + `<figcaption>` for attribution.
- Logos are content images: `alt="{Company} logo"`; the duplicated marquee track stays `aria-hidden`.
- Marquee pause must work from keyboard (`focus-within`), not hover alone.
- Stat labels are text, not color-coded; every number has a visible label.

## Anti-patterns

Greppable: `John D.`, `Happy Customer`, `Jane Doe`, `highly recommend`, `game changer`, `game-changer`, `best decision`, `Trusted by` followed by logos not in BRIEF.md, `★★★★★`.

- Star-rating rows pasted on every quote — unverifiable and emoji-adjacent.
- Auto-advancing testimonial carousel: a carousel hides proof, a wall shows it.
- Full-color logo soup at inconsistent sizes.
- Marquee with no pause mechanism or no reduced-motion fallback.
- Round-number inflation ("1M+ users") on a pre-launch brief.
- Three identical uniform-height quote cards in a row — the banned-list card pattern wearing a testimonial costume.

## Worked example — Loop & Thread, photo reviews as the proof

Moved to `references/example.md` — read only when this build's case is genuinely ambiguous; the sections above are the decision material.

## Composes with

Moved to `references/composes.md` — the handoff map; load it when orchestrating this skill against its neighbors.
