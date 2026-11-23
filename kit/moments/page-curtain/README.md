# page-curtain
Page-to-page transition for multi-page static sites: cross-document View Transitions where supported, a token-coloured curtain elsewhere.

Fits: multi-page static sites. Needs: none. Link CSS and mount on EVERY page.

```html
<head>
  <script>try{var t=+sessionStorage.getItem('pc:curtain');if(t&&Date.now()-t<6000)document.documentElement.setAttribute('data-pc-arriving','')}catch(e){}</script>
  <link rel="stylesheet" href="moment.css">
</head>
<body data-moment="page-curtain"> <header data-pc-keep>...</header> <main>...</main>
<script type="module">import mount from './moment.js'; mount(document.body);</script>
```
Options (object or `data-*` on body): `mode` `auto` (default) | `curtain` (force fallback); `timeout` 4000 (ms before a stuck navigation uncovers). Curtain colour: `--pc-color`, else `--primary`. `data-pc-keep` keeps an element still across pages; `data-pc-focus` picks the focus target (default `main`); `data-no-transition` on a link skips it.

Never intercepted: ctrl/cmd/shift/alt/middle clicks, `target=_blank`, `download`, hash-only, external links. New page: focus moves to `main`, title announced politely. Back/forward and bfcache restore uncover.

Next.js: keep the same names (`::view-transition-old/new(root)`, `pc-keep`) in global CSS and use `<ViewTransition>`; see `references/motion.md` (Tier 2, route announcer). Do not mount this moment there.

Size: 7.2 KB JS + 2.3 KB CSS. Reduced motion: instant.
Do not: mount twice; omit CSS on any page.
