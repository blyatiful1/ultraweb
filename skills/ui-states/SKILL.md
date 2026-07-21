---
name: ui-states
description: Enforce the all-states contract — every async surface ships loading, empty, error, and success states designed with system tokens; skeletons that match the real layout's dimensions exactly (zero CLS on swap), empty states with exactly one action, error states that say what happened and what to do. Invoke during ultraweb Phase 6 for any surface that fetches, searches, filters, uploads, or mutates, during Phase 7 backend flows, or when the user mentions loading states, skeletons, spinners, empty states, error handling UX, "no results", or a blank/janky screen while data loads.
---

# ui-states — the all-states contract

**Stage:** Phase 6 — Build (re-consulted in Phase 7 for every backend flow) - **Reads:** design/SYSTEM.md, design/SITEMAP.md, design/BRIEF.md - **Writes:** components/states/* (skeletons, empty, error), app/**/loading.tsx, app/**/error.tsx

## Standard

Every async surface ships all four states — loading, empty, error, success — designed with SYSTEM tokens before the surface counts as built. A surface with only the success path designed is 25% finished. The bar:

- **Loading:** skeleton matches the real layout's dimensions exactly — same container, same grid, same heights, same radii. Zero CLS on the skeleton→content swap.
- **Empty:** one sentence saying what will live here + exactly ONE primary action that creates the first item. Never a bare "No data".
- **Error:** what happened in plain words + what to do (retry or a path out). Never a raw status code, stack, or `error.message` shown to the user.
- **Success (mutations):** visible confirmation where the user is already looking, perceived within 100ms — pending state on the trigger, optimistic update, or an immediate morph.

## Process

1. Inventory async surfaces from SITEMAP.md + BRIEF.md backend needs: every fetch, search, filter, form, upload.
2. For each surface, write a four-column row (surface × loading/empty/error/success → file) before building it. Missing cell = unfinished surface.
3. Build each skeleton FROM the real component: duplicate its JSX, replace content with token-colored blocks. Never guess dimensions.
4. Wire the Next.js layer (below), then force each state in dev — throttle the network, throw in the fetch, return `[]` — and screenshot all four.
5. Verify the swap: skeleton and loaded content screenshots overlay with no layout shift.

## Variants

- **List Skeleton** — stacked text-line rows (widths varied 40–90%), optional leading avatar at real dimensions, repeated to expected result count. Use for feeds, search results, and row-based tables.
- **Card-Grid Skeleton** — media block at the real aspect ratio + 2–3 text lines per card, laid out in the real grid. Use for galleries, product grids, and dashboard cards.
- **First-Use Empty** — "No projects yet — create your first": one sentence + the ONE action that creates the first item. Use on any surface a new user reaches before data exists — often their first screen.
- **Filtered-to-Zero Empty** — "No results for 'x' — clear filters": the action clears the query or filters, never "create". Use wherever search or filters can zero out existing data; design it separately from first-use.
- **Route-Error Panel** — `error.tsx` per segment with a `reset()` retry, designed with the same care as a page. Use when the whole segment's data failed and nothing below it can render.
- **Inline Section Error** — small semantic-token panel in the space the island occupies; retry refetches just that island. Use when one Suspense island fails and the rest of the page is fine.

## The contract in Next 16

- **Route loading:** `loading.tsx` per segment streams instantly — put the page's real skeleton there, never a centered spinner in a blank viewport.
- **Island loading:** wrap each independently-fetching island in its own `<Suspense fallback={<XSkeleton />}>` so one slow query doesn't hold the page; consult `ultraweb:data-fetching` for boundary placement.
- **Errors:** `error.tsx` per segment (`"use client"`, receives `error` and `reset`) — designed, not default. `not-found.tsx` per segment; `global-not-found.tsx` for the app-wide 404. All three get the same design care as pages.
- **Mutations:** `const [state, formAction, pending] = useActionState(action, initial)` — `pending` drives the trigger button's loading state (consult `ultraweb:buttons`); errors come back as data from the action and render inline (consult `ultraweb:server-actions` and `ultraweb:forms`).

## Skeleton rules

- Three shapes only: text line (`h-4`, radius per SYSTEM §shape, widths varied 40–90% — uniform full-width lines look fake), avatar/thumbnail (real dimensions), media block (real aspect ratio).
- Skeleton count = expected result count (or a 3–6 median), laid out in the real grid — not one lonely bar.
- Pulse: opacity 0.5↔1.0 over 1.5–2s ease-in-out via an `--animate-*` token; `prefers-reduced-motion: reduce` → static at mid opacity.
- Skeleton color: one muted neutral token, re-decided for dark mode — never hardcoded gray.
- Never skeleton static content. Skeletons announce "data is coming"; on server-rendered static sections they announce a lie.

## Empty states

