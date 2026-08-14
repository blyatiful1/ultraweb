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
