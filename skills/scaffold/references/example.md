## Worked example — Aldermoor Trust, community foundation project init

design/SITEMAP.md lists five routes — `/`, `/grants`, `/stories/[slug]`, `/volunteer`, `/donate`; design/BRIEF.md names the client "Aldermoor Trust".

`npm view` first: next 16.2.10, tailwindcss 4.3.2, shadcn 4.13.0 — all match STACK.md, no MAJOR jump, so proceed. Init: `npx create-next-app@latest aldermoor-trust --yes` (no `--turbopack` — Turbopack is the Next 16 default). Lay the "Open Civic" warm-paper base into app/globals.css with real values, so the smoke test renders on-brand from line one:

```css
:root {
  --background: oklch(0.97 0.008 85);
  --foreground: oklch(0.24 0.02 85);
}
```

Then `npm i motion lucide-react zod next-themes` — the base four only.

Rejected: eagerly `npm i content-collections` now because the stories are MDX. It lost — scaffold installs only what Phase 5 needs; the content tier owns that dependency, and pulling it in here breaks the install discipline the smoke-test build is there to prove.

Handoff: the running tree, the globals.css skeleton, and the first design/QA.md entry (version deltas plus the dev-server 200 and exit-0 build) go to ultraweb:tokens, which replaces the placeholder `:root` with the real Open Civic system — AAA-checked deep-green accent `oklch(0.45 0.1 155)` on warm paper.
