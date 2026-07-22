---
name: hero
description: Design and build the first-viewport hero section of an ultraweb site — pick one of five named variants (typographic, split, full-bleed media, product-shot, editorial-offset) to fit the direction, enforce display-scale headline sizing (>=3.5x body via clamp()), a single-primary CTA hierarchy, and above-fold performance (LCP element identified and preloaded, no motion library on first paint when avoidable). Invoke during the Build phase for any hero or above-the-fold work — trigger phrases — "hero section", "above the fold", "landing header", "first screen", "hero image", "hero headline", "make the hero bolder".
---

# hero — the first viewport decides everything

**Stage:** Phase 6 — Build - **Reads:** design/DIRECTION.md, design/SYSTEM.md, design/SITEMAP.md, app/globals.css - **Writes:** components/sections/hero.tsx

## Standard

The hero gets the largest share of craft budget — every visitor sees it, most see nothing else. First-grade means:

- The headline is the design. Display size >=3.5x body on desktop, fluid via clamp() (the `--text-display` token, e.g. `clamp(2.75rem, 1.5rem + 5.5vw, 7rem)`), tracking -0.02 to -0.045em, line-height 0.95-1.08. If it doesn't feel almost too big, it's too small.
- The strongest hero can make the words the picture (`award-canon`: Type as the Image) — the static stock-photo hero is a dated fashion. Media-led variants earn the image; otherwise the type IS the hero.
- Exactly ONE primary CTA. A secondary may exist as ghost or arrow-link — never a second filled button.
- The signature move (DIRECTION.md) usually lives here — check SITEMAP.md before placing it elsewhere.
- LCP under control: the LCP element is named in a code comment and the perf rules below all hold.
- The 375px hero is designed, not the desktop one squeezed.

## Process

1. Read DIRECTION.md and pick the variant below that serves the archetype; SITEMAP.md says whether the signature move is here.
2. Write the headline under `ultraweb:copywriting` rules before any layout — layout serves the words.
3. Choose the LCP element (headline text or hero image) and apply the above-fold rules below.
4. Build desktop and 375px together; at 100svh the key message + primary CTA are visible without scrolling on both.
5. State pass: CTA hover/focus-visible/active, image blur placeholder, reduced-motion path for every entrance.

## Variants

**typographic** — the headline IS the hero; no imagery, or one small accent mark. When: editorial/content sites (type is 80% of the design), type-led or brutalist directions, portfolios with strong copy. Fastest possible LCP (text). Earn it: top of the clamp range plus one typographic gesture — an italic word, a cut baseline, a hanging indent.

**split** — text column + media column at 55/45 or 60/40, never 50/50 (decide a dominant side). When: SaaS/product with something real to show, local business with one strong photo. Mobile: text stacks FIRST; media crops to 4:3 or drops entirely if it adds nothing at 375px.

**full-bleed media** — edge-to-edge image or video with overlaid text. When: hospitality, food, photography, brands where the image carries the emotion. Overlay text needs a computed-AA scrim (dark gradient sized to the text zone, not smeared over the whole image). Video: muted, playsInline, poster set, <=4s loop, and no video at all under prefers-reduced-motion.

**product-shot** — headline above, staged product render or UI screenshot as the anchor, often bleeding off the fold. When: e-commerce hero product, hardware, apps with genuinely beautiful UI. Screenshots are real app UI at 2x in a designed frame — SYSTEM.md §depth shadow, not a default `shadow-lg`. For a hero object examined through scroll (`award-canon`: The Persistent Hero Object) — ONE anchor object transforming as context changes, concept + color system + tech story in one image — a static image-sequence on `sticky` scroll delivers ~80% of a rotatable 3D object at a fraction of the weight; real WebGL only via `showpiece`'s gate.

**editorial-offset** — asymmetric grid: headline off-center, image bleeding one edge, an overlapping element or rotated caption. When: agency/portfolio/fashion; delivers taste's required asymmetry for free. Hardest to hold together at 768px — design the tablet layout explicitly.

## Above-fold performance

