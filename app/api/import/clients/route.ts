export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"
import type { ClientInsert } from "@/lib/database"
import Papa from "papaparse"
import * as XLSX from "xlsx"

interface ImportedClient {
  nom: string
  prenom: string
  email?: string
  telephone?: string
  adresse?: string
  date_naissance?: string
  notes?: string
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 })
    }

    const fileExtension = file.name.split(".").pop()?.toLowerCase()
    let parsedData: ImportedClient[] = []

    // Parser selon le type de fichier
    if (fileExtension === "csv") {
      const text = await file.text()
      const result = Papa.parse<ImportedClient>(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => {
          // Normaliser les en-têtes
          const headerMap: Record<string, string> = {
            nom: "nom",
            name: "nom",
            last_name: "nom",
            lastname: "nom",
            prenom: "prenom",
            firstname: "prenom",
            first_name: "prenom",
            email: "email",
            "e-mail": "email",
            courriel: "email",
            telephone: "telephone",
            phone: "telephone",
            tel: "telephone",
            adresse: "adresse",
            address: "adresse",
            date_naissance: "date_naissance",
            birthday: "date_naissance",
            birth_date: "date_naissance",
            notes: "notes",
            note: "notes",
            comments: "notes",
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

      // Normaliser les données Excel
      parsedData = jsonData.map((row: any) => {
        const normalizedRow: any = {}
        Object.keys(row).forEach((key) => {
          const normalizedKey = key.toLowerCase()
          if (normalizedKey.includes("nom") && !normalizedKey.includes("prenom")) {
            normalizedRow.nom = row[key]
          } else if (normalizedKey.includes("prenom") || normalizedKey.includes("first")) {
            normalizedRow.prenom = row[key]
          } else if (normalizedKey.includes("email") || normalizedKey.includes("courriel")) {
            normalizedRow.email = row[key]
          } else if (
            normalizedKey.includes("telephone") ||
            normalizedKey.includes("phone") ||
            normalizedKey.includes("tel")
          ) {
            normalizedRow.telephone = row[key]
          } else if (normalizedKey.includes("adresse") || normalizedKey.includes("address")) {
            normalizedRow.adresse = row[key]
          } else if (normalizedKey.includes("naissance") || normalizedKey.includes("birth")) {
            normalizedRow.date_naissance = row[key]
          } else if (normalizedKey.includes("note") || normalizedKey.includes("comment")) {
            normalizedRow.notes = row[key]
          }
        })
        return normalizedRow
      })
    } else {
      return NextResponse.json({ error: "Format de fichier non supporté. Utilisez CSV, XLS ou XLSX." }, { status: 400 })
    }

    // Validation et nettoyage des données
    const validClients: ClientInsert[] = []
    const errors: string[] = []
    const warnings: string[] = []

    for (let i = 0; i < parsedData.length; i++) {
      const row = parsedData[i]
      const lineNumber = i + 2 // +2 car ligne 1 = en-têtes, index commence à 0

      // Validation des champs requis
      if (!row.nom || !row.prenom) {
        errors.push(`Ligne ${lineNumber}: Nom et prénom sont requis`)
        continue
      }

      // Validation de l'email
      if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
        warnings.push(`Ligne ${lineNumber}: Format d'email invalide (${row.email})`)
        row.email = undefined
      }

      // Validation du téléphone
      if (row.telephone) {
        const cleanPhone = row.telephone.toString().replace(/\D/g, "")
        if (cleanPhone.length < 10) {
          warnings.push(`Ligne ${lineNumber}: Numéro de téléphone trop court (${row.telephone})`)
          row.telephone = undefined
        } else {
          row.telephone = cleanPhone
        }
      }

      // Validation de la date de naissance
      if (row.date_naissance) {
        const date = new Date(row.date_naissance)
        if (isNaN(date.getTime())) {
          warnings.push(`Ligne ${lineNumber}: Date de naissance invalide (${row.date_naissance})`)
          row.date_naissance = undefined
        } else {
          row.date_naissance = date.toISOString().split("T")[0]
        }
      }

      validClients.push({
        nom: row.nom.toString().trim(),
        prenom: row.prenom.toString().trim(),
        email: row.email || null,
        telephone: row.telephone || null,
        adresse: row.adresse?.toString().trim() || null,
        date_naissance: row.date_naissance || null,
        notes: row.notes?.toString().trim() || null,
      })
    }

    if (validClients.length === 0) {
      return NextResponse.json({ error: "Aucun client valide trouvé dans le fichier" }, { status: 400 })
    }

    // Import en batch avec gestion des doublons
    try {
      const importedClients = await DatabaseService.batchInsertClients(validClients)

      return NextResponse.json({
        success: true,
        imported: importedClients.length,
        total: parsedData.length,
        errors,
        warnings,
        message: `${importedClients.length} clients importés avec succès`,
      })
    } catch (dbError: any) {
      // Gestion spécifique des erreurs de contrainte
      if (dbError.code === "23505") {
        // Violation de contrainte unique
        return NextResponse.json(
          { error: "Doublons détectés - certains clients existent déjà (email ou téléphone)" },
          { status: 409 },
        )
      }
      throw dbError
    }
  } catch (error) {
    console.error("Erreur lors de l'import des clients:", error)

    return NextResponse.json(
      {
        error: "Erreur interne du serveur",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}
