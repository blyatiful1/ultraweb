---
name: gate-code
description: Build/type/lint quality gate — the FIRST gate of Phase 11 (nothing visual gets judged on a broken build). Invoke there, after any multi-file code change to an ultraweb site, or on "run the code gate", "does it build", "check types and lint", "is the build clean", "check the token contract". Proves the codebase green with commands, not claims: clean npm run build and strict tsc --noEmit, ESLint via the CLI (next lint is removed in Next 16), every route served with a clean console, "use client" placement audit, stack-relic greps, unused-dependency sweep, and a token-contract linter failing undeclared @theme tokens or sub-AA color pairs. Writes a dated pass/fail entry with command evidence to design/QA.md.
---

# gate-code — green by command, not claim

**Stage:** Phase 11 — Gates (first gate; blocks all others) - **Reads:** full codebase, package.json, design/SITEMAP.md (route list), plugin STACK.md - **Writes:** design/QA.md entry + fixes for whatever fails

## Standard

Every item on this gate is an exit code or a zero-hit grep — "looked fine" does not exist here. First-grade means: cold `npm run build` exits 0, `tsc --noEmit` is silent under strict with zero suppression comments, ESLint reports 0 problems with zero inline disables, every route in design/SITEMAP.md serves 200 with a clean dev terminal, `"use client"` lives only at interactive leaves, and package.json carries nothing the code doesn't import. Every `var(--token)` resolves to a declared `@theme` token and every semantic foreground/surface pair clears WCAG AA — proven by a script each build, not eyeballed once at design time. And the CSS that actually ships carries no vocabulary the system never decided.

## Checklist

1. Production build clean
2. Types clean, strict intact
3. Lint clean via ESLint CLI
4. Every route serves; dev terminal clean
5. RSC boundaries at the leaves
6. Zero stack relics
7. Zero unused dependencies
8. Token contract holds — no undeclared tokens, every pair passes AA
9. Emitted CSS stays inside the system's own vocabulary

## How to verify

1. **Build:** `npm run build` → exit 0. Turbopack is the Next 16 default for dev AND build — no flag exists. When in doubt about staleness, `rm -rf .next` first and build cold. Any failure goes verbatim to the `stack-doctor` subagent; never downgrade a package to make it pass.
2. **Types:** `npx tsc --noEmit` → exit 0, no output. Then prove nothing was loosened to get there: `grep -n '"strict"' tsconfig.json` shows `true`, and `grep -rn "@ts-ignore\|@ts-expect-error\|as any" app components lib` → each hit gets a one-line justification or gets removed. Common Next 16 failure here: `params`/`searchParams` used without `await` — they are Promises in pages, layouts, and generateMetadata.
3. **Lint:** `npx eslint .` → exit 0, 0 problems. `next lint` was REMOVED in Next 16 — `grep -n "next lint" package.json` must return nothing; replace any hit with the ESLint CLI. `grep -rn "eslint-disable" app components lib` → each hit needs a one-line justification.
4. **Routes + terminal console:** `npm run dev > qa/dev.log 2>&1 &`, then `curl -s -o /dev/null -w "%{http_code} %{url_effective}\n"` against every route in design/SITEMAP.md — all 200. Dev compiles routes on demand: a route never requested is a route never compiled, so sweep all of them. Then `grep -inE "error|hydrat|failed" qa/dev.log` → zero hits. Kill the server. Browser-side console errors are pixel-qa's job inside gate-responsive; this check owns the terminal side.
5. **RSC boundary audit:** `grep -rn "use client" app components lib` → review every hit against the app-structure boundary plan:
   - Zero hits in any `layout.tsx` — providers belong in `components/layout/providers.tsx`, imported as a leaf.
   - A hit in `app/**/page.tsx` needs a one-line justification; the default is a server page composing client leaves.
   - Expect ≤15 client files on a brochure/marketing site; 30+ means the boundary plan failed — re-read app-structure, don't rubber-stamp the census.
   - Motion cross-check: `grep -rl "motion/react" app components | xargs -r grep -L "use client"` → empty. Every motion/react import forces the directive.
   - Hook cross-check: `grep -rlE "useState|useEffect|useRef|onClick=" app components | xargs -r grep -L "use client"` → empty. A hit means add the directive at the true leaf or push the interactivity further down — never up.
