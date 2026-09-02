## Composes with

- ultraweb:tokens — container tiers land as `--container-*` tokens in app/globals.css `@theme`.
- ultraweb:wireframe — consumes the split names and rhythm sizes when blueprinting each section.
- ultraweb:hero — builds its variants on Offset Split and Edge Bleed at full energy.
- ultraweb:feature-sections — governed by the bento and split rules here.
- ultraweb:gate-responsive — verifies rhythm and asymmetry survive 375/768/1440 screenshots.
- ultraweb:gate-performance — verifies the `content-visibility` wrappers on offscreen sections are present and introduce zero CLS.
- ultraweb:taste — supplies the asymmetry mandate and anti-wallpaper rule this skill operationalizes.
- ultraweb:gate-antislop — greps the anti-patterns defined here (`py-24` wallpaper, `max-w-[` arbitrary widths, repeated centered columns) and fails the build when the rhythm or tier system leaks.
- ultraweb:gate-visual — its design-judge scores this skill's compression-and-release rhythm and recurring asymmetry against taste's required list; flat spacing or a missing asymmetry reads as a required-list miss.
