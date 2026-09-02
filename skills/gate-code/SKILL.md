---
name: gate-code
description: Build/type/lint quality gate — executed by the gate-runner agent against the Lead's build of record, FIRST of the six measurement gates in Phase 11 (nothing visual gets judged on a broken build). Dispatched there, on an iterate re-gate, after any multi-file code change to an ultraweb site, or on "run the code gate", "does it build", "check types and lint", "is the build clean", "check the token contract". Proves the codebase green with commands, not claims: the build log's exit code, strict tsc --noEmit, the ESLint CLI (next lint is gone in Next 16), every route 200 with a clean prod log, "use client" placement, stack-relic greps, unused dependencies, and a token-contract linter failing undeclared @theme tokens or sub-AA color pairs. Appends a dated pass/fail entry with command evidence to design/QA.md.
---

# gate-code — green by command, not claim

**Stage:** Phase 11, gate 1 of 6 — code → responsive → antislop → content → accessibility → performance. Executed by the `gate-runner` agent against the Lead's build of record and the production server of record on `prodUrl`, both raised once in the Phase 11 preamble (`mkdir -p qa && rm -rf .next && npm run build > qa/build.log 2>&1`, then `PORT=3100 npm start > qa/prod.log 2>&1 &`; see root SKILL.md); the runner never builds and never starts a server - **Reads:** the codebase, package.json, design/PROGRESS.md (§Now's `Build of record:` line — check 1 reads the exit code there and never rebuilds), design/SITEMAP.md (routes), design/DIRECTION.md, design/SYSTEM.md, `<plugin>/STACK.md` - **Writes:** the design/QA.md entry (appended) + `qa/gate-code.log`; fixes are the Lead's

## Standard

Every item is an exit code or a zero-hit grep; a measurement the runner did not run did not pass. The two facts the other gates inherit: the build of record is green, and the design system is honest — every `var(--token)` declared, every foreground/surface pair clearing AA by computation, not by eye.

## Checklist

1. Build of record exited 0 [MEASURED]
2. Types clean, strict intact [MEASURED]
3. Lint clean via the ESLint CLI [MEASURED]
4. Every route serves 200; prod log clean [MEASURED]
5. RSC boundaries at the leaves [MEASURED]
6. Zero stack relics [MEASURED]
7. Zero unused dependencies [MEASURED]
8. Token contract holds — no undeclared tokens, every pair passes AA [MEASURED]
9. Emitted CSS: zero `!important`, zero orphaned custom properties [MEASURED]
10. `animejs` / `three` commissioned by name in DIRECTION.md — evidence returned: import file:line + the DIRECTION.md lines quoted, or "no citation" [JUDGMENT → Lead]
11. Emitted colour/type census inside the system's scales — evidence returned: wallace's counts beside SYSTEM.md's palette and `clamp()` scale lengths [JUDGMENT → Lead]

## How to verify

**Runner contract** (the rest lives in `agents/gate-runner.md`):
- **In:** `gate` · `pluginRoot` · `projectRoot` · `prodUrl` · `devUrl` · `artifacts` (BRIEF, DIRECTION, SYSTEM, SITEMAP, QA, PROGRESS) · `tier` · `market` · `themeStrategy` · optional `rerunOnly` (run only those checks).
- **Out:** verdict `PASS` / `PASS-ON-MEASURED` / `FAIL` / `UNVERIFIED` (`PASS` only when `judgment-open` is empty); failed checks as `check · file:line · one line · owner skill · MECHANICAL|DESIGN`; JUDGMENT items as `judgment-open` with the evidence named above; the QA.md entry appended; the path `qa/gate-code.log`.
- **Logs:** full stdout/stderr of every failing or unverified command → `<projectRoot>/qa/gate-code.log`; the return carries the path, never the contents. A tooling failure comes back as `<check> · qa/build.log · <first error line> · owner: stack-doctor · MECHANICAL`, and the Lead hands stack-doctor that LOG PATH.
- **Never:** `npm run build`, `npm start`, `npm run dev`, `rm -rf .next`, `npm install`, any source edit, any `design/*` edit but the QA.md append. Its only other writes are `qa/gate-code.log` (a shell redirect is fine) and check 8's `qa/token-contract.mjs` (Write tool only).
- **Degraded:** no browser is used here, so a NO BROWSER preflight downgrades nothing; UNVERIFIED means a missing toolchain or an unreadable `qa/build.log`, and every code-checkable step still runs.

1. **Build of record:** read the exit code from PROGRESS.md §Now's `Build of record:` line — never rebuild — then `tail -n 20 <projectRoot>/qa/build.log`. Exit 0 → PASS, evidence = the "Compiled successfully" line. Non-zero → FAIL to `stack-doctor` per the contract.
2. **Types:** `npx tsc --noEmit` → exit 0, no output. Then prove nothing was loosened to get there: `grep -n '"strict"' tsconfig.json` shows `true`, and `grep -rn "@ts-ignore\|@ts-expect-error\|as any" app components lib` → any hit without a justification comment on the line above fails at that file:line. Common Next 16 failure: `params`/`searchParams` used without `await` — they are Promises in pages, layouts, generateMetadata.
3. **Lint:** `npx eslint .` → exit 0, 0 problems; never `--fix` (the runner reports, the Lead edits). `next lint` was REMOVED in Next 16 — `grep -n "next lint" package.json` returns nothing. `grep -rn "eslint-disable" app components lib` → the justification rule of check 2.
4. **Routes + server log:** `curl -s -o /dev/null -w "%{http_code} %{url_effective}\n" <prodUrl><route>` for every route in design/SITEMAP.md — all 200; a route that exists only in dev is a build defect. Then `grep -inE "error|hydrat|failed" <projectRoot>/qa/prod.log` → zero hits. Browser-side console errors belong to gate-responsive's console check (7); this check owns the server side.
5. **RSC boundary audit:** `grep -rn "use client" app components lib` — the census is the evidence; every failure here is owned by `app-structure`:
   - Zero hits in any `layout.tsx`; providers belong in `components/layout/providers.tsx`, imported as a leaf.
   - A hit in `app/**/page.tsx` fails unless the line above it is a `//` comment justifying it; the default is a server page composing client leaves.
   - Return the count: expect ≤15 client files on a brochure/marketing site, over 30 the boundary plan failed → FAIL, DESIGN.
   - `grep -rl "motion/react" app components | xargs -r grep -L "use client"` → empty, and the same with `-rlE "useState|useEffect|useRef|onClick="`. A hit means the directive belongs at the true leaf, or the interactivity pushes further down — never up.
6. **Stack relics** — every grep returns nothing:
   - `ls middleware.ts` → absent. Next 16 uses `proxy.ts` exporting `proxy(request)`.
   - `grep -rn "framer-motion" package.json app components lib` — the package is `motion`.
   - `grep -rn "onLoadingComplete" app components` — next/image dropped it; it is `onLoad`.
   - `grep -rn "priority" app components --include="*.tsx"` — deprecated as an `<Image>` prop; use `preload`.
   - `grep -rn "tailwind.config\|@tailwind base\|theme.extend" . --exclude-dir=node_modules` — v3 relics; v4.3 is CSS-first via `@theme`.
   - `grep -rn "import anime from\|@types/animejs" package.json app components lib` — anime.js v3 relics; v4 has no default export and ships its own types (STACK.md); a bare `targets:` means nothing.
   - `grep -rn "createDraggable" app components lib` and `grep -rnE "ease: *['\"]cubicBezier" app components` — drag is motion's at `domMax`, an engine boundary; the `cubicBezier` string form is silently linear, pass the imported `animeEase.*`.
   - `grep -rnE "transpilePackages|MeshProps|Object3DNode|MaterialNode|BufferGeometryNode|LightNode|namespace JSX" next.config.* app components` — R3F v8 relics in a v9 world: prop types are now `ThreeElements['mesh']`, JSX augmentation moved into `declare module '@react-three/fiber'`, `transpilePackages: ['three']` is stale on Turbopack (STACK.md).
   - `grep -n '"@types/three"' package.json` — must equal `three`'s version exactly or that augmentation drifts; `three` is pinned exactly whenever `postprocessing` is present (STACK.md).
7. **Unused dependencies** — audit `dependencies` only; devDependencies serve tooling:

```bash
for dep in $(node -p "Object.keys(require('./package.json').dependencies).join(' ')"); do
  grep -rq "from ['\"]$dep" app components lib || echo "UNUSED: $dep"
done
```

   The prefix match catches subpath imports (`from "next/image"` matches `next`). Before reporting a hit, grep the root configs (next.config.ts, proxy.ts, drizzle.config.ts) and globals.css too; the Lead uninstalls, then repeats the Phase 11 preamble and re-dispatches per Pass criteria. `animejs`, `three` and `@react-three/*` are exempt — their commissioning half is check 10.

8. **Token contract + AA, by script:** the runner puts the script below at `<projectRoot>/qa/token-contract.mjs` with the **Write tool** — a shell heredoc or `>` redirect to a `.mjs` is blocked by the shell-write guard — and runs `node qa/token-contract.mjs` → exit 0. Dependency-free. It fails (a) on any `var(--token)` in `app`/`components` that `app/globals.css` never declares — a typo or a half-finished rename silently renders the CSS default; (b) on any semantic foreground/surface pair below 4.5:1 — `--foreground`/`--background` and every `--*-foreground`/`--*`, re-derived from the OKLCH tokens in BOTH `:root` and `.dark` (3:1 per pair only where you know it is large-text-only). ultraweb:color's one-time AA pass becomes a per-build gate: weeks of iterate cannot slip a stale token or a sub-AA pair past the other checks.

