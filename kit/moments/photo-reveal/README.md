# photo-reveal
Media frames open with a clip-path wipe; the picture settles from a slight zoom inside a fixed frame.

Fits: any site; hero image or grid. Needs: photos (`<img>`/`<video>`/`<svg>` with width and height attributes).

```html
<link rel="stylesheet" href="moment.css">
<div data-moment="photo-reveal" data-stagger="90">
  <figure data-reveal data-from="left">
    <img src="a.jpg" width="1600" height="1000" alt="Describe the picture">
  </figure>
  <figure data-reveal data-from="centre"><img src="b.jpg" width="800" height="1000" alt="..."></figure>
</div>
<script type="module">import mount from './moment.js'; mount(document.querySelector('[data-moment="photo-reveal"]'));</script>
```
A single image: put `data-moment="photo-reveal" data-reveal data-from="centre"` on the `<figure>` itself.

| Option (attr or object) | Default | Meaning |
|---|---|---|
| `data-from` (per frame or root) | `bottom` | `left` `right` `top` `bottom` `centre` |
| `stagger` | 90 | ms between frames entering together |
| `parallax` | true | `false` turns off; per frame `data-parallax="off"` |
| `data-ratio` (per frame) | from width/height | crop to e.g. `16/9` |

Weight: 6.0 KB JS + 4.1 KB CSS.
Reduced motion and no JS: pictures visible at once. Phones: wipe, no parallax. Failed image: `--muted` frame. Late image: fades in.

Do not: omit `width`/`height`; put text in the frame; set your own `scale`/`translate` on the media.
