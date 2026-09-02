## Worked example — Tidepool, icon system for the analytics marketing site

design/SYSTEM.md §type records General Sans at UI weight for interface, JetBrains Mono for numerals; DIRECTION.md calls the direction "Precision Instrument — calm, data-forward."

Decision: one `strokeWidth={1.5}` site-wide — General Sans is a medium geometric sans, and a 1.5 line reads as an instrument mark rather than a chunky UI glyph, sitting level with the mono figures in the stat rows. Sizing holds the four steps: `size-4` in the `/changelog` meta rows, `size-5` in the `/pricing` tier buttons, `size-6` in the top nav. Icons are `currentColor` throughout; the accent teal `oklch(0.68 0.12 200)` colors an icon only on the featured Growth tier's active/selected state, never as decoration. Lucide has no "berth" mark, so `components/icons.tsx` carries one custom glyph on the 24 grid:

```tsx
// components/icons.tsx
export function IconBerth(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <path d="M3 20h18M7 20V9l5-3 5 3v11M10 13h4" />
    </svg>
  );
}
```

Rejected: keeping lucide's default `strokeWidth={2}` — it read heavy beside the JetBrains Mono numerals and fought the calm the direction demands; the 0.5 drop is what makes the icons recede.

Handoff: §icons (strokeWidth 1.5 + the four steps) lands in design/SYSTEM.md; ultraweb:buttons pulls the `size-5` control step for the "Start free" arrow on the Growth CTA, and ultraweb:navigation uses `IconBerth` at `size-6` in the product menu.
