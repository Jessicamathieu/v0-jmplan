#!/usr/bin/env bash
set -euo pipefail
ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"

LAYOUT="app/layout.tsx"

# Vérifie que le fichier existe
if [[ ! -f "$LAYOUT" ]]; then
  echo "❌ $LAYOUT introuvable"
  exit 1
fi

# Supprime anciennes importations de Google Fonts si présentes
sed -i '/@import url("https:\/\/fonts.googleapis.com/d' "$LAYOUT"
sed -i '/fonts\.gstatic\.com/d' "$LAYOUT"

# Vérifie si next/font/google est déjà importé
if ! grep -q 'from "next/font/google"' "$LAYOUT"; then
  sed -i '1i import { Inter } from "next/font/google"' "$LAYOUT"
  sed -i '2i const inter = Inter({ subsets: ["latin"] })' "$LAYOUT"
fi

# Ajoute la classe de la police à <html>
sed -i 's/<html lang="fr">/<html lang="fr" className={inter.className}>/' "$LAYOUT"

echo "✅ Patch appliqué : next/font/google utilisé dans $LAYOUT"