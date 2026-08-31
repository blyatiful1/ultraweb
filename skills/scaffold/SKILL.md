---
name: scaffold
description: Initialize the ultraweb Next.js project end to end — verify live package versions via npm view FIRST, run npx create-next-app@latest --yes (no --turbopack flag, Turbopack is the Next 16 default), move design/ into the project root, lay the Tailwind v4.3 token skeleton into app/globals.css, run npx shadcn@latest init, install motion/lucide-react/zod/next-themes, verify strict tsconfig, create the folder conventions, strip boilerplate, and prove the result with a dev-server smoke test plus a clean npm run build. Re-entrant: on a partially-built tree (package.json already present) it detects completed steps and resumes at the first incomplete one instead of re-initializing. Invoke in Phase 5 of the ultraweb pipeline once design/SITEMAP.md exists, whenever a build starts from an empty directory ("set up the project", "scaffold the app", "init the Next.js project"), or when an interrupted Phase 5 must be finished.
---

# scaffold — verified init, provable green

**Stage:** Phase 5 — Scaffold - **Reads:** design/SITEMAP.md, design/BRIEF.md (project name), plugin STACK.md - **Writes:** running Next.js app — project root, app/globals.css skeleton, folder tree, first design/QA.md entry

## Standard

Current stable versions verified against the live registry THIS session — never trusted from memory, STACK.md, or a tutorial. Zero deprecated flags, zero dead packages, TypeScript strict from the first commit, a globals.css that is already the design system's single home, and a 200 from the dev server plus an exit-0 `npm run build` before any component work starts. A scaffold that "probably works" is not done; the smoke test is the definition of done.

The mechanical core of this phase is executable: `scripts/scaffold-fixture.sh` in the plugin repo runs steps 2 → 4 → 5 → 6 → 8 → 9 verbatim, and CI (`fixture-build.yml`) proves that exact file weekly against the live ecosystem. This skill adds the judgment a script can't: the design/ move, shadcn token reconciliation, the resume ledger. If the commands here and that script ever disagree, the script is the drifted copy — fix it, not this file.

## Process

