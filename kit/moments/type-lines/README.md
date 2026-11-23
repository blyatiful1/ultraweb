# type-lines
Headline or paragraph that rises line by line from behind a mask, once.

Fits: any site; hero headlines, section intros, editorial paragraphs.
Needs: none.

Markup (inline `<em>`, `<a>` are kept and stay focusable):
```html
<link rel="stylesheet" href="moments/type-lines/moment.css">
<h1 data-moment="type-lines" data-trigger="load">Your headline here</h1>
<script type="module">
import mount from './moments/type-lines/moment.js';
document.querySelectorAll('[data-moment="type-lines"]').forEach((el) => mount(el));
</script>
```

| Option (data-attr / key) | Default | Meaning |
|---|---|---|
| stagger | 70 | ms between lines |
| duration | `--dur-section` | ms per line |
| trigger | view | `view` (when entering viewport) or `load` |
| once | true | `false` replays each time it re-enters |

Weight: 5.7 KB JS + 0.8 KB CSS (unminified).
Reduced motion: not mounted, text shown as is. No JS: text shown as is. Phones: same effect, lines recomputed at the narrow width.
Resize and late web fonts re-measure lines without replaying. `mount()` returns a cleanup that restores the text.

Do not: hide the element in your own CSS; set `overflow` or a fixed `height` on it; use it on text longer than about 80 words; wrap each line yourself.
