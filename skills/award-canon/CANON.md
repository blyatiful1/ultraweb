# CANON.md — the per-site study bank

The 32 dossiers behind `award-canon`'s 25 patterns, grouped by year (newest first). Each is a study object, not a template — **steal the principle, never the surface.** Read alongside `SKILL.md`, which distils these into the named patterns and the invariants.

**Reading the entries.** Award tiers and jury scores are cited at the level the dossiers *verify* — many are Category / SOTD / Users'-Choice / Developer wins, not grand prizes; several circulating "Site of the Year" labels are corrected here. Never inflate a tier, and never retrofit a sub-score onto a site whose dossier doesn't publish one. **Reconstructed** flags a site studied from case studies + award pages, not live inspection (dead, replaced, or fetch-blocked) — teach its specifics as *reported*. **Unverified** flags a claim the sources don't confirm (typefaces, exact stacks, a reduced-motion path) — keep the hedge. The per-archetype map at the end wires these to `direction`'s 12 archetypes.

---

## 2026

### hirotos.com "Signal Pole" — Hiroto Sato (Tokyo)
**SOTD Jul 17 2026 · Developer Award Jul 17 2026.** Overall 7.24 — Design 7.08 · Usability 7.25 · Creativity 7.48 · Content 7.33 (no Dev sub-score breakdown published — do not invent one). Live-inspected 2026-07-29. Palette paper `#f7f5ef` / signal blue `#133afd` / lamp red `#ff2b1f` · amber `#ffd21f` · green `#12d7a8`.
- **Essence:** an entire portfolio authored as ONE GLB — a Blender scene whose single baked camera action *is* the navigation, with the geometry, the nav targets and the "sections" all inside it; the runtime does almost nothing but map input onto that clip's playhead. Site-scale 3D as an asset-authoring problem, not a shader problem: the total hand-written GLSL is five lines and it still took a Developer Award.
- **Signature:** a Japanese signal pole you travel past forever — the metaphor names the events, the geometry and the three-lamp colour story.
- **Steal (with care):** The Persistent Hero Object (at site scale) · One Material World · The Metaphor Engine · Semantic Motion Only (the whole post-stack is one aberration that fires on impact and is otherwise at zero) · Scroll-as-Camera — **mechanism only**, see the anti-lesson.
- **Anti-lesson:** the mechanism is the lesson and the delivery is the warning. `prefers-reduced-motion` appears **zero** times in 1.5 MB of JS and 27 KB of CSS; `keydown` appears zero times while `wheel` is `preventDefault`ed — no authored keyboard path to the camera was observed, and a hijacked wheel is precisely the construction that strands one (WCAG 2.2 AA 2.1.1 — and the likeliest single reason Usability scored 7.25); all four routes serve a byte-identical empty `<body>` with one shared `<title>` and no OG, canonical or `<noscript>`, and robots.txt and sitemap.xml both 404; a full visit is ≈10 MB against the canon's <3 MB target, including a 6.73 MB eagerly-played showreel MP4, 2.74 MB of raw eager PNGs, one 570 KB monolithic chunk, and a render-path HDRI on a free GitHub-raw proxy. Studied as a **mechanism and cautionary dossier**, not a design exemplar — its weakest jury axis is Design (7.08). Typeface: Adobe Typekit `helvetica-neue-lt-pro`, **verified from the payload**.

---

## 2025

### Messenger — abeto (Vicente Lucendo + Michael Sungaila)
**SOTD Nov 10 2025 · Developer Site of the Year 2025.** Overall 7.92 — Design 8.04 · Usability 7.46 · Creativity 8.23 · Content 8.15 · Dev Award 8.21 (no accessibility sub-score published — do not invent one). Live, confirmed up (2026-07-22). Palette teal `#81BFBC` / sage `#C9D5C3`.
- **Essence:** a full multiplayer 3D game in a browser tab at 5.7MB initial / 17.5MB peak — ambition welded to obsessive weight discipline; the product *is* the spectacle, which is the only reason the trade is acceptable.
- **Signature:** the tiny walkable sphere — walk any direction and loop back, central gravity, an auto-following camera you never touch.
- **Steal:** Weight as a Feature · The Three-Token Contract (the authored 16×16 palette *atlas* — a unity/memory device, not content-derived) · The Metaphor Engine (one spatial idea governs everything) · Instant Everything (drip-in state over frames).
- **Anti-lesson:** canvas-only with WASM-generated in-world type = no DOM text, no a11y tree, no static/SEO path; Usability 7.46 its lowest; no reduced-motion. The living exception proving canvas-only *can* endure — and still ships nothing to fall back to.

### Lando Norris — OFF+BRAND.
**Site of the Year 2025 + Users' Choice · SOTM · SOTD Nov 17 2025 · FWA of the Day · CSSDA.** Overall 8.18 — Design 8.12 · Usability 7.9 · Creativity 8.71 · Content 8.18 · Dev 7.58 (Animations 8.60 · Accessibility 7.00 · WPO 7.60). Live (landonorris.com; Webflow-obfuscated DOM — detail from the OFF+BRAND case). Palette lime `#D2FF00` on near-black `#111112`.
- **Essence:** an athlete-brand site that behaves like the sport — F1 speed/precision/momentum in every interaction, yet ships as a real commercial product (store, race hub, partnerships). Won on Creativity (8.71) + Animations (8.60).
- **Signature:** the Helmets Hall of Fame — rotatable 3D helmet designs that are also the site's entire color engine.
- **Steal:** The Persistent Hero Object · Content-Derived Color (palette drawn from the helmets) · The Three-Token Contract (two-token livery) · One Physics (racing momentum) · The Loader is the Overture ("Load Norris").
- **Anti-lesson:** WebGL + Rive + 3D + video is huge weight; a "please rotate your device" wall (Accessibility 7.00) fails WCAG — take the effect, not the megabytes. Typeface names unverified.

