---
name: navigation
description: Design and build the site header and menus for an ultraweb site — four named variants (slim-bar, centered-logo, floating-pill, mega-menu), sticky hide-on-scroll-down/show-on-up behavior, a mobile menu designed as a moment rather than a bare drawer, active-link indication, a mandatory skip-link, and complete keyboard support. Invoke during the Build phase for any header or menu work — trigger phrases — "navbar", "header", "navigation", "menu", "mobile nav", "hamburger", "sticky header", "mega menu".
---

# navigation — chrome that recedes, never disappears

**Stage:** Phase 6 — Build - **Reads:** design/SYSTEM.md, design/SITEMAP.md, design/DIRECTION.md - **Writes:** components/layout/header.tsx (+ mobile-menu.tsx when extracted)

## Standard

Navigation is judged by how little you notice it until you need it — then it must be instant, obvious, and keyboard-perfect. First-grade means:

- Sticky with intent: hides on scroll-down, returns on scroll-up. Never an always-fixed bar eating 64-80px of every viewport.
- The mobile menu is a designed moment — typography, choreography, one extra beat of personality — not a shadcn Sheet with a link list dropped in.
- Skip-link, aria-current, focus-visible, Escape handling: all present, all verified by an actual keyboard walkthrough.
- <=7 top-level destinations. More is an information-architecture problem — push back to SITEMAP.md, or go mega-menu deliberately.

## Process

1. Read SITEMAP.md for the destination list; the header CTA mirrors the site's #1 conversion goal.
2. Pick a variant below per DIRECTION.md. Bar height 56-72px desktop, 56-64px mobile.
3. Build the scroll behavior (rules below). The header is a `"use client"` leaf — the surrounding layout stays server.
4. Build the mobile menu as its own moment (rules below).
5. Keyboard pass from a fresh page load: skip-link first, then logo, links in order, CTA, hamburger. Escape closes anything open.

## Variants

**slim-bar** — logo left, links right, one CTA. Default for SaaS/product/local business. The CTA is the only filled element in the bar.

**centered-logo** — links split around a centered logo. Editorial, fashion, boutique. Requires an explicit balance decision: which side carries the extra link or the CTA.

**floating-pill** — detached rounded bar inset 12-24px from the viewport top, solid surface from SYSTEM tokens. Modern product/portfolio directions. Backdrop blur only if SYSTEM.md §depth explicitly designed glass — never as a default.

**mega-menu** — grouped panels under 2-3 trigger items. Only when SITEMAP.md holds 12+ real destinations (docs, multi-product). Panels open on click (hover-intent as enhancement), close on Escape and focus-out, arrow keys move within a panel.

## Scroll behavior

- Track direction with an 8px threshold (ignores trackpad jitter); hide only after 96px of scroll depth. Plain React, no library:

```tsx
"use client";
const [hidden, setHidden] = useState(false);
useEffect(() => {
  let last = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    if (Math.abs(y - last) < 8) return;
    setHidden(y > last && y > 96);
    last = y;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  return () => window.removeEventListener("scroll", onScroll);
}, []);
```

- Apply as `translateY(-100%)` with a 200-250ms transition from SYSTEM's easing family — animate transform only, never `top`.
- Force-visible when: the mobile menu is open, focus is inside the header (focus-within), or `prefers-reduced-motion` — then it is plain sticky, no hide.
- Scrolled state at y > 16px: only then add border/shadow/surface tint. At page top the bar sits flush with the hero; chrome appears once content slides beneath it.

## Mobile menu — a designed moment

- Full-screen or near-full panel; links at display scale — the one place nav type gets big: 2-3.5rem via clamp().
- Choreography: panel 300-450ms, links stagger 40-80ms apart, 400-700ms total. Exit via `AnimatePresence` (import from `"motion/react"`, file marked `"use client"`). Reduced motion: instant open/close, no stagger.
- One extra beat: a contact/social row, a surface color shift, or the signature motif — something that makes it THIS site's menu.
- Mechanics: `<button>` trigger (44px target) with `aria-expanded` + `aria-controls`; focus moves into the panel on open and returns to the trigger on close; focus trapped inside; Escape closes; body scroll locked while open. Build on a restyled shadcn dialog primitive or hand-roll — either way all six behaviors are verified, not assumed.

## Active link + states

- Current page: `aria-current="page"` (derive via usePathname) plus a non-color-only indicator — underline, dot, or weight shift. One-pagers: section highlight via IntersectionObserver.
- Hover: 150-250ms, ONE move (underline draw, color, or slight shift) — the same move on every nav link, from the `ultraweb:micro-interactions` vocabulary.
- focus-visible: palette-token ring on every interactive element; `outline-none` without a replacement is a defect.

## Skip-link (mandatory)

First focusable element on the page, before the header:

```tsx
<a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50">Skip to content</a>
```

Pair with `<main id="main" tabIndex={-1}>` so the jump actually moves focus. Style the visible state deliberately — it is part of the design, not a legal fig leaf.

## Anti-patterns

- No skip-link; `focus:outline-none` with no focus-visible replacement.
- `hidden md:flex` on the link list with no mobile menu shipped — mobile users get nothing.
- `<div onClick` hamburger — it is a `<button>`, always.
- `backdrop-blur` on the bar by default — glass is a depth decision, not a nav reflex.
- Hide-on-scroll with no threshold — the bar flickers on rubber-band scroll.
- `z-[9999]` — layering was never designed; use SYSTEM's z-scale.
- Menu open but body still scrolls behind it; focus escaping the open panel.
- 10+ flat links crammed in the bar; hover-only dropdowns keyboard users cannot open.

## Composes with

- ultraweb:sitemap — the destination list and grouping come from IA, never invented in the header.
- ultraweb:motion-language — hide/show and menu choreography use its duration/easing tokens.
- ultraweb:micro-interactions — supplies the single link-hover move applied consistently.
- ultraweb:buttons — the header CTA is the button system's primary at its smallest size.
- ultraweb:app-structure — the header is the canonical client-leaf; the layout stays server-side.
- ultraweb:gate-accessibility — runs the keyboard walkthrough that proves every claim above.
