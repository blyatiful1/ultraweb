---
name: sitemap
description: Information architecture for an ultraweb build — decides the page list, routes, nav structure, and per-page purpose plus conversion goal from design/BRIEF.md, and writes part 1 of design/SITEMAP.md. Invoke in Phase 4 (Structure) of the ultraweb pipeline, immediately before ultraweb:wireframe; also when the user asks "what pages does this site need", "plan the pages", "restructure the navigation", "should this be a one-pager", "which legal pages does my jurisdiction require" (Impressum + Datenschutz for a DE/AT/CH business), or (via ultraweb:iterate) "add a page". The sitemap.xml crawler file is ultraweb:seo's — this skill decides pages, not metadata.
---

# sitemap — every page earns its route

**Stage:** Phase 4 — Structure - **Reads:** design/BRIEF.md (site type, audience, content inventory, conversions) - **Writes:** design/SITEMAP.md part 1 (pages, routes, nav)

## Standard

First-grade IA is small and opinionated: every page has one job, one conversion goal, and a route a user could guess without seeing the nav. The failure mode is never too few pages — it is the reflex 5-pager (Home/About/Services/Blog/Contact) stamped on regardless of brief. A page with nothing distinct to say is a section on another page, not a route.

## Process

1. Read `design/BRIEF.md`. List every content item from the inventory and every conversion the brief names.
2. Apply the one-pager test first: if the total content fits 5–8 sections and there is ONE conversion goal, plan a one-pager plus the jurisdiction-mandated legal pages (below) and stop. Do not invent pages to look substantial.
3. Cluster the remaining content into candidate pages. Write one sentence of purpose per page. If two purpose sentences are near-duplicates, merge the pages.
4. Assign exactly ONE primary conversion goal per page (buy, book, sign up, contact, subscribe, read next). Secondary goals exist only as exits to other pages — name the exit.
5. Name routes: kebab-case; singular for single things (`/pricing`), plural for collections (`/work`, `/posts`); ≤2 segments deep for marketing pages; dynamic segments (`/posts/[slug]`) only for real collections with ≥4 planned items.
6. Design the nav: 3–5 top-level labels plus 1 visually distinct CTA, ordered by visitor priority, never by org chart. Everything else goes to the footer.
7. Sketch the App Router mapping: route groups `(marketing)`, `(legal)` for organization without URL impact; flag which segments need designed `loading.tsx` / `error.tsx` / `not-found.tsx` (built by `routing`).
8. Write part 1 of `design/SITEMAP.md` in the format below. `wireframe` appends part 2 — leave the file ending after the route tree.

## Page-count discipline

| Brief signal | Page budget |
|---|---|
| Single product/service, one audience | 1 page + legal |
| SaaS with pricing | 3–5: home, pricing, about-or-changelog, contact |
| Portfolio/agency | 3–6: work index, work/[slug], about, contact |
| E-commerce | home, collection/[slug], product/[slug], cart, checkout, legal |
| Editorial/blog-led | home, posts index, posts/[slug], about |

## Legal pages (jurisdiction-keyed)

Legal pages are decided by the client's market and entity, not by taste — they always exist, live footer-only, and never enter top nav. Which ones are mandatory is a jurisdiction lookup run at inventory time, never a generic "add a privacy link later":

- **DE / AT / CH market, any real business or organization → `/impressum` + `/datenschutz` are non-negotiable.** Auto-add both; not brief-overridable except by an explicitly logged justification (purely non-commercial, or a non-DACH entity). Germany's Impressumspflicht is §5 DDG (the 2024 successor to §5 TMG); a missing or incomplete Impressum is a live Abmahnung/UWG target, not a nicety. AT is §5 ECG + §25 MedienG; CH has no formal Impressumspflicht but DSG/UWG still demand provider identity + contact.
- **Elsewhere** → `/privacy` whenever personal data is processed (nearly always), `/terms` if there's a transaction, nothing performative beyond that.
- **Accessibility information (EAA) — scoped, never blanket.** Read BRIEF.md §Compliance facts: only a build that is IN scope — DE (BFSG) or AT (BaFG) market AND the site concludes consumer contracts online (shop, booking, ticketing) AND no microenterprise exemption (<10 employees and ≤€2M) — gets `/barrierefreiheit` (the § 14/Anlage 3 information as a dedicated route — house convention; the statute also allows AGB placement), footer-linked beside Impressum/Datenschutz. CH-only and out-of-scope builds get none. `gate-accessibility` re-derives the scoping from the finished build and flags drift, so record the decision and its reasoning here, not just the route.