---

## 2024

### Igloo Inc — Abeto (dev/3D) + Bureaux (design/direction)
**SOTD Jul 23 2024 · Site of the Year 2024 · Developer Site of the Year 2024.** Overall 7.92 — Design 8.05 · Usability 7.5 · Creativity 8.31 · Content 7.91 · Dev 7.66 (Animations 9.60 · WPO 8.00 · Responsive 8.40 · Semantics/SEO 6.60 · Accessibility 6.60). Live (igloo.inc).
- **Essence:** a crypto holding-company landing page reimagined as one continuous WebGL world; coherence — one frozen material world every interaction obeys — is the win, not effect-count.
- **Signature:** portfolio projects encased in procedurally-grown ice crystals.
- **Steal:** One Material World · Scroll-as-Camera (dolly) · The Masked Cut (chromatic aberration + frost) · The Loader is the Overture (real-time intro as scene one).
- **Anti-lesson:** UI text rendered as SDF in canvas → Accessibility/Semantics 6.60, nothing crawlable; the message is thin (90% mood). Typeface unverified.

### Opal Tadpole — Claudio Guglieri (design) / Ingamana (dev)
**SOTD Jan 11 2024 · eCommerce Site of the Year 2024** (category, not overall SOTY). Overall 7.52 — Design 7.73 · Usability 7.34 · Creativity 7.27 · Content 7.64 · Dev 7.84 (Animations 8.60 · Responsive 8.00 · WPO 7.80 · Accessibility 7.60 · Semantics 7.60). Live. Palette `#FFDB01` + `#FFFFFF` only.
- **Essence:** sells the world's smallest webcam by making *scale* the whole narrative — product-photography craft fused to buttery scroll timing; restraint IS the concept (the win was craft + focus, not novelty).
- **Signature:** scroll-driven scale storytelling — the pinned tiny object pushed through zoom/rotation reveals.
- **Steal:** Kinetic Reveal Type (gradient `background-clip` wipe) · Scroll-as-Camera · The Three-Token Contract (two colors) · Progressive Spectacle Tiers (Frontend.fyi rebuilt the effect in native CSS scroll-driven).
- **Anti-lesson:** single-page-only sacrifices deep-linking/SEO; the original's exact stack and reduced-motion handling are **unverified** — never assume a winner shipped reduced-motion; always add your own.

