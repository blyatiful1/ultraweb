## Composes with

- **ultraweb:forms** — the dropzone lives among fields; label and error placement follow its rules.
- **ultraweb:server-actions** — server-relay uploads and the post-upload metadata write are actions with errors-as-state.
- **ultraweb:api-design** — the token/presign route handler takes its response envelope and status codes from there.
- **ultraweb:database** — the file record schema and the write that keeps blob and row consistent.
- **ultraweb:media-optimization** — sizes/preload/LCP discipline for rendering what was uploaded.
- **ultraweb:ui-states** — the six dropzone states are designed surfaces, not defaults.
- **ultraweb:brief** — read first to learn what gets uploaded, by whom, and how big; that answer sets the store, the server-relay vs client-direct path, and the size cap.
