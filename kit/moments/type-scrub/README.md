# type-scrub
Large statement whose words go from muted to full colour in reading order as it scrolls through the viewport. Reversible, no pinning.

Fits: any site; manifestos, positioning statements, editorial intros.
Needs: none.

Markup:
```html
<link rel="stylesheet" href="moments/type-scrub/moment.css">
<p data-moment="type-scrub" style="font-size:clamp(2rem,6vw,4.5rem)">Your statement, one or two sentences.</p>
<script type="module">
import mount from './moments/type-scrub/moment.js';
document.querySelectorAll('[data-moment="type-scrub"]').forEach((el) => mount(el));
</script>
```

| Option (data-attr / key) | Default | Meaning |
|---|---|---|
| start | 0.85 | element top at this fraction of viewport height = 0% |
| end | 0.35 | element bottom at this fraction = 100% |
| muted | 0.18 | opacity of unread words |
| engine | auto | `auto` uses CSS `animation-timeline: view()` when supported; `js` forces the scroll-listener path |

Weight: 4.7 KB JS + 0.8 KB CSS (unminified).
Reduced motion: not mounted, all words full colour. No JS: all words full colour. Phones: same effect.

Do not: pin the element or add scroll-snapping; use more than about 40 words; set your own opacity on the words; put it in an element shorter than one line.
