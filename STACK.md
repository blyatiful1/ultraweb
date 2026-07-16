# STACK.md — verified stack facts

Verified against live npm registry + official docs on **2026-07-16**. Every ultraweb skill's code advice must match this file. Versions drift: `scaffold` re-verifies at build time (`npm view <pkg> version`); when this file and reality disagree, reality wins — then update this file.

## Versions (npm `latest`, 2026-07-16)

next 16.2.10 · react/react-dom 19.2.7 (create-next-app pins 19.2.4) · tailwindcss 4.3.2 · shadcn CLI 4.13.0 · lucide-react 1.24.0 · next-themes 0.4.6 · motion 12.42.2 · zod 4.4.3 · drizzle-orm 0.45.2 (v1.0.0-rc.4 on `rc` — official docs install `@rc`) · drizzle-kit 0.31.10 · @neondatabase/serverless 1.1.0 · better-auth 1.6.23 · next-auth 4.24.14 latest / 5.0.0-beta.31 (never left beta) · resend 6.17.2 · react-email 6.9.0 · @react-email/components 1.0.12 · stripe 22.3.2 · @next/mdx 16.2.10 (version-locked to next) · content-collections 0.15.2 · velite 0.4.0

## Next.js 16 — the facts

- **Init:** `npx create-next-app@latest my-app --yes` → TS, Tailwind, App Router, ESLint, `@/*` alias, Turbopack, AGENTS.md. There is **no `--turbopack` flag** — Turbopack is the default bundler for dev AND build. `next.config.ts` fully supported.
- **`middleware.ts` is deprecated → `proxy.ts`** exporting `proxy(request)` (Node runtime). Codemod: `npx @next/codemod@latest rename-middleware-to-proxy .`
- **`params`/`searchParams` are Promises** — always `await` them (pages, layouts, generateMetadata).
- **Parallel route slots REQUIRE `default.tsx`** — build fails without it.
- **Caching:** `fetch` is NOT cached by default. Current model = Cache Components: top-level `cacheComponents: true` in next.config → enables `'use cache'` directive + `cacheLife('seconds'|'minutes'|'hours'|'days'|'weeks'|'max')` + `cacheTag()` from `next/cache`. PPR comes via `cacheComponents`, not `experimental.ppr` (removed). `revalidateTag(tag, profile)` now takes a cacheLife profile second arg; `revalidatePath()` unchanged.
- **Server Actions (stable):** `'use server'` action `(prevState, formData)`; client: `const [state, formAction, pending] = useActionState(action, initial)` from `'react'`; `useFormStatus()` from `'react-dom'`; `<form action={formAction}>` progressively enhances.
- **Metadata:** `generateMetadata({params}, parent)` (await params); file conventions all current: `opengraph-image.tsx` (export alt/size/contentType, default async fn returning `ImageResponse` from `next/og` — flexbox only, no grid, 1200×630 default), `sitemap.ts`, `robots.ts`, `manifest.ts`, `icon.tsx`. New `global-not-found.tsx` for app-wide 404.
- **next/image:** `priority` is DEPRECATED → use `preload`; `onLoadingComplete` → `onLoad`. Keep `fill` + `sizes` pairing, `placeholder="blur"`.
- **next/font:** `next/font/google` + `next/font/local`, auto self-hosted (zero Google requests), variable fonts need no weight; central `styles/fonts.ts` or `lib/fonts.ts` exporting instances.
- **View Transitions:** still experimental — `experimental.viewTransition: true`, then `import { ViewTransition } from 'react'`; `<Link transitionTypes={[...]}>` supported. Treat as progressive enhancement only.
- **Removed in 16:** `next lint` command (use ESLint CLI directly), `eslint`/`amp` config options.

## Tailwind CSS 4.3 — the facts

- **No `tailwind.config.js`.** CSS-first: `@import "tailwindcss";` then tokens in `@theme { }`. Never write `@tailwind base/components/utilities` or `theme.extend` — v3 relics.
- **`@theme` namespaces → utilities:** `--color-*`→bg/text/border-*, `--font-*`→font-*, `--text-*`→text-* sizes, `--spacing` (single multiplier, default 0.25rem), `--radius-*`, `--shadow-*`, `--ease-*`→ease-*, `--animate-*`→animate-* (keyframes may live inside `@theme`), `--breakpoint-*`, `--container-*`, `--tracking-*`, `--leading-*`.
- **`@theme inline { --color-background: var(--background); }`** — use `inline` whenever a token references another CSS variable (the shadcn bridge pattern).
- **Dark mode:** `dark:` is media-query-based BY DEFAULT. For class strategy add `@custom-variant dark (&:where(.dark, .dark *));` + next-themes: `<html suppressHydrationWarning>` + `<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>` (client wrapper).
- **OKLCH is the native color format** — default palette and all custom tokens: `--color-accent: oklch(0.72 0.11 178)`.
- **Container queries in core** — `@container`, `@sm:`, `@max-md:`, named containers. No plugin.