- Anatomy: optional icon or small illustration per SYSTEM §imagery/§icons (never emoji) → one sentence of what belongs here → ONE primary action. At most one secondary text link.
- First-Use Empty ≠ Filtered-to-Zero Empty (variants above) — design both wherever filters or search exist; the action differs.
- Center the empty state in the space the content would occupy, not the whole viewport.
- Copy in brand voice via `ultraweb:copywriting` — the empty state is often the first screen a new user sees.

## Error states

- Line 1: what happened, human words ("We couldn't load your invoices").
- Line 2 / action: what to do — a retry button wired to `reset()` (route errors) or a refetch, or a path elsewhere.
- Log the real error for diagnostics; show the human version. Semantic error token from SYSTEM §color, small icon — never a full-screen red panel.
- A failed fetch must transition to the error state. A skeleton that pulses forever over a dead request is the worst state of all.
- Field-level validation errors belong to `ultraweb:forms`; this skill owns section- and route-level failure.

## Success

- Confirm the noun: "Invoice sent", not "Success!".
- Toast (sonner — shadcn's `toast` is deprecated) only when the result isn't visible where the user is looking; if the new item appears in view, the appearance IS the confirmation.
- Button morph pending→success at 150–250ms per SYSTEM §motion, then revert after 1.5–2s.

## A11y

- Pending region: `aria-busy="true"`; skeleton internals `aria-hidden="true"` with one sr-only "Loading {thing}" — not per-block announcements.
- Results announce via one `aria-live="polite"` region; errors use `role="alert"`. One live region per surface, never a chorus.
- Retry is a real `<button>` with a `focus-visible` ring from tokens; after an error renders, focus lands on or adjacent to it.
- Honor `prefers-reduced-motion` on every pulse, shimmer, and morph.

## Anti-patterns

Greppable: `Loading...`, `No data`, `Nothing here`, `Something went wrong` with no adjacent action, `alert(`, `catch (e) {}`, `spinner` inside `loading.tsx`.

- Spinner-only route loading: a spinner promises an unknown wait; a skeleton promises a known shape.
- Skeleton dimensions guessed instead of copied — layout jumps on swap and gate-performance flags the CLS.
- Empty state with three CTAs — one action, chosen.
- Swallowed errors rendering the success UI over stale or missing data.
- Success toast for something the user is already looking at.
- A different skeleton style per page — one skeleton language, tokenized, site-wide.

## Worked example — Casa Verde, reservation states in EN/PT

design/BRIEF.md fixes the reservation flow's three outcomes — pending, confirmed, fully-booked (waitlist offer) — and the job here is to make sure "fully-booked" is never modeled as an error.

The four-cell row for the reservations surface: **loading** is the submit button's own pending state — `const [state, formAction, pending] = useActionState(reserve, null)` from `react` — not a page skeleton, since a two-field form has no shape to promise. **Success** returns two branches as action data: `confirmed` morphs the button to "Mesa reservada" / "Table booked" at 200ms then reverts; `fully-booked` renders an inline terracotta panel `oklch(0.66 0.13 45)` reading "Tonight is full — join the waitlist?" with exactly ONE action. **Error** — a network or Resend failure — is the only `role="alert"` on the page: "We couldn't send your confirmation. Try again," written EN and PT by ultraweb:copywriting.

The harvest strip above the menu gets a Card-Grid Skeleton at the real 3:4 photo aspect ratio; on a day the market feed returns `[]` the strip collapses to nothing rather than showing a Filtered-to-Zero empty — an empty harvest isn't a user dead-end.

Rejected: routing "fully-booked" through `error.tsx`. It lost because a full table is a normal outcome; an error boundary would only offer `reset()` (retry the same date) instead of the waitlist that actually helps the guest.

Handoff: the pending/success wiring lands in the reservations form component + `reserve-action.ts`; ultraweb:server-actions owns the action's return shape and ultraweb:forms owns the field-level zod errors this skill deliberately leaves alone.

## Composes with

- ultraweb:routing — loading.tsx/error.tsx/not-found.tsx placement per segment
- ultraweb:data-fetching — Suspense boundary placement and streaming strategy
- ultraweb:server-actions — pending/error/success wiring via useActionState
- ultraweb:forms — field-level validation and error recovery
- ultraweb:copywriting — the exact words in empty and error states
- ultraweb:motion-language — pulse and morph durations, reduced-motion policy
- ultraweb:cards — the Card-Grid Skeleton duplicates the card component's JSX and aspect ratio so the skeleton→card swap has zero shift
- ultraweb:data-display — list and table skeletons are built from the real data-display row so widths, heights, and radii match exactly
- ultraweb:gate-performance — hands off the skeleton→content overlay for CLS verification; a guessed skeleton dimension fails its check
- ultraweb:icons — the empty state's optional glyph is pulled from here at the SYSTEM stroke width, never an emoji
