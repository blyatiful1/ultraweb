# stack-3d

Verified facts and bundle measurements for the two DIRECTION-gated engines: three.js with React Three Fiber, and anime.js. Package versions are in `stack/versions.json` and never restated here.

Load when: `design/DIRECTION.md` commissions a 3D moment or an SVG choreography by name, together with `references/showpiece.md`. Never in the base install.
Reads: `stack/versions.json`, `design/DIRECTION.md`. Writes: nothing.

Status marks: "verified 2026-11-23" means re-checked against the installed packages today. "measured 2026-07-29" or "2026-07-28" means measured on the then-current versions and not repeated; treat the number as an order of magnitude and record the real one in the bundle audit.

`motion` stays the animation library. three.js is a renderer and the heaviest dependency decision in the stack. All packages are MIT except `postprocessing`, which is Zlib. No frame-rate claim here comes from a GPU; a 60 fps claim needs a browser recording.

## three.js, React Three Fiber, drei

### Install and peers
- **Peer ranges (verified 2026-11-23).** fiber 9 accepts react `>=19 <19.4`; drei 10 needs fiber 9 and react 19; `@react-three/postprocessing` needs `postprocessing` 6 and fiber `>=9.7.0`; `postprocessing` accepts three `>=0.168 <0.188`. three ships a minor every 6 to 8 weeks, so `postprocessing`'s upper bound is the first thing to break. The manifest pins `three` exactly and `@types/three` to the same version; `verify-stack` enforces the lock. Re-check the `postprocessing` peer whenever three moves.
- `@types/three` is required; three ships no types, and drift breaks the `ThreeElements` augmentation.
- `transpilePackages: ['three']` is stale; the R3F docs still mention it. A scene built with an empty `next.config.ts` on Next 16 and Turbopack (measured 2026-07-29).
- Do not add `zustand`, `maath`, `three-stdlib` or `@monogrid/gainmap-js` directly; they are transitive deps of fiber and drei. Do not add `leva` or `r3f-perf`: `r3f-perf` pulled in a second drei and three copies of zustand when tried (measured 2026-07-29), and `leva` is an authoring GUI that becomes a second source of truth for numbers `DIRECTION.md` owns. drei's `<Stats/>`, `<StatsGl/>` and `<PerformanceMonitor>` cover profiling.

### Next.js specifics
- `"use client"` is mandatory on anything containing `<Canvas>`. In a Server Component the build fails with `createContext is not a function` inside a minified chunk and never mentions the directive (measured 2026-07-29). Imports are SSR-safe; only `new WebGLRenderer()` needs a DOM, so `dynamic(..., { ssr: false })` is not needed just to import.
- A mostly static site uses `frameloop="demand"` plus `invalidate()`; prop changes schedule a frame, direct mutation does not.
- Reduced motion: no `prefers-reduced-motion` handling exists in three, fiber or drei. At site scale the implementation is that the canvas does not mount, and the static edition renders instead.

