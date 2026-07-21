---
name: buttons
description: Build the button/CTA system — primary/secondary/ghost/destructive hierarchy with the one-primary-per-view rule, a four-step size scale, icon placement rules, and the full state matrix (default, hover, active, focus-visible, disabled, loading) with concrete transforms and timing. Invoke during the Build phase when creating or restyling components/ui/button.tsx, wiring any CTA, submit, or icon button, or when the user says "the buttons feel dead", "add a loading state", "fix the CTA hierarchy", or buttons are shipping with default shadcn styling.
---

# buttons — every state decided, one primary

**Stage:** Phase 6 — Build - **Reads:** design/SYSTEM.md, app/globals.css - **Writes:** components/ui/button.tsx (restyled variants) + CTA usage rules

## Standard

Buttons are the most-touched component on the site and the fastest tell of default-shadcn slop. First-grade: `npx shadcn@latest add button`, then RESTYLE — radius from the shape language, colors from the token bridge, focus ring palette-matched (taste requires it). Exactly three visual weights plus destructive; all six states explicitly designed; nothing left to browser or library defaults. React 19: the generated file has no forwardRef and carries `data-slot="button"`.

## Process

1. Read SYSTEM.md: accent, radius, easing tokens, and the depth language for filled surfaces.
2. Restyle the generated button.tsx: extend its variant map in place — verify the generated file's shape first; never ad-hoc className soup at call sites.
3. Choose ONE hover motif (see state matrix) and encode it in the component.
4. Wire the size scale and icon slots; add the loading state with locked width.
5. Sweep every view for the one-primary rule; demote extras to secondary/ghost.
6. Keyboard-walk every variant: visible ring on all of them, including ghost and icon-only.

## Hierarchy — one primary per view

- **primary** — filled accent. ONE per viewport-height region. The sticky header CTA is the single exemption (it is the site-wide primary); every section owns at most one more.
- **secondary** — outline or subtle neutral fill; the "also fine" action. Pairs with primary in heroes.
- **ghost** — text-weight with a hover surface; tertiary actions, toolbars, icon buttons.
- **destructive** — actual destruction only; never for "cancel".

Two filled buttons side by side = no hierarchy. A CTA that navigates renders as an `<a>` (next/link) carrying the button variant classes — never a `<button>` that pushes a route.

## Size scale

| size | height | padding-x | text | icon |
|---|---|---|---|---|
| sm | 32px (h-8) | 12px | 0.875rem | 16px |
| md (default) | 40px (h-10) | 20px | 0.875-1rem | 16px |
| lg | 48px (h-12) | 24px | 1rem | 20px |
| xl (hero only) | 56px (h-14) | 32px | 1.125rem | 20px |

Mobile touch targets ≥44px: primary mobile CTAs use lg, or md with an expanded hit area (`relative after:absolute after:-inset-1` — the button must be positioned for the pseudo-element to anchor to it); sm never ships as a mobile primary. Icon-only buttons are square at each height and REQUIRE `aria-label`.

## State matrix — concrete, site-wide

Transition ONLY transform, background-color, border-color, box-shadow — never `transition-all`.

- **default** — rest. The designed baseline, not the library's.
- **hover** — 150-200ms on the SYSTEM easing token. Motif options: background one step darker/lighter (ΔL ≈ 0.04 in oklch), lift translate-y -1px, or trailing-arrow nudge translate-x 2px. Pick ONE motif for all buttons.
- **active** — 80-100ms, deliberately faster than hover: press is feedback, not animation. Scale 0.98 or lift returns to 0; release snaps back at the hover duration.
- **focus-visible** — `focus-visible:ring-2` + `ring-offset-2`, ring in the palette-matched color SYSTEM defines. Never `outline-none` without this replacement. Same ring on `<a>` buttons.
- **disabled** — opacity 60% + `cursor-not-allowed`; label stays ≥3:1 readable. Disabled means "this action is not available" — NOT async pending; that's loading.
- **loading** — lucide `LoaderCircle` with `animate-spin` replaces the leading icon (or slots before the label); label swaps to the progress verb ("Saving…"); width LOCKED via min-width so nothing jumps; `disabled` + `aria-busy="true"`. Icon-only: spinner replaces the icon and the `aria-label` updates. Form submits get pending for free via `useFormStatus()` from `'react-dom'` inside the form.

Under `prefers-reduced-motion`, movement motifs (lift, nudge, press scale) drop to the background/border color shift; the loading spinner may remain as essential status feedback (or swap to a static/pulsing indicator). Policy per `ultraweb:motion-language`.

