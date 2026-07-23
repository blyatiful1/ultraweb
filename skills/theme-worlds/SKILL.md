---
name: theme-worlds
description: Re-map @theme tokens for a subtree — a per-case-study accent, a per-route palette, a per-scroll-act mode shift — using native CSS @scope and data-world/data-mode attribute scoping instead of a React ThemeProvider, keeping every value in tokens and every world AA-verified in both light and dark. Invoke opt-in when BRIEF.md flags a multi-brand, multi-tenant, or per-case-study need (agency portfolios, per-section palette shifts, a time-boxed campaign world), whenever award-canon's Scroll-as-Journey per-room data-mode or Content-Derived Color needs a scoped palette, or when the user says "per-case-study colors", "multi-brand theming", "a different accent per section/route", "theme this part of the page differently", or "scoped theme without a provider".
---

# theme-worlds — scoped palettes without a provider

**Stage:** Phase 3 — Foundation (opt-in, after color/tokens) and Phase 6 — Build - **Reads:** design/SYSTEM.md §color, design/BRIEF.md, app/globals.css - **Writes:** the per-world token block in globals.css + the `data-world`/`@scope` application on sections and routes

## Standard

Theming is not a binary switch — it is a scoping problem: *which subtree gets which token values*. The platform now answers it natively (`@scope` + attribute selectors re-declaring a custom property on a subtree), so a site with per-case-study accents, per-route palettes, or per-act mode shifts needs **zero** React context. Steal the principle — scoped token resolution — never the surface — a `ThemeProvider` tree.

- **A world is an ACCENT re-map, not a re-skin.** It overrides the accent family (`--primary`/`--ring`/`--accent` + their foregrounds) for one subtree and nothing else — never the neutral ramp, type scale, radius, or motion. Duplicating the whole token set per brand is the smell of no system.
- **Two orthogonal axes.** *Mode* (light/dark — whole document, next-themes `.dark` class) owns surfaces; *world* (accent/palette — per-subtree, `data-world`) owns emphasis. A world never touches a surface; dark mode owns those. They compose (`.dark [data-world="x"]`), never collide.
- **Every value stays a token.** A world re-points `--primary` at another token already defined in globals.css by color/tokens — never an inline `oklch()` on a component, never a raw hue baked into markup.
- **Every world passes AA in BOTH modes.** A world adds accent-on-surface pairs; each goes through color's contrast script exactly like the base accent. An unverified world does not ship — defer the math to ultraweb:color.
- **Restraint — a world must serve content.** One sentence tying THIS subtree to THIS palette (a featured client's identity, a Scroll-as-Journey act, a tenant's brand) or it is cut. Worlds that multiply for novelty fight the site's ONE signature move (taste).

## The mechanism — override the underlying var, not the utility

tokens bridges every color through `@theme inline` (`--color-primary: var(--primary)`), so the utility `.bg-primary` inlines `var(--primary)`. Re-declare `--primary` on any subtree and every `bg-primary`/`text-primary`/`ring-primary` inside it resolves to the new value — the whole reason color/tokens use `inline`. A world is that re-declaration, scoped:

```css
/* globals.css — worlds are TOKENS defined by color/tokens: light + dark, both AA-checked */
:root {
  --world-nord: oklch(0.55 0.13 245);  --world-nord-fg: oklch(0.98 0.01 245);
  --world-rust: oklch(0.56 0.15 45);   --world-rust-fg: oklch(0.98 0.01 60);
}
.dark { /* accent re-decided for dark per color's rules — not the light value on a dark ground */
  --world-nord: oklch(0.72 0.11 245);
  --world-rust: oklch(0.74 0.13 45);
}

/* the world: re-point the accent family for the subtree — nothing else */
[data-world="nord"] { --primary: var(--world-nord); --primary-foreground: var(--world-nord-fg); --ring: var(--world-nord); --accent: var(--world-nord); }
[data-world="rust"] { --primary: var(--world-rust); --primary-foreground: var(--world-rust-fg); --ring: var(--world-rust); --accent: var(--world-rust); }
```

```tsx
// application — a plain attribute on a server component; no provider, no "use client", no re-render
<article data-world={caseStudy.world}>
  <Button>View case</Button> {/* bg-primary now resolves to this world's accent */}
</article>
```

Inherited custom properties resolve to the nearest ancestor that sets them, so **nested worlds already work** — a `[data-world="rust"]` inside a `[data-world="nord"]` gets rust by cascade proximity, no `@scope` required. `@scope` earns its place only when a world ships a *scoped rule* (not just token values) that must respect a lower boundary — then its donut + proximity semantics are the native tool:

```css
/* a world that styles links with its own accent, stopping at the next nested world */
@scope ([data-world]) to ([data-world]) {
  a:hover { color: var(--primary); } /* uses this world's accent; will not paint into a child world */
}
```

