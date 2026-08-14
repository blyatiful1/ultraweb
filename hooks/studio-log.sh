#!/usr/bin/env bash
# studio-log.sh — PostToolUse(Task) + SubagentStop hook.
# Appends one JSONL line per agent event to design/studio-log.jsonl so the
# dev-only /studio route (ultraweb:studio) can render a live activity feed
# at zero token cost. No-op outside an ultraweb build.

set -u
input="$(cat)"

[ -f "design/BRIEF.md" ] || exit 0

event="$(printf '%s' "$input" | grep -o '"hook_event_name"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*:[[:space:]]*"//; s/"$//')"
desc="$(printf '%s' "$input" | grep -o '"description"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*:[[:space:]]*"//; s/"$//')"
agent="$(printf '%s' "$input" | grep -o '"subagent_type"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*:[[:space:]]*"//; s/"$//')"

ts="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
# Values were already JSON-escaped in the source payload; strip stray control chars only.
printf '{"ts":"%s","event":"%s","agent":"%s","summary":"%s"}\n' \
  "$ts" "${event:-unknown}" "${agent:-}" "${desc:-}" | tr -d '\000-\010\013\014\016-\037' >> design/studio-log.jsonl
exit 0
