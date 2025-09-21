#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"

echo "🔍 Recherche des imports problématiques..."

# Chercher tous les fichiers TS/TSX qui importent Database
mapfile -t files < <(grep -rl --include=\*.{ts,tsx} 'import { Database' . || true)

if [ ${#files[@]} -eq 0 ]; then
  echo "✅ Aucun import { Database } trouvé."
  exit 0
fi

for file in "${files[@]}"; do
  echo "→ Correction: $file"

  # Supprimer l'import direct
  sed -i.bak 's/import { Database }.*//' "$file"

  # Ajouter un import correct si besoin
  # On insère après la première ligne d'import du fichier
  if ! grep -q 'lib/database' "$file"; then
    sed -i '1a import { DatabaseService } from "@/lib/database"' "$file"
  fi
done

echo "✨ Correction terminée ! Vérifie avec: git --no-pager diff"