**Support & fallback.** The attribute-override baseline is universal (Tailwind v4 already requires modern CSS). `@scope` is Baseline mid-2024 (Chrome 118, Safari 17.4, Firefox 128) — broadly available by 2026 but not ancient-safe, so treat it as progressive enhancement (award-canon's rule): reach for it only for the donut-rule case, and author so the no-`@scope` state is already correct — an accent-only world with no scoped rules needs no `@scope` at all and degrades to nothing.

## Variants

- **Case-Study Accent World** *(agency / portfolio — the canonical use)* — each case-study or project subtree carries `data-world`, re-pointing the accent to the featured client's identity color, ideally *extracted from the case's hero at build time* (award-canon's Content-Derived Color) and written as a `--world-<slug>` token. Use it when the site's job is to showcase distinct brands and each item has its own color.
- **Route-Level World** *(multi-audience / multi-tenant)* — a whole route or route-group carries `data-world` on its `layout.tsx` (server), so `/enterprise` reads cool and authoritative while `/startup` reads warm off the same neutral system, or a `[tenant]` segment swaps the accent per client with no per-tenant build. Use it for one product with distinct audience landings, or genuine multi-tenancy. The *Seasonal/Campaign* case is the same move, time-boxed: scope a promo skin to one region via `data-world`, delete the attribute to remove it — never fork the token set.
- **Scroll-Act Mode Shift** *(`data-mode` per room — Scroll-as-Journey)* — a long authored page whose named acts each carry a static `data-mode` re-pointing the accent as the reader travels; the palette form of award-canon's per-room shift. Use it only when scroll-motion has committed to Scroll-as-Journey. The *shift* is just scrolling from one statically-themed `<section>` to the next — no scroll listener re-theming, no client state.

## Anti-patterns

- A second `ThemeProvider` or `createContext` for palettes — the exact machinery `@scope`/`data-world` exists to replace; grep for a new context wrapping color.
- Duplicating the whole token set per world (`--world-x-background`, `--world-x-radius`, a per-brand type scale) — that is a re-skin, not a world; a world overrides the accent family only.
- Inline `oklch()`/hex on a component, or `data-hue="142"` → `oklch(… attr())` — every world value is a token in globals.css; typed `attr()` color is too new to depend on.
- A world overriding a surface (`--background`/`--card`) — that is the mode axis, not the world axis; touching surfaces means every surface pair must be re-verified and the two axes have collided.
- Shipping a world with no color AA output for its accent pairs in both modes — same bar as the base accent, no exceptions.
- Decorative worlds — a different accent per section for novelty, worlds multiplying past the content that justifies them, a world fighting the site's ONE signature move.
- `!important` to force a world to win — if it isn't winning you overrode the wrong thing (override `--primary`, not `.bg-primary`); cascade proximity or `@scope` resolves it, `!important` only hides the mistake.
- `"use client"` to set `data-world` — it is a static server-rendered attribute; a world never needs a client boundary.

## Worked example — Studio Norra, Oslo agency portfolio

DIRECTION.md commits Editorial Brutalist; the base palette is warm paper + a single signal-red accent `oklch(0.6 0.21 25)`; the signature move is cursor-proximity case-study reveals on `/work`. The brief's tension — one studio voice that still lets each client's work read as *itself* — is exactly a scoping problem, not a switch.

Each case study is lit by its own accent world. For every `/work/[slug]`, color extracts 2–3 OKLCH values from the case's hero (Content-Derived Color), re-decides the accent for dark, verifies both pairs, and hands tokens a `--world-<slug>` set; the `<article>` carries `data-world={slug}`. What stays constant across every world is the studio's hand: Archivo Expanded at the same fluid scale, the exposed 12-column grid, the near-zero brutalist radius, the settle-on-a-spring motion. Only the accent shifts — so `bg-primary` CTAs, focus rings, and link hovers take the featured client's color while the system reads as one authorship.

On the long `/studio` page, three acts — Practice / Process / People — each carry a static `data-mode` re-pointing the accent as you scroll (the Scroll-as-Journey per-room shift in palette form), while surfaces stay put because dark mode owns those. The act shift is pure scrolling between statically-themed sections; no listener, no JS.

Rejected: giving each world its own neutrals and type — that is eight micro-sites, not one studio with eight clients (the re-skin anti-pattern). Rejected: a `ThemeProvider` re-rendering on route change to swap the palette — the accent is a server-rendered `data-world` attribute with zero client state. Rejected: a client's neon brand accent that failed 4.5:1 on the paper ground — color lowered its L before it shipped; a world that can't clear AA is not a world.

Handoff: ultraweb:color defines and AA-verifies each `--world-*` pair in both modes → ultraweb:tokens lands them in globals.css beside the base palette → the `data-world`/`data-mode` attributes sit on the `<article>`/`<section>` server components (ultraweb:app-structure — no client boundary) → ultraweb:scroll-motion drives the cursor-proximity reveal and the `/studio` act shift these worlds ride on.

## Composes with

- ultraweb:color — defines and AA-verifies every `--world-*` accent pair in both modes; theme-worlds owns the scoping mechanism, color owns the values and the contrast proof.
- ultraweb:tokens — lands the world tokens in globals.css and supplies the `@theme inline` bridge that makes re-declaring `--primary` on a subtree cascade to every utility; worlds work *because* tokens used `inline`.
- ultraweb:depth — shadows use `--shadow-color` (a neutral), so an accent-only world leaves elevation untouched by construction; a world re-tinting shadows would collide with the mode axis.
- ultraweb:app-structure — worlds are static server-rendered `data-world`/`data-mode` attributes (route layout, section, or article), never a provider; the "no new context in the root layout" rule applied to theming.
- ultraweb:scroll-motion — the Scroll-as-Journey per-act `data-mode` shift rides on this skill's mechanism; the shift is scrolling between statically-themed sections, not a scroll listener re-theming.
- ultraweb:award-canon — Content-Derived Color (derive the world from the content) and Scroll-as-Journey (per-room `data-mode`) are the principles this skill executes at the cheapest rung — steal the scoped-palette principle, never the ThemeProvider surface.
- ultraweb:cards — the case-study/project card is the usual `data-world` carrier in a portfolio grid; each card lights its own accent while its structure stays the site-wide card.
