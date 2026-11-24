# horizontal-rail
Cards or images in a row wider than the screen move sideways while the reader scrolls down a tall section.

Fits: studio, shop, editorial, product. Needs: photographs or none (text cards work).

Markup:
```html
<link rel="stylesheet" href="moments/horizontal-rail/moment.css">
<section data-moment="horizontal-rail" aria-labelledby="rail-h">
  <h2 id="rail-h">Heading</h2>
  <div data-hr-rail role="group" aria-label="Describe the items" tabindex="0">
    <ul data-hr-track>
      <li data-hr-item><figure><img src="a.jpg" alt="..." width="800" height="1000"><figcaption>...</figcaption></figure></li>
    </ul>
  </div>
</section>
<script type="module">import mount from './moments/horizontal-rail/moment.js'; mount(document.querySelector('[data-moment="horizontal-rail"]'));</script>
```
| Option (or data-attr) | Default | Meaning |
|---|---|---|
| progress | true | thin progress bar while pinned |
| minWidth | 900 | px width from which the pinned mode is used |
Style: `--hr-item-w`, `--hr-gap`, `--hr-gutter` on the section.

Weight: about 8 KB JS + 3.3 KB CSS.
Pinned (900px+): sticky + translateX. Focusing an off-screen item scrolls the page to show it. Phones, reduced motion, no JS: native scroll-snap strip with scrollbar and prev/next buttons (buttons need JS; scrollbar always).

Do not: put `overflow:hidden` on ancestors; use fewer than 4 items; remove `role="group"` or its label; nest the rail in another scroller.
