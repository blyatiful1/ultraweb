---
name: gate-accessibility
description: WCAG 2.2 AA quality gate for ultraweb builds — computes real contrast ratios in the browser (computed colors canvas-normalized to sRGB, so oklch tokens measure correctly), walks the full keyboard path via Playwright (tab order, focus-visible ring on every interactive element, Escape closes every overlay), audits landmarks, heading structure, and alt text, re-tests every page under emulated prefers-reduced-motion, injects the WCAG 1.4.12 text-spacing override to catch clipped or overlapping text, and for DACH-market builds verifies a real BFSG /barrierefreiheit statement. Invoke in Phase 11 (Gates) of every ultraweb build before reporting done, and whenever the user says "accessibility check", "a11y audit", "WCAG", "contrast check", "keyboard navigation", "screen reader", "focus states", "text spacing", "BFSG", "Barrierefreiheitserklärung", or "is this accessible".
---

# gate-accessibility — exclusion is a defect

**Stage:** Phase 11 — Gates - **Reads:** running production build (`npm run build` + `npm start`), design/SYSTEM.md §color + §motion, design/SITEMAP.md (route list), design/BRIEF.md (market), built components - **Writes:** design/QA.md §gate-accessibility

## Standard

WCAG 2.2 AA on every route, in both themes, verified by measurement — never by reading code and assuming. Contrast is computed, the keyboard path is driven key by key, reduced motion is emulated and re-screenshotted. The constitution calls this the floor, not a feature: a red here blocks ship regardless of how the site looks. Always gate the production server, never `next dev`. For a DACH commercial brief that floor is also legal — the BFSG (in force since 2025-06-28) makes WCAG/EN 301 549 statutory for many B2C digital products — so the gate additionally verifies a truthful `/barrierefreiheit` statement whose conformance claim matches what these checks actually measured.

## Checklist

1. **Contrast** — text ≥4.5:1; large text (≥24px, or ≥18.66px bold) ≥3:1; non-text UI (input borders, meaning-bearing icons, focus rings against their surface) ≥3:1. Light AND dark theme — dark is a first-class design and gets its own full pass.
2. **Keyboard** — every interactive element reachable by Tab in visual order; a designed focus-visible ring on every stop (never browser-default blue, never nothing); skip link is the first stop and works; Escape closes every overlay (mobile menu, modal, lightbox) and returns focus to its trigger; modals trap focus while open.
3. **Landmarks & structure** — exactly one `<main>`; `<header>`/`<footer>` present; multiple `<nav>`s get distinct `aria-label`s; exactly one `<h1>` per page; heading levels never skip (h2→h4 is a defect).
4. **Alt text** — every image has `alt`: a real description when the image argues something, `alt=""` when decorative; icon-only buttons/links have `aria-label`; no alt starting "image of"/"photo of".
5. **Reduced motion** — with `prefers-reduced-motion: reduce` emulated: no transform-based entrances play, every piece of content is still visible (an animated SVG path included — it must land drawn, not parked at full dashoffset), all state changes read without movement.
6. **WCAG 2.2 specifics** — pointer targets ≥24×24 CSS px everywhere (2.5.8; gate-responsive separately enforces ≥44px on mobile); focused elements never hidden under the sticky header (2.4.11); any drag interaction has a click alternative (2.5.7).
7. **Forms** — every input has an associated `<label>` (for/id); errors are text tied via `aria-describedby` and announced (`role="alert"` or `aria-live="polite"`); invalid state exposed via `aria-invalid`.
8. **Text spacing (1.4.12)** — under the standard user override (line-height 1.5, letter-spacing .12em, word-spacing .16em, paragraph 2em) nothing clips, truncates, or overlaps; cards, badges, and every fixed-height container grow to fit their text. This stack's fluid `clamp()` type inside fixed-height cards is the exact risk.
9. **Accessibility statement (DACH commercial builds)** — when design/BRIEF.md sets market DE/AT/CH, a real `/barrierefreiheit` route states the claimed conformance level, known gaps in plain language, a working feedback route, and the enforcement body (Schlichtungsstelle BGG), linked in the footer beside Impressum + Datenschutz. Since the BFSG (in force 2025-06-28) made WCAG/EN 301 549 statutory for B2C products this is a legal floor, not voluntary craft — and the claimed level must match this gate's actual result.

## How to verify

**1. Contrast — computed, per theme.** `browser_evaluate` on each route:

