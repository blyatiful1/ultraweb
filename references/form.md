# form

Elevation, corner geometry, dividers and icons: the physical vocabulary of the interface.

Load when: deciding shadows, borders, radii, dividers or icon style; when corners look inconsistent, nested corners look thick, or everything floats equally.
Reads: design/DIRECTION.md, design/SYSTEM.md §color. Writes: design/SYSTEM.md §form; `--radius`, `--shadow-color`, `--shadow-k` and the shadow scale in the token file (`references/tokens.md`).

## Depth

Stance from DIRECTION.md: flat (borders lead, at most two shadow levels), soft layered (a five-step scale), or dramatic (large diffuse shadows, still tinted). With shadows hidden, hierarchy should still read.

**Border or shadow.** Persistent structure (resting cards, inputs, table rows, panels) gets a border or a background shift. Transient float (menus, popovers, modals, toasts, a header once scrolled) gets a shadow. A resting card on pure white needs both, since a shadow alone has no edge there; on a tinted section a border is usually enough.

**Tinted shadows.** Shadow color is the neutral hue at low lightness and modest chroma (L about 0.2, C about 0.03-0.06), never black. Use two layers per step from medium up: a tight contact layer and a wide ambient layer, each with alpha about 0.05-0.12. Build them on the `--shadow-color` and `--shadow-k` variables from the token file so dark mode changes the variables and no shadow token is redefined:

```css
--shadow-md:
  0 2px 4px  color-mix(in oklab, var(--shadow-color) calc(5% * var(--shadow-k)), transparent),
  0 8px 20px color-mix(in oklab, var(--shadow-color) calc(8% * var(--shadow-k)), transparent);
```

**Levels.** 0 page and flat sections: none. 1 resting cards and inputs: border, at most the smallest shadow. 2 hovered cards and scrolled header: medium. 3 menus, popovers, tooltips: large. 4 modal, command palette, toast: largest plus a backdrop. An element rises one level on interaction; at most three levels show in one viewport.

**Dark mode.** Elevation becomes lightness (+0.03 to +0.05 L per level, `references/color.md`). Borders are the surface plus 0.06-0.10 L in the neutral's own hue, not white at low alpha. Keep shadows for levels 3-4 only, stronger (`--shadow-k` about 2 or more), where they read as depth behind the surface.

**Forced colors.** In `forced-colors: active` the OS discards author colors and `box-shadow`. Every level 2-4 surface needs a border in system keywords, or its edge disappears:

```css
@media (forced-colors: active) { .elevated { border: 1px solid CanvasText; box-shadow: none; } }
```

**Glass (backdrop blur).** Only when DIRECTION.md argues it, on one surface: surface color at alpha about 0.65-0.8, a blur, a 1px border, a scale shadow. Text must pass contrast against the worst background that can scroll beneath. Fall back to opaque plus border under `forced-colors: active` and `prefers-reduced-transparency: reduce` (check current support for the latter).

Also avoid: pure-black shadows, neumorphic inset shadows, `text-shadow` for emphasis, animating `box-shadow` under scroll (cross-fade a pseudo-element's opacity), and the same `rounded-xl shadow-lg` on every element.

## Shape

**One radius system.** `--radius` is a single base from the personality DIRECTION.md implies; the token file derives `--radius-sm/md/lg/xl` from it by ratio. Base by subject: near zero for exact or severe, up to 0.75rem for general product work, 1rem and above for soft or tactile. Fully round (`rounded-full`) is for pills, avatars and badges, plus buttons when the whole system is round. At most four radius values, plus none and full.

**Nested corners are concentric.** Inner radius = outer radius minus the padding between them, clamped at 0. A card with radius 24px and 16px padding gives its image 8px: `rounded-[calc(var(--radius-xl)-1rem)]`. If padding is at least the outer radius, the inner corner is square. Equal inner and outer radii look thick and drifting. This applies to images in cards, thumbnails in grid cells, buttons in input groups, nested panels, and avatars in badges.

**One motif, if the direction wants one.** Choose one geometric family (a fixed angle, arc, notch, bracket), record its numbers, and use it in at least three places or drop it; a single occurrence reads as an accident. Avoid generic blob and squiggle shapes.

**Dividers.** The default divider is space or a background change. When a line is needed: 1px, a foreground token at low alpha, full width or a short accent rule. Statement dividers (one style, two to four uses): an angled edge, `clip-path: polygon(0 0, 100% 0, 100% calc(100% - 3rem), 0 100%)` with bottom padding equal to the cut, or an inline SVG curve filled with the next section's background. Derive them from recorded numbers: rise = `tan(θ)` times container width for an angle θ; a wave is `y = A·sin(2πx/λ)` with λ dividing the width so the seam closes (same recipe as `references/imagery.md`). `clip-path` clips hit-testing: keep 44px targets inside the visible shape.

**SVG accents.** Inline, `currentColor`, `aria-hidden="true" focusable="false"` when decorative. SVG that will animate: one path per independently animated element, stable hand-written ids (the optimizer must keep them, `cleanupIds: false`), no baked `transform` on those nodes, `viewBox` kept. Morph pairs need identical point counts, command order and direction; make B by editing a copy of A.

## Icons

- Use the stack's library (lucide through shadcn by default), named imports only; set defaults once, not per call site.
- One stroke width site-wide, chosen to match the text weight: lighter type takes a thinner stroke, heavy type a thicker one; icons at 32px and above drop the stroke a little. Record it.
- Four sizes locked to the type scale: inline (16px, beside body text), control (20px, in buttons and inputs), standalone (24px, nav and icon buttons), feature (32-40px). Nothing between.
- `currentColor` always. The icon takes the accent only where the accent carries meaning (active state, primary action).
- Icon and label share an inline flex row with a 6-10px gap; the icon stays about cap height plus 2px.
- Icon-only controls: 44px target, `aria-label`, visible focus. Set `aria-hidden` explicitly on decorative icons.
- Icons inherit state from the host; loading swaps the glyph for a spinner at the same size.
- Custom glyphs (after searching the library, or a brand mark): 24x24 viewBox, the site's stroke width, round caps and joins, `currentColor`, collected in one file. Optimize a supplied brand mark, replace hex fills with `currentColor`, convert to a component; never redraw it.
- Line-draw on icons: a few times per site at most, one-shot on reveal, inside `prefers-reduced-motion: no-preference` so reduced-motion users see the finished glyph.
- Emoji are not icons; a scaled-up UI glyph is not an illustration.

Grep: `rgba(0, 0, 0` · `rounded-xl` on most elements · more than one `backdrop-blur` · `<hr` between every section · `import * as` from the icon library · more than one `strokeWidth=` value · `stroke="#` · an icon-only `<button` with no `aria-label`.
