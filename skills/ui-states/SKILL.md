---
name: ui-states
description: Enforce the all-states contract — every async surface ships loading, empty, error, and success states designed with system tokens; skeletons that match the real layout exactly (zero CLS on swap), empty states that onboard with one action, error states that run a recovery-copy formula (what happened + the fix, never "Something went wrong"), and a designed not-found (404) in the site's own voice and type. Invoke during ultraweb Phase 6 for any surface that fetches, searches, filters, uploads, or mutates, during Phase 7 backend flows, or when the user mentions loading states, skeletons, spinners, empty states, error handling UX, error message wording, 404 or not-found pages, "no results", or a blank/janky screen while data loads.
---

# ui-states — the all-states contract

**Stage:** Phase 6 — Build (re-consulted in Phase 7 for every backend flow) - **Reads:** design/SYSTEM.md, design/SITEMAP.md, design/BRIEF.md - **Writes:** components/states/* (skeletons, empty, error), app/**/loading.tsx, app/**/error.tsx

## Standard

Every async surface ships all four states — loading, empty, error, success — designed with SYSTEM tokens before the surface counts as built. A surface with only the success path designed is 25% finished. The bar:

- **Loading:** skeleton matches the real layout's dimensions exactly — same container, same grid, same heights, same radii. Zero CLS on the skeleton→content swap.
- **Empty:** onboarding, not apology — one in-voice line naming what will live here + exactly ONE action that creates the first item. Never a bare "No data".
- **Error:** the recovery formula — what happened, why (only when it helps), and one concrete fix — in plain words. Never a raw status code, stack, `error.message`, or a bare "Something went wrong".
- **Success (mutations):** visible confirmation where the user is already looking, perceived within 100ms — pending state on the trigger, optimistic update, or an immediate morph.
- **Not-found (404):** route-level, not async — but the same contract. An in-voice line (never "Page not found"), a real way back beyond Home, in the site's own type and color. Never the framework default.

## Process

1. Inventory async surfaces from SITEMAP.md + BRIEF.md backend needs: every fetch, search, filter, form, upload.
2. For each surface, write a four-column row (surface × loading/empty/error/success → file) before building it. Missing cell = unfinished surface.
3. Build each skeleton FROM the real component: duplicate its JSX, replace content with token-colored blocks. Never guess dimensions.
4. Wire the Next.js layer (below), then force each state in dev — throttle the network, throw in the fetch, return `[]` — and screenshot all four; the shipped build gets the interception pass below.
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

Empty is onboarding, not apology — the first-use empty is often the first screen a new user ever sees, so it teaches the next action instead of reporting a void.

- Formula: (1) an in-voice line naming what will live here and why it's worth the next tap — never "No items yet"; (2) ONE primary action that creates the first item; (3) an optional power-user shortcut hint ("Press / to search"). At most one secondary text link. Optional icon/illustration per SYSTEM §imagery/§icons — never emoji.
- First-Use Empty ≠ Filtered-to-Zero Empty (variants above) — design both wherever filters or search exist; the action differs. Copy in brand voice via `ultraweb:copywriting`.
- Center the empty state in the space the content would occupy, not the whole viewport.
- **Marketing reuse (SaaS/tools only):** once a first-use empty is designed, `ultraweb:feature-sections` may feature the EXACT screenshot — never a re-rendered mockup — as a "Day One" proof point captioned with time-to-value. Gate it to products with a real authenticated app surface; a storefront has no such state to show.

## Error states

An error message is a recovery instruction, not an incident report. The formula: **`[what happened]. [why — only when it helps the user act]. [the concrete fix, as a button or link].`** — "Your card was declined. Try a different card or contact your bank." + a real [Retry payment] action. The "why" earns its place only when it changes what the user does; drop it when it's noise.

