---
name: footer
description: Design and build the site footer as a designed closing statement, never a link dump — four named variants (oversized-type closer, columnar sitemap, minimal strip, CTA finale), sitemap/legal/social organization, and a newsletter row wired to a real server action. Invoke during the Build phase for any footer work — trigger phrases — "footer", "bottom of the page", "site footer", "newsletter signup", "legal links", "social links row", "closing section".
---

# footer — a designed ending, not storage

**Stage:** Phase 6 — Build - **Reads:** design/SYSTEM.md, design/SITEMAP.md, design/BRIEF.md - **Writes:** components/layout/footer.tsx

## Standard

The footer is the last thing a convinced visitor sees — the site's sign-off, with a point of view. First-grade means:

- A deliberate closing gesture: scale, a surface shift, or a final CTA. The page visibly ENDS; it never just trails off.
- Every link resolves — zero `href="#"`. Groups are labeled. The legal row is complete per BRIEF.md.
- The surface is a decision: footers often flip to the dark surface (or the inverse) — re-decided per taste's dark-mode rule, contrast verified on the flipped surface, both themes.
- A newsletter row (when BRIEF.md wants one) is a real designed form wired to a server action — never a decorative input.

## Process

1. Read BRIEF.md (legal requirements, social channels, newsletter yes/no) and SITEMAP.md — decide which pages earn footer links; not all do.
2. Pick a variant below by site energy; decide the surface (flip or continue) against SYSTEM tokens.
3. Order by attention, top to bottom: closing gesture → primary link groups → newsletter → social → legal strip.
4. State pass: link hover matches the nav vocabulary; newsletter input focus/error/success designed; social icons from lucide at one size and stroke width.
5. Verify: keyboard-tab the entire footer, compute contrast on the flipped surface, click every link.

## Variants

**oversized-type closer** — the brand name or a sign-off word at `clamp(4rem, 18vw, 16rem)`, tight tracking, often baseline-cropped by the viewport bottom edge as a deliberate cut; a slim link/legal row above it. When: portfolio, agency, fashion, any type-led direction — the strongest closing gesture available, and free asymmetry. Mark the giant word `aria-hidden="true"` when the brand name already appears in the legal row.

**columnar sitemap** — 3-4 labeled link columns plus a brand column. When: 8+ pages, SaaS with docs, e-commerce. Discipline: max 4 columns, 4-6 links each, group labels in the muted tone — a footer is not sitemap.xml.

**minimal strip** — one or two rows: wordmark, short nav, legal, social. When: one-pagers, portfolios, local business. A small site wearing a columnar footer looks like it is cosplaying a bigger one.

**CTA finale** — a full-width conversion moment ("Ready? Start your project.") with the primary CTA, then a compact link/legal strip below. When: SaaS/agency where the footer is the last conversion chance. The CTA repeats the hero's offer in the same primary style — one primary, still.

Baseline-cropped closer, the standard construction:

```tsx
<div className="overflow-hidden">
  <p aria-hidden="true" className="text-[clamp(4rem,18vw,16rem)] leading-[0.8] tracking-tighter translate-y-[12%]">
    STUDIO
  </p>
</div>
```

## Rules

- The seam is designed: the hand-off from the last section into the footer gets release space (96-160px) or a hard surface cut — never a default `py-24` drift.
- Scale discipline: the closing gesture takes 50-70% of footer height. Column links at 0.875-0.9375rem with relaxed leading; group labels 0.75-0.8125rem, uppercase or small-caps, muted tone.
- Responsive: 4 columns → 2 at 768px → single stack at 375px, groups and labels intact. The oversized word scales through its clamp() and never wraps — shorten the word, not the size.
- Touch: every footer link is a 44px hit target on mobile — pad the hit area, not the visual.
- Back-to-top affordance only on pages taller than ~4 viewports, built into the legal strip — never a floating circle button.
- Footer link hover uses the exact same move as the header nav (`ultraweb:micro-interactions` vocabulary); two vocabularies on one page reads as two sites.

## Content organization

