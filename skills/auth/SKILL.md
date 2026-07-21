---
name: auth
description: Authentication with Better Auth 1.6, the locked stack default (Auth.js/NextAuth is maintenance-mode legacy) — server config with the Drizzle adapter, CLI-generated schema, client hooks, optimistic route protection in proxy.ts (Next 16, never middleware.ts), authoritative session checks in RSC and in every mutation, and a sign-in page styled to the design system, never the default unstyled form. Invoke during the backend phase whenever the brief needs accounts, protected pages, or roles, or the user says "auth", "login", "sign in", "sign up", "sessions", "protected routes", or "user accounts".
---

# auth — Better Auth, designed sign-in

**Stage:** Phase 7 (Backend) - **Reads:** design/BRIEF.md, design/SYSTEM.md, design/DIRECTION.md, db/schema.ts - **Writes:** lib/auth.ts, lib/auth-client.ts, app/api/auth/[...all]/route.ts, proxy.ts, app/(auth)/* pages

## Standard

Invisible when it works, designed when it shows. Sessions are verified on the server where the data lives — proxy redirects are UX, not security. The sign-in page consumes SYSTEM.md tokens and gets hero-level craft: it is often the second impression the site makes. Better Auth 1.6 without discussion; NextAuth requires written justification.

## Default and legacy

**Better Auth 1.6 is the default for every new build.** Auth.js/NextAuth entered maintenance mode 2025-09-22 — the Better Auth team maintains it for security patches only and recommends Better Auth for greenfield. NextAuth v5 never left beta (5.0.0-beta.31).

NextAuth v5 beta remains acceptable in exactly two cases: the project already runs it and this is an iteration, or the brief hard-requires a provider/adapter that exists only in the Auth.js ecosystem. Then use the legacy pattern — `auth.ts` exporting `const { auth, handlers } = NextAuth({...})`, `app/api/auth/[...nextauth]/route.ts` re-exporting `handlers`, `proxy.ts` re-exporting `auth` — and record the deviation plus reason in BRIEF.md.

## Process

1. Read BRIEF.md: which pages are protected, which sign-in methods (email+password? Google? magic link → `ultraweb:email`), whether roles exist. No auth requirement → stop. Never bolt accounts onto a brochure site.
2. `npm i better-auth`. `BETTER_AUTH_SECRET` + `BETTER_AUTH_URL` into `.env`. Server config in `lib/auth.ts` (below).
3. `npx @better-auth/cli generate` — emits the Drizzle auth tables (user, session, account, verification). Merge into `db/schema.ts` and migrate through `ultraweb:database`: one schema, one migration history.
4. Mount the handler and create the client (below).
5. Protect in layers: proxy.ts cookie check for redirect UX, server-side session check where protected data renders, and a session re-check inside every mutating server action and route handler. All three, always.
6. Build sign-in/sign-up as designed pages (rule below). Then verify the loop empirically: sign up → sign out → hit a protected page (must redirect) → sign in (must land back).

## Server config, handler, client

```ts
// lib/auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: { enabled: true },
  // socialProviders: only what BRIEF.md names — each one is env vars + a provider console to maintain
  plugins: [nextCookies()], // keep last: lets server actions set session cookies
});
```

```ts
// app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

```ts
// lib/auth-client.ts
import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient();
// client components: authClient.useSession(), authClient.signIn.email({ email, password }), authClient.signOut()
```

Better Auth's adapter and plugin import paths evolve — the shapes above are the 1.6 line; verify against current docs at build time.

## Route protection: two layers, never one

`middleware.ts` is deprecated in Next 16 — the file is `proxy.ts`, Node runtime. The proxy layer is OPTIMISTIC: cookie presence only, no DB hit, pure redirect UX.

```ts
// proxy.ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*", "/settings/:path*"] };
```

The AUTHORITATIVE check lives where protected data renders:

```tsx
// app/dashboard/page.tsx (RSC)
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  // session.user.id drives every query below
}
```

Every mutating server action and route handler re-checks the session itself — a forged request never meets proxy.ts, and a page-level check doesn't cover it.

## The sign-in page rule

The default unstyled form is banned — same severity as lorem ipsum. The sign-in page:

- Consumes SYSTEM.md tokens: type scale, accent, radius/shadow language, both themes designed.
- Picks a layout variant to match DIRECTION.md: **centered card** (SaaS default), **split-screen** with a brand panel that carries the signature move, or **minimal full-page** type-led form (editorial directions).
- Full states: focus-visible rings in the palette, inline zod validation on `ultraweb:forms` timing, submit button with loading state, error copy in the site voice ("That email and password don't match." — never "Invalid credentials error").
- Social buttons follow provider brand rules but sit inside your radius and spacing system.

## Anti-patterns

- `middleware.ts` — deprecated; the file is `proxy.ts`
- `auth.api.getSession` inside proxy.ts — a DB hit on every matched request; cookie check only there
- Protection ONLY in proxy.ts — an optimistic redirect is not authorization; any mutation without its own check is an open door
- Default unstyled sign-in form; untouched shadcn card presented as "the auth page"
- `npm i next-auth` on greenfield without the written justification in BRIEF.md
- Hand-rolled password hashing or session tokens
- `session?.user` from a client hook trusted for anything security-relevant — client session state is display data

## Worked example — Tidepool, gating the port-analytics app shell

BRIEF.md: "Marketing routes (`/`, `/product`, `/pricing`, `/docs`) stay public; the `/dashboard` app shell needs an account. Growth-tier accounts sign in with email+password, Fleet accounts require OIDC SSO." No roles beyond signed-in access.

Config keeps both paths in one place, cookie plugin last so server actions can set the session:

```ts
// lib/auth.ts
export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: { enabled: true },
  plugins: [sso(), nextCookies()], // sso() → OIDC for Fleet; nextCookies stays last
});
```

proxy.ts matches `["/dashboard/:path*"]` on cookie presence only, redirecting to `/login`; the authoritative `auth.api.getSession` re-runs inside every `/api/v1/*` handler that returns berth data. The `/login` page is split-screen: the left panel runs the static berth-timeline SVG (the signature move) on dark surface `oklch(0.18 0.015 250)`, the right is a General Sans form with teal `oklch(0.68 0.12 200)` focus rings and JetBrains Mono on the account-ID field; error copy reads "That email and password don't match." — never "Invalid credentials".

Rejected Google/GitHub social buttons: Tidepool's buyers are shipping-line ops teams behind corporate identity providers, so the OIDC SSO path replaces consumer logins entirely rather than sitting beside them.

Handoff: the CLI-generated user/session/account/verification tables land in db/schema.ts and migrate through ultraweb:database; the login form's field layout and validation timing come from ultraweb:forms.

## Composes with

- **ultraweb:database** — the Drizzle adapter; CLI-generated tables merge into the one schema and migrate there
- **ultraweb:forms** — sign-in/sign-up field design, validation timing, error recovery
- **ultraweb:email** — verification and magic-link mail through Resend
- **ultraweb:server-actions** — every mutation re-checks the session; `nextCookies()` makes cookie-setting actions work
- **ultraweb:ui-states** — signed-out, loading, and error states on every auth-aware surface
- **ultraweb:brief** — reads which pages are protected, which sign-in methods the site needs, and whether roles exist; a BRIEF.md with no auth requirement is the signal to stop, never bolt accounts onto a brochure site
- **ultraweb:api-design** — every route handler it defines under /api/v1/* re-checks the session with `auth.api.getSession`; the optimistic proxy.ts redirect never reaches a forged API request
