---
name: gate-accessibility
description: WCAG 2.2 AA quality gate for ultraweb builds — computes real contrast ratios in the browser (computed colors canvas-normalized to sRGB, so oklch tokens measure correctly), walks the full keyboard path via Playwright (tab order, focus-visible ring on every interactive element, Escape closes every overlay), audits landmarks, heading structure, and alt text, and re-tests every page under emulated prefers-reduced-motion. Invoke in Phase 11 (Gates) of every ultraweb build before reporting done, and whenever the user says "accessibility check", "a11y audit", "WCAG", "contrast check", "keyboard navigation", "screen reader", "focus states", or "is this accessible".
---

# gate-accessibility — exclusion is a defect

**Stage:** Phase 11 — Gates - **Reads:** running production build (`npm run build` + `npm start`), design/SYSTEM.md §color + §motion, design/SITEMAP.md (route list), built components - **Writes:** design/QA.md §gate-accessibility

## Standard

WCAG 2.2 AA on every route, in both themes, verified by measurement — never by reading code and assuming. Contrast is computed, the keyboard path is driven key by key, reduced motion is emulated and re-screenshotted. The constitution calls this the floor, not a feature: a red here blocks ship regardless of how the site looks. Always gate the production server, never `next dev`.

## Checklist

1. **Contrast** — text ≥4.5:1; large text (≥24px, or ≥18.66px bold) ≥3:1; non-text UI (input borders, meaning-bearing icons, focus rings against their surface) ≥3:1. Light AND dark theme — dark is a first-class design and gets its own full pass.
2. **Keyboard** — every interactive element reachable by Tab in visual order; a designed focus-visible ring on every stop (never browser-default blue, never nothing); skip link is the first stop and works; Escape closes every overlay (mobile menu, modal, lightbox) and returns focus to its trigger; modals trap focus while open.
3. **Landmarks & structure** — exactly one `<main>`; `<header>`/`<footer>` present; multiple `<nav>`s get distinct `aria-label`s; exactly one `<h1>` per page; heading levels never skip (h2→h4 is a defect).
4. **Alt text** — every image has `alt`: a real description when the image argues something, `alt=""` when decorative; icon-only buttons/links have `aria-label`; no alt starting "image of"/"photo of".
5. **Reduced motion** — with `prefers-reduced-motion: reduce` emulated: no transform-based entrances play, every piece of content is still visible, all state changes read without movement.
6. **WCAG 2.2 specifics** — pointer targets ≥24×24 CSS px everywhere (2.5.8; gate-responsive separately enforces ≥44px on mobile); focused elements never hidden under the sticky header (2.4.11); any drag interaction has a click alternative (2.5.7).
7. **Forms** — every input has an associated `<label>` (for/id); errors are text tied via `aria-describedby` and announced (`role="alert"` or `aria-live="polite"`); invalid state exposed via `aria-invalid`.

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

**6. Targets & obscuring.** `[...document.querySelectorAll("a,button,input,select,[role=button]")].map(e=>e.getBoundingClientRect()).filter(r=>r.width>0&&(r.width<24||r.height<24)).length` → 0. Tab through a long page: the focused element must land clear of the sticky header (`scroll-padding-top` on `html` is the usual fix — navigation owns it).

**7. Forms.** `browser_evaluate`: `[...document.querySelectorAll("input,select,textarea")].filter(e=>!e.labels?.length && !e.getAttribute("aria-label")).length` must be 0. Then submit each form empty on the running server and assert via `browser_evaluate` on the invalid field: `aria-invalid` is `"true"`; its `aria-describedby` resolves — `document.getElementById(f.getAttribute("aria-describedby"))` returns the visible error node; and that node (or a wrapper containing it) carries `role="alert"` or `aria-live="polite"`. A validation message that only changes color or only exists visually fails here.

**8. axe sweep (supplement, not substitute).** `npm i -D axe-core`, inject `node_modules/axe-core/axe.min.js` via `browser_evaluate`, run `await axe.run()` — zero critical or serious violations. axe cannot judge focus order, ring design, or reduced-motion behavior; the walks above stay mandatory.

## Pass criteria

All 7 Checklist items green (verify steps 1–7) on every route in design/SITEMAP.md, both themes, at 375px and 1440px, plus the axe supplement (verify step 8) at zero critical/serious violations. Every fix re-runs the exact check that failed — no "fixed, trust me".

## QA.md entry

```md
## gate-accessibility — PASS (2026-07-16)
routes: / /about /pricing · themes: light+dark · viewports: 375/1440
contrast: 0 failing pairs (214 checked, min 4.61) · keyboard: 42 stops, ring on all, Esc closes menu+modal
landmarks/alt/targets: clean · forms: labels 0 missing, empty-submit announces on contact form · reduced-motion: re-shot, no hidden content · axe: 0 critical/serious
fixed: footer link 3.9:1 → 4.7:1 (muted token bumped in color ramp) · residual: none
```

## Anti-patterns

- `focus:outline-none`/`focus:outline-hidden` with no `focus-visible:` replacement (grep it — automatic defect)
- Fixing a contrast fail by hard-coding a hex on one element instead of adjusting the token ramp in `ultraweb:color` — the same pair fails again on the next surface
- `alt="image"`; `aria-label` parroting visible text onto everything
- `tabindex` greater than 0 (grep `tabindex="[1-9]`) — forces tab order instead of fixing DOM order
- `onClick` on a `div`/`span` without `role="button"` + key handling — use a real `<button>`
- Passing reduced motion with a global `* { animation: none }` — color/opacity feedback must survive; state may never depend on movement alone
- Testing only light theme, only desktop, or only the home page

## Worked example — Aldermoor Trust, community foundation grants + stories

design/DIRECTION.md set the bar as the aesthetic itself: "Open Civic — accessibility-first, all pairings AAA where possible." The gate ran the full pass on all five routes from design/SITEMAP.md (`/`, `/grants`, `/stories/[slug]`, `/volunteer`, `/donate`), both themes, 375 + 1440.

Contrast (step 1, canvas-normalized) cleared the AA floor with room: Source Serif 4 story body on warm paper `oklch(0.97 0.008 85)` measured 13.6:1 (AAA); the deep green accent `oklch(0.45 0.1 155)` on that paper measured 5.2:1 — AA and AAA-large, acceptable for the link role, logged as below the AAA aspiration. Keyboard walk: 31 stops, focus-visible ring on all, Escape closed the mobile nav and returned focus to the toggle.

The catch was step 5. On `/`, the signature story cards — the left rule that grows into the reading-progress indicator — entered via a scroll-linked `whileInView` with `initial={{ opacity: 0 }}` and no reduced-motion guard. Under `page.emulateMedia({ reducedMotion: "reduce" })` the entrance was skipped, so all six cards stayed at opacity 0, invisible forever; the re-shot `/` was blank below the fold.

Fix owned by ultraweb:scroll-motion, per motion-language's policy: the reduced-motion branch now returns the cards at rest (opacity 1, rule at full height) instead of the banned blanket `* { animation: none }`. Re-ran step 5 on `/` under reduce → six cards visible. Lands in design/QA.md §gate-accessibility, which flipped to PASS.

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