- Text LCP beats image LCP; when the variant allows, make the headline the LCP element.
- Image LCP: static import + `<Image src={heroImg} alt="…" fill preload sizes="100vw" placeholder="blur" className="object-cover" />` inside a sized relative container. Never `loading="lazy"` here. `priority` is deprecated in Next 16 — the prop is `preload`.
- No motion library on first paint when avoidable: entrance animation via CSS keyframes registered as `--animate-*` tokens in `@theme`, keeping hero.tsx a server component. If the signature move truly needs motion/react, isolate it in one `"use client"` child importing from `"motion/react"`, wrapped in `LazyMotion` with `m.` components — the hero never pulls the full motion bundle above the fold.
- Zero CLS: `min-h-[100svh]` or explicit aspect boxes — never a height that depends on image load. next/font handles fallback metrics; no manual compensation.
- One entrance choreography maximum: headline → subline → CTA, 400-700ms total, 40-80ms stagger, then STOP. Nothing in the hero loops forever except a `ultraweb:showpiece` element that earned it, the scroll cue (Supporting cast), or a DIRECTION-sanctioned living idle per `ultraweb:motion-language` (≤2 elements, transform-only, behind reduced-motion).
- A heavy showpiece hero earns a designed loading moment, never a spinner (`award-canon`: The Loader is the Overture): its final frame IS the hero's first frame for a seamless handoff, it stays skippable, and it cuts instantly under reduced-motion. `page-transitions`/`showpiece` own the mechanism; the hero owns the frame handed to it.

## CTA hierarchy

- One primary (filled, accent) + at most one secondary (ghost or arrow-link). Two filled buttons = no decision made.
- Primary label is a verb phrase specific to the brief ("Book a table", "Start free trial") — "Learn more" is never the primary.
- 44px minimum hit target; hover 150-250ms on transform/color only; focus-visible ring from palette tokens, never the browser default.

## Supporting cast

- Subheadline: one or two sentences, 1.125-1.25rem, max 60ch, muted foreground. The headline claims; the subline proves. No third paragraph.
- Eyebrow/kicker above the headline: 0.75-0.875rem, uppercase, wide tracking — only when DIRECTION.md wants editorial structure, never a pill by reflex.
- At most ONE proof element in the hero (logo strip, rating, or a single stat), placed after the CTA — it supports the CTA, never competes with it.
- Scroll cue only when the fold hides essential content: a 12-16px drift on a ~2s period, removed under prefers-reduced-motion.

## Accessibility

- Exactly one `<h1>` per page, and it is the hero headline; display words split for visual effect stay inside the one h1 (spans).
- Overlay text contrast computed against the darkest AND lightest region it can sit on — verified, not eyeballed.
- alt text describes content, never "hero image"; purely decorative media gets `alt=""`.
- Reduced motion: content appears instantly — no fade-from-nothing that leaves text invisible when animation is disabled.

## Anti-patterns

- `priority` on next/image (deprecated — use `preload`); `loading="lazy"` on the LCP image.
- `bg-clip-text text-transparent` gradient headline; `from-purple-` anywhere near the hero — the banned-list default move.
- `import { motion } from "framer-motion"` — legacy alias; any motion import in a server-component hero.
- `h-screen` clipping content on short viewports — use `min-h-[100svh]`.
- Headlines starting "Welcome to", "Elevate your", "Unlock" — dead copy; rewrite.
- Carousel or slider heroes — nobody sees slide 2; commit to one message.
- Two filled CTAs; a badge-pill above the headline ("✨ New: …") as a reflex — emoji banned, pill only if DIRECTION.md justifies it.

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

## Composes with

- ultraweb:copywriting — the headline is written before it is typeset; hero copy rules live there.
- ultraweb:buttons — CTA variants, sizes, and states come from the button system, never ad-hoc styles.
- ultraweb:media-optimization — the full LCP asset pipeline: formats, sizes, blur placeholders.
- ultraweb:showpiece — when DIRECTION.md demands a canvas/3D hero; this skill owns the static fallback.
- ultraweb:scroll-motion — hero exit choreography and scroll cues are its jurisdiction, not the hero's.
- ultraweb:gate-performance — independently verifies the LCP/CLS claims made here; never self-certify.
- ultraweb:physics — owns the cursor-proximity answer for any hero signature move that tracks the pointer; the hero hands its gesture island there, keeping scroll-motion for scroll-driven work only.
- ultraweb:typography — the hero pulls the `--text-display` clamp() scale and the display tracking/leading tokens from here; the headline uses that scale rather than hand-tuned sizes.
- ultraweb:layout-grid — the split and editorial-offset variants sit on the grid this skill defines; column ratios (55/45, 60/40) come from there, not ad-hoc widths.
- ultraweb:imagery — full-bleed and product-shot heroes request their hero art and treatment (overlay scrim, grain) from here before media-optimization sizes the file.
- ultraweb:wireframe — the hero's block skeleton — headline zone, CTA slot, media placement — is planned upstream in the wireframe; this skill builds that block to grade.
- ultraweb:award-canon — names the hero-as-type stance (Type as the Image), The Persistent Hero Object these variants execute, and The Loader is the Overture a heavy hero earns; borrow the principle, never the winner's surface.
