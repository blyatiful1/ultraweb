# next

Current App Router patterns that models get wrong unprompted: server/client boundaries, awaited params, the caching model, mutations, route files, focus after navigation, speculative prerender.

Load when: scaffolding the app structure, placing `"use client"`, fetching or caching data, writing a form action, adding routes, error and 404 surfaces, or navigation behaviour.

Reads: design/SITEMAP.md, design/SYSTEM.md. Writes: `app/` route files, `lib/data/*`, `app/actions/*`, `proxy.ts`, the root layout.

## Before writing cache code

Read `next.config.ts`. Current `create-next-app` enables `cacheComponents` by default; if the flag is on, the caching rules below apply and uncached dynamic reads must sit inside a Suspense boundary. If it is off (older project), `'use cache'` does not exist and you must not write it. Never turn the flag off to silence a build error; add the boundary or the `'use cache'` directive instead. Versions come from `stack/versions.json`.

## Server and client boundaries

- Every component is a Server Component until it needs state, effects, browser APIs or event handlers. Put `"use client"` on the smallest leaf that needs it. Target: layouts and pages contain none, and each occurrence is justifiable in one sentence.
- `"use client"` marks a module-graph boundary: everything a client file imports becomes client code.
- A server component cannot be imported into a client file, but it can pass through as `children` or a prop. Compose that way: a server section renders a client `Reveal` wrapper around server-rendered children.
- Anything imported from `motion/react` is client. Keep motion in thin wrappers under `components/motion/` and let sections stay server.
- Props crossing server to client must serialize: no functions, no class instances. Pass a Server Action instead of an event handler.
- Layouts persist across navigation and keep state. `template.tsx` remounts on every navigation; use it only when a transition needs per-route re-runs.
- Shareable UI state (tab, filter, page) lives in the URL via `searchParams`, not `useState`. Ephemeral state (menu open) lives in the leaf. Add no global state library to a marketing site.
- Secrets (`process.env.X` without `NEXT_PUBLIC_`) are read only in server files.
- One provider in the root layout (theme). Each further context needs a written reason. The layout stays a server component and wraps `{children}` in a client provider file.

File layout the other references assume:

```
app/                      route files only (page, layout, loading, error, not-found) + globals.css
app/<route>/_components/  pieces used by one route (private folder)
components/ui/            restyled shadcn primitives
components/sections/      page sections, server by default, one per file
components/layout/        header, footer, providers
components/motion/        thin client wrappers
lib/                      utils, fonts, data/*
```

## Params, searchParams and the proxy file

`params` and `searchParams` are Promises everywhere: pages, layouts, `generateMetadata`, route handlers, `opengraph-image`.

```tsx
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = await getProject(slug)
  if (!project) notFound()
}
```

`middleware.ts` is deprecated. The file is `proxy.ts` exporting `proxy(request)`, Node runtime. Codemod: `npx @next/codemod@latest rename-middleware-to-proxy .`. Proxy checks are optimistic redirects, never authorization.

## Caching model

- `fetch` is not cached by default. A database call is never cached by `fetch` semantics. Every data source gets a decided lifetime.
- With `cacheComponents` on: `'use cache'` at the top of an async function, component or file. `cacheLife()` and `cacheTag()` come from `next/cache`. Built-in profiles: `seconds`, `minutes`, `hours`, `days`, `weeks`, `max`.
- Cached functions cannot read request data (`cookies()`, `headers()`, `searchParams`) inside the cached scope. Read it outside and pass the value in as an argument.
- Per-user or per-request data is not cached. Render it inside `<Suspense>`: the static shell prerenders and the dynamic part streams.

```ts
// lib/data/projects.ts
import { cacheLife, cacheTag } from 'next/cache'
export const TAGS = { projects: 'projects' } as const   // one map, shared with actions

export async function getProjects() {
  'use cache'
  cacheLife('hours')
  cacheTag(TAGS.projects)
  return db.query.projects.findMany()
}
```

