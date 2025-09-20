#!/usr/bin/env bash
set -euo pipefail
ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"

mapfile -t files < <(find app/api -type f \( -name 'route.ts' -o -name 'route.js' \) | sort)

if [ ${#files[@]} -eq 0 ]; then
  echo "Aucun fichier app/api/**/route.ts|js trouvé."
  exit 1
fi

for f in "${files[@]}"; do
  if grep -q "export const dynamic" "$f"; then
    echo "✓ déjà présent: $f"
  else
    echo "→ patch: $f"
    tmp="${f}.tmp"
    {
      echo 'export const dynamic = "force-dynamic"'
      echo
      cat "$f"
    } > "$tmp"
    mv "$tmp" "$f"
  fi
done

echo
echo "Terminé. Vérifie les changements avec: git --no-pager diff -- app/api"
echo "Puis rebuild: npm run build"
