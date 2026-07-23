---
name: app-structure
description: Defines the App Router architecture for an ultraweb build — React Server Components by default, "use client" pushed to leaf components and never into layouts or pages, server/client composition via children-as-slots, a decision table for where every kind of state lives (server, URL, client leaf, form action), the root-layout provider pattern (theme provider plus a focus-on-navigate leaf that resets focus after client route changes), and the file-organization contract all component skills follow. Invoke in Phase 5 immediately after scaffold, whenever placing a "use client" directive, deciding if a component is server or client, wiring providers into the root layout, choosing layout vs template, deciding where focus goes after a client-side route change, or when the question is "where does this component/state/fetch go" in a Next.js App Router project.
---

# app-structure — server default, client leaves

**Stage:** Phase 5 — Scaffold - **Reads:** design/SITEMAP.md, scaffolded tree - **Writes:** app/ structure + design/SITEMAP.md part 3 (the RSC/client boundary plan every component skill obeys)

## Standard

The client bundle carries interactivity and nothing else. Every component is a Server Component until it proves it needs state, effects, browser APIs, or event handlers — then `"use client"` goes on the smallest leaf that needs it, never on the section, page, or layout containing it. Target for a typical marketing site: layouts and pages 100% server, `"use client"` file count in the low teens, each occurrence individually justifiable in one sentence.

## Process

1. **Enumerate interactivity:** read design/SITEMAP.md (parts 1–2) and the scaffolded tree; list every interactive need per page — nav/menu, tabs, filters, forms, motion, theme.
2. **Assign each a home** using the state table below: server, URL, client leaf, or action. Anything without a one-sentence justification for `"use client"` stays server.
3. **Write the boundary plan as design/SITEMAP.md part 3** — per page: the client leaves (file path + one-sentence justification each), which state lives in the URL, which mutations become Server Actions. Every component skill obeys this plan; gate-performance audits against it.
4. **Stub the shared client leaves** the plan names — components/motion/ wrappers (Reveal, Stagger…) and components/layout/providers.tsx — so sections compose them instead of inventing their own boundaries.
5. **Verify empirically:** grep app/ for `"use client"` — zero hits in any layout.tsx or page.tsx; count total occurrences against the low-teens target.

## Boundary rules

1. `"use client"` marks a module-graph boundary: every module a client file imports becomes client code. Placing it high poisons the whole subtree — place it at the leaf.
2. Layouts NEVER carry `"use client"`. A layout needing a client feature (theme, scroll state) wraps a client child instead.
3. Server components cannot be imported by client components — but they pass through untouched as `children`/props. This is the composition escape hatch; use it everywhere:

```tsx
// components/sections/features.tsx — server: data, text, images
import { Reveal } from "@/components/motion/reveal"
export function Features({ items }: { items: Feature[] }) {
  return <Reveal>{items.map(/* server-rendered content */)}</Reveal>
}

// components/motion/reveal.tsx — the client leaf
"use client"
import { motion } from "motion/react"
export function Reveal({ children }: { children: React.ReactNode }) { /* … */ }
```

4. Anything importing from `"motion/react"` is client — motion lives in thin wrappers under components/motion/; sections stay server and compose them.
5. Props crossing server→client must be serializable: no functions, no class instances. Never pass an event handler down across the boundary — pass a Server Action (ultraweb:server-actions).
6. `params` and `searchParams` are Promises in Next 16 — `await` them in pages, layouts, and generateMetadata:

```tsx
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
}
```

## Where state lives

| State | Home | Mechanism |
|---|---|---|
| Data from any source | Server | fetch/db call in the RSC — fetch is NOT cached by default; caching policy is ultraweb:data-fetching |
| Shareable UI state (tab, filter, page) | URL | `searchParams` (await it) + `<Link>` — survives refresh and sharing |
| Ephemeral UI (menu open, hover index) | Client leaf | `useState` in the leaf that renders it |
| Form/mutation state | Action | `useActionState` + `'use server'` action (ultraweb:server-actions) |
| Theme | One provider | next-themes client wrapper — the ONLY context in the root layout by default |
| Focus after client navigation | One client leaf in root layout | `usePathname()` effect moves focus to the page's `#main-heading` (`tabIndex={-1}`) — mounted once, never per-page |

No global state library (zustand, redux, jotai) unless the brief demands cross-page client state. A marketing site never does.

## Root layout pattern

layout.tsx stays server; providers are a client wrapper around children:

