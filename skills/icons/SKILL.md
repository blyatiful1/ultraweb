---
name: icons
description: The icon system for an ultraweb build — lucide-react as the default set, ONE stroke width matched to the type weight, a four-step sizing scale locked to typography, currentColor discipline, criteria for when a custom SVG beats a library glyph, and a hard ban on emoji-as-icons. Invoke during the build phase whenever a component needs icons, when choosing or normalizing an icon set, when icons look inconsistent ("mixed icon styles", "icons feel heavy", "icon sizes are all over the place"), or when replacing emoji decorations with real icons.
---

# icons — one stroke, one hand

**Stage:** Phase 6 — Build (rules recorded in SYSTEM.md during Phase 3) - **Reads:** design/SYSTEM.md (§type, §shape), design/DIRECTION.md - **Writes:** §icons rules in design/SYSTEM.md + icon usage across components + components/icons.tsx for custom glyphs

## Standard

An icon set reads as one hand or it reads as clip-art. First-grade means one stroke width, one sizing scale, one color rule across every icon on the site — custom ones included. Icons support text; they replace it only for universally understood actions (close, search, menu), and even those carry `aria-label`. Emoji are never icons — constitution ban; only an explicit justification in design/DIRECTION.md can override it.

## Rules

1. **Default set: lucide-react**, named imports only (tree-shaken). shadcn scaffolds `"iconLibrary": "lucide"` in components.json — keep it. Lucide icons are plain SVG-rendering components: fine inside Server Components, they force no `"use client"`.
2. **One strokeWidth site-wide, matched to type weight.** Light editorial type → 1.5. Standard UI weight → 2 (lucide default, tuned for 24px). Bold/brutalist → 2.25-2.5. One documented exception: icons ≥32px drop 0.25-0.5 so they don't read chunky. Set the value once — a shared constant or thin wrapper, never per-callsite guesses.
3. **Four sizing steps, locked to type** (table below). Nothing between steps.
4. **currentColor always.** Icons inherit text color — never `stroke="#..."`, never a one-off `text-blue-500`. Accent-colored icons only where the accent carries meaning (active state, primary action).
5. **Alignment:** wrap icon + label in `inline-flex items-center gap-2` (6-10px gap); the icon stays at or below the text's cap height + 2px or it dominates the label.
6. **Icon-only interactive elements:** ≥44px touch target, `aria-label` mandatory, `focus-visible` ring from the system palette.
7. **Decorative icons get `aria-hidden` explicitly** — set it, don't assume the library does.

```tsx
import { ArrowRight } from "lucide-react";

<ArrowRight className="size-4" strokeWidth={2} aria-hidden />
```

## Sizing scale

| Step | px | Class | Where |
|------|----|-------|-------|
| inline | 16 | `size-4` | body text, badges, list markers, meta rows |
| control | 20 | `size-5` | buttons, inputs, selects, tabs |
| standalone | 24 | `size-6` | nav, standalone icon buttons, toasts |
| feature | 32-40 | `size-8` / `size-10` | feature sections only — stroke drops per rule 2 |

Icon motion follows motion-language's micro tier — transform only, 2-4px of travel:

```tsx
<Button className="group">
  Get started
  <ArrowRight
    className="size-5 transition-transform duration-[var(--dur-micro)] ease-out group-hover:translate-x-0.5"
    aria-hidden
  />
</Button>
```

## When custom SVG beats lucide

- The signature move or brand needs a proprietary glyph (logo mark, motif) — coordinate with ultraweb:shape-language.
- A domain concept lucide genuinely lacks — search the set first; most "missing" icons exist under another name.
- Third-party logos: use the official brand SVGs, normalized to the 24-viewBox scale and monochromed to currentColor. Never redraw a brand mark.

Custom glyphs MUST match the system: 24×24 viewBox, the site's strokeWidth, `stroke-linecap="round" stroke-linejoin="round"` (lucide's caps), `stroke="currentColor" fill="none"`. Collect them in `components/icons.tsx` — one file, plain exported components, no abstraction layer beyond that:

```tsx
// components/icons.tsx — every custom glyph on lucide's grid
export function IconWave(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <path d="M2 12c2.5-5 5-5 7.5 0s5 5 7.5 0" />
    </svg>
  );
}
```

## States

Icons never own states — they inherit the host element's. Color change on hover/active rides the host's transition (micro tier from motion-language). Disabled inherits the host's opacity. Loading swaps the icon for a spinning loader glyph (`animate-spin`) at the SAME size step so layout never shifts. A toggle icon that changes meaning (menu→close, play→pause) transitions within the micro tier and updates its accessible name with the swap.

## Process

1. Read SYSTEM.md §type; pick the site strokeWidth from the weight table in rule 2. Record strokeWidth + size steps as §icons in SYSTEM.md.
2. Encode the defaults once (shared constant or thin wrapper component).
3. While building sections, choose icons semantically — verbs for actions, nouns for objects; no decorative filler icons.
4. Custom needs go to `components/icons.tsx` matching the spec above.
5. Verify: run the anti-pattern greps below; screenshot nav + primary buttons at 100% zoom and check the icons' optical weight sits level with the adjacent text.

## Anti-patterns

Greppable — each should return zero:
- Emoji in JSX/copy: `✨` `🚀` `🎉` `✅` `➡️` `🔥` `💡` — the constitution's hard ban
- `import * as` from `"lucide-react"` — kills tree-shaking
- `strokeWidth=` with more than one distinct value (excluding the documented ≥32px rule)
- `stroke="#` — hardcoded icon color
- An icon-only `<button` without `aria-label`

Visual — caught by screenshots:
- Three identical icon-cards in a row (banned list — ultraweb:feature-sections owns that layout problem)
- A 64px stroke icon posing as an illustration — scaled-up UI glyphs are not artwork; that slot belongs to ultraweb:imagery
- Mixed families (a lucide arrow next to a filled-style social icon at different visual weight)

## Composes with

- ultraweb:buttons — icon placement, sizing, and the loading swap inside the CTA system
- ultraweb:navigation — menu/hamburger icons as designed moments, not defaults
- ultraweb:feature-sections — the escape route from icon-card-grid monotony
- ultraweb:shape-language — custom glyphs and decorative geometry beyond UI-icon scale
- ultraweb:ui-states — spinners and empty-state visuals that outgrow the icon scale
- ultraweb:gate-antislop — sweeps for emoji-as-icons and placeholder glyphs
