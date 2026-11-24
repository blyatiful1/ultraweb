#!/usr/bin/env bash
# scaffold-fixture.sh — the mechanical core of references/scaffold.md (Next path), executable.
# It installs the EXACT versions pinned in stack/versions.json (never @latest), so a green run
# means the documented stack builds today. .github/workflows/fixture-build.yml runs it weekly.
# Exit non-zero = the manifest no longer builds, or an install resolved something other than its pin.
# Usage: bash scripts/scaffold-fixture.sh [target-dir]   (default: ./fixture)
set -euo pipefail
dir="${1:-fixture}"
manifest="${ULTRAWEB_MANIFEST:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/stack/versions.json}"
pin() { node -e "const v=require(process.argv[1]).packages[process.argv[2]]; if(!v){console.error('no pin for '+process.argv[2]);process.exit(1)} console.log(v)" "$manifest" "$1"; }

# Step 1 — init. Turbopack is the default bundler; there is no --turbopack flag.
npx --yes "create-next-app@$(pin next)" "$dir" --yes

cd "$dir"

# Step 2 — move what create-next-app left floating onto the pins.
npm i --save-exact "next@$(pin next)" "react@$(pin react)" "react-dom@$(pin react-dom)"
npm i -D --save-exact "tailwindcss@$(pin tailwindcss)" "@tailwindcss/turbopack@$(pin tailwindcss)"

# Step 3 — Tailwind v4 token skeleton (CSS-first; no tailwind.config.js ever)
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

# Step 4 — shadcn init (defaults; it merges its own tokens into globals.css and writes
# components.json; token reconciliation is a judgment step done in a real build)
npx --yes "shadcn@$(pin shadcn)" init -d -y

# Step 5 — the closed base install
npm i --save-exact "motion@$(pin motion)" "lucide-react@$(pin lucide-react)" "zod@$(pin zod)" "next-themes@$(pin next-themes)"
# Playwright is a devDependency so scripts/gates.mjs resolves it from the project (browsers install separately).
npm i -D --save-exact "playwright@$(pin playwright)"

# Step 6 — strip create-next-app demo markup
cat > app/page.tsx <<'TSX'
export default function Home() {
  return <main className="flex min-h-screen items-center justify-center">scaffold ok</main>;
}
TSX

# Step 7 — smoke: production build, strict types, dev-server 200
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

# Evidence loop: every package must resolve to its pin. A mismatch or a missing package fails the script.
node -e "
const m=require('$manifest').packages, l=require('./package-lock.json');
let bad=0;
for (const w of ['next','react','react-dom','tailwindcss','shadcn','motion','lucide-react','zod','next-themes','playwright']) {
  const p=l.packages['node_modules/'+w], got=p?p.version:'MISSING', ok=got===m[w];
  console.log((ok?'ok   ':'FAIL ')+w+': '+got+(ok?'':' (pin '+m[w]+')'));
  if(!ok) bad++;
}
process.exit(bad?1:0)"
echo "SCAFFOLD_FIXTURE_GREEN"
