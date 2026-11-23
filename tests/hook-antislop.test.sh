#!/usr/bin/env bash
# Fixture tests for hooks/antislop.mjs. Each case feeds a PostToolUse payload on stdin
# and asserts the exit code (0 = pass through, 2 = findings shown to Claude).
# Run: bash tests/hook-antislop.test.sh   (exit 1 on any failing case)
set -u
root="$(cd "$(dirname "$0")/.." && pwd)"
hook="$root/hooks/antislop.mjs"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

pass=0; fail=0

# payload <tool> <file_path> <new text> [existing-file-text]
payload() {
  node -e '
    const [tool, file, text] = process.argv.slice(1);
    let input;
    if (tool === "Write") input = { file_path: file, content: text };
    else if (tool === "Edit") input = { file_path: file, old_string: "OLD", new_string: text };
    else input = { file_path: file, edits: [{ old_string: "A", new_string: "clean text" }, { old_string: "B", new_string: text }] };
    process.stdout.write(JSON.stringify({ hook_event_name: "PostToolUse", tool_name: tool, tool_input: input }));
  ' "$1" "$2" "$3"
}

# expect <name> <expected exit> <tool> <file_path> <new text>
expect() {
  local name="$1" want="$2" got
  [ -e "$4" ] || { mkdir -p "$(dirname "$4")"; printf '%s\n' "$5" > "$4"; }
  payload "$3" "$4" "$5" | node "$hook" >"$tmp/out" 2>&1
  got=$?
  if [ "$got" -eq "$want" ]; then pass=$((pass+1)); echo "ok    $name"
  else fail=$((fail+1)); echo "FAIL  $name: expected exit $want, got $got"; sed 's/^/      /' "$tmp/out"; fi
}

site="$tmp/site"
mkdir -p "$site/design" "$site/components" "$site/app"
printf '# Brief\nDeployment mode: production\n' > "$site/design/BRIEF.md"

# Hard defects block.
expect 'lorem ipsum blocks' 2 Write "$site/components/a.tsx" '<p>Lorem ipsum dolor</p>'
expect 'multi-space, mixed-case lorem blocks' 2 Write "$site/components/b.tsx" '<p>LOREM   Ipsum</p>'
expect 'href="#" blocks' 2 Write "$site/components/c.tsx" '<a href="#">x</a>'
expect "single-quoted href='#' blocks" 2 Write "$site/components/d.tsx" "<a href='#'>x</a>"
expect 'JSX-expression href={"#"} blocks' 2 Write "$site/components/e.tsx" '<a href={"#"}>x</a>'
expect 'unquoted HTML href=# blocks' 2 Write "$site/app/f.html" '<a href=# class=x>x</a>'
expect 'placehold.co image blocks' 2 Write "$site/components/g.tsx" '<img src="https://placehold.co/600x400" alt="" />'
expect 'picsum.photos image blocks' 2 Write "$site/components/h.tsx" '<img src="https://picsum.photos/200" alt="" />'
expect 'star-emoji rating blocks' 2 Write "$site/components/i.tsx" '<span>⭐⭐⭐⭐⭐</span>'
expect 'star-glyph rating blocks' 2 Write "$site/components/j.tsx" '<span>★ ★ ★ ★ ★</span>'
expect 'Happy Customer attribution blocks' 2 Write "$site/components/k.tsx" '<cite>happy  customer</cite>'
expect 'John D. attribution blocks' 2 Write "$site/components/l.tsx" '<cite>John D.</cite>'
expect 'Feature N copy blocks' 2 Write "$site/components/m.tsx" '<h3>Feature 2</h3>'
expect 'UNVERIFIED-PROOF on production blocks' 2 Write "$site/components/n.tsx" '// UNVERIFIED-PROOF sample'
expect 'Edit new_string is scanned' 2 Edit "$site/components/o.tsx" '<a href="#">x</a>'
expect 'MultiEdit second new_string is scanned' 2 MultiEdit "$site/components/p.tsx" 'lorem ipsum'

