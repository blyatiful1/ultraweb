# primitives

Interactive and data primitives: buttons, forms, async states, overlays, data display, and the prop conventions that tie components together.

Load when: building or restyling buttons, inputs, forms, menus, dialogs, toasts, tables, charts, skeletons, empty or error states, or the 404.
Reads: design/SYSTEM.md, global CSS tokens. Writes: `components/ui/*`, `components/forms/*`, `components/states/*`, `components/data/*`, `lib/schemas/*`.

Generated primitives from the component library are a starting point. Restyle radius, color, ring and depth from tokens; the untouched default look is banned. Versions and APIs: check `stack/versions.json` and current docs when an API detail matters.

## Component conventions

- Props use the axes `variant`, `size`, `tone` and no synonyms (`type`, `kind`, `color`, `appearance`). Variants are a `cva()` map resolving to token utilities, never hex or arbitrary values.
- Merge classes with `cn()` and put the caller's `className` last so it can override.
- A component that must render as another element (a CTA that is a link) takes `asChild` via Radix `Slot`; do not invent an `as` prop.
- Spread `...props` onto the root, take `ref` as a plain prop, and put `data-slot` on every root and part.

## Buttons

Weights: primary (filled accent), secondary (outline or subtle fill), ghost (tertiary, toolbars, icon buttons), destructive (real destruction only, never "cancel"). One primary per viewport-height region; the sticky header CTA is the single exemption. A CTA that navigates is an `<a>` (link component) carrying the button classes, never a `<button>` that pushes a route.

| size | height | padding-x | text | icon |
|---|---|---|---|---|
| sm | 32px | 12px | 0.875rem | 16px |
| md | 40px | 20px | 0.875 to 1rem | 16px |
| lg | 48px | 24px | 1rem | 20px |
| xl (hero only) | 56px | 32px | 1.125rem | 20px |

Mobile primary CTAs are lg, or md with an expanded hit area (`relative after:absolute after:-inset-1`). sm never ships as a mobile primary. Icon-only buttons are square and require `aria-label`.

State matrix. Transition only `transform`, `background-color`, `border-color`, `box-shadow`; never `transition-all`.

| State | Rule |
|---|---|
| hover | 150 to 200 ms on the SYSTEM easing. Pick one motif for all buttons: a background step (about 0.04 lightness in oklch), a 1px lift, or a small trailing-icon nudge |
| active | 80 to 100 ms, faster than hover. Scale 0.98 or lift returns to 0 |
| focus-visible | ring plus offset in the palette color, on every variant including ghost, icon-only and link buttons |
| disabled | reduced opacity, `cursor-not-allowed`, label still 3:1. Means unavailable, not pending |
| loading | spinner replaces the leading icon, label swaps to the progress verb, width locked with `min-width`, `disabled` plus `aria-busy="true"`. Icon-only: spinner replaces the icon and the `aria-label` updates. Form submits get pending from the form-status hook |

Reduced motion: movement motifs drop to a color shift; a spinner may stay as status. Icons: a leading icon describes the action, a trailing icon shows direction or consequence, never both. Labels are verb plus object; never "Submit", "Click here", "Learn more". Press physics with the animation library needs a client component; CSS `:active` covers most cases.

Greppable: `transition-all`; `hover:scale-110`; `outline-none` with no ring replacement; spinner-only loading on a labeled button; `<div onClick`; gradient-filled primary as default.

## Forms

A form is finished on the first try and trusted on the second. It posts without JavaScript (`<form action={serverAction}>`), a failed submit loses no input, and one schema is the source of truth on both sides.

Procedure: list the fields and cut every one the goal does not need. Write the schema in `lib/schemas/<form>.ts`, imported by the client and the action. The action runs `safeParse`, returns a field-error map and echoes the submitted values. Give each field `name` (FormData ignores fields without it), the right `type`, `autocomplete` and `inputMode`. Wire the action-state hook; validate on blur with the same schema's field. Design pending and success. Test with JavaScript off, and submit an invalid form to confirm focus lands on the first invalid field.

Field anatomy: visible label above the input (placeholder only shows a format example); input 44 to 48px tall with text at least 16px on mobile; fields 20 to 24px apart in a single column of 400 to 480px; hint between label and input; error below it with icon, color and words, never color alone; mark the exceptions "(optional)". Textarea: `field-sizing: content` with `min-height: 3lh; max-height: 12lh; overflow-y: auto`; check current support and keep a fallback. Styled select: `appearance: base-select` (also on `::picker(select)`) only behind `@supports`, as an enhancement over the plain select; check current support and never put information only in the styled picker.

Layouts: stacked (default; only city/postcode pairs share a row), inline capture (input plus button, stacks under 480px, success replaces the row), split contact (form beside context, form first on mobile), wizard (8+ fields or distinct topics: at most 5 fields per step, "Step 2 of 3" as text, back keeps data, per-step validation, a review step before anything irreversible).

Validation timing: never validate a pristine field; first validation on blur; after an error, re-validate on change; on submit validate fully on both sides (client is UX, server is security). Do the border and ring in CSS with `:user-invalid`, which matches only after interaction:

```css
.field:has(:user-invalid) { border-color: var(--destructive); }
```

Never style on `:invalid` or `:has(:invalid)`; it paints untouched fields red on load. Keep JS state for `aria-invalid`, the worded message and the server verdict.

Schema errors: write messages in the field's own words ("Enter an email like you@company.com"), never schema defaults or "Invalid input". Use the current schema library's top-level validators and issue-path API as documented in the installed version; flatten helpers may be deprecated. Collect the first error per field into the returned map.

Recovery: unknown or server failures go to one form-level banner ("Couldn't send. Your message is still here.") with values intact. On failed submit move focus to the first invalid field; form-level errors use `role="alert"`, field errors use `aria-describedby`. Forms with 3 or more inputs also get a focus-managed error summary above the form (`tabIndex={-1}`, links to each field), in addition to inline errors. Keep the submit button enabled; a disabled submit hides why. Spam defense: honeypot plus server validation before any CAPTCHA.

Success replaces the form (or inline row) with a designed confirmation and moves focus to its heading; a toast is only a secondary echo. Radio and checkbox groups use `fieldset` and `legend`.

Greppable: `disabled={!isValid}`; `e.preventDefault()` plus `fetch(` in onSubmit where a server action works; `window.alert(`; inputs without `name=`; `placeholder=` with no sibling label; a ResizeObserver textarea hook; `base-select` without `@supports`. Checkout field order and payment-method rules for Germany live in `references/legal-dach.md` and `references/commerce.md`.

## Async states

Every surface that fetches, searches, filters, uploads or mutates ships loading, empty, error and success before it counts as built. Before building, write a row per surface: loading, empty, error, success, file. A missing cell is an unfinished surface.

Loading:
- Build each skeleton from the real component: duplicate its JSX and replace content with token-colored blocks. Same container, grid, heights and radii, so the swap shifts nothing. Never guess dimensions. Never skeleton static content.
- Three shapes: text line (widths varied 40 to 90%), avatar or thumbnail at real size, media block at real aspect. Count equals the expected result count or 3 to 6.
- Pulse via an `--animate-*` token, static under reduced motion; one muted token re-decided for dark mode.
- Route level: `loading.tsx` holds the page's real skeleton, not a centered spinner. Island level: wrap each independently fetching island in its own Suspense with its own skeleton.
- A failed fetch must reach the error state; a skeleton pulsing over a dead request is the worst state.

Empty: one line in voice naming what will live here, plus one action that creates the first item (optional power-user hint). Design first-use and filtered-to-zero separately; the latter's action clears the filters. Center in the space the content would occupy.

Error: the formula is what happened, why only if it helps, and the concrete fix as a button or link ("Your card was declined. Try a different card or contact your bank."). Banned strings: "Something went wrong", "An error occurred", "Oops", bare "Please try again", schema defaults, `error.message` as UI. Route errors use `error.tsx` (client component with `reset`); log the real error, show the human one. Use a semantic error token and small icon, not a full-screen red panel. Section-level failure gets an inline panel with a retry for just that island.

Success: confirm the noun ("Invoice sent"). If the new item appears where the user is looking, that is the confirmation; otherwise use the toast library the stack names (the stock toast component is deprecated). Pending to success morph 150 to 250 ms, revert after 1.5 to 2 s. Pending on the trigger or an optimistic update must show within 100 ms.

Not found: an in-voice line (never "Page not found"), a way back beyond Home (search, top sections, contact), in the site's own type and color. Use `not-found.tsx` per segment; check current Next docs for the app-wide not-found file and any config flag it needs. Never ship the framework default.

Accessibility: pending region `aria-busy="true"`; skeleton internals `aria-hidden` with one screen-reader "Loading {thing}"; one `aria-live="polite"` region per surface, errors `role="alert"`; focus lands on or next to a rendered error.

Verification against the production build: intercept the network with Playwright `page.route` to force slow (8s delay), failed (500) and empty (`[]`) responses, one per run, screenshot each, and `page.unroute` between runs. Compare the slow screenshot to the loaded one for layout match.

Greppable: `Loading...`, `No data`, `Something went wrong`, `Invalid input`, `Page not found`, `alert(`, `catch (e) {}`, a spinner inside `loading.tsx`.

## Overlays

Default to native platform features: the Popover API plus CSS anchor positioning for anything attached to a trigger, and `<dialog>` for anything modal. This removes z-index escalation, portals and focus-trap libraries. Check current support for anchor positioning, invoker commands and `popover="hint"` before relying on each; keep a working base layer underneath every enhancement.

| Need | Use | Why |
|---|---|---|
| menu, dropdown, popover, tooltip, listbox panel | `popover` (auto) anchored to the trigger | light-dismiss, Escape, focus return, top layer |
| modal: confirmation, form, lightbox, mobile menu, cart drawer | `<dialog>` with `showModal()` | real focus trap, inert background, `::backdrop` scrim |
| non-modal dismissible panel | `<dialog popover>` | no trap |
| toast stack | `popover="manual"`, several open, timer plus close button | outside click must not dismiss; announce via an `aria-live="polite"` region |
| tooltip inside an open menu | `popover="hint"` if supported, else keep auto | a hint does not close an open auto popover |

