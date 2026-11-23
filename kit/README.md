# ultraweb kit

Tested building blocks for striking pages. A **moment** is one effect (split type, a scroll
reveal, a photo reveal, a canvas field, a page transition) packaged as a folder you copy and
mount. You do not write the effect. You paste its markup, set its options, and it works on
phones, with reduced motion and with JavaScript off.

```
kit/
  system.css          base layer for static sites (reset, type scale, grid, buttons, fields, mobile nav)
  system.js           mounts every [data-moment] near the screen; opens the mobile menu
  starter.html        a complete static page to start from
  react/Moment.tsx    the mounting component for Next.js
  moments/index.json  the catalog
  moments/<name>/     moment.js, moment.css, demo.html, README.md
```

## The rule

1. Mount a kit moment exactly as its README says. Set options. Nothing more.
2. Never edit files under `kit/`. Change the look through tokens and your own CSS.
3. Write a custom effect only when `design/DIRECTION.md` commissions something the kit does
   not have. Then follow `references/motion.md` and `references/showpiece.md`.

## Choose

```
node <plugin>/scripts/moments.mjs pick --fits <product|studio|shop|editorial|place|launch> \
     --needs none --max-intensity <motion level from DIRECTION.md> [--count 2]
node <plugin>/scripts/moments.mjs list                 # the whole catalog
node <plugin>/scripts/moments.mjs show <name>          # one moment's README
```

- `--needs` is the assets you have: `none`, `photos`, `sequence` (comma-separated). Say
  `--needs none,photos` only when real photographs exist.
- `pick` prefers moments not used recently and never returns two of one kind. Exit 2 means
  nothing fits: build the page without a moment. That is a valid outcome.
- Write the chosen name into `design/DIRECTION.md` under the signature move.

## Static path (`site/`)

1. Copy the folder: `cp -r <plugin>/kit site/kit`.
2. Start from `site/kit/starter.html`: copy it to `site/index.html`. It already links:
   ```html
   <link rel="stylesheet" href="styles.css">       <!-- your tokens, first -->
   <link rel="stylesheet" href="kit/system.css">
   ...
   <script type="module" src="kit/system.js"></script>  <!-- end of body -->
   ```
3. Replace every `TODO-COPY` with real copy. The gates fail while one is left.
4. Paste the moment's markup from `site/kit/moments/<name>/README.md`. That is all:
   `system.js` loads the moment's JS and CSS when the element nears the screen.
5. Options go in `data-*` attributes on the `[data-moment]` element, as the README lists.

`system.css` classes: `.wrap` (container), `.grid` with `.span-3` ... `.span-12` and
`.start-N` (12 columns from 48rem; full width below), `.section`, `.section--tight`,
`.flow`, `.mt-section`, `.mt-block`, `.text-hero`, `.text-h1`, `.text-h2`, `.text-h3`,
`.text-lead`, `.text-small`, `.muted`, `.measure`, `.btn`, `.btn--primary`, `.btn--ghost`,
`.field`, `.input`, `.textarea`, `.select`, `.field__hint`, `.field__error`, `.skip-link`,
`.visually-hidden`, `.site-header`, `.site-nav`, `.nav-toggle`, `.nav-dialog`.
Mobile menu: `<button data-nav-open="nav-dialog">` opens `<dialog id="nav-dialog">`;
`[data-nav-close]` and any link inside close it.

## Next path

1. Copy only what the page uses: `kit/moments/<name>/` for each chosen moment and
   `kit/react/Moment.tsx`, into `<project>/kit/` with the same layout. Do not copy
   `system.css`; Tailwind and `app/globals.css` do that job.
2. Import the moment's CSS once, in the component that uses it or in `app/globals.css`:
   `import "@/kit/moments/<name>/moment.css";`
3. Render it. The children are the markup from the moment's README, inside the root:
   ```tsx
   import { Moment } from "@/kit/react/Moment";
   <Moment name="<name>" as="section" load={() => import("@/kit/moments/<name>/moment.js")}
           options={{ /* from the README options table */ }}>
     {/* markup from the README */}
   </Moment>
   ```
4. `name` must equal the folder name: it sets `data-moment`, which scopes the CSS.
   Put the README's `data-*` options in `options` (camelCase keys) or in `attrs`.

## Tokens the kit reads

Colours: `--background`, `--foreground`, `--card`, `--card-foreground`, `--primary`,
`--primary-foreground`, `--muted`, `--muted-foreground`, `--accent`, `--accent-foreground`,
`--border`, `--ring`. Shape and motion: `--radius`, `--shadow-color`, `--shadow-k`,
`--dur-micro`, `--dur-section`, `--ease-out`. Type: `--font-display`, `--font-sans`.
`system.css` also reads `--text-hero`, `--text-h1`, `--text-h2`, `--text-h3`, `--text-lead`,
`--text-base`, `--text-small`, `--space-section`, and optional `--wrap-max`, `--gutter`,
`--grid-gap`, `--measure`, `--input`, `--destructive`.
Every use has a neutral grey fallback. If the page looks grey and system-font, the token
file is missing or loads after `system.css`.

## Limits

- One or two moments per page. One is usually right: everything around it stays quiet.
- At most one `canvas` or `webgl` moment per page.
- A moment's `intensity` must not exceed the motion level in `design/DIRECTION.md`
  (1 quiet, 2 expressive, 3 immersive). Motion level 0 means no moment.
- A moment that `needs` photos gets real photographs of this subject, never stock filler.
- Do not wrap a moment in your own animation, and do not animate its children yourself.

## Check

Serve and run the gates; they cover console errors, overflow, reduced motion and placeholders:

```
python3 -m http.server 4173 -d site
node <plugin>/scripts/gates.mjs --url http://localhost:4173 --project .
```

Plugin maintainers: `node --test tests/kit.test.mjs` runs every moment's demo through the
harness (both viewports, reduced motion, no JavaScript, cleanup and remount).

## Catalog schema (`moments/index.json`)

`{ "name", "kind": "type|scroll|image|canvas|webgl|cursor|transition", "needs": ["none"|"photos"|"sequence"], "fits": ["product"|"studio"|"shop"|"editorial"|"place"|"launch"], "intensity": 1|2|3, "bytes": <moment.js + moment.css>, "summary" }`
