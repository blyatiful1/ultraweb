## Composes with

- **ultraweb:forms** — designs the fields, labels, and inline-error placement that this state shape feeds.
- **ultraweb:data-fetching** — `revalidateTag(tag, profile)` here invalidates the cache tags defined there; share one tag-name map.
- **ultraweb:database** — Drizzle writes inside actions; schema constraints are the last validation line behind zod.
- **ultraweb:email** — contact and magic-link actions call Resend; check its `{ data, error }` return explicitly, it does not throw.
- **ultraweb:ui-states** — pending, success, and error surfaces the wiring renders.
- **ultraweb:gate-code** — type-checks action signatures and state shapes; run after wiring each form.
- **ultraweb:auth** — sign-in and sign-up submits are server actions built on this pattern; an auth denial returns `{ ok: false, errors: { form } }` here, never a thrown 500.
- **ultraweb:api-design** — the action-vs-route-handler boundary: first-party form mutations stay server actions here, while webhooks and third-party callers go to route handlers there.
- **ultraweb:payments** — Stripe checkout and subscription mutations run as actions but never optimistic (irreversible); payments owns the raw-body webhook that finalizes what the action starts.
- **ultraweb:storage** — file-upload form submits are actions too; storage owns the blob write and hands back the URL the action then persists.
