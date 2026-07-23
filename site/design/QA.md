# QA — gate log

## Phase 5 — scaffold (2026-07-23)
- Versions verified via `npm view`: next 16.2.11 (STACK 16.2.10 — patch drift, proceeded), tailwindcss 4.3.3, motion 12.42.2, lucide-react 1.26.0, zod 4.4.3, next-themes 0.4.6; three 0.185.1 + @react-three/fiber 9.6.1 + @react-three/drei 10.7.7 (React-19 line) installed for the DIRECTION-commissioned showpiece.
- shadcn init SKIPPED deliberately: the build needs ~2 primitives; hand-written token-native primitives avoid the untouched-shadcn default look. Logged as a scaffold deviation.
- tsconfig strict: true. No tailwind.config.js. globals.css is the full token file (SYSTEM.md encoded verbatim, era worlds included).
- Smoke test: `npm run build` exit 0, zero type errors, routes / and /_not-found static. Dev server HTTP 200 on :3100.

## Phase 11 — gates (2026-07-23, 5 Sonnet measurement agents + Opus design-judge on the rendered site)
- **gate-antislop: PASS** — 11/11 grep rows clean, We-will-NOT list verified visually, no game assets in public/, no scroll hijacking, no glow/gradient/emoji/dead copy.
- **gate-content: PASS after fixes** — all 11 pages 200, anchors resolve, unique metadata, sitemap/robots/OG/icon valid, facts match RESEARCH.md. Fixed: dead homepage skip link (id="main" added), 23→25-year Dust II figure, Cache acquisition re-hedged.
- **gate-accessibility: PASS after fixes** — full contrast matrix both themes + 4 worlds computational; only failure was --world-goldsrc light at 4.42:1 → darkened to L 0.52, re-measured 5.04:1. Reduced-motion, keyboard, landmarks, headings, SVG labels all verified passing.
- **gate-responsive: PASS after fixes** — no overflow/overlap/truncation at 375/768/1440, both themes, H1 visible at first paint everywhere. Fixed: reveals stuck at opacity:0 on instant scroll jumps → native IntersectionObserver once-latch + mount force-latch in journey-reveal (re-verified: scrollTo 50/75/100% and /#act-iii hash arrival all render); 32px tap targets → 40px (theme toggle, chips).
- **gate-code: PASS after fixes** — tsc strict clean; 29 ESLint errors fixed with zero eslint-disable (seeded PRNG for smoke layout, ref-based per-frame mutation in the R3F scene, useSyncExternalStore mounted flags, registry property lookups, JSX string-brace chrome); `npx eslint app components lib --max-warnings=0` exit 0.
- **design-judge (Opus 4.8): Design 8 · Usability 8 · Creativity 8 · Content 9 · Coherence 9 · Award-readiness 8** — verdict FIX-FIRST on three P1s, all landed: mid-compile stages lifted (lerped base color, emissive floor, ramping rim light — diorama never reads as void), closer clipping fixed (scroll-mt + header-safe padding), spine→atlas hand-off bridged (survey-line waypoint band); plus P2/P3: demand-driven frameloop invalidation on any scroll arrival, mobile act heights (72svh <sm), solid act cards with era-accent leading edge (glass removed).
- Showpiece budget: first-load JS for `/` ≈ 267 kB (three.js+R3F delta accepted deliberately per DIRECTION); all other routes ~130 kB. 18 static pages.