```js
const x = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
const toRGB = c => { x.clearRect(0,0,1,1); x.fillStyle = c; x.fillRect(0,0,1,1);
  return x.getImageData(0,0,1,1).data };
const lum = c => { const [r,g,b] = toRGB(c);
  const f = v => { v/=255; return v<=0.04045 ? v/12.92 : ((v+0.055)/1.055)**2.4 };
  return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b) };
const bgOf = el => { for (let e=el; e; e=e.parentElement) {
  const c = getComputedStyle(e).backgroundColor; if (c !== "rgba(0, 0, 0, 0)") return c }
  return "rgb(255,255,255)" };
[...document.querySelectorAll("h1,h2,h3,h4,p,a,button,span,li,label,td,th,figcaption")]
  .filter(el => el.innerText?.trim() && el.checkVisibility())
  .map(el => { const s = getComputedStyle(el);
    const L1 = lum(s.color), L2 = lum(bgOf(el));
    const large = parseFloat(s.fontSize) >= 24 || (parseFloat(s.fontSize) >= 18.66 && +s.fontWeight >= 700);
    const ratio = (Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05);
    return { t: el.innerText.slice(0,40), ratio: +ratio.toFixed(2), need: large ? 3 : 4.5 } })
  .filter(x => x.ratio < x.need)
```

Empty array = pass. The canvas round-trip is load-bearing: the stack's oklch tokens serialize as `oklch(…)` in computed styles (CSS Color 4), so regex-parsing the string as an rgb triplet reads L/C/H as R/G/B and produces garbage ratios — always normalize through the canvas pixel first. Switch theme and rerun: with the class strategy, `document.documentElement.classList.add("dark")`; if the build stayed media-based, emulate `prefers-color-scheme: dark` instead. The snippet cannot see text over images, gradients, or alpha layers — verify those pairs with the oklch math from `ultraweb:color` or a screenshot pixel sample. Focus rings: sample ring color vs the surface it sits on, same ≥3:1 bar.

**2. Keyboard walk.** `browser_press_key` "Tab" in a loop; after each press `browser_evaluate` `(e=>e.tagName+" "+(e.innerText||e.getAttribute("aria-label")||"").trim().slice(0,30))(document.activeElement)`. Compare the recorded order against a screenshot of the page — it must match visual order. At each stop: `const s=getComputedStyle(document.activeElement); s.outlineStyle!=="none"||s.boxShadow!=="none"` must hold; screenshot 3 stops as evidence. Grep-assist: `rg -n "focus:outline-(none|hidden)" -g "*.tsx"` — any hit without a `focus-visible:` replacement in the same class list is an automatic defect. At 375px: open the mobile menu, press Escape — snapshot confirms it closed and focus returned to the trigger. Repeat for every modal and lightbox; while open, Tab must cycle inside.

**3. Landmarks/headings.** `browser_evaluate`: `[...document.querySelectorAll("main,header,footer,nav,h1,h2,h3,h4,h5,h6")].map(e=>e.tagName+": "+(e.innerText||e.getAttribute("aria-label")||"").trim().slice(0,40))` — assert one MAIN, one H1, no level skips. (gate-content judges whether the headings tell a story; this gate checks only structure.)

**4. Alt audit.** `document.querySelectorAll("img:not([alt])").length` must be 0. Grep `alt=""` and confirm each is genuinely decorative; grep `alt="(image|photo|picture|icon)` — all defects. Icon-only controls: `[...document.querySelectorAll("button,a")].filter(e=>!e.innerText.trim()&&!e.getAttribute("aria-label")).length` must be 0.

**5. Reduced motion.** Emulate via Playwright `page.emulateMedia({ reducedMotion: "reduce" })` (browser_run_code_unsafe), or relaunch Chromium with `--force-prefers-reduced-motion`. Reload each route, scroll to the bottom, screenshot: nothing slides or scales in, and NO content is missing. The classic failure: initial `opacity: 0` whose entrance is skipped → invisible forever. Grep `whileInView|initial={{ opacity: 0` and confirm each sits behind the motion-language reduced-motion policy.

On a build that commissioned the second engine, sweep it by import specifier — `rg -l 'from "animejs"' app components` — never by bare API name, since `animate(` is also motion/react and WAAPI; every hit must carry the Scope `mediaQueries.reduceMotion` branch that policy mandates. Its failure mode is quieter than the opacity one because there is no faint shape to notice: a `stroke-dashoffset`/`draw` path left undrawn under `reduce` renders as blank whitespace, not as a still frame. The reduce branch must land the FINAL state — completed path, assembled text — never the starting one. In the same files, `rg -n "accessible: false"` → zero hits: `splitText`'s visually-hidden mirror is on by default, and turning it off shreds the text for screen readers.