`/impressum` required fields — `gate-content` verifies each is present and complete:
- Diensteanbieter: full legal name + legal form; for a GmbH/UG the vertretungsberechtigte person; a real postal address (no P.O. box).
- Rapid contact: email plus a second fast channel; Handelsregister (Registergericht + HRB/HRA) and USt-IdNr per §27a UStG where the entity has them.
- Regulated professions: Kammer, Berufsbezeichnung + granting state, applicable berufsrechtliche Regelungen.
- Editorially-responsible person (V.i.S.d.P., name + address) per §18 Abs. 2 MStV — successor to §55 RStV — when the site carries journalistic-editorial content.
- A §36 VSBG dispute-resolution statement. Do NOT add an EU ODR-platform link: that platform went offline on 20 July 2025 (Reg. 2024/3228), so the once-mandatory link is now itself an Abmahnung risk.

`/datenschutz` is the GDPR Art. 13 notice. Both are real structured content — `ultraweb:copywriting` gives them headings and plain sentences, never a pasted wall of legal text. The cookie/consent banner is a runtime layer, not a page — that's `ultraweb:consent`, and it never gates content.

## Nav rules

- Labels are 1–2 words, nouns, no cleverness in the nav — save personality for the pages.
- The CTA repeats the highest-priority conversion goal in the sitemap; there is exactly one CTA in the header.
- Define the active-state rule per item: exact-match for `/`, prefix-match for collections (`/posts/*` lights up "Writing").
- Footer holds three groups max (product / company / legal); header nav is never duplicated verbatim in the footer.
- Mobile nav preserves desktop order — reordering between breakpoints breaks spatial memory.

## SITEMAP.md part 1 format

```
# Sitemap

## Pages
| Page | Route | Purpose (one sentence) | Conversion goal | Nav |
|---|---|---|---|---|
| Home | / | <one sentence> | <one goal> | header 1 |
| Pricing | /pricing | <one sentence> | <one goal> | header 2 |
| Privacy | /privacy | <one sentence> | — | footer/legal |
| Impressum | /impressum | <DACH-mandated §5 DDG provider identification> | — | footer/legal |

## Navigation
Header: <labels in order> + CTA: <label> → <route>
Footer: product: <links> · company: <links> · legal: <links>
Active-state: <exact or prefix rule per item>

## Route tree
app/
  (marketing)/page.tsx
  (marketing)/pricing/page.tsx
  posts/[slug]/page.tsx        ← dynamic only, ≥4 real items
Segments needing loading.tsx / not-found.tsx: <list> (build: routing)
```

## Anti-patterns

- `Home | About | Services | Blog | Contact` as reflex — the default 5-pager with no brief justification
- A `/services` or `/features` page whose purpose sentence is "describes our services" — that is a section, not a page
- "Purpose: informational" or any page with no conversion goal — every page ends somewhere
- Routes >2 segments deep on a marketing site; `/products/category/item` for 6 products
- 6+ top-level nav items, or two CTAs in the header competing for the same click
- A `/blog` route with 0–1 planned posts — an empty blog reads worse than no blog; cut it
- `[slug]` segments for a collection that will never exceed 3 items — hardcode the routes
- A DE/AT/CH-market build with no `/impressum` — a missing (or ODR-link-stale) Impressum is an Abmahnung target under §5 DDG, not a footer nicety to backfill later

## Worked example — Tidepool, port-logistics SaaS marketing site

Moved to `references/example.md` — read only when this build's case is genuinely ambiguous; the sections above are the decision material.

## Composes with

Moved to `references/composes.md` — the handoff map; load it when orchestrating this skill against its neighbors.
