#!/usr/bin/env bash
# Fixture tests for hooks/shell-write-guard.sh.
# Each case feeds a real PreToolUse payload on stdin and asserts the exit code the
# hook contract promises (0 = pass through, 2 = blocking feedback).
# Run: bash tests/hook-shell-write-guard.test.sh   (exit 1 on any failing case)
set -u
root="$(cd "$(dirname "$0")/.." && pwd)"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

pass=0; fail=0
# $1 = case name, $2 = cwd for the payload, $3 = command string (JSON-escaped by node), $4 = expected exit
expect() {
  payload="$(node -e 'process.stdout.write(JSON.stringify({tool_name:"Bash",cwd:process.argv[1],tool_input:{command:process.argv[2]}}))' "$2" "$3")"
  printf '%s' "$payload" | bash "$root/hooks/shell-write-guard.sh" >/dev/null 2>"$tmp/err"
  got=$?
  if [ "$got" -eq "$4" ]; then pass=$((pass+1)); echo "ok    $1"
  else fail=$((fail+1)); echo "FAIL  $1 — expected exit $4, got $got"; sed 's/^/        /' "$tmp/err" | head -3; fi
}

# An "ultraweb build" is any tree with a design/BRIEF.md ancestor.
site="$tmp/site"
mkdir -p "$site/design" "$site/app" "$site/qa"
echo "brief" > "$site/design/BRIEF.md"
printf 'export default function Page(){return null}\n' > "$site/app/page.tsx"

# --- blocks -----------------------------------------------------------------------------
expect "sed -i on a .tsx blocks (exit 2)"                     "$site" "sed -i 's/foo/bar/' app/page.tsx" 2
expect "sed -i.bak on a .css blocks (exit 2)"                 "$site" "sed -i.bak -e 's/a/b/' app/globals.css" 2
expect "perl -pi -e on a .ts blocks (exit 2)"                 "$site" "perl -pi -e 's/a/b/' lib/tokens.ts" 2
expect "truncating heredoc into design/SYSTEM.md blocks (2)"  "$site" $'cat > design/SYSTEM.md <<\'EOF\'\n## Palette\nEOF' 2
expect "echo > app/globals.css blocks (exit 2)"               "$site" "echo '@theme {}' > app/globals.css" 2
expect "tee without -a onto design/QA.md blocks (exit 2)"     "$site" "printf 'x' | tee design/QA.md" 2
expect ">| clobber onto a .tsx blocks (exit 2)"               "$site" "cat foo >| app/page.tsx" 2
expect "&> onto a .mjs blocks (exit 2)"                       "$site" "node gen.mjs &> scripts/out.mjs" 2
expect ">> onto a source file blocks (exit 2)"                "$site" "echo 'export {}' >> app/extra.ts" 2
expect "qa/ with a source extension blocks (exit 2)"          "$site" "echo x > qa/report.tsx" 2
expect "second command in a && chain blocks (exit 2)"         "$site" "npm run lint && sed -i 's/a/b/' app/page.tsx" 2
expect "absolute path target blocks (exit 2)"                 "$tmp"  "echo x > $site/app/page.tsx" 2

# --- post-scaffold layout: cwd is the parent, the app lives one level down ------------
expect "subdirectory layout still blocks (exit 2)"            "$tmp"  "sed -i 's/a/b/' site/app/page.tsx" 2

