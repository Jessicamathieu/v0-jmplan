#!/bin/bash
# Script de déploiement one-shot pour pnpm + Vercel

set -e

echo "👉 Vérification du status Git..."
git status

echo "👉 Ajout de tous les fichiers modifiés..."
git add .

echo "👉 Commit avec message automatique..."
git commit -m "🚀 Déploiement auto : maj code et pages"

echo "👉 Push vers GitHub (branche main)..."
git push origin main

echo "✅ Push terminé. Vercel va lancer le redeploy automatiquement."
echo "⚡ Va vérifier ton projet sur https://vercel.com/dashboard pour suivre le déploiement."
