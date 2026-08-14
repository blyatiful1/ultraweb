## Worked example — Studio Norra, work-index row feedback

design/SYSTEM.md §motion pins the micro band to 150–200ms on a single `--ease-out`; design/DIRECTION.md reserves signal red `oklch(0.6 0.21 25)` for interaction states only — it must never appear at rest.

Decision: on `/work`, each index row's left rule draws in on hover and focus — the link-underline pattern turned vertical (`background-size: 2px 0% → 2px 100%`, 200ms `var(--ease-out)`) — and the only places red surfaces are that rule plus `focus-visible:ring-2 ring-[oklch(0.6_0.21_25)] ring-offset-2` against paper. Case-study titles set in Archivo Expanded stay dead-flat; no transform touches the type block. Chrome-level: `::selection` is paper-on-signal-red (checked AA in both themes), the scrollbar thumb the hairline `border` token, caret the signal red — no custom cursor, since the grid is already gesture-tracked and a second cursor layer would fight it.

Rejected: `hover:-translate-y-1` + a `depth` shadow step on the rows. Editorial Brutalist is an exposed, flat grid — a lifting, drop-shadowed card reads as stock SaaS and softens the rawness the direction is built on. The rule-draw carries the whole feedback instead.

The cursor-proximity image reveal (the signature move) is gesture-tracking, so it graduates to ultraweb:physics rather than being double-treated here — but its hover-revealed client+year label is content, not chrome, so it gets a `:focus-within` twin that surfaces the same label when the row's link takes keyboard focus and holds it until blur or `Escape`. The focus-visible, hover-parity, and reduced-motion states installed here hand off to ultraweb:gate-accessibility, which greps the build for any `focus:outline-none` left without a replacement.
