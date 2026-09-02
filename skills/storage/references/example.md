## Worked example — Loop & Thread, customer review photos as social proof

design/BRIEF.md: "Shoppers submit photos of their woven goods in use — proof-in-hand on the product page." Phone-camera JPEGs run 6–12 MB.

Decision: client-direct to Vercel Blob (`BLOB_READ_WRITE_TOKEN`), not server relay. The authorizing route confirms the review belongs to a real order, then issues a token scoped to `image/jpeg|png|webp`, 8 MB, prefix `reviews/`. Dropzone is a styled `<label>` over an `sr-only` input; drag-over shifts the border to the indigo accent `oklch(0.45 0.08 265)` and drops the linen background `oklch(0.94 0.012 80)` one step in 180ms. Real progress from `xhr.upload.onprogress`, mirrored to `aria-live` at 25/50/75/done.

```ts
const reviewPhoto = z.object({
  type: z.enum(['image/jpeg', 'image/png', 'image/webp'], { error: 'JPEG, PNG, or WebP only' }),
  size: z.number().int().positive().max(8 * 1024 * 1024, { error: 'Max 8 MB — this photo is {n} MB' }),
  alt: z.string().min(1, { error: 'Describe your photo' }).max(200),
})
// key: reviews/${crypto.randomUUID()}.${ext} — ext from the validated MIME, never the filename
```

Server reads width/height at write time and persists url, width, height, alt, size beside the review row, so the photo renders through `<Image>` with zero CLS. Rejected server relay: a 12 MB phone photo blows past Vercel's ~4.5 MB function body cap and would fail before validation ever ran; client-direct has no body cap and gives a real bar. Handoff: the record lands in the reviews table via ultraweb:database and renders back on `/products/[slug]` through ultraweb:media-optimization, with the Blob host added to `next.config.ts` `images.remotePatterns`.
