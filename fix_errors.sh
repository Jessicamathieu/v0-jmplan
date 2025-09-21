# 🔥 Script pour corriger tous les imports queries → database

# Cherche tous les fichiers TypeScript/TSX qui importent "@/lib/queries"
# et remplace automatiquement par "@/lib/database"
grep -rl 'from "@/lib/queries"' ./app ./components ./lib | while read -r file; do
  echo "⚡ Corrige $file"
  sed -i 's|from "@/lib/queries"|from "@/lib/database"|g' "$file"
done

echo "✅ Tous les imports '@/lib/queries' ont été remplacés par '@/lib/database'"
