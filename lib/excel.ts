import ExcelJS from "exceljs"
import Papa from "papaparse"

// --------------------
// IMPORT EXCEL (.xlsx)
// --------------------
export async function importExcel(file: File) {
  const buffer = await file.arrayBuffer()
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(buffer)

  const sheet = workbook.getWorksheet(1) // première feuille
  const rows: any[] = []

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return // skip header
    rows.push(row.values?.slice(1)) // slice pour enlever l’index
  })

  return rows
}

// --------------------
// IMPORT CSV (.csv)
// --------------------
export async function importCSV(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (err) => reject(err),
    })
  })
}

// --------------------
// EXPORT EXCEL (.xlsx)
// --------------------
export async function exportExcel(data: any[], filename = "export.xlsx") {
  if (!data || data.length === 0) return

  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet("Données")

  // Headers
  sheet.addRow(Object.keys(data[0]))

  // Rows
  data.forEach((row) => {
    sheet.addRow(Object.values(row))
  })

  // Style premium
  sheet.getRow(1).font = { bold: true, color: { argb: "FF2743E3" }, size: 12 }
  sheet.getRow(1).alignment = { horizontal: "center" }

  // Auto-fit columns
  sheet.columns.forEach((col) => {
    let maxLength = 10
    col.eachCell({ includeEmpty: true }, (cell) => {
      const len = cell.value ? cell.value.toString().length : 10
      if (len > maxLength) maxLength = len
    })
    col.width = maxLength + 2
  })

  // Téléchargement
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
}

// --------------------
// EXPORT CSV (.csv)
// --------------------
export function exportCSV(data: any[], filename = "export.csv") {
  if (!data || data.length === 0) return

  const csv = Papa.unparse(data)
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
}
