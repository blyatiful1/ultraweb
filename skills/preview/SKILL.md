---
name: preview
description: Non-production Vercel preview deploys that give a checkpoint a real URL — runs a pinned `npx vercel deploy` with NO --prod, guarded by npm run build exit 0 plus ship's secret scan, sends X-Robots-Tag noindex on every non-production deployment via next.config.ts headers(), and logs the URL beside the screenshots in design/REVIEWS.md. Fires at exactly two pipeline points — right after the homepage is built for CP4, and once every gate is green for CP6 — and on request mid-build whenever the user says "give me a link", "can I see it on my phone", "send me a preview", "put it somewhere I can look at it", or "is there a staging URL". Production deploys are not this skill's job: --prod belongs to ultraweb:ship and is refused here. No Vercel auth or no network degrades to screenshots only and never blocks the checkpoint.
---

# preview — a URL the reviewer can hold

**Stage:** Tier 8, fired mid-pipeline at CP4 and CP6 (and on request) - **Reads:** design/SITEMAP.md, design/QA.md (CP6 only), next.config.ts, STACK.md pinned CLI version - **Writes:** a throwaway preview deployment + the Preview line in design/REVIEWS.md and PROGRESS.md §Waiting-on-you, plus the non-production noindex header in next.config.ts

## Standard

A first-grade preview is the difference between reviewing a website and reviewing pictures of one:

- **Real surface, not a render.** The reviewer opens the site on their own phone, taps the nav, scrolls the hero, feels the motion. A PNG of localhost cannot be tapped. Every checkpoint that has a URL gets one.
- **Cheap gate, honestly named.** Preconditions are exactly two: `npm run build` exits 0, and `ship`'s secret scan comes back clean. Never the visual, responsive, a11y, or performance gates — a preview is not a release, and holding review hostage to gates the review exists to inform is backwards.
- **Invisible to the internet.** Every non-production deployment answers `X-Robots-Tag: noindex`. A client's half-built site indexed by Google is a real, permanent harm from a throwaway artifact.
- **Additive, never a substitute.** Screenshots stay — they are the record, dated and diffable in design/screenshots/. The URL is the review surface, alive for as long as the deployment is. Losing the PNGs to "there's a link now" trades a permanent record for a temporary one.
- **Never a blocker.** No Vercel auth, no network, a deploy that errors: one honest line, the checkpoint proceeds on screenshots. This skill improves a review; it never owns one.

## Process

1. **Confirm the firing point.** CP4 (homepage built, before inner pages), CP6 (no gate FAIL — UNVERIFIED entries ride along, named in the gate summary), or a direct user ask mid-build. Any other moment: don't deploy — a preview per commit is noise the reviewer learns to ignore.
2. **Refuse production outright.** If the request is to go live, to promote, to "make it the real URL", or contains `--prod` in any spelling, stop and hand off to `ultraweb:ship`. That command has one home and a set of rules — green gates, explicit ask, explicit confirmation, live verification — this skill does not implement.
3. **Preconditions.** `npm run build` → exit 0. Then `ship`'s tracked-file secret scan → zero hits. A red build is fixed locally first; deploying to see whether it works on Vercel is the anti-pattern that costs an hour.
4. **Noindex before the first deploy of the project.** Add the `headers()` block below to `next.config.ts` if absent, keyed on `process.env.VERCEL_ENV !== 'production'`. Verify it once, on the deployed URL, not by reading the file.
5. **Deploy without --prod:** `npx vercel@56 deploy` — pinned per STACK.md (confirm the current major with `npm view vercel version` when the pin looks stale), never floating `npx vercel`. Push whatever env keys the build reads into the project's Preview environment first; a build that fails on a missing key is a preconditions failure, not a Vercel failure.
6. **Verify empirically.** Fetch the returned URL: 200 on `/`, and `X-Robots-Tag: noindex` present in the response headers. If Vercel deployment protection fronts it, say so in the same breath as the link and name how the reviewer gets in — a link they cannot open is worse than no link.
7. **Log it next to the screenshots** in the checkpoint's REVIEWS.md block, and in PROGRESS.md §Waiting-on-you via `ultraweb:status`, so the reviewer never scrolls a transcript hunting for a URL.
8. **Present in one line**: the URL, what to look at, and the honest frame — the code is a real production build, only the environment is non-production, and the link dies with the deployment.
9. **Degraded path.** Not authenticated, offline, or the deploy errors: state it in one line ("no Vercel auth in this session — review runs on the screenshots below"), attach the screenshots, continue. Never retry-loop, never ask the user to go fetch a token mid-review.

