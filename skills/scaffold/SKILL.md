---
name: scaffold
description: Initialize the ultraweb Next.js project end to end — verify live package versions via npm view FIRST, run npx create-next-app@latest --yes (no --turbopack flag, Turbopack is the Next 16 default), lay the Tailwind v4.3 token skeleton into app/globals.css, run npx shadcn@latest init, install motion/lucide-react/zod/next-themes, verify strict tsconfig, create the folder conventions, strip boilerplate, and prove the result with a dev-server smoke test plus a clean npm run build. Invoke in Phase 5 of the ultraweb pipeline once design/SITEMAP.md exists, whenever a build starts from an empty directory ("set up the project", "scaffold the app", "init the Next.js project"), or when a broken tree must be restarted fresh.
---

# scaffold — verified init, provable green

**Stage:** Phase 5 — Scaffold - **Reads:** design/SITEMAP.md, design/BRIEF.md (project name), plugin STACK.md - **Writes:** running Next.js app — project root, app/globals.css skeleton, folder tree, first design/QA.md entry

## Standard

Current stable versions verified against the live registry THIS session — never trusted from memory, STACK.md, or a tutorial. Zero deprecated flags, zero dead packages, TypeScript strict from the first commit, a globals.css that is already the design system's single home, and a 200 from the dev server plus an exit-0 `npm run build` before any component work starts. A scaffold that "probably works" is not done; the smoke test is the definition of done.

## Process

1. **Verify versions FIRST** — before touching anything: `npm view next version && npm view tailwindcss version && npm view shadcn version && npm view motion version && npm view lucide-react version && npm view zod version && npm view next-themes version`. Compare against the Versions section of the plugin's STACK.md — the only file that carries pinned numbers. Reality wins on drift: proceed with latest, record the delta in design/QA.md, flag STACK.md for update. On a MAJOR jump past STACK.md (next 17, tailwind 5): stop and check migration docs before continuing.
2. **Init:** `npx create-next-app@latest <kebab-name> --yes` — name from BRIEF.md. Yields TS, Tailwind v4, App Router, ESLint, `@/*` alias, AGENTS.md, and Turbopack for dev AND build. There is **no `--turbopack` flag** in Next 16 — passing one is an error. `next.config.ts` is fully supported.
3. **tsconfig:** confirm `"strict": true` in tsconfig.json (create-next-app sets it). Never loosen it, ever.
4. **globals.css token skeleton** — Tailwind 4.3 is CSS-first; no `tailwind.config.js` exists or ever will:

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

:root {
  /* full oklch values — ultraweb:tokens fills these from SYSTEM.md */
  --background: oklch(0.985 0.002 90);
  --foreground: oklch(0.2 0.005 90);
}
.dark {
  --background: oklch(0.18 0.004 90);
  --foreground: oklch(0.94 0.003 90);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
}