## Icon placement

- Leading icon describes the action (Plus, Download, Send). Trailing icon shows direction or consequence (ArrowRight, ExternalLink, ChevronDown). Never both on one button.
- 8px gap between icon and label; icon size per the scale table; stroke width consistent per `ultraweb:icons`.
- The trailing-arrow hover nudge (translate-x 2-3px, 150ms) is a strong default motif for link-style CTAs — but it counts as THE site hover motif if chosen.

## Engineering

- Buttons are server-component-safe as generated. Motion-driven press physics (`whileTap` from `motion/react`) needs `"use client"` — plain CSS `:active` covers 95% of cases; escalate only via `ultraweb:micro-interactions`.
- Label copy comes from `ultraweb:copywriting`: verb + object ("Start free trial", "Book a table") — never "Submit", "Click here", "Learn more".

## A11y

- Real semantics: `<button type="submit|button">` or `<a href>` — never `<div onClick>`.
- Focus-visible ring on EVERY variant, ghost and icon-only included.
- Text on filled primary ≥4.5:1 computed — `ultraweb:color` owns the math.
- Loading announces itself: `aria-busy="true"` plus the visible label change.
- Touch targets ≥44px on mobile — gate-responsive verifies.

## Anti-patterns

- `transition-all` — animates properties you never chose.
- `hover:scale-110` — a button ballooning 10% is a toy, not a control.
- `outline-none` or `focus:outline-none` without a focus-visible ring.
- Two filled primaries visible together in one view.
- `Submit`, `Click here`, `Learn more` as labels — dead copy (banned list).
- `<div onClick=` or `<span onClick=` masquerading as a button.
- Spinner-only loading on a labeled button — width jump plus a vanished label.
- Gradient-filled primary as the default look — banned unless DIRECTION.md justifies it.

## Worked example — Framewalk, indie game studio Steam launch site

design/SYSTEM.md hands down `--color-accent: oklch(0.78 0.15 160)` (phosphor), `--radius-md`, the `--ease-standard` easing token, and one hard brief rule: "Wishlist on Steam" is the only filled button that may appear anywhere.

That makes the one-primary rule literal — exactly one `primary` renders per view, always the wishlist CTA. It fills phosphor with a near-black label `oklch(0.16 0.02 200)` (clears 4.5:1 easily; `ultraweb:color` owns the check), hero size `xl` (h-14); the sticky-header wishlist button (size `md`) is the site-wide primary the one-per-view rule exempts. Single hover motif everywhere: fill lightens ΔL +0.04 to `oklch(0.82 0.15 160)`, no lift — atmospheric dark wants glow, not bounce.

```tsx
// components/ui/button.tsx — primary variant, restyled from SYSTEM.md
primary:
  "bg-accent text-[oklch(0.16_0.02_200)] rounded-md " +
  "hover:bg-[oklch(0.82_0.15_160)] active:scale-[0.98] " +
  "focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-[oklch(0.16_0.02_200)] " +
  "transition-[background-color,transform] duration-150 ease-standard",
```

So the launch-news email capture submit can NOT be filled: it renders `secondary` (outline phosphor), its `useFormStatus()` pending state swapping "Notify me" → "Adding…" behind a `LoaderCircle animate-spin`, min-width locked. Rejected: pairing the wishlist CTA with a filled "Read the devlog" — killed on sight, since a second filled weight breaks the brief, so devlog links demote to `ghost`.

Handoff: the restyled `components/ui/button.tsx` lands for `ultraweb:hero` to place the xl "Wishlist on Steam" over the parallax fog, and for `ultraweb:forms` to wrap the `secondary` submit in the email-capture server action.

## Composes with

- ultraweb:tokens — consumes color/radius/ease tokens; never hardcode values the system defines.
- ultraweb:color — accent selection and the 4.5:1 contrast math on filled variants.
- ultraweb:copywriting — every label is written copy, not developer text.
- ultraweb:forms — submit wiring, useFormStatus pending, and error recovery around the button.
- ultraweb:hero — the primary+secondary CTA pair and xl sizing live there.
- ultraweb:micro-interactions — spring/physics press feedback beyond CSS.
- ultraweb:icons — supplies the leading/trailing glyphs and the shared stroke width the icon slots must match.
- ultraweb:navigation — owns the sticky header that carries the single site-wide primary this skill's one-per-view rule exempts.
- ultraweb:shape-language — supplies the corner radius and filled-surface depth the restyled variants adopt.
