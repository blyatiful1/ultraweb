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
- Textarea grows with its text natively: `field-sizing: content` (Baseline 2026 — Chrome/Edge, Safari 26.2, Firefox 152) replaces every ResizeObserver/auto-height hook. Clamp it — `min-height: 3lh; max-height: 12lh; overflow-y: auto` — so a pasted essay can't shove the submit button off-screen.
- Styled `<select>`: `appearance: base-select` on the select *and* its `::picker(select)` opts into the customizable rendering, so the listbox finally carries the site's radius, tinted shadow, and richer options (an icon, a two-line label) while the browser keeps owning keyboard, typeahead, and the mobile picker. **Chrome/Edge only as of 2026-07** — style the plain native select first, put the base-select rules behind `@supports (appearance: base-select)`, and never let information live only inside the styled picker. Enhancement over the fallback, never a dependency; a genuine `aria-activedescendant` combobox still escalates per `ultraweb:overlays`.
- Hint text (when needed) sits between label and input, muted; error text replaces or follows it below the field, 4–6px gap, icon + color + words — never color alone.
- Fields stack 20–24px apart; form column max 400–480px. Mark exceptions "(optional)" — a form where most fields need asterisks has too many fields.
- Right types: `type="email"`, `type="tel"` + `inputMode="tel"`, `inputMode="numeric"` for codes; `autocomplete` tokens: `name`, `email`, `tel`, `organization`, `postal-code`, `street-address`, `current-password`/`new-password`.

## Layout variants

1. **Stacked** — single column, labels above. The default for everything; single-column beats multi-column on completion. Only city/ZIP-grade pairs may share a row.
2. **Inline capture** — input + submit button in one row for newsletter/waitlist; collapses to stacked below 480px. Success replaces the row in place.
3. **Split contact** — form beside a context panel (address, response-time promise, alternative channels) on a contact page; stacks on mobile, form first.
4. **Wizard** — multi-step for 8+ fields or distinct topics: ≤5 fields per step, "Step 2 of 3" as text (not dots alone), back never loses data, per-step validation, review step before anything irreversible.

## DACH checkout

Localizing a checkout is re-ordering it to the market's conventions, not translating labels — a US-shaped address block or a card-first payment row reads as a trust failure no visual polish repairs.

- Address as two rows, never a US-style stack: `Straße` + `Hausnummer` on the first row, `PLZ` + `Ort` on the second — PLZ before Ort, always (`PLZ` = `autocomplete="postal-code"`, `Ort` = `address-level2`, Straße = `address-line1`). Country picker defaults to Deutschland / Österreich / Schweiz.
- Payment methods ordered by DACH trust, never card-first: Klarna → PayPal → SEPA-Lastschrift → Kauf auf Rechnung → Kreditkarte. Keep Kauf auf Rechnung always visible, never behind a "weitere Optionen" fold (Otto, Zalando, dm precedent).
- forms owns field order and payment-method priority only — ultraweb:i18n owns locale switching, ultraweb:payments wires the provider.

## Validation timing

Reward early, punish late:

1. Pristine field: never validate. No red while the user is still typing their first attempt.
2. First validation on blur.
3. After a field has errored once, re-validate on change — the error clears the instant it's fixed.
4. On submit: full-schema validation on BOTH sides. Client pass focuses the first invalid field; the server pass is the one that counts (client validation is UX, server validation is security — never skip it).

Do the timing in CSS wherever you can — `:user-invalid` matches only after a real interaction (blur or a submit attempt) and clears live once fixed, so a bare CSS rule replicates points 1–3 for the border/ring with zero JS and can never drift out of sync with the DOM. Drive the wrapper's chrome from the input's own state with `:has()`:

```css
.field:has(:user-invalid) { border-color: var(--destructive); }
.field:has(:focus-visible) { box-shadow: var(--ring); }
```

