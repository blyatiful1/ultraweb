---
name: command-palette
description: Design and build the ⌘K command palette / on-site search composite for an ultraweb site — a discoverable keyboard-first fuzzy search (⌘K/Ctrl-K plus `/` and a visible affordance) layered as an accelerator over real navigation, never the only path, with a no-JS `/search` fallback page, combobox/listbox ARIA, focus-trap and restore, grouped ranked results, and recent/suggested on empty. Gated to SaaS/dev-tool sites with real content depth; for dev-tool brands it doubles as live product proof; an opt-in semantic (embeddings) mode is a P2 rider. Invoke in Phase 6 whenever a build needs on-site search or a command menu — trigger phrases — "command palette", "⌘K", "cmd-k", "command menu", "site search", "search the docs", "fuzzy search", "quick switcher", "spotlight". Not for a small brochure site.
---

# command-palette — ⌘K as an accelerator, never the only door

**Stage:** Phase 6 — Build - **Reads:** design/BRIEF.md, design/SITEMAP.md, design/SYSTEM.md - **Writes:** components/search/command-menu.tsx, app/search/page.tsx, lib/search/index.ts

## Standard

The command palette is the "this is a cared-for product" signal — the ⌘K on Vercel, Linear, and Stripe docs. It only reads that way when the discipline underneath is right. First-grade means:

- **An accelerator, never the only path.** Every item the palette indexes has a real, crawlable link somewhere else — nav, footer, docs sidebar, sitemap. The palette is discoverable via a *visible* affordance, and a no-JS `/search` page is the floor it enhances. A palette that is the sole way to reach content, or hidden behind an undiscoverable shortcut, is an accessibility trap, not craft.
- **Gated by site type.** It ships only when BRIEF/SITEMAP show real content depth — docs, a blog, many pages — for a SaaS or dev-tool audience. A brochure site does not get one; a palette over five links is theater (see When NOT to build one).
- **Keyboard-perfect.** ⌘K on macOS / Ctrl-K elsewhere (platform-correct symbol) plus `/`, both guarded against firing while the user is typing. Combobox/listbox ARIA, focus into the input on open, trap while open, Escape closes and restores focus to the trigger — mechanics deferred to `ultraweb:overlays`.
- **Fuzzy, grouped, ranked** results with recent + suggested on an empty query; all four async states designed via `ultraweb:ui-states`.
- **For a dev-tool brand it can double as product proof** — but only with *real* actions (Product-Preview variant), never a faked demo.

## When NOT to build one

Skip it — and say so in one line — when SITEMAP holds fewer than ~8 destinations, or there's no docs/blog/large content set, or the audience isn't developer/power-user (restaurant, local business, brochure, most nonprofits). Search over a handful of pages adds a shortcut nobody presses and a dependency nobody needs. The right move there is good `ultraweb:navigation`, not a palette.

## Variants

**Site-Search Palette** — the default. Global ⌘K/`/` over pages + docs + blog via shadcn's `Command` (cmdk), results grouped and ranked, recent + suggested on empty. Use for any SaaS/dev-tool with real content depth.

**Product-Preview Palette** — dev-tool clients only, and only when the product itself is command-driven (a CLI, an API, a Linear/Raycast-shaped app). The marketing palette runs 2–3 *real, safe* product actions inline ("Search the API", "Create a demo issue") so the palette IS the demo — free product proof. The actions must be genuine and sandboxed; a faked action is a demo that lies. Layered on top of Site-Search, never instead of it.

**Docs Command Bar** — search scoped to the docs shell, triggered inline by `/` (Algolia DocSearch / GitHub-docs shape) rather than a global overlay. Use on a docs-heavy site where search naturally lives inside the docs reader, with section-jump and recent searches, while the global nav keeps a lighter Site-Search palette or none.

## The no-JS floor (build this FIRST)

The palette is progressive enhancement over a real page. Ship the fallback before the accelerator so the contract is honest:

```tsx
// app/search/page.tsx — works with JavaScript disabled; the palette is layered on top
export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;                 // searchParams is a Promise in Next 16
  const results = q ? searchIndex(await loadIndex(), q) : [];
  return (
    <form action="/search" method="get" role="search">
      <input name="q" type="search" defaultValue={q} aria-label="Search the site" />
      {/* grouped results as real <a> links — the same shape the palette renders */}
    </form>
  );
}
```

