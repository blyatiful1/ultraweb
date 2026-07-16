---
name: api-design
description: Design and build the site's HTTP API surface — Next.js route handlers with typed Response.json, zod v4 validation at every boundary, one consistent error envelope (stable code + human message), strict status-code discipline, and the decision rule for when server actions beat API routes (internal mutations) and when routes win (external consumers, webhooks, non-browser clients). Invoke during the backend phase whenever the brief needs HTTP endpoints or the user says "API", "endpoint", "REST", "route handler", "webhook", or "expose the data". For the site's own forms mutating its own data, use ultraweb:server-actions instead.
---

# api-design — boring contracts, typed boundaries

**Stage:** Phase 7 (Backend) - **Reads:** design/BRIEF.md, db/schema.ts (when database ran) - **Writes:** app/api/**/route.ts, lib/api.ts

## Standard

A first-grade API is boring to consume: every response typed, every error the same shape, every status code meaning what RFC 9110 says. A consumer could write their client from three example responses. Every route traces to a line in BRIEF.md — zero endpoints "just in case".

## First decision: route handler or not

| Consumer | Tool |
|---|---|
| Your own forms/buttons mutating your data | Server action (`ultraweb:server-actions`) — typed end-to-end, progressive enhancement, no public surface |
| External services calling in (Stripe/Resend webhooks) | Route handler — they need a URL |
| Non-browser clients (mobile app, partner, CLI) | Route handler — they need HTTP |
| Client components fetching on interaction (typeahead, infinite scroll) | Route handler `GET` |
| An RSC that needs data | Neither — query the database directly (`ultraweb:data-fetching`) |

Default: server actions for mutations, direct queries for reads. Route handlers only where HTTP itself is the requirement.

## Process

1. List every endpoint BRIEF.md demands: method, path, auth requirement, request/response shape. Empty list → this skill doesn't run.
2. Create `lib/api.ts` with the envelope helpers below. Every handler imports it — no handler invents its own error shape.
3. Define zod v4 schemas per endpoint (in the route file; `lib/validators.ts` when shared with a server action). Validate everything that crosses the boundary: body, searchParams, dynamic params.
4. Write handlers. `await params` — dynamic segments are Promises in Next 16.
5. Auth-gate protected routes first thing in the handler (session via `ultraweb:auth`); return 401 before doing any work.
6. Exercise every endpoint with curl: happy path, invalid body, missing auth. Three real responses per endpoint, recorded, before calling it done.

## The envelope

Success returns the resource directly. Failure returns ONE shape, always:

```ts
// lib/api.ts
export type ApiError = { error: { code: string; message: string } };

export function apiError(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } } satisfies ApiError, { status });
}
```

`code` is a stable machine string (`validation_failed`, `unauthorized`, `not_found`, `conflict`, `rate_limited`, `internal`); `message` is written for humans in the site's voice. Never leak stack traces, zod issue arrays, or SQL into `message`.

## A worked handler

```ts
// app/api/posts/[id]/route.ts
import { z } from "zod";
import { apiError } from "@/lib/api";
import { auth } from "@/lib/auth";

const patchSchema = z.object({
  title: z.string().min(3, { error: "Title needs at least 3 characters" }).optional(),
  published: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return apiError(401, "unauthorized", "Sign in required.");

  const { id } = await params;
  const json = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success)
    return apiError(400, "validation_failed", parsed.error.issues[0].message);

  const post = await updatePost(id, parsed.data, session.user.id);
  if (!post) return apiError(404, "not_found", "Post not found.");

  return Response.json(post satisfies Post);
}
```

Load-bearing details: zod v4 customizes errors with `{ error: "..." }` — the `message` param is deprecated. `.catch(() => null)` on `req.json()` turns malformed JSON into a clean 400 instead of a 500. `satisfies` types the response at compile time with zero runtime cost.

## Status codes

- **200** read/update ok · **201** created (return the created resource) · **204** deleted (empty body)
- **400** validation failed or malformed JSON · **401** no valid session · **403** valid session, forbidden resource · **404** absent (also for resources the caller must not learn exist) · **409** uniqueness/state conflict · **429** rate limited, with `Retry-After` header
- **500** only for genuine bugs. Wrap handler bodies so an unexpected throw returns `apiError(500, "internal", ...)` — never Next's default error page as an API response.
- Never 200-with-error-body. Never 500 for bad input.

## Rate-limit hook points

Every public unauthenticated POST (contact, newsletter, sign-up) gets a rate-limit check before parsing. Ship the seam even as a stub — an early `checkRateLimit(ip)` in `lib/api.ts` returning 429. Which limiter backs it: verify against current docs first; STACK.md pins none.

## Anti-patterns

- `middleware.ts` — Next 16 renamed it `proxy.ts`; and proxy checks are optimistic, never API authorization
- `success: false`, `{ err:`, `{ errorMessage:` — a second error shape anywhere
- `NextApiRequest`, `res.status(` — Pages Router relics; handlers speak Web `Request`/`Response`
- `params.id` without `await` — params are Promises
- `parsed.error.message` sent raw to clients — zod's aggregate string is an internal artifact
- `fetch("/api/` from an RSC in the same app — self-HTTP round trip; call the query function directly
- `app/api/[...slug]` catch-all re-implementing Express inside Next

## Composes with

- **ultraweb:server-actions** — the default for internal mutations; this skill covers what actions can't
- **ultraweb:auth** — session checks inside handlers, 401/403 semantics
- **ultraweb:database** — handlers call the Drizzle query layer, never inline SQL
- **ultraweb:payments** — the Stripe webhook is a route handler with its own raw-body + signature rules
- **ultraweb:data-fetching** — RSC reads skip HTTP entirely; consult before adding any GET endpoint
