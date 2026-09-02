## Worked example — Ledger & Lane, boutique law-firm footer

design/BRIEF.md: "Footer must carry the Rechtsanwaltskammer Berlin admission and the mandatory professional-notice links (Impressum, Datenschutz); the only social channel is LinkedIn." SITEMAP.md lists six routes — only four earn footer links.

Decision: **minimal strip**, not columnar — a two-partner firm wearing a columnar sitemap looks like it is cosplaying a hundred-lawyer practice. The footer flips to the ink-navy surface `oklch(0.25 0.02 260)` on warm-paper text `oklch(0.975 0.005 80)`; the muted-gold accent `oklch(0.72 0.09 85)` stays out — it is spent on the one contact CTA above, per the palette's one-gold-per-page rule. Closing gesture: the ruled-line signature lands its final full-width hairline, drawn in on scroll. Nav row is Practice · Attorneys · Insights · Contact in Public Sans at 0.9375rem; the legal strip is Public Sans at the smallest size that still passes AA on the ink surface:

```tsx
<footer className="bg-[oklch(0.25_0.02_260)] text-[oklch(0.975_0.005_80)]">
  {/* … nav + hairline closer … */}
  <p className="text-xs tracking-wide">
    © {new Date().getFullYear()} Ledger &amp; Lane LLP · Attorney Advertising ·
    Prior results do not guarantee a similar outcome.
  </p>
  <p className="text-xs tracking-wide">
    Attorneys admitted in New York &amp; Connecticut.
  </p>
</footer>
```

Rejected: the **oversized-type closer** (LEDGER at `clamp(4rem,18vw,16rem)`) — shouting the firm's name is ego, the opposite of Quiet Authority; restraint is the credibility here. No newsletter either: the brief never asked for one, and a decorative signup would be a lie.

Handoff: lands in `components/layout/footer.tsx`; `ultraweb:gate-content` verifies every link resolves (zero `href="#"`) and that the bar-admission and attorney-advertising copy is present and complete.
