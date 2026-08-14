## Worked example — Casa Verde, reservation states in EN/PT

design/BRIEF.md fixes the reservation flow's three outcomes — pending, confirmed, fully-booked (waitlist offer) — and the job here is to make sure "fully-booked" is never modeled as an error.

The four-cell row for the reservations surface: **loading** is the submit button's own pending state — `const [state, formAction, pending] = useActionState(reserve, null)` from `react` — not a page skeleton, since a two-field form has no shape to promise. **Success** returns two branches as action data: `confirmed` morphs the button to "Mesa reservada" / "Table booked" at 200ms then reverts; `fully-booked` renders an inline terracotta `bg-accent` panel reading "Tonight is full — join the waitlist?" with exactly ONE action. **Error** — a network or Resend failure — is the only `role="alert"` on the page and runs the formula: "We couldn't send your confirmation. Your table's held for 10 minutes — try again or call us." — what happened, a why that changes the next move, and two concrete fixes ([Try again] + a `tel:` link), EN and PT by ultraweb:copywriting. A bare "Something went wrong" would have failed gate-content's microcopy lint.

The harvest strip above the menu gets a Card-Grid Skeleton at the real 3:4 photo aspect ratio; on a day the market feed returns `[]` the strip collapses to nothing rather than showing a Filtered-to-Zero empty — an empty harvest isn't a user dead-end.

The 404 is `not-found.tsx` in the display face on the terracotta palette, EN/PT: "This page isn't on tonight's menu — back to the Menu or Reservations." — two real ways back, never Next's default; any personality stays deferred to ultraweb:hidden-craft (a restaurant leans restrained). The empty-state marketing reuse doesn't apply here — Casa Verde has no authenticated app surface to screenshot, so that lever is correctly gated out.

Rejected: routing "fully-booked" through `error.tsx`. It lost because a full table is a normal outcome; an error boundary would only offer `reset()` (retry the same date) instead of the waitlist that actually helps the guest.

Handoff: the pending/success wiring lands in the reservations form component + `reserve-action.ts`; ultraweb:server-actions owns the action's return shape and ultraweb:forms owns the field-level zod errors this skill deliberately leaves alone; the 404's file placement is ultraweb:routing's and its optional flourish ultraweb:hidden-craft's, both over the in-voice page designed here.
