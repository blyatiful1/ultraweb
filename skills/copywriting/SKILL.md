---
name: copywriting
description: Voice definition and every string on an ultraweb site — derives a written voice spec from the brief's tone words, then writes headlines (hero H1 ≤8 words via named non-slop formulas), CTAs, microcopy, error/empty/success text, alt text, and metadata, enforcing an expanded banned-phrase list against dead startup copy. Invoke in Phase 8 (Voice) of the pipeline and whenever a Phase 6 section ships with draft strings; also when the user says "write the copy", "the headline is weak", "this sounds like AI", "fix the button text", "better error messages", or asks for taglines, CTAs, or microcopy.
---

# copywriting — copy is design

**Stage:** Phase 8 — Voice (consulted during every Phase 6 section build) - **Reads:** design/BRIEF.md (tone words, audience, offer), design/DIRECTION.md (archetype), design/SITEMAP.md part 2 (density budgets) - **Writes:** §Voice appended to design/DIRECTION.md + every string in components

## Standard

Every string is written for THIS brief in a defined voice. Headlines survive the swap test: paste one onto a competitor's site — if it still works, it says nothing and fails. Microcopy gets the same care as heroes; alt text and aria-labels are copy too. A string that could have been generated without reading the brief is a defect, not a draft. Body copy is scannable, not a wall: readers scan in an F-pattern and rarely pass a paragraph's first two sentences, so front-load the point and break three-plus supporting clauses into a list rather than a subordinate-clause pile-up — the ≤45-word body limit below is the ceiling, not the target (long-form technical prose is exempt).

## Voice definition (always first)

