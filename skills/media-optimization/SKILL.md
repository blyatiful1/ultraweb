---
name: media-optimization
description: Image, font, and video delivery engineering for Next.js 16 — next/image with preload (priority is deprecated), fill+sizes pairing, blur placeholders, a central next/font pipeline with self-hosted variable fonts, video facades, and LCP protection rules. Invoke during the build phase whenever a section renders an image, custom font, or video; and whenever the user mentions slow images, blurry images, layout shift, CLS, LCP, font flashing, "optimize images", "the hero loads slow", or Lighthouse complaints about media weight.
---

# media-optimization — fast media, zero shift

**Stage:** Phase 6 — Build (engineering) - **Reads:** design/SYSTEM.md §imagery + §type, design/SITEMAP.md, assets from ultraweb:imagery - **Writes:** next/image usage in sections, lib/fonts.ts, video embeds, public/ asset layout

## Standard

Media discipline is invisible when right, ruinous when wrong. The bar: LCP ≤ 2.0s on throttled Fast 4G mid hardware, CLS = 0 from images/fonts/video, every image delivered within 1.5× its rendered pixel size, fonts self-hosted with zero third-party requests, at most one preloaded image per page — exactly one when the LCP element is an image, zero when it is text. `gate-performance` measures this; this skill is where you earn it.

## Process

1. Walk `design/SITEMAP.md` and inventory every visual asset per section: rendered size at 375/768/1440, above or below the fold, content or decoration.
2. Name the LCP element of each page (usually the hero image or hero headline). Write it down — the protection rules below apply to it and only it.
3. Wire fonts once in `lib/fonts.ts` (pipeline below) before any section styling depends on them.
4. Implement each image per the rules below; static-import everything that lives in the repo.
5. Below-fold media stays lazy (next/image default); above-fold media follows LCP protection.
6. Smoke-check: `npm run build`, load each page, confirm no oversized image responses and no visible shift. Hand the numbers to `gate-performance`.

## next/image — Next 16 rules

- **`priority` is DEPRECATED → use `preload`.** `onLoadingComplete` → `onLoad`. Both old names are greppable relics; never write them.
- **Repo asset, known size** → static import. Next infers `width`/`height` (zero CLS) and generates the `placeholder="blur"` data automatically:

```tsx
import hero from "@/public/hero.jpg";
<Image src={hero} alt="Thrown stoneware on the wheel" preload placeholder="blur" sizes="100vw" />
```

- **Crop-to-container** → `fill` + `sizes`, ALWAYS paired. `fill` requires a `relative` parent with real dimensions and `object-cover` (or `object-contain`) on the image itself.
- **`sizes` declares the rendered width — get it wrong and Next ships the 4K rendition to a 300px card:**
  - Full-bleed: `sizes="100vw"`
  - Split section: `sizes="(min-width: 768px) 50vw, 100vw"`
  - 3-up card grid: `sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"`
- **Remote images** (CMS/storage): allowlist the host in `next.config.ts` (`images.remotePatterns`), pass explicit `width`/`height` from the source, and supply a real `blurDataURL` — or `placeholder="empty"` over a token-colored background. A remote image must never reserve zero space.
- SVG logos and icons: inline as JSX so they inherit `currentColor` — never through next/image.
- Modern formats are the optimizer's job. Feed it a high-quality source (≥ 2× the largest rendered size); don't pre-convert or pre-compress to death.

## SVGO discipline

Every SVG that ships — logo, icon, divider, illustration — runs through SVGO once, with a config that knows whether the file will be animated. The default preset is lossy in exactly the ways an animation cares about.

- **`cleanupIds: false` on anything animated or referenced.** The default minifies `id` attributes, which silently breaks `<use href="#…">`, gradient/filter references, and every selector a CSS keyframe or a commissioned `ultraweb:animejs` timeline targets. A static one-shot mark may keep the default.
- **Keep the viewBox** (`removeViewBox: false`) — without it the graphic can't scale, and a fixed `width`/`height` reintroduces the layout shift the rest of this file exists to prevent.
- **No `mergePaths` on morph targets.** Merging collapses separate `<path>` elements into one `d`, destroying both the per-path handles a multi-path draw needs and the point-count parity a morph pair depends on — `ultraweb:shape-language` authors those files, this one must not undo them.
- Strip what is genuinely dead: editor metadata, comments, empty groups, and hardcoded `fill` on icons meant to inherit `currentColor`.
- Run it as a build step or one deliberate pass over the asset folders — never hand-edit optimized output, and never re-run a lossy preset over a file you already tuned.

## next/font pipeline

One central file. A font declared anywhere else is a defect.

```ts
// lib/fonts.ts — the ONLY place fonts are declared
import { Fraunces, Instrument_Sans } from "next/font/google"; // auto self-hosted, zero Google requests

export const display = Fraunces({ subsets: ["latin"], variable: "--font-display-src", display: "swap" });
export const body = Instrument_Sans({ subsets: ["latin"], variable: "--font-body-src", display: "swap" });
```

