# taste

The bar every ultraweb build is held to, the defaults to steer away from, and how to decide when two good rules pull apart.

Load when: Phase 2 starts, before any design decision, and again whenever you judge whether a page is good enough.
Reads: nothing. Writes: nothing.

## The bar

Score the work the way an Awwwards jury does: design 40, usability 30, creativity 20, content 10. Three consequences follow from the weights.

- Design and usability are 70 percent. A fast, clear, well-set site with one original idea outscores a spectacular site that is slow or confusing. Do not trade a usability point for a creativity point.
- Creativity is one idea executed fully, in one place. Two competing ideas score lower than one.
- Content is scored. Copy and imagery made for this client count; filler counts against.

A site at that level has five things.

1. A concept decided before any pixels. One sentence that says what the site is like and why that fits this subject. If the sentence would fit a competitor equally well, it is not a concept yet.
2. A look derived from the subject. Palette, type, layout and imagery can each be traced to the client's materials, artefacts, place or trade conventions. `references/direction.md` is the procedure.
3. One signature move, named, placed and budgeted. Everything around it stays quiet so it reads.
4. Typographic care. Faces chosen for this subject, a clear scale, and type used as design material where the concept wants it. Scale contrast is a decision: a very large headline is one answer, a small headline beside a large image is another.
5. Finish in the parts nobody demos: 404, empty and error states, focus rings, selection colour, favicon, share image, mobile menu, footer. These are held to the same level as the hero.

## Defaults to steer away from

The patterns below are what a model produces when no decision was made. Each is legitimate for some brief. Use one only when `design/DIRECTION.md` contains a sentence that derives it from this brief. The gates runner reports them in its tells census so the judge can check each against that sentence.

| Cluster | What it looks like |
|---|---|
| Warm editorial | Cream or off-white ground, high-contrast serif display, terracotta, clay or oxblood accent |
| Dark tech | Near-black tinted ground, one bright accent (acid green, orange, vermilion), mono labels |
| Broadsheet | Hairline rules, zero radius, dense newspaper columns, issue numbers |
| SaaS card kit | Identical rounded cards with the same soft shadow, gradient washes, three icon cards in a row |
| Template chrome | Tracked ALL-CAPS eyebrow above every heading; 01/02/03 markers on things that are not a sequence; mono type for small labels; middle-dot meta strings; an arrow appended to links; one italic or coloured accent word in the headline; a pill badge above the hero headline; a grayscale logo marquee; a bento grid; a grain overlay; glow blobs |
| Motion | Fade-and-rise on every section, hover lift on every card, stagger on everything |
| Type | Reaching for Inter, Geist, Space Grotesk, Fraunces, Instrument Serif, Playfair Display, DM Sans, Manrope or Poppins without a reason from the subject |
| Copy cadence | Fragment triplets ("Fast. Simple. Yours."), "Not X. Y.", imperative couplets, and the older vocabulary: welcome to, elevate, unlock, seamless, empower |
| Older tells | Purple-to-blue gradients, gradient headline text, emoji as icons, blur and glass on every surface |

Apply two tests to any homepage before showing it.

- Shown for three seconds without the logo, would a stranger guess the industry? If not, the look is not derived from the subject.
- Would the same stranger guess it was generated? If so, find which default is doing it and replace it with something from the subject sheet.

This table dates quickly. When you notice yourself choosing something because it looks designed, and you cannot name what in the subject asks for it, treat it as a default too.

## Rules no direction can waive

- Never fabricate proof: testimonials, reviews, ratings, client logos, statistics or awards. When the client has none, design the page without that section (`references/sections.md`). A demo build may show samples visibly marked `UNVERIFIED-PROOF`; that mark blocks a production deploy.
- No placeholder content ships: lorem ipsum, dead `#` links, placeholder image services, "Feature 1".
- Every string is written for this brief, and copy is written before layout (`references/copy.md`).
- WCAG 2.2 AA is the floor, measured by the gates plus the judgment items in `references/gates.md`. Keyboard access is complete and reduced motion is honoured.
- Performance budgets in `references/gates.md` hold on every route. Anything spectacular loads after the content and has a static fallback.
- Interactive states are designed: hover, focus-visible, active, disabled, loading, empty, error.
- One theme by default, chosen for the subject. Build a second theme only when the brief calls for it (apps, documentation, tools), and then design it rather than invert the first.

## Deciding

Where effort goes depends on the kind of site.

| Site | Lead with | Hold back |
|---|---|---|
| Product, SaaS, developer tool | Clarity and the real product UI | Decoration that hides what the product does |
| Studio, agency, portfolio | The concept; the site is the work sample | Convention for its own sake |
| Shop | Product photography; quiet chrome | Anything experimental in cart or checkout |
| Editorial, report | The reading experience | Motion while someone is reading |
| Place or local service | Real photographs, then address, hours, booking | Effects of any kind |
| Launch, campaign, game | One world the whole page lives in | A second idea |

- When two options tie, take the one that would only make sense for this client.
- When a section looks dull, fix its hierarchy, content or image first. An effect is the last resort.
- Push the chosen direction further before adding a second idea.
- Density is a decision. Generous space suits a single message; data and tools want density.
- A real photograph of the product, place or people outranks any gradient, mesh or abstract render.
- 3D, shaders and canvas enter only when the concept needs them, they hold 60 fps on mid-range hardware and a static fallback exists (`references/showpiece.md`).

## What award level takes

Sites at site-of-the-day level and above are carried by an original concept and by authored assets (photography, film, illustration, 3D, sound) more than by code. This plugin supplies the concept discipline, the engineering and the finish. The assets come from the client, from generation tools available in the session, or from procedural work that needs none. When a brief has no assets and no way to get them, choose a typographic or interaction-led concept that needs none. Do not fake assets, and do not promise an award.
