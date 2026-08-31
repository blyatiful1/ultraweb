---
name: gate-accessibility
description: WCAG 2.2 AA quality gate for ultraweb builds — computes real contrast ratios in the browser (computed colors canvas-normalized to sRGB, so oklch tokens measure correctly), walks the full keyboard path via Playwright (tab order, focus-visible ring on every interactive element, Escape closes every overlay), audits landmarks, heading structure, and alt text, re-tests every page under emulated prefers-reduced-motion, injects the WCAG 1.4.12 text-spacing override to catch clipped or overlapping text, and for DACH-market builds scopes the BFSG/BaFG duty (jurisdiction, e-commerce service scope, microenterprise exemption) before verifying the required accessibility information. Invoke in Phase 11 (Gates) of every ultraweb build before reporting done, and whenever the user says "accessibility check", "a11y audit", "WCAG", "contrast check", "keyboard navigation", "screen reader", "focus states", "text spacing", "BFSG", "Barrierefreiheitserklärung", or "is this accessible".
---

# gate-accessibility — exclusion is a defect

**Stage:** Phase 11 — Gates - **Reads:** running production build (`npm run build` + `npm start`), design/SYSTEM.md §color + §motion, design/SITEMAP.md (route list), design/BRIEF.md (market), built components - **Writes:** design/QA.md §gate-accessibility

## Standard

