## Composes with

- **ultraweb:gate-antislop** — extend its dark-pattern list (currently purely visual) with consent-UI fairness: unequal Accept/Reject, buried reject, pre-ticked categories, ungated third parties, the Google-Fonts leak, and drop-in CMPs. This skill supplies those greps; the gate enforces them.
- **ultraweb:footer** — hosts the persistent "Cookie-Einstellungen" reopen link as a designed footer element, not a stray line.
- **ultraweb:i18n** — every shipped locale needs full consent copy in that market's voice ("Alle akzeptieren"/"Alle ablehnen"); a half-translated banner is its own defect.
- **ultraweb:media-optimization** — self-hosted fonts and local/`next/video` assets keep third parties (and thus the banner) off the page; a YouTube embed that must stay routes through this skill's two-click gate.
- **ultraweb:analytics** — its cookieless default is what usually deletes the banner outright (§25(2) exemption); a cookie-based tool it flags instead becomes the `analytics` category gated here.
- **ultraweb:seo** — analytics and Search-Console tags are gated here; the Metadata API itself sets no cookie and needs none.
- **ultraweb:buttons** — the Accept/Reject controls inherit the button system but MUST share one variant; equal weight is the constraint that overrides ordinary CTA hierarchy.
- **ultraweb:app-structure** — the `ConsentProvider` is the client boundary in the root layout with `{children}` passed as a server slot, so the provider doesn't force the tree client.
- **ultraweb:ship** — the launch gate verifies no third party fires before consent (a clean network tab on first load).
