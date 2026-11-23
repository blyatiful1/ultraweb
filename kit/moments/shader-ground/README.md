# shader-ground

Animated WebGL ground behind a hero or band: slow noise in the background, primary and accent tokens.

Fits: product, studio, launch, editorial bands. Needs: none.

```html
<link rel="stylesheet" href="/kit/moments/shader-ground/moment.css">
<section data-moment="shader-ground" data-variant="flow" data-contrast="scrim">
  <div data-slot="content"><h1>Headline</h1><p>Text.</p></div>
</section>
<script type="module">import mount from '/kit/moments/shader-ground/moment.js'; mount(document.querySelector('[data-moment="shader-ground"]'));</script>
```
Give the section a height (min-height or padding). Every direct child sits above the canvas.

| option | values | default |
|---|---|---|
| variant | flow, contour, grid, caustic | flow |
| speed | 0-4 | 1 |
| scale | 0.25-4 (bigger = smaller features) | 1 |
| intensity | 0-1 (colour strength) | 0.6 |
| pointer | true, false (fine pointers only) | true |
| still | true: one still frame under reduced motion | false |
| data-contrast | scrim: token scrim behind `[data-slot="content"]` | none |

Weight: 13.9 KB (js+css), 4.6 KB gzip js.
Reduced motion, no WebGL, lost context, no JS: CSS gradient from the same tokens. Phones: same shader, DPR 1.5, resolution drops when frames exceed 20 ms. Adds a Pause motion button.
Text over the ground: the gates' contrast check marks it `review`; use `data-contrast="scrim"` or intensity <= 0.4 and check the worst frame.

Do not: put body copy over it without the scrim; mount two on one screen; set colours in JS; hide the pause button.