1. Take the 3 tone words from `design/BRIEF.md` and score them onto the **Voice Matrix** — four orthogonal 1–5 sliders: Formal↔Casual, Serious↔Playful, Plain↔Expressive, Reserved↔Bold. Then write one "sounds like" and one "never sounds like" sentence pair per tone word — six sentences total. The four numbers are the drift detector: every later string batch (hero, nav, footer, errors) gets a one-line check against them, so a witty hero can't sit beside a corporate-flat footer undetected.
2. **German register (de-DE — decide before any German string):** the Formal↔Casual slider made grammatical. Record **Sie** or **Du** plus a one-line brand rationale in `design/BRIEF.md`, then hold it across nav, forms, errors, confirmations, and transactional email. Sie for B2B, regulated, or trust-coded builds (Ledger & Lane; the Deutsche Bahn / Sparkasse convention); Du for D2C, playful, or modern ones (Loop & Thread, Framewalk; N26's deliberate break from bank convention). `gate-content` flags any mixed-register string the way it flags dead copy.
3. Fix 5 mechanics: person (we/you/it), contraction policy, sentence-length ceiling in words, jargon policy (which domain terms are in, which are out), humor policy (none / dry / warm — never wacky).
4. Write 3 calibration strings — one hero headline, one button, one error message — and check each against every pair from step 1 and the matrix scores. These are the tuning fork for every later string.
5. Append the result as `## Voice` to `design/DIRECTION.md`. Phase 6 agents draft against it; Phase 8 rewrites in it.

## Headline formulas (rotate — no two adjacent sections share one)

| Formula | Shape | Example |
|---|---|---|
| Plain claim | concrete outcome, declarative | "Your books, closed in three days." |
| Named enemy | attack the pain, not praise the product | "Spreadsheets were never meant to run payroll." |
| Specific number | a real figure carries the line | "14 grams. 40 hours. Zero cables." |
| Category reframe | deny the expected category | "Not a CRM. A memory." |
| Reader mid-action | second person, already in the scene | "You hit publish. We handle the rest." |
| Verb-first | imperative with a concrete verb | "Ship the update. Skip the meeting." |

Rules: every headline contains ≥1 concrete noun; abstract -ify/-ize verbs (simplify, optimize, revolutionize) never carry the sentence; run the swap test on every H1 and H2.

## Length limits (hard)

| String | Limit |
|---|---|
| Hero H1 | ≤8 words |
| Hero subhead | ≤20 words, one sentence |
| Section H2 | ≤8 words |
| Body paragraph | ≤3 sentences, ≤45 words |
| Button / CTA | ≤3 words |
| Nav label | 1–2 words |
| Testimonial pull quote | ≤30 words |
| Error message | ≤2 sentences |
| Meta title | ≤60 chars; meta description 140–160 chars |
| Kinetic-reveal beat (only if a reveal is selected) | ≤6–8 words; German ≤5–6 |

Density budgets in `design/SITEMAP.md` part 2 override these downward, never upward. When a kinetic-type reveal is on, split any line longer than one beat into multiple reveal beats with pauses (40–80ms stagger) — never shrink the font to fit; the `prefers-reduced-motion` fallback shows the full string at once.

## Banned phrases (taste list, expanded — grep for every one)

From taste, absolute: "Welcome to", "Elevate your", "Unlock the power of", "Seamlessly", "Empower".
Expanded, same status: "Supercharge", "Revolutionize", "Streamline your", "Effortlessly", "Take your ... to the next level", "All-in-one platform", "Built for the modern", "Blazingly fast", "Game-changer", "Cutting-edge", "Next-generation", "Best-in-class", "World-class", "Say goodbye to", "Say hello to", "In today's fast-paced world", "We've got you covered", "Look no further", "Unleash", "Leverage" as a verb, "your journey", "It's that simple", "Made simple", "Discover the difference", "robust" and "innovative" as praise, "solutions" unattached to a named problem.
No emoji in production copy (✨🚀🎉 — taste ban). Max 1 exclamation point per page; 0 in error messages.

## Microcopy standards

- **Buttons:** ≤3 words, verb-first, name the outcome — "Start free trial", "See pricing", "Book a call". Banned as defaults: "Submit", "Click here", "Learn more" (try a specific label first: "Read case study").
- **Errors:** what happened + how to fix, in that order, in the voice — "Card declined. Check the number or try another card." Never "Oops!", never "Something went wrong" without a next step, never blame ("You entered an invalid email" → "That email is missing an @").
- **Empty states:** state + action — "No projects yet. Create your first." Never a bare "No data".
- **Success:** confirm the specific thing — "Message sent — we reply within one business day." Not "Success!".
- **Form labels and hints:** labels are nouns, always visible (forms owns the layout); hints state the format before the error can happen ("8+ characters"), and validation errors follow the error rule above.
- **Loading:** name the work when it exceeds ~1s ("Generating preview…"); below that, the spinner speaks alone.

## Process

1. Define the voice (above) if `## Voice` is not yet in DIRECTION.md.
2. Inventory every string: grep components for JSX text, `aria-label`, `alt`, metadata objects, and server-action error returns. Nothing user-visible escapes the inventory.
3. Rewrite headlines first, in page order. Then read every H1→H2 aloud as a sequence — it must argue the page's conversion goal on its own (`gate-content` checks exactly this).
4. Rewrite microcopy: every button, error, empty, success, hint, and loading string against the standards above.
5. Sweep: grep the codebase for each banned phrase; fix all hits. Verify the hard limits on hero H1, H2s, and buttons by counting.
6. Read each full page aloud once. Any string you stumble on, rewrite shorter.

## Anti-patterns

- "Welcome to [Product]" as a hero — announces nothing (grep: "Welcome to")
- A headline that is the company's mission statement instead of the reader's outcome
- "Learn more" four times on one page (grep: "Learn more")
- "Submit" on any form (grep: ">Submit<")
- "Oops" or "Something went wrong" with no recovery path (grep: "Oops", "went wrong")
- Title Case On Every Headline Word — default to sentence case; if DIRECTION.md decides otherwise, keep it consistent site-wide
- Lorem ipsum or draft markers surviving into Phase 8 (grep: "lorem", "ipsum", "TBD")
- Body copy that re-explains the headline directly above it — say it once
- A marketing paragraph that buries its point in a subordinate-clause pile-up — lead with the conclusion, list the rest
- Mixed German register — Sie in checkout, Du in a toast confirmation (decide once in BRIEF.md, hold everywhere)
- A kinetic-reveal line too long to read before the stagger finishes — split into beats, never shrink the font
- Alt text like "image" or "photo" — describe what the image argues, or mark it decorative

## Worked example — Kaffeewerk Ost, roastery shop voice + hero copy

- Input read — BRIEF.md tone words: "sensory, direct, unhurried"; DIRECTION.md archetype: "Warm Workshop — craft, tactile, no marketing fluff."
- Voice Matrix from those tone words: Formal↔Casual **4**, Serious↔Playful **2**, Plain↔Expressive **3**, Reserved↔Bold **3** — the casual-4 score sets the de-DE register to **Du**, logged in BRIEF.md ("a Berlin roaster talks to regulars, not account holders").
- §Voice appended to DIRECTION.md: person "wir/du" (informal German); sentence ceiling 16 words; jargon IN: washed, natural, Röstprofil — OUT: "premium", "artisanal"; humor dry, never wacky.
- Calibration hero H1 (Specific-number formula, 6 words): "Röstung No. 14. Frisch aus Berlin."
- Subhead (11 words, one sentence): "Washed Yirgacheffe: Apricot, black tea, honey — dienstags geröstet, mittwochs bei dir."
- CTAs: /shop primary "Bohnen ansehen"; /abo "Abo starten" — verb-first, ≤3 words, never "Jetzt sichern".
- Sold-out empty state: "Ausverkauft — nächste Röstung Freitag." Order-confirm success: "Bestellung No. 4471 — geröstet und unterwegs zu dir."
- Rejected H1: "Frisch gerösteter Kaffee für Genießer" — trips no banned phrase, but it fits any German roaster alive and fails the swap test; only "Röstung No. 14" names something Kaffeewerk alone can write.
- Handoff: §Voice lands in design/DIRECTION.md; ultraweb:hero pulls the H1/subhead, ultraweb:pricing draws the /abo tier copy, and ultraweb:email drops the confirm string into the Resend order mail.

## Composes with

- ultraweb:brief — source of the tone words, audience, and offer the voice is built from
- ultraweb:direction — the voice must serve the archetype; §Voice lives in its file
- ultraweb:wireframe — its per-section density budgets are this skill's copy ceilings
- ultraweb:ui-states — the error/empty/success standards here fill the states it designs
- ultraweb:seo — meta titles and descriptions are written here, in the voice, within the char limits
- ultraweb:gate-content — the empirical check that bans held and headlines tell the story; for de-DE it also flags Sie/Du register drift across pages
- ultraweb:motion-language / ultraweb:scroll-motion — when a kinetic-type reveal is selected there, copy caps at 6–8 words per beat and the `prefers-reduced-motion` fallback shows the full string
- Consumed by every component-tier skill (hero, pricing, buttons, feature-sections, forms, social-proof, faq, footer) — they draft strings against §Voice rather than writing their own
- ultraweb:i18n — every string written here is what i18n externalizes into per-locale message catalogs; the voice — including the Sie/Du register decision — must survive translation intact
- ultraweb:gate-antislop — runs the banned-phrase grep this skill sweeps for; a dead-copy phrase that ships is its gate failure, not a style call