### Don't Board Me — The First The Last (Miami)
**Site of the Year 2024 (Users' Choice) · SOTD Mar 11 2024 · Developer Award.** Overall 7.83 — Design 8.08 · Usability 7.41 · Creativity 8.00 · Content 7.73 · Dev 7.26 (Animations 7.20 · Accessibility 7.00 · WPO 6.80 · Responsive 8.00 · SEO 7.20). Live. Nuxt; no heavy WebGL. Fonts unverified.
- **Essence:** beat thousands of WebGL showpieces by being charming, warm, legible, and handmade — craft in service of conversion (you're handing over a pet; charm *is* the trust mechanism).
- **Signature:** the tennis-ball splash gate — bounce/throw a ball to enter.
- **Steal:** The Loader is the Overture (brand-verb loader) · The Three-Token Contract (pastel field + one hot vermilion) · Scroll-as-Journey (discrete illustrated scenes) · One Physics (bouncy overshoot).
- **Anti-lesson:** an entry-gate gesture tanks conversion + a11y unless skippable, keyboard-operable, reduced-motion-safe; heavy character illustration dates — keep structure/type solid underneath.

---

## 2023

### Lusion v3 — Lusion
**SOTD Oct 2 2023 · Site of the Year 2023 · Developer Award.** Overall 8.25 — Design 8.26 · Usability 7.95 · Creativity 8.65 · Content 8.26 · Dev 8.41 (Animations perfect 10.00 · WPO 9.00 · Responsive 8.40 · Accessibility 7.40 · SEO 7.60). Live. Palette electric blue `#1a2ffb` on lavender `#f0f1fa`.
- **Essence:** restraint as a delivery vehicle for spectacle — a near-monochrome editorial shell + flawless real-time WebGL that still ships fast (10.00 animations welded to 9.00 WPO).
- **Signature:** a single hero object with real weight/inertia; the cursor imparts momentum; scroll pushes the camera through true Z-depth.
- **Steal:** The Persistent Hero Object · One Physics (inertial matter) · Scroll-as-Camera · Type as Evidence (deliberately "boring" neo-grotesque) · The Three-Token Contract · The Loader is the Overture.
- **Anti-lesson:** a full three.js engine is disqualifying for most commercial sites; camera-through-depth risks scroll-jack; reduced-motion handling and the typeface are **unverified** — add the first, don't name the second.

### Noomo Agency — Noomo Agency
**SOTD Sep 21 2023 (7.72) · Site of the Year — Users' Choice 2023** (community-voted; NOT the jury SOTY). Design 7.93 · Creativity 7.73 · Content 7.79 · Usability 7.41 · dev Accessibility 7.20 · WPO 7.20. **Reconstructed** — the awarded 2023 build was redesigned since. Palette pale blue-gray `#DEE7F1`.
- **Essence:** weaponized cultural narrative (Ukrainian embroidery → pixels; glass → transparency) so the WebGL read as authored, not a tech demo — conviction + coherence over raw spectacle.
- **Signature:** the reverse (upward) scroll — one deliberate rule-break, user-tested and applied consistently.
- **Steal:** Scroll-as-Journey ("rooms in a hallway, each lit differently") · One Material World (glass/refraction motif) · One human fingerprint (the handwritten logo).
- **Anti-lesson:** Three.js weight tanks mid-mobile (WPO 7.20); reverse scroll fights muscle memory — never on a task-focused site; a11y 7.20.

### Mana Yerba Mate — Louis Paquet (Shopify)
**E-commerce Site of the Year 2023 · SOTD Mar 13 2023 (8.03).** Design 8.06 · Usability 7.61 · Creativity 8.45 · Content 8.38 · Dev 7.8 (Animations 9.20 · Accessibility 7.40). Live (rate-limited at fetch). Overall (non-category) SOTY is **unverified** — treat as the e-commerce category. Anchor palette gold `#FFD372` + coral `#F15B40`.
- **Essence:** turned a beverage catalog into a themed amusement park *without* breaking the four-clicks-to-checkout funnel — "funtional"; spectacle and a working Shopify checkout coexist.
- **Signature:** per-flavor "worlds" that dissolve into each other via bubbly transitions; plus a hidden playable footer platformer.
- **Steal:** Scroll-as-Journey (per-flavor worlds) · The Persistent Hero Object (the can stays in frame) · Archive-as-Toy (footer game) · One Physics (cartoon overshoot) · The Masked Cut.
- **Anti-lesson:** Three.js + Lottie + GSAP inside Shopify is very heavy; a11y 7.40; maximalist candy 3D is a dateable aesthetic — take the structure, not the surface.

---

## 2022

### The Other Side of Truth — The First The Last (Ukraine)
**SOTD Jun 2 2022 → Developer Award → Site of the Year 2022.** Overall 7.85 — Creativity 8.01 · Content 8.13 · Design 7.82 · Usability 7.68 · Dev 7.88 (Animations 8.40; Accessibility & WPO both 7.40). Live, verified. Palette flag blue `#2779A7` + gold `#ECD06F`.
- **Essence:** the message *is* the design — a structural gimmick with a thesis, built under air-raid conditions; won on Content + Creativity, not visual polish.
- **Signature:** the "world TRUTH / russian TRUTH" toggle re-narrates the whole page with two irreconcilable framings — interaction becomes argument.
- **Steal:** Interaction as Argument · Semantic Motion Only (messages dissolve = silencing) · Type as Evidence (all-caps journalistic slabs; exact face **unverified**) · Framed Data (stats framed by bullet-hole vignettes).
- **Anti-lesson:** the toggle works *only* because the content is a moral argument — cutesy bolted onto commerce; heavy WebGL/PixiJS over documentary photos is an a11y/weight liability (7.40).

### KPR — Resn (New Zealand)
**Site of the Year 2022 · SOTD Dec 26 2022 (7.98) · SOTM Dec 2022.** First Web3 project ever to win SOTY. Jury strong across the board (multiple 8–10s); Dev ~7.61. **Reconstructed** — kprverse.com returned 403; frame-exact timings **unverified**. Accent `#6D64A3`; typeface **Whyte** (Dinamo, ink traps + variable width) — verified.
- **Essence:** a launch-a-fictional-world site disguised as a product page — lore first ("New Eden"), AAA finish where type, motion, and 3D all serve one fiction.
- **Signature:** the click-and-hold reveal — press a character and a secondary lore layer peels in.
- **Steal:** The Prove-It Gesture · Type as the Image (Whyte as manga-panel headlines) · Fake-Depth (multi-speed parallax) · The Masked Cut (stencil-masked panels → CSS `clip-path`).
- **Anti-lesson:** every-section real-time WebGL = huge weight and slow first paint; hold-to-reveal has zero discoverability — never the only path to key info; Web3 framing dates.

### Persepolis Reimagined — Monks (Media.Monks) for the Getty
**SOTD Jun 1 2022 · SOTM Jun 2022 · Developer Site of the Year 2022 · FWA of the Year + FWA People's Choice.** The provable Awwwards SOTY here is the **Developer** category — treat "Site of the Year" loosely. Overall 7.96 — Design 8.11 · Usability 7.41 · Creativity 8.36 · Content 8.23 · Dev 8.03 (Animations 9.60; Accessibility 7.40). Live (persepolis.getty.edu). Palette tan `#987654` / coral `#D14836` / gold `#ECD06F`.
- **Essence:** a real-time playable reconstruction of a lost city on a AAA-game pipeline (Unity → WebGL 2.0); *accuracy* as the keyword; the jury rewarded a seamlessness with no visible loading, cut, or seam.
- **Signature:** the seamless preloader → intro → WebGL handoff — the last loader frame equals the first intro frame exactly.
- **Steal:** The Loader is the Overture · Scroll-as-Camera (fixed authored path) · One Material World (unifying vignette/bloom/grain post-stack) · Content-Derived Color (earthen palette from the subject).
- **Anti-lesson:** a Unity-scale asset stream is disqualifying for commercial; Usability 7.41 / Accessibility 7.40 — scroll-jacked linear WebGL is hostile to AT; steal the effects, never the nine-month pipeline.

---

## 2021

### Pangram Pangram — Locomotive (Montreal), CD Louis Paquet
**E-Commerce Site of the Year 2021 · SOTD Nov 11 2021 (7.79) · Developer Award** (not the overall SOTY). Design 7.91 · Usability 7.65 · Creativity 7.59 · Content 8.10 (highest) · Animations 8.40 · Accessibility/Semantics/Responsive/Markup 7.80 · WPO 7.00 (lowest). Live. Palette `#000 / #9C9C9C / #FFF` only. No WebGL confirmed.
- **Essence:** a type-foundry storefront that behaves like an editorial magazine — show the fonts *doing their job* at magazine scale; concept-execution fit beat flashier WebGL entries, entirely on DOM + CSS transforms + smooth-scroll.
- **Signature:** the "spinning newspaper" scroll sequence — a specimen that rotates, folds, and reflows on scroll.
- **Steal:** Type as the Image · The Three-Token Contract (three-value monochrome; the fonts supply all "color") · Scroll-as-Journey (density rhythm) · Kinetic Reveal Type (fold/reflow as the animation).
- **Anti-lesson:** WPO 7.00 — heavy specimen imagery + smooth-scroll hurts LCP; `#9C9C9C` on white is a contrast trap — verify AA; custom smooth-scroll libraries date and fight native CSS scroll.

### Prometheus Fuels — Active Theory
**Site of the Year 2021 · FWA of the Year 2021 · SOTD May 4 2021 · SOTM May 2021.** Design 8.5 · Usability 7.77 · Creativity 8.94 · Content 8.79 · Dev 7.61 (Accessibility 7.20). **Reconstructed** — the awarded experience is DEAD (301s to prometheusfuels.ai). Palette petrol blue `#2779a7` / rust `#D14836` / cream.
- **Essence:** a scroll-driven WebGL *film* for an un-photographable product (gasoline from air) — "felt like a movie"; Creativity (8.94) + Content (8.79) carried it.
- **Signature:** illustration + photography mapped onto 3D meshes, rendered as one continuous cinematic camera move (retro-futurist collage).
- **Steal:** Invert the Genre Palette (warm analog for a science company) · Fake-Depth (collage-on-depth) · Scroll-as-Camera · render-one-scene-per-frame discipline.
- **Anti-lesson:** the real product info lives inside a long WebGL story — hostile to a user who wants specs; the 12fps stepped cadence is a strong bet that dates; gone two years later — spectacle bespoke to one campaign has a short life.

### Star Atlas — Hello Monday / DEPT®
**Site of the Year 2021 — Users' Choice · SOTD Nov 3 2021 · FWA SOTD 2021 · Webby People's Voice 2022.** Overall 7.78 — Design 7.97 · Usability 7.36 · Creativity 7.96 · Content 7.95 · Animations 8.80 · Accessibility 5.80 · WPO 6.40. **Reconstructed** — the awarded experience is GONE (now a conventional marketing hub). Palette cream `#ffffff` / gold `#987654` / red-orange `#D14836`.
- **Essence:** won by *inverting* the sci-fi palette (light/warm, not dark/neon) and rendering everything as point clouds that read as both stars and object — medium = metaphor; the biggest lever was a color decision, not the shader.
- **Signature:** the point-cloud depth-of-field — near points crisp, far points bloomed, focus-racking on scroll (custom WebGL shader + Draco).
- **Steal:** Invert the Genre Palette · One Material World (points of light) · Scroll-as-Camera / CSS depth-of-field · The Loader is the Overture (galactic-portal entry) · The Masked Cut (particle dissolve).
- **Anti-lesson:** Accessibility 5.80 / WPO 6.40 — do not ship this weight or a11y profile; the successor site abandoned the whole experience — the spectacle was a launch moment, not durable.

### Umami Land — Media.Monks × Google
**SOTD Feb 1 2021 (8.23) + Developer Award · SOTM Feb 2021 · Developer Site of the Year 2021 (WON).** Site of the Year 2021 **NOMINEE**, not the overall winner. Design 8.49 · Usability 7.58 · Creativity 8.75 · Content 8.10 · Animations 9.00 · Accessibility 7.67 · WPO 8.33. **Reconstructed** — DEAD (301s to google.com). Palette teal `#2779A7` / turquoise `#49C5B6` / gold `#ECD06F`.
- **Essence:** a virtual theme park for a cuisine — every structure derived from a real dish or cooking tool; total thematic commitment, the map itself teaches.
- **Signature:** search-as-reveal / progressive enrichment — "the more you search, the more vivid the world becomes."
- **Steal:** Archive-as-Toy (explore-to-enrich) · Invert the Genre Palette (warm high-key appetite triad vs the dark WebGL void) · Fake-Depth (2D-baked, 3D-accent) · Scroll-as-Journey · sound-as-reward (opt-in).
- **Anti-lesson:** it's a game, not a website — search-to-reveal hides content (Usability 7.58, an SEO/a11y liability); bespoke stacks age into 404s.

### Chungi Folio — Synchronized Studio / Zhenya Rynzhuk
**SOTD Jan 7 2021 + Developer Award · Site of the Year 2021 nominee/finalist** (NOT the winner — Prometheus won; Users' Choice went to Star Atlas). Overall 8.03 — Design 8.38 · Creativity 8.24 · Content 7.91 · Usability 7.48 · Animations 8.00 · Accessibility 6.33 (weakest). Live (chungiyoo.com). No WebGL. Palette teal `#2779A7` / coral `#FF9398` / white.
- **Essence:** an illustrated zine / picture-book translated to the browser with total conviction — proof a folio can win on craft, warmth, and personality, not GPU spectacle (Nuxt/Vue + GSAP + illustration).
- **Signature:** page-turn transitions — routes animate like leafing through a physical magazine.
- **Steal:** The Masked Cut (page-turn/peel) · The Three-Token Contract · Type as the Image (hard-broken "chungi / yoo") · The Cursor as Narrator (directional toy cursor) · Archive-as-Toy (reward the corners).
- **Anti-lesson:** Accessibility 6.33 — broken display headlines + custom cursor + heavy motion hurt AT; page-turns add perceived latency; the personality-maximal art dates — borrow the mechanics.

---

## 2020

### Kode Sports Club — Merci-Michel
**Site of the Year 2020 (confirmed) · SOTM Nov 2020 · SOTD Nov 26 2020.** Overall 8.30 — Design 8.21 · Usability 8.10 · Creativity 8.76 · Content 8.32 · Animations 9.33 · Responsive 8.67 · WPO 8.33 · Markup 8.33 · SEO 7.67 · Accessibility 6.67. Live details **unverified** (kodeclubs.com returned 503). ~7.6MB initial. Palette blue `#2779a7` / teal `#49c5b6` / coral `#FF9398`.
- **Essence:** a pre-opening "coming soon" brief became a playable 3D world you inhabit as a customizable avatar — spectacle that stays navigable and on-brief.
- **Signature:** two-scale navigation — a top-down "map" you drop *into* as an explorable third-person space, seamless camera between.
- **Steal:** Shared-Element Lift (map-&-dive via `layoutId`) · Content-Derived Color (one-texture channel recoloring) · Archive-as-Toy (quest/medals) · One Physics (springy) · Weight as a Feature (map 12MB → 2MB Draco, dedup saved ~4MB).
- **Anti-lesson:** Accessibility 6.67, ~7.6MB — a canvas-only joystick world is invisible to AT; game controls on informational content is hostile.

### DARK: Official Netflix Guide — MediaMonks + Henrik & Sofia (HAS.WORKS)
**Site of the Year 2020 — Users' Choice · SOTD Nov 3 2020 (7.96) · Webby · FWA · D&AD · Comm Arts.** Design 8.17 · Usability 7.29 · Creativity 8.27 · Content 8.48 · Animations 8.67 · Accessibility 6.33. Live (dark.netflix.io, SPA shell; detail from case studies). Palette `#000` / muddy brown `#987654` / coral-rust `#DF6C4F`.
- **Essence:** turned the comprehension tool for the most timeline-tangled show into the spectacle — the interface metaphor *equals* the subject; top content (8.48) fused with top creativity (8.27).
- **Signature:** the time-travel timeline made spatial — line-charts resolve into WebGL orbits drifting into the triquetra sigil.
- **Steal:** The Metaphor Engine · Progressive Spectacle Tiers (SVG/CSS baseline + WebGL desktop-only, LCP ~1.1s) · Semantic Motion Only (hover = investigation, red-shift reveal) · One governing motif (triquetra) · Interaction as Argument (spoiler-gating filters).
- **Anti-lesson:** Accessibility 6.33 — color-as-meaning + heavy motion + dark-only is an a11y trap; all-caps DIN is fashion-coded; add non-color cues + reduced-motion.

### Mammut Expedition Baikal — Build in Amsterdam
**E-Commerce Site of the Year 2020 + Developer Award · SOTD Dec 7 2020.** Overall 7.78 — Design 7.95 · Usability 7.46 · Creativity 7.76 · Content 8.1 (highest) · Dev 7.93 (Responsive & SEO/Semantics 8.33 · Markup 8.0 · Animations 7.33 · Accessibility 7.67). Live, inspected. **No WebGL** (Next.js + Framer Motion + Contentful). Palette glacier blue `#2779A7` / warm coral `#DF6C4F` / white.
- **Essence:** solved the hardest e-commerce problem by refusing to be a product page — a scroll-driven documentary descent where the eight products surface only as the climber uses each; commerce smuggled inside narrative.
- **Signature:** telemetry-as-truth overlays — GPS, temperature, heart-rate readouts ride the scroll as a field log, at near-zero weight.
- **Steal:** The Metaphor Engine · Scroll-as-Journey (expedition phases) · The Three-Token Contract (cold palette + one warm accent) · Progressive Spectacle Tiers (cinematic with NO WebGL) · consent-based sound (opt-in triggers).
- **Anti-lesson:** it's a campaign minisite, not a store — kills discovery/filter/compare; full-bleed media is heavy (WPO 7.67); don't force ordinary content into a linear expedition. Typeface **unverified**.

### Synchronized Studio — Zhenya Rynzhuk
**SOTD Jul 29 2020 (7.95) · Independent of the Year 2020.** NOT SOTY (Kode was); the "Mobile SOTY 2020" claim is **unverified/conflated** (that was DARK). Design 8.24 · Usability 7.5 · Creativity 8.13 · Content 7.77 · Dev 7.4 · Accessibility 6.67. Live but **redesigned since 2020** — findings reflect the awarded PixiJS/WebGL/Nuxt build. Palette `#000 / #9C9C9C / #fff`.
- **Essence:** a studio portfolio that behaves like the showreel — discipline at scale; oversized type + WebGL image transitions carry all the drama, no decorative color.
- **Signature:** type-as-hero + WebGL image reveal — enormous uppercase lockups; project media distorts and cross-fades on hover/transition.
- **Steal:** Type as the Image · The Three-Token Contract (monochrome frame, chromatic content) · One Physics (weighted fluid `[0.16,1,0.3,1]`) · The Cursor as Narrator (grows + labels "explore"/"watch") · featured-vs-archive split.
- **Anti-lesson:** Accessibility 6.67 / DEO 7.4 — media-heavy WebGL tanks LCP + AT; custom cursor as the sole affordance is dangerous; monochrome-agency grayscale is a 2019–21 fashion. Typeface **unverified**.

### Pioneer Corn Revolutionized — Resn × Bader-Rutter
**Verified: SOTD + Developer Award, Jul 8 2020 · SOTM Jul 2020.** **Overall SOTY 2020 is UNCONFIRMED — do not cite it.** SOTD 8.18 — Design 8.32 · Usability 7.75 · Creativity 8.68 · Content 7.96 · Animations perfect 10.00 · WPO 8.67 · Responsive 8.67 · Semantics/SEO 7.33 · Accessibility 6.67 · Markup 7.00. **Reconstructed** — DEAD (cornrevolutionized.com no longer resolves). Palette pure black `#000`; **all type is canvas MSDF, no DOM text**.
- **Essence:** a ~100-year-old corn-seed B2B brand made to feel like frontier science — the entire page is one continuous WebGL film scrubbed by scroll, looping infinitely (the crop cycle).
- **Signature:** scroll IS the timeline of a single unbroken 3D scene (DNA → lab → germination → harvest → loop); the UI and type are all in-canvas.
- **Steal (with care):** Scroll-as-Camera. **Cautionary on Kinetic Reveal Type** — the animated outlined MSDF lettering (a stepped gradient masking the stroke so text draws itself in) is beautiful and *inseparable* from an accessibility failure. It is a warning, not a cheap-CSS template.
- **Anti-lesson:** everything-in-WebGL kills a11y (6.67) and semantics/SEO (7.33) — no DOM text, no selection, weak crawling; scroll = film-scrubbing is scroll-jacking; a proprietary engine + custom hit-detection is not reproducible on a normal budget.

---

## 2019

### Bruno Simon Portfolio — Bruno Simon
**SOTD Nov 11 2019 · SOTM Nov 2019 · Site of the Year 2019.** Overall 8.04 — Design 7.94 · Usability 7.55 · Creativity 8.95 · Content 8.13 · Dev 8.17 (Animations 9.00). ~2.8MB total. The current site is the **2024–25 WebGPU rebuild** — this describes the 2019 winner (**reconstructed** from Bruno's Medium case + Codrops).
- **Essence:** reframed the portfolio genre entirely — you drive a toy car around a low-poly diorama and crash into his work; a concept legible in three seconds, executed with real engineering (Creativity 8.95).
- **Signature:** the car starts nose-to-nose with a 3D "BRUNO SIMON" title; your first key-press knocks the letters over — onboarding by consequence, zero tutorial UI.
- **Steal:** The Metaphor Engine · The Prove-It Gesture (onboarding-by-consequence) · Fake-Depth (matcaps + blob shadows, "no lights, just illusions") · Weight as a Feature (Draco + baked PNG-8 shadows at 2.8MB) · One Physics (eased-follow for felt speed).
- **Anti-lesson:** finding project info requires *driving* there (54s sessions are vanity); a keyboard-driving canvas world has no static fallback (a11y ~7.0 is generous); the no-UI purity collapsed to a joystick on mobile — borrow the techniques, never the car.

### Nomadic Tribe — makemepulse (Paris)
**SOTD Feb 19 2019 · SOTM Feb 2019 · Site of the Year 2019 · FWA Site of the Year 2019.** Overall 8.3 — Design 8.48 · Usability 7.96 · Creativity 8.54 · Content 8.19 · Dev 7.8. ~23MB total (deliberately weight-managed). Live (2019.makemepulse.com). Palette brown `#987654` / teal `#49c5b6` / sand `#ECD06F` — hand-mixed gouache.
- **Essence:** a studio's New Year greeting card — Moebius's ink-and-flat-color comic language translated to real-time 3D via cel-shading + outline; a fully-realized world (story, narration, soundtrack, four chapters).
- **Signature:** the outlined 3D comic render — one aesthetic decision applied to every asset with total conviction.
- **Steal:** One Material World (one-conviction render) · Invert the Genre Palette (gouache, not screen-primary) · The Prove-It Gesture (hold-to-intensify) · The Cursor as Narrator (cursor-as-agent) · Semantic Motion Only (living idle) · Weight as a Feature (~23MB, budgeted).
- **Anti-lesson:** Usability 7.96 the lowest — drag-and-hold has zero affordance; story locked in WebGL, nothing crawlable; autoplaying narration/sound violates a11y defaults; a dateable one-off event piece. Typeface **unverified**.

### MA (True Cannabis) — AQuest / Retail 710
**SOTD Aug 19 2019 · SOTM Sep 2019.** **SOTY 2019 is unverified** — MA's own dossier could not confirm it (one cross-reference lists it among the 2019 SOTY trio; hedge). Overall 7.9 — Design 7.8 · Usability 7.56 (weakest) · Creativity 8.54 · Content 8.03 · Dev 7.17 (Animations 8.67). **Reconstructed** — DEAD (301s to maswitzerland.com). Palette blue `#2779A7` / coral `#D14836` / gold `#ECD06F`.
- **Essence:** turned an e-commerce catalog into a narrative theme-park — "4 Worlds," each a themed 3D environment mapped to product characteristics; a coherent invented world built from almost no brand reference.
- **Signature:** the 4 Worlds carousel — each transition an overlapping colored wipe as the incoming world streams in just-in-time (`requestIdleCallback`).
- **Steal:** Scroll-as-Journey (world-as-category) · The Masked Cut (color-wipe *as wayfinding*) · Semantic Motion Only (sine-wave idle life) · Fake-Depth (shader-faked atmosphere, baked shadows) · low density, high moment.
- **Anti-lesson:** a 4-Worlds odyssey buries "add to cart"; Usability 7.56; a custom WebGL DOM bridge is heavy maintenance; the award experience is already gone. Typeface **unverified**.

### The Cool Club × FWA — WONDERLAND (Amsterdam)
**SOTD Aug 4 2019 (7.71) + Developer Award · FWA Mobile Site of the Year 2019.** **NOT Awwwards SOTY** (the 2019 Sites of the Year were Bruno Simon, MA, and Nomadic Tribe). Design 7.75 · Usability 7.49 · Creativity 7.85 · Content 7.93. **Reconstructed** — thecoolclub.com fetches an empty JS shell. Palette blue `#2779A7` / coral `#FF9398` / yellow `#ECD06F`.
- **Essence:** a promo microsite for a 54-card deck — turned a catalog of 54 into one continuous playspace; form (a deck you shuffle) matches subject perfectly, and it stayed fast/legible on mobile (FWA Mobile SOTY).
- **Signature:** the infinite "pick-a-card" canvas — a boundless looping field where a selected card elevates toward the camera and flips open to its story.
- **Steal:** Shared-Element Lift (browse → elevate → read, plus "endless field, bounded meaning") · Instant Everything (inertial roam across a resident field) · The Metaphor Engine (the deck) · content-carries-the-color.
- **Anti-lesson:** WebGL-only content = SEO/SSR void — the live URL fetched empty for crawlers (do NOT repeat that); an infinite loop with no landmarks hurts findability; no keyboard/reduced-motion story documented.

---

## 2018

### Active Theory v4 — Active Theory
**SOTD Jan 29 2018 · SOTM Jan 2018 · Site of the Year 2018.** Overall 8.2 — Design 8.14 · Usability 7.93 · Creativity 8.69 · Content 8.23 · Dev 7.15. **Reconstructed** — v4 is retired (the site serves a later Hydra iteration). Palette black `#000` / teal `#49c5b6` / coral `#FF9398`.
- **Essence:** the studio turned its own medium into the subject — a real-time GPU "neo-Tokyo" alley you fly through where the work samples are the light sources; a proof-of-capability disguised as a portfolio (Creativity 8.69).
- **Signature:** the world's color is sampled from the work being shown — scene lighting correlated to an averaged color pulled from each video frame.
- **Steal:** Content-Derived Color (the signature move itself) · Instant Everything (a 5×5 preloaded video grid, zero switch-stall) · The Prove-It Gesture (hidden click-and-hold proves it's live-rendered) · One Material World (cinematic post-stack) · The Three-Token Contract.
- **Anti-lesson:** a preloaded video grid + WebGL post-stack is multi-MB and GPU-hot; navigation by flying forward + hidden gestures (Usability 7.93); the 2018 wet-neon grade is a period look — borrow the mechanic, not the Blade Runner skin. Typeface **unverified**.

### Orano — Immersive Garden
**SOTD Nov 26 2018 (8.02) · SOTM Nov 2018 · Developer Site of the Year 2018.** The public/overall SOTY 2018 claim is **partially unverified** — cite Developer SOTY + SOTM. Design 8.18 · Usability 7.52 · Creativity 8.44 · Content 8.06 · Animations 8.80 · WPO 8.40 · Accessibility 6.80. **Reconstructed** — DEAD (orano.immersive-g.com no longer resolves). 30 models = 3.7MB raw / **901KB gzipped**. Palette black `#000` / white / gold `#ECD06F`.
- **Essence:** a B2B nuclear-services company as a 3D topographic adventure — fly over wireframe terrains of real (inaccessible) sites, each section resolving into a product mini-game; spectacle in service of pedagogy.
- **Signature:** the wireframe topographic flyover — edge-only line geometry over real topography; the camera flies between sections.
- **Steal:** The Three-Token Contract (instrument aesthetic: near-black, white, one gold) · The Masked Cut (motion-masked LOD swaps) · Scroll-as-Camera · The Cursor as Narrator (cursor-reactive shimmer) · Weight as a Feature (901KB gzipped) · reward-at-the-end.
- **Anti-lesson:** Accessibility 6.80 / Usability 7.52 — WebGL-gated nav excludes keyboard/AT; don't gate content behind games; the RGB-glitch shimmer is a 2018 fashion; the site is now offline. Typeface **unverified**.

### Koox — Blue Cheese
**SOTD Jul 11 2018 (7.57) + Developer Award (dev 8.47).** **NOT SOTY** (Active Theory was). Design 7.74 · Usability 7.44 · Creativity 7.59 · Content 7.25 (weakest). **Reconstructed / second-hand** — koox.co.uk returned 429. Palette teal `#49c5b6` / gray `#9C9C9C` / white.
- **Essence:** a tiny London takeaway got an award-grade site by committing hard to ONE idea — hand-painted watercolour food brought to life with a custom GLSL shader — and executing the engineering flawlessly (the Dev score outran the design score).
- **Signature:** watercolour illustrations that behave like living material — pigment-like displacement, soft edge wobble, continuous section transitions.
- **Steal:** One Material World ("living material" — reach for SVG `feTurbulence`/`feDisplacementMap` first) · The Three-Token Contract (art carries the colour, UI stays mute) · one-idea-fully-finished · morph-don't-cut transitions · medium-matched easing.
- **Anti-lesson:** full WebGL+GLSL for a takeaway menu is disproportionate; Content 7.25 — spectacle outran substance; shader-as-UI risks WCAG — keep real text as real DOM text. Typeface **unverified**.

### Frans Hals Museum — Build in Amsterdam
**SOTD Apr 17 2018 (7.94) · CSS Design Award · FWA SOTD.** **"Site of the Year 2018" is unverified** — the award page shows Site of the Day. Design 8.22 · Usability 7.62 · Creativity 7.95 · Content 7.75 · Dev 7.01. **Reconstructed** — the 2018 design is DEAD (rebuilt conservative). **No WebGL** (DOM + SVG + GSAP on WordPress). Palette teal `#49c5b6` / coral `#FF9398` / yellow `#ECD06F`.
- **Essence:** a museum merger (Golden Age + contemporary) made literal — "old meets new" as a loud, playful, zero-white-space object that still stayed legible and navigable.
- **Signature:** kinetic oversized typography as the primary image, in flat saturated color blocks; plus the "Discover" browse-by-mood/colour/medium/random tool.
- **Steal:** Archive-as-Toy (browse by mood/colour/random + a Play section) · Type as the Image · The Three-Token Contract (flat color-block panels) · a graphics-only utility rail · split-screen contrast frame.
- **Anti-lesson:** "no white space at all" is a brand exception, not a default; millennial-pink + teal is very 2018 — copy the *method* (encode duality in tokens), not the hues; jQuery/Backbone/WordPress + GSAP = weight/jank.

---

## 2017

### Simply Chocolate — Spring/Summer (Copenhagen)
**SOTD Oct 5 2017, rolled into Site of the Year 2017 · CSSDA Website of the Year · FWA.** (SOTY confirmed via Awwwards + the Spring/Summer case.) SOTD 7.61 — Design 7.94 · Usability 7.29 · Creativity 7.55 · Content 7.36 · dev/accessibility ~5.0. **Reconstructed** — the award experience is DEAD (a plain store now). Palette teal `#49c5b6` / coral `#FF9398` / white.
- **Essence:** reframed e-commerce as *play* — each of 13 bars staged as a character you unwrap, bite, and "talk to"; personality over funnel orthodoxy.
- **Signature:** the unwrap — the foil peels off the bar in WebGL, then a bite is taken; one gesture as the whole emotional payload.
- **Steal:** Interaction as Argument (the single tactile gesture) · Content-Derived Color (a *data-driven skin* — each bar's color/pattern derived from ingredient photos through the CMS, so a new SKU themes itself) · The Persistent Hero Object (product-as-character) · Type as the Image (poster-type SKU names).
- **Anti-lesson:** accessibility sacrificed to spectacle (~5.0) — WebGL product content is invisible to AT; scroll-as-scrubber disorients; great for 13 hero SKUs, collapses at catalog scale; it didn't survive. Typefaces **unverified**.

### The New Mobile Workforce — Immersive Garden + Havas SF (client Citrix)
**SOTD Nov 28 2017 · SOTM Nov 2017 (8.17).** **"Site of the Year 2017" is reported but NOT confirmed on the primary award page** — hedge. Design 8.6 · Creativity 8.56 · Content 8.2 · Usability 7.33 (the tell) · Dev 7.72 (Accessibility 6.75 · WPO 7.5). **Reconstructed** — not live-inspected. Palette deep navy `#0a172b` / cold blue-grey `#a0bdcf` (a two-world split).
- **Essence:** reframed a dull B2B message (secure software = work anywhere) as a Formula 1 race narrative — Citrix's data work as the pit-lane tech behind Red Bull Racing; the concept did the heavy lifting.
- **Signature:** the "speed" scene-transition shader — a GLSL wipe shreds the frame into five vertical columns that redistribute pixels, synced to a whoosh; velocity expressed identically at every break. *(The 5-column GLSL detail is reported, not verified.)*
- **Steal:** The Metaphor Engine · The Masked Cut (one branded transition as through-line — do the 5-column wipe with CSS `clip-path`) · One Physics (velocity easing) · Fake-Depth (parallax stack) · Scroll-as-Journey (progress-as-navigation, two-palette semantic split).
- **Anti-lesson:** Usability 7.33 — scroll-jacked linear-only nav kills scanning/deep-linking/back-button; Accessibility 6.75; sound-gated transitions can't block content; 2017 full-screen WebGL scroll-cinema reads as an era.

---

## Per-archetype reference map — `direction`'s 12 → winners + patterns

Reference winners are *qualities to chase*, never URLs to reskin. `direction` reads this in Phase 2 for the committed archetype, cites the winners by name, and borrows the named patterns *by principle*.

| # | Archetype | Reference winners | Canon patterns to mine |
|---|---|---|---|
| 1 | Editorial / Magazine | The Other Side of Truth (2022), Pangram Pangram (2021), Mammut Baikal (2020) | Type as Evidence, Type as the Image, Scroll-as-Journey, Three-Token Contract, Framed Data |
| 2 | Swiss / International | Synchronized Studio (2020), Pangram Pangram (2021) | Type as the Image, Three-Token Contract, The Cursor as Narrator |
| 3 | Brutalist | KPR/Resn (2022), Chungi Folio (2021) | Type as the Image, The Prove-It Gesture, Kinetic Reveal Type |
| 4 | Neo-grotesque Minimal | Lusion v3 (2023), Opal Tadpole (2024) | Type as Evidence, One Physics, Semantic Motion Only, Three-Token Contract |
| 5 | Warm Organic / Humanist | Nomadic Tribe (2019), Koox (2018), Mana Yerba Mate (2023) | One Material World, Invert the Genre Palette, Semantic Motion Only (living idle), The Cursor as Narrator |
| 6 | Refined Luxury Serif | Mammut Baikal (2020), Synchronized (2020) | Type as Evidence, One Physics (weighted fluid), Three-Token Contract, The Persistent Hero Object |
| 7 | Playful Geometric | Don't Board Me (2024), Chungi Folio (2021), Simply Chocolate (2017) | One Physics (springy overshoot), The Prove-It Gesture, Interaction as Argument, Archive-as-Toy |
| 8 | Dark Tech | DARK/Netflix (2020), Active Theory v4 (2018) | Progressive Spectacle Tiers, Content-Derived Color, Semantic Motion Only — **counter-move:** Invert the Genre Palette (Star Atlas went light) is how to escape the cliché |
| 9 | Retro-Futurist | Prometheus Fuels (2021), Star Atlas (2021) | Invert the Genre Palette, One Material World (analog grain), Fake-Depth Before Real Depth |
| 10 | Soft Depth | Bruno Simon (2019), New Mobile Workforce (2017) | Fake-Depth Before Real Depth, One Physics — glassmorphism stays banned; Noomo's disciplined glass (One Material World) is the reference |
| 11 | Data-Dense Utilitarian | Orano (2018), DARK/Netflix SVG graphs (2020) | Type as Evidence, Weight as a Feature, Semantic Motion Only, Framed Data, Three-Token Contract |
| 12 | Art-House Immersive | Igloo (2024), Lusion v3 (2023), Noomo (2023), Persepolis (2022), Lando (2025), hirotos.com (2026, mechanism + cautionary) | The Persistent Hero Object, One Material World, Scroll-as-Camera, The Loader is the Overture, The Masked Cut, Instant Everything, Shared-Element Lift, Progressive Spectacle Tiers, Weight as a Feature |

---

*32 dossiers, 2017–2026. Award tiers cited at the level the sources verify; reconstructed pre-2021 mechanics are reported, not live-inspected; typefaces, exact stacks, and unshipped reduced-motion paths stay hedged. The patterns these prove live in `SKILL.md`.*
