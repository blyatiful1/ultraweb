## Worked example — Tidepool, berth-utilization surface on /product

design/SYSTEM.md pairs General Sans (UI) with JetBrains Mono (data/numerals) on the dark-first "Precision Instrument" palette — so every figure already sits in a monospace, natively-tabular font, no tnum audit needed.

Decision for the `/product` berth table — **Dense** variant, 42px rows, 13px text, hairline row separators on surface `oklch(0.18 0.015 250)`. Column spec:
- Port — text, left, General Sans
- Calls — int, right, 0 decimals, JetBrains Mono `tabular-nums`
- Avg wait (h) — number, right, 1 decimal
- Utilization (%) — number, right, 1 decimal

Units stated once in the header, values formatted via `Intl.NumberFormat`, never string math. Above it a 3-KPI stat row: value 2.75rem semibold JetBrains Mono ("4.2h", "12,480", "94.0%"), labels 0.8125rem muted, deltas a direction icon plus teal accent `oklch(0.68 0.12 200)`, captioned "last 30 days". Responsive: priority columns — Port + Utilization survive to 375px, Calls and Avg wait (h) both go `hidden md:table-cell`.

Rejected a donut-with-centered-KPI for utilization: the question is "which ports are congested", which a ranked horizontal-bar list answers directly — a pie hides the ordering the analyst is scanning for.

Output lands in `components/data/berth-table.tsx`; ultraweb:pricing inherits this alignment and markup spec for the `/pricing` Starter/Growth/Fleet comparison matrix.