# False positives from the v1 audit stay quiet.
expect 'purple gradient is style, not blocked' 0 Write "$site/components/r.tsx" '<div className="bg-gradient-to-r from-purple-500 to-blue-500" />'
expect 'emoji is style, not blocked' 0 Write "$site/components/s.tsx" '<p>Launch day 🚀</p>'
expect 'README.md is not a source file' 0 Write "$site/README.md" 'Lorem ipsum notes'
expect 'JSON is not a source file' 0 Write "$site/app/x.json" '{"a":"lorem ipsum"}'
expect 'design/ record is skipped' 0 Write "$site/design/notes.mdx" 'lorem ipsum'
expect 'test files are skipped' 0 Write "$site/components/a.test.tsx" 'expect(html).not.toContain("lorem ipsum")'
expect 'skip link href="#main" passes' 0 Write "$site/components/t.tsx" '<a href="#main">Skip to content</a>'
expect 'prose "happy customers" passes' 0 Write "$site/components/u.tsx" '<p>Our customers are happy customers of the roastery.</p>'
expect 'clean source passes' 0 Write "$site/components/v.tsx" 'export const H = () => <h1>Closed books, not seats.</h1>;'

# An edit with clean new text passes even when the file already holds a defect.
printf '<a href="#">old</a>\n<p>OLD</p>\n' > "$site/components/w.tsx"
expect 'clean edit to a file with a pre-existing defect passes' 0 Edit "$site/components/w.tsx" '<p>Real copy</p>'

# Demo mode makes UNVERIFIED-PROOF lawful.
demo="$tmp/demo"
mkdir -p "$demo/design" "$demo/components"
printf '# Brief\nDeployment mode: demo\n' > "$demo/design/BRIEF.md"
expect 'UNVERIFIED-PROOF on demo passes' 0 Write "$demo/components/a.tsx" '// UNVERIFIED-PROOF sample'
printf 'Deployment mode: demo\n' >> "$demo/design/BRIEF.md"
expect 'duplicated mode line fails closed to production' 2 Write "$demo/components/b.tsx" '// UNVERIFIED-PROOF sample'

# Outside an ultraweb build the hook stands down.
expect 'no design/BRIEF.md ancestor passes' 0 Write "$tmp/plain/src/a.tsx" '<a href="#">x</a> lorem ipsum'

# Relative path: cwd from the payload.
printf '<a href="#">x</a>\n' > "$site/components/rel.tsx"
node -e 'process.stdout.write(JSON.stringify({tool_name:"Write",cwd:process.argv[1],tool_input:{file_path:"components/rel.tsx",content:"<a href=\"#\">x</a>"}}))' "$site" | node "$hook" >/dev/null 2>&1
if [ $? -eq 2 ]; then pass=$((pass+1)); echo 'ok    relative path uses payload cwd'; else fail=$((fail+1)); echo 'FAIL  relative path uses payload cwd'; fi

# Fail open on garbage input and on an empty payload.
for input in 'not json' '' '{"tool_input":{}}'; do
  printf '%s' "$input" | node "$hook" >/dev/null 2>&1
  if [ $? -eq 0 ]; then pass=$((pass+1)); echo "ok    fails open on: ${input:-<empty>}"; else fail=$((fail+1)); echo "FAIL  did not fail open on: ${input:-<empty>}"; fi
done

# The stderr message names the line inside the file, not inside the edit.
printf 'line one\nline two\n<a href="#">x</a>\n' > "$site/components/lines.tsx"
payload Edit "$site/components/lines.tsx" '<a href="#">x</a>' | node "$hook" 2>"$tmp/err" >/dev/null
if grep -q 'line 3: dead "#" link' "$tmp/err"; then pass=$((pass+1)); echo 'ok    reports the file line'; else fail=$((fail+1)); echo 'FAIL  reports the file line'; cat "$tmp/err"; fi

# The hooks.json guard exits 0 when node is missing.
cmd="$(node -e 'const h=require(process.argv[1]);process.stdout.write(h.hooks.PostToolUse[0].hooks[0].command)' "$root/hooks/hooks.json")"
printf '{}' | env -i PATH=/nonexistent CLAUDE_PLUGIN_ROOT="$root" /bin/sh -c "$cmd" >/dev/null 2>&1
if [ $? -eq 0 ]; then pass=$((pass+1)); echo 'ok    missing node exits 0'; else fail=$((fail+1)); echo 'FAIL  missing node exits 0'; fi

echo "$pass passed, $fail failed"
[ "$fail" -eq 0 ]
