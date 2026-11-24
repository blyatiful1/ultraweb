# pinned-chapters
A media column stays in view (CSS sticky) while 2-6 text chapters scroll; the media follows the chapter at mid-screen.

Fits: product, studio, editorial, place, launch. Needs: none, or photographs (images, inline SVG or coloured panels with a big numeral all work).

Markup (root children = chapters only):
```html
<link rel="stylesheet" href="moments/pinned-chapters/moment.css">
<section data-moment="pinned-chapters" data-transition="fade">
  <article data-pc-chapter id="one" data-pc-title="Short label">
    <div data-pc-media data-pc-tone="primary"><span data-pc-big aria-hidden="true">01</span></div>
    <div data-pc-body><h2>Heading</h2><p>Text</p></div>
  </article>
  <!-- repeat; media: img, svg or tone panel (primary accent card) -->
</section>
<script type="module">import mount from './moments/pinned-chapters/moment.js'; mount(document.querySelector('[data-moment="pinned-chapters"]'));</script>
```
| Option (or data-attr) | Default | Meaning |
|---|---|---|
| transition | fade | fade, slide or clip |
| threshold | 0.5 | viewport height fraction (0.15-0.85) where a chapter becomes active |
| data-pc-side="right" | left | media column on the right |

Weight: 5.4 KB JS + 5.8 KB CSS.
Wide screens (900px+): pinned. Phones, reduced motion, no JS: stacked, each chapter's media above its text, no sticky.

Do not: put the media outside chapters; add `overflow:hidden` to ancestors (breaks sticky); add a header inside the root; give a chapter no `id`.