**6. Targets & obscuring.** `[...document.querySelectorAll("a,button,input,select,[role=button]")].map(e=>e.getBoundingClientRect()).filter(r=>r.width>0&&(r.width<24||r.height<24)).length` → 0. Tab through a long page: the focused element must land clear of the sticky header (`scroll-padding-top` on `html` is the usual fix — navigation owns it).

**7. Forms.** `browser_evaluate`: `[...document.querySelectorAll("input,select,textarea")].filter(e=>!e.labels?.length && !e.getAttribute("aria-label")).length` must be 0. Then submit each form empty on the running server and assert via `browser_evaluate` on the invalid field: `aria-invalid` is `"true"`; its `aria-describedby` resolves — `document.getElementById(f.getAttribute("aria-describedby"))` returns the visible error node; and that node (or a wrapper containing it) carries `role="alert"` or `aria-live="polite"`. A validation message that only changes color or only exists visually fails here.

**8. Text spacing (1.4.12).** `browser_evaluate` injects the WCAG bookmarklet's overrides, then reads the cheap overflow signal:

```js
document.head.insertAdjacentHTML("beforeend", '<style id="ts">' +
  '*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}' +
  'p{margin-block-end:2em!important}</style>');
document.documentElement.scrollWidth > innerWidth   // true = horizontal blowout
```

`scrollWidth > innerWidth` catches horizontal overflow, but vertical clipping inside a fixed `h-*` won't move it — so re-screenshot every route at 375/768/1440 under the override and inspect for truncated titles, cut-off buttons, and overlapping lines. Remove `#ts` before the next step. This is the German BITV-Test's manual text-spacing procedure; the stack's fluid `clamp()` type in fixed-height cards is where it bites.

**9. Accessibility statement (DACH).** Skip unless design/BRIEF.md market ∈ {DE, AT, CH}. On the running server, confirm `/barrierefreiheit` resolves and its copy names all four required parts — conformance level, known gaps in plain language, a working feedback route, and the Schlichtungsstelle BGG — and grep the footer for the link beside `Impressum`/`Datenschutz`. Then cross-check the claimed level against this run: if steps 1–8 logged residual fails, the statement must read *teilweise konform* and list them, never *vollständig*. A page claiming clean conformance while the gate is red is a false-conformance defect — worse than an honest partial, and the one thing the BFSG statement must never be.

**10. axe sweep (supplement, not substitute).** `npm i -D axe-core`, inject `node_modules/axe-core/axe.min.js` via `browser_evaluate`, run `await axe.run()` — zero critical or serious violations. Then a second, scoped pass against the standard this gate actually claims: `await axe.run(document, { runOnly: ["wcag22aa"] })` — that tag set maps rules onto WCAG 2.2 AA, so its violations are precisely the ones step 9's conformance statement is asserting about. Keep the unscoped run for breadth; report both. Injection is the mechanism, not a workaround: the harness drives Playwright over MCP, so there is no Node `Page` object for `@axe-core/playwright` to attach to. axe cannot judge focus order, ring design, or reduced-motion behavior; the walks above stay mandatory.

## Pass criteria

All 9 Checklist items green (verify steps 1–9) on every route in design/SITEMAP.md, both themes, at 375px and 1440px — item 9 applies only to DACH-market builds — plus the axe supplement (verify step 10) at zero critical/serious violations. Every fix re-runs the exact check that failed — no "fixed, trust me".

## QA.md entry

```md
## gate-accessibility — PASS (2026-07-16)
routes: / /about /pricing · themes: light+dark · viewports: 375/1440
contrast: 0 failing pairs (214 checked, min 4.61) · keyboard: 42 stops, ring on all, Esc closes menu+modal
landmarks/alt/targets: clean · forms: labels 0 missing, empty-submit announces on contact form · reduced-motion: re-shot, no hidden content · axe: 0 critical/serious (unscoped + runOnly wcag22aa)
text-spacing (1.4.12): override on, 0 clips/overlaps · a11y statement (DE): /barrierefreiheit present, 'vollständig konform' matches 0 residual
fixed: footer link 3.9:1 → 4.7:1 (muted token bumped in color ramp) · residual: none
```

## Anti-patterns

