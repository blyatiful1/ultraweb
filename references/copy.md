# copy

Define the site's voice and write every string into a copy deck before any layout is built.

Load when: Phase 4 (writing the copy deck), and whenever a string is added or changed later.
Reads: design/BRIEF.md (tone, audience, content inventory, client phrases from §Assets), design/DIRECTION.md. Writes: `## Voice` in design/DIRECTION.md, the copy deck in design/SITEMAP.md.

Copy comes first. Layouts are sized to the real strings in the deck; a layout drawn around placeholder lengths gets redrawn.

## Voice

1. Score the brief's three tone words on four 1–5 sliders: Formal–Casual, Serious–Playful, Plain–Expressive, Reserved–Bold. The four numbers are the drift check: every later batch of strings (hero, nav, footer, errors, emails) is checked against them in one line.
2. For each tone word write one "sounds like" sentence and one "never sounds like" sentence, about this business.
3. Fix five mechanics: person (we / you / the brand name), contractions yes or no, maximum sentence length in words, which trade terms are in and which are out, humor (none, dry or warm).
4. German copy: decide Sie or Du before the first string, with a one-line reason (Sie for B2B, regulated or trust-led work; Du for consumer and playful brands), and hold it everywhere, including forms, errors and transactional email.
5. Write three calibration strings: the hero headline, one button, one error message. Check each against the sliders and the sentence pairs. Append all of this as `## Voice` in DIRECTION.md.

## Writing a headline

1. Start from the content inventory, not a template. Find the one fact, number, name or customer phrase this business has that a competitor does not.
2. Write five versions that put that fact first. Use the client's own words from §Assets when they exist.
3. Run the swap test on each: paste it onto a competitor's site. If it still works, it says nothing. Cut it.
4. Keep the version a customer would repeat to a friend. Read every H1 and H2 on the page in order: together they should make the page's case for the conversion.
5. Every headline contains at least one concrete noun. Abstract verbs (simplify, optimize, transform, revolutionize) never carry the sentence.

## Cadences to avoid

These are what current models write by default, so readers now take them as machine copy. Use one only when the voice section argues for it, and never twice on a page.

- Fragment triplets: "Fast. Private. Yours." / "14 grams. 40 hours. Zero cables."
- Negation reframes: "Not a CRM. A memory." / "It's not X, it's Y." / "More than just X."
- Imperative couplets: "Ship the update. Skip the meeting." / "Less X. More Y."
- Rhetorical openers: "What if…?" / "Ever wondered…?" / "Here's the thing."
- Punchline after a dash at the end of a sentence, and em-dash chains in body copy.
- "Meet X", "X, reimagined", "X, but better", "The future of X", "for humans", "finally", "just works".
- Self-praise of craft: "thoughtfully crafted", "obsessively designed", "meticulously", "with care".
- Triads of adjectives in a subhead ("simple, powerful, and secure").

Older dead startup vocabulary, banned outright: "Welcome to", "Elevate your", "Unlock the power of", "Seamless(ly)", "Empower", "Supercharge", "Revolutionize", "Streamline your", "Effortless(ly)", "Take your … to the next level", "All-in-one platform", "Built for the modern", "Blazing(ly) fast", "Game-changer", "Cutting-edge", "Next-generation", "Best-in-class", "World-class", "Say goodbye to", "Say hello to", "In today's fast-paced world", "We've got you covered", "Look no further", "Unleash", "Leverage" as a verb, "your journey", "Discover the difference", "AI-powered", "robust" and "innovative" as praise, "solutions" with no named problem. No emoji in production copy. At most one exclamation mark per page, none in errors.

## Length limits

| String | Limit |
|---|---|
| Hero H1 | 8 words |
| Hero subhead | 20 words, one sentence |
| Section H2 | 8 words |
| Body paragraph | 3 sentences, 45 words |
| Button | 3 words |
| Nav label | 2 words |
| Testimonial pull quote | 30 words |
| Error message | 2 sentences |
| Meta title | 60 characters |
| Meta description | 140–160 characters |

Count, do not estimate. Density limits in SITEMAP.md may lower these, never raise them. Long technical documentation is exempt from the paragraph limit. German runs about 30% longer: plan the layout for the German string, not the English one.

## Microcopy

- Buttons name the outcome: "Book a table", "See pricing", "Start trial". Not "Submit", "Click here", or "Learn more" when a specific label exists ("Read the case study").
- Errors say what happened, then how to fix it, in the voice: "Card declined. Check the number or try another card." No "Oops", no "Something went wrong" without a next step, no blaming ("That email is missing an @", not "You entered an invalid email").
- Empty states give state plus action: "No orders yet. Browse the roasts."
- Success confirms the specific thing and what happens next: "Message sent. We reply within one business day."
- Hints state the format before the error can happen ("8 or more characters").
- Loading text names the work only when it takes over a second.
- Alt text says what the image shows and why it is there; decorative images get `alt=""`.
- Sentence case for headings unless DIRECTION.md decides otherwise; then hold it site-wide.

## The copy deck

Write it in design/SITEMAP.md under each route, one block per section, before Phase 5 builds anything:

```md
### / — hero
H1: …
Sub: …
CTA: … → /route
Notes: proof source, word counts
```

Every user-visible string goes in the deck: headings, body, buttons, nav, footer, form labels and hints, errors, empty and success states, meta title and description, alt text for content images. Components read strings from the deck; no string is invented inside a component. A string that changes later is changed in the deck first.

## Checks before handing over

- Grep the deck and the source for every banned phrase above.
- Count words on every H1, H2 and button.
- Run the swap test on every H1 and H2.
- Read each page's strings aloud once; rewrite any sentence you stumble on, shorter.
- Check every proof string traces to a real source in BRIEF.md; nothing invented.
