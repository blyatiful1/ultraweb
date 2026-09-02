## Composes with

- ultraweb:ui-states — owns that `not-found.tsx` exists and is designed with a path home; hidden-craft adds brand personality on top, never removing the usable error page beneath.
- ultraweb:routing — `not-found.tsx` per segment plus `global-not-found.tsx` for the app-wide 404; placement lives there.
- ultraweb:copywriting — every console line, 404 headline, and humans.txt credit is written here in brand voice, banned-phrase-clean.
- ultraweb:micro-interactions — any motion in the egg spends the same duration/easing tokens and honours reduced motion.
- ultraweb:seo — humans.txt sits beside robots.txt / sitemap / manifest; the custom header lives with that config and must not clobber security headers.
- ultraweb:command-palette — shares the guarded global-key-listener discipline (ignore inputs, Esc to close, never hijack keys); the egg must not collide with the palette's shortcut.
- ultraweb:theme-worlds — a keyboard egg that flips to a micro-theme borrows the theme machinery there.
- ultraweb:footer — the "made by" credit in humans.txt echoes the footer's human sign-off; keep the two consistent.
- ultraweb:marginalia — a sibling in the human-authorship family; both are last-2% touches that reward a close look, budget them together so the site reads crafted, not cluttered.
- ultraweb:taste — this is pillar 5 (craft in the last 2%); steal the PRINCIPLE — reward the curious — never a competitor's surface.
- ultraweb:gate-accessibility / ultraweb:gate-performance — verify the egg never breaks tab order or key handling and never costs LCP.
