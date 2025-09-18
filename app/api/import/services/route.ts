import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"
import type { ServiceInsert } from "@/lib/database"
import Papa from "papaparse"
import * as XLSX from "xlsx"

interface ImportedService {
  nom: string
  description?: string
  prix: number
  duree: number
  couleur?: string
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 })
    }

    const fileExtension = file.name.split(".").pop()?.toLowerCase()
    let parsedData: ImportedService[] = []

    // Parser selon le type de fichier
    if (fileExtension === "csv") {
      const text = await file.text()
      const result = Papa.parse<ImportedService>(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => {
          const headerMap: Record<string, string> = {
            nom: "nom",
            name: "nom",
            service: "nom",
            description: "description",
            desc: "description",
            prix: "prix",
            price: "prix",
            cost: "prix",
            duree: "duree",
            duration: "duree",
            minutes: "duree",
            couleur: "couleur",
            color: "couleur",
            colour: "couleur",
          }
          return headerMap[header.toLowerCase()] || header
        },
      })
      parsedData = result.data
    } else if (fileExtension === "xlsx" || fileExtension === "xls") {
      const buffer = await file.arrayBuffer()
      const workbook = XLSX.read(buffer, { type: "array" })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json<any>(worksheet)

      parsedData = jsonData.map((row: any) => {
        const normalizedRow: any = {}
        Object.keys(row).forEach((key) => {
          const normalizedKey = key.toLowerCase()
          if (normalizedKey.includes("nom") || normalizedKey.includes("name") || normalizedKey.includes("service")) {
            normalizedRow.nom = row[key]
          } else if (normalizedKey.includes("description") || normalizedKey.includes("desc")) {
            normalizedRow.description = row[key]
          } else if (
            normalizedKey.includes("prix") ||
            normalizedKey.includes("price") ||
            normalizedKey.includes("cost")
          ) {
            normalizedRow.prix = row[key]
          } else if (
            normalizedKey.includes("duree") ||
            normalizedKey.includes("duration") ||
            normalizedKey.includes("minutes")
          ) {
            normalizedRow.duree = row[key]
          } else if (normalizedKey.includes("couleur") || normalizedKey.includes("color")) {
            normalizedRow.couleur = row[key]
          }
        })
        return normalizedRow
      })
    } else {
      return NextResponse.json({ error: "Format de fichier non supporté. Utilisez CSV, XLS ou XLSX." }, { status: 400 })
    }

    // Validation et nettoyage des données
    const validServices: ServiceInsert[] = []
    const errors: string[] = []
    const warnings: string[] = []

    for (let i = 0; i < parsedData.length; i++) {
      const row = parsedData[i]
      const lineNumber = i + 2

      // Validation des champs requis
      if (!row.nom) {
        errors.push(`Ligne ${lineNumber}: Nom du service requis`)
        continue
      }

      if (!row.prix || isNaN(Number.parseFloat(row.prix.toString()))) {
        errors.push(`Ligne ${lineNumber}: Prix valide requis`)
        continue
      }

      if (!row.duree || isNaN(Number.parseInt(row.duree.toString()))) {
        errors.push(`Ligne ${lineNumber}: Durée valide requise (en minutes)`)
        continue
      }

      // Validation de la couleur
      let couleur = "#3B82F6" // Couleur par défaut
      if (row.couleur) {
        const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
        if (colorRegex.test(row.couleur)) {
          couleur = row.couleur
        } else {
          warnings.push(
            `Ligne ${lineNumber}: Format de couleur invalide (${row.couleur}), couleur par défaut appliquée`,
          )
        }
      }

      validServices.push({
        nom: row.nom.toString().trim(),
        description: row.description?.toString().trim() || null,
        prix: Number.parseFloat(row.prix.toString()),
        duree: Number.parseInt(row.duree.toString()),
        couleur,
      })
    }

    if (validServices.length === 0) {
      return NextResponse.json({ error: "Aucun service valide trouvé dans le fichier" }, { status: 400 })
    }

    // Import en batch avec gestion des doublons
    try {
      const importedServices = await DatabaseService.batchInsertServices(validServices)

      return NextResponse.json({
        success: true,
        imported: importedServices.length,
        total: parsedData.length,
        errors,
        warnings,
        message: `${importedServices.length} services importés avec succès`,
      })
    } catch (dbError: any) {
      if (dbError.code === "23505") {
        return NextResponse.json({ error: "Doublons détectés - certains services existent déjà" }, { status: 409 })
      }
      throw dbError
    }
  } catch (error) {
    console.error("Erreur lors de l'import des services:", error)

    return NextResponse.json(
      {
        error: "Erreur interne du serveur",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}
