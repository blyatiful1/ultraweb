# A shorter path, and a finish-only pass, 2026-11-24

Two questions about the smallest Claude tier, one new brief (a ceramics studio in Cologne that sells small batches and teaches), one-page static setup, one grader.

## Why look again

On the bike-workshop brief the smallest tier, following ultraweb, wrote a main page of about 28 KB (HTML, CSS and script) plus 17 KB of design documents and two legal pages. With `frontend-design` it wrote 54 KB of page. The middle tier, following ultraweb, wrote 92 KB and won its round. The builder's own friction log was almost entirely about process files. The working guess: on the smallest tier the process takes the effort the page needs.

## Question 1: does a shorter ultraweb path look better?

A prototype replaced the one-page reading list (about ten files, five design documents) with one 7 KB file: study the subject, a 45-line plan, build section by section to a stated size, then the gates. It kept the honesty marks and the correctness floor. Fonts were self-hosted with a new helper, `scripts/fonts.mjs`.

| Arm | Grader preferred (blind) | Gates | Tokens | Time | Page |
|---|---|---|---|---|---|
| ultraweb, shorter path | | pass (27 pass, 2 review) | 163k | 9 min 52 s | 53 KB, 8 sections, 8 drawings |
| frontend-design | yes | fail, 5 checks | 146k | 4 min 11 s | 41 KB, 6 sections, 3 drawings |

The shorter path fixed what it was aimed at: the page was nearly twice the size of the earlier ultraweb page on this tier, for about two thirds of the tokens, and it passed the gates. It still lost on looks.

What the two pages show:

- The prototype said "headline at 96px or larger". The builder set a long sentence at 96px; it ran to seven lines and pushed the main action off the first screen. A size rule without a length rule made the page clumsier.
- The prototype named the cream, serif and terracotta look as a habit to avoid and, two lines earlier, told the builder to take colours from the subject. For a pottery the subject is clay. The builder chose cream, serif and terracotta, and put a small all-caps label above every heading, which the same list also named.
- The frontend-design page was quieter and held together: one unusual ground colour, each piece drawn beside its own figures, quantity controls in the list itself.

The grader has now preferred the frontend-design page over four different versions of ultraweb's design guidance on this tier, on most briefs. Adding rules made the smallest tier heavier-handed, not better. The shorter path was not adopted.

## Question 2: can ultraweb finish a page it did not design?

The preferred page failed five checks (form labelling, keyboard access, target size at 24 and 44 px, text spacing). A second run on the smallest tier was given a copy of it and one instruction file: make it pass, change nothing a visitor would notice unless a check requires it (`references/finish.md` is that file, revised).

| | Before | After |
|---|---|---|
| Gates | fail, 5 checks | pass (34 pass, 2 review, 2 skipped) |
| Desktop screens, pixels that differ | | 5 to 6%; the page is 31 px taller, so most content sits slightly lower |
| Visible changes | | a skip link on focus, an asterisk on required fields, honest form messages, and on a phone the navigation wraps to two lines |
| Drafted facts marked | 0 | 18 |

Cost: 147k tokens and 4 min 19 s, so design plus finish came to about 290k tokens, more than either ultraweb path alone.

Two corrections were made by hand after the run, and both are now in the instruction file:

- The site check failed because the project had no `design/BRIEF.md` with a `Deployment mode:` line. The run reported this rather than working around it.
- The run "corrected" a weekday that was already right (28 November 2026 is a Saturday). The file now forbids correcting content that no check names.

The font step in `references/finish.md` (self-hosting fonts that the page loads from another server) was not part of this run.

## What changed in the plugin

- `scripts/fonts.mjs`: fetches a family once and prints the `@font-face` rules. Both builders in the earlier rounds lost steps doing this by hand.
- `references/finish.md`, and a pointer to it from the `gates` skill.
- `references/sketch.md`: when the `frontend-design` skill is installed it designs and builds first and ultraweb finishes; the headline rule now limits the lines as well as the size.

## Limits

One brief, one build per cell, one grader. The finish pass was not blind: the grader was shown the page before and after. The first screens are not in `docs/compare/`.
