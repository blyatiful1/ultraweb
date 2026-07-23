# QA — gate log

## Phase 5 — scaffold (2026-07-23)
- Versions verified via `npm view`: next 16.2.11 (STACK 16.2.10 — patch drift, proceeded), tailwindcss 4.3.3, motion 12.42.2, lucide-react 1.26.0, zod 4.4.3, next-themes 0.4.6; three 0.185.1 + @react-three/fiber 9.6.1 + @react-three/drei 10.7.7 (React-19 line) installed for the DIRECTION-commissioned showpiece.
- shadcn init SKIPPED deliberately: the build needs ~2 primitives; hand-written token-native primitives avoid the untouched-shadcn default look. Logged as a scaffold deviation.
- tsconfig strict: true. No tailwind.config.js. globals.css is the full token file (SYSTEM.md encoded verbatim, era worlds included).
- Smoke test: `npm run build` exit 0, zero type errors, routes / and /_not-found static. Dev server HTTP 200 on :3100.

## Pending gates
- gate-code, gate-responsive, gate-visual, gate-accessibility (incl. computational AA for all pairs × 2 themes × 4 worlds), gate-performance, gate-antislop, gate-content — run in Phase 11.
- Showpiece budget record (bundle delta) — after Phase 6/9 build.