Never style on `:invalid`/`:has(:invalid)` alone — that paints a pristine, never-touched field red on load (the classic premature-error bug that `:user-invalid` exists to kill). `:user-invalid` is Baseline 2026; `:has()` has been Baseline since late 2023. Reserve JS-toggled state for what CSS can't express: `aria-invalid`, the human-worded error message, and the submit-time server verdict.

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
- Multi-field forms (3+ inputs — checkout, contact, booking, a wizard step) also get a focus-managed error summary above the form: a `tabIndex={-1}` container you move focus to on a failed submit, listing each miss as `<a href="#field-id">Label: how to fix it</a>` that focuses its field on click. Additive to the inline errors, never a replacement (GOV.UK's AT research: one authoritative list beats forcing keyboard/AT users to re-tab the whole form to discover what failed). A single-field newsletter input just needs its inline message.
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
- Styling validation on `:invalid`/`:has(:invalid)` instead of `:user-invalid` — reds a pristine field on load
- A ResizeObserver/JS auto-height hook on a textarea where `field-sizing: content` does it natively
- `appearance: base-select` rules with no `@supports` gate or styled fallback — Chrome-only today, so everyone else gets the unstyled default
- A card-first payment row or a US-stacked address block (PLZ after Ort) on a DACH checkout
- Inline-only errors on a long multi-field form — no focus-managed summary for AT/keyboard users

## Worked example — Casa Verde, the reservation form (EN/PT)

design/SITEMAP.md gives `/en/reserve` one job: a confirmed booking. Applying "cut every field the goal doesn't need," the table booking drops to six — name, email, party size, date, time, and `notes (optional)` — one zod schema in `lib/schemas/reservation.ts` imported by both locales' form and the action:

```ts
export const reservationSchema = z.object({
  name: z.string().min(2, { error: "Tell us who the table's for" }),
  email: z.email({ error: "An email like you@example.com — the confirmation goes there" }),
  partySize: z.coerce.number().int().min(1).max(12, { error: "Over 12? Call us — we'll set it up" }),
  date: z.iso.date({ error: "Pick a date" }),
  time: z.enum(["18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00"]),
  notes: z.string().max(280).optional(),
});
```

Fields sit in a single 440px column on the warm-cream card (`oklch(0.97 0.01 85)`); Karla labels 14px above each input, focus ring terracotta (`oklch(0.66 0.13 45)`), Fraunces italic saved for the success heading alone. The `notes` textarea grows with `field-sizing: content` (min 3lh, max 10lh) — no resize hook. Validation chrome is pure CSS: `.field:has(:user-invalid)` reddens the border only after a real blur or a failed submit, so an untouched field never flashes red. On a failed submit the six-field form moves focus to an error summary listing each miss as a link back to its input, additive to the inline messages. The action returns `status: "confirmed"` and replaces the form with "Table set — check your inbox."; the `fully-booked` branch swaps in a waitlist offer inline rather than a dead end, echoing every value back on any error.

Rejected: a live-availability time `<select>` that fetches open slots on mount — it breaks the no-JS `<form action={submitReservation}>` post, so the server action re-checks the slot instead and returns `fully-booked` as data.

Output lands in `components/forms/ReservationForm.tsx` + `app/[locale]/actions/reserve.ts`; ultraweb:email carries the confirmed booking to Resend (check `{ data, error }`, it never throws) and ultraweb:i18n supplies the PT label/error strings keyed to the same schema.

## Composes with

- ultraweb:server-actions — owns the mutation side: 'use server' conventions, optimistic updates, error-as-data shape this wiring targets
- ultraweb:buttons — submit CTA hierarchy and loading state
- ultraweb:ui-states — success/error/empty surfaces beyond the form itself
- ultraweb:copywriting — labels, hints, and error voice in the brief's tone
- ultraweb:micro-interactions — focus ring and error-appear motion, 150–250ms
- ultraweb:email — where the contact payload lands (Resend: check `{ data, error }`, it never throws)
- ultraweb:auth — sign-in/sign-up forms built here hand the credential check and session mutation off to auth
- ultraweb:i18n — owns locale switching and translated label/error strings; forms owns field order and the DACH payment-method priority
- ultraweb:payments — wires the Stripe/provider integration behind the DACH payment methods forms orders (Klarna/PayPal/SEPA/Rechnung)
- ultraweb:gate-accessibility — audits the label association, `aria-describedby`, and error-announcement contract this skill builds (its item 7)
- ultraweb:storage — when a form field is a file upload the bytes hand off here, while the dropzone's label and error placement still follow this skill's rules
