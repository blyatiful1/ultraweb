## Worked example — Tidepool, first cold pass of the code gate

design/SITEMAP.md lists six routes for the "Precision Instrument" build — `/`, `/product`, `/pricing`, `/docs`, `/changelog`, `/login`. The cold pass caught two defects worth recording:

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 2 | npx tsc --noEmit | FAIL → PASS | `app/(marketing)/changelog/page.tsx` read `searchParams.tag` without `await` — a Promise in Next 16 |
| 5 | RSC boundary audit | FAIL → PASS | `components/hero/berth-timeline.tsx` imports `motion/react`, no `"use client"` |
| 8 | token contract + AA | FAIL → PASS | `--muted-foreground` on `--muted` in `.dark` measured 4.19:1; `var(--surface-2)` in `components/pricing/tier-card.tsx` was undeclared |

The signature-move defect (check 5): the live-updating berth timeline animates its JetBrains Mono numerals with `useSpring` from `motion/react` but shipped as a server component, so `grep -rl "motion/react" app components | xargs -r grep -L "use client"` returned it. Fix: `"use client"` added at that one leaf — `app/(marketing)/page.tsx` stayed a server component composing it. Re-check returned empty; the census held at 11 client files, 0 in layouts.

The token-contract script (check 8) caught what eyeballing had missed on both counts: in `.dark`, `--muted-foreground` — the pricing fine-print color — sat at 4.19:1 on `--muted`, so its lightness went 0.62→0.68 to clear 4.5:1; and `components/pricing/tier-card.tsx` still referenced `var(--surface-2)`, a token renamed to `--surface-raised` weeks earlier, which had been rendering transparent unnoticed. Both fixes are owned by ultraweb:tokens/ultraweb:color; the script re-ran to exit 0.

Rejected the lazy fix of hoisting `"use client"` onto `app/(marketing)/layout.tsx` to make the hook error vanish — that turns the whole marketing tree client and defeats the boundary plan; the directive belongs at the leaf. Check 2's fix — `await`-ing `searchParams` before reading `.tag` in `app/(marketing)/changelog/page.tsx` — re-ran `npx tsc --noEmit` to exit 0, silent, and is owned by ultraweb:routing, which takes back every unawaited `params`/`searchParams`; the check 5 boundary fix stays with ultraweb:app-structure. The dated PASS lands in design/QA.md, and ultraweb:gate-performance reads the same client-file census next for bundle weight.
