---
name: consent
description: GDPR/TTDSG §25 cookie and tracking consent as a design problem, not a bolted-on overlay — equal visual weight for Accept and Reject (never Accept-as-primary with Reject a buried gray link), a banner built from the site's own tokens, a consent-state React context that gates third-party script injection (analytics, Maps/YouTube embeds, chat, font CDNs) until granted, and a persistent footer "Cookie-Einstellungen" resurface link. Invoke in Phase 7 whenever a build loads any analytics, embed, chat widget, or third-party script, or when the user mentions cookies, consent, cookie banner, tracking, DSGVO/GDPR, TTDSG/TDDDG, opt-in, or "add a cookie notice".
---

# consent — consent that isn't a dark pattern

**Stage:** Phase 7 — Backend/compliance (+ Phase 11 gate) - **Reads:** design/BRIEF.md (which third parties?), design/SYSTEM.md (tokens), design/DIRECTION.md (shape/motion language) - **Writes:** components/consent/*, lib/consent.ts, third-party wiring behind the gate, footer reopen link

## When NOT to show a banner — decide this first

The best banner is no banner. Audit what actually touches the visitor's device before you build anything, because most of the audit ends in deletion:

- **Zero non-essential storage → no banner.** §25(2) TTDSG exempts what is *strictly necessary* to deliver the service the user asked for: the session, cart, CSRF token, locale, and the consent record itself. A site with only these needs no consent and no banner. A banner over an essential-only site is theater that trains users to dismiss dialogs.
- **Cookieless analytics → usually no banner.** Plausible / Umami / Fathom read and write nothing on the device; under §25(2) they need no opt-in. Prefer them — swapping GA4 for Plausible can delete the banner outright. Verify the tool truly sets no device storage before you claim the exemption; "anonymized IP" GA is *not* exempt.
- **Self-hosted fonts → no font-CDN consent.** The stack self-hosts via `next/font`. If `fonts.googleapis.com` or `fonts.gstatic.com` appears in source you have *both* a slop hit and a legal one (LG München I, 3 O 17493/20 — €100 damages for leaking an IP to Google) — fix the source, do not add a banner for it.
- **"Might add analytics later" → build nothing now.** The context and gate below retrofit in under an hour. Speculative consent infrastructure taxes every page today.

Only if a genuine non-essential third party survives the audit do you build the banner below — and you scope it to exactly the categories that survived.

## Standard

Every rule here is simultaneously a taste rule and a legal one; that alignment is the whole point. A banner that nudges is a dark pattern whether or not a regulator ever sees it.

- **Deny by default (opt-in, not opt-out).** Nothing non-essential loads before an explicit click — no script, no pixel, no third-party iframe. §25 is prior consent; pre-loading "until they refuse" is the violation (Planet49, CJEU C-673/17).
- **Accept and Reject at equal weight, on the first layer.** Same size, same contrast, same shape and motion; reject reachable in the *same number of clicks* as accept (GDPR Art. 7(3); EDPB Taskforce + German DSK take the stricter CNIL line — a first-layer reject is the safe floor, and "Accept / Settings only" fails). Granular "Einstellungen" may be quieter — it is not the reject path, so demoting it is fine. Demoting *reject* is the dark pattern.
- **No pre-ticked non-essential categories.** Toggles default off; consent is an affirmative act, never a default state.
- **Built in the site's own language.** The banner uses the project's tokens — its neutral ramp, its `--radius-*`, its shadow scale, its easing — never a generic gray OneTrust/Cookiebot/Usercentrics drop-in that reads as pasted from another site (and often ships a *further* third-party dependency and data transfer of its own).
- **Consent is state the app reads.** A first-party cookie plus a client context; script injection is downstream of that state, never hardcoded into the layout.
- **Withdrawable as easily as granted.** A persistent footer "Cookie-Einstellungen" link reopens the banner anytime (Art. 7(3)); withdrawing must cost no more than one extra click than granting did.

## Process

1. **Inventory** every third party from BRIEF.md and the built pages — analytics, Maps/YouTube/Vimeo embeds, chat widgets, font CDNs, ad/retargeting pixels, embedded Stripe/PayPal iframes on non-checkout pages. Kill what "When NOT" lets you kill.
2. **Categorize** the survivors into the *fewest* named buckets — typically `analytics` and `embeds`. Essential is implicit and never offered as a choice.
3. **Build the consent context** (below) and mount `<ConsentProvider>` in the root layout wrapping `{children}` as a server slot, so the provider is the only client boundary (`ultraweb:app-structure`).
4. **Gate every survivor.** A third-party `<Script>` renders only when `useConsent()` reports its category granted. An embed uses the two-click / *Zwei-Klick* pattern: a branded placeholder in the site's tokens, the real `<iframe>` mounts only after the visitor loads it — YouTube's `-nocookie` domain still writes on play, so gate the frame, not just the domain.
5. **If Google tags are unavoidable,** wire Consent Mode v2: set `ad_storage`, `analytics_storage`, `ad_user_data`, `ad_personalization` to `denied` by default and `gtag('consent','update',…)` only inside `save()`. The gate still applies — Consent Mode is a supplement, not a substitute for not loading the tag.
6. **Add the footer reopen link** via `ultraweb:footer`, calling `reopen()`.
7. **Verify empirically:** load the site fresh with the network tab open — nothing third-party may fire before a click. Then accept, reject, reload, and confirm the cookie persists the decision and the reject genuinely blocks. `ultraweb:ship` re-checks this at launch.

## Banner forms

Pick one that fits the direction; all three obey the equal-weight rule — the form is where the site's personality shows, never where the fairness bends.

1. **Bottom bar** — a full-width strip pinned to the bottom, one line of copy + the two equal buttons + a quiet "Einstellungen". The default: least intrusive, never covers content, no scrim. Best for content and commerce sites.
2. **Corner card** — a small card in one bottom corner, in the site's radius and shadow. For minimal/editorial directions where a full bar would feel heavy. Must not obscure primary CTAs at 375px.
3. **Centered modal + scrim** — a focus-trapped dialog over a dim scrim. Use *only* when the brief legitimately needs a decision before interaction (rare — a strong nudge toward "just accept", so justify it). Never trap without a real reject on the first view; a modal with no equal reject is the worst-case dark pattern.

## The consent context

```tsx
// components/consent/consent-provider.tsx
"use client";
import { createContext, useContext, useEffect, useState } from "react";

export type Category = "analytics" | "embeds"; // essential is implicit, always on
export type Consent = Record<Category, boolean>;
const DENY: Consent = { analytics: false, embeds: false }; // §25 is opt-in — deny until granted

type Ctx = { consent: Consent; decided: boolean; save: (c: Consent) => void; reopen: () => void };
const ConsentCtx = createContext<Ctx | null>(null);
export const useConsent = () => {
  const ctx = useContext(ConsentCtx);
  if (!ctx) throw new Error("useConsent must be used within ConsentProvider");
  return ctx;
};

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<Consent>(DENY);
  const [decided, setDecided] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {                                   // rehydrate the prior decision
    const raw = document.cookie.match(/(?:^|; )consent=([^;]+)/)?.[1];
    if (raw) { setConsent(JSON.parse(decodeURIComponent(raw))); setDecided(true); }
  }, []);

  const save = (c: Consent) => {
    document.cookie = `consent=${encodeURIComponent(JSON.stringify(c))}; Max-Age=15552000; Path=/; SameSite=Lax`;
    setConsent(c); setDecided(true); setOpen(false);  // 6-month record; re-ask, don't assume forever
  };
  return (
    <ConsentCtx.Provider value={{ consent, decided, save, reopen: () => setOpen(true) }}>
      {children}
      {(!decided || open) && <ConsentBanner />}       {/* Accept + Reject share ONE button variant */}
    </ConsentCtx.Provider>
  );
}
```

```tsx
// components/consent/consent-embed.tsx — the two-click gate for Maps/YouTube
"use client";
import { useConsent } from "./consent-provider";
export function ConsentEmbed({ label, children }: { label: string; children: React.ReactNode }) {
  const { consent, save } = useConsent();
  if (consent.embeds) return <>{children}</>;         // the iframe mounts ONLY after opt-in
  return (
    <div className="grid place-items-center gap-3 rounded-[var(--radius-lg)] border bg-card p-8 text-center">
      <p className="text-sm text-muted-foreground">{label} lädt externe Inhalte von Dritten.</p>
      <button className="rounded-[var(--radius-md)] bg-primary px-4 py-2 text-primary-foreground"
              onClick={() => save({ ...consent, embeds: true })}>Inhalt laden</button>
    </div>
  );
}
```

The `<ConsentBanner>` renders two buttons from the *same* `ultraweb:buttons` variant — not `primary` vs `ghost`. A gated tag is a leaf: `function Analytics(){ const {consent}=useConsent(); return consent.analytics ? <Script … /> : null; }`.

## Anti-patterns

- **Unequal buttons** — filled/colored Accept beside a gray text-link or ghost Reject. Grep the banner: `rg -n 'variant="(ghost|link|outline|secondary)"' components/consent` — if the reject control's variant differs from accept's, it's a nudge.
- **Reject buried behind "Einstellungen"/"Mehr Optionen"** — a first layer with only Accept + Settings fails German enforcement; reject belongs on the first screen.
- **Pre-ticked categories** — `defaultChecked`, `checked={true}`, or a non-`false` default in `DENY`. Consent is affirmative.
- **Ungated third parties** — `rg -n '<iframe[^>]*src="https://(www\.youtube|www\.youtube-nocookie|player\.vimeo|www\.google\.com/maps)' -g "*.tsx"` outside a `ConsentEmbed`, or a third-party `<Script src="https://…">` with no `useConsent()` guard.
- **Google Fonts leak** — `rg -n "fonts\.(googleapis|gstatic)\.com"` (LG München); self-host via `next/font`, don't consent it away.
- **A drop-in CMP as "the design"** — `rg -ni "cookiebot|onetrust|usercentrics|cookieyes|iubenda"`; an un-restyleable gray overlay violates the "built in the site's own language" rule and adds its own data transfer.
- **No footer reopen link** — consent that can't be withdrawn as easily as given breaks Art. 7(3).
- **Loading on scroll/"implied consent"** — firing tags because the user kept browsing; §25 needs an affirmative act, not the absence of one.

## Worked example — Kaffeewerk Ost, Berlin roastery shop + /abo (German-first, TTDSG applies directly)

The Phase-7 inventory finds three third parties across the built pages: product analytics, an interactive Google Map on `/kontakt` for the Prenzlauer-Berg café, and a YouTube roast-film on `/rösterei`. Applying "When NOT" first: analytics moves to **Plausible** (cookieless, §25(2)-exempt → *no consent needed*), and the Fraunces/Karla pair is already self-hosted via `next/font`, so there is no font-CDN and no `fonts.googleapis.com` in source. That leaves one surviving category — `embeds` — so the banner is scoped to exactly that.

The banner is a **bottom bar** in the warm palette (cream ground `oklch(0.97 0.01 85)`, roast-brown text `oklch(0.28 0.03 60)`), `--radius-lg` corners, the site's 250ms ease-out slide-up honoring `prefers-reduced-motion`. Both decisions are one shared button variant: **"Alle akzeptieren"** and **"Alle ablehnen"** at identical size and contrast — terracotta fill on both, not terracotta-vs-gray — with **"Einstellungen"** as a quieter tertiary link (it opens the one `embeds` toggle, off by default). The Map and the roast-film each render through `ConsentEmbed` — a cream placeholder reading "Karte lädt externe Inhalte von Google" with an **"Karte laden"** button — so no Google or YouTube request fires until the visitor loads it. The footer carries a persistent **"Cookie-Einstellungen"** link calling `reopen()`.

Verification: fresh load with the network tab open shows only first-party requests + Plausible; clicking "Alle ablehnen" and reloading keeps every embed dark; the 6-month cookie persists the choice.

Rejected: the OneTrust drop-in the client's agency proposed (generic gray, its own tracker, un-restyleable), and the tempting terracotta-primary "Akzeptieren" beside a gray "Ablehnen" link — the exact Accept-as-CTA nudge this skill and `ultraweb:gate-antislop` now treat as a banned dark pattern.

Handoff: `ultraweb:footer` places the reopen link; `ultraweb:gate-antislop` runs the fairness greps above at Phase 11; `ultraweb:ship` confirms the clean first-load network tab at launch.

## Composes with

- **ultraweb:gate-antislop** — extend its dark-pattern list (currently purely visual) with consent-UI fairness: unequal Accept/Reject, buried reject, pre-ticked categories, ungated third parties, the Google-Fonts leak, and drop-in CMPs. This skill supplies those greps; the gate enforces them.
- **ultraweb:footer** — hosts the persistent "Cookie-Einstellungen" reopen link as a designed footer element, not a stray line.
- **ultraweb:i18n** — every shipped locale needs full consent copy in that market's voice ("Alle akzeptieren"/"Alle ablehnen"); a half-translated banner is its own defect.
- **ultraweb:media-optimization** — self-hosted fonts and local/`next/video` assets keep third parties (and thus the banner) off the page; a YouTube embed that must stay routes through this skill's two-click gate.
- **ultraweb:seo** — analytics and Search-Console tags are gated here; the Metadata API itself sets no cookie and needs none.
- **ultraweb:buttons** — the Accept/Reject controls inherit the button system but MUST share one variant; equal weight is the constraint that overrides ordinary CTA hierarchy.
- **ultraweb:app-structure** — the `ConsentProvider` is the client boundary in the root layout with `{children}` passed as a server slot, so the provider doesn't force the tree client.
- **ultraweb:ship** — the launch gate verifies no third party fires before consent (a clean network tab on first load).
