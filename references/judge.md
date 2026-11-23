# judge

The visual critique loop: capture the built site, have `design-judge` score it in a fresh context, fix what it ranks, and repeat within the tier's budget.

Load when: Phase 5 (one homepage round before CP2) and Phase 7 (the full loop after the gates pass), or when the user asks whether the site is actually good.
Reads: qa/gates.json, qa/shots/, design/BRIEF.md, design/DIRECTION.md, design/mockups/approved-*.png. Writes: qa/shots/sections/*.png, fixes in source; the judge writes qa/judge-round-N.md.

## Why the judge scores twice

A judge that only checks the build against DIRECTION.md certifies whatever DIRECTION.md asked for, including a default look the direction never really argued. So every round gets two separate verdicts:

1. **Fidelity and quality.** The four jury axes from `references/award/invariants.md`, scored against this brief and direction, plus drift from the approved mockup.
2. **Default-look test.** Would a stranger who has seen many generated sites take this for one? This is judged from the screens and the tells census, independently of DIRECTION.md. A faithful build of a default look passes the first verdict and fails the second.

SHIP needs both.

## Preconditions

- The gates have run on the current build of record. Phase 5: `--quick`. Phase 7: a full run with verdict PASS (or UNVERIFIED only where no browser exists). Do not spend judge rounds on a site that overflows or fails contrast; the gates catch that more cheaply.
- `qa/shots/` holds the gates runner's captures for the round's routes and widths.
- The server is serving the current build. After any fix to source, tokens or config, rebuild and restart before capturing.

## Capture sectionals

The runner's shots show the first viewport. The judge also needs the rest of each page, one viewport at a time; a single full-page image is too small to judge type. Capture with Playwright MCP if present, or save this as `qa/sectionals.mjs` in the project and run `node qa/sectionals.mjs http://localhost:3100 / /pricing`:

```js
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';
const [base, ...routes] = process.argv.slice(2);
mkdirSync('qa/shots/sections', { recursive: true });
const browser = await chromium.launch();
for (const [width, height] of [[1440, 900], [375, 812]]) {
  const page = await browser.newPage({ viewport: { width, height } });
  for (const route of routes) {
    await page.goto(new URL(route, base).href, { waitUntil: 'networkidle' });
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    const name = route === '/' ? 'home' : route.replace(/^\/|\/$/g, '').replace(/\//g, '-');
    for (let i = 0; i * height < total && i < 12; i++) {
      await page.evaluate((y) => window.scrollTo(0, y), i * height);
      await page.waitForTimeout(500);
      await page.screenshot({ path: `qa/shots/sections/${name}-${width}-s${i}.png` });
    }
  }
  await page.close();
}
await browser.close();
```

It needs `playwright` resolvable from the project. Phase 5 captures `/` only. Later rounds capture every route in round 1, then only the routes a fix touched. When DIRECTION.md commissions a showpiece, also capture the affected routes with `reducedMotion: 'reduce'` passed to `newPage`, into `qa/shots/sections/rm-*`.

## Rounds by tier

| Tier | Phase 5 homepage | Phase 7 loop |
|---|---|---|
| sketch | none (the page is the homepage; Phase 7 judges it) | 1 round |
| standard | 1 round | up to 2 rounds |
| flagship | 1 round | up to 4 rounds |

## Dispatch

Launch `design-judge` with only these inputs, as paths:

- the project root and round number N
- design/BRIEF.md and design/DIRECTION.md
- design/mockups/approved-1440.png and approved-375.png
- qa/gates.json (the judge reads the `tells` census and the `review` items from it)
- the directory of this round's shots: qa/shots/ and qa/shots/sections/
- the tier

Do not describe the site, explain intentions, or defend choices in the prompt. If a choice needs defending, it belongs in DIRECTION.md, where the judge reads it. Do not pass the previous round's report; each round is judged fresh.

The judge writes its full reasoning to `qa/judge-round-N.md` and returns about 500 tokens: scores, the default-look verdict, the verdict, ranked defects with `file:line`, and at most two screenshot paths worth looking at.

## SHIP floor

| Tier | Weighted score | Every axis at least | Default-look test |
|---|---|---|---|
| sketch | 7.0 | 6 | not `default` |
| standard | 7.5 | 7 | not `default` |
| flagship | 8.0 | 7, usability 8 | `authored` |

Also required for SHIP: no unargued default in the hero or the first screen, the signature move visibly delivered where DIRECTION.md placed it, and no defect marked `blocker`. Enforce the floor even if the judge writes SHIP while a number sits below it.

## What the lead does with the return

1. Record the round in PROGRESS.md `## Now`: N, weighted score, default-look verdict, verdict.
2. Look at the one or two screenshots the judge named. Do not read qa/judge-round-N.md unless a defect is unclear.
3. Fix in rank order: the top three defects plus anything sharing their root cause. Fix at the source the judge names (a token, a component, a deck string). A defect reported as `route@width` without a file means the judge could not locate the source: find it before editing.
4. A default-look failure is fixed by replacing the default with something from the subject sheet in DIRECTION.md, not by adding an effect on top. If the fix changes ground, type class or layout principle, it is a direction change: in guided mode ask the user before making it.
5. Rebuild, re-run the affected gates, re-capture, and dispatch the next round.
6. An axis that drops after a fix means the fix fought the direction. Revert it.
7. At the round cap without SHIP, stop. Record the remaining defects in the judge's words in PROGRESS.md and show them to the user at the checkpoint. Do not keep polishing.

The lead never scores its own screens, never argues a score down, and never edits the judge's report.

## No browser

Without a browser there are no screenshots and nothing to judge. The visual verdict is UNVERIFIED. Say so in PROGRESS.md and at CP3: "No page has been seen; the visual bar is unproven." Do not let the judge score source code as a substitute.

## Limits to tell the user

The judge is the same model family as the builder and has no external reference set. It reduces self-certification; it does not remove it. The user's verdict at CP2 and CP3 is the ground truth, and the judge's scores are not an award prediction.
