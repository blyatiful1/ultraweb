## Composes with

- ultraweb:motion-language — supplies the duration/easing tokens; this skill spends them, never mints them.
- ultraweb:buttons — the CTA system's hover/active/loading states get their timing and physics here.
- ultraweb:forms — input focus treatment and validation-feedback timing.
- ultraweb:depth — every hover lift pairs its transform with a step on the elevation scale.
- ultraweb:color — the chrome-level pass (`::selection`, caret, scrollbar, optional cursor) draws every value from the palette tokens; nothing here is a raw hex, and the `::selection` pair is AA-checked like any other.
- ultraweb:gate-antislop — a default, unstyled scrollbar and default selection color are on its tell list; the chrome-level branding here clears them.
- ultraweb:physics — anything gesture-tracking (magnetic pull, drag) graduates there; don't double-treat one element.
- ultraweb:animejs — reachable only when a DIRECTION-commissioned SVG moment already installed it; the text-scramble may then escalate to `splitText`/`scrambleText`, never the reverse.
- ultraweb:gate-accessibility — verifies the focus-visible coverage and reduced-motion behavior installed here.
- Consumed by the component-tier skills (cards, pricing, data-display, social-proof, …) — they pull their hover/press/focus timing from these patterns rather than inventing per-component motion.
- ultraweb:navigation — the nav link-underline variants (grow-from-left, exit-through-right) and active-item treatment are specified here; navigation wires them onto the real nav.
- ultraweb:faq — the accordion trigger's chevron rotate and expand timing come from this skill's icon-micro-motion patterns.
- ultraweb:award-canon — the Instant Everything pattern (prefetch adjacent media, keep it mounted, opacity-crossfade heavy swaps) is cited here; perceived speed is its own polish signal.