```js
// qa/token-contract.mjs
import { readFileSync, readdirSync, existsSync } from "node:fs";
const css = readFileSync("app/globals.css", "utf8");
const declared = new Set([...css.matchAll(/--([\w-]+)\s*:/g)].map(m => m[1]));
let fail = 0;
// (1) every var(--token) in app/components must be declared in globals.css
const walk = d => readdirSync(d, { withFileTypes: true }).flatMap(e =>
  e.isDirectory() ? walk(`${d}/${e.name}`) : [`${d}/${e.name}`]);
for (const f of ["app", "components"].filter(existsSync).flatMap(walk).filter(f => /\.(tsx?|css)$/.test(f)))
  for (const [, t] of readFileSync(f, "utf8").matchAll(/var\(\s*--([\w-]+)/g))
    if (!declared.has(t)) (console.error(`UNDECLARED  var(--${t})  ${f}`), fail = 1);
// (2) AA contrast for every fg/surface pair, both themes
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

9. **CSS entropy, the hard half:** the emitted stylesheet is the honest census of what components minted. `npx wallace-cli .next/static/css/*.css` against the build of record (one file per invocation if the glob expands to several) → `!important` count == 0 (the `@layer` order ultraweb:tokens sets is what overrides shadcn) and zero orphaned custom properties, declared in globals.css and referenced nowhere — the mirror image of check 8. Both fail at the declaring file:line, owner `tokens`.
10. **DIRECTION-gated packages [JUDGMENT → Lead]:** `animejs` passes only with BOTH a `from "animejs"` import under app/components — the specifier is the only tell, since `animate(` is also motion/react and WAAPI — AND a design/DIRECTION.md line commissioning the SVG moment that earned it. `three` and `@react-three/*` are judged identically (`<Canvas`, `useFrame(` also appear in dead code): the import under app, components or lib AND a DIRECTION.md line naming `ultraweb:showpiece` for one set piece, or `ultraweb:set-design` **with route scope and byte budget** for a scene persisting across routes. Either half missing is a defect — uninstall, or send the moment back to ultraweb:direction to be named.
11. **CSS census [JUDGMENT → Lead]:** the same wallace run read against design/SYSTEM.md as ceilings, never equalities — unique colours ≤ palette + shadcn's base tokens, unique font-sizes ≤ the `clamp()` scale length plus a tolerance (Tailwind utilities legitimately emit more, so the tail is what is judged). Every excess traces to a component: delete the stray value, never widen the palette to match the census.

## Pass criteria

Checks 1–9 green in ONE sequential pass and 10–11 ruled, before PASS. Checks 2, 3 and 5–9 read the current source and re-verify a fix on the spot, but the server serves the build of record, not the working tree: any fix that touched source, config, tokens or dependencies has the Lead repeat the Phase 11 preamble first — one rebuild, the new exit code in PROGRESS.md §Now — then re-dispatch `rerunOnly: [1, <the fixed checks>]`: check 1's evidence is that new build, 4 reads the server serving it. A config or token change (globals.css, next.config.ts) widens the re-run to the whole gate. Zero unjustified suppressions. Every result recorded as the command's actual output line, not a memory of it.

## QA.md entry

Appended by the runner with `cat >> design/QA.md <<'EOF'` — never rewritten, never Read first for an anchor. On `rerunOnly` the append is a dated `### gate-code — re-run <date>` block listing only the re-run checks and their new results.

```markdown
## gate-code — 2026-07-16 — PASS
| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | build of record | PASS | qa/build.log exit 0 — "Compiled successfully" |
| 2 | npx tsc --noEmit | PASS | exit 0, silent |
| 3 | npx eslint . | PASS | 0 problems |
| 4 | routes + prod log | PASS | 7/7 routes 200 on :3100, qa/prod.log clean |
| 5 | RSC boundaries | PASS | 9 client files, all leaves, 0 in layouts |
| 6 | stack relics | PASS | 0 hits across 10 greps |
| 7 | unused dependencies | PASS | 11 deps audited, 0 unused |
| 8 | token contract + AA | PASS | qa/token-contract.mjs exit 0 — 0 undeclared, 14 pairs ≥4.5:1 |
| 9 | CSS entropy | PASS | wallace: 0 !important, 0 orphans |
| 10 | DIRECTION-gated deps | PASS | animejs: seal.tsx:12 + DIRECTION.md L41 — Lead ruled commissioned |
| 11 | CSS census | PASS | 19 colours (palette 16 + base), 11 font-sizes (scale 9) — Lead ruled inside ceiling |
Issues fixed: removed unused `date-fns`; moved "use client" from app/page.tsx to components/sections/hero.tsx; raised `--muted-foreground` lightness to clear AA in `.dark`.
```

## Anti-patterns

- `next lint` anywhere — removed in Next 16; ESLint CLI only
- `"strict": false`, `as any` sprinkles, or a blanket `/* eslint-disable */` to silence a tool — hiding the defect, not fixing it
- `"use client"` slapped on a layout to make a hook error vanish — the error is telling you the boundary is wrong
- Downgrading next/tailwindcss/motion to dodge an error — hand `stack-doctor` the log path instead

## Worked example — Tidepool, first cold pass of the code gate

Moved to `references/example.md` — read only when this build's case is genuinely ambiguous; the sections above are the decision material.

## Composes with

Moved to `references/composes.md` — the handoff map; load it when orchestrating this skill against its neighbors.
