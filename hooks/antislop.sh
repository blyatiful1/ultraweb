#!/usr/bin/env bash
# antislop.sh — PostToolUse hook on Write|Edit.
# Kills taste banned-list violations at write time (~30ms of grep) instead of
# letting them survive to a Phase 11 fix round. Exit 2 = blocking feedback to Claude.
# Scoped hard: only fires inside an ultraweb build (a design/BRIEF.md ancestor),
# only on source files, never on the design record itself.

set -u
input="$(cat)"

# Best-effort file_path extraction without jq; bail silently if we can't parse.
file_path="$(printf '%s' "$input" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*:[[:space:]]*"//; s/"$//')"
[ -n "${file_path:-}" ] || exit 0

# Normalize Windows paths (C:\... / C:\\... from JSON) so the guard doesn't
# silently stand down on Windows — [ -f "C:\..." ] fails in this shell.
case "$file_path" in
  [A-Za-z]:*)
    if command -v cygpath >/dev/null 2>&1; then
      file_path="$(cygpath -u "$file_path")"
    else
      drive="$(printf '%.1s' "$file_path" | tr '[:upper:]' '[:lower:]')"
      file_path="/$drive$(printf '%s' "$file_path" | cut -c3- | tr '\\' '/')"
    fi ;;
  *\\*) file_path="$(printf '%s' "$file_path" | tr '\\' '/')" ;;
esac

case "$file_path" in
  *.tsx|*.ts|*.jsx|*.js|*.css|*.mdx|*.md|*.json) ;;
  *) exit 0 ;;
esac
case "$file_path" in
  */design/*|*/node_modules/*|*/.next/*|*/studio/*) exit 0 ;;
esac
[ -f "$file_path" ] || exit 0

# Only police ultraweb builds: walk up looking for design/BRIEF.md.
dir="$(dirname "$file_path")"
marker=""
while [ "$dir" != "/" ] && [ -n "$dir" ]; do
  if [ -f "$dir/design/BRIEF.md" ]; then marker="$dir"; break; fi
  dir="$(dirname "$dir")"
done
[ -n "$marker" ] || exit 0

violations=""
check() { # $1 = pattern, $2 = taste-law line
  if grep -nE "$1" "$file_path" >/dev/null 2>&1; then
    violations="${violations}  line $(grep -nE "$1" "$file_path" | head -1 | cut -d: -f1): $2\n"
  fi
}

check 'from-(purple|violet|fuchsia)-[0-9]+.*to-(blue|indigo|violet)-[0-9]+' 'purple-to-blue gradient — the AI-slop signature (taste banned list)'
check 'bg-clip-text.*text-transparent.*bg-gradient|bg-gradient.*bg-clip-text.*text-transparent' 'gradient text on a headline as a default move (taste banned list)'
check 'href="#"' 'dead href="#" link — every link resolves or does not ship (taste banned list)'
check '[Ll]orem ipsum' 'lorem ipsum — zero placeholder anything (definition of done #2)'
check '>Feature [0-9]<|"Feature [0-9]"' 'stock "Feature N" copy (taste banned list)'
check 'placeholder\.com|via\.placeholder' 'placeholder.com image (taste banned list)'
check 'Elevate your|Unlock the power|Empower your|Seamlessly [a-z]' 'dead startup copy (taste banned list)'
check '✨|🚀|🎉' 'emoji in production copy (taste banned list)'
check '★★★★★|Happy Customer|John D\.' 'fabricated-proof tell — real attribution or no testimonial (social-proof)'

# UNVERIFIED-PROOF samples are demo/staging-only: block unless the build's BRIEF.md
# declares that mode on EXACTLY one well-formed line (fail-closed: a prefix like
# "demo-bogus", a duplicate, or a malformed line all read as production).
if grep -n 'UNVERIFIED-PROOF' "$file_path" >/dev/null 2>&1; then
  mode_count="$(grep -Eic '^Deployment mode:' "$marker/design/BRIEF.md" 2>/dev/null || echo 0)"
  if [ "$mode_count" != "1" ] || ! grep -Eiq '^Deployment mode:[[:space:]]*(demo|staging)[[:space:]]*$' "$marker/design/BRIEF.md" 2>/dev/null; then
    violations="${violations}  line $(grep -n 'UNVERIFIED-PROOF' "$file_path" | head -1 | cut -d: -f1): UNVERIFIED-PROOF sample without exactly one well-formed 'Deployment mode: demo|staging' line in BRIEF.md — fabricated proof (taste banned list)\n"
  fi
fi

if [ -n "$violations" ]; then
  printf 'ultraweb antislop hook — this write violates the taste constitution:\n%b  Fix it now, at the source: consult ultraweb:taste (and ultraweb:copywriting for copy). Do not re-write the same content with a workaround.\n' "$violations" >&2
  exit 2
fi
exit 0
