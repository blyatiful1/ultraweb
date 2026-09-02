#!/usr/bin/env bash
# shell-write-guard.sh — PreToolUse hook on Bash.
# Inside an ultraweb build the Lead edits files with Edit/Write, never through the
# shell: every out-of-band write (sed -i, a truncating redirect, a heredoc script)
# echoes the changed region back into the Lead's context as diff noise, so the shell
# route costs MORE than the Edit it replaced (root SKILL.md §Context discipline, rule 4).
# The harness's bypass-permissions mode nudges toward shell edits; this hook is the
# deterministic floor under the rule. Exit 2 = blocking feedback to Claude.
#
# Scoped hard: only fires when the write target sits inside an ultraweb build (a
# design/BRIEF.md ancestor); anything outside a build passes, wherever it lives. Blocks
# in-place edits, truncating redirects, and appends to source files (.tsx .ts .jsx .js
# .mjs .cjs .css .mdx), and in-place edits / truncating redirects to top-level
# design/<Name>.md; `>>` and `tee -a` to design/<Name>.md stay allowed (ledger appends,
# rule 5), as do /dev/null, *.log, .env*, .gitignore, node_modules/, .next/, and qa/**
# (minus source extensions). Escape hatch: the prefix `ULTRAWEB_SHELL_WRITE_OK=1 ` at the
# very start of the command string (the hook sees only stdin, not the environment);
# for a compound command use `ULTRAWEB_SHELL_WRITE_OK=1 bash -c '…'`.
#
# The analysis (JSON + shell-word tokenizing with quotes, heredocs, dups like 2>&1)
# lives in the sibling shell-write-guard.mjs; this wrapper only checks that node exists.
# ultraweb cannot run without node (Phase 0 toolchain), so a host without it stands down.

set -u
command -v node >/dev/null 2>&1 || exit 0
dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec node "$dir/shell-write-guard.mjs"
