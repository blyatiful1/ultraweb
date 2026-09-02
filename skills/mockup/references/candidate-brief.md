# Candidate brief — one seat, one agent

The turnkey prompt for a round-1 mockup candidate. Fill the bracketed blanks and hand the whole thing to one Specialist agent (`model: opus`) per candidate, in one batch. The agents never see each other's work; the Lead does not open their files to judge them — only the approved candidate, once, after the pick, and only when its returned spec leaves a decision genuinely open.

## What the agent is given

- **Seat:** `<letter>` — archetype **`<Archetype Name>`**; write exactly one file, `design/mockups/<letter>-<archetype-slug>.html`.
- **The seat's sketch:** `<the signature-move idea + palette/type sketch the shortlist assigned this seat>`. When this is the heretic seat, say so in the brief: it contradicts the stored taste profile on purpose, and diluting it back toward the profile defeats the seat.
- **The job:** read `<projectRoot>/design/BRIEF.md` in full — audience, purpose, tone words, content inventory, jurisdiction. Every string you write comes from its voice.
- **The archetype's entry:** `grep -n '^### ' <plugin>/skills/direction/references/CATALOG.md` to find the line your archetype starts on, then Read that file with `offset` at that line and `limit` reaching the next `###`. Read that ONE entry — never the whole catalog.
- **The constitution:** `<plugin>/skills/taste/SKILL.md` (the `ultraweb:taste` skill). Its banned list applies in full — a candidate that wins with a banned move poisons the build that follows it.

## Rules the candidate obeys

- **Self-contained static HTML.** One file: inline `<style>`, zero JavaScript, no framework, no build step, no screenshots. A Google Fonts `<link>` is the one permitted external request; give every face a real fallback stack.
- **Real OKLCH palette** as custom properties on `:root` — the values DIRECTION.md would commit to, not approximations, and every foreground/surface pair clears WCAG AA.
- **Real type pairing** (display + body) loaded through that link, hero at least 3.5× body size. Default-Inter-only is not a pairing.
- **Hero + the 2–3 sections that carry the most decision weight for THIS site type** — e-commerce → product grid; restaurant → menu excerpt; SaaS → feature split; portfolio → work index; editorial → article opener. Not a page inventory.
- **The signature move drawn as a static frame:** the SVG motif actually drawn, the layout gesture actually placed. Enough to judge, not implemented — no motion, no interactivity, no hover states.
- **Copy in the brief's voice:** a real headline, one section of real body, real CTAs. No lorem, no "Feature 1/2/3", no `href="#"`. Sketch-grade is fine; placeholder-grade is not.
- **One honest small-screen pass:** fluid widths, readable text at 375px. No breakpoint engineering beyond that.
- **Sketch grade is the ceiling** — minutes, not hours. Polishing past it spends the build's budget on a maybe.
- **Touch nothing else.** No `design/MOCKUPS.md`, no `design/DIRECTION.md`, no other artifact; no server; no reading of the other candidates.

## What the agent returns

The file path, then a spec of at most ten lines — no prose report, no methodology, no apology:

```
design/mockups/b-swiss.html
Archetype: Swiss/International
Palette: --bg oklch(0.99 0 0) · --ink oklch(0.18 0.01 250) · --accent oklch(0.58 0.21 25) · --muted oklch(0.62 0.01 250)
Type: Inter Tight 700 display / Inter 400 body · hero clamp(3rem, 7vw, 5.5rem)
Signature move: the 12-column rule made visible — hairlines behind the hero, the product index snapping to them
Sections: hero · product index · Abo strip
Refusals: BRIEF asks for a full-bleed roastery photo; ASSETS.md has none, so the hero is type-only — flagged, not faked
```

That spec is what the Lead keeps. `direction` writes DIRECTION.md from the approved candidate's spec; the HTML is reference, and the Lead may Read it once only when the spec leaves a decision genuinely open.
