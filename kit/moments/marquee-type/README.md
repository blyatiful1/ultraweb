# marquee-type
Oversized line of text travelling sideways in a seamless loop. Scrolling speeds it up and reverses it with scroll direction.

Fits: any site; brand statements, section dividers, footers.
Needs: none.

Markup (keep it one short line; `<em>`, `<a>` allowed):
```html
<link rel="stylesheet" href="moments/marquee-type/moment.css">
<p data-moment="marquee-type" data-speed="80">Make the work worth reading &middot;</p>
<script type="module">
import mount from './moments/marquee-type/moment.js';
document.querySelectorAll('[data-moment="marquee-type"]').forEach((el) => mount(el));
</script>
```

| Option (data-attr / key) | Default | Meaning |
|---|---|---|
| speed | 60 | px per second |
| gap | 0.6em | space between repeats (any CSS length) |
| direction | left | `left` or `right` |
| scrollInfluence (data-scroll-influence) | 1 | 0 turns off scroll speed-up and reversal |
| labelPause / labelPlay | Pause / Play | button text (translate it) |

Size: set `--mq-size` (default `clamp(3rem,13vw,11rem)`) and `--mq-gap` on the element.
Weight: 5.4 KB JS + 1.3 KB CSS (unminified).
Pauses on hover, focus, off screen, hidden tab, and with the built-in Pause `<button>`. Copies are `aria-hidden` and `inert`.
Reduced motion: not mounted, static wrapped text. No JS: same. Phones: same effect at the smaller `--mq-size`.

Do not: put block elements inside; remove the pause button; set `overflow` on the element.
