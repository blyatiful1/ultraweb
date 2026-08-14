## Composes with

- ultraweb:routing — loading.tsx/error.tsx/not-found.tsx placement per segment; owns where the 404 file lives, this skill owns what it says and shows
- ultraweb:hidden-craft — adds the personality layer (micro-scene, console signature) on the not-found page designed here; ui-states owns that the 404 exists, is in-voice, and offers a real way back — hidden-craft is strictly additive over it
- ultraweb:data-fetching — Suspense boundary placement and streaming strategy
- ultraweb:server-actions — pending/error/success wiring via useActionState
- ultraweb:forms — field-level validation and error recovery
- ultraweb:copywriting — the exact words in empty, error, and 404 states, and the tone calibration per brand
- ultraweb:gate-content — its microcopy lint sweeps the error/empty ban-list this skill defines; a bare "Something went wrong" or raw zod default that ships is its gate failure
- ultraweb:motion-language — pulse and morph durations, reduced-motion policy
- ultraweb:cards — the Card-Grid Skeleton duplicates the card component's JSX and aspect ratio so the skeleton→card swap has zero shift
- ultraweb:data-display — list and table skeletons are built from the real data-display row so widths, heights, and radii match exactly
- ultraweb:feature-sections — consumes a designed first-use empty screenshot as a "Day One" proof point (SaaS/tools only, exact screenshot, never a re-render)
- ultraweb:gate-performance — hands off the skeleton→content overlay for CLS verification; a guessed skeleton dimension fails its check
- ultraweb:icons — the empty state's optional glyph is pulled from here at the SYSTEM stroke width, never an emoji
