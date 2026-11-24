# award invariants

The jury model and the constants that hold across award winners; `design-judge` scores with this file.

Load when: the judge runs, or DIRECTION.md is being checked against the award bar.
Reads: nothing. Writes: nothing.

## Jury model

| Axis | Weight | What the jury looks at |
|---|---|---|
| Design | 40% | hierarchy, typography, color, spacing, detail, hover and focus states, rhythm, coherence across pages |
| Usability | 30% | navigation clarity, mobile, load speed, layout stability, keyboard, reduced motion, no traps |
| Creativity | 20% | an original concept from the subject, a custom interaction, a signature move that serves the content |
| Content | 10% | copy quality and specificity, real media, real information |

Weighted score = 0.4 Design + 0.3 Usability + 0.2 Creativity + 0.1 Content, each 1 to 10. Design and usability are 70% of the score, so one point of usability lost costs more than one point of creativity gained. Never trade usability for spectacle. Aim for 8 on the weighted score with no axis under 7. An honorable mention sits around 6.5; site-of-the-day contenders sit near 8.

## Invariants

1. One signature move, pushed far. Two competing moves score lower than one.
2. Typographic conviction: real scale contrast, a face chosen for this subject, clear editorial hierarchy. It is read in seconds and dates slowest.
3. Restraint: a small, locked color system and low density with a few high moments.
4. Motion with one director: one easing personality, motion that means something, nothing decorative.
5. Technology serves the subject. A renderer with no narrative reason scores as a tech demo.
6. Craft and performance: fast, stable and accessible sites score higher on design and usability at once.
7. Whole-site coherence: the 404, contact page, footer and inner pages match the homepage's level.
8. The concept is decided before the pixels, and it comes from the subject's own world.

## Where winners lose points

Accessibility and usability are the recurring weak axes in the record: canvas-only text, hijacked scroll, gesture-only navigation, rotate-your-device walls, multi-megabyte first loads. A build that is equally striking and also passes WCAG 2.2 AA with a working reduced-motion path gains on two axes at once.