0. **Resume check — before any command.** If `package.json` exists in the target directory, this is a resumed scaffold: do NOT run create-next-app again. Determine the completed steps empirically — `package.json` deps vs the closed base install (step 6); `components.json` presence and `grep -c ':root' app/globals.css` for shadcn-init/reconciliation state (three `:root` blocks means a resumed init duplicated step 4's skeleton — reconcile down to one exactly as step 5 prescribes); the step-7 folder tree; whether create-next-app demo markup survives in `app/page.tsx` — and enter at the first incomplete step. Phase 5 is a chain of network operations, which is exactly where interruptions cluster; a half-scaffolded tree costs one resumed step, never a wipe. Append a step ledger to `design/PROGRESS.md` as you go (`scaffold: init OK · design-move OK · shadcn OK · deps OK · folders OK · strip PENDING · smoke PENDING`) so the next session's step 0 reads instead of probing.

1. **Verify versions FIRST** — before touching anything: run the plugin's `node scripts/verify-stack.mjs`, which checks every pin in `stack/versions.json` (the one file that carries numbers) against the live registry; if the script isn't reachable, fall back to `npm view <pkg> version` for the base seven (next, tailwindcss, shadcn, motion, lucide-react, zod, next-themes) against the manifest. Reality wins on drift: proceed with latest, record the delta in design/QA.md, fold the manifest via `--write` when working in the plugin repo. On a MAJOR jump past the manifest (next 17, tailwind 5): stop and check migration docs before continuing.
2. **Init:** `npx create-next-app@latest <kebab-name> --yes` — name from BRIEF.md. Yields TS, Tailwind v4, App Router, ESLint, `@/*` alias, AGENTS.md, and Turbopack for dev AND build. There is **no `--turbopack` flag** in Next 16 — passing one is an error. `next.config.ts` is fully supported. **Then immediately move the design record in:** `mv design <kebab-name>/design` — Phases 0–4 wrote it to the working directory, and every downstream skill resolves `design/*` from the project root. Verify `design/BRIEF.md` resolves from inside the project before continuing; a scaffold that orphans the artifacts orphans the human's answers and approvals. Then commit the record on create-next-app's fresh repo: `git add design && git commit -m "ultraweb: phases 0–4 — design record"` — the first of the pipeline's phase-boundary commits.
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
   **The base install is closed** — these four plus what create-next-app and step 5's `shadcn init` bring are everything Phase 5 installs. `animejs` is deliberately NOT in it: the DIRECTION-gated SVG-choreography engine belongs to Phase 9, installed by `ultraweb:animejs` only once design/DIRECTION.md commissions the moment by name, and version-verified with `npm view animejs version` at that point exactly as step 1 verifies the base four. **Neither is the 3D stack**, for the same reason and at an order of magnitude more cost: `three`, `@types/three`, `@react-three/fiber`, `@react-three/drei` and `@react-three/postprocessing` belong to Phase 9, installed by `ultraweb:showpiece` for a commissioned set piece or `ultraweb:set-design` for a commissioned site-scale scene, version-verified the same way — with `three` pinned exactly and `@types/three` locked to it, because postprocessing's peer range caps three (per STACK.md). Tier-6 dependencies (resend, stripe, drizzle-orm, @content-collections/core) follow the same law: the tier that needs it installs it.
7. **Folders** — create the contract tree every component skill writes into (ultraweb:app-structure owns the full contract):

```
app/                  route files + globals.css only
components/ui/        shadcn primitives (restyled — never shipped default)
components/sections/  page sections (hero, features, pricing…)
components/layout/    header.tsx, footer.tsx, providers.tsx
components/brand/     wordmark.tsx, monogram.tsx, og-template.tsx (ultraweb:identity fills these in Phase 3)
lib/                  utils.ts (cn), fonts.ts (next/font instances)
```

8. **Strip boilerplate:** reduce app/page.tsx to a minimal shell, delete the demo SVGs. No create-next-app demo markup survives into Phase 6.
9. **Smoke test — LAST ACTION, non-negotiable:** start `npm run dev` in the background → HTTP 200 on localhost:3000 → zero errors in terminal output → kill it. Then `npm run build` — exit 0, zero type errors. Both green before reporting the phase done; paste the decisive output lines into design/QA.md — and with them the RESOLVED versions from package-lock.json for the base set (next, tailwindcss, motion, lucide-react, zod, next-themes). That line closes the evidence loop between the live-first install and stack/versions.json: what this build actually runs is recorded, not assumed from the manifest. When the pipeline rolls on into Phase 6, the Lead starts the dev server ONCE and records its PID and port in design/PROGRESS.md — from here on the server has one owner (root skill §Failure discipline): agents get the URL, never their own server.

Any step fails: hand the verbatim error to the `stack-doctor` subagent. Repair forward on current versions — never downgrade the stack to match a tutorial.

## Drift protocol

- Patch/minor drift from the manifest: proceed on latest, one-line note in design/QA.md ("next <live> vs manifest <pinned>").
- New MAJOR in any of the seven packages: read the official migration guide before running init — never guess flags on a new major.
- Registry unreachable (proxy, offline): stop and report — never scaffold on assumed versions.
- Registry failure MID-install: record the completed steps in the PROGRESS.md ledger, report which step died with the verbatim error, and resume at that step when the registry returns — step 0 exists so this costs one command, not a re-init.

## Anti-patterns

- `--turbopack` in any command — the flag does not exist in Next 16; Turbopack is the default bundler
- `npx shadcn-ui` — dead package; it is `npx shadcn@latest`
- `tailwind.config.js` / `tailwind.config.ts` / `theme.extend` — v3 relics; v4 is CSS-first
- `@tailwind base` / `@tailwind components` / `@tailwind utilities` — replaced by `@import "tailwindcss"`
- `npm i framer-motion` — install `motion`, import from `"motion/react"`
- `next lint` — removed in Next 16; run the ESLint CLI directly
- `middleware.ts` — deprecated; route protection later means `proxy.ts` exporting `proxy(request)`
- `npm i animejs` / `npm i three @react-three/fiber` (or any Tier-6 package) in Phase 5 — the base install is closed; the gated engine and the gated renderer both install in Phase 9 against a DIRECTION.md commission, never speculatively
- Versions pinned from a blog post instead of `npm view` — step 1 exists precisely to kill this
- `"strict": false` or any tsconfig loosening to silence errors
- Reporting scaffold done without the dev-server 200 AND the clean `npm run build`

## Worked example — Aldermoor Trust, community foundation project init

Moved to `references/example.md` — read only when this build's case is genuinely ambiguous; the sections above are the decision material.

## Composes with

Moved to `references/composes.md` — the handoff map; load it when orchestrating this skill against its neighbors.