### Traps (source-level)
- **`<Canvas>` ships all of three.** fiber's entry does `import * as THREE from 'three'` (verified 2026-11-23) and registers the whole namespace. The only lever is `createRoot` plus a hand-written `extend({...})`, which gives up Canvas's resize, event and bridge handling.
- **Canvas defaults:** `dpr=[1,2]` already, camera fov 75 at z 5, `antialias` and `alpha` on, `ACESFilmicToneMapping` unless `flat` (verified 2026-11-23). Advice to "add dpr={[1,2]}" describes the default.
- **`<EffectComposer>` sets `gl.toneMapping = NoToneMapping` while mounted** (verified 2026-11-23), so adding any effect blows out highlights that ACES used to roll off. End the chain with `<ToneMapping mode={ToneMappingMode.ACES_FILMIC} />`. Also lower `multisampling` on mobile (default 8, measured 2026-07-29).
- **`useFrame(cb, priority > 0)` takes over rendering**; the loop stops calling `gl.render` and you must render yourself (that is how EffectComposer works). Never pass a priority "to run last".
- **Soft shadows:** `shadows="soft"` maps to `PCFSoftShadowMap`, which the current three release removes: `WebGLShadowMap` warns and falls back to `PCFShadowMap` (verified 2026-11-23). Use `shadows="variance"`, `<SoftShadows/>`, `<AccumulativeShadows/>` or `<ContactShadows/>`.
- **`THREE.Clock` is deprecated** (since r183) and fiber still constructs one for `state.clock` (verified 2026-11-23), so every R3F app logs a deprecation once. Upstream, cosmetic.
- **drei fetches from third-party CDNs by default** (verified 2026-11-23): `<Environment preset>` loads from a githack URL, `useKTX2` and matcaps from `cdn.jsdelivr.net/gh/pmndrs/drei-assets@master` (an unpinned branch), and `useGLTF` Draco decoders from `gstatic.com`. In DACH this is the same exposure as unhosted Google Fonts. Self-host: copy `three/examples/jsm/libs/{draco/gltf,basis}` into `public/`, call `useGLTF.setDecoderPath('/draco/')`, `useKTX2(url, '/basis/')`, and use `<Environment files="/hdr/x.hdr">` or a procedural `<Environment><Lightformer/></Environment>`.
- **`ScrollControls` is not page scroll.** It injects its own scroll container, so `window.scrollY` stays 0 and `motion`'s `useScroll`, CSS scroll timelines, anchors and scroll restoration stop working; `<Scroll html>` renders through a second React root without app providers (measured 2026-07-29). For a site with DOM sections use a fixed `<Canvas eventSource={rootRef} eventPrefix="client">` behind normally scrolling DOM and drive the camera from `useScroll`. Reserve `ScrollControls` for a canvas-only route.
- **Many small 3D moments:** one canvas with drei `<View>` and tracked DOM boxes, not N canvases; browsers cap WebGL contexts at roughly 8 to 16.
- **`useFrame` runs every frame:** no allocation inside it. Hoist vectors to module scope or refs and mutate with `.set()`, `.copy()`, `.lerp()`.
- **Never `import * as` from drei.** drei is `sideEffects: false` and named imports shake well.
- **fiber 9 versus 8 types:** `Props` is `CanvasProps`; `MeshProps` and friends become `ThreeElements['mesh']`; `Node`/`Object3DNode` become `ThreeElement<T>`; JSX augmentation is `declare module '@react-three/fiber' { interface ThreeElements {...} }`; sRGB conversion of texture props was removed, so mark color maps `THREE.SRGBColorSpace` and keep normal, roughness and AO maps linear.
- Custom material pattern: `shaderMaterial(uniforms, vert, frag)`, then `extend({ WaveMaterial })`, then the `ThreeElements` augmentation above.
- **WebGPU is watched, not used.** `three/webgpu` exists, but fiber 9's `<Canvas>` still imports the WebGL barrel, so adding WebGPU ships both stacks (measured 2026-07-29, about 400 KB gzip). Revisit when fiber 10 is `latest`.

### Assets
`@gltf-transform/cli`: `gltf-transform inspect <in>`, then `gltf-transform optimize <in> <out> --compress draco --texture-compress webp`. `gltfjsx` for GLTF to JSX. Both dev-only. Draco decoder is about 75 KB gzip; the KTX2 transcoder about 260 KB gzip (measured 2026-07-29) and pays off only past several 2K textures; below that use WebP. Decoders are not counted by bundle analyzers.

### Bundle measurements (measured 2026-07-29, esbuild + gzip, three 0.185 era; not repeated)

| Import | gzip |
|---|---|
| `Vector3` alone | 54.6 KB |
| `WebGLRenderer` alone | 130.2 KB |
| `import * as THREE` | 187.6 KB |
| `Canvas` + `useFrame` + `useThree` (baseline) | 241.3 KB |
| `createRoot` + manual `extend` | 180.8 KB |
| + `View` / `Html` / `MeshTransmissionMaterial` | +2.6 / +3.1 / +4.4 KB |
| + `ScrollControls` + `useScroll` | +4.5 KB |
| + `EffectComposer` + `Bloom` | +17.7 KB |
| + `Environment` | +19.4 KB |
| + `useGLTF` | +20.8 KB |
| + `Text` (troika) | +43.5 KB |
| `import * as drei` | 767 KB |

