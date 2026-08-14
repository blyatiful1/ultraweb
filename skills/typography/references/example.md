## Worked example — Ledger & Lane, type system for a two-partner law firm

design/DIRECTION.md: "Quiet Authority — restraint as credibility; a ruled-line typographic system structures every page like a legal document."

Decision: **Newsreader** carries both display and article body; **Public Sans** takes UI. Newsreader's `opsz` axis keeps the serif sober at hero scale where a high-contrast face would turn ornate, and it earns hierarchy from optical size + italics (row 4), not a weight gap — display 500, body 400, no mid-weight collision.

```ts
import { Newsreader, Public_Sans } from "next/font/google";

export const display = Newsreader({ subsets: ["latin"], variable: "--font-newsreader", axes: ["opsz"], style: ["normal", "italic"] });
export const body = Public_Sans({ subsets: ["latin"], variable: "--font-public-sans" });
```

Scale: `--text-6xl: clamp(2.75rem, 2.1rem + 2.67vw, 4.5rem)` (44→72px) on the H1 "Considered counsel for consequential decisions."; body 17px, leading 1.65, measure 66ch; practice-area kickers 12px uppercase +0.08em / 600. Hero tracking −0.015em (serif, restrained). Gold `oklch(0.72 0.09 85)` touches only the single CTA per page. The H1 "Considered counsel…" gets `text-wrap: balance` + `text-box-trim: trim-both` so its cap-height sits exactly on the ruled baseline; `dlig` fires on the wordmark's ampersand ("Ledger & Lane") alone. No Breathing Type — Quiet Authority doesn't fidget.

Rejected: the library pairs Newsreader with **Archivo** (row 4); its grotesque voice fought the "legal document" register — Public Sans's neutral, near-governmental tone reads as the paper itself. Also weighed and declined: escalating to the foundry tier (Klim's Tiempos, in budget), since Newsreader's `opsz` delivers the same sober authority on the Google tier and no licence was justified — the escalation rule refusing to fire.

Handoff: lands in design/SYSTEM.md §type + lib/fonts.ts; ultraweb:tokens bridges `--font-newsreader`/`--font-public-sans` and the clamp scale into `@theme inline`, and ultraweb:hero pulls `--text-6xl` for the ruled hero.