6. **Stack relics** — every check returns nothing:
   - `ls middleware.ts` → no such file. Next 16 uses `proxy.ts` exporting `proxy(request)`.
   - `grep -rn "framer-motion" package.json app components lib` — legacy alias; the package is `motion`.
   - `grep -rn "onLoadingComplete" app components` — removed on next/image; it is `onLoad`.
   - `grep -rn "priority" app components --include="*.tsx"` → any hit that is an `<Image>` prop is deprecated; use `preload`.
   - `grep -rn "tailwind.config\|@tailwind base\|theme.extend" . --exclude-dir=node_modules` — Tailwind v3 relics; v4.3 is CSS-first via `@theme` in globals.css.
   - `grep -rn "import anime from\|@types/animejs" package.json app components lib` — anime.js v3 relics; v4 has no default export and ships its own types (per STACK.md). Keep this grep tight: a bare `targets:` is too generic to mean anything.
   - `grep -rn "createDraggable" app components lib` → zero hits. Drag is motion's at `domMax` — the engine boundary, not a style choice.
   - `grep -rnE "ease: *['\"]cubicBezier" app components` → zero hits. The string form is silently linear; pass the imported `animeEase.*` function. Both of these can only land in the `from "animejs"` files check 7 already resolves.
   - `grep -rnE "transpilePackages|MeshProps|Object3DNode|MaterialNode|BufferGeometryNode|LightNode|namespace JSX" next.config.* app components` — R3F v8 relics in a v9 world: `transpilePackages: ['three']` is stale on Next 16 + Turbopack, the per-element prop types were removed in favour of `ThreeElements['mesh']`, and JSX augmentation moved out of the global namespace into `declare module '@react-three/fiber'` (per STACK.md).
   - `grep -n '"@types/three"' package.json` — its version must equal `three`'s exactly, or the `ThreeElements` augmentation drifts; and `three` must be pinned exactly whenever `postprocessing` is present, because its peer range caps three (per STACK.md).
