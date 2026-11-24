# scaffold

Preflight checks and the two project scaffolds: the Next.js path and the static `site/` path. The Next steps are the ones `scripts/scaffold-fixture.sh` runs and CI re-runs weekly against the pins; if this file and that script disagree, the script is right.

Load when: Phase 0 (Preflight) and Phase 5 (Scaffold and homepage).
Reads: `stack/versions.json`, `design/BRIEF.md` (project name), `design/SYSTEM.md`. Writes: the project, `app/globals.css` or `site/styles.css`, first `design/PROGRESS.md` entry.

## Preflight

Run before any design work and report the result as the capability report.

1. **Node.** `node -v` must be 20.9 or newer (Next's minimum); 22 is what CI uses.
2. **git.** `git --version`. A missing git is a warning, not a stop.
3. **Browser for the gates.** `scripts/gates.mjs` drives Playwright. Check from the project folder with `node -e "require('playwright')"` (it also resolves a global install; a static site has no `package.json`), or `npx playwright --version` in a Next project. Install a browser with `npx playwright install chromium`. If the download is blocked, say so in the capability report; gates will return `UNVERIFIED` and the build continues without a verified pass.
4. **Stack freshness.** `node <plugin>/scripts/verify-stack.mjs`. It compares `stack/versions.json` with the live npm registry and exits 1 on drift. Exit 1 here means the registry has moved, not that the build is broken.
   - Manifest `verified` date older than 30 days, or drift reported: the scaffold still installs the exact pinned versions, so the build is reproducible. Record the drift in `design/PROGRESS.md` and continue, unless a package listed as MAJOR DRIFT is one the brief uses. In that case read that package's changelog or its bundled docs before using any API from `STACK.md` for it.
   - A pinned version that no longer exists (NONEXISTENT PIN) or a failed install: install the live version of that package, note it in `design/PROGRESS.md`, and continue.
   - Registry unreachable: the install cannot run either. Stop and report; never scaffold from remembered versions.
   - Do not run `--write` against the plugin directory during a client build; the plugin owner refreshes the manifest.
5. **Path.** Static path for the `sketch` tier unless the user asked for Next.js or the folder already contains a Next project (`package.json` with `next`). Otherwise the Next path.

## Next path

Resume check first: if `package.json` already exists in the target, do not run `create-next-app` again. Compare its dependencies with step 5 and continue from the first missing step.

In the commands, `<pin x>` means the version of package `x` in `stack/versions.json`. Install with exact versions.

1. **Init.** `npx create-next-app@<pin next> <kebab-name> --yes`. Gives TypeScript strict, Tailwind v4, App Router, ESLint, the `@/*` alias, `AGENTS.md`, Turbopack. There is no `--turbopack` flag. Then `mv design <kebab-name>/design` and the same for `qa/` if it exists, and `cd` in.
2. **Pin what init left floating.**
   - `npm i --save-exact next@<pin next> react@<pin react> react-dom@<pin react-dom>`
   - `npm i -D --save-exact tailwindcss@<pin tailwindcss> @tailwindcss/turbopack@<pin tailwindcss>`
   - The generated `next.config.ts` already sets `cacheComponents`, `partialPrefetching` and the Tailwind loader rule. Leave them; see `STACK.md` for what `cacheComponents` changes.
3. **shadcn init before tokens.** `npx shadcn@<pin shadcn> init -d -y`. It rewrites `app/globals.css` (imports, its own `:root` and `.dark` variables, `@theme inline` bridge) and writes `components.json` with `"tailwind": { "config": "" }`. Confirm `components.json` has the css path `app/globals.css` and `"iconLibrary": "lucide"`.
4. **Write the project tokens into `app/globals.css`** from `design/SYSTEM.md`. Reconcile with what step 3 wrote so the file has exactly one `:root`, one `.dark` and one `@theme inline` block. Keep `@import "tailwindcss";` and add `@custom-variant dark (&:where(.dark, .dark *));` if the site has a dark theme. Static tokens (`--font-*`, `--text-*`, `--radius-*`, `--shadow-*`, `--ease-*`) go in a separate `@theme { }` block.
5. **Base install.** `npm i --save-exact motion@<pin motion> lucide-react@<pin lucide-react> zod@<pin zod> next-themes@<pin next-themes>`. The base install is closed: `animejs`, three and its companions install only when `design/DIRECTION.md` commissions them (`references/stack-3d.md`).
6. **Playwright for the gates.** `npm i -D --save-exact playwright@<pin playwright>`, then `npx playwright install chromium`.
7. **Strip the demo.** Reduce `app/page.tsx` to a minimal shell; remove the demo assets in `public/`. Replace the placeholder title and description in `app/layout.tsx`.
8. **Confirm** `"strict": true` in `tsconfig.json` and do not loosen it.
9. **Smoke, last.** `npm run build` exits 0 with no type errors, `npx tsc --noEmit` is clean, and `npm run dev` returns 200 on `localhost:3000` (stop it afterwards). Write the resolved versions from `package-lock.json` for next, react, tailwindcss, shadcn, motion, lucide-react, zod, next-themes and playwright into `design/PROGRESS.md`.

If a step fails, fix forward on the pinned versions. Do not downgrade the stack to match a tutorial. A failure that comes from a pin itself goes in `design/PROGRESS.md` and the plugin owner is told.

What a clean run looked like on 2026-11-23: about one minute end to end on Node 22, one npm deprecation warning (eslint), zero resolution errors, every package resolving to its pin.

## Static path (sketch tier)

One page, no framework, no build step. Use it when a landing page does not need routing, a database or server code.

Layout:

```
site/
  index.html
  styles.css      tokens as CSS custom properties on :root, then layout, then components
  main.js         only if the page needs behavior; plain ES module, no bundler
  fonts/          self-hosted font files (no third-party font CDN)
  assets/         images, optimized before they go in
```

Rules:
- `index.html` carries `lang`, a unique `<title>`, meta description, `viewport`, canonical, Open Graph tags and a favicon link. One `h1`.
- Tokens from `design/SYSTEM.md` go on `:root` in `styles.css` as OKLCH values; dark theme through `prefers-color-scheme` or a class, as the design requires. Fluid type and spacing with `clamp()`.
- Load the stylesheet with `<link rel="stylesheet">`, fonts with `@font-face` and `font-display: swap` plus a `preload` for the one above-the-fold face, scripts with `type="module"` at the end of `body`.
- Motion without a library: CSS transitions and `@keyframes`, `IntersectionObserver` for reveals, content visible by default, and a `prefers-reduced-motion` branch. Add a library only if `design/DIRECTION.md` names one; a CDN script is not allowed, install it locally and copy the file into `site/`.
- Images get `width`, `height`, `alt`, `loading="lazy"` below the fold and `fetchpriority="high"` on the LCP image.

Serve for the gates and the judge:

```
python3 -m http.server 4173 -d site      # or: npx serve site -l 4173
node <plugin>/scripts/gates.mjs --url http://localhost:4173 --project .
```

The static project has no `package.json`, so `gates.mjs` finds Playwright in the plugin directory or globally. If it exits 3 it prints the one-line install command; run it. Stop the server when done.

Moving to Next later means a new Next project and porting the tokens and copy; there is no in-place upgrade, so choose the Next path up front when the brief mentions multiple pages, a blog, a store, accounts or a CMS.
