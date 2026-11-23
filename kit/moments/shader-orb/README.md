# shader-orb

Raymarched 3D object in one fragment shader, lit with the primary and accent tokens; turns with pointer and scroll. Asset-free stand-in for a 3D hero object.

Fits: product, studio, launch. Needs: none.

```html
<link rel="stylesheet" href="/kit/moments/shader-orb/moment.css">
<section class="hero">
  <div><h1>Headline</h1><p>Text.</p></div>
  <div data-moment="shader-orb" data-shape="blob"></div>
</section>
<script type="module">import mount from '/kit/moments/shader-orb/moment.js'; mount(document.querySelector('[data-moment="shader-orb"]'));</script>
```
The element is square (aspect-ratio 1) and fills its column; put it in the media slot, never behind text. Scroll progress is measured on the closest `<section>`.

| option | values | default |
|---|---|---|
| shape | blob, torus (twisted), crystal, liquid | blob |
| speed | 0-4 | 1 |
| pointer | true, false (fine pointers only) | true |
| scroll | true, false (rotation and morph follow the section) | true |
| quality | 0.3-1 max internal resolution | 0.75 |
| still | true: one still frame under reduced motion | false |

Weight: 15.2 KB (js+css), 5.2 KB gzip js. Optional token `--shadow-color` tints the contact shadow.
Reduced motion, no WebGL, lost context, no JS: a CSS sphere (ring for torus, hexagon for crystal) from the same tokens. Phones: same object, DPR 1.5, internal resolution steps down when frames exceed 20 ms. Adds a Pause motion button.

Do not: use more than one per page; make it the LCP element; put text inside it; describe it in alt text as "a 3D scene".
