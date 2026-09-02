---
name: studio
description: Scaffold the dev-only /studio route — the construction-site window onto a running ultraweb build. A force-dynamic page, hard-gated to 404 in production, that reads design/PROGRESS.md, design/QA.md, design/REVIEWS.md, design/screenshots/ and design/studio-log.jsonl off disk at request time and renders phase progress, the gate table, the checkpoint ledger, a screenshot contact sheet, and a 2-second-polled activity feed — so the user watches the build live at zero token cost per update. Invoke in Phase 5 immediately after scaffold (skipped at sketch tier), whenever the user asks to "watch the build", "see it live", "show me what you're doing", "is there a dashboard", "open the studio", or when a resumed build finds app/(studio)/ missing. Deliberately un-designed workshop chrome; the gates ignore it and handoff documents deleting it.
---

# studio — the build renders its own construction site

**Stage:** Phase 5 — Scaffold (right after `scaffold`; skipped at sketch tier) - **Reads:** design/PROGRESS.md, design/QA.md, design/REVIEWS.md, design/screenshots/, design/studio-log.jsonl — all off disk, at request time; `design/CONTEXT-HANDOFF.md` and the `qa/*.log` files are deliberately not rendered (the page shows PROGRESS, QA, REVIEWS, screenshots and the activity log, nothing else) - **Writes:** app/(studio)/studio/* (page, feed handler, shot handler, one client leaf)

A long build is a long silence, and the usual fix is narration — tokens spent describing the work instead of doing it, and a transcript the user has to read. This route replaces narration with a window: the files the pipeline already writes, served by the dev server it already runs, at zero tokens per refresh. The client hired a studio, not a file browser — let them stand in the doorway.

## Standard

- **Free to watch.** Every update comes from `fs` at request time — no model call, no cached snapshot, no agent-authored "status update" on the page. Two hundred reloads cost what zero do.
- **Dead in production.** Two independent locks: `notFound()` on `NODE_ENV === "production"` in every file of the route group, and `ship`'s smoke test fetching `/studio` against `npm run start` expecting 404. A 200 is a ship blocker, not a note.
- **Un-designed on purpose.** System monospace, system colors, borders not shadows, no tokens, no motion, nothing from `components/ui`. A styled `/studio` competes with the work and teaches the user to grade the wrong surface.
- **Honest when empty.** Phase 5 runs before QA.md, REVIEWS.md, or a single screenshot exists. Every panel renders its own absence in plain words — "nothing yet — Phase 11 writes this" — never an error, a permanent spinner, or a fake zero.
- **Render, don't parse.** PROGRESS.md and REVIEWS.md go on the page as their own text; only QA.md's gate rows get pattern-matched, for PASS / FAIL / UNVERIFIED coloring. A markdown parser here is scope creep with a dependency attached.
- **Exempt from the gates.** `gate-antislop` does not sweep it, `gate-visual` does not judge it, `gate-responsive` does not screenshot it. The gates measure the site and this is not the site — say so in QA.md's first entry so no later run "discovers" it.
- **Thirty minutes, ceiling.** It is a plywood viewing platform. Time spent styling it is stolen from what the client pays for.

## Process

1. **Confirm the tier.** Sketch skips this skill — a one-pager is over before a dashboard pays for itself.
2. **Create the route group** `app/(studio)/` so the feature is one deletable folder inheriting nothing from the marketing layout. Its own bare `layout.tsx`: no header, no footer, no fonts.
3. **Write the production gate first**, in the page and in every route handler under the group. A route that renders before it refuses is a leak waiting for a deadline.
4. **Read the artifacts defensively.** One helper taking a path and returning `string | null`, swallowing ENOENT and nothing else, resolving from `process.cwd()` — after `scaffold`'s move, that is where `design/` lives. Every panel accepts `null` and renders a "nothing yet" line naming the phase that will fill it.
5. **Build five panels top to bottom**, in the order the user asks the questions: (1) **Now / Waiting on you** — PROGRESS.md's first two sections verbatim, the waiting line loudest on the page; (2) **Gates** — QA.md's rows as a table: green PASS, red FAIL, amber UNVERIFIED; (3) **Checkpoints** — REVIEWS.md's blocks and their Approved / Auto-passed lines; (4) **Contact sheet** — every image under `design/screenshots/` and the gates' `qa/`, newest first, filename beneath; (5) **Activity** — the live feed.
6. **Serve screenshots through a dev-only route handler** — `shot/route.ts`, taking a `?f=` basename, rejecting anything that does not resolve inside the screenshot directories, streaming bytes `no-store`.
7. **Add the feed as the one client leaf.** `feed.tsx` (`"use client"`) polls `feed/route.ts` every 2000ms; the handler tails the last ~40 lines of `design/studio-log.jsonl` as JSON. Malformed lines are skipped, never thrown on — a hook is appending mid-build and the read can catch a half-flushed line.
8. **Force dynamic rendering, then prove it once.** `export const dynamic = "force-dynamic"` on page and handlers; load `/studio`, confirm it renders against Phase 5 reality (PROGRESS.md alone, the rest empty), print the URL to the terminal exactly once. Nothing links to it — no nav entry, no `sitemap.ts`, no line in SITEMAP.md.

## Route contract

The whole feature, and the two lines that make it safe:

```tsx
// app/(studio)/layout.tsx            ← bare workshop chrome
// app/(studio)/studio/page.tsx       ← the five panels (server component)
// app/(studio)/studio/feed.tsx       ← "use client", polls feed/ every 2s
// app/(studio)/studio/feed/route.ts  ← tails design/studio-log.jsonl
// app/(studio)/studio/shot/route.ts  ← streams one screenshot by basename
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function StudioPage() {
  if (process.env.NODE_ENV === "production") notFound();
  // ...read design/* off disk, render the five panels
}
```

The feed's input, appended by the plugin's `hooks/studio-log.sh` on PostToolUse(Task) and SubagentStop — one line per agent launch and finish, no model in the loop:

```jsonl
{"ts":"2026-08-14T15:22:07Z","event":"PostToolUse","agent":"general-purpose","summary":"Build /pricing per SITEMAP.md"}
{"ts":"2026-08-14T15:41:33Z","event":"SubagentStop","agent":"","summary":""}
```

Empty fields render blank, unknown keys are ignored, corrupt lines dropped; the page never writes here. The hook tracks agents, so the feed is busy in fan-out mode and quiet in solo — by design, the other four panels carry the page.

## Anti-patterns

- A `/studio` that renders in production because the env check sat below the first `await` — gate on line one or it is not gated
- Designing it: tokens, shadcn components, motion, the site's own fonts. The workshop must look like a workshop
- The agent writing status prose INTO the page — narration with extra steps, priced per update
- Polling a server action, or revalidating the whole page, instead of one small JSON handler
- Symlinking `design/screenshots/` into `public/` — `public/` ships, and the evidence would ship with it
- A panel that 500s or prints "undefined" because its artifact does not exist yet
- Linking it from the nav, or letting it into `sitemap.ts` — nothing on the site knows it exists

## Worked example — Tidepool, port-logistics SaaS built in fan-out mode

Moved to `references/example.md` — read only when this build's case is genuinely ambiguous; the sections above are the decision material.

## Composes with

Moved to `references/composes.md` — the handoff map; load it when orchestrating this skill against its neighbors.
