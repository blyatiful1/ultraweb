---
name: marginalia
description: Print-derived page furniture for genuinely long-form pages — a scroll-linked running folio (current-section head), a marginal read-o-meter (reading time + percent as small-caps type, never a progress bar), a sticky scrollspy section rail, Tufte-style footnote/sidenote gutters in a reserved margin column, and marginal pull-quotes — all set in layout-grid's outer column and degrading to inline superscript + native popover below the gutter breakpoint. Invoke in the Build phase for essays, case studies, docs, reports, or annual-report pages (never a landing page), or when the user says "running header", "reading progress", "table of contents rail", "scrollspy", "sidenotes", "footnotes in the margin", "Tufte sidenotes", "pull quote", or "margin notes".
---

# marginalia — the page furniture of long-form

**Stage:** Phase 6 — Build (long-form pages only) - **Reads:** design/SYSTEM.md §type + §layout, design/SITEMAP.md, page content - **Writes:** components/marginalia/* (folio, read-meter, section-rail, sidenote styles) applied on long-form page templates

## Standard

Print magazines carry meaning in their furniture — folios, running heads, footnotes, marginalia — as much as in the body. A page number in Bloomberg Businessweek small-caps, a Tufte sidenote riding the margin, gwern.net's section rail, The Pudding's live act markers: none is body copy, all are typographic identity. Porting that furniture to long-form web gives an essay a printed conviction the article alone can't carry — and adds zero UI chrome. First-grade here means the furniture reads as *set*, not bolted on: it lives in real margin space, it's quiet, and it degrades honestly.

- **Fires on long-form only.** ≥ ~1,200 words / ≥ a 6-minute read, or an explicitly long-form page type in SITEMAP (essay, case study, docs, report, changelog entry). Never on a landing, marketing, product, or pricing page — furniture on a short page is affectation. If SITEMAP doesn't mark the page long-form, this skill does not run.
- **Steal the principle, not the surface** (`award-canon`): the *idea* of a running head, not a scanned page. All furniture is set in SYSTEM.md tokens — small-caps labels at 11–13px / +0.10–0.14em (typography's uppercase rule), notes at the caption step, the site accent for links.
- **The margin is layout-grid's, and it has one tenant.** The gutter is the **Margin Note 3/9** column layout-grid already reserves — marginalia *claims* it, never mints a second grid. Expose its width as `--gutter-w` so every piece aligns to the same column. A page runs **either** a Section Rail **or** a Sidenote Gutter as the column's primary tenant — never both fighting for it. The folio and read-o-meter are small enough to share the thin top-outer edge.
- **Degrades down, not off.** At ≥1440px the gutter is real. Below it, sidenotes collapse to a numbered superscript + native popover (zero-JS, Baseline 2024). At 375px there is **no gutter** — footnotes become an endnotes list with two-way anchor links. Nothing horizontally scrolls, ever.
- **Reduced motion:** the folio swaps instantly (no fade), the read-o-meter percent still reads (it's information, not animation) but drops the spring, and no scroll is ever hijacked — native scroll stays authoritative.

## Variants

### 1. Running Folio — the current-section head
A sticky small-caps label echoing the section you're in, like a print running head. Driven by scrollspy, not a scroll listener. Because it *echoes* the visible H2, it's `aria-hidden` — screen readers already have the heading.

```tsx
"use client";
import { useEffect, useState } from "react";

export function useActiveSection(ids: string[]) {           // shared by folio + rail
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => { const seen = entries.find((e) => e.isIntersecting); if (seen) setActive(seen.target.id); },
      { rootMargin: "0px 0px -70% 0px" },                   // active once the heading crosses the top 30%
    );
    ids.forEach((id) => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [ids]);
  return active;
}
// <p aria-hidden className="sticky top-24 text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
```

**When:** essays and case studies with named H2 sections a reader loses their place in. IntersectionObserver, never a per-frame `scroll` handler.

### 2. Read-o-meter — progress as type, not a bar
Reading time + percent set as marginal small-caps — deliberately **not** a fixed progress bar (that's scroll-motion's `ReadingProgress`, banned here as un-print). Reading time is computed at build by content-cms (words ÷ 200 wpm); percent reuses scroll-motion's `scrollYProgress` rendered into text.

```tsx
"use client";
import { useScroll, useMotionValueEvent } from "motion/react";
import { useState } from "react";
export function ReadMeter({ minutes }: { minutes: number }) {
  const { scrollYProgress } = useScroll();
  const [pct, setPct] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => setPct(Math.round(v * 100)));
  return <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground tabular-nums">{minutes} min · {pct}%</p>;
}
```

`tabular-nums` so the percent doesn't jitter the label width. **When:** any long read where "how much is left" reassures — reports, deep docs.

### 3. Section Rail — sticky scrollspy TOC
A sticky in-page contents list in the margin, current item lit via the shared `useActiveSection`. Unlike the folio this is a **real `<nav>`** with working anchor links — not decorative.

```tsx
<nav aria-label="On this page" className="sticky top-24 text-sm">
  <ul className="space-y-2">
    {sections.map((s) => (
      <li key={s.id}>
        <a href={`#${s.id}`} aria-current={active === s.id ? "location" : undefined}
           className="text-muted-foreground aria-[current]:text-foreground">{s.label}</a>
      </li>
    ))}
  </ul>
</nav>
```

`aria-current="location"` marks the active position in the set. **When:** docs and long reference pages a reader *jumps around* in. It is the margin's primary tenant — do not also run a Sidenote Gutter in the same column.

### 4. Sidenote / Footnote Gutter — Tufte in the margin
Numbered footnotes and unnumbered sidenotes set in the reserved column at ≥1440px, riding beside the paragraph that cites them. The reference is always a real anchor (never `href="#"`); the note sits in the DOM *after* its reference so screen readers and crawlers read it in place.

```tsx
// Wide (≥1440px): the note floats into the gutter. Narrow: same marker becomes a native popover.
<p>
  Grants rose to €4.2M
  <a href="#fn-3" id="fn-3-ref" aria-describedby="fn-3" className="sidenote-ref">3</a> across the programmes.
  <span role="note" id="fn-3" className="sidenote">3. Neighbourhood €1.8M · Youth €1.5M · Climate €0.9M; audited.</span>
</p>
```

```css
@media (min-width: 90rem) {               /* ≥1440px — the note lifts into the margin column */
  .sidenote { float: right; clear: right; width: var(--gutter-w);
    margin-right: calc(-1 * (var(--gutter-w) + var(--gutter-gap)));
    font-size: 0.8125rem; line-height: 1.4; color: var(--color-muted-foreground); }
}
```

Below 1440px, swap presentation: the marker becomes `<button popovertarget="fn-3">` and the note carries `popover` — native tap-to-reveal, zero JS. At 375px drop popovers too and collect all notes into an endnotes `<ol>` at the article end, each with a back-link to its reference. **When:** anything citing sources or figures — reports, technical essays, case studies with credits.

### 5. Marginal Pull-quote / Annotation
A pull-quote or author's margin note set in the gutter without breaking the body measure. A pull-quote *repeats* body text, so it's `aria-hidden` (no duplicate reading); a genuine annotation adds information and stays readable.

```tsx
<figure aria-hidden className="lg:float-right lg:clear-right lg:w-[var(--gutter-w)]
  lg:mr-[calc(-1*(var(--gutter-w)+var(--gutter-gap)))]">
  <blockquote className="font-display text-xl/[1.3] text-balance">"We fund the quiet decade, not the loud year."</blockquote>
