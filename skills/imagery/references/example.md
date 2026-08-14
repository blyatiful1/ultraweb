## Worked example — Casa Verde, Lisbon farm-to-table restaurant

design/DIRECTION.md: "Sunlit Rustic — full-bleed photography carries the emotion, chrome recedes." SYSTEM.md §color hands over the terracotta accent `oklch(0.66 0.13 45)` over a warm cream base `oklch(0.97 0.01 85)`.

Photography leads, so the treatment must warm the food, not restyle it. One named treatment — a flat terracotta wash at 0.12 alpha plus subliminal grain — lives once in app/globals.css:

```css
.photo-sunlit { position: relative; overflow: hidden; }
.photo-sunlit::after {
  content: ""; position: absolute; inset: 0; pointer-events: none;
  background: oklch(0.66 0.13 45 / 0.12); mix-blend-mode: multiply;
}
```

Grain rides on top at opacity 0.05 — felt, not seen. Rejected: true duotone — it strips the real color out of the tomatoes and herbs and kills the appetite-appeal that full-bleed food photography exists for; duotone suits a mood piece, not a menu.

The class plus the generated `placeholder-harvest-01.svg` slots (olive-on-cream geometry until the shoot lands) record into SYSTEM.md §imagery. ultraweb:hero pulls `.photo-sunlit` onto the full-bleed reservation hero, ultraweb:cards applies the lighter `.img-tint` to the day's-harvest strip thumbnails, and ultraweb:handoff republishes the placeholder-replacement list so the kitchen can swap in real photos.