- **Variable fonts: omit `weight`** — the whole axis ships in one file. Two families max (constitution); each family = one variable file, never four static weights.
- Root layout: `<html className={`${display.variable} ${body.variable}`}>`. The `-src` suffix avoids colliding with the `@theme` namespace: `ultraweb:tokens` bridges `--font-display: var(--font-display-src)` in `@theme inline`. This skill owns loading; tokens owns the bridge.
- Purchased faces: `next/font/local` from the same file — `localFont({ src: "./fonts/Name-Variable.woff2", variable: "--font-display-src", display: "swap" })`.
- next/font auto-adjusts fallback metrics — font swap causes zero CLS. Never add hand-written `@font-face` or manual `size-adjust` beside it.

## LCP protection

1. The LCP image gets `preload` — and ONLY it. Two preloaded images on one page means neither is protected.
2. Never animate the LCP element from `opacity: 0` — an invisible element can't be an LCP candidate, so the metric slides to whenever the reveal finishes. Render it immediately; animate its siblings.
3. LCP text is server-rendered with its font variable applied from first paint — never inside a late-mounting client component.
4. No LCP element inside a `dynamic()` import or lazy boundary.
5. Hero background media is a real `<Image fill preload>` — CSS `background-image` is unoptimizable and unpreloadable.

## Native video

- Ambient loops: self-hosted H.264 MP4 ≤ 4MB, `<video autoPlay muted loop playsInline preload="metadata" poster={…}>` with a poster sized exactly like the video (zero CLS). Both attributes are load-bearing: without `muted` autoplay is blocked, without `playsInline` iOS hijacks the clip fullscreen.
- **The poster is the LCP candidate, never a video frame.** Ship it as a real optimized still at the video's exact dimensions and give it the page's one `preload`; the clip then plays over an element that has already painted, and a slow connection degrades to a designed frame instead of a black box.
- `prefers-reduced-motion`: pause ambient video — follow `ultraweb:motion-language`'s policy, not an ad-hoc check.
- Meaningful video ships captions — a `<track kind="captions" srcLang default>` file. WCAG 1.2.2 is a Level-A requirement, so `gate-accessibility` treats a missing track as a failure; only genuinely silent decorative loops are exempt, and those carry `aria-hidden`.
- Third-party embeds (YouTube/Vimeo): facade pattern — render a poster + play button, inject the iframe on click. An eager YouTube iframe costs ~1MB of JS before anyone presses play. On a DACH build that facade is also the legal gate: mount it through `ultraweb:consent`'s click-to-load shim, since the request itself is the exposure.
- Below-fold video: `preload="none"`.

## Anti-patterns

Greppable; every hit is a defect:

- `priority` / `onLoadingComplete` on next/image — Next ≤15 relics (Next 16: `preload` / `onLoad`)
- `layout="fill"`, `objectFit=` props — Next 12 relics
- `<img ` in TSX (sole exception: inside `opengraph-image.tsx` ImageResponse markup)
- `fill` without `sizes`; `sizes="100vw"` on anything narrower than the viewport
- `unoptimized` as an escape hatch instead of fixing config
- `fonts.googleapis.com` / `fonts.gstatic.com` anywhere — next/font self-hosts, always
- hand-written `@font-face` alongside next/font
- more than one `preload` image per page
- `bg-[url(` / `backgroundImage:` for content imagery

## Worked example — Loop & Thread, product photos from blob storage

design/SYSTEM.md §type pairs Fraunces (display) + Karla (body); §imagery specs every product on undyed linen, the flat-lay swapping to an in-hand crop on hover.

Fonts load once, self-hosted, variable-axis (weight omitted so one file ships the whole axis):

```ts
// lib/fonts.ts — the only place fonts load
import { Fraunces, Karla } from "next/font/google";

export const display = Fraunces({ subsets: ["latin"], variable: "--font-display-src", display: "swap" });
export const body = Karla({ subsets: ["latin"], variable: "--font-body-src", display: "swap" });
```

Product shots come from blob storage, so they render as remote images: the blob host is allowlisted in `next.config.ts` `images.remotePatterns`, and each `<Image>` carries explicit `width`/`height` + a precomputed `blurDataURL` (auto blur generation only works for static repo imports). On `/shop/[slug]` the flat-lay is the LCP element and gets `preload` alone — rendered immediately, never from `opacity: 0`.
Rejected: preloading the in-hand crop too so the hover swap feels instant — two preloads means neither is protected, so the crop lazy-loads and the small hover pop is accepted.
Handoff: lib/fonts.ts and the section `<Image>` calls land for ultraweb:gate-performance to measure (LCP ≤ 2.0s, CLS 0); the remote-host contract and blurDataURL come from ultraweb:storage.

## Composes with

- **ultraweb:imagery** — produces the treated assets; this skill delivers them at the right bytes.
- **ultraweb:typography** — chooses the pairing; this skill owns `lib/fonts.ts` and loading behavior.
- **ultraweb:tokens** — bridges the font variables into `@theme inline`.
- **ultraweb:hero** — the LCP element almost always lives there; apply protection rules during the hero build.
- **ultraweb:gate-performance** — measures the LCP/CLS/weight budgets this skill is accountable for.
- **ultraweb:showpiece** — its mandatory static fallback is an optimized image from this pipeline.
- **ultraweb:storage** — produces the blob URLs for uploaded product photos; this skill allowlists that host in next.config.ts remotePatterns and requires explicit width/height + blurDataURL on each remote <Image>.
