#!/usr/bin/env bash
# scaffold-fixture.sh — the MECHANICAL core of skills/scaffold (Phase 5), executable.
# One recipe, two consumers: .github/workflows/fixture-build.yml runs it weekly against
# the live ecosystem, and skills/scaffold cites it as the canonical command sequence.
# The skill adds the judgment steps a script can't do (design/ move, shadcn token
# reconciliation, PROGRESS ledger); this file owns the commands and their order.
# Exit non-zero = the recipe no longer works against live versions.
# Usage: bash scripts/scaffold-fixture.sh [target-dir]   (default: ./fixture)
set -euo pipefail
dir="${1:-fixture}"

# Step 2 — init (no --turbopack flag: Turbopack is the Next 16 default)
npx --yes create-next-app@latest "$dir" --yes

cd "$dir"

# Step 4 — Tailwind v4 token skeleton (CSS-first; no tailwind.config.js ever)
cat > app/globals.css <<'CSS'
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

:root {
  --background: oklch(0.985 0.002 90);
  --foreground: oklch(0.2 0.005 90);
}
.dark {
  --background: oklch(0.18 0.004 90);
  --foreground: oklch(0.94 0.003 90);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
}
CSS

# Step 5 — shadcn init (defaults; merges its own tokens into globals.css —
# the skill's reconciliation judgment happens in a real build, not here)
npx --yes shadcn@latest init -d -y

# Step 6 — the closed base install
npm i motion lucide-react zod next-themes

# Step 8 — strip create-next-app demo markup
cat > app/page.tsx <<'TSX'
export default function Home() {
  return <main className="flex min-h-screen items-center justify-center">scaffold ok</main>;
}
TSX

# Step 9 — smoke: production build, strict types, dev-server 200
npm run build
npx tsc --noEmit
npm run dev > dev.log 2>&1 &
devpid=$!
trap 'kill "$devpid" 2>/dev/null || true' EXIT
code=""
for _ in $(seq 1 60); do
  code="$(curl -s --noproxy '*' -o /dev/null -w '%{http_code}' http://localhost:3000 || true)"
  [ "$code" = "200" ] && break
  sleep 1
done
if [ "$code" != "200" ]; then
  echo "dev server never returned 200 (last: ${code:-none})"
  tail -20 dev.log
  exit 1
fi

# Evidence loop: print what actually resolved (a real build copies this into design/QA.md).
# A MISSING package is a failed install, so it fails the script — green means the closed set landed.
node -e "const l=require('./package-lock.json');let bad=0;for(const w of ['next','tailwindcss','motion','lucide-react','zod','next-themes']){const p=l.packages['node_modules/'+w];console.log(w+': '+(p?p.version:'MISSING'));if(!p)bad++}process.exit(bad?1:0)"
echo "SCAFFOLD_FIXTURE_GREEN"