Invoker is a real `<button popovertarget>`. `command` and `commandfor` can replace `showModal()` calls and open-state `useState`; feature-detect (`"command" in HTMLButtonElement.prototype`) and keep `popovertarget` or `showModal()` as the real implementation underneath.

Anchored popover with a static fallback:

```css
.menu { position: absolute; top: calc(100% + 0.5rem); right: 0; }
@supports (anchor-name: --a) {
  .trigger { anchor-name: --acct; }
  .menu {
    position-anchor: --acct;
    position-area: bottom span-left;
    top: auto; right: auto; margin-top: 0.5rem;
    position-try-fallbacks: flip-block;
  }
}
```

Entry and exit motion without a mount library:

```css
.menu {
  opacity: 0; transform: translateY(-4px);
  transition: opacity 180ms var(--ease-out), transform 180ms var(--ease-out),
              overlay 180ms allow-discrete, display 180ms allow-discrete;
}
.menu:popover-open { opacity: 1; transform: none; }
@starting-style { .menu:popover-open { opacity: 0; transform: translateY(-4px); } }
@media (prefers-reduced-motion: reduce) { .menu { transition: none; } }
```

Durations come from the SYSTEM motion tokens. Use the animation library only for spring physics CSS cannot express.

Go past native for: roving-focus `role="menu"` (arrow keys, typeahead, submenus; popovers give the layer, not the keys; usually render a plain list of links or buttons and omit `role="menu"`), and combobox with `aria-activedescendant`, multi-level menus and rich date pickers, where a Radix-based primitive earns its keep (it may still use anchor positioning).

Accessibility: `auto` popovers do not trap focus, which is right for menus. A `::backdrop` on a popover is decorative and does not inert the page. Tooltips link with `aria-describedby`, stay hoverable and Escape-dismissible (WCAG 1.4.13), and never hold essential information. Toasts stay at least 5 seconds or are dismissible, keyboard reachable.

Greppable: `z-[`on an overlay; a JS focus-trap or portal library for a dropdown; `popover="auto"` on a toast; `popover="manual"` used as a modal; `role="menu"` with no arrow-key handling; anchoring with no `@supports` base; `transition` on a popover with no `allow-discrete`; `rounded-xl shadow-lg` panels instead of SYSTEM depth.

## Data display

Choose the cheapest form that answers the question: sentence, stat block, table, chart. Escalate only when the cheaper form loses information. For a chart, write the one-sentence takeaway first; if the sentence suffices, use a stat block.

Tables:
- Numbers right-aligned with `tabular-nums` (check the chosen font has tabular figures; define a numeric-safe token if not). Text left. Center only single-glyph cells. Headers align with their content.
- One precision per column, formatted with `Intl.NumberFormat`. Units stated once in the header. One date format site-wide.
- Variants: dense (40 to 44px rows, 13 to 14px, hairlines; datasets), comfortable (56 to 64px; marketing tables), definition (two columns, label left, value right; spec sheets).
- Responsive, one strategy per table: priority columns (hide low-ranked at breakpoints; default up to 6 columns), card collapse below 640px (heterogeneous rows or touch actions), scroll container with sticky first column and an edge fade (true matrices only). Verify at 375px.
- Semantic `<table>` with `<caption>` or `aria-label`, `th scope`. Row actions are real links or buttons inside a cell; `onClick` on `<tr>` has no keyboard path. Scroll wrappers get `tabindex="0"`, `role="region"`, `aria-label`. Pick one row separator (zebra, borders or hover, not all). Sorted column: `aria-sort` plus an icon on the active column only.

Stat blocks: 3 to 4 per row, value 2.5 to 3.5rem with `tabular-nums`, label consistently above or below, delta with an icon and semantic color, timeframe or source captioned. Count-up 400 to 700 ms once on first view, final value immediately under reduced motion. A single hero figure may sit inside an SVG frame that embodies the subject (real DOM text, full value in `aria-label`, framed final number as the static fallback); frame one figure only.

Charts: title states the answer, not the axes. Series colors from tokens; 3 or more series get direct end labels. Bars start at zero; lines may crop but show axis values. At most 5 horizontal hairlines, no vertical grid or box. Avoid 3D, dual y-axes, pies beyond 3 slices, decorative gradients, a legend for one series. Tooltips show exact values in `tabular-nums`. Hand-rolled SVG beats a chart dependency for sparklines and simple bars; if a library is needed, wrap it so color and type flow from tokens. Give every chart a text equivalent (the takeaway or a hidden table). States: skeleton with real column widths, an empty row with the next action, an error with retry; an error is never an empty table.

Greppable: `text-center` on data cells; numeric columns without `tabular-nums`; `onClick` on `<tr>`; per-cell repeated units; fake precision ("99.99999%"); `overflow-x-auto` as the only mobile plan.
