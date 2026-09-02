## Composes with

- **ultraweb:imagery** — produces the treated assets; this skill delivers them at the right bytes.
- **ultraweb:typography** — chooses the pairing; this skill owns `lib/fonts.ts` and loading behavior.
- **ultraweb:tokens** — bridges the font variables into `@theme inline`.
- **ultraweb:hero** — the LCP element almost always lives there; apply protection rules during the hero build.
- **ultraweb:gate-performance** — measures the LCP/CLS/weight budgets this skill is accountable for.
- **ultraweb:showpiece** — its mandatory static fallback is an optimized image from this pipeline.
- **ultraweb:set-design** — the 3D asset pipeline ships here: `gltf-transform inspect` → `optimize --compress draco --texture-compress webp`, self-hosted DRACO/Basis decoders in `public/`, AVIF/WebP textures, and the per-route AVIF posters. DRACO's decoder usually pays for itself on any real mesh; KTX2's transcoder is several times larger and only wins past several 2K maps (both figures per STACK.md).
- **ultraweb:storage** — produces the blob URLs for uploaded product photos; this skill allowlists that host in next.config.ts remotePatterns and requires explicit width/height + blurDataURL on each remote <Image>.
