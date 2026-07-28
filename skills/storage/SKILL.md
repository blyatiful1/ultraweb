---
name: storage
description: File upload and blob storage for a Next.js 16 site — dropzone UX with drag-drop as enhancement over a real file input, true progress from XHR upload events, instant client validation of type and size, zod v4 re-validation on the server, Vercel Blob as the default store with S3-compatible (S3/R2) as the alternative, server-generated storage keys, and post-upload rendering through next/image with persisted dimensions. Invoke during the backend phase when the brief needs avatars, user images, attachments, or any file upload, when choosing between server-relay and client-direct upload paths, or when uploaded images cause layout shift or bypass the image pipeline. Trigger phrases — "upload a file", "image upload", "avatar", "drag and drop", "file storage", "Vercel Blob", "S3 bucket", "attachments", "the upload shows no progress".
---

# storage — uploads that earn trust

**Stage:** Phase 7 — Backend - **Reads:** design/BRIEF.md, design/SYSTEM.md (§color, §motion for dropzone states) - **Writes:** components/upload/*, upload route handler or actions, lib/storage.ts, next.config.ts images.remotePatterns

## Standard

- Client validation is instant: type and size rejected before a single byte leaves the browser. The server re-validates everything — the client is UX, never security.
- Every upload surface designs all six states: idle, drag-over, uploading with a real percentage, success with preview, error with retry, disabled. A spinner with no percent is not progress.
- Storage keys are server-generated; the user's filename is display metadata, never a path.
- Every stored image renders through next/image with dimensions persisted at upload time — zero CLS from user content.
- Drag-drop is an enhancement over a real `<input type="file">` — the keyboard path is the input, always.

## Process

1. Read design/BRIEF.md: what gets uploaded, by whom, how big. Pick server-relay vs client-direct and the store (below).
2. Build the authorizing surface first: auth check, zod schema, scoped token/presign or receiving action.
3. Build the dropzone per Upload UX — the input first, drag-drop and progress layered on.
4. Persist the file record with the blob write; wire rendering through next/image + `remotePatterns`.
5. Verify empirically: upload a valid file, an oversized file, and a wrong-type file renamed to `.png` — the last two must fail with designed errors on BOTH client and server paths; confirm the rendered image lands with zero CLS.

## Choose the path

Two architectures, picked by file size and hosting:

1. **Server relay** — file posts to a route handler or server action; the server writes to the store. Simplest wiring, but the file transits your function and serverless platforms cap request bodies (Vercel functions ~4.5 MB — verify the current limit before relying on it). Right for avatars and small documents.
2. **Client-direct** — the browser uploads straight to storage; your server only authenticates and issues a scoped token or presigned URL pinning allowed type, max size, and key prefix. No body cap, no double transfer, real progress. Default for anything beyond tiny files.

Store choice:

- **Vercel Blob** — the default on this stack: zero infra, public/private access, a built-in client-direct token flow. Exact SDK surface (put/upload/token handler) — verify against current docs first.
- **S3-compatible** (AWS S3, Cloudflare R2) — when hosting off Vercel, files run large, or egress cost matters; presigned-PUT URLs give the same client-direct shape.
- Either way: the authorizing endpoint checks auth BEFORE issuing anything, and the token constrains content type, size, and prefix — an unscoped upload token is an open bucket.

## Upload UX

- Dropzone = styled `<label>` around the real input (`sr-only`, not `display:none` — it must stay focusable); `focus-visible` ring from the token palette via `focus-within`; drag-over shifts border to accent and background one neutral step in 150–250ms — no scale jumps, no bounce.
- Real progress requires `XMLHttpRequest` — `xhr.upload.onprogress` gives loaded/total; `fetch` cannot report upload progress. Render a determinate bar + percent text; mirror to `aria-live="polite"` at coarse steps (25/50/75/done), not every tick.
- Validate before the network: extension AND MIME allowlist, size cap with an honest message ("Max 4 MB — this file is 12.8 MB"), image preview via `URL.createObjectURL` (revoke it after).
- Multiple files: one row per file with independent progress, error, retry, and remove — one bad file never fails the batch.
- Errors land beside the dropzone, tied via `aria-describedby`; retry keeps the file selected.

## Server validation — zod v4

```ts
// the token-issuing handler (client-direct) or the receiving action (server relay)
import { z } from 'zod'

const uploadMeta = z.object({
  type: z.enum(['image/jpeg', 'image/png', 'image/webp'], { error: 'JPEG, PNG, or WebP only' }),
  size: z.number().int().positive().max(4 * 1024 * 1024, { error: 'Max 4 MB' }),
  name: z.string().max(200),   // display only — never a storage path
})
```

- Key shape: `${prefix}/${crypto.randomUUID()}.${extFromValidatedMime}` — extension derived from the validated MIME, never from `name` (path traversal, collisions).
- Re-serving user files publicly: sniff magic bytes rather than trusting the declared content-type — a renamed `.html` "image" served inline is stored XSS.
- Persist the record alongside the blob write (per `database`): url, width, height, alt, size, owner. Read image dimensions server-side at write time so rendering never guesses.
- Content images require alt text at upload; decorative ones store `alt: ''` explicitly.

## After upload — next/image

```ts
// next.config.ts
images: { remotePatterns: [{ protocol: 'https', hostname: '<your-store-host>' }] }
```

- Render with stored dimensions: `<Image src={url} width={width} height={height} alt={alt} sizes="(min-width: 768px) 33vw, 100vw" />` — or `fill` + `sizes` inside a sized container.
- LCP-critical uploaded images (cover, profile hero) get `preload` — `priority` is deprecated in Next 16.
- `placeholder="blur"` on remote images needs a stored `blurDataURL` — generate the tiny base64 at upload time or omit the prop; a plain token-colored background beats a broken blur.
- Optimistic preview: show the local object URL immediately while uploading, swap to the stored URL on success, snap back with a visible error on failure — never silently.

## Anti-patterns

- `accept="image/*"` as the only validation — it filters the picker dialog, nothing else.
- `put(file.name` or any storage key built from the user's filename — greppable; traversal and collisions.
- `setInterval` driving a progress bar — fake progress; wire `xhr.upload.onprogress` or show indeterminate honestly.
- `<img src=` for stored images — bypasses the next/image pipeline: no sizing, no format negotiation, CLS.
- `priority` on next/image — deprecated in 16; use `preload`.
- Size cap only on the client — the server schema is the real cap.
- `fs.writeFile` into `public/` at runtime — serverless filesystems are ephemeral; files vanish on the next deploy.
- An `onClick` dropzone `div` with no `<input type="file">` — keyboard and screen-reader users locked out.
- Submit with no pending state — double submits create orphaned blobs.

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

## Composes with

- **ultraweb:forms** — the dropzone lives among fields; label and error placement follow its rules.
- **ultraweb:server-actions** — server-relay uploads and the post-upload metadata write are actions with errors-as-state.
- **ultraweb:api-design** — the token/presign route handler takes its response envelope and status codes from there.
- **ultraweb:database** — the file record schema and the write that keeps blob and row consistent.
- **ultraweb:media-optimization** — sizes/preload/LCP discipline for rendering what was uploaded.
- **ultraweb:ui-states** — the six dropzone states are designed surfaces, not defaults.
- **ultraweb:brief** — read first to learn what gets uploaded, by whom, and how big; that answer sets the store, the server-relay vs client-direct path, and the size cap.
