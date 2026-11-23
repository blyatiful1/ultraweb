# typography

Choose the type system from the subject, load it correctly, and define a fluid scale with numbers.

Load when: choosing fonts, defining the scale, or the type feels generic.
Reads: design/DIRECTION.md, design/BRIEF.md. Writes: design/SYSTEM.md §type, `lib/fonts.ts` (Next) or `@font-face`/links in `site/` (static).

## Choosing the faces

There is no pairing table. Fixed lists produce the same sites. Work through this instead:

1. **Start from the subject's vernacular.** Where does this kind of thing already have a typographic tradition: signage, packaging, ledgers, specimen books, manuals, posters, labels, scores, schedules, maps? Name the tradition in one line in SYSTEM.md. The face comes from that tradition or deliberately contradicts it, with a reason.
2. **One family, or two clearly distinct.** One family used across weights, widths or optical sizes is a complete system. Two families work when they differ in structure (for example serif against sans, or text against a display cut), not when they are two similar sans. Add a third face only for a function (code, figures) the brief needs.
3. **Shortlist two or three candidates, then test with the real copy.** Set the actual H1, a paragraph and a number or price in each at the real sizes, on the real ground, in a scratch HTML file or the mockup. Choose by looking at the render, at 390px and 1440px.
4. **Verify the family exists and builds.** Check the exact name, axes (`opsz`, `wght`, `wdth`, `ital`), weights and the subsets the content needs (accented Latin for German, Portuguese) in the catalog or foundry page. Run a build; next/font fails on a wrong name or missing weight.
5. **Licensing.** Google Fonts families are open licensed. A foundry face needs a web license covering the traffic; record it in SYSTEM.md and load with `next/font/local`. A face the client owns (BRIEF.md assets) wins.
6. **Reflex choices need a written reason.** Many generated sites share these: the sans the starter template ships, the default sans of component libraries, a high-contrast display serif over a neutral grotesque by habit, and a mono face for small labels because it looks technical. Any is fine when SYSTEM.md says why this subject calls for it; otherwise return to step 1.

Record in SYSTEM.md: the tradition, faces, weights and axes, tracking and leading, scale values.

## Loading (Next)

- Variable families need no `weight`. Single-weight families require `weight: "400"` (or whichever exists); omitting it fails the build. Static families take an array: load only the weights SYSTEM.md uses.
- Request the axes you use (`axes: ["opsz"]` and similar). One variable file is smaller than several static cuts.
- Export a CSS `variable` for each face from `lib/fonts.ts`, put the variables on `<html>`, and bridge them in the token file (`references/tokens.md`).
- `next/font/local` does not do `next/font/google`'s automatic metric fallback. Set an explicit `fallback` and, if needed, `adjustFontFallback` or manual `size-adjust`/`ascent-override` values. Verify layout shift in the performance gate before shipping a local face.
- No `fonts.googleapis.com` link in a Next site; next/font self-hosts. In static `site/`, self-host the files.
- At most two families plus an optional functional third, about four weights.

## Fluid scale

Interpolate linearly between two viewports, V1 = 390 and V2 = 1440, with min and max sizes in px:

```
slope     = 100 * (max - min) / (V2 - V1)       -> the vw coefficient
intercept = (min - slope * V1 / 100) / 16       -> rem
clamp(min/16 rem, intercept rem + slope vw, max/16 rem)
example: min 40, max 76 -> clamp(2.5rem, 1.66rem + 3.43vw, 4.75rem)
```

- Body stays nearly fixed (16 to 18px); display sizes grow fast. How large the largest size is comes from `design/DIRECTION.md`: a type-led direction may set the hero many times body size, an image-led one may keep it modest.
- Use viewport `clamp()` for section-level type only. Type inside a reusable component that renders at many widths sizes to its container: `font-size: clamp(1rem, 6cqi, 2.5rem)` inside a `container-type: inline-size` wrapper.

## Weight, tracking, leading, measure

- Body weight about 400 against a display weight at least 200 away, or get contrast from size and style. No adjacent mid weights (500 and 600) in one hierarchy.
- Tracking: display at 40px and above about -0.01 to -0.03em (grotesques more, serifs less); body 0; never positive on large lowercase. Text set in capitals needs about +0.05 to +0.1em.
- Leading: display 0.95-1.1, headings 1.1-1.25, body 1.5-1.7, captions about 1.4; check the real face's ascenders and descenders.
- Measure: body 55-75 characters (`max-width` in `ch`).
- `text-wrap: balance` on headings, `pretty` on prose; no hand-placed `<br>` in headlines. `text-box-trim` aligns cap height where supported; check current support and treat it as an enhancement. Use an optical-size axis when the face has one.

Grep: `text-7xl` `text-8xl` · `tracking-widest` on headlines · `leading-none` on multi-line text · `font-medium` mixed with `font-semibold` · `<br>` in headings · a font name in CSS that no loader provides.
