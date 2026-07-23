# Sitemap

## Pages
| Page | Route | Purpose (one sentence) | Conversion goal | Nav |
|---|---|---|---|---|
| The Journey | / | Tell the whole 1999→2026 story of CS maps as one authored four-act scroll. | Scroll to the CS2 act (site's one story, end to end) | header logo |
| The Atlas | /maps | Browse the 9-map canon as a radar-card archive. | Open a dossier | header 1 + header CTA |
| Dossier | /maps/[slug] | One map's full story: author, lineage, reworks, callouts, moments. | Read the next map (prev/next) | — |
| 404 | (global-not-found) | In-world "MAP FAILED TO COMPILE" with exits home/atlas. | Recover to / or /maps | — |

Legal: none. Logged justification per sitemap rules — purely personal, non-commercial fan project; no data processed, no analytics, no forms, no cookies beyond theme preference (functional, exempt). Footer carries the disclaimer: "A fan project. Not affiliated with Valve Corporation."

Nav: `BLOCKOUT` mono wordmark (→ /), "Atlas" (→ /maps, prefix-match active), theme toggle. One header CTA: "Atlas". Footer groups: journey acts (anchor links) / map index (9 mono links) / disclaimer + "built with" credit.

Route tree: `app/page.tsx`, `app/maps/page.tsx`, `app/maps/[slug]/page.tsx` (+ generateStaticParams for 9 slugs), `app/global-not-found.tsx` (fallback `app/not-found.tsx` if unsupported), `sitemap.ts`, `robots.ts`, `icon.tsx`, `opengraph-image.tsx`. All static — no loading.tsx needed beyond the dossier segment.

---

# Part 2 — Section blueprints

**Site-level:**
- header — skill: navigation — variant: minimal hairline bar — density: wordmark + 1 link + 1 CTA + theme toggle — static, no entrance, `border-b` hairline, mono wordmark.
- footer — skill: footer — variant: three-group mono index — density: 3 groups (acts / 9 maps / disclaimer+credit), corner-tick ornaments — the corners are crafted: closing mono line `// end of file`.

### / (The Journey) — goal: reach Act IV
1. hero — skill: hero — variant: typographic over showpiece backdrop — density: H1 ≤7 words + sub ≤22 + 1 scroll-cue CTA + mono meta line (`1999 — 2026 // 4 engines // 9 maps`) — width: full-bleed — rhythm: open, huge air — job: state the thesis — SIGNATURE: THE COMPILE — persistent R3F diorama pinned as the scroll spine of sections 1–6, compiling wireframe→blockout→textured→lit as the acts pass (reduced-motion/no-WebGL fallback: per-era static SVG posters + sr-only narrative).
2. stats-strip — skill: data-display — variant: Framed Data (radar-ring SVG frames) — density: 4 stats (years, maps, engines, peak players) figure + ≤5-word label — width: contained — rhythm: tight after hero — job: quantify the legend.
3. act-i-goldsrc — skill: feature-sections — variant: era act (`data-world="goldsrc"`) — density: act eyebrow (mono `ACT I // GOLDSRC // 1999–2004`) + era title ≤3 words at --text-display + narrative ≤110 words + 4-map birth list + 1 defining moment — width: contained text rail LEFT of spine — rhythm: release around title, compress the roster — job: where it all began.
4. act-ii-source — same variant (`data-world="source"`) — text rail RIGHT (page asymmetry) — density as act-i, narrative ≤100 words — job: the engine that smoothed the world.
5. act-iii-go — same variant (`data-world="go"`) — text LEFT — density: +majors/Arms-Deal context, ≤130 words, densest act — rhythm: tightest of the four — job: the decade CS became a sport.
6. act-iv-cs2 — same variant (`data-world="cs2"`) — text RIGHT — density ≤100 words + smoke moment in diorama — rhythm: double release before it — job: the present, still the same war.
7. atlas-teaser — skill: cards — variant: 3 featured radar cards + 1 CTA "Open the Atlas" — width: contained — rhythm: quiet neighbor after signature ends — job: hand off to the archive.
8. closer — skill: feature-sections — variant: full-width mono sign-off — density: 1 line + coordinates + CTA repeat — width: full-bleed — rhythm: double space before — job: the ask, nothing else.
Mobile: diorama renders as reduced-height sticky backdrop (or posters at low power); act text rails stack text-first; stats 2×2; nothing reorders.

### /maps (The Atlas) — goal: open a dossier
1. atlas-header — skill: hero — variant: index header — density: H1 + mono count line (`9 entries // sorted by first compile`) — width: narrow — rhythm: tight — job: label the archive.
2. atlas-grid — skill: cards — variant: radar-card grid with exposed hairline column rules; era filter chips (all/goldsrc/source/go/cs2, client-side, URL param) — density: 9 cards (radar SVG + name + mono meta + birth year), Dust II spans 2 cols — width: contained-wide — rhythm: the grid IS the page; asymmetry via the spanning card — job: make browsing a pleasure (Archive-as-Toy: filter reflow via motion layout).
3. atlas-footnote — skill: feature-sections — variant: mono footnote strip — density: 1 line on curation ("Vertigo fans: we know.") — width: narrow — job: crafted corner.
Mobile: single column, chips scroll horizontally, spanning card collapses to 1 col.

### /maps/[slug] (Dossier) — goal: read the next map
1. dossier-hero — skill: hero — variant: document header (`data-world` = map's birth era) — density: mono breadcrumb path (`goldsrc/maps/de_dust2.bsp`) + H1 map name + sub (author · year · one-liner) — width: contained — rhythm: tight, document-like — job: open the file.
2. radar-dossier — skill: data-display — variant: 5/7 sticky split — density: radar SVG (sticky, 5 cols) + lineage timeline (3–5 entries) + facts table (author/debut/games/reworks) — width: contained — rhythm: the data wall; hairline table rules — job: the evidence.
3. callouts — skill: data-display — variant: mono tag grid — density: 3–5 callouts + 1-line note each — width: narrow — rhythm: tight — job: speak the language.
4. moments — skill: feature-sections — variant: numbered editorial list — density: 2–3 moments, H3 + ≤35 words — width: narrow — rhythm: air between items — job: why it mattered.
5. next-map — skill: cards — variant: prev/next full-width pair — density: 2 cards — width: full-bleed — rhythm: closing — job: keep reading.
Mobile: radar on top (not sticky), all stacks; tables stay tables (scroll-x if needed).

### 404 — MAP FAILED TO COMPILE
1 screen: mono error dump styled as compile log (`error: brush 404 leaked into the void`), H1, two exits (/ and /maps). Crafted corner, no motion.
