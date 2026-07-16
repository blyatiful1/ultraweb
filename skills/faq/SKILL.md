---
name: faq
description: Design FAQ and accordion sections — the native details/summary vs client accordion decision, question/answer typography, disclosure interaction rules, and FAQPage JSON-LD wiring through ultraweb:seo. Invoke during ultraweb Phase 6 when design/SITEMAP.md names an FAQ, questions, or help section, or when the user asks for an FAQ, accordion, expandable questions, "common questions", a help section, or objection handling near pricing.
---

# faq — answers users find and believe

**Stage:** Phase 6 — Build - **Reads:** design/SYSTEM.md, design/SITEMAP.md, design/BRIEF.md - **Writes:** components/sections/faq.tsx (+ exported Q/A data consumed by ultraweb:seo)

## Standard

An FAQ exists to kill the last objection before conversion, not to warehouse content. The bar:

- Questions phrased as users actually ask them ("Can I cancel anytime?"), never topic labels ("Cancellation policy").
- Answers 1–4 sentences, direct, first sentence answers the question; link out where the deep answer lives.
- 5–8 questions per section; more than 8 → group under subheads or move to a dedicated page.
- Answers exist in the server-rendered HTML — findable by search engines and Ctrl+F, not blank until hydration.
- Q/A strings live in ONE typed array exported from the component; the section renders it and `ultraweb:seo` builds JSON-LD from it. Never duplicate the strings.

## Process

1. Harvest questions from BRIEF.md: what would stop THIS audience from converting? Sales objections, pricing doubts, technical fears. Write real questions, not category names.
2. Rank by objection severity; cap the section at 8, route overflow to a Categorized page or the Objection Row variant.
3. Decide native vs client with the decision rule below — default native.
4. Build with SYSTEM tokens; export the typed Q/A array alongside the component.
5. Hand the array to `ultraweb:seo` for FAQPage JSON-LD; verify open/close by keyboard and Ctrl+F finds closed answers.

## The native-vs-client decision

**Default: native `<details>/<summary>`.** Zero JS, RSC-safe, works before hydration, keyboard support built in. Style it: `list-none` + `[&::-webkit-details-marker]:hidden` on summary, custom icon rotated via `group-open:` state. Exclusive one-open-at-a-time: give all items the same `name` attribute. Open/close is instant by default — acceptable. Animating the reveal height (`interpolate-size` / `::details-content`) is not universally supported: verify against current docs first, and treat instant-open as the fallback, not a defect.

**Escalate to a client accordion** (`npx shadcn@latest add accordion`, `"use client"`) only when one of these is true:

1. DIRECTION.md demands animated, choreographed collapse (spring, stagger).
2. Open state must be controlled — deep link (`?q=refunds` opens an item), analytics on open, open-all/close-all.
3. Exclusive behavior AND animated collapse together (native `name` closes siblings instantly).

If none apply and you reach for the client accordion anyway, you're shipping JS for nothing.

## Variants

- **Single Column** — one 65–75ch column, questions in objection-priority order (most conversion-blocking first). Default for most sections.
- **Two-Column Split** — sticky left column with heading + "still stuck?" contact link, stacked items right. Use on marketing pages where the section needs presence; counts as one of the page's deliberate asymmetries.
- **Categorized** — 2–4 groups under subheads, each group ≤6 questions. Use for a dedicated /faq page or when BRIEF.md yields >8 questions.
- **Objection Row** — 3–4 questions inline directly under the pricing section, answering exactly the doubts pricing raises (refunds, cancellation, hidden fees). Use with `ultraweb:pricing`; pull these OUT of the main FAQ, don't duplicate.

## Typography

- Question: body size to 1.125em, medium/semibold — never display size; the section heading does the display work.
- Answer: muted-foreground token, body size, generous leading per SYSTEM §type.
- Icon: one chevron (rotate 180°) or plus (rotate 45° to ×), 150–250ms, stroke width per `ultraweb:icons`, right-aligned.
- Rhythm: 1px border token between items, `py-4` to `py-6` per item, consistent throughout.

## JSON-LD

Export the Q/A array; `ultraweb:seo` owns the `FAQPage` JSON-LD injection pattern and placement. Mark up only Q/A pairs visible on the page. Ship the markup for semantic correctness — do not promise rich-result display; search engines restrict FAQ rich-result eligibility.

## States

- hover: question row background or text-color shift from tokens, 150ms.
- focus-visible: ring from palette tokens on the summary/trigger — native summary is focusable; replace the browser default ring, never remove it.
- open: icon rotated, answer revealed; the open item's question may step up one weight.
- reduced-motion: no height animation, instant toggle, icon may still swap without rotation.

## A11y

- Native details/summary carries disclosure semantics for free. Client accordions use the shadcn/Radix primitive which manages `aria-expanded`/`aria-controls` — never hand-roll `div` + `onClick`.
- The entire question row is the target, min 44px tall — not just the icon.
- Heading order stays sane: one section h2; if questions are headings, the h3 goes inside the summary.
- Answers stay in the DOM when closed (native details guarantees this) — unmounting closed answers breaks find-in-page and indexing.

## Anti-patterns

Greppable: `onClick={() => setOpen`, `useState(false)` next to a question list (hand-rolled accordion), `href="#"` in answers, `Frequently Asked Questions` as the sole unconsidered heading.

- Questions as topic labels instead of questions.
- Marketing copy wearing an answer costume — answers answer.
- First item auto-opened with an entrance animation on page load.
- 15+ questions in one flat list.
- All items open by default — that's a text page pretending to be an accordion; if everything should be visible, don't use disclosure at all.
- Client accordion for a static marketing FAQ with none of the three escalation triggers.

## Composes with

- ultraweb:seo — FAQPage JSON-LD built from the exported Q/A data
- ultraweb:copywriting — questions in the user's words, answers in brand voice
- ultraweb:pricing — the Objection Row variant lives directly beneath pricing
- ultraweb:micro-interactions — chevron rotation and reveal timing
- ultraweb:gate-accessibility — keyboard walkthrough of every disclosure
