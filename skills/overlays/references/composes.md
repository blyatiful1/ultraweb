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
