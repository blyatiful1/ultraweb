# image-sequence
A canvas steps through numbered frames as a tall sticky section scrolls (product rotation); HTML captions fade in at set progress ranges.

Fits: product, launch, shop. Needs: image sequence.

Markup:
```html
<link rel="stylesheet" href="moments/image-sequence/moment.css">
<section data-moment="image-sequence" data-frames="/seq/frame-{0000}.webp" data-count="120" data-start="1" data-length="400">
  <div data-is-sticky>
    <img data-is-poster src="/seq/frame-0001.webp" alt="Describe the first frame">
    <div data-is-caption data-from="0.05" data-to="0.35"><h2>Caption</h2><p>Text</p></div>
  </div>
</section>
<script type="module">import mount from './moments/image-sequence/moment.js'; mount(document.querySelector('[data-moment="image-sequence"]'));</script>
```
| Option (or data-attr) | Default | Meaning |
|---|---|---|
| frames | - | `data-frames` URL with `{0000}` (zeros = digits), or `options.frames` array of canvases/images (see demo.html) |
| count | - | number of frames |
| start | 1 | number of the first frame |
| length | 400 | section height in vh |
| fit | cover | cover or contain |
| preloadStride | 8 | first load every Nth frame, then fill in |
Caption: `data-from`/`data-to` progress 0-1; `data-align` left, center or right.

Sequence: 60-150 frames, 1600 px wide, WebP q70-80, under 6 MB total. Phones load every 2nd frame.
Weight: 8.2 KB JS + 1.6 KB CSS.
No JS / reduced motion: poster and captions as text. Do not: skip the poster; put text in frames; exceed 150 frames.
