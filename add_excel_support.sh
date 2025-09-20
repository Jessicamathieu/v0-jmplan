#!/usr/bin/env bash
set -euo pipefail
ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"

echo "➡️ Vérification du fichier lib/excel.ts"
if [ ! -f lib/excel.ts ]; then
  echo "❌ lib/excel.ts introuvable — création..."
  mkdir -p lib
  cat > lib/excel.ts <<'EOF'
import * as XLSX from "xlsx"

// Exporter en CSV
export function exportCSV(data: any[], filename: string) {
  const rows = [Object.keys(data[0] || {}), ...data.map(obj => Object.values(obj))]
  const csv = rows.map(r => r.join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
}

// Exporter en Excel
export function exportExcel(data: any[], filename: string) {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data")
  XLSX.writeFile(workbook, filename)
}

// Importer CSV
export async function importCSV(file: File) {
  const text = await file.text()
  const [header, ...lines] = text.split("\n").map(r => r.split(","))
  return lines.map(line => Object.fromEntries(line.map((val, i) => [header[i], val])))
}

// Importer Excel
export async function importExcel(file: File) {
  const data = await file.arrayBuffer()
  const workbook = XLSX.read(data)
  const sheetName = workbook.SheetNames[0]
  return XLSX.utils.sheet_to_json(workbook.Sheets[sheetName])
}
EOF
fi

echo "➡️ Injection des imports dans app/donnees/page.tsx"
if ! grep -q 'from "@/lib/excel"' app/donnees/page.tsx; then
  sed -i '1i import { importExcel, importCSV, exportExcel, exportCSV } from "@/lib/excel"' app/donnees/page.tsx
fi

echo "✅ Support CSV/Excel ajouté."