# --- allows -----------------------------------------------------------------------------
expect ">> append to design/CONTEXT-HANDOFF.md passes (0)"    "$site" $'cat >> design/CONTEXT-HANDOFF.md <<\'EOF\'\n## Lessons — phase 6\n- the dev server > app/page.tsx line is heredoc text, not a redirect\nEOF' 0
expect "tee -a onto design/QA.md passes (exit 0)"             "$site" "printf 'row' | tee -a design/QA.md" 0
expect "build log redirect passes (exit 0)"                   "$site" "rm -rf .next && npm run build > qa/build.log 2>&1" 0
expect "prod server with 2>&1 and & passes (exit 0)"          "$site" "PORT=3100 npm start > qa/prod.log 2>&1 &" 0
expect "/dev/null passes (exit 0)"                            "$site" "grep -r foo app > /dev/null 2>&1" 0
expect "/tmp target passes (exit 0)"                          "$site" "ls app > /tmp/listing.txt" 0
expect ".env.local passes (exit 0)"                           "$site" "echo 'KEY=1' > .env.local" 0
expect "sed without -i passes (exit 0)"                       "$site" "sed -n '1,20p' app/page.tsx" 0
expect "read-only pipeline passes (exit 0)"                   "$site" "grep -n 'use client' app/page.tsx | head -5" 0
expect "escape-hatch prefix passes (exit 0)"                  "$site" "ULTRAWEB_SHELL_WRITE_OK=1 sed -i 's/a/b/' app/page.tsx" 0
expect "node_modules target passes (exit 0)"                  "$site" "echo x > node_modules/.cache/thing.js" 0
expect "variable target passes through (exit 0)"              "$site" "echo x > \$OUT" 0
expect "perl -I<dir> is not an in-place edit (exit 0)"         "$site" "perl -Ilib -e 'print 1' app/tool.js" 0
expect "tilde target outside the build passes (exit 0)"       "$site" "echo x > ~/ultraweb-guard-test-nowhere/app/page.tsx" 0
expect "perl -pi.bak still blocks (exit 2)"                    "$site" "perl -pi.bak -e 's/a/b/' app/page.tsx" 2

# --- outside an ultraweb build the hook stands down -------------------------------------
mkdir -p "$tmp/plain/app"
printf 'x\n' > "$tmp/plain/app/page.tsx"
expect "non-ultraweb tree is exempt (exit 0)"                 "$tmp/plain" "sed -i 's/a/b/' app/page.tsx" 0
expect "non-ultraweb truncating redirect is exempt (exit 0)"  "$tmp/plain" "echo x > app/page.tsx" 0

# --- payload edge cases ------------------------------------------------------------------
printf '{}' | bash "$root/hooks/shell-write-guard.sh" >/dev/null 2>&1
got=$?
if [ "$got" -eq 0 ]; then pass=$((pass+1)); echo "ok    empty payload passes (exit 0)"
else fail=$((fail+1)); echo "FAIL  empty payload — expected exit 0, got $got"; fi
printf 'not json' | bash "$root/hooks/shell-write-guard.sh" >/dev/null 2>&1
got=$?
if [ "$got" -eq 0 ]; then pass=$((pass+1)); echo "ok    unparseable payload passes (exit 0)"
else fail=$((fail+1)); echo "FAIL  unparseable payload — expected exit 0, got $got"; fi
printf '{"tool_name":"Write","cwd":"%s","tool_input":{"file_path":"app/page.tsx"}}' "$site" | bash "$root/hooks/shell-write-guard.sh" >/dev/null 2>&1
got=$?
if [ "$got" -eq 0 ]; then pass=$((pass+1)); echo "ok    non-Bash tool passes (exit 0)"
else fail=$((fail+1)); echo "FAIL  non-Bash tool — expected exit 0, got $got"; fi

# The block message must name every route out.
printf '{"tool_name":"Bash","cwd":"%s","tool_input":{"command":"sed -i s/a/b/ app/page.tsx"}}' "$site" | bash "$root/hooks/shell-write-guard.sh" >/dev/null 2>"$tmp/msg"
if grep -q 'Edit' "$tmp/msg" && grep -q '>>' "$tmp/msg" && grep -q 'Mechanical agent' "$tmp/msg" && grep -q 'ULTRAWEB_SHELL_WRITE_OK=1' "$tmp/msg" && grep -q 'bypass-mode' "$tmp/msg"; then
  pass=$((pass+1)); echo "ok    block message names Edit, >>, Mechanical agent, the prefix, and the bypass-mode collision"
else
  fail=$((fail+1)); echo "FAIL  block message is missing a route out:"; sed 's/^/        /' "$tmp/msg"
fi

echo ""
echo "$pass passed, $fail failed"
[ "$fail" -eq 0 ] || exit 1
