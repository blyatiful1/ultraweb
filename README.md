# ultraweb

## You hire a design studio. It fits in one prompt.

Somewhere in a nicer timeline there's a small agency that does this properly. An art director who refuses the purple gradient. A design engineer who ships tokens before components. A critic who screenshots your site at 375px and tells you the truth about it. They cost forty thousand euros and they're booked until spring.

**ultraweb is that studio, as a Claude Code plugin.** 72 skills and 3 subagents that argue with each other on your behalf until something good comes out the other end — a real Next.js site, built, judged, and fixed before you ever see it.

```text
/ultraweb build me a website for a Berlin specialty coffee roastery with an online shop
```

Then go make coffee yourself. It'll be a while.

---

## See it defend itself

**[ultraweb-site.vercel.app](https://ultraweb-site.vercel.app)** — built by this pipeline, from one prompt, with no human touch-ups.

The whole paper trail is public at [blyatiful1/ultraweb-site](https://github.com/blyatiful1/ultraweb-site): every decision the studio made on the way (brief → direction → system → sitemap → QA), the 58/72 skill-coverage ledger, and each gate's receipts. The homepage renders its own report card. If the site were bad, you'd be able to prove it from the repo.

---

> [!IMPORTANT]
> **This thing is expensive.** A full build runs twelve phases and loops through screenshot-driven critique until it stops finding problems. It burns far more tokens, and far more minutes, than a normal prompt. That's not inefficiency — that's the part that makes it good. [The honest math is below.](#the-bill)

## Getting it

**From the marketplace,** inside any Claude Code session:

```text
/plugin marketplace add blyatiful1/ultraweb
/plugin install ultraweb@ultraweb
```

Confirm the dialog, run `/reload-plugins`, done. Later: `/plugin marketplace update ultraweb`.

**Or by hand,** straight into your skills folder:

```bash
git clone https://github.com/blyatiful1/ultraweb.git ~/.claude/skills/ultraweb
```

Loads itself next session as `ultraweb@skills-dir`. Update with `git pull`, uninstall with `rm -rf`.

**Did it work?** `/plugin` lists ultraweb, and `/ultraweb` answers when called.

## Using it

One sentence about what you want. That's the entire interface.

The pipeline takes it from there: understand the brief → commit to an aesthetic direction → build the design system → plan the pages → scaffold → build → wire the backend → write the copy → choreograph the motion → make it findable → run the gates → ship. Every phase leaves a written record in `design/*.md` inside your project, which is how 72 skills manage to agree with each other three hours later.

**Already have an ultraweb site?** Just say what's wrong — *"the hero's too timid"* — and `ultraweb:iterate` scopes the change and re-runs only the gates you actually disturbed.

**Have some other site?** `ultraweb:retrofit` reads it and hands back a scored, unflattering gap report.

## The bill

A full `/ultraweb` run is a studio engagement, not an API call, and the token count reflects that:

- **twelve phases**, each one actually loading and following its skills — not vibing them from memory;
- **an accumulating context** — every phase writes artifacts the later phases read back, so the working set grows as the build does;
- **quality gates that loop** — screenshots at 375 / 768 / 1440, scored against a rubric, fix → re-gate → fix again until it goes green;
- **and in fan-out mode**, an agent per page group and an agent per gate, multiplying all of the above.

Model routing keeps it as honest as it can — mechanical sweeps drop to Sonnet 5, judgment stays up on Opus 5 — but cheaper per call is not the same as cheap.

**How to spend less:** build once, then talk to it. Full runs are for new sites and total redesigns. Everything after that is `iterate`, which touches only what your change touched.

## Why the output isn't slop

Four things do most of the work:

🧭 **`taste` — the constitution.** A banned list (no purple AI gradient, no untouched shadcn, no "Empower your workflow" copy), a required list (OKLCH palette, a real type pairing, deliberate asymmetry, honored reduced-motion), and the heuristics for deciding everything in between. Every other skill bows to it.

🏆 **`award-canon` — the library.** 31 Awwwards Site-of-the-Year and SOTD-tier winners from 2017 to 2026, studied and rendered down into 25 named, transferable patterns — plus the invariants that survived every era, the jury's own scoring weights, and a list of moves that have visibly aged. Each claim carries its verified award tier; dead sites are marked *reconstructed*, never passed off as inspected. The prime directive: **steal the principle, never the surface.**

🚦 **Seven gates that don't take your word for it.** Code, responsive, visual, accessibility, performance, anti-slop, content — each verified empirically. Real builds. Real Playwright screenshots. Computed contrast. Lighthouse. The site isn't finished until `design/QA.md` is green, and nothing is allowed to fake green.

📌 **`STACK.md` — the reality check.** Stack facts checked against live npm and official docs rather than training memory, so skills cite Next 16's `proxy.ts` and `preload`, Tailwind v4's `@theme`, Motion 12's `motion/react`. When the ecosystem moves, one file moves.

And underneath all of it: nearly every skill ends with a real decision traced end to end, drawn from a recurring cast of eight fictional clients — a Berlin roastery, a port-logistics SaaS, an Oslo agency, a Lisbon restaurant, a law firm, a game studio, a foundation, a textiles shop. Skills sharing a client agree on its palette, its type, its routes. The examples don't just illustrate the skills; they demonstrate the handoff between them.

## The studio floor

| Department | Who's in it |
|------|--------|
| 🎩 **Direction** | `ultraweb` (the pipeline itself), `taste`, `iterate`, `award-canon` |
| 🔍 **Discovery** | `brief`, `direction` (12 archetypes), `sitemap`, `wireframe`, `copywriting` |
| 🎨 **Design system** | `tokens`, `color`, `typography`, `layout-grid`, `depth`, `shape-language`, `icons`, `imagery`, `motion-language`, `theme-worlds` |
| 🧱 **Components** | `component-api`, `hero`, `navigation`, `footer`, `feature-sections`, `cards`, `buttons`, `forms`, `data-display`, `pricing`, `social-proof`, `faq`, `ui-states`, `overlays`, `cart`, `product-detail`, `command-palette`, `marginalia` |
| 💫 **Motion** | `micro-interactions`, `scroll-motion`, `page-transitions`, `physics`, `showpiece`, `animejs`, `hidden-craft` |
| ⚙️ **Engineering** | `scaffold`, `app-structure`, `routing`, `data-fetching`, `server-actions`, `media-optimization`, `seo`, `i18n`, `print-craft` |
| 🔌 **Backend** | `api-design`, `database`, `auth`, `email`, `payments`, `content-cms`, `storage`, `consent`, `analytics` |
| 🚦 **QA** | `gate-code`, `gate-responsive`, `gate-visual`, `gate-accessibility`, `gate-performance`, `gate-antislop`, `gate-content` |
| 📦 **Delivery** | `ship`, `handoff`, `retrofit` |

Three specialists work outside the main line, each pinned to its own model tier:

- **`design-judge`** — the adversarial critic. Looks at screenshots, scores them against the award-canon invariants and the jury model, and is under no obligation to be nice. *(Opus 5)*
- **`pixel-qa`** — sweeps every breakpoint with Playwright and reports what it actually saw. *(Sonnet 5)*
- **`stack-doctor`** — fixes broken toolchains without the classic cowardice of downgrading. *(Opus 5)*

The same policy governs all fan-out work: judgment stays on the lead model, specialist builds and critiques on Opus 5, mechanical sweeps on Sonnet 5.

Want the full scope of all 72? → [ROSTER.md](ROSTER.md). Want the per-site award study bank? → [skills/award-canon/CANON.md](skills/award-canon/CANON.md).

## What you need

- **Claude Code** — CLI, desktop, or web.
- **Node + npm** — something has to build the Next.js app.
- **Playwright MCP** — the eyes. Without it, the visual and responsive gates degrade to an honest *"unverified"* instead of quietly waving your site through.
- **Token headroom** — see [the bill](#the-bill). This is a long job. Start it when you have room for it.

---

*Built by [Iwan Braun](https://github.com/blyatiful1). Steal the principle, never the surface.*
