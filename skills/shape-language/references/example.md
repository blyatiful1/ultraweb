## Worked example — Loop & Thread, geometry for a handmade-textiles shop

DIRECTION.md reads "Soft Craft — tactility through generous radius, close-up photography, unhurried motion." Generous radius is stated intent, so the archetype maps to **Round** (1–1.5rem band), the whole column shifted up one notch:

```css
@theme {
  --radius-sm: 0.625rem;  /* review pills, chips */
  --radius-md: 0.875rem;  /* buttons, form fields */
  --radius-lg: 1.25rem;   /* product cards */
  --radius-xl: 1.5rem;    /* hero media, /journal covers */
}
```

The flat-lay→in-hand hover image sits in a `--radius-lg` card with `p-2` (0.5rem), so it takes `rounded-[calc(var(--radius-lg)-0.5rem)]` = 0.75rem — concentric, no drifting corner behind the crop. Motif family: **Arc & capsule** — capsule "small-batch" tags on shop cards, an arced SVG divider (fill = the shop grid's linen) between hero and grid, and a thread-spool circle accent in the footer: three placements, so it stays.

Rejected **Stamp & notch** (ticket-edge product cards): the notched-coupon look reads as discount commerce and undercuts the unhurried, handmade calm the palette (`oklch(0.94 0.012 80)` linen, `oklch(0.45 0.08 265)` indigo) is buying.

Output lands in design/SYSTEM.md §shape; the four `--radius-*` tokens hand to ultraweb:tokens, which writes them into app/globals.css `@theme`, and ultraweb:cards pulls the concentric calc for every `/products/[slug]` gallery frame.
