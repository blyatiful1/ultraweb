# mockup

Render the direction candidates as quick static pages so the user can point at a direction before the build spends anything.

Load when: Phase 2, after `references/direction.md` has produced its candidates.
Reads: design/BRIEF.md, the candidate sketches from direction. Writes: design/mockups/*.html, design/mockups/shots/*.png, the round log under CP1 in design/PROGRESS.md.

## Candidates

- standard and flagship: candidates A, B and C. sketch: A and C. `references/direction.md` builds them.
- Every pair of candidates differs on ground, type class and layout principle, the axes defined in `references/direction.md`. If two would look alike as thumbnails, replace one.
- C is the dealt wildcard from `node <plugin>/scripts/deal.mjs`. Its renderer has to make the dealt values fit the brief and say how in its spec. Do not swap the deal for something safer; an axis that is impossible for the brief is re-dealt with `--fix` as direction.md describes, and the fix is noted.
- Each candidate carries the one signature move direction assigned it.
- Autonomous mode: render and capture the candidates the same way, then pick as direction.md says. Looking at them is how you pick.

## What each file contains

One self-contained file, `design/mockups/<letter>-<slug>.html`:

- Inline `<style>`. No JavaScript, no framework, no build step. The only external request allowed is one font stylesheet link, with real fallback stacks.
- Palette as `oklch()` custom properties on `:root`, using the values DIRECTION.md would commit to. Every text/background pair clears WCAG AA (4.5:1 body, 3:1 large text).
- The real type: display and text faces loaded, at the scale contrast DIRECTION.md would commit to (`references/taste.md` sets the range).
- The hero plus the 2 or 3 sections that decide this site type: product grid for a shop, menu excerpt for a restaurant, work index for a portfolio, article opener for editorial, the core feature explanation for a product.
- Real copy taken from design/BRIEF.md, in its voice (`references/copy.md`). No lorem, no "Feature 1", no `href="#"`.
- The signature move drawn as a static frame. Optionally add ONE CSS-only motion sketch of it (keyframes, or `animation-timeline` with a static fallback) wrapped so it does not run under reduced motion:

```css
@media (prefers-reduced-motion: no-preference) {
  .sig { animation: sig 1.2s cubic-bezier(.2,.7,.2,1) both; }
}
```

- Readable and unbroken at 375 px. No further breakpoint work.
- The defaults named in `references/taste.md` apply. A mockup that wins with a default look the brief does not argue for poisons the build.

## Delegation

At standard and flagship tiers, when the Agent tool is available and the user has not asked for a single context, launch one agent per candidate in one batch, `model: opus`. Give each: its letter, its candidate sketch from direction (ground, type class, layout principle, signature move, wildcard if dealt), the path to design/BRIEF.md, the path to `references/taste.md`, and the rules in this file. Each agent writes only its own HTML file and returns the path plus a spec of at most 10 lines: palette values, faces and sizes, layout principle, signature move as drawn, how the wildcard was made to fit, any deviation. At sketch tier write the candidates yourself.

## Look before you show

1. Serve the folder: `python3 -m http.server 4173 --directory design/mockups` (run in the background).
2. Capture each candidate at 1440 and 375 with the gates runner: `node <plugin>/scripts/gates.mjs --url http://localhost:4173 --routes /a-<slug>.html,/b-<slug>.html,/c-<slug>.html --only responsive --out design/mockups/shots`. With no browser available, say so and show the files unseen.
3. Look at every capture. Fix any candidate that is broken, illegible, collides with another candidate, or uses a default look without the brief arguing for it. Recapture after a fix.
4. Write `design/mockups/index.html`: a contact sheet with each candidate in an `<iframe>` at roughly 1440 and 390 px wide, labeled with its letter and a one-line identity, so the user compares in one tab.

## The round

1. Show the contact sheet path and the individual files. Ask one structured question: pick A, B or C; mix (name the base and the one element taken from another); or revise (say what is wrong).
2. Mix: the base candidate keeps its ground, type class and layout principle. The borrowed element becomes one recorded twist. Do not average two candidates.
3. Revise: build the new round from the user's objection, quoted verbatim, and replace the weakest candidate. Deal C again.
4. At most two rounds (the checkpoint limit in `references/checkpoints.md`). If round 2 ends without approval, ask the user to pick the closest candidate; their remaining objections become constraints in DIRECTION.md.
5. Log each round under CP1 in design/PROGRESS.md: one line per candidate (letter, ground, type class, layout principle, signature move, dealt values for C), then the user's verdict close to verbatim. DIRECTION.md is written only after approval, with the result in its `## Approved` section.
6. On approval, copy the winner's captures to `design/mockups/approved-1440.png` and `design/mockups/approved-375.png`. These are the reference the homepage is compared against at CP2 and the image `design-judge` receives.

Mockup markup never ships. The build re-derives everything from DIRECTION.md and SYSTEM.md.

## Anti-patterns

- Two candidates sharing a ground, a type class or a layout principle
- Replacing the dealt wildcard with a safer idea
- JavaScript, a framework or a build step in a mockup
- Showing the user candidates nobody has looked at
- Polishing a candidate past sketch grade before approval
- A 50/50 hybrid of two candidates
- A third round
- Copying mockup markup into the app
