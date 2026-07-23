---
name: overlays
description: Build every transient layer on the native platform — the HTML Popover API (popover/popovertarget, top-layer, light-dismiss, ::backdrop) and CSS Anchor Positioning (anchor-name/position-anchor/position-area/position-try) as the default for menus, dropdowns, tooltips, comboboxes, and popovers, retiring z-index wars, portal hacks, and JS focus-trap libraries. Three named variants (anchored popover, modal dialog, manual toast stack), a Baseline-2026 default with a scoped @supports flip fallback, and @starting-style entry/exit motion. Invoke in the Build phase for any overlay work — trigger phrases — "dropdown menu", "tooltip", "popover", "toast", "modal", "z-index war", "the menu sits behind something", "position a menu under a button", "replace the Radix/portal dropdown".
---

# overlays — the platform owns the top layer

**Stage:** Phase 6 — Build - **Reads:** design/SYSTEM.md §depth/§motion, design/DIRECTION.md - **Writes:** components/ui/{popover,tooltip,toast}.tsx as native-primitive wrappers + overlay usage rules

## Standard

Every transient layer — dropdown, tooltip, combobox listbox, actions menu, toast — defaults to the HTML **Popover API** plus **CSS Anchor Positioning**. This is not progressive enhancement to bolt on later: core anchor positioning (`anchor-name`, `position-anchor`, `anchor()`, `position-area`) reached **Baseline 2026** (Chrome 125+, Safari 18.2+, Firefox 132+), and the Popover API has been Baseline since 2023–24. Together they retire an entire recurring class of defects — z-index escalation, React portals, and hand-rolled focus-trap libraries — because the browser owns three things you used to fake: **top-layer stacking** (no z-index, ever), **light-dismiss** (Escape + outside-click on `auto` popovers, focus returned to the invoker), and **positioning relative to a trigger** without JS measuring rects on every scroll. JS supplies only content and open/close intent.

First-grade here: the invoker is always a real `<button popovertarget>`; positioning is declarative CSS, never `getBoundingClientRect` in an effect; entry/exit motion rides `@starting-style` + `allow-discrete`, not a mount/unmount library; and every overlay is keyboard- and reduced-motion-complete before it ships. The one real support gap is scoped and handled (see Degradation).

## Variants

**anchored popover** — menus, dropdowns, tooltips, combobox listboxes, date-picker panels. `popover` (`auto`) for anything light-dismissible; anchor it to its trigger with `anchor-name`/`position-anchor` + `position-area`. This is the default for ~90% of overlays and the reason this skill exists.

```html
<button class="acct-trigger" popovertarget="acct" aria-label="Account">…</button>
<div id="acct" popover class="acct-menu"> <!-- role/items decided below --> </div>
```

```css
/* Base: engines without anchor positioning still get a placed box */
.acct-menu { position: absolute; top: calc(100% + 0.5rem); right: 0; }

@supports (anchor-name: --a) {
  .acct-trigger { anchor-name: --acct; }
  .acct-menu {
    position-anchor: --acct;
    position-area: bottom span-left;     /* below the trigger, right edges aligned */
    top: auto; right: auto;              /* hand placement to the engine */
    margin-top: 0.5rem;
    position-try-fallbacks: flip-block;  /* flip above when the viewport bottom is tight */
  }
}
```

