---
name: forms
description: Form UX and implementation for ultraweb builds — field anatomy with always-visible labels (never placeholder-as-label), validation timing (blur first, live after first error), error-recovery UX that never loses input, zod v4 schemas shared client/server, and useActionState wiring to server actions. Invoke in Phase 6 whenever the sitemap calls for any form — contact form, newsletter capture, waitlist, sign-in/sign-up, checkout fields, settings, or a multi-step wizard ("add a contact form", "email signup", "waitlist form", "the form feels broken"). Pairs with ultraweb:server-actions for the mutation side.
---

# forms — forms users actually finish

**Stage:** Phase 6 — Build - **Reads:** design/SYSTEM.md, design/SITEMAP.md, design/DIRECTION.md - **Writes:** components/forms/*, lib/schemas/*, wiring into app/actions/* (via ultraweb:server-actions)

## Standard

A first-grade form is one the user finishes on the first try and trusts on the second. Concretely: every field has a visible label and the correct `type`/`autocomplete`/`inputMode`; the form posts without JavaScript (`<form action={serverAction}>`); validation never scolds a pristine field; every error says how to fix it in human words; a failed submit loses ZERO user input; success is a designed moment, not a toast fired into the void. One zod schema is the single source of truth on both sides of the wire. shadcn inputs are primitives — restyle radius, border, and ring from `@theme` tokens (taste bans the untouched-shadcn look).

## Process

1. Read SYSTEM.md tokens and SITEMAP.md for each form's conversion goal. List the fields, then cut every field the goal doesn't strictly need — each deletion raises completion.
2. Write the zod v4 schema in `lib/schemas/<form>.ts` — one schema, imported by both the client component and the action.
3. Build the action per ultraweb:server-actions: `safeParse`, field-error map, echo values back.
4. Build fields from the anatomy spec below; assign `type`, `autocomplete`, `inputMode`, `name` (FormData reads `name` — a field without one silently vanishes).
5. Wire `useActionState`; add client blur validation with the same schema (`schema.shape.<field>.safeParse(value)`).
6. Design pending and success states. Verify the no-JS path: disable JavaScript, submit, confirm the action still runs.
7. Rehearse failure: submit invalid, confirm focus lands on the first invalid field, values survive, and the error clears the moment the field is fixed.

## Field anatomy

- Label ALWAYS visible, above the input: 13–14px, medium weight, 6–8px gap to the field. Placeholder is for a format example only ("you@company.com") and never repeats the label.
- Input: 44–48px tall, text ≥16px on mobile (below 16px iOS zooms the viewport), radius/border/focus-ring from tokens.
- Hint text (when needed) sits between label and input, muted; error text replaces or follows it below the field, 4–6px gap, icon + color + words — never color alone.
- Fields stack 20–24px apart; form column max 400–480px. Mark exceptions "(optional)" — a form where most fields need asterisks has too many fields.
- Right types: `type="email"`, `type="tel"` + `inputMode="tel"`, `inputMode="numeric"` for codes; `autocomplete` tokens: `name`, `email`, `tel`, `organization`, `postal-code`, `street-address`, `current-password`/`new-password`.

## Layout variants

1. **Stacked** — single column, labels above. The default for everything; single-column beats multi-column on completion. Only city/ZIP-grade pairs may share a row.
2. **Inline capture** — input + submit button in one row for newsletter/waitlist; collapses to stacked below 480px. Success replaces the row in place.
3. **Split contact** — form beside a context panel (address, response-time promise, alternative channels) on a contact page; stacks on mobile, form first.
4. **Wizard** — multi-step for 8+ fields or distinct topics: ≤5 fields per step, "Step 2 of 3" as text (not dots alone), back never loses data, per-step validation, review step before anything irreversible.

## Validation timing

Reward early, punish late:

1. Pristine field: never validate. No red while the user is still typing their first attempt.
2. First validation on blur.
3. After a field has errored once, re-validate on change — the error clears the instant it's fixed.
4. On submit: full-schema validation on BOTH sides. Client pass focuses the first invalid field; the server pass is the one that counts (client validation is UX, server validation is security — never skip it).

## Shared schema + wiring (zod v4, useActionState)

```ts
// lib/schemas/contact.ts — ONE schema, both sides import it
import { z } from "zod";
export const contactSchema = z.object({
  name: z.string().min(2, { error: "Enter your name" }),
  email: z.email({ error: "Enter an email like you@company.com" }),   // v4 top-level; z.string().email() is deprecated
  message: z.string().min(20, { error: "Tell us a bit more — at least 20 characters" }),
});
```

```ts
// app/actions/contact.ts
"use server";
import { contactSchema } from "@/lib/schemas/contact";
export type FormState = { status: "idle" | "error" | "success"; fieldErrors?: Record<string, string>; values?: Record<string, string> };

export async function submitContact(_prev: FormState, formData: FormData): Promise<FormState> {
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message; // first error per field; .flatten() is deprecated in v4
    return { status: "error", fieldErrors, values: raw };
  }
  // hand off: ultraweb:email (contact), ultraweb:database (persist)
  return { status: "success" };
}
```

Client: `const [state, formAction, pending] = useActionState(submitContact, { status: "idle" })` from `'react'`; `<form action={formAction}>` progressively enhances; `defaultValue={state.values?.email}` restores input after a server round-trip; `useFormStatus()` from `'react-dom'` only for submit buttons nested in child components.

## Error recovery

- Error copy states the fix in the field's own words — "Enter an email like you@company.com", never zod defaults or "Invalid input".
- Unknown/server failures go to ONE form-level banner ("Couldn't send — your message is still here. Try again.") with values intact; field errors stay at fields.
- On failed submit, move focus to the first invalid field; error containers get `role="alert"` (form-level) or are referenced via `aria-describedby` (field-level).
- Keep the submit button ENABLED. A disabled submit hides why the form won't go; clicking it is how users ask.
- Spam defense: honeypot field + server validation before any CAPTCHA — a contact form that interrogates humans loses more mail than it blocks.

## States

- Input: default, hover (border shifts one step), focus-visible (2px token ring, offset), filled, error (`aria-invalid`), disabled (reduced opacity, no hover), read-only.
- Submit: default → pending (`pending` from useActionState: spinner + "Sending…", width locked so nothing shifts, `disabled` DURING flight only).
- Success: replace the form (or the inline-capture row) with a designed confirmation; move focus to its heading. sonner toast only as a secondary echo, never the sole confirmation.

## A11y

- `<label htmlFor>` on every input — visible text, not aria-label substitutes. Radio/checkbox groups get `fieldset` + `legend`.
- Errors: `aria-invalid="true"` + `aria-describedby` pointing at the error id; announce form-level failures with `role="alert"`.
- `required` attribute mirrors the schema. Touch targets ≥44px. Never signal errors by color alone.
- Full keyboard path: tab order follows visual order; Enter submits from any single-line input (native implicit submission) while textareas keep Enter for newlines; wizard steps trap nothing.

## Anti-patterns

- `placeholder=` as the only label — grep inputs lacking a sibling `<label`
- `disabled={!isValid}` (or `!form.formState.isValid`) on the submit button
- onChange validation on pristine fields — red before the user finishes typing
- "Invalid input", "Something went wrong", `window.alert(` as error UX
- `e.preventDefault()` + `fetch(` in onSubmit where a server action serves — kills progressive enhancement
- Clearing fields on server error (missing `values` echo)
- Toast as the only surface for field-level errors
- Asterisks on every field; inputs without `name=`; client-only validation with a trusting server

## Composes with

- ultraweb:server-actions — owns the mutation side: 'use server' conventions, optimistic updates, error-as-data shape this wiring targets
- ultraweb:buttons — submit CTA hierarchy and loading state
- ultraweb:ui-states — success/error/empty surfaces beyond the form itself
- ultraweb:copywriting — labels, hints, and error voice in the brief's tone
- ultraweb:micro-interactions — focus ring and error-appear motion, 150–250ms
- ultraweb:email — where the contact payload lands (Resend: check `{ data, error }`, it never throws)
