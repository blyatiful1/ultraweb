---
name: copywriting
description: Voice definition and every string on an ultraweb site — derives a written voice spec from the brief's tone words, then writes headlines (hero H1 ≤8 words via named non-slop formulas), CTAs, microcopy, error/empty/success text, alt text, and metadata, enforcing an expanded banned-phrase list against dead startup copy. Invoke in Phase 8 (Voice) of the pipeline and whenever a Phase 6 section ships with draft strings; also when the user says "write the copy", "the headline is weak", "this sounds like AI", "fix the button text", "better error messages", or asks for taglines, CTAs, or microcopy.
---

# copywriting — copy is design

**Stage:** Phase 8 — Voice (consulted during every Phase 6 section build) - **Reads:** design/BRIEF.md (tone words, audience, offer), design/DIRECTION.md (archetype), design/SITEMAP.md part 2 (density budgets) - **Writes:** §Voice appended to design/DIRECTION.md + every string in components

## Standard

Every string is written for THIS brief in a defined voice. Headlines survive the swap test: paste one onto a competitor's site — if it still works, it says nothing and fails. Microcopy gets the same care as heroes; alt text and aria-labels are copy too. A string that could have been generated without reading the brief is a defect, not a draft.

## Voice definition (always first)

1. Take the 3 tone words from `design/BRIEF.md`. For each, write one "sounds like" and one "never sounds like" sentence pair — six sentences total.
2. Fix 5 mechanics: person (we/you/it), contraction policy, sentence-length ceiling in words, jargon policy (which domain terms are in, which are out), humor policy (none / dry / warm — never wacky).
3. Write 3 calibration strings — one hero headline, one button, one error message — and check each against every pair from step 1. These are the tuning fork for every later string.
4. Append the result as `## Voice` to `design/DIRECTION.md`. Phase 6 agents draft against it; Phase 8 rewrites in it.

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

Density budgets in `design/SITEMAP.md` part 2 override these downward, never upward.

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
- Alt text like "image" or "photo" — describe what the image argues, or mark it decorative

## Composes with

- ultraweb:brief — source of the tone words, audience, and offer the voice is built from
- ultraweb:direction — the voice must serve the archetype; §Voice lives in its file
- ultraweb:wireframe — its per-section density budgets are this skill's copy ceilings
- ultraweb:ui-states — the error/empty/success standards here fill the states it designs
- ultraweb:seo — meta titles and descriptions are written here, in the voice, within the char limits
- ultraweb:gate-content — the empirical check that bans held and headlines tell the story