**modal dialog** — confirmations, forms, anything that must own focus and block the page. This is `<dialog>` + `dialogRef.showModal()`, **not** a popover: `showModal()` gives you a real focus trap, background `inert`, and a `::backdrop` scrim for free — the exact things `popover="manual"` does *not* provide. Reach for it only when the interaction is genuinely modal; a menu that inerts the whole app to show four links is modal overkill. (A non-modal `<dialog popover>` is also valid for a dismissible panel that shouldn't trap focus.)

**manual toast stack** — status notifications in a fixed corner region. `popover="manual"` (never `auto` — outside-click must not nuke a toast), multiple allowed open at once so they stack, each auto-dismissing on a timer plus an explicit close button. Announce content through an `aria-live="polite"` region, not through popover semantics. Owned in the e-commerce path by `ultraweb:cart` (add-to-cart confirmation), which consumes this variant.

## When to reach past native

- **Roving-focus menus** (`role="menu"` with arrow-key navigation, typeahead, submenus): the Popover API gives you the layer and dismissal but **not** arrow-key focus management. Either wire that JS yourself, or — usually better — render a plain list of `<a>`/`<button>` and skip `role="menu"` entirely; a short actions menu rarely needs the menu pattern.
- **Complex composite widgets** — comboboxes with `aria-activedescendant`, multi-level menus, rich date pickers: a shadcn/Radix primitive still earns its keep for the ARIA state machine. Keep it, but let it position via anchoring rather than a JS positioning engine where the version supports it.
- Everything else — tooltips, single-level dropdowns, popovers, notifications — is native. Do not install a positioning or focus-trap dependency for these.

## Motion & degradation

Entry/exit animates across the top-layer `display` toggle via discrete-property transitions — no `AnimatePresence`, no client component:

```css
.acct-menu {
  opacity: 0; transform: translateY(-4px);
  transition: opacity 180ms var(--ease-out), transform 180ms var(--ease-out),
              overlay 180ms allow-discrete, display 180ms allow-discrete;
}
.acct-menu:popover-open { opacity: 1; transform: translateY(0); }
@starting-style { .acct-menu:popover-open { opacity: 0; transform: translateY(-4px); } }
@media (prefers-reduced-motion: reduce) { .acct-menu { transition: none; transform: none; } }
```

Durations and easing come from SYSTEM.md §motion (micro band, 150–250ms) — never a fresh magic number. **Degradation is narrowly scoped:** only the `@position-try` viewport-flip lags full convergence (Safari 18.4+/26+, Firefox 147+). The base rule above already ships a static offset for pre-anchor engines, and where flip isn't honored the popover simply stays in its declared `position-area` instead of flipping — anchored and usable, never broken. Reach for `motion/react` only when an overlay's content needs spring physics CSS can't express; the layer, dismissal, and positioning stay native.

## A11y

- Invoker is a real `<button popovertarget>`; the browser reflects open state as `aria-expanded` and wires `aria-details`. Never a `<div onClick>`.
- `auto` popovers are non-modal by design — focus is *not* trapped, which is correct for menus and tooltips. Escape and outside-click dismiss, returning focus to the invoker. If you need a trap + inert background, that's `<dialog>.showModal()`, not a manual popover.
- Tooltips: link trigger and tip with `aria-describedby`; the tip must be hoverable and Escape-dismissible (WCAG 2.2 §1.4.13), and never the only home for essential info.
- Toasts announce via `aria-live="polite"`; timing gives readers time (non-critical ≥5s or dismissible), and dismissal is keyboard-reachable.
- `::backdrop` on an `auto` popover is decorative only — it does not inert the page; a real scrim implies a modal, so use `<dialog>`.

## Anti-patterns

- `z-[9999]` (or any hand-tuned z-index) on something that should live in the top layer — grep overlay components for `z-\[`; a popover/dialog needs none.
- Installing a JS focus-trap or portal library for a plain dropdown, tooltip, or single dialog — the platform does it now.
- `popover="auto"` on a toast — light-dismiss deletes it on the next outside click; toasts are `manual`.
- `popover="manual"` used as a modal expecting a focus trap or inert background — it provides neither; that's `<dialog>.showModal()`.
- `role="menu"` with no arrow-key roving focus wired — broken menu semantics; either implement it or drop the role for a link/button list.
- Anchoring with no `@supports (anchor-name)` / static-offset fallback — older engines render an unplaced box in flow.
- A `transition` on a popover with no `allow-discrete` on `display`/`overlay` — it pops in and snaps out with no exit motion.
- A gray drop-shadowed panel with `rounded-xl shadow-lg` — overlay depth comes from SYSTEM.md §depth (tinted shadow), like every other surface.

## Worked example — Tidepool, SaaS account menu

DIRECTION.md: "Precision Instrument — calm, data-forward, dark-mode first-class"; General Sans, dark surface `oklch(0.18 0.015 250)`, teal accent `oklch(0.68 0.12 200)`. The authenticated header carries an avatar button top-right; clicking it opens a four-item account menu (Settings, Billing, Docs, Sign out).

Before: a Radix `DropdownMenu` in a portal, carrying its own z-index and positioning engine. Rebuilt as a native `auto` popover — `<button class="acct-trigger" popovertarget="acct-menu">` with `anchor-name: --acct` on the trigger, `position-anchor: --acct` + `position-area: bottom span-left` on the panel so its right edge tracks the avatar, `position-try-fallbacks: flip-block` to open upward on a short viewport. It renders in the top layer, so the header's own `overflow` and the app grid's stacking context no longer matter — the whole z-index/portal problem evaporates. Panel surface is `oklch(0.21 0.015 250)` with a §depth tinted shadow (not gray), entry via `@starting-style` opacity+`translateY(-4px)` at 180ms on `--ease-out`, dropped under reduced motion. The four items are plain `<a>`/`<button>` — no `role="menu"`, so no arrow-key JS to maintain — and Escape or an outside click light-dismisses back to the avatar. Sign-out gets the destructive token; the focus-visible ring is teal `oklch(0.68 0.12 200)`.

Rejected: keeping the Radix portal "because it works" — its portal-and-z-index machinery is precisely the class of bug the top layer retires, and it shipped 30KB to position four links. Also rejected: `showModal()` for the menu — trapping focus and inerting the app so someone can click "Billing" is modal overkill; a non-modal `auto` popover lets them click straight back into the dashboard.

Handoff: `ultraweb:navigation` places the avatar trigger in `components/layout/header.tsx`; `ultraweb:gate-accessibility` runs the keyboard walk (Tab to avatar, Enter opens, Escape closes and returns focus, ring visible on every item) before it ships.

## Composes with

- ultraweb:navigation — mega-menus, mobile menus, and the header account menu are anchored popovers built on this primitive; navigation places the trigger, this skill owns the layer.
- ultraweb:buttons — every overlay invoker is a button-system `<button>` at the right variant; the trigger's states come from there.
- ultraweb:forms — the native select listbox, autocomplete/combobox panel, and validation popovers anchor with this skill (escalating to a Radix combobox only for `aria-activedescendant` widgets).
- ultraweb:cards — a card's overflow/hover menu opens as a popover in the top layer instead of being clipped by the card's `overflow-hidden`.
- ultraweb:cart — the add-to-cart confirmation is the manual toast-stack variant defined here.
- ultraweb:command-palette — the palette is a modal `<dialog>` overlay; it inherits the focus-trap and scrim rules from the modal variant here.
- ultraweb:data-display — chart and data-point tooltips are anchored popovers, positioned to the hovered mark.
- ultraweb:micro-interactions — supplies the hover/focus timing for triggers and the tooltip show/hide feel; this skill owns the layer, that skill the polish.
- ultraweb:motion-language — the `@starting-style`/`allow-discrete` durations and easing are spent from its §motion tokens, never minted here.
- ultraweb:depth — overlay elevation (tinted shadow, surface tint) comes from SYSTEM.md §depth, not an ad-hoc `shadow-lg`.
- ultraweb:gate-accessibility — runs the keyboard walkthrough (Escape dismiss, focus return, ring coverage, tooltip hoverability) that proves every claim above.
