## Worked example — Casa Verde, bilingual reservations FAQ below the menu

design/SITEMAP.md places an FAQ under `/en/menu` and `/pt/menu`; BRIEF.md names the objection to kill: guests assume a full night means turned away. Six questions, objection-ranked, reservations first.

Native `<details>/<summary>`, not the shadcn accordion — Sunlit Rustic wants chrome to recede, and none of the three escalation triggers apply, so instant disclosure is the honest fit. Question in Karla at `text-[1.125em]` medium (Fraunces stays on the section h2); answer in `text-muted-foreground` at SYSTEM's body leading; 1px `border-border` between items at `py-5`; one chevron rotates 180° in 200ms via `group-open:`, terracotta `oklch(0.66 0.13 45)` on hover.

```tsx
<summary className="group flex items-center justify-between gap-4 py-5 list-none [&::-webkit-details-marker]:hidden cursor-pointer">
  <h3 className="text-[1.125em] font-medium">{item.q}</h3>
  <ChevronDown className="size-5 transition-transform duration-200 group-open:rotate-180" />
</summary>
```

Top answer, EN: "Same-day tables open at noon — book online or call. If tonight's full we offer the waitlist and text you the moment a table frees up." — mirrors the reservation flow's `fully-booked → waitlist` state.

Rejected: animating the reveal height with `interpolate-size`. Browser support is still uneven; instant open costs nothing here and never janks, so it stays the default.

Handoff: strings live in one `faqItems` array per locale, exported from `components/sections/faq.tsx`; `ultraweb:seo` reads it to emit a `FAQPage` JSON-LD block on each of `/en/menu` and `/pt/menu` (Portuguese answers on the PT route). Ctrl+F finds every closed answer — verified before handoff.