Budget line: a site-scale persistent canvas added about 355 KB gzip of client JS over the Next and React baseline on a real production build (185 KB without 3D, 541 KB with). Brotli runs about 18% smaller. Record the current number in `qa/` from the performance gate.

## anime.js

Installed only when `design/DIRECTION.md` commissions an SVG choreography moment by name. Facts below were verified against the installed pin on 2026-11-23 where marked; the pin did not change since the 2026-07-28 measurements, so those hold.

- **No default export** (verified 2026-11-23): `import anime from 'animejs'` is dead. Use named imports: `animate, createTimeline, createScope, stagger, svg, text, utils, onScroll, spring, cubicBezier, eases`. Never `import * as anime` (whole 43 KB barrel). Barrel imports tree-shake as well as subpaths (12.7 KB versus 12.7 KB, measured 2026-07-28).
- **Cost (measured 2026-07-28, gzip):** `animate` 12.7 KB, plus `createTimeline` 14.0 total, plus `createScope` and `stagger` 15.2, `svg` module 2.2, `text` 3.7, `onScroll` 17.1 standalone, `createDraggable` 20.3 (not used; drag stays with motion's `domMax`), `waapi.animate` 4.8. A commissioned SVG timeline costs about 19 KB; scroll-scrubbing it about 23 KB.
- **React/Next:** `"use client"` leaf. `createScope({ root })` inside `useEffect`, where `root` is the ref object, not `root.current` (passing `.current` silently loses scoping). Clean up with `scope.current?.revert()`; StrictMode runs effects twice.
- **SSR:** importing is safe. `animate()`, `createDraggable()`, `splitText()` and `onScroll()` throw without a DOM, so call them only inside `useEffect`.
- **Easing trap:** a string `'cubicBezier(...)'` falls back to linear with only a console warning. Import `cubicBezier` and pass the function. Unknown ease names (including `'spring'` and typos) fall back to linear with no warning; validate against `Object.keys(eases)`. Named strings like `'outExpo'`, `'out(4)'`, `'inOut(3)'` work. Test an ease at 0.25 and 0.75, never at 0.5.
- **`spring({ bounce })` returns an object** with `.ease` and a computed `.duration` that overrides the tween's `duration` (628 ms for `bounce: .7`, verified 2026-11-23). `createSpring()` still exists but is deprecated.
- **Durations are milliseconds**; motion uses seconds. Convert once in a shared motion-tokens module.
- **`onScroll` defaults to `sync: 'play pause'`**, which is threshold-triggered playback. Scrubbing needs `sync: true` (or `'linear'`); a number smooths. A mistyped method string is a silent no-op. Attach as `createTimeline({ autoplay: onScroll({ target, sync: true }) })`.
- **`splitText`** keeps `accessible` true by default (a hidden mirror of the text); the defect to grep for is `accessible: false`. It installs a ResizeObserver; call `.revert()` (scope cleanup does).
- **No reduced-motion support** (verified 2026-11-23: no `prefers-reduced-motion` string anywhere in the shipped dist). Build it with the scope's `mediaQueries` option and land the final state in the reduced branch:

```ts
createScope({ root, mediaQueries: { reduce: "(prefers-reduced-motion: reduce)" } }).add((self) => {
  const drawn = svg.createDrawable(".curve");
  if (self.matches.reduce) { utils.set(drawn, { draw: "0 1" }); return; } // final state, never hidden
  animate(drawn, { draw: ["0 0", "0 1"], ease: cubicBezier(0.22, 1, 0.36, 1), duration: 900 });
});
```

- `draw` exists only on the `svg.createDrawable()` proxy; a raw selector writes an inert attribute. `utils.set` needs the proxy too.
- Types are bundled. Never install `@types/animejs` (the v3 types).
- `animejs/adapters/three` exists and is not used: the SVG engine does not drive a scene graph.
