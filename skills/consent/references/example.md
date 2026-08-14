## Worked example — Kaffeewerk Ost, Berlin roastery shop + /abo (German-first, TTDSG applies directly)

The Phase-7 inventory finds three third parties across the built pages: product analytics, an interactive Google Map on `/kontakt` for the Prenzlauer-Berg café, and a YouTube roast-film on `/roesterei`. Applying "When NOT" first: analytics moves to **Plausible** (cookieless, §25(2)-exempt → *no consent needed*), and the Fraunces/Work Sans pair is already self-hosted via `next/font`, so there is no font-CDN and no `fonts.googleapis.com` in source. That leaves one surviving category — `embeds` — so the banner is scoped to exactly that.

The banner is a **bottom bar** in the warm palette (cream ground `oklch(0.97 0.01 85)`, roast-brown text `oklch(0.28 0.03 60)`), `--radius-lg` corners, the site's 250ms ease-out slide-up honoring `prefers-reduced-motion`. Both decisions are one shared button variant: **"Alle akzeptieren"** and **"Alle ablehnen"** at identical size and contrast — terracotta fill on both, not terracotta-vs-gray — with **"Einstellungen"** as a quieter tertiary link (it opens the one `embeds` toggle, off by default). The Map and the roast-film each render through `ConsentEmbed` — a cream placeholder reading "Karte lädt externe Inhalte von Google" with an **"Karte laden"** button — so no Google or YouTube request fires until the visitor loads it. The footer carries a persistent **"Cookie-Einstellungen"** link calling `reopen()`.

Verification: fresh load with the network tab open shows only first-party requests + Plausible; clicking "Alle ablehnen" and reloading keeps every embed dark; the 6-month cookie persists the choice.

Rejected: the OneTrust drop-in the client's agency proposed (generic gray, its own tracker, un-restyleable), and the tempting terracotta-primary "Akzeptieren" beside a gray "Ablehnen" link — the exact Accept-as-CTA nudge this skill and `ultraweb:gate-antislop` now treat as a banned dark pattern.

Handoff: `ultraweb:footer` places the reopen link; `ultraweb:gate-antislop` runs the fairness greps above at Phase 11; `ultraweb:ship` confirms the clean first-load network tab at launch.