- Banned outright (grep them): "Something went wrong", "An error occurred", "Oops!", a bare "Please try again", plus any raw zod default ("Invalid input", "Required") or `error.message` rendered as UI. This is the dead-copy slop `taste` bans for headlines leaking in through the error path — `ultraweb:gate-content`'s microcopy lint sweeps it here too.
- Wire the fix: a retry button to `reset()` (route errors) or a refetch, or a path elsewhere. Log the real error for diagnostics; show the human version. Semantic error token from SYSTEM §color, small icon — never a full-screen red panel.
- A failed fetch must transition to the error state. A skeleton that pulses forever over a dead request is the worst state of all.
- Field-level validation errors belong to `ultraweb:forms`; this skill owns section- and route-level failure — but the wording formula and ban-list above apply to every error string, field-level included.

## Not-found (404)

The one dead-end every site is guaranteed to serve, and the moment voice consistency matters most — the visitor is already lost. Design it; never ship Next's default.

- In-voice one-liner, never a bare "Page not found". Tone tracks the brand: restrained and plain for a trust-critical firm, warmer and playful for a studio or game — the calibration `ultraweb:copywriting` owns.
- A real way back beyond a lone Home link — a search box, the top three sections, or a contact link. The visitor took a wrong turn; hand them the map, not one more front door.
- Rendered in the site's own type and color — display face, palette, nav — so the 404 reads as this site, not the framework. `not-found.tsx` per segment + `global-not-found.tsx` for the app-wide case (placement is `ultraweb:routing`'s; that file renders outside the root layout and imports its own fonts/globals).
- Personality — a micro-scene, an on-brand flourish — is `ultraweb:hidden-craft`'s strictly-additive layer over this working page; skip it entirely for trust-critical clients. The usable error page underneath is non-negotiable.

## Success