WCAG 2.2 AA on every route, in both themes, verified by measurement — never by reading code and assuming. Contrast is computed, the keyboard path is driven key by key, reduced motion is emulated and re-screenshotted. The constitution calls this the floor, not a feature: a red here blocks ship regardless of how the site looks. Always gate the production server, never `next dev`. For a DACH commercial brief the floor can also be legal — Germany's BFSG and Austria's BaFG (both in force since 2025-06-28) make WCAG/EN 301 549 statutory for in-scope B2C services — so the gate first scopes the duty (item 9's jurisdiction/service/microenterprise questions), then verifies a truthful accessibility information page whose conformance claim matches what these checks actually measured. Statutory or not, WCAG 2.2 AA stays the constitution's own floor.

## Checklist

1. **Contrast** — text ≥4.5:1; large text (≥24px, or ≥18.66px bold) ≥3:1; non-text UI (input borders, meaning-bearing icons, focus rings against their surface) ≥3:1. Light AND dark theme — dark is a first-class design and gets its own full pass.
2. **Keyboard** — every interactive element reachable by Tab in visual order; a designed focus-visible ring on every stop (never browser-default blue, never nothing); skip link is the first stop and works; Escape closes every overlay (mobile menu, modal, lightbox) and returns focus to its trigger; modals trap focus while open.
3. **Landmarks & structure** — exactly one `<main>`; `<header>`/`<footer>` present; multiple `<nav>`s get distinct `aria-label`s; exactly one `<h1>` per page; heading levels never skip (h2→h4 is a defect).
4. **Alt text** — every image has `alt`: a real description when the image argues something, `alt=""` when decorative; icon-only buttons/links have `aria-label`; no alt starting "image of"/"photo of".
5. **Reduced motion** — with `prefers-reduced-motion: reduce` emulated: no transform-based entrances play, every piece of content is still visible (an animated SVG path included — it must land drawn, not parked at full dashoffset), all state changes read without movement. On a build carrying a DIRECTION-commissioned persistent scene, the same emulation must produce **no canvas element in the DOM at all** on every route in its scope — not a paused canvas — with that route's poster rendered and its `sr-only` narrative readable as a complete claim.
6. **WCAG 2.2 specifics** — pointer targets ≥24×24 CSS px everywhere (2.5.8; gate-responsive separately enforces ≥44px on mobile); focused elements never hidden under the sticky header (2.4.11); any drag interaction has a click alternative (2.5.7).
7. **Forms** — every input has an associated `<label>` (for/id); errors are text tied via `aria-describedby` and announced (`role="alert"` or `aria-live="polite"`); invalid state exposed via `aria-invalid`.
8. **Text spacing (1.4.12)** — under the standard user override (line-height 1.5, letter-spacing .12em, word-spacing .16em, paragraph 2em) nothing clips, truncates, or overlaps; cards, badges, and every fixed-height container grow to fit their text. This stack's fluid `clamp()` type inside fixed-height cards is the exact risk.
9. **Accessibility statement (DACH commercial builds)** — scope FIRST, statement second; "every DACH site needs a BFSG statement" is itself a defect. Three-question gate, stop at the first no: (a) **Jurisdiction** — DE → BFSG; AT → BaFG; CH-only → no statutory duty today (the BehiG's web rule binds authorities, Art. 6 is only a discrimination ban, and the Teilrevision that would bind private providers is still in Parliament) — WCAG AA stays as craft, no statement is emitted. (b) **Service scope** — the duty covers *Dienstleistungen im elektronischen Geschäftsverkehr*: a service taking an individual consumer request toward concluding a consumer contract (shop, booking, ticketing, banking); a site that never takes such a request falls outside § 1 Abs. 3 Nr. 5 BFSG — the Bundesfachstelle FAQ defines the in-scope test, and the brochure case follows from it by negation. (c) **Microenterprise** — fewer than 10 employees AND ≤ €2M turnover or balance total → service providers are exempt (§ 3 Abs. 3 BFSG / § 6 Abs. 1 BaFG; services only — covered *products* stay bound). All three yes → publish the § 14 / Anlage 3 accessibility information (verify step 9 has the per-country content), linked in the footer beside Impressum + Datenschutz, with a claimed level that matches this gate's measured result. Record the scoping decision in QA.md even when the answer is out-of-scope. Guidance toward the statutes, not legal sign-off.

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

On a build that commissioned a scene, sweep the renderer the same way — `rg -l 'from "three"|from "@react-three/' app components lib`, never by `<Canvas` or `useFrame(` — and then emulate `reduce` on **every route in the DIRECTION.md scope**, not just the first. Every hit must sit behind a `useReducedMotion()`/`matchMedia` branch that returns the static edition *before* the dynamic import resolves. Its failure mode is worse than the animejs one: a path left undrawn is blank whitespace, but a scene that fails to mount under `reduce` leaves an empty *page* where the argument was. The poster is load-bearing markup, not a fallback attribute: confirm an `<img>` (or a server-rendered composition) is present in the DOM under `reduce`, and that the route's `sr-only` narrative reads as a real claim, never "an interactive 3D scene" — `showpiece`'s narrative rule binds **per route** at this scope. Then re-run the keyboard pass on those routes: Space/PageDown/Home/End must still move the page, every 3D affordance must be reachable through a real `<a href>` in the DOM, and `rg -n 'addEventListener\("wheel"' app components lib` must produce no `preventDefault` — a canvas-first site that took the wheel away has taken Space, PageDown, Home, End and find-in-page with it (WCAG 2.2 AA 2.1.1). For an in-scope DACH brief (item 9's scoping gate) the BFSG makes all of this a legal floor, not a courtesy — and out of scope it stays this gate's own floor.

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

**9. Accessibility statement (DACH).** Skip unless design/BRIEF.md market ∈ {DE, AT, CH}. The facts feeding the gate live in BRIEF.md §Compliance facts, recorded in Phase 1 where they were cheap to ask — but do NOT just trust them: re-derive each answer from the FINISHED build (does the shipped site actually conclude consumer contracts online?), and treat drift as its own finding — a brochure brief that grew a booking flow mid-build re-entered scope, whatever the brief says. Write the decision into QA.md — jurisdiction, service scope, microenterprise — with one line of reasoning each. Out of scope on any question → record it ("BFSG scope: OUT (brochure site, no e-commerce)") and stop; emitting a statement a site doesn't owe misstates the law as much as omitting one it does.

In scope, **Germany**: the duty is the § 14 BFSG / Anlage 3 *Informationen zur Barrierefreiheit* — NOT the public-sector BGG/BITV "Erklärung zur Barrierefreiheit" template. A dedicated `/barrierefreiheit` route is the HOUSE convention, not the statute — Anlage 3 permits the information in the AGB or any other clearly perceivable form; never describe the route itself as legally required. Confirm the information (wherever it lives, `/barrierefreiheit` by default) names: the service in general terms, how it works, how it meets the BFSGV requirements, and the competent market-surveillance authority — the **MLBF AöR, Magdeburg** (competent since 2025-09-26). The Schlichtungsstelle BGG is NOT required content; naming it as the free conciliation avenue under § 34 BFSG is optional goodwill, but presenting it as the enforcement body in place of the MLBF is a defect. **Austria**: same structure under § 14 Abs. 2 BaFG + Anlage 3, provided in written AND spoken form; the authority to name is the **Sozialministeriumservice** (market surveillance: Landesstelle OÖ, Linz) — never a German body on an Austrian site. Cross-border caveat: whether a non-German seat selling into Germany is caught by the BFSG is not settled by any quotable official source — assume yes when the site targets German consumers, and flag it for counsel in QA.md rather than asserting it.

Either country: grep the footer for the link beside `Impressum`/`Datenschutz`, then cross-check the claimed level against this run: if steps 1–8 logged residual fails, the statement must read *teilweise konform* and list them, never *vollständig*. A page claiming clean conformance while the gate is red is a false-conformance defect — worse than an honest partial, and the one thing this information must never be.

**10. axe sweep (supplement, not substitute).** `npm i -D axe-core`, inject `node_modules/axe-core/axe.min.js` via `browser_evaluate`, run `await axe.run()` — zero critical or serious violations. Then a second, scoped pass against the standard this gate actually claims: `await axe.run(document, { runOnly: ["wcag22aa"] })` — that tag set maps rules onto WCAG 2.2 AA, the house floor. One boundary kept explicit: a clean wcag22aa run supports a BFSG/BaFG statement but does not prove statutory conformity — the legal test is the applicable BFSGV/Anlage requirements, of which automated WCAG checks cover only part; the statement's claim must rest on this gate's full measured result, never on the axe pass alone. Keep the unscoped run for breadth; report both. Injection is the mechanism, not a workaround: the harness drives Playwright over MCP, so there is no Node `Page` object for `@axe-core/playwright` to attach to. axe cannot judge focus order, ring design, or reduced-motion behavior; the walks above stay mandatory.

## Pass criteria

All 9 Checklist items green (verify steps 1–9) on every route in design/SITEMAP.md, both themes, at 375px and 1440px — item 9 applies only to DACH-market builds — plus the axe supplement (verify step 10) at zero critical/serious violations. Every fix re-runs the exact check that failed — no "fixed, trust me".

## Degraded mode (no browser)

When Phase 0's preflight reported no Playwright MCP, the verdict is **UNVERIFIED**, never a fake PASS. The split is explicit. Still runs, in full, and still blocks on failure: computed contrast math on every token pair in globals.css (contrast is arithmetic, not pixels), semantic-HTML and landmark audit of the source, alt-text presence, `prefers-reduced-motion` guards in the motion code, focus-visible styles defined in CSS. Cannot run: the keyboard-only walkthrough, real focus-order observation, axe against a rendered DOM. QA.md records both halves: `UNVERIFIED — no browser: token contrast + source audit PASS; keyboard path, focus order, axe unproven.` Accessibility claimed from source alone is a claim, and the entry must read like one.

## QA.md entry

```md
## gate-accessibility — PASS (2026-07-16)
routes: / /about /pricing · themes: light+dark · viewports: 375/1440
contrast: 0 failing pairs (214 checked, min 4.61) · keyboard: 42 stops, ring on all, Esc closes menu+modal
landmarks/alt/targets: clean · forms: labels 0 missing, empty-submit announces on contact form · reduced-motion: re-shot, no hidden content · axe: 0 critical/serious (unscoped + runOnly wcag22aa)
text-spacing (1.4.12): override on, 0 clips/overlaps
BFSG scope (DE): IN — e-commerce checkout, not a microenterprise · a11y info: /barrierefreiheit present, names MLBF, 'vollständig konform' matches 0 residual
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
- Emitting a statement without the scoping gate — a German BFSG page on an Austrian or Swiss build, any statement on an out-of-scope brochure site, or the Schlichtungsstelle BGG presented as the enforcement body (that is the MLBF; the Schlichtungsstelle is the optional § 34 conciliation avenue)
- Testing only light theme, only desktop, or only the home page

## Worked example — Aldermoor Trust, community foundation grants + stories

Moved to `references/example.md` — read only when this build's case is genuinely ambiguous; the sections above are the decision material.

## Composes with

Moved to `references/composes.md` — the handoff map; load it when orchestrating this skill against its neighbors.
