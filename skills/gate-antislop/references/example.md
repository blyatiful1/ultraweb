## Worked example — Tidepool, dark-first port-logistics analytics

design/DIRECTION.md: "Precision Instrument — calm, data-forward, dark mode first-class. Signature move: the live berth timeline; no decorative glow." The dark ground is licensed; navy-glow furniture is not.

Phase-11 sweep, written to design/QA.md §gate-antislop:

```md
## gate-antislop — FAIL→PASS (2026-07-16)
greps: 7/11 clean · check 3 (emoji) 1 hit — content/changelog/2026-06-berth-eta.mdx:3, heading "⚓ Berth ETA v2"; no DIRECTION exception → defect
check 6 (dead copy) 1 hit — components/features.tsx:22 "AI-powered berth ETA"; AI-era filler, no meaning → defect
check 9 (glow-orb) 1 hit — components/hero.tsx:34, absolute blur-3xl div oklch(0.68 0.12 200 / .35) behind the timeline; "Precision Instrument" is not the navy-glow archetype → defect
check 11 (AI reflexes) 2 hits — bare <Sparkles> "AI" badge on the ETA card (components/features.tsx:24, no paired icon) + a fixed bottom-6 right-6 chat launcher (app/layout.tsx:41); design/BRIEF.md AI-gate scoped no assistant → defect
screens: rhythm 3 distinct paddings/page · asymmetry present (timeline bleeds right on /) · icon-card rows none · shadcn restyled (teal accent, radius tightened) · corner chat-bubble present bottom-right → defect
fixed: changelog emoji → lucide Ship, 16px, stroke matched to accent teal — routed to ultraweb:icons
fixed: "AI-powered berth ETA" → "Berth ETA, modeled from live AIS" — routed to ultraweb:copywriting; the bare Sparkles badge deleted, the JetBrains Mono ETA numeral is the signifier
fixed: hero glow-orb deleted; the live berth timeline (JetBrains Mono numerals) carries the hero, no crutch — routed to ultraweb:showpiece
fixed: corner chat launcher removed — the brief scoped no assistant; berth questions route to the existing contact CTA
re-grep: checks 3, 6, 9, 11 clean · hero + footer reshot: no corner blob, reads as an instrument, not a template
residual: none
```

Rejected the shortcut of citing the orb in DIRECTION.md just to survive the sweep — furniture is not the signature move, and a citation minted only to pass a gate is exactly the beauty-without-a-decision this gate exists to catch. Rejected too the reflex of keeping the corner chat bubble "because every SaaS has one" — design/BRIEF.md's AI-gate scoped no assistant, and a bot minted to look current is just this decade's glow-orb. Handoff: the corrected QA.md §gate-antislop feeds ultraweb:gate-visual, which re-judges the reshot hero against the required list.
