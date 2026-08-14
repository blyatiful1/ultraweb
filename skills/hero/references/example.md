## Worked example — Framewalk, "Hollow Cartographer" Steam launch home

design/DIRECTION.md: "Atmospheric Dark, earned by the fog-and-lantern art — not a template. Signature move: three-layer parallax fog in the hero that answers the cursor; static composite under prefers-reduced-motion."

Variant: **full-bleed media** for `/` — the game's atmosphere IS the promise, so the art carries the emotion and chrome recedes. Headline "You are the last one still mapping the dark" in Space Grotesk at `--text-display: clamp(2.75rem, 1.5rem + 5.5vw, 7rem)`, tracking -0.03em, line-height 1.0, over a computed-AA scrim sized to the text zone (base surface `oklch(0.16 0.02 200)`). The LCP element is the far fog layer — a static import, never lazy:

```tsx
// LCP: far fog layer (statically imported); parallax lives in a client island below
<Image src={fogFar} alt="" fill preload sizes="100vw"
  placeholder="blur" className="object-cover" />
```

Primary CTA: **"Wishlist on Steam"** (filled, phosphor accent `oklch(0.78 0.15 160)`, AA-verified on the dark base); the launch-news email field sits after it as a ghost-submit inline form so nothing competes with the wishlist.

Rejected: a second filled "Watch the trailer" button — the direction forbids a second filled CTA, so the trailer drops to a ghost arrow-link and Wishlist stands alone. Also rejected: a boxed gameplay screenshot (split variant) — it would sell fog-and-lantern like generic SaaS.

Handoff: `components/sections/hero.tsx` stays a server component; the three-layer parallax is a lone `"use client"` island (LazyMotion + `m.` from `motion/react`) handed to ultraweb:physics for the cursor-proximity answer and its reduced-motion path — cursor tracking is physics' contract, not scroll-motion's, and nothing in this hero is scroll-driven — and ultraweb:gate-performance then confirms the far fog layer is the sole LCP with zero CLS.
