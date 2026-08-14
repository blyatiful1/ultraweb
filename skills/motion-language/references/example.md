## Worked example — Studio Norra, portfolio motion vocabulary

DIRECTION.md: "Editorial Brutalist — oversized type, exposed grid, deliberate rawness; page transitions between case studies carry the case-study image as a shared element; springs, not ease-out defaults."

Intensity **3 / Theatrical** — level 3 unlocks only because DIRECTION.md names the page-transition showpiece; the cursor-proximity index reveals sit inside it as the one physics interaction. Easing family **Mechanical** (brutalist), every duration tier cut ~20%. The single physical moment — the case-study image morphing across the `/work` → `/work/[slug]` transition — overrides the bezier with a motion spring; everything else rides the flat Mechanical curves.

```ts
// lib/motion.ts
export const dur = { micro: 0.16, small: 0.26, section: 0.45 } as const;
export const ease = {
  out: [0.33, 1, 0.68, 1], inOut: [0.65, 0, 0.35, 1], in: [0.32, 0, 0.67, 0],
} as const;
export const morph = { type: "spring", stiffness: 260, damping: 30 } as const; // shared-element only
```

Rejected: ease-out tweens for the shared-element morph — DIRECTION.md forbids them by name, and a spring gives the image weight as it resizes from index thumbnail to case-study hero where an eased tween just reads as a slide. Signal red `oklch(0.6 0.21 25)` fires only on interaction states, never as entrance ornament; the reveals fall to opacity-only under `useReducedMotion()`.

Handoff: the numbers land in design/SYSTEM.md §motion — ultraweb:tokens writes `--ease-*` + `:root` durations into app/globals.css, ultraweb:page-transitions consumes `morph` for the shared element, ultraweb:physics owns the cursor-proximity reveal.
