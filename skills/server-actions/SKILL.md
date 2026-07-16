---
name: server-actions
description: Mutations for a Next.js 16 site — 'use server' actions validated with zod v4 (the { error } param, message is deprecated), useActionState form wiring per the stable React 19 signature, errors returned as data instead of thrown, optimistic UI with useOptimistic for low-stakes mutations, and a mandatory progressive-enhancement test (the form must work with JavaScript disabled). Invoke during the backend phase when wiring any form submit or write — contact form, newsletter signup, CRUD, settings save, like/toggle — when a form throws opaque errors instead of showing field messages, or when a mutation goes through a client fetch to an API route. Trigger phrases — "wire up the form", "handle the submit", "server action", "form validation", "contact form backend", "optimistic update", "the form errors are ugly".
---

# server-actions — mutations that survive no-JS

**Stage:** Phase 7 — Backend - **Reads:** design/BRIEF.md, form components from ultraweb:forms - **Writes:** app/actions/*.ts, form wiring in components

## Standard

- Every mutation is a `'use server'` action with zod v4 validation at the boundary. Client-side validation is UX polish; the action re-validates everything — the client is never trusted.
- Expected failures (invalid input, duplicate email, auth denial) travel as **return values**, never throws. A throw becomes an opaque digest error in production; returned state renders the field-level messages `forms` designed.
- The form works with JS disabled: `<form action={formAction}>` submits natively, the server validates, the page re-renders with state. JS adds pending and optimistic polish — it never creates the feature.
- Every successful write ends in `revalidateTag`/`revalidatePath` or `redirect()`. A mutation the UI doesn't reflect is a bug, not a caching quirk.

## The canonical action

```ts
// app/actions/contact.ts
'use server'
import { z } from 'zod'

const schema = z.object({
  email: z.email({ error: 'Enter a valid email address' }),          // zod v4: { error }, not { message }
  message: z.string().min(10, { error: 'Tell us a little more' }),
})

export type ContactState = {
  ok: boolean
  errors?: Record<string, string[]>   // field keys + 'form' for form-level failures
}

export async function sendContact(prev: ContactState, formData: FormData): Promise<ContactState> {
  const parsed = schema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { ok: false, errors: z.flattenError(parsed.error).fieldErrors }
  try {
    // deliverMessage propagates Resend's { data, error } — API failures come back as error, they do NOT throw
    const { error } = await deliverMessage(parsed.data)
    if (error) return { ok: false, errors: { form: ['Something went wrong — please try again.'] } }
  } catch {
    // genuinely unexpected throw only (network down, bug) — never a Resend API error
    return { ok: false, errors: { form: ['Something went wrong — please try again.'] } }
  }
  return { ok: true }
}
```

Client wiring — signature per React 19 stable:

```tsx
'use client'
import { useActionState } from 'react'          // useActionState is from 'react'
import { useFormStatus } from 'react-dom'       // useFormStatus is from 'react-dom'
import { sendContact } from '@/app/actions/contact'

const [state, formAction, pending] = useActionState(sendContact, { ok: false })
// <form action={formAction}> ... progressively enhances
```

- `pending` from `useActionState` covers the whole form. `useFormStatus()` belongs inside a shared submit-button component that can't see the tuple.
- Disable the submit and show its loading state (per `buttons`) while `pending` — never let a double-submit through.

## Errors as data

- One state shape per project: `{ ok, errors?: fieldErrors + 'form' key }`. `forms` renders field errors inline at the field, form-level errors as a banner above the actions row.
- Throws are for bugs; expected failures are UI states. Auth denial returns `{ ok: false, errors: { form: [...] } }`, not a 500.
- `redirect()` after success where the flow moves on — call it **outside** try/catch (it works by throwing internally; a catch block swallows the navigation).
- Never put secrets, raw DB rows, or stack traces in returned state — it serializes to the client.

## Optimistic UI

```tsx
const [optimisticItems, addOptimistic] = useOptimistic(items, (state, next: Item) => [...state, next])
// inside the form action: addOptimistic(draft); await createItem(formData)
```

- `useOptimistic` from `'react'`. React reconciles to server truth when the action settles — a failed action snaps back, so pair it with a visible error state, not silence.
- Use only for high-frequency, low-stakes mutations: likes, toggles, adding a list item. Payments, deletions, anything irreversible show an honest pending state — optimistic success on a destructive action is a lie to the user.

## Progressive enhancement test — mandatory before green

1. Dev server running; disable JavaScript (browser DevTools, or a Playwright context with JS off).
2. Submit the form empty → server-rendered validation errors appear in place.
3. Submit valid input → success state or redirect happens.
4. Any step failing means the form depends on client handlers — rewire to `<form action={formAction}>`. Record the result in `design/QA.md`.

## Anti-patterns

- `onSubmit={` + `preventDefault()` driving a mutation — greppable pair; kills progressive enhancement.
- `throw new Error('Invalid` inside an action — expected failure as a throw; return it as state.
- zod `{ message: '` — deprecated v3 param; greppable; use `{ error: '...' }`.
- Client `fetch('/api/` for a first-party form mutation — actions exist for exactly this.
- An action that writes but never calls `revalidateTag`/`revalidatePath`/`redirect` — stale UI after every submit.
- `import { useActionState } from 'react-dom'` — wrong package; it's `'react'` (`useFormStatus` is the `'react-dom'` one).
- `redirect()` inside try/catch — the catch eats the navigation.
- Generic "An error occurred" as the only failure copy — `copywriting` owns error voice; every failure message says what to do next.

## Composes with

- **ultraweb:forms** — designs the fields, labels, and inline-error placement that this state shape feeds.
- **ultraweb:data-fetching** — `revalidateTag(tag, profile)` here invalidates the cache tags defined there; share one tag-name map.
- **ultraweb:database** — Drizzle writes inside actions; schema constraints are the last validation line behind zod.
- **ultraweb:email** — contact and magic-link actions call Resend; check its `{ data, error }` return explicitly, it does not throw.
- **ultraweb:ui-states** — pending, success, and error surfaces the wiring renders.
- **ultraweb:gate-code** — type-checks action signatures and state shapes; run after wiring each form.
