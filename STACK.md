# STACK

The locked stack and the API facts a build gets wrong unprompted. Versions live only in `stack/versions.json`; this file carries no digits. If the manifest's `verified` date is older than 30 days, run `node <plugin>/scripts/verify-stack.mjs` before scaffolding. When this file and the installed package disagree, the installed package wins: Next ships its own current docs in `node_modules/next/dist/docs/` and `create-next-app` writes an `AGENTS.md` pointing there. Read the relevant page before writing code against a Next API.

Facts below were checked on 2026-11-23 against the bundled Next docs, the registry, package source or a real install and build. The 3D and anime.js facts are in `references/stack-3d.md`.

## What is chosen

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js, App Router, TypeScript strict | One verified path for routing, metadata, images, fonts, server code |
| Styling | Tailwind v4, CSS-first `@theme` tokens | Tokens live in one CSS file; no config file |
| Primitives | shadcn/ui, restyled | Owned source files, accessible behavior from Base UI |
| Animation | `motion` | One animation library. Specialist engines only when `design/DIRECTION.md` commissions them |
| Validation | zod | Shared schemas for forms and server actions |
| Icons | lucide-react | Matches shadcn's `iconLibrary` |
| Theming | next-themes | Class-based dark mode without a flash |
| Database | Drizzle + Neon (stable line) | Typed SQL, serverless driver |
| Auth | better-auth | Maintained, supports Next and Drizzle |
| Email | resend + react-email | Typed templates |
| Payments | stripe | Official SDK |
| Content | `@next/mdx` | No extra build step |
| Gates | playwright (devDependency) | `scripts/gates.mjs` resolves it from the project |

Not chosen: Contentlayer (unmaintained), next-auth (the v5 line never left beta; `latest` on npm is still v4), `framer-motion` as a package name (use `motion`), `shadcn-ui` (dead package name; the CLI is `shadcn`).

Rejected animation engines, argued once: GSAP, Theatre.js, react-spring and Rough Notation each duplicate what `motion` plus one commissioned specialist already cover, add a second source of truth for motion numbers, or both. GSAP's licensing is not the objection; its stock effects are the most copied on the web, which is a liability against the taste bar. Do not reopen this per build.

## Next.js

- **Init:** `npx create-next-app@<pin> <name> --yes` gives TypeScript, Tailwind, App Router, ESLint, the `@/*` alias, `AGENTS.md`, `LayoutProps<"/">` typed layouts. No `--turbopack` flag exists; Turbopack is the default for dev and build. Node 20.9 or newer.
- **`cacheComponents: true` and `partialPrefetching: true` are written into `next.config.ts` by `create-next-app` today.** Consequences: data access is dynamic by default; cache with the `'use cache'` directive plus `cacheLife('seconds'|'minutes'|'hours'|'days'|'weeks'|'max')` and `cacheTag()`. Request-time APIs (`cookies()`, `headers()`, `searchParams`) and uncached fetches must sit under a `<Suspense>` boundary or the build fails with a blocking-route error. Route segment configs `dynamic`, `revalidate`, `fetchCache` and `runtime` error; remove them. `new Date()`, `Math.random()` and `crypto.randomUUID()` during prerender fail the build; move them into a Suspense child after `connection()`, or into a Client Component. `instant = false` on a segment opts a route out of validation while you migrate.
- **`revalidateTag(tag, profile)`** takes a cache profile as the second argument. `updateTag` is for Server Actions. `revalidatePath` is unchanged.
- **`middleware.ts` is deprecated: use `proxy.ts`** exporting `proxy(request)`. Codemod: `npx @next/codemod@latest rename-middleware-to-proxy .`
- **`params` and `searchParams` are Promises.** `await` them in pages, layouts, `generateMetadata`, route handlers.
- **Parallel route slots need a `default.tsx`**, otherwise an error is returned on reload.
- **`next/image`:** `priority` is deprecated, use `preload`. `onLoadingComplete` is replaced by `onLoad`. Keep `fill` paired with `sizes`.
- **`next/font`:** `next/font/google` and `next/font/local` self-host at build time, with zero requests to Google at runtime. Variable fonts need no `weight`. Export instances from one file.
- **Metadata files:** `opengraph-image.tsx`, `sitemap.ts`, `robots.ts`, `manifest.ts`, `icon.tsx`. `ImageResponse` (from `next/og`) supports flexbox only; `display: grid` does not work. `global-not-found.tsx` is still marked experimental in the docs.
- **View transitions need no flag.** `experimental.viewTransition` was removed; `import { ViewTransition } from 'react'` works with the React version in the manifest, and `<Link transitionTypes={[...]}>` is supported. Treat as progressive enhancement: without browser support the page works and does not animate.
- **`next lint` is removed and `next build` no longer lints.** Run ESLint directly (`npm run lint` runs `eslint`).
- **Server Actions:** `'use server'` function `(prevState, formData)`; client side `useActionState` from `react`, `useFormStatus` from `react-dom`.
- **`@next/mdx`** needs a root `mdx-components.tsx` exporting `useMDXComponents`, and `pageExtensions` including `md` and `mdx`.

## Tailwind v4