- Confirm the noun: "Invoice sent", not "Success!".
- Toast (sonner — shadcn's `toast` is deprecated) only when the result isn't visible where the user is looking; if the new item appears in view, the appearance IS the confirmation.
- Button morph pending→success at 150–250ms per SYSTEM §motion, then revert after 1.5–2s.

## A11y

- Pending region: `aria-busy="true"`; skeleton internals `aria-hidden="true"` with one sr-only "Loading {thing}" — not per-block announcements.
- Results announce via one `aria-live="polite"` region; errors use `role="alert"`. One live region per surface, never a chorus.
- Retry is a real `<button>` with a `focus-visible` ring from tokens; after an error renders, focus lands on or adjacent to it.
- Honor `prefers-reduced-motion` on every pulse, shimmer, and morph.

## Adverse-condition verification

Editing the fetch to force a state proves the component; intercepting the network proves the build a visitor actually gets. Against `npm start`, intercept via Playwright `page.route(pattern, handler)` (browser_run_code_unsafe) — the same house mechanism `ultraweb:gate-accessibility` uses for `page.emulateMedia()`. One condition per run, reload, screenshot; `page.unroute()` between runs or the next condition inherits the last.

```js
// browser_run_code_unsafe — one of these per run, against the production server
await page.route("**/api/reservations*", async r => { await new Promise(k => setTimeout(k, 8000)); await r.continue() });        // slow
await page.route("**/api/reservations*", r => r.fulfill({ status: 500, contentType: "application/json", body: '{"error":1}' })); // failed
await page.route("**/api/reservations*", r => r.fulfill({ status: 200, contentType: "application/json", body: "[]" }));         // empty
```

- **Skeleton matches the loaded layout** — overlay the slow-route screenshot with the loaded one: same container, same grid, same heights, same radii, no shift on swap. A mismatch is the CLS `ultraweb:gate-performance` would fail two phases later, caught here for the price of one screenshot.
- **Error copy surfaces** — under the 500, the recovery string and its action are on screen. A skeleton still pulsing over a dead request, a blank island, or an error that only reached the console each fail.
- **Empty state renders** — under `[]`, the designed empty renders with its ONE action. A blank region means the path was assumed, never built.

## Anti-patterns

Greppable: `Loading...`, `No data`, `Nothing here`, `Something went wrong`, `An error occurred`, `Oops`, bare `Please try again`, `Invalid input`, `Page not found`, `alert(`, `catch (e) {}`, `spinner` inside `loading.tsx`.

- Spinner-only route loading: a spinner promises an unknown wait; a skeleton promises a known shape.
- Skeleton dimensions guessed instead of copied — layout jumps on swap and gate-performance flags the CLS.
- Empty state with three CTAs — one action, chosen. And an empty that apologizes ("No items yet") instead of teaching the first action.
- The framework-default 404 reaching production, or a 404 whose only exit is Home — design the page and offer a way back beyond the front door.
- Swallowed errors rendering the success UI over stale or missing data.
- Success toast for something the user is already looking at.
- A different skeleton style per page — one skeleton language, tokenized, site-wide.

## Worked example — Casa Verde, reservation states in EN/PT

design/BRIEF.md fixes the reservation flow's three outcomes — pending, confirmed, fully-booked (waitlist offer) — and the job here is to make sure "fully-booked" is never modeled as an error.

The four-cell row for the reservations surface: **loading** is the submit button's own pending state — `const [state, formAction, pending] = useActionState(reserve, null)` from `react` — not a page skeleton, since a two-field form has no shape to promise. **Success** returns two branches as action data: `confirmed` morphs the button to "Mesa reservada" / "Table booked" at 200ms then reverts; `fully-booked` renders an inline terracotta `bg-accent` panel reading "Tonight is full — join the waitlist?" with exactly ONE action. **Error** — a network or Resend failure — is the only `role="alert"` on the page and runs the formula: "We couldn't send your confirmation. Your table's held for 10 minutes — try again or call us." — what happened, a why that changes the next move, and two concrete fixes ([Try again] + a `tel:` link), EN and PT by ultraweb:copywriting. A bare "Something went wrong" would have failed gate-content's microcopy lint.

The harvest strip above the menu gets a Card-Grid Skeleton at the real 3:4 photo aspect ratio; on a day the market feed returns `[]` the strip collapses to nothing rather than showing a Filtered-to-Zero empty — an empty harvest isn't a user dead-end.

The 404 is `not-found.tsx` in the display face on the terracotta palette, EN/PT: "This page isn't on tonight's menu — back to the Menu or Reservations." — two real ways back, never Next's default; any personality stays deferred to ultraweb:hidden-craft (a restaurant leans restrained). The empty-state marketing reuse doesn't apply here — Casa Verde has no authenticated app surface to screenshot, so that lever is correctly gated out.

Rejected: routing "fully-booked" through `error.tsx`. It lost because a full table is a normal outcome; an error boundary would only offer `reset()` (retry the same date) instead of the waitlist that actually helps the guest.

Handoff: the pending/success wiring lands in the reservations form component + `reserve-action.ts`; ultraweb:server-actions owns the action's return shape and ultraweb:forms owns the field-level zod errors this skill deliberately leaves alone; the 404's file placement is ultraweb:routing's and its optional flourish ultraweb:hidden-craft's, both over the in-voice page designed here.

## Composes with

- ultraweb:routing — loading.tsx/error.tsx/not-found.tsx placement per segment; owns where the 404 file lives, this skill owns what it says and shows
- ultraweb:hidden-craft — adds the personality layer (micro-scene, console signature) on the not-found page designed here; ui-states owns that the 404 exists, is in-voice, and offers a real way back — hidden-craft is strictly additive over it
- ultraweb:data-fetching — Suspense boundary placement and streaming strategy
- ultraweb:server-actions — pending/error/success wiring via useActionState
- ultraweb:forms — field-level validation and error recovery
- ultraweb:copywriting — the exact words in empty, error, and 404 states, and the tone calibration per brand
- ultraweb:gate-content — its microcopy lint sweeps the error/empty ban-list this skill defines; a bare "Something went wrong" or raw zod default that ships is its gate failure
- ultraweb:motion-language — pulse and morph durations, reduced-motion policy
- ultraweb:cards — the Card-Grid Skeleton duplicates the card component's JSX and aspect ratio so the skeleton→card swap has zero shift
- ultraweb:data-display — list and table skeletons are built from the real data-display row so widths, heights, and radii match exactly
- ultraweb:feature-sections — consumes a designed first-use empty screenshot as a "Day One" proof point (SaaS/tools only, exact screenshot, never a re-render)
- ultraweb:gate-performance — hands off the skeleton→content overlay for CLS verification; a guessed skeleton dimension fails its check
- ultraweb:icons — the empty state's optional glyph is pulled from here at the SYSTEM stroke width, never an emoji
