---
name: hidden-craft
description: The opt-in hidden-craft layer — one tasteful reward for the curious that signals human authorship: a styled console.log signature (never leaks secrets), an on-brand not-found.tsx micro-scene, one keyboard easter egg, and humans.txt / HTTP-header touches. Every gesture is pure enhancement — never gates content, never hurts LCP or a11y, always skippable, ONE per site not a scavenger hunt. Invoke in the last-2% craft pass, or when the user says "console easter egg", "Konami code", "humans.txt", "view-source comment", or "make it feel handcrafted"; skip it entirely for trust-critical clients (law, finance) who want none. Building the 404 route itself ("custom 404", "not-found page") is ultraweb:routing's — this skill only adds the reward layer on top of a 404 that already exists.
---

# hidden-craft — rewards for the person who looks closer

**Stage:** Phase 6–9 — Craft (the opt-in last 2%) - **Reads:** design/DIRECTION.md, design/BRIEF.md, design/SYSTEM.md §motion - **Writes:** app/not-found.tsx (+ app/global-not-found.tsx), a client console-signature leaf mounted in app/layout.tsx, public/humans.txt, custom headers in next.config.ts

## Standard

Hidden craft is the deliberate reward left on the paths only a curious person walks — the console, view-source, a mistyped URL. In 2025–26 it is the strongest cheap signal that a human made this site and not a default template, and word-of-mouth about a site starts with developers who open the console. First-grade means the reward exists **and costs everyone else nothing** — invisible, skippable, and free to the visitor who never finds it. Four non-negotiables — this is where the skill earns its place instead of becoming noise:

- **Zero performance cost.** Never touches LCP or the critical path. No ASCII-art / confetti dependency, no heavy media on the (already-error) 404, no work on first paint. The console line runs once, client-side, after mount.
- **Never gates, never blocks.** No egg sits between the visitor and content, navigation, or focus order. The 404 is a *working* error page first; any playfulness is garnish on top of a real path home. A gesture you must "solve" to proceed is a bug.
- **Skippable and silent.** Degrades to nothing if never triggered or unsupported; no console art on an old devtools, no egg on a keyboard that never types it — and the site is identical.
- **ONE hidden gesture per site.** The console signature and the 404 are surfaces the curious reach *naturally* — they are not a hunt. The interactive egg is capped at exactly one. A multi-step ARG across pages competes with the actual product and is banned.

**Opt-in, default off.** Only when the direction has room for play. Trust-critical brands (Ledger & Lane, Aldermoor Trust) ship none — a Konami code on a law firm reads as unserious and erodes the exact credibility the site is built to earn. When in doubt, none.

## The craft menu — pick sparingly

**Console signature** — a `%c`-styled greeting for the person who opens devtools or view-source: a small ASCII wordmark in the accent, then a human line and a hiring nudge. The always-appropriate tier (it's a signature, not a hunt). The console can't read your CSS custom properties, so inline the accent as a literal — it degrades to default text color where `%c` colour is unsupported, which is fine.

```tsx
// components/craft/console-signature.tsx  — client leaf; the layout stays a server component
"use client";
import { useEffect } from "react";
export function ConsoleSignature() {
  useEffect(() => {
    const ink = "color:oklch(0.78 0.15 160);font:600 13px ui-monospace,monospace";
    console.log("%c↖ N — you drifted off the charted edge.", ink);
    console.log("%cWe're hiring cartographers → framewalk.studio/careers", "color:inherit");
    // NEVER log secrets: no process.env values, tokens, internal URLs, or user data
  }, []);
  return null;
}
```

The **view-source HTML comment** is the sibling gesture but note the mechanics: JSX `{/* … */}` is stripped at build and never reaches the served markup — a real served comment needs `dangerouslySetInnerHTML` or a raw string. The console is the richer, more reliable surface; reach for the comment only when the direction genuinely wants it.

**On-brand 404 (`not-found.tsx`)** — a designed micro-scene tied to the brand metaphor, never a dead stack. `ultraweb:ui-states` already owns that this state exists and offers a path home; hidden-craft adds the *personality* on top without removing the usable error page underneath. It ships a real `<h1>`, a working "back home" link, and the primary nav — usable from the keyboard, light enough to not tax an error path. Any playful element is progressive enhancement layered over that.

**The one hidden trigger** — a Konami code, a typed word, or a logo click-count that opens a credits lightbox, a brand flourish, or a `ultraweb:theme-worlds` micro-theme. The a11y correctness lives in the key listener: bail while the user is typing, never `preventDefault`, and give any panel it opens an Esc + focus return.

```tsx
"use client";
import { useEffect } from "react";
// ↑↑↓↓←→←→ B A — safe: never preventDefaults, and bails while an input is focused
export function useEasterEgg(onFound: () => void) {
  useEffect(() => {
    const seq = ["arrowup","arrowup","arrowdown","arrowdown","arrowleft","arrowright","arrowleft","arrowright","b","a"];
    let i = 0;
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement | null;
      if (el && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable)) return;
      i = e.key.toLowerCase() === seq[i] ? i + 1 : 0;
      if (i === seq.length) { i = 0; onFound(); } // no e.preventDefault(); reduced-motion applies to any reveal
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onFound]);
}
```

**humans.txt + a header touch** — `/public/humans.txt` (the anti-`robots.txt`) crediting the makers, and at most one tasteful custom HTTP header. Both are static, zero-cost, and sit beside the SEO config. The header must never clobber a security or caching header.

```
/* TEAM */   Studio: Framewalk · Made by: four humans in Tromsø
/* SITE */   Built with: Next.js, hand-written CSS, and too much coffee
```

## Rules — the non-negotiables

- Console art is **secrets-clean**: grep the module — no `process.env`, no keys, no tokens, no internal hostnames. It logs **once** on mount, not on every navigation.
- The key listener **guards input focus** (INPUT/TEXTAREA/SELECT/`contentEditable`), never calls `preventDefault`, and must not collide with the `ultraweb:command-palette` shortcut.
- Any panel/lightbox the egg opens: Esc closes it, focus returns to where it was, and every reveal honours `prefers-reduced-motion` per SYSTEM §motion.
- The 404 stays a **working error page** — real heading, real link home, real nav — with the playful layer strictly additive; it renders light (no heavy media, no big dependency).
- Custom header set in `next.config.ts` sits alongside — never over — the security headers.

## Anti-patterns

- `console.log(process.env…` or any secret / token / internal URL in console art — a security leak dressed as craft.
- A `keydown` listener that fires while an input is focused, or calls `preventDefault()` — it hijacks the visitor's typing.
- An egg panel with no Esc and no focus return — a focus trap.
- A multi-step scavenger hunt across pages — it competes with the product the site exists to sell; ONE gesture only.
- A 404 that's a playable **gate** (win to escape) or a bare stack with no path home — both fail "never gates / stay useful".
- A confetti / ASCII-art dependency or heavy media on the console or 404 — perf cost on an error path.
- Motion in an egg that ignores `prefers-reduced-motion`.
- `{/* comment */}` in JSX expecting it in served HTML — it's stripped at build; the reader never sees it.
- Any of this on a trust-critical brand — restraint is the craft there.

## Worked example — Framewalk, "Hollow Cartographer" launch site (Atmospheric Dark)

Moved to `references/example.md` — read only when this build's case is genuinely ambiguous; the sections above are the decision material.

## Composes with

Moved to `references/composes.md` — the handoff map; load it when orchestrating this skill against its neighbors.
