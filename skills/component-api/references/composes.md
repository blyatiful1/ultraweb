## Composes with

- ultraweb:tokens — supplies every token-backed utility a `cva()` variant row resolves to; rule 2 forbids anything else.
- ultraweb:buttons — the canonical `variant`/`size`/`tone` + `asChild` implementation; the reference this contract generalizes.
- ultraweb:cards — the canonical compound-component (context + `X.Header`/`X.Body` + `data-slot` parts) obeying rule 8.
- ultraweb:forms — inputs express validity through `tone` and forward native + `aria-*` attributes per rule 6.
- ultraweb:pricing, ultraweb:data-display — inherit the prop vocabulary for their tier cards and table/stat components.
- ultraweb:hero — its CTA pair uses `asChild` link-buttons and the shared size scale.
- ultraweb:ui-states — skeleton/empty/error states are `variant`s or `tone`s on the same components, never separate one-off components.
- ultraweb:icons — icon slots forward through `...props`; icon-only components still demand `aria-label` (a11y pass-through, rule 6).
- ultraweb:app-structure — decides where a component is a server vs client leaf; this skill decides its prop shape regardless of that boundary.
- ultraweb:gate-code — greps the tree for every violation named in Anti-patterns, empirically enforcing this contract at Phase 11.
