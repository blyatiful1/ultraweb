# particle-field

Soft points drift through curl noise, dodge the pointer, gather into a word or SVG path.

Fits: launch, studio, product, editorial. Needs: none.

```html
<link rel="stylesheet" href="/kit/moments/particle-field/moment.css">
<section data-moment="particle-field" data-gather="scroll" style="min-height:100vh">
  <p data-particle-word>Drift</p>
  <div data-slot="content"><p>Text.</p></div>
</section>
<script type="module">import mount from '/kit/moments/particle-field/moment.js'; mount(document.querySelector('[data-moment="particle-field"]'));</script>
```
The word is real text; style its size there. Particles draw it in its box and font; it is transparent only while WebGL runs. One short word.

| option | values | default |
|---|---|---|
| gather | scroll (form at mid-screen), always, off | scroll |
| path | SVG path `d` (used instead of the word) | none |
| viewbox | "minx miny w h" of the path | 0 0 100 100 |
| pointer | repel, attract, off (fine pointers only) | repel |
| radius | pointer radius px | 120 |
| density | 0.1-3 | 1 |
| size | point size px | 3.5 |
| speed | 0-4 | 1 |

Weight: 16.1 KB (js+css), 5.6 KB gzip js. Count follows area (max 7000; phones half, max 3000) and drops when frames exceed 20 ms. Dark background token: additive glow; light: normal blending.
Reduced motion, no WebGL, lost context, no JS: the word stays visible over a dotted token ground. Adds a Pause motion button.

Do not: use long phrases; put body copy where the word forms.