Heuristics: marketing and CMS content hours to days; prices and inventory minutes.

Invalidation has three functions, pick by caller:

| Caller | Function | Behaviour |
|---|---|---|
| Server Action, user must see their own change at once | `updateTag(tag)` | expires the tag; next request waits for fresh data (read-your-own-writes). Throws outside a Server Action. |
| Server Action or Route Handler, stale-while-revalidate is fine | `revalidateTag(tag, 'max')` | profile is required as second argument; the one-argument form is deprecated. |
| Webhook or Route Handler | `revalidateTag(tag, 'max')` or `{ expire: 0 }` | `updateTag` is not available here. |
| Whole path | `revalidatePath('/work')` | unchanged |

`revalidateTag` is stale-while-revalidate: with a non-zero profile the visitor who triggered the write can still see old data. After a user's own mutation use `updateTag`.

Tag strings live in one exported map. A typo silently breaks invalidation.

## Streaming and parallel fetching

- Decide per section: block (resolves fast and paints the LCP element) or stream behind `<Suspense>` with a skeleton that mirrors the landed layout (same heights, same grid; a spinner under a grid causes layout shift).
- Prefer granular in-page Suspense over a whole-segment `loading.tsx` on mixed-speed pages. Never nest a fast section inside a slow section's boundary.
- Sibling fetches run in parallel: `const [a, b] = await Promise.all([getA(), getB()])`. Two consecutive awaits whose arguments do not reference each other are a waterfall.
- Server Components query directly. A site never `fetch`es its own origin. Route handlers are for webhooks, third-party consumers, client-driven reads after load (typeahead, infinite scroll) and non-HTML responses. Mutations are never GET handlers.

## Mutations: server actions

- Every mutation is a `'use server'` action. A server action is a public HTTP endpoint: validate every input with zod and re-check the session inside the action if the data is private. Client validation is polish.
- Expected failures (invalid input, duplicate, denial) are returned as state. A thrown error reaches production as an opaque digest.
- Call `redirect()` outside try/catch; it works by throwing and a catch swallows the navigation.
- Never return secrets, raw DB rows or stack traces in state; it serializes to the client.
- Every successful write ends in `updateTag`, `revalidateTag(tag, 'max')`, `revalidatePath` or `redirect`. A mutation the UI does not reflect is a bug.

```ts
'use server'
import { z } from 'zod'
import { updateTag } from 'next/cache'

const schema = z.object({
  title: z.string().min(3, { error: 'Give it a title of at least 3 characters' }),
})
export type State = { ok: boolean; errors?: Record<string, string[]> }   // field keys plus 'form'

export async function createProject(_prev: State, formData: FormData): Promise<State> {
  const parsed = schema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { ok: false, errors: z.flattenError(parsed.error).fieldErrors }
  await insertProject(parsed.data)
  updateTag('projects')
  return { ok: true }
}
```

zod v4 takes `{ error: '...' }`; `{ message: '...' }` is the old parameter.

Client wiring: `useActionState` is imported from `react`, `useFormStatus` from `react-dom`.

```tsx
const [state, formAction, pending] = useActionState(createProject, { ok: false })
// <form action={formAction}>; disable the submit while pending
```

`useFormStatus` belongs inside a shared submit-button component that cannot see the tuple. `useOptimistic` only for low-stakes, reversible changes (likes, list adds); a failed action snaps back, so show an error. Payments and deletions show an honest pending state.

Progressive-enhancement test: disable JavaScript, submit empty (server-rendered errors appear), submit valid (success or redirect happens). If a step fails the form depends on client handlers; rewire it to `<form action={formAction}>`.

## Routes

