## Worked example — Framewalk, indie game studio Steam launch site

design/SYSTEM.md hands down `--color-accent: oklch(0.78 0.15 160)` (phosphor), `--radius-md`, the `--ease-standard` easing token, and one hard brief rule: "Wishlist on Steam" is the only filled button that may appear anywhere.

That makes the one-primary rule literal — exactly one `primary` renders per view, always the wishlist CTA. It fills phosphor with a near-black label `oklch(0.16 0.02 200)` (clears 4.5:1 easily; `ultraweb:color` owns the check), hero size `xl` (h-14); the sticky-header wishlist button (size `md`) is the site-wide primary the one-per-view rule exempts. Single hover motif everywhere: fill lightens ΔL +0.04 to `oklch(0.82 0.15 160)`, no lift — atmospheric dark wants glow, not bounce.

```tsx
// components/ui/button.tsx — primary variant, restyled from SYSTEM.md
primary:
  "bg-accent text-[oklch(0.16_0.02_200)] rounded-md " +
  "hover:bg-[oklch(0.82_0.15_160)] active:scale-[0.98] " +
  "focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-[oklch(0.16_0.02_200)] " +
  "transition-[background-color,transform] duration-150 ease-standard",
```

So the launch-news email capture submit can NOT be filled: it renders `secondary` (outline phosphor), its `useFormStatus()` pending state swapping "Notify me" → "Adding…" behind a `LoaderCircle animate-spin`, min-width locked. Rejected: pairing the wishlist CTA with a filled "Read the devlog" — killed on sight, since a second filled weight breaks the brief, so devlog links demote to `ghost`.

Handoff: the restyled `components/ui/button.tsx` lands for `ultraweb:hero` to place the xl "Wishlist on Steam" over the parallax fog, and for `ultraweb:forms` to wrap the `secondary` submit in the email-capture server action.