7. **Unused dependencies** — audit `dependencies` only (devDependencies serve tooling: typescript, eslint*, @types/*, @tailwindcss/postcss):

```bash
for dep in $(node -p "Object.keys(require('./package.json').dependencies).join(' ')"); do
  grep -rq "from ['\"]$dep" app components lib || echo "UNUSED: $dep"
done
```

   The prefix match catches subpath imports (`from "next/image"` matches `next`). Before uninstalling a hit, confirm it isn't consumed by a root config file (next.config.ts, proxy.ts, drizzle.config.ts) or globals.css (`@import "tailwindcss"`). Then `npm uninstall` it and re-run check 1. A dedicated analyzer (knip) can replace the loop — verify against current docs first.

   `animejs` is the one dependency the loop cannot judge alone, because it is DIRECTION-gated: it passes only with BOTH a `from "animejs"` import under app/components — the import specifier is the only tell, since `animate(` is also motion/react and WAAPI — AND a design/DIRECTION.md line commissioning the SVG moment that earned it. Either half missing is a defect: uninstall it, or send the moment back to ultraweb:direction to be named.

   `three` and the `@react-three/*` packages are judged the same way and for the same reason: they pass only with BOTH a `from "three"` / `from "@react-three/` import under app, components or lib — the import specifier is the only tell, since `<Canvas` and `useFrame(` also appear in comments, prose and dead code — AND a design/DIRECTION.md line commissioning the 3D that earned them: `ultraweb:showpiece` for one set piece, `ultraweb:set-design` **with its route scope and byte budget** for a scene that persists across routes. Either half missing is a defect: uninstall them, or send the moment back to ultraweb:direction to be named.

8. **Token contract + AA, by script:** the `@theme` contract and WCAG AA are computable facts — assert them every build, not once by eye at design time. `node qa/token-contract.mjs` → exit 0. No new dependency (pure `node:fs` + math). It does two things: (a) fails on any `var(--token)` used in `app`/`components` that `app/globals.css` never declares — a typo, or a token renamed in globals.css but not its call sites, silently renders the CSS default; (b) re-derives contrast for every semantic foreground/surface pair (OKLCH tokens, which this stack mandates) — `--foreground`/`--background` plus every `--*-foreground`/`--*` — in BOTH `:root` and `.dark`, failing any below 4.5:1 (loosen to 3:1 per pair only where you know it is large-text-only). This turns ultraweb:color's one-time AA pass into a gate, so weeks of iterate/retrofit can't slip a `text-white`-on-`--warning` pair or a stale token past the other checks.

```js
// qa/token-contract.mjs — dependency-free; run: node qa/token-contract.mjs
import { readFileSync, readdirSync, existsSync } from "node:fs";

const css = readFileSync("app/globals.css", "utf8");
const declared = new Set([...css.matchAll(/--([\w-]+)\s*:/g)].map(m => m[1]));
let fail = 0;

// (1) every var(--token) used in app/components must be declared in globals.css
const walk = d => readdirSync(d, { withFileTypes: true }).flatMap(e =>
  e.isDirectory() ? walk(`${d}/${e.name}`) : [`${d}/${e.name}`]);
for (const f of ["app", "components"].filter(existsSync).flatMap(walk).filter(f => /\.(tsx?|css)$/.test(f)))
  for (const [, t] of readFileSync(f, "utf8").matchAll(/var\(\s*--([\w-]+)/g))
    if (!declared.has(t)) (console.error(`UNDECLARED  var(--${t})  ${f}`), fail = 1);

// (2) WCAG-AA contrast for every foreground/surface pair, in both themes
const lum = ([L, C, H]) => {                        // oklch -> WCAG relative luminance
  const h = H * Math.PI / 180, a = C * Math.cos(h), b = C * Math.sin(h), cube = x => x ** 3;
  const l = cube(L + .3963377774*a + .2158037573*b),
        m = cube(L - .1055613458*a - .0638541728*b),
        s = cube(L - .0894841775*a - 1.2914855480*b),
        [r, g, bl] = [ 4.0767416621*l - 3.3077115913*m + .2309699292*s,
                      -1.2684380046*l + 2.6097574011*m - .3413193965*s,
                      -.0041960863*l - .7034186147*m + 1.7076147010*s ].map(v => Math.min(1, Math.max(0, v)));
  return .2126*r + .7152*g + .0722*bl;
};
const ratio = (x, y) => { const [hi, lo] = [lum(x), lum(y)].sort((p, q) => q - p); return (hi + .05) / (lo + .05); };
const parse = block => Object.fromEntries([...block.matchAll(/--([\w-]+)\s*:\s*oklch\(([^)]+)\)/g)].map(
  ([, n, v]) => [n, v.split("/")[0].trim().split(/\s+/).map(x => parseFloat(x) / (x.endsWith("%") ? 100 : 1))]));
for (const [name, sel] of [["root", ":root"], ["dark", "\\.dark"]]) {
  const t = parse((css.match(new RegExp(`${sel}\\s*{([^}]*)}`, "s")) || [, ""])[1]);
  for (const fg in t) {
    const bg = fg === "foreground" ? "background" : fg.endsWith("-foreground") ? fg.slice(0, -11) : null;
    if (!bg || !t[bg]) continue;
    const r = ratio(t[fg], t[bg]);
    if (r < 4.5) (console.error(`AA FAIL [${name}]  --${fg} on --${bg}  ${r.toFixed(2)}:1 (<4.5)`), fail = 1);
  }
}
process.exit(fail);
```

9. **CSS entropy audit:** check 8 proves every `var(--token)` is declared; this one proves components aren't minting values the system never decided. The emitted stylesheet is the honest census — after `npm run build`, `npx wallace-cli .next/static/css/*.css` (one file per invocation if the glob expands to several). Read its counts against design/SYSTEM.md as ceilings, never equalities:
   - unique colors ≤ palette + shadcn's base tokens — a long tail of near-duplicates is hardcoded hex/oklch in components
   - unique font-sizes ≤ the `clamp()` scale length + a small tolerance; Tailwind utilities legitimately emit more, so judge the tail, never assert `==`
   - `!important` count == 0 — the `@layer` order ultraweb:tokens sets is what overrides shadcn
   - zero orphaned custom properties (declared in globals.css, referenced nowhere) — the mirror image of check 8's undeclared-token failure

   Every excess traces back to a component. The fix is deleting the stray value, never widening the palette to match the census.

## Pass criteria

All nine checks green in ONE final sequential pass after the last fix — any fix invalidates earlier results, so checks 1–4 re-run to completion at the end, and checks 8–9 re-run whenever a fix touched globals.css or a component's tokens. Zero unjustified suppressions (`@ts-ignore`, `eslint-disable`, boundary hits in layouts). Every result recorded as the command's actual output line, not a memory of it.

## QA.md entry

```markdown
## gate-code — 2026-07-16 — PASS
| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | npm run build | PASS | exit 0 — "Compiled successfully" |
| 2 | npx tsc --noEmit | PASS | exit 0, silent |
| 3 | npx eslint . | PASS | 0 problems |
| 4 | routes + dev console | PASS | 7/7 routes 200, qa/dev.log clean |
| 5 | RSC boundary audit | PASS | 9 client files, all leaves, 0 in layouts |
| 6 | stack relics | PASS | 0 hits across 5 checks |
| 7 | unused dependencies | PASS | 11 deps audited, 0 unused |
| 8 | token contract + AA | PASS | node qa/token-contract.mjs exit 0 — 0 undeclared, 14 pairs ≥4.5:1 |
| 9 | CSS entropy | PASS | wallace: 19 colors (palette 16 + base), 11 font-sizes (scale 9), 0 !important, 0 orphans |
Issues fixed: removed unused `date-fns`; moved "use client" from app/page.tsx to components/sections/hero.tsx; raised `--muted-foreground` lightness to clear AA in `.dark`.
```

## Anti-patterns

- `next lint` anywhere — removed in Next 16; ESLint CLI only
- `"strict": false` or `as any` sprinkles to silence tsc — hiding the defect, not fixing it
- Blanket `/* eslint-disable */` at file top
- `"use client"` slapped on a layout to make a hook error vanish — the error is telling you the boundary is wrong
- Deleting a failing route or component instead of fixing it
- Reporting green from a stale `.next` or a build run before the last edit
- Downgrading next/tailwindcss/motion to dodge an error — hand it to stack-doctor instead
- Skipping the route sweep because "/" worked — dev compiles per route; unrequested routes are unverified routes
- Eyeballing contrast once at design time, then stacking new components on top for weeks — an AA-failing pair sails through every other gate; `node qa/token-contract.mjs` re-derives it each build
- Treating a `var(--token)` typo, or a token renamed in globals.css but not its call sites, as harmless — it silently renders the CSS default; check 8 is the only thing that catches it

## Worked example — Tidepool, first cold pass of the code gate

Moved to `references/example.md` — read only when this build's case is genuinely ambiguous; the sections above are the decision material.

## Composes with

Moved to `references/composes.md` — the handoff map; load it when orchestrating this skill against its neighbors.
