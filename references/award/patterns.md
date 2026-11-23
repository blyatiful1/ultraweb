# award patterns

Named mechanisms that recur in award-winning sites, each with the cheapest correct way to build it and the rule that keeps it usable.

Load when: Phase 2 at flagship tier (choosing and bounding the signature move), or when a judge defect names a pattern.
Reads: design/DIRECTION.md. Writes: nothing; DIRECTION.md cites patterns by name.

Use a pattern for its mechanism, never its surface (a winner's palette, its typeface, its literal car). One pattern carries the signature move; others may appear only as quiet support. The jury weighting in `references/award/invariants.md` explains why: a pattern that costs usability loses more points than it gains. "Seen in" names are study references from `references/award/canon.md`; check them before citing one to a user.

Patterns are grouped by what they cost to build.

## A. Decisions: near-zero build cost

**Metaphor Engine.** Choose one governing metaphor from the subject's world and make structure, navigation, section names, the one transition and the easing obey it. Stack: a content decision made before layout; CSS and ordinary components. Rule: keep a fast, plain path to the core task; one metaphor only. Seen in: DARK Netflix guide, Mammut Expedition Baikal, Bruno Simon's portfolio.

**Invert the Genre Palette.** Name the color story the category defaults to (fintech blue, sci-fi dark, luxury black and gold, wellness sage) and commit to a credible opposite the brand can defend. Stack: token work only. Rule: still passes AA; high-key palettes lose contrast faster than dark ones. Seen in: Star Atlas, Prometheus Fuels.

**One Color Source.** All color comes from one authored, locked source: a small token set where one color owns every interactive state, or a palette where content and imagery supply all saturation and the chrome stays quiet. Stack: 2 to 4 `oklch()` tokens in the theme; the accent maps to hover, focus, selection and links; contrast checked when defined. Rule: near-monochrome plus a single acid or orange accent is a current AI default; use that combination only when DIRECTION.md argues it from the subject. Seen in: Pangram Pangram, Opal Tadpole, Messenger (a 16x16 palette texture).

**One Physics.** One motion personality derived from the subject (speed, weight, bounce, viscosity) applied to every transition, hover and reveal. Stack: one shared transition object exported from one module, for example a fast ease-out `cubic-bezier(0.22, 1, 0.36, 1)` or one spring; every component imports it. Rule: reduced motion makes it instant; duration scales with the element's importance. Seen in: Lusion v3, Lando Norris site.

**Semantic Motion Only.** Every animation encodes meaning (reveal, relationship, removal, progress) or is cut. The only ambient motion allowed is a low-amplitude idle on at most two elements. Stack: bind motion to scroll, hover, state or load; idle via `useTime` driving a small transform. Rule: idle stops under reduced motion and the end state carries the meaning. Seen in: The Other Side of Truth.

**Interaction as Argument.** One control whose operation is the site's message, so the visitor performs the argument. Stack: one boolean driving `AnimatePresence` cross-fades; server-render both states so both are crawlable and work without JS. Rule: only when the content is a genuine contrast or argument; never bolted onto commerce. Seen in: The Other Side of Truth (a toggle between two framings of the same news).

**Type as Evidence.** One strong text face and a wide scale do all the hierarchy; headlines read as documents. Stack: one display and one text face, a fluid scale with `clamp()`, CSS only. Rule: all-caps and condensed cost readability; verify AA on every pairing.

## B. CSS and Motion: hours to a few days

**Type as the Image.** Display type replaces the hero image, set in deliberate blocks with hard breaks. Stack: CSS only; variable font, `clamp()`, real DOM text, a fallback face metric-matched so swapping causes no layout shift. Rule: an oversized headline over empty space is a current AI default. It earns its place when the words or letterforms are the subject (a foundry, a publication, a poet), not as a substitute for having an image. Seen in: Pangram Pangram.

**Kinetic Reveal Type.** The type itself animates as the signature moment: a fill wipe, a character stagger, a weight shift tied to scroll. Stack: cheapest first: `@property` plus `background-clip: text` plus `animation-timeline: view()` as progressive enhancement (check current support, and make the no-support state the finished static text); otherwise Motion per-character stagger over real DOM text. Rule: headlines only; never render body or navigation text into a canvas. Seen in: Opal Tadpole.

**Scroll-as-Journey.** A long page as a sequence of named acts with rhythm: dense sections alternating with rest. Stack: semantic `<section>` per act, a `data-act` attribute switching a few tokens, `whileInView` reveals, spacing tokens for compression and release. Rule: native scroll stays; add anchors or a chapter index so visitors can jump. Suits one story, not a large catalog. Seen in: Mammut Expedition Baikal, Noomo.

**Content-Derived Color.** The palette is sampled from the product or content so the site's color is the product's color. Stack: extract 2 or 3 values at build time (for example `sharp(file).stats()` returns a `dominant` color), convert to `oklch()`, write per-item tokens; swap with a short transition on route or item change. Rule: derived values drive grounds and accents, never body text, unless they clear AA. Seen in: Lando Norris site (helmet liveries).

**Framed Data.** A key number sits inside a frame drawn from the subject (a gauge, a vessel, a mark) and counts up once. Stack: inline SVG `clipPath` or `mask` around the number; count with Motion's `animate()` triggered by `useInView({ once: true })`. Put the final value in visually hidden text and mark the animating digits `aria-hidden="true"`, so screen readers hear one number. Rule: frame around the digits, never across them; reserve it for one or two figures. Seen in: The Other Side of Truth.

**Prove-It Gesture.** One deliberate gesture (press and hold, drag to intensify) reveals depth or teaches the model by consequence. Stack: pointer down/up driving a spring motion value. Rule: never the only route to information; give a visible affordance, a keyboard equivalent and a touch path. Seen in: Bruno Simon's portfolio (the first key press knocks the title over).

**Cursor as Narrator.** The cursor labels affordances ("view", "drag") or affects the scene. Stack: one fixed element following a spring, reading `data-cursor` from the hovered target; enable only under `@media (pointer: fine)`. Rule: the native cursor, focus styles and visible labels all stay; it is decoration over a complete interface.

**Masked Cut.** Section or route changes are covered by one brief full-bleed effect (color flood, wipe, dissolve) so the swap is invisible; a color wipe can double as wayfinding. Stack: View Transitions where supported (check current support) or `AnimatePresence` with a full-cover overlay; do the route change inside the cover. Rule: one transition grammar site-wide; reduced motion gets a plain crossfade; under 600 ms.

**Shared-Element Lift.** Browse a field of items; the chosen one lifts into focus as the same element instead of a hard cut. Stack: real `<a href>` cards; Motion `layoutId` or View Transitions lift the card into a detail view with its own URL. Rule: browser Back returns to the field at the same position; Esc closes; every item is a crawlable link.

**Instant Everything.** Prefetch the next two or three heavy pieces, keep them mounted, and crossfade instead of unmounting. Stack: prefetch adjacent routes; keep incoming media mounted with `opacity: 0` and `pointer-events: none`; crossfade. Rule: cap resident heavy nodes; a not-yet-ready neighbor shows a skeleton of the same dimensions.

**Archive-as-Toy.** A content library becomes something to play with: browse by an unexpected axis from the subject, "surprise me", rewards in the corners (404, footer). Stack: server-render the full list; Motion `layout` for filter reflow; state in the URL so a filtered view can be shared. Rule: the plain, scannable list always works underneath. Seen in: Frans Hals Museum (browse by mood and color).

**Fake Depth.** The look of 3D from layered 2D: parallax layers, baked light, matcap renders exported as images. Stack: `useScroll` plus `useTransform` on `translateY` and `scale` per layer, compositor properties only. Rule: subtle offsets, never load-bearing, off under reduced motion; budget the image weight.

**Loader as Overture.** When there is real warm-up to hide, the loader is the first scene and its last frame is the hero's first frame. Stack: a light loader over the real preload; match the final keyframe to the hero's initial state. Rule: only when it masks genuine work; under 1.5 s; skippable; instant under reduced motion. On a content site a loader is friction.

**Persistent Hero Object, flat version.** One object stays in frame and transforms as the page scrolls. Stack: an image sequence or sprite swapped on scroll inside a `position: sticky` stage, driven by `useScroll`; it delivers most of a rotating 3D object at a fraction of the weight. Rule: preload only the first frames; ship a static poster; it must not bury the message.

## C. Renderer: days to weeks, flagship only

These require a commission in DIRECTION.md and the gate in `references/showpiece.md`; stack details are in `references/stack-3d.md`.

**Scroll-as-Camera.** Scroll drives one continuous camera move through a scene. Without an engine: `useScroll` mapped to `translateZ` and `scale` on layers inside a parent with `perspective` and `transform-style: preserve-3d`, across two or three sticky sections. With an engine: one authored camera clip whose playhead follows scroll progress. Rule: never hijack scroll velocity or call `preventDefault` on wheel; keyboard and native scroll move the camera; reduced motion shows stacked static sections. Seen in: Lusion v3, Igloo Inc.

**Persistent Hero Object, 3D version.** A real model with weight that is also the color and concept system. Rule: static poster first; the model loads after LCP; the message stays in DOM text.

**One Material World.** Every surface obeys one primitive (ice, points, watercolor, outline). Cheap version: one consistent image treatment site-wide. Shader version: hero only. Rule: never apply the material to text or navigation. Seen in: Igloo Inc, Koox (watercolor). A grain overlay is a current AI default; use it only when DIRECTION.md derives it from the subject's physical material.

## D. Disciplines on every tier

**Weight as a Feature.** Set a byte budget before adding richness. Stack: server-rendered HTML, CSS-first motion, `next/dynamic` and intersection-triggered loading for heavy parts, AVIF or WebP, Draco or Meshopt for meshes, renderer loaded after LCP. Targets: LCP under 2.5 s on a mid phone (aim under 1.5 s), CLS under 0.05, INP under 200 ms, under 3 MB for a full first visit. Seen in: Messenger (multiplayer 3D at about 5.7 MB initial).

**Progressive Spectacle Tiers.** Three tiers with identical content: complete static HTML, CSS and Motion enhancement, optional renderer on capable devices without reduced motion. Stack: build the static tier first; gate the renderer behind `matchMedia('(prefers-reduced-motion: no-preference)')` and a capability check; give it a real poster. Rule: test with JS off and with reduced motion on; no "rotate your device" walls.

## Sound

Off by default. Opt-in only through a user gesture, with a persistent visible mute, and never required for progress, content or a transition.

## Dated surfaces

Borrow the mechanism, not these skins: wet-neon grades and RGB-shift (around 2018); heavy parallax as the main idea; autoplaying background video heroes; neumorphism and uniform heavy shadows; monochrome-agency grayscale as a whole identity; gimmick 3D with no narrative; crypto-hype styling; canvas-only sites with no DOM text, most of which are now offline.
