## Composes with

- ultraweb:scaffold — creates the tree this contract governs; run app-structure immediately after it
- ultraweb:routing — adds segment files (route groups, loading/error/not-found) under the same rules
- ultraweb:data-fetching — decides caching and streaming once fetches sit in the right server components
- ultraweb:server-actions — the mutation row of the state table
- ultraweb:micro-interactions — produces the components/motion leaves that sections compose
- ultraweb:gate-performance — audits `"use client"` creep against the low-teens target at Phase 11
- ultraweb:navigation — builds components/layout/header.tsx against this plan; its mobile-menu toggle is the canonical nav client leaf this skill assigns
- ultraweb:page-transitions — owns the app/template.tsx re-mount case this skill's layout-vs-template rule defers to, and the aria-live route announcer; app-structure owns the focus-reset half of the same accessible-navigation problem
- ultraweb:gate-accessibility — audits keyboard and screen-reader flows, including that focus lands on `#main-heading` after client navigation
- ultraweb:gate-code — greps every layout.tsx for `"use client"` and counts occurrences, empirically enforcing this skill's leaf-placement rule