## Preview contract

```ts
// next.config.ts — non-production deployments are never indexed
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async headers() {
    if (process.env.VERCEL_ENV === 'production') return [];
    return [
      {
        source: '/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },
};

export default nextConfig;
```

The URL joins the checkpoint block it belongs to — one added line, never its own section:

```md
## CP4 — First-page review
Presented: homepage at /, screenshots 375+1440 (design/screenshots/cp4/)
Preview: https://kaffeewerk-ost-<hash>.vercel.app — noindex verified, expires with the deployment
```

## Anti-patterns

- `--prod` fired from this skill under any framing ("just this once", "it's only staging") — production has an owner and a confirmation ritual
- Deploying a preview to dodge a failing local build
- A preview URL that returns 200 with no `X-Robots-Tag` — you just published the client's unfinished site to search
- Floating `npx vercel` instead of the pinned major — an upstream release shifting deploy behavior in the middle of a review round
- Dropping the screenshots because a link exists — the URL expires, the record must not
- Blocking or delaying a checkpoint on a failed deploy instead of degrading to screenshots in one line
- Treating the reviewer's phone as the responsive sweep — one device, one browser, one hand
- A fresh preview on every commit; the reviewer stops opening link number six
- Pasting a preview URL into the handoff README or a public channel as if it were the site's address

## Worked example — Kaffeewerk Ost, CP4 preview

Phase 6 finishes `/` completely — roast-curve hero, nav, product strip, footer. `npm run build` exits 0; the secret scan over tracked files returns nothing (`STRIPE_SECRET_KEY` and friends live only in `.env.local`, which `git check-ignore` confirms). `next.config.ts` gets the `headers()` block, the four build-time keys go into the project's Preview environment, and `npx vercel@56 deploy` returns `https://kaffeewerk-ost-3f9a2c.vercel.app`. A fetch confirms 200 and `X-Robots-Tag: noindex, nofollow`.

CP4 is presented as it always is — screenshots at 375 and 1440 — with the link added under them. The client opens it on her own phone in the Röstung and comes back with: *"the curve is perfect. The product cards feel cramped on the phone."* That verdict is worth more than the 375px PNG produced, because it came from a thumb on real glass — and it still routes through `cards`, exactly as `checkpoint` requires. Round 2 re-presents the one changed screenshot plus a fresh preview URL; **Approved**. Inner pages roll out afterwards. The deployment is left to expire on its own; nothing about it is promoted, and `/shop` reaches production only through `ship`, months of gates later.

Rejected alternative: exposing the local dev server through a tunnel instead of deploying. Faster to start, but it serves dev-mode output — unminified, uncached, no production build semantics — so the reviewer judges a build the client will never receive, and the link dies the moment the session ends.

## Composes with

- ultraweb:checkpoint — CP4 and CP6 are the two firing points; the URL joins the presentation, the screenshots stay as the record
- ultraweb:ship — the hard boundary: `--prod`, green gates, explicit confirmation, env push, and live verification all live there, never here
- ultraweb:gate-responsive — the reviewer's own phone is one extra honest breakpoint, never a replacement for the 375/768/1440 sweep
- ultraweb:status — records the URL in PROGRESS.md §Waiting-on-you so the reviewer never digs through a transcript for it
- ultraweb:gate-code — its `npm run build` green is precondition one; this skill reuses the result rather than re-litigating it
- ultraweb:seo — owns robots/sitemap for the production site; this skill's noindex is scoped to non-production and must never leak into it
