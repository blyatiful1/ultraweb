## Worked example — Tidepool, port-logistics analytics site header

DIRECTION.md: "Precision Instrument — calm, data-forward, dark mode first-class." SITEMAP.md lists six destinations: `/`, `/product`, `/pricing`, `/docs`, `/changelog`, `/login`.

Six flat destinations, no grouping → **slim-bar**, not mega-menu. Logo left; four text links right (`/product`, `/pricing`, `/docs`, `/changelog`), then `/login` as a quiet text link and one filled CTA "Start free" (mirrors the #1 goal: Starter $0 signup). Bar height 60px desktop / 56px mobile. Designed on the dark surface first — `oklch(0.18 0.015 250)`, flush over the live berth-timeline hero, a hairline top-border appearing only past y > 16px so chrome arrives as content slides under it. Active link: `aria-current="page"` (via `usePathname`) plus a 1px teal underline `oklch(0.68 0.12 200)` — never color alone.

```tsx
"use client";
const nav = ["/product", "/pricing", "/docs", "/changelog"] as const;
const pathname = usePathname();
// General Sans links; teal underline marks the current route
<Link href={href} aria-current={(pathname === href || (href !== "/" && pathname.startsWith(href + "/"))) ? "page" : undefined}
  className="text-sm text-foreground/80 aria-[current=page]:text-foreground">
```

Rejected floating-pill: a detached capsule would float a second instrument above the hero's berth timeline — precision here reads as a flush, ruled bar, not decorative chrome fighting the signature move.

Handoff: lands in `components/layout/header.tsx` + `mobile-menu.tsx`; `ultraweb:gate-accessibility` then runs the keyboard walkthrough (skip-link → logo → links → CTA → hamburger, Escape closes) before it can ship.