- No `tailwind.config.js`. `@import "tailwindcss";` then tokens in `@theme { }`. Never `@tailwind base`, `theme.extend` or the HSL-triplet `hsl(var(--x))` pattern.
- `@theme` namespaces create utilities: `--color-*`, `--font-*`, `--text-*`, `--font-weight-*`, `--tracking-*`, `--leading-*`, `--breakpoint-*`, `--container-*`, `--spacing`, `--radius-*`, `--shadow-*`, `--ease-*`, `--animate-*`. A token that references another variable needs `@theme inline`.
- `dark:` follows the OS by default. For a class toggle add `@custom-variant dark (&:where(.dark, .dark *));` and wrap the app in next-themes' `ThemeProvider` with `attribute="class"`, `<html suppressHydrationWarning>`.
- OKLCH is the native color format. Container queries are in core (`@container`, `@sm:`, `@max-md:`).
- `create-next-app` also installs a Tailwind loader for Turbopack (`@tailwindcss/turbopack`, set in `next.config.ts`). Keep it on the same version as `tailwindcss`; the scaffold script does.

## shadcn/ui

- CLI: `npx shadcn@<pin> init`, then `add <component>`. Current default style is `base-nova`, built on Base UI (`@base-ui/react`), not Radix. Radix-era tutorials (`asChild`, `@radix-ui/*` imports) do not match the generated files; read the generated component before wiring it.
- `components.json` for Tailwind v4 has `"tailwind": { "config": "" }`, css pointing at `app/globals.css`, `"iconLibrary": "lucide"`.
- `init` rewrites `app/globals.css`: it adds `tw-animate-css` and `shadcn/tailwind.css` imports, its own `:root` and `.dark` OKLCH variables and a `@theme inline` bridge, replacing any token skeleton written earlier. Write the project's tokens after `init`, not before.
- `lib/utils.ts` re-exports `cn` from the `cn` package (shadcn's own replacement for clsx plus tailwind-merge). Do not add clsx or tailwind-merge alongside it.
- Components are plain function components, with no `forwardRef`, and carry `data-slot="..."` attributes; style sub-parts with `data-[slot=...]` selectors.
- Registry items exist for both a Base UI `toast` and `sonner`; choose one.

## motion

- Package `motion`; import from `"motion/react"`. Files using it need `"use client"`. `framer-motion` is the legacy name.
- Surface in use: `motion.*`, `AnimatePresence`, `useScroll`, `useSpring`, `useTransform`, `useReducedMotion`, `MotionConfig`, `layout`, `whileHover`/`whileTap`/`whileInView`. All exported by the pinned major (checked by import).
- Bundle control: `LazyMotion` with `domAnimation` (or `domMax` for drag and layout) and the `m` component; with `strict`, a plain `motion.*` throws. Reorder components load the full feature set and defeat `LazyMotion`. Size deltas for the current major are not measured here; measure in the bundle audit.
- A major version shipped after the first version of this stack was written. Everything above was re-checked against the pinned major; behavior beyond this list is unverified, so run the production build after any motion change.

## zod

- Error customization is `{ error: "Too short" }`; the `message` parameter still works but is deprecated (checked by running it).
- `z.strictObject()` and `z.looseObject()` replace `.strict()` and `.passthrough()`; the old methods still exist. Pre-2025 tutorial code is zod 3 style. Check that other packages' peer ranges accept the pinned major.

## Backend packages

- **Drizzle + Neon:** `drizzle({ client: neon(process.env.DATABASE_URL!) })` from `drizzle-orm/neon-http`. `drizzle.config.ts` uses `defineConfig({ schema, out, dialect: 'postgresql', dbCredentials: { url } })`; `dialect` is mandatory. Commands: `drizzle-kit generate`, `migrate`, `push`. The 1.0 release candidate is on a separate npm tag; the manifest pins the stable line. better-auth's peer range accepts both.
- **Resend** returns `{ data, error }` and does not throw on API errors; check `error`. The React Email component goes in the `react` property.
- **Stripe:** the webhook handler needs the raw body: `await req.text()` plus the `stripe-signature` header into `stripe.webhooks.constructEvent` (async variant exists). Omit `apiVersion`; the SDK pins its own. Create the client lazily so builds pass without the key.
- **better-auth** supports the pinned Next major and Drizzle per its peer ranges. Route protection that used middleware moves to `proxy.ts`.

## Platform CSS

Check current browser support before relying on any of these (caniuse or MDN); none is verified here. All are progressive enhancement: the unsupported state must already be a correct static layout.

- Scroll-driven animation (`animation-timeline: scroll()` / `view()`): wrap in `@supports (animation-timeline: view())`, never hide content behind it, always pair with `prefers-reduced-motion`.
- Anchor positioning, Popover API plus `@starting-style` for overlays; a modal needs `<dialog>.showModal()`, not `popover="manual"`.
- `:user-valid` / `:user-invalid`, `field-sizing: content`, `text-wrap: balance` and `pretty`, `content-visibility: auto` with `contain-intrinsic-size` (never on the LCP element), `@scope`, `text-box-trim`.
- Speculation Rules with moderate eagerness only.

## Analytics and compliance default

Cookieless EU-hosted analytics (Plausible, Fathom, or self-hosted Umami). Google Analytics or any non-essential tracking loads only after consent. See `references/legal-dach.md`.
