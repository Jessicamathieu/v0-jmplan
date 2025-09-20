#!/usr/bin/env bash
set -euo pipefail
ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"

echo "➡️ Ajout des boutons CSV/Excel dans DonneesPage"

# Vérifie si le fichier contient déjà l'import
if ! grep -q 'from "@/lib/excel"' app/donnees/page.tsx; then
  sed -i '1i import { importExcel, importCSV, exportExcel, exportCSV } from "@/lib/excel"' app/donnees/page.tsx
fi

# Ajoute les boutons dans la section produits
sed -i '/<CardTitle className="text-primary">Liste des produits<\/CardTitle>/a \
                <div className="flex gap-2">\
                  <Button variant="outline" size="sm" onClick={() => exportCSV(filteredProducts, "produits.csv")}>CSV</Button>\
                  <Button variant="outline" size="sm" onClick={() => exportExcel(filteredProducts, "produits.xlsx")}>Excel</Button>\
                  <input type="file" accept=".csv" onChange={(e) => e.target.files && importCSV(e.target.files[0]).then(console.log)} />\
                  <input type="file" accept=".xlsx" onChange={(e) => e.target.files && importExcel(e.target.files[0]).then(console.log)} />\
                </div>' app/donnees/page.tsx

# Ajoute les boutons dans la section services
sed -i '/<CardTitle className="text-primary">Liste des services<\/CardTitle>/a \
                <div className="flex gap-2">\
                  <Button variant="outline" size="sm" onClick={() => exportCSV(filteredServices, "services.csv")}>CSV</Button>\
                  <Button variant="outline" size="sm" onClick={() => exportExcel(filteredServices, "services.xlsx")}>Excel</Button>\
                  <input type="file" accept=".csv" onChange={(e) => e.target.files && importCSV(e.target.files[0]).then(console.log)} />\
                  <input type="file" accept=".xlsx" onChange={(e) => e.target.files && importExcel(e.target.files[0]).then(console.log)} />\
                </div>' app/donnees/page.tsx

echo "✅ Boutons CSV/Excel ajoutés dans DonneesPage."