`method="get"` posts without JavaScript; results are real anchors. Every doc is *also* reachable through normal navigation — this page is a convenience, not the only door. Hand `/search` to `ultraweb:seo` to mark it `noindex` (a search-results page in Google's index is thin/duplicate content).

## The index

Build a typed index at build time — never fetch the corpus on the client at runtime:

```ts
// lib/search/index.ts — one shape, consumed by both the palette and /search
export type SearchDoc = { title: string; url: string; group: "Pages" | "Docs" | "Blog"; section?: string; keywords?: string };
```

Sources: SITEMAP pages + `ultraweb:content-cms` frontmatter (title, section, url, keywords) collated into a static `search-index.json`. Keep it lean (target <50KB); for a large docs tree, lazy-load the index on first open or split by section rather than blocking first paint.

## The palette layer

```tsx
"use client";
// components/search/command-menu.tsx — the ⌘K accelerator, a client leaf; layout stays server
export function CommandMenu({ index }: { index: SearchDoc[] }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement | null;
      const typing = !!el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setOpen((o) => !o);                              // never hijack ⌘K / "/" while the user is typing
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  // <CommandDialog title="Search"> → grouped <CommandGroup>/<CommandItem> that router.push(doc.url) on select
}
```

- **Visible affordance (discoverable, never hidden-only):** a small pill in the header — search glyph + label + a `<kbd>⌘K</kbd>`. Detect the platform symbol on mount (`navigator.platform`); SSR can't know it, so render a neutral label first and swap after hydration, or default to `⌘` and correct on mount — either way avoid a hydration mismatch. `ultraweb:navigation` places the pill in the bar.
- **ARIA:** shadcn's `Command` (cmdk) already wires the combobox input, `role="listbox"`, `role="option"` items, and `aria-activedescendant`, and handles arrow/Enter keys and fuzzy filtering — use it rather than hand-rolling roles you'll get wrong. Give `CommandDialog` an accessible name (`title` renders the sr-only `DialogTitle`); announce the result count through one `aria-live="polite"` region.
- **Ranking + grouping:** order groups by intent (for a dev site: Pages → Docs → Blog); within a group boost exact-prefix and word-boundary matches over loose subsequence, then recency. cmdk's default scorer covers fuzzy; pass a custom `filter` only when the built-in ranking misreads your corpus.
- **Empty / loading / no-results:** owned by `ultraweb:ui-states`. Empty query shows **Recent** (last ~5 from `localStorage`) + **Suggested** (curated top destinations from SITEMAP). No-results is never a dead end — offer a path out ("Browse the docs", "Contact us"). Loading state applies only to async modes (below); static fuzzy is instant.

## Semantic-search mode (P2 rider — opt-in, gated by BRIEF)

Default and correct for almost every site: client-side fuzzy over the static index — zero round-trips, instant. Only when BRIEF explicitly asks for meaning-based search over a large corpus, add an opt-in mode: a server action queries an embeddings store (pgvector via `ultraweb:database`), debounced, with the loading + error states from `ultraweb:ui-states`. It never replaces the fuzzy path — it's a toggle layered on top, and it stays unbuilt unless the brief calls for it.

## Anti-patterns

- The palette is the **only** path to content it indexes — no visible affordance (hidden ⌘K), no `/search` fallback. Keyboard-shortcut-unaware, no-JS, and some screen-reader users are locked out.
- Results rendered as `<div onClick>` / `href="#"` instead of real `<Link>`/`<a>` — greppable, and they break the no-JS floor and middle-click/open-in-new-tab.
- ⌘K or `/` firing while focus is in an `<input>`, `<textarea>`, or contentEditable.
- Faking product actions in a Product-Preview palette — a demo that lies about what the product does.
- Building one on a 4-page brochure site — theater; a shortcut over five links.
- `CommandDialog` with no `DialogTitle` (unnamed dialog for screen readers); dropping cmdk's combobox/listbox roles by hand-rolling the list.
- Platform key hardcoded to `⌘` (wrong on Windows/Linux) or a `navigator.platform` read that trips a hydration mismatch.
- A giant index shipped inline that blocks first paint; a spinner that pulses forever over a dead async index.
- No-results with no path out; recent-searches stored but never offered on the empty state.

## Worked example — Tidepool, ⌘K over docs, pricing, and API reference

Moved to `references/example.md` — read only when this build's case is genuinely ambiguous; the sections above are the decision material.

## Composes with

Moved to `references/composes.md` — the handoff map; load it when orchestrating this skill against its neighbors.