## shadcn/ui CLI 4 — the facts

- `npx shadcn@latest init` / `add <component>` (the package `shadcn-ui` is long dead). Current default style lineage: "default" → deprecated (Feb 2025) → "new-york" → docs now show "base-nova"; `init` flags: `-t next`, `-b base|radix`, `--css-variables` (default true), `--rtl`.
- components.json for Tailwind v4: `"tailwind": { "config": "" }` (blank), css points at globals.css, `"iconLibrary": "lucide"`.
- React 19: **no `forwardRef`**; every primitive has `data-slot="..."` — target sub-parts via `data-[slot=...]`/`[&_[data-slot=...]]`.
- Theme tokens are FULL oklch values in `:root`/`.dark` bridged via `@theme inline` — never the legacy bare-HSL-triplet + `hsl(var(--x))` pattern.
- `toast` deprecated → **sonner**.

## Motion 12 (motion.dev) — the facts

- Package `motion`, import `from "motion/react"` (`framer-motion` = legacy alias, same versions). Any file using it needs `"use client"`.
- APIs: `motion.div`, `AnimatePresence`, `useScroll` (→ scrollYProgress motion value), `useSpring`, `useTransform`, `layout` prop, `whileHover/whileTap/whileInView`.
- Bundle discipline: `import { LazyMotion, domAnimation, m } from "motion/react"`; wrap once, use `m.div`. `domAnimation` (+15kb) = variants/exit/hover/tap; `domMax` (+25kb) adds drag + layout animations. With LazyMotion strict, `motion.` components throw — use `m.`.

## Backend — the facts

- **Auth: Better Auth 1.6.23 is the default for new projects.** Auth.js/NextAuth entered maintenance mode 2025-09-22 (Better Auth team maintains it, security patches only; they officially recommend Better Auth for greenfield). NextAuth v5 never left beta. Legacy NextAuth v5 pattern if ever needed: `auth.ts` → `export const { auth, handlers } = NextAuth({...})`, route `app/api/auth/[...nextauth]/route.ts` re-exporting handlers, `proxy.ts` re-exporting `auth`.
- **Drizzle + Neon:** `import { neon } from '@neondatabase/serverless'; import { drizzle } from 'drizzle-orm/neon-http'; const db = drizzle({ client: neon(process.env.DATABASE_URL!) })`. `drizzle.config.ts`: `defineConfig({ schema, out, dialect: 'postgresql', dbCredentials: { url } })` — `dialect` mandatory; commands are `drizzle-kit generate` / `migrate` / `push` (old `generate:pg` is dead). npm latest 0.45.x vs docs installing `@rc` (1.0-rc) — pin deliberately, note the choice.
- **Zod 4:** error customization is `{ error: "Too short" }` — the `message` param is deprecated. `.strict()`/`.passthrough()` → `z.strictObject()`/`z.looseObject()`. Pre-2025 tutorial code is v3-flavored. Check ecosystem peerDeps accept zod ^4.
- **Resend 6:** returns `{ data, error }` — NO throw on API errors, check `error` explicitly. React Email component goes in the `react` property. Templates from `@react-email/components`; `react-email` dev server for preview.
- **Stripe 22:** webhook route handler MUST use raw body: `const body = await req.text()` + `req.headers.get('stripe-signature')` → `stripe.webhooks.constructEvent(body, sig, secret)`. Omit `apiVersion` to use the SDK's pinned version. Lazy-instantiate the client so builds don't fail without the key.
- **Content:** Contentlayer is DEAD — never recommend it. Options: plain `@next/mdx` (requires root `mdx-components.tsx` exporting `useMDXComponents` — forgetting it is the #1 setup error; `pageExtensions` must include md/mdx), **content-collections**, or **velite** for typed content collections.

## Unverified (do not assert)

Minimum Node version for Next 16 · `updateTag`/`refresh` cache APIs · `tw-animate-css` as shadcn's scaffolded animation lib · exact lucide dynamic-import subpath for web.
