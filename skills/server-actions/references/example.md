## Worked example — Casa Verde, EN/PT reservation flow

design/BRIEF.md: "Reservation form → server action → Resend confirmation; states pending, confirmed, fully-booked (waitlist offer)."

One `reserve` action, zod v4 at the boundary, availability settled by an atomic seat claim server-side and returned as a UI *state* — never thrown:

```ts
// app/actions/reserve.ts
'use server'
import { reservationSchema } from '@/lib/schemas/reservation'   // the one schema ultraweb:forms owns — never re-declared here
export type ReserveState = {
  status: 'idle' | 'confirmed' | 'fully-booked'
  errors?: Record<string, string[]>
  values?: Record<string, string>   // echo the submission back so a failed parse or a full house never blanks the form
}
// reservationSchema.safeParse → invalid? { status: 'idle', errors, values } — fields stay filled
//   → claim the seats atomically — one conditional write is the availability check:
//       UPDATE covers SET booked = booked + $party WHERE booked + $party <= capacity  (returns rows affected)
//     idempotent on the submission's request key, so a retried submit re-reads its own claim instead of double-booking
//   → claim took (1 row)? only now deliverConfirmation() (check Resend { data, error }) + revalidateTag('covers', 'minutes') → { status: 'confirmed' }
//   → claim rejected (0 rows)? return { status: 'fully-booked', values }  ← form swaps its submit for the waitlist CTA, no throw
```

The three brief states map cleanly: the in-flight submit is `pending` from `useActionState`; the resolved outcomes are `confirmed` (email fires) and `fully-booked` (the waitlist offer renders in place). Copy is Portuguese under `/pt/*`, mirrored under `/en/*`.

Rejected: a client `fetch('/api/reserve')` — it breaks the no-JS submit PT diners on older phones still need, and forces the zod schema to be duplicated across the wire.

Output lands in `app/actions/reserve.ts`; ultraweb:forms renders the field messages and the fully-booked waitlist swap, ultraweb:email owns the confirmation template.
