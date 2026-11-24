# tokens

How finished system decisions become one stylesheet that every component reads.

Load when: writing or regenerating the token CSS, adding a token, or a component hardcodes a value.
Reads: design/SYSTEM.md, design/DIRECTION.md. Writes: `app/globals.css` (Next) or `site/styles.css` (static); `lib/tokens.ts` when email or OG images exist.

## Architecture

- The token file is the only place a color, radius, shadow, duration, easing or type size is defined. A hex, bare `oklch(`, `text-[17px]` or `rounded-[` in a component is a missing token (one exception: the concentric-radius `calc()` in `references/form.md`).
- Three tiers: primitive (raw ramps, never named by a component), semantic (`--background`, `--primary`, `--ring`; what components use), component (a one-off declared in that component's CSS as an alias of a semantic token).
- Every SYSTEM.md decision has a token and vice versa; do not invent values here.
- Tailwind is configured in CSS only (no `tailwind.config`, `theme.extend`); version per `stack/versions.json`. Colors are complete `oklch()` values in `:root` and `.dark`, never HSL triplets.

## Where tokens go (checked against the Tailwind docs)

- Semantic colors, `--radius`, `--shadow-color`, durations: plain `:root` / `.dark`. Unused `@theme` variables are not emitted, and durations have no namespace.
- Anything that references another variable: `@theme inline`, so the utility outputs `var(--background)` and a re-declaration in `.dark` or on a subtree takes effect.
- Literals (type scale, spacing, easings): plain `@theme`.
- Keyframes inside `@theme` are emitted only together with an `--animate-*` variable that uses them. Keyframes that must always ship go outside `@theme`.
- Consume durations with `duration-(--dur-micro)`; `duration-[var(--dur-micro)]` is the v3 spelling.

## Example

Every value below is a placeholder showing structure; replace all of them from SYSTEM.md.

```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));

:root { /* PLACEHOLDERS */
  --background: oklch(0.98 0.01 250); --foreground: oklch(0.22 0.02 250);
  --card: oklch(1 0.005 250);         --card-foreground: var(--foreground);
  --primary: oklch(0.5 0.15 250);     --primary-foreground: oklch(0.98 0.01 250);
  --muted: oklch(0.95 0.01 250);      --muted-foreground: oklch(0.48 0.02 250);
  --accent: oklch(0.93 0.03 250);     --accent-foreground: oklch(0.3 0.05 250);
  --border: oklch(0.9 0.012 250);     --ring: var(--primary);
  /* ...every semantic token from color.md, both themes */
  --radius: 0.5rem;                      /* the one radius knob (form.md) */
  --shadow-color: oklch(0.25 0.04 250);  /* tinted, no alpha */
  --shadow-k: 1;                         /* strength multiplier */
  --dur-micro: 180ms; --dur-section: 520ms;  /* from motion.md */
}
.dark { /* re-decided per surface, not inverted */
  --background: oklch(0.18 0.015 250); /* ...every token again */
  --shadow-color: oklch(0 0 0); --shadow-k: 2.2;
}

@property --gradient-angle { syntax: "<angle>"; inherits: false; initial-value: 180deg; }

@theme inline {
  --color-background: var(--background); --color-foreground: var(--foreground);
  --color-primary: var(--primary);       --color-muted: var(--muted);
  /* one line per semantic token */
  --font-display: var(--font-display-face); --font-sans: var(--font-body-face); /* set by next/font */
  --radius-sm: calc(var(--radius) * 0.5); --radius-md: calc(var(--radius) * 0.75);
  --radius-lg: var(--radius);             --radius-xl: calc(var(--radius) * 1.5);
  --shadow-md: 0 2px 4px  color-mix(in oklab, var(--shadow-color) calc(5% * var(--shadow-k)), transparent),
               0 8px 20px color-mix(in oklab, var(--shadow-color) calc(8% * var(--shadow-k)), transparent);
  /* other steps follow the same two-layer pattern (form.md) */
}

@theme {
  --text-*: initial;   /* remove default sizes so nothing escapes the scale */
  --text-base: 1rem;
  --text-hero: clamp(2.5rem, 1.66rem + 3.43vw, 4.75rem); /* math in typography.md */
  --text-hero--line-height: 1;
  --ease-out: cubic-bezier(0.2, 0.9, 0.3, 1);  /* PLACEHOLDER; motion.md chooses */
  --animate-rise: rise var(--dur-section) var(--ease-out) both;
  @keyframes rise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
}

@layer base {
  * { border-color: var(--color-border); }
  body { background: var(--color-background); color: var(--color-foreground); font-family: var(--font-sans); }
}
```

- Dark shadows change through `--shadow-color` and `--shadow-k`; no shadow token is redefined in `.dark`.
- Motion is opt-in: wrap always-on animation in `@media (prefers-reduced-motion: no-preference)`; no global `reduce` kill switch.

## Traps

- Register with `@property` exactly the properties that animate (a gradient angle, an interpolated color); unregistered ones snap at the midpoint. Register nothing static.
- Restyle shadcn in `@layer components`; layer order beats specificity. `!important` in component CSS means the layer is wrong.
- Class-strategy dark mode: `suppressHydrationWarning` on `<html>`; next-themes `attribute="class"`.
- Email and `next/og` cannot read CSS variables or `oklch()`. Generate `lib/tokens.ts` (resolved sRGB hex per semantic token) from the CSS with a short script; never retype a second palette.

## Scoped re-mapping (per case, route or tenant)

Re-declare semantic variables on a subtree. Because the bridge is `inline`, every `bg-primary` and ring inside follows, with no provider or client component:

```css
[data-world="a"] { --primary: var(--world-a); --primary-foreground: var(--world-a-fg); --ring: var(--world-a); }
```

Define `--world-*` in `:root` and `.dark`. Override the accent family only; shadcn's `--accent` is a hover surface, so override it only with its foreground. Verify contrast for every world in both themes. Nested worlds resolve by ancestor proximity.

Verify: grep `app/` and `components/` for hex, `rgb(`, `oklch(`, `hsl(var(`, `!important`, `text-[`, `rounded-[`.