```tsx
// app/layout.tsx — server component, no directive
import { ThemeProvider } from "@/components/layout/providers"
import { FocusOnNavigate } from "@/components/layout/focus-on-navigate"
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <FocusOnNavigate />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

`components/layout/providers.tsx` is the `"use client"` file re-exporting next-themes' provider. Class-strategy dark mode also needs `@custom-variant dark (&:where(.dark, .dark *));` in globals.css — scaffold laid it.

**Focus on client navigation:** the browser resets focus only on full page loads. A client route change swaps the DOM while focus lingers on the now-removed link or falls to `<body>` — keyboard and screen-reader users are stranded at the old position with no announcement. One client leaf in the root layout fixes it for every route, never per page; each page's top heading carries `id="main-heading" tabIndex={-1}` as the landing target:

```tsx
// components/layout/focus-on-navigate.tsx — the client leaf; renders nothing, just moves focus
"use client"
import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"
export function FocusOnNavigate() {
  const pathname = usePathname()
  const first = useRef(true)
  useEffect(() => {
    if (first.current) { first.current = false; return } // skip first mount so a deep-linked #hash target keeps focus
    document.getElementById("main-heading")?.focus({ preventScroll: true })
  }, [pathname])
  return null
}
```

This is the focus half of accessible client navigation; ultraweb:page-transitions owns the aria-live announcer half, and ultraweb:gate-accessibility audits that focus actually lands on the heading after a route change.

**layout vs template:** layout persists across navigation — DOM and state preserved, no re-mount. `template.tsx` re-mounts per navigation; reach for it only when ultraweb:page-transitions needs per-route re-runs.

## File organization contract

Every component skill writes into this shape; deviating breaks downstream skills:

```
app/                       route files ONLY: page/layout/loading/error/not-found + globals.css
app/<route>/_components/   pieces used by exactly one route (private folder, not routable)
components/ui/             restyled shadcn primitives — client only when genuinely interactive
components/sections/       page sections — server by default, one section per file, kebab-case filename, PascalCase named export
components/layout/         header.tsx, footer.tsx, providers.tsx
components/motion/         thin "use client" motion wrappers (Reveal, Stagger…) that sections compose
lib/                       utils.ts (cn), fonts.ts (next/font instances)
```

Sections take data as props — pages fetch, sections render. Secrets (`process.env.*` without `NEXT_PUBLIC_`) are read in server files only.

## Anti-patterns

- `"use client"` in any `layout.tsx` — the single worst boundary placement; grep for it, treat a hit as a defect
- `"use client"` at the top of `page.tsx` "to be safe"
- `useEffect` + `fetch` for initial data — fetch in the RSC instead
- Importing a server component into a client file — pass it as `children`
- `useState` for tab/filter/pagination state a URL should carry
- `params.slug` or `searchParams.q` without `await` — they are Promises in Next 16
- Provider pyramid in the root layout — one theme provider; each additional context needs written justification
- Client navigation that never moves focus — keyboard/SR users stay stranded on the old page; the root-layout focus leaf must move focus to `#main-heading` after every route change
- Owning focus-on-navigate per page (an effect in each page.tsx) — it belongs to one leaf in the root layout, or pages fight each other
- Functions or event handlers passed across the server→client boundary
- `npm i zustand` / `npm i redux` on a marketing site

## Worked example — Tidepool, port-logistics SaaS boundary plan

design/SITEMAP.md part 2 lists six routes (`/`, `/product`, `/pricing`, `/docs`, `/changelog`, `/login`) and the hero's signature: a live berth timeline that streams updates.

The boundary plan (SITEMAP.md part 3) keeps every layout and page server; client leaves stay in the low teens:
- `components/hero/berth-timeline.tsx` (`"use client"`) — polls `/api/v1/berths` and animates the timeline; the RSC renders the static SVG fallback and passes the seed as a serializable prop, so first paint needs no JS.
- `components/pricing/billing-toggle.tsx` — monthly/annual lives in the URL (`?billing=annual`, awaited from `searchParams`), not `useState`, so a shared link lands on the annual view with Growth ($490/mo) still featured.
- `app/login/_components/login-form.tsx` (`"use client"`) — `useActionState` over a `'use server'` Better Auth sign-in action; no handler crosses the boundary.
- `components/layout/focus-on-navigate.tsx` (`"use client"`) — a `usePathname()` effect mounted once in the root layout; after a nav click from `/` to `/pricing` it moves focus to that page's `<h1 id="main-heading" tabIndex={-1}>` so a keyboard user isn't stranded on the old header link. The skip-first-mount guard keeps a deep-linked `/docs#webhooks` hash target focused.
- Theme: next-themes `defaultTheme="dark"` — the only context in the root layout (Precision Instrument is dark-first).

Rejected: making `app/pricing/page.tsx` a client component to own the toggle — it would drag the whole tier table into the bundle for one query param. The URL carries the state instead.

Handoff: SITEMAP.md part 3 is the contract ultraweb:navigation (header client leaf) and ultraweb:server-actions (the login action) build against; ultraweb:gate-performance later greps the tree against the low-teens count.

## Composes with

- ultraweb:scaffold — creates the tree this contract governs; run app-structure immediately after it
- ultraweb:routing — adds segment files (route groups, loading/error/not-found) under the same rules
- ultraweb:data-fetching — decides caching and streaming once fetches sit in the right server components
- ultraweb:server-actions — the mutation row of the state table
- ultraweb:micro-interactions — produces the components/motion leaves that sections compose
- ultraweb:gate-performance — audits `"use client"` creep against the low-teens target at Phase 11
- ultraweb:navigation — builds components/layout/header.tsx against this plan; its mobile-menu toggle is the canonical nav client leaf this skill assigns
- ultraweb:page-transitions — owns the app/template.tsx re-mount case this skill's layout-vs-template rule defers to, and the aria-live route announcer; app-structure owns the focus-reset half of the same accessible-navigation problem
- ultraweb:gate-accessibility — audits keyboard and screen-reader flows, including that focus lands on `#main-heading` after client navigation
- ultraweb:gate-code — greps every layout.tsx for `"use client"` and counts occurrences, empirically enforcing this skill's leaf-placement rule