- Legal strip: bottom row, smallest type that still passes AA. `© {new Date().getFullYear()} Brand` computed — never a hardcoded year. Privacy/terms/imprint links exactly as BRIEF.md requires.
- Social: lucide icons at one size (20px) and one stroke width, 44px hit targets, `aria-label` per icon, only channels the brand actually uses.
- Newsletter: visible label (never placeholder-as-label), single email field + button, zod-validated server action, inline success and error states — full pattern in `ultraweb:forms`.
- Landmarks: `<footer>` element; a nav inside it gets `aria-label="Footer"` so it does not collide with the header nav.

## Accessibility

- The footer introduces no stray page headings: group labels are either plain text or a consistent heading level under one (optionally visually-hidden) footer `<h2>` — never skipped levels.
- Contrast on the flipped surface computed for text, icons, AND the newsletter input's border and placeholder — muted tones that pass on light routinely fail on dark.
- Focus order follows visual order; the oversized `aria-hidden` word is never focusable and never announced.
- Newsletter errors are announced (`aria-describedby` on the input, live region for the result), not just painted red.

## Anti-patterns

- `href="#"` social or legal placeholders — real URL or the link doesn't ship.
- Hardcoded copyright year — greppable `© 20` followed by a literal year.
- "Made with ❤️" and emoji sign-offs — banned list.
- Link dump: every route ever built, unlabeled, five columns deep.
- Newsletter input with no wired action, no label, or no success state — decorative forms are lies.
- A footer with the same surface, spacing, and rhythm as every other section — the page just stops.
- 10px legal text failing contrast on the flipped surface.

## Worked example — Ledger & Lane, boutique law-firm footer

design/BRIEF.md: "Footer must carry NY & CT bar admissions and an attorney-advertising notice; the only social channel is LinkedIn." SITEMAP.md lists six routes — only four earn footer links.

Decision: **minimal strip**, not columnar — a two-partner firm wearing a columnar sitemap looks like it is cosplaying a hundred-lawyer practice. The footer flips to the ink-navy surface `oklch(0.25 0.02 260)` on warm-paper text `oklch(0.975 0.005 80)`; the muted-gold accent `oklch(0.72 0.09 85)` stays out — it is spent on the one contact CTA above, per the palette's one-gold-per-page rule. Closing gesture: the ruled-line signature lands its final full-width hairline, drawn in on scroll. Nav row is Practice · Attorneys · Insights · Contact in Public Sans at 0.9375rem; the legal strip is Public Sans at the smallest size that still passes AA on the ink surface:

```tsx
<footer className="bg-[oklch(0.25_0.02_260)] text-[oklch(0.975_0.005_80)]">
  {/* … nav + hairline closer … */}
  <p className="text-xs tracking-wide">
    © {new Date().getFullYear()} Ledger &amp; Lane LLP · Attorney Advertising ·
    Prior results do not guarantee a similar outcome.
  </p>
  <p className="text-xs tracking-wide">
    Attorneys admitted in New York &amp; Connecticut.
  </p>
</footer>
```

Rejected: the **oversized-type closer** (LEDGER at `clamp(4rem,18vw,16rem)`) — shouting the firm's name is ego, the opposite of Quiet Authority; restraint is the credibility here. No newsletter either: the brief never asked for one, and a decorative signup would be a lie.

Handoff: lands in `components/layout/footer.tsx`; `ultraweb:gate-content` verifies every link resolves (zero `href="#"`) and that the bar-admission and attorney-advertising copy is present and complete.

## Composes with

- ultraweb:copywriting — the sign-off line and newsletter microcopy carry the brief's voice to the last pixel.
- ultraweb:typography — display sizing and tracking rules for the oversized closer.
- ultraweb:forms — newsletter field design, validation timing, success/error states.
- ultraweb:server-actions — the newsletter mutation: zod validation, errors returned as data.
- ultraweb:sitemap — decides which routes earn footer links and how they group.
- ultraweb:gate-content — verifies every footer link resolves and the legal copy is complete.