@theme {
  /* static tokens — --font-*, --text-*, --radius-*, --shadow-*, --ease-*, --animate-* — ultraweb:tokens owns this block */
}
```

   Rules: `@theme inline` whenever a token references another CSS variable (the shadcn bridge). Never `@tailwind base/components/utilities`, never `theme.extend`, never the legacy bare-HSL-triplet + `hsl(var(--x))` pattern.
5. **shadcn init:** `npx shadcn@latest init` — the `shadcn-ui` package is long dead. Verify components.json: `"tailwind": { "config": "" }` (blank is correct for v4), css pointing at app/globals.css, `"iconLibrary": "lucide"`. Init merges its own `:root`/`.dark` oklch variables into globals.css — re-open the file and reconcile with the step-4 skeleton: exactly one `:root`/`.dark`/`@theme inline` set survives; shadcn's semantic names win, the structure above stays.
6. **Install:** `npm i motion lucide-react zod next-themes`. `motion`, not `framer-motion` (legacy alias). Note for later phases: `motion` imports come from `"motion/react"` and force `"use client"`; zod v4 error customization is `{ error: "Too short" }` — the `message` param is deprecated.
   **The base install is closed** — these four plus what create-next-app brings are everything Phase 5 installs. `animejs` is deliberately NOT in it: the DIRECTION-gated SVG-choreography engine belongs to Phase 9, installed by `ultraweb:animejs` only once design/DIRECTION.md commissions the moment by name, and version-verified with `npm view animejs version` at that point exactly as step 1 verifies the base four. Tier-6 dependencies (resend, stripe, drizzle-orm, content-collections) follow the same law: the tier that needs it installs it.
7. **Folders** — create the contract tree every component skill writes into (ultraweb:app-structure owns the full contract):

```
app/                  route files + globals.css only
components/ui/        shadcn primitives (restyled — never shipped default)
components/sections/  page sections (hero, features, pricing…)
components/layout/    header.tsx, footer.tsx, providers.tsx
lib/                  utils.ts (cn), fonts.ts (next/font instances)
```

8. **Strip boilerplate:** reduce app/page.tsx to a minimal shell, delete the demo SVGs. No create-next-app demo markup survives into Phase 6.
9. **Smoke test — LAST ACTION, non-negotiable:** start `npm run dev` in the background → HTTP 200 on localhost:3000 → zero errors in terminal output → kill it. Then `npm run build` — exit 0, zero type errors. Both green before reporting the phase done; paste the decisive output lines into design/QA.md.

Any step fails: hand the verbatim error to the `stack-doctor` subagent. Repair forward on current versions — never downgrade the stack to match a tutorial.

## Drift protocol

- Patch/minor drift from STACK.md: proceed on latest, one-line note in design/QA.md ("next 16.2.12 vs STACK 16.2.10").
- New MAJOR in any of the seven packages: read the official migration guide before running init — never guess flags on a new major.
- Registry unreachable (proxy, offline): stop and report — never scaffold on assumed versions.

## Anti-patterns

- `--turbopack` in any command — the flag does not exist in Next 16; Turbopack is the default bundler
- `npx shadcn-ui` — dead package; it is `npx shadcn@latest`
- `tailwind.config.js` / `tailwind.config.ts` / `theme.extend` — v3 relics; v4 is CSS-first
- `@tailwind base` / `@tailwind components` / `@tailwind utilities` — replaced by `@import "tailwindcss"`
- `npm i framer-motion` — install `motion`, import from `"motion/react"`
- `next lint` — removed in Next 16; run the ESLint CLI directly
- `middleware.ts` — deprecated; route protection later means `proxy.ts` exporting `proxy(request)`
- `npm i animejs` (or any Tier-6 package) in Phase 5 — the base install is closed; the gated engine installs in Phase 9 against a DIRECTION.md commission, never speculatively
- Versions pinned from a blog post instead of `npm view` — step 1 exists precisely to kill this
- `"strict": false` or any tsconfig loosening to silence errors
- Reporting scaffold done without the dev-server 200 AND the clean `npm run build`

## Worked example — Aldermoor Trust, community foundation project init

design/SITEMAP.md lists five routes — `/`, `/grants`, `/stories/[slug]`, `/volunteer`, `/donate`; design/BRIEF.md names the client "Aldermoor Trust".

`npm view` first: next 16.2.10, tailwindcss 4.3.2, shadcn 4.13.0 — all match STACK.md, no MAJOR jump, so proceed. Init: `npx create-next-app@latest aldermoor-trust --yes` (no `--turbopack` — Turbopack is the Next 16 default). Lay the "Open Civic" warm-paper base into app/globals.css with real values, so the smoke test renders on-brand from line one:

```css
:root {
  --background: oklch(0.97 0.008 85);
  --foreground: oklch(0.24 0.02 85);
}
```

Then `npm i motion lucide-react zod next-themes` — the base four only.

Rejected: eagerly `npm i content-collections` now because the stories are MDX. It lost — scaffold installs only what Phase 5 needs; the content tier owns that dependency, and pulling it in here breaks the install discipline the smoke-test build is there to prove.

Handoff: the running tree, the globals.css skeleton, and the first design/QA.md entry (version deltas plus the dev-server 200 and exit-0 build) go to ultraweb:tokens, which replaces the placeholder `:root` with the real Open Civic system — AAA-checked deep-green accent `oklch(0.45 0.1 155)` on warm paper.

## Composes with

- ultraweb:tokens — fills the `@theme`/`:root` skeleton with the real system from SYSTEM.md
- ultraweb:app-structure — commits the RSC/client boundary plan on this tree, immediately after
- ultraweb:routing — adds segments, loading/error/not-found files onto the scaffolded app/
- ultraweb:gate-code — re-runs build/type/lint at Phase 11; the step-9 smoke test is its preview
- stack-doctor (subagent) — receives every init/install/build failure with the verbatim error
