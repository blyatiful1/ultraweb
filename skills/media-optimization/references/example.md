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
