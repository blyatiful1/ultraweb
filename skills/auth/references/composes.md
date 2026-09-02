## Composes with

- **ultraweb:database** — the Drizzle adapter; CLI-generated tables merge into the one schema and migrate there
- **ultraweb:forms** — sign-in/sign-up field design, validation timing, error recovery
- **ultraweb:email** — verification and magic-link mail through Resend
- **ultraweb:server-actions** — every mutation re-checks the session; `nextCookies()` makes cookie-setting actions work
- **ultraweb:ui-states** — signed-out, loading, and error states on every auth-aware surface
- **ultraweb:brief** — reads which pages are protected, which sign-in methods the site needs, and whether roles exist; a BRIEF.md with no auth requirement is the signal to stop, never bolt accounts onto a brochure site
- **ultraweb:api-design** — every route handler it defines under /api/v1/* re-checks the session with `auth.api.getSession`; the optimistic proxy.ts redirect never reaches a forged API request
