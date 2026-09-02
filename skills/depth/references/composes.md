## Composes with

- ultraweb:color — supplies the neutral ramp hue for shadows and the dark-mode surface steps.
- ultraweb:tokens — the scale ships as `--shadow-*` tokens in app/globals.css `@theme`.
- ultraweb:cards — consumes levels 1-2 and the border+shadow pairing for rest/hover.
- ultraweb:navigation — sticky header takes level 2 on scroll and is the default (only) glass candidate.
- ultraweb:micro-interactions — animates level transitions within the 150-250ms budget.
- ultraweb:gate-accessibility — computationally verifies text contrast on any glass surface, and emulates `forced-colors: active` to prove every elevated surface keeps a visible boundary.
