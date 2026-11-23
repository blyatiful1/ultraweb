# cursor-trail
Inside one area, small images or token-coloured shapes follow the pointer with spring lag and fade out (`trail`), or a list row's preview follows the pointer and docks beside the focused row (`list`).

Fits: studio, shop, editorial. Needs: photos or none (none = shapes from tokens).

```html
<link rel="stylesheet" href="moment.css">
<section data-moment="cursor-trail" data-mode="trail" data-images="a.jpg,b.jpg"> ...hero content... </section>
<div data-moment="cursor-trail" data-mode="list"><ul>
  <li data-preview="a.jpg"><a href="/work/a">Title</a></li>
</ul></div>
<script type="module">import mount from './moment.js'; document.querySelectorAll('[data-moment="cursor-trail"]').forEach((el) => mount(el));</script>
```

| Option | Default | Meaning |
|---|---|---|
| `mode` | `trail` | `trail` or `list` |
| `images` | none | comma list (trail) |
| `count` / `size` / `step` / `life` | 8 / 88 / 64 / 900 | pool, px, px between drops, ms |
| `layer` | `below` | `above` puts trail over text |

Weight: 10.7 KB JS + 2.2 KB CSS.
Touch and reduced motion: effect off; list rows show inline thumbnails. No JS: plain list. Keyboard focus docks the preview beside the row.

Do not: put meaning only in the preview; mount outside the area; add your own `mousemove` handlers.
