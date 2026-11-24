#!/usr/bin/env bash
# Fixture tests for hooks/gate-stop.mjs (Stop hook, contract §5).
# Run: bash tests/hook-gate-stop.test.sh   (exit 1 on any failing case)
set -u
root="$(cd "$(dirname "$0")/.." && pwd)"
hook="$root/hooks/gate-stop.mjs"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

pass=0; fail=0
# run <name> <expected exit> <cwd> [stop_hook_active]
run() {
  local got
  printf '{"hook_event_name":"Stop","cwd":"%s","stop_hook_active":%s}' "$3" "${4:-false}" | node "$hook" >/dev/null 2>"$tmp/err"
  got=$?
  if [ "$got" -eq "$2" ]; then pass=$((pass+1)); echo "ok    $1"
  else fail=$((fail+1)); echo "FAIL  $1: expected exit $2, got $got"; sed 's/^/      /' "$tmp/err"; fi
}
gates() { # gates <verdict> [round]
  printf '{"verdict":"%s","round":%s,"checks":[{"id":"a11y.contrast","route":"/","status":"fail"},{"id":"content.links","status":"pass"},{"id":"perf.js","status":"review"}]}\n' "$1" "${2:-1}" > "$site/qa/gates.json"
}

site="$tmp/site"
mkdir -p "$site/design" "$site/qa" "$site/app/deep"
echo '# Brief' > "$site/design/BRIEF.md"

run 'no gates.json passes' 0 "$site"
gates PASS; run 'PASS passes' 0 "$site"
gates UNVERIFIED; run 'UNVERIFIED passes' 0 "$site"

gates FAIL; rm -f "$site/qa/.gate-stop.json"
run 'FAIL blocks (1st)' 2 "$site"
if grep -q 'a11y.contrast (/)' "$tmp/err" && ! grep -q 'content.links' "$tmp/err" && grep -q -- '--done' "$tmp/err"; then
  pass=$((pass+1)); echo 'ok    message lists failing ids only and names --done'
else fail=$((fail+1)); echo 'FAIL  message content'; sed 's/^/      /' "$tmp/err"; fi
run 'stop_hook_active stands down' 0 "$site" true
run 'FAIL blocks (2nd) from a subdirectory' 2 "$site/app/deep"
run 'third stop for the same gates.json passes' 0 "$site"

sleep 1; gates FAIL 2
run 'a new gates.json resets the count' 2 "$site"

sleep 1; printf '{"reason":"blocked on client assets"}\n' > "$site/qa/gates-done.json"
run 'newer gates-done.json stands down' 0 "$site"
sleep 1; gates FAIL 3; rm -f "$site/qa/.gate-stop.json"
run 'older gates-done.json does not' 2 "$site"

gates FAIL 4; rm -f "$site/qa/.gate-stop.json"
run 'round >= 4 (ESCALATE) stands down' 0 "$site"

mkdir -p "$tmp/plain/qa"
printf '{"verdict":"FAIL"}\n' > "$tmp/plain/qa/gates.json"
run 'outside a build passes' 0 "$tmp/plain"

printf 'not json' > "$site/qa/gates.json"
run 'corrupt gates.json fails open' 0 "$site"
for input in 'garbage' ''; do
  printf '%s' "$input" | node "$hook" >/dev/null 2>&1
  if [ $? -eq 0 ]; then pass=$((pass+1)); echo "ok    fails open on stdin: ${input:-<empty>}"; else fail=$((fail+1)); echo "FAIL  stdin: ${input:-<empty>}"; fi
done

cmd="$(node -e 'const h=require(process.argv[1]);process.stdout.write(h.hooks.Stop[0].hooks[0].command)' "$root/hooks/hooks.json")"
printf '{}' | env -i PATH=/nonexistent CLAUDE_PLUGIN_ROOT="$root" /bin/sh -c "$cmd" >/dev/null 2>&1
if [ $? -eq 0 ]; then pass=$((pass+1)); echo 'ok    missing node exits 0'; else fail=$((fail+1)); echo 'FAIL  missing node exits 0'; fi

echo "$pass passed, $fail failed"
[ "$fail" -eq 0 ]