- Implement design/SITEMAP.md exactly: every listed page exists, no orphan routes. URLs are clean (`/work/atlas`, never `?id=3`).
- Route groups scope layouts and never appear in URLs. Name them for the shell they share (`(marketing)`, `(app)`, `(auth)`); a group without its own layout is noise.
- `[slug]` for one param, `[...slug]` only when depth truly varies. Add `generateStaticParams` for build-time collections. Missing data calls `notFound()`.
- Parallel route slots (`@modal`) require a `default.tsx` returning `null`; the build fails without it. Intercepting matchers: `(.)` same level, `(..)` one up, `(...)` from root. A modal-with-URL renders the same content as the full page on hard navigation; dismiss with `router.back()` in a client wrapper and trap and return focus.

| File | Rules |
|---|---|
| `loading.tsx` | Segment-wide Suspense; skeleton mirrors the real layout. |
| `error.tsx` | Must be `'use client'`; receives `{ error, reset }`; catches errors in the segment's children, not its own layout. Written in the site's voice with a real button wired to `reset()`. Never print `error.message`. |
| `not-found.tsx` | Per segment, triggered by `notFound()`; on-brand copy and a route back. |
| `app/global-not-found.tsx` | App-wide 404 for unmatched URLs. Still experimental: needs `experimental: { globalNotFound: true }` in next.config. Bypasses the root layout, so it returns its own `<html>` and `<body>` and imports globals and fonts itself. Without the flag, a root `app/not-found.tsx` handles unmatched URLs inside the root layout. |
| `app/global-error.tsx` | Replaces the root layout when it fires. `'use client'`, own `<html>` and `<body>`, self-contained styles (the layout that normally supplies them is what broke). Production only. |

The 404 and error pages are design surfaces: headline in the display face, one line of voice, a working way out.

## Focus after client navigation

The browser resets focus only on full page loads. After a client route change focus stays on a removed link or falls to `<body>`. Mount one client leaf in the root layout and give each page's top heading `id="main-heading" tabIndex={-1}`:

```tsx
"use client"
import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"
export function FocusOnNavigate() {
  const pathname = usePathname()
  const first = useRef(true)
  useEffect(() => {
    if (first.current) { first.current = false; return }   // keep focus on a deep-linked #hash
    document.getElementById("main-heading")?.focus({ preventScroll: true })
  }, [pathname])
  return null
}
```

One leaf only. A per-page effect makes pages fight each other. Pair it with a polite live-region announcement of the new page title if the site has custom transitions.

## Speculation Rules

`next/link` prefetch loads the route payload, not the whole document. A Speculation Rules block in the root layout prerenders the destination in browsers that support it; others ignore the script type, so `next/link` stays the fallback.

```tsx
<script type="speculationrules" dangerouslySetInnerHTML={{ __html: JSON.stringify({
  prerender: [{
    where: { and: [
      { href_matches: "/*" },
      { not: { href_matches: "/checkout/*" } },
      { not: { href_matches: "/auth/*" } },
      { not: { href_matches: "/logout" } },
    ]},
    eagerness: "moderate",
  }],
}) }} />
```

- Cap eagerness at `moderate`. `eager` and `immediate` render pages nobody clicks.
- Exclude every stateful or side-effecting route: checkout, auth, logout, cart mutations.
- A prerender executes the page, so analytics pageviews double-count unless the tag waits for `document.prerendering` to become false (`prerenderingchange` event).
- Same-origin only. Check current browser support before relying on it for anything but speed.

## Anti-patterns

- `"use client"` in a `layout.tsx` or at the top of a `page.tsx` "to be safe".
- `useEffect` plus `fetch` for initial page data; `fetch("http://localhost` or `NEXT_PUBLIC_URL` from a server component.
- `const { slug } = params` without `await`; `{ params }: { params: {` typed as a plain object.
- `middleware.ts`; `revalidateTag('x')` with one argument.
- A `@slot` directory without `default.tsx`.
- `onSubmit` plus `preventDefault()` driving a mutation; `throw new Error('Invalid` inside an action; client `fetch('/api/` for a first-party form.
- `useActionState` imported from `react-dom`; `redirect()` inside try/catch.
- `href="#"` in navigation; framework-default 404 or error screens in production.
- `npm i zustand` or `redux` on a marketing site.
