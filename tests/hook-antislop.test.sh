#!/usr/bin/env bash
# Fixture tests for hooks/antislop.sh and hooks/studio-log.sh.
# Each case feeds a real PostToolUse payload on stdin and asserts the exit code
# the hook contract promises (0 = pass through, 2 = blocking feedback).
# Run: bash tests/hook-antislop.test.sh   (exit 1 on any failing case)
set -u
root="$(cd "$(dirname "$0")/.." && pwd)"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

pass=0; fail=0
expect() { # $1 = case name, $2 = file_path payload value, $3 = expected exit code
  printf '{"tool_input":{"file_path":"%s"}}' "$2" | bash "$root/hooks/antislop.sh" >/dev/null 2>&1
  got=$?
  if [ "$got" -eq "$3" ]; then pass=$((pass+1)); echo "ok    $1"
  else fail=$((fail+1)); echo "FAIL  $1 — expected exit $3, got $got"; fi
}

# An "ultraweb build" is any tree with a design/BRIEF.md ancestor.
site="$tmp/site"
mkdir -p "$site/design" "$site/components"
echo "brief" > "$site/design/BRIEF.md"

printf '<div className="bg-gradient-to-r from-purple-500 to-blue-500" />\n' > "$site/components/bad-gradient.tsx"
expect "purple-to-blue gradient blocks (exit 2)" "$site/components/bad-gradient.tsx" 2

printf 'lorem ipsum dolor sit amet\n' > "$site/components/lorem.tsx"
expect "lorem ipsum blocks (exit 2)" "$site/components/lorem.tsx" 2

printf '<a href="#">read more</a>\n' > "$site/components/dead-link.tsx"
expect 'dead href="#" blocks (exit 2)' "$site/components/dead-link.tsx" 2

printf '<figcaption>Happy Customer</figcaption>\n' > "$site/components/fake-proof.tsx"
expect "fabricated-proof tell blocks (exit 2)" "$site/components/fake-proof.tsx" 2

printf 'export function Hero() { return <h1>Closed books, not seats.</h1>; }\n' > "$site/components/clean.tsx"
expect "clean source passes (exit 0)" "$site/components/clean.tsx" 0

# Outside an ultraweb build (no design/BRIEF.md ancestor) the hook must stand down.
mkdir -p "$tmp/plain/components"
printf 'lorem ipsum <a href="#">x</a>\n' > "$tmp/plain/components/outside.tsx"
expect "non-ultraweb tree is exempt (exit 0)" "$tmp/plain/components/outside.tsx" 0

# The design record itself is never policed.
printf 'banned-list notes: lorem ipsum, href="#"\n' > "$site/design/notes.tsx"
expect "design/ record is exempt (exit 0)" "$site/design/notes.tsx" 0

# Non-source extensions are out of scope.
printf 'lorem ipsum\n' > "$site/components/notes.txt"
expect "non-source extension is exempt (exit 0)" "$site/components/notes.txt" 0

# A payload without file_path must not crash the hook chain.
printf '{}' | bash "$root/hooks/antislop.sh" >/dev/null 2>&1
got=$?
if [ "$got" -eq 0 ]; then pass=$((pass+1)); echo "ok    empty payload passes (exit 0)"
else fail=$((fail+1)); echo "FAIL  empty payload — expected exit 0, got $got"; fi

# studio-log.sh: appends one parseable JSONL line inside a build, no-ops outside.
(
  cd "$site" || exit 1
  printf '{"hook_event_name":"SubagentStop","description":"built hero section","subagent_type":"ultraweb:pixel-qa"}' \
    | bash "$root/hooks/studio-log.sh"
)
if [ -f "$site/design/studio-log.jsonl" ] \
  && node -e 'const l=require("fs").readFileSync(process.argv[1],"utf8").trim().split("\n").pop();const j=JSON.parse(l);if(j.event!=="SubagentStop"||j.agent!=="ultraweb:pixel-qa")process.exit(1)' "$site/design/studio-log.jsonl"; then
  pass=$((pass+1)); echo "ok    studio-log writes parseable JSONL"
else
  fail=$((fail+1)); echo "FAIL  studio-log JSONL missing or unparseable"
fi
(
  cd "$tmp/plain" || exit 1
  printf '{"hook_event_name":"SubagentStop","description":"x"}' | bash "$root/hooks/studio-log.sh"
)
if [ ! -e "$tmp/plain/design/studio-log.jsonl" ]; then
  pass=$((pass+1)); echo "ok    studio-log no-ops outside a build"
else
  fail=$((fail+1)); echo "FAIL  studio-log wrote outside an ultraweb build"
fi

echo ""
echo "$pass passed, $fail failed"
[ "$fail" -eq 0 ] || exit 1