</figure>
```

**When:** editorial essays and case studies wanting a printed magazine's rhythm. `text-balance` for clean ragging in a narrow column.

## Anti-patterns

- Marginalia on a landing/marketing/pricing page — grep SITEMAP for the long-form flag first; furniture on a short page is affectation.
- A fixed full-width scroll-progress **bar** here — that's scroll-motion's job; the read-o-meter is marginal *type*, not a bar (the whole point).
- A sidenote gutter with no collapse — fixed margin widths without a breakpoint horizontally-scroll at 375px. Every gutter needs the ≥1440 / popover / endnotes ladder.
- `href="#"` footnote markers, or emoji as note/bullet markers — dead links and slop, banned by taste.
- Two margin tenants (Section Rail **and** Sidenote Gutter) in the same 3/9 column — visual noise; pick one.
- Reinventing the container — grep `max-w-[` / a second `grid-cols-12` in the article; the margin is layout-grid's reserved column, consumed via `--gutter-w`, not hardcoded.
- Scrollspy via a `scroll` event listener firing every frame — use IntersectionObserver.
- Reading time hardcoded or recomputed at request time — it's a build-time field from content-cms.
- A folio that's `aria-hidden` while being the page's only heading, or a Section Rail that isn't a real `<nav>` — the echoing furniture hides, the navigational furniture stays reachable.

## Worked example — Aldermoor Trust, annual-report page furniture

SITEMAP marks `/report/2025` as long-form (a ~9-minute read); the landing `/` stays bare. DIRECTION is the foundation's quiet-civic register; the page inherits content-cms's system: Source Serif 4 body, deep-green accent `oklch(0.45 0.1 155)`, warm paper. layout-grid's **Margin Note 3/9** reserves the column and sets `--gutter-w`.

Primary tenant: a **Sidenote Gutter** — the report cites audited figures, so numbered notes ride the margin at ≥1440px (endowment return, grant splits, fee basis). Riding the top-outer edge above it: a **Running Folio** (`aria-hidden`, current programme section) and a **Read-o-meter** reading `9 min · 41%` in green-tinted small-caps. Copy on a real note: *"3. Net of the 0.4% management fee; figures as audited by [firm]."* — never `href="#"`, the ref is `<a href="#fn-3" aria-describedby="fn-3">`.

Degrade: at 768px the notes collapse to native popovers on tap; at 375px they become an endnotes `<ol>` with two-way links and no gutter — nothing scrolls sideways. Reduced motion: the folio swaps instantly and the percent updates without the spring.

Rejected: a **Section Rail** — the report reads start-to-finish, not jump-around, and a scrollspy TOC would fight the sidenotes for the one margin column (one-tenant rule). Also rejected: scroll-motion's fixed top **progress bar** — the print register wants progress as marginal type, not a UI bar. The **Running Folio** leads instead on Studio Norra's case study, where named sections are the thing a reader loses.

Handoff: reading time comes from content-cms's build-time field; `scrollYProgress` and reveal discipline from scroll-motion; the margin column and `--gutter-w` from layout-grid. Notes stay in-DOM after their reference so seo indexes them and screen readers read them in order. gate-responsive verifies the 1440 → 768 → 375 collapse; gate-accessibility verifies note reachability, real anchors, and the reduced-motion behavior.

## Composes with

- **ultraweb:typography** — supplies the small-caps label rule (uppercase, 11–13px, +0.10–0.14em), the caption step the notes are set at, and the body measure the gutter sits outside.
- **ultraweb:layout-grid** — its **Margin Note 3/9** column *is* the gutter; marginalia claims it via `--gutter-w` and enforces one tenant per margin, never a second grid.
- **ultraweb:scroll-motion** — provides `useScroll`/`scrollYProgress` for the read-o-meter and the once-only reveal discipline; the read-o-meter is its `ReadingProgress` rendered as text, not a bar.
- **ultraweb:navigation** — the Section Rail is an in-page TOC nav; coordinate its active-state semantics and the `top-24` sticky offset with the site header so the rail clears it.
- **ultraweb:content-cms** — computes the build-time reading-time field and hosts the MDX where footnotes/sidenotes are authored; the article measure and prose type come from there.
- **ultraweb:seo** — footnotes/sidenotes stay in-DOM after their reference, so they're crawled and read in order; furniture adds no metadata surface.
- **ultraweb:gate-responsive** — verifies the gutter → popover → endnotes degrade at 1440/768/375 with zero horizontal scroll.
- **ultraweb:gate-accessibility** — verifies note reachability, real anchors (no `href="#"`), `aria-hidden` only on echoing furniture, and the reduced-motion readouts.
