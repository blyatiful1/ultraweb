---
name: gates
description: "Run ultraweb's deterministic site checks (accessibility, responsive, content, performance, AI-default tells) against any running site or URL and report failures with selectors. Use when the user asks to check, audit or test a site's quality."
---

# gates

Runs one script against a live site and reports what failed. Works on any site, not only ultraweb builds.

1. Resolve the plugin root as `${CLAUDE_PLUGIN_ROOT}`. If it is empty, find the directory that contains `scripts/gates.mjs`.
2. Get a URL. For a local Next project, run a production build and start it on a fixed port (for example 3100). For a static folder, serve it with any static server. Never audit `next dev`. For a deployed site, use its URL.
3. Make sure Playwright resolves. The script looks in the project's `node_modules`, then the plugin directory, then global. If it exits 3 and prints an install line, run that line, then retry.
4. Run:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/gates.mjs" --url http://localhost:3100 --project .
```

   Add `--routes /,/pricing` to limit routes, `--quick` for homepage only, `--lighthouse` for a Lighthouse pass, `--only a11y,perf` to run some gates.
5. Read `qa/GATES.md` (summary table) and `qa/gates.json` if you need detail.
6. Report to the user, grouped by gate: each failing check, the route and selector or file, and the concrete fix. List `review` items separately as things a person should look at. State the verdict plainly: PASS, FAIL, or UNVERIFIED (browser missing or a check errored).
7. Do not claim WCAG conformance from a green run. Automated checks cover part of WCAG.
8. If the user wants fixes, apply them at the returned selectors, rebuild, and re-run. Stop at an `ESCALATE:` line and report to the user. On a page whose look is already approved, or one that another design skill built, fix under `references/finish.md` in the plugin: the smallest change that passes, and nothing else a visitor would notice.
9. Offer `ultraweb:retrofit` if the user wants a design audit beyond these checks.

Full reference: `references/gates.md` in the plugin.
