## Worked example — Tidepool, port-logistics analytics SaaS

- DIRECTION.md: "Precision Instrument — calm, data-forward, dark mode first-class"; §color hands the cool neutral ramp at hue 245 (light `oklch(0.985 0.005 240)` → dark surface `oklch(0.18 0.015 250)`).
- Stance: **flat-minimal**. A data instrument's panels don't float — borders carry resting structure, shadows are reserved for transient overlays. Two tinted tokens only, hue 245:

```css
@theme {
  --shadow-md: 0 1px 2px oklch(0.2 0.04 245 / 0.05), 0 2px 6px oklch(0.2 0.04 245 / 0.06);
  --shadow-xl: 0 4px 8px oklch(0.2 0.04 245 / 0.06), 0 16px 36px oklch(0.2 0.04 245 / 0.10);
}
```

- Resting KPI cards + the berth-timeline panel: 1px border `oklch(0.2 0.02 245 / 0.10)`, no shadow. `shadow-xl` is spent only on the level-4 transient overlays — the `/docs` command palette and the pricing "Fleet" contact modal; `shadow-md` belongs to the scrolled header (level 2).
- Dark mode (the default surface): elevation is lightness, not shadow — bg `oklch(0.18 0.015 250)` → card `oklch(0.22 0.015 250)` → popover `oklch(0.26 0.015 250)`, each paired with a `oklch(1 0 0 / 0.08)` hairline.
- Forced colors: the bordered KPI cards and berth-timeline panel survive HCM for free — borders are already the primary language. The catch is the level-4 `/docs` command palette and the Fleet modal, resting on `shadow-xl` alone: both take `@media (forced-colors: active) { border: 1px solid CanvasText }` so they don't dissolve into the Canvas when Windows strips the shadow.
- Rejected: the layered-soft 5-token scale with cards resting on `shadow-md` — it reads consumer-marketing-soft and blunts the instrument precision; a dashboard that floats looks less trustworthy, not more.
- Glass verdict: **no glass**. The sticky header stays opaque, gaining a 1px bottom border + `shadow-md` once scrolled — a precision instrument doesn't blur its own chrome.
- Lands in design/SYSTEM.md §depth; the two tokens hand to ultraweb:tokens for app/globals.css `@theme`, and ultraweb:navigation reads the scrolled-header rule.
