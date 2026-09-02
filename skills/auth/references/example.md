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

`sso()` comes from `@better-auth/sso`, a separate install alongside `better-auth`; the Fleet OIDC provider is registered through that plugin — `sso()` in the config above plus its provider registration — and `npx auth@latest generate` regenerates the schema with the SSO tables beside the core four.

proxy.ts matches `["/dashboard/:path*"]` on cookie presence only, redirecting to `/login`; the authoritative `auth.api.getSession` re-runs inside every `/api/v1/*` handler that returns berth data. The `/login` page is split-screen: the left panel runs the static berth-timeline SVG (the signature move) on dark surface `oklch(0.18 0.015 250)`, the right is a General Sans form with teal `oklch(0.68 0.12 200)` focus rings and JetBrains Mono on the account-ID field; error copy reads "That email and password don't match." — never "Invalid credentials".

Rejected Google/GitHub social buttons: Tidepool's buyers are shipping-line ops teams behind corporate identity providers, so the OIDC SSO path replaces consumer logins entirely rather than sitting beside them.

Handoff: the CLI-generated user/session/account/verification tables land in db/schema.ts and migrate through ultraweb:database; the login form's field layout and validation timing come from ultraweb:forms.