- `focus:outline-none`/`focus:outline-hidden` with no `focus-visible:` replacement (grep it — automatic defect)
- Fixing a contrast fail by hard-coding a hex on one element instead of adjusting the token ramp in `ultraweb:color` — the same pair fails again on the next surface
- `alt="image"`; `aria-label` parroting visible text onto everything
- `tabindex` greater than 0 (grep `tabindex="[1-9]`) — forces tab order instead of fixing DOM order
- `onClick` on a `div`/`span` without `role="button"` + key handling — use a real `<button>`
- Passing reduced motion with a global `* { animation: none }` — color/opacity feedback must survive; state may never depend on movement alone
- Fixed-height title clamps (`line-clamp` inside a hard `h-*`) that truncate under the text-spacing override instead of growing — use `min-h-*` + flex so the card expands (ultraweb:cards owns the fix)
- Auto-generating a clean `/barrierefreiheit` claim ("vollständig barrierefrei") while the gate still shows residual fails — the statement must match the measured result; evidence-before-claims governs compliance copy too
- Testing only light theme, only desktop, or only the home page

## Worked example — Aldermoor Trust, community foundation grants + stories

design/DIRECTION.md set the bar as the aesthetic itself: "Open Civic — accessibility-first, all pairings AAA where possible." The gate ran the full pass on all five routes from design/SITEMAP.md (`/`, `/grants`, `/stories/[slug]`, `/volunteer`, `/donate`), both themes, 375 + 1440.

Contrast (step 1, canvas-normalized) cleared the AA floor with room: Source Serif 4 story body on warm paper `oklch(0.97 0.008 85)` measured 13.6:1 (AAA); the deep green accent `oklch(0.45 0.1 155)` on that paper measured 5.2:1 — AA and AAA-large, acceptable for the link role, logged as below the AAA aspiration. Keyboard walk: 31 stops, focus-visible ring on all, Escape closed the mobile nav and returned focus to the toggle.

The catch was step 5. On `/`, the signature story cards — the left rule that grows into the reading-progress indicator — entered via a scroll-linked `whileInView` with `initial={{ opacity: 0 }}` and no reduced-motion guard. Under `page.emulateMedia({ reducedMotion: "reduce" })` the entrance was skipped, so all six cards stayed at opacity 0, invisible forever; the re-shot `/` was blank below the fold.

Fix owned by ultraweb:scroll-motion, per motion-language's policy: the reduced-motion branch now returns the cards at rest (opacity 1, rule at full height) instead of the banned blanket `* { animation: none }`. Re-ran step 5 on `/` under reduce → six cards visible.

Step 8 surfaced a quieter defect: under the text-spacing override, the `/grants` cards — grant title `line-clamp-2` inside a fixed `h-56` — clipped the longest programme name mid-word. ultraweb:cards traded the hard height for `min-h-56` + `flex-col`; re-shot at 375/768/1440 under the override, every card grew clean. Step 9 didn't fire — design/BRIEF.md sets market=UK, so the BFSG `/barrierefreiheit` check logged N/A; a DACH commercial brief (e.g. Ledger & Lane) would instead have to ship that statement and match its claimed conformance level to this run's residuals.

Lands in design/QA.md §gate-accessibility, which flipped to PASS.

## Composes with

- ultraweb:color — owns the oklch contrast math and the token-level fix when a computed pair fails.
- ultraweb:micro-interactions — installs the focus-visible rings and reduced-motion feedback this gate measures.
- ultraweb:motion-language — its reduced-motion policy is the spec that item 5 verifies.
- ultraweb:navigation — skip link, Escape-closing mobile menu, and scroll-padding under sticky headers.
- ultraweb:forms — label association and error announcement checked in item 7.
- ultraweb:gate-responsive — holds the 44px mobile touch-target bar; this gate holds the WCAG 24px floor everywhere.
- ultraweb:gate-content — the sibling gate that judges whether headings tell a story; this gate checks only heading structure (item 3) and hands narrative calls there.
- ultraweb:faq — when the keyboard walk hits a disclosure/accordion missing `aria-expanded` or Enter/Escape handling, faq owns the fix this gate reports.
- ultraweb:scroll-motion — when the reduced-motion re-test (item 5) finds a scroll-linked entrance left at opacity 0, scroll-motion owns the resting-state guard.
- ultraweb:animejs — owns the Scope `mediaQueries.reduceMotion` branch item 5 sweeps for; an SVG path left undrawn under `reduce` is its defect to fix, and the fix is the drawn end state.
- ultraweb:cards — fixed-height card titles (and ultraweb:data-display's stat blocks) are the primary text-spacing (1.4.12) clip risk; they own the `min-height` + flex fix item 8 reports.
- ultraweb:footer — carries the `/barrierefreiheit` link beside Impressum + Datenschutz that item 9 checks.
- ultraweb:i18n — owns the German-language `/barrierefreiheit` route and copy; this gate only verifies it exists and tells the truth.
