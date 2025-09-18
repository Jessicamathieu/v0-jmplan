import * as XLSX from "xlsx"
import { createClient, createAppointment, createService, getServices, getClients } from "./api-client"

export interface ImportColumn {
  key: string
  label: string
  required: boolean
  type: "text" | "email" | "phone" | "date" | "time" | "number"
  example?: string
  validation?: (value: string) => boolean
  transform?: (value: string) => any
}

export interface ImportMapping {
  [key: string]: string // key = notre champ, value = colonne du fichier
}

export interface ImportResult {
  success: boolean
  imported: number
  errors: string[]
  warnings: string[]
  skipped?: number
  duplicates?: number
}

export interface ImportProgress {
  current: number
  total: number
  percentage: number
  phase: "parsing" | "validating" | "importing" | "complete"
  message: string
}

// Colonnes disponibles pour les clients
export const CLIENT_COLUMNS: ImportColumn[] = [
  {
    key: "firstName",
    label: "Prénom",
    required: true,
    example: "Jean-Marc",
    validation: (value: string) => value && value.length >= 2,
    transform: (value: string) => value?.trim().replace(/\s+/g, " "),
  },
  {
    key: "lastName",
    label: "Nom de famille",
    required: true,
    example: "Tremblay",
    validation: (value: string) => value && value.length >= 2,
    transform: (value: string) => value?.trim().replace(/\s+/g, " "),
  },
  {
    key: "email",
    label: "Adresse email",
    required: true,
    example: "jean.marc@example.com",
    validation: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    transform: (value: string) => value?.toLowerCase().trim(),
  },
  {
    key: "phone",
    label: "Téléphone",
    required: false,
    example: "514-555-0123",
    validation: validateQuebecPhone,
    transform: formatQuebecPhone,
  },
  {
    key: "address",
    label: "Adresse",
    required: false,
    example: "123 rue Principale",
    validation: (value: string) => !value || value.length >= 5,
    transform: (value: string) => value?.trim(),
  },
  {
    key: "city",
    label: "Ville",
    required: false,
    example: "Montréal",
    validation: (value: string) => !value || value.length >= 2,
    transform: (value: string) => value?.trim(),
  },
  {
    key: "postalCode",
    label: "Code postal",
    required: false,
    example: "H2X 1Y2",
    validation: validateCanadianPostalCode,
    transform: formatCanadianPostalCode,
  },
  {
    key: "province",
    label: "Province",
    required: false,
    example: "QC",
    validation: (value: string) =>
      !value ||
      ["QC", "ON", "BC", "AB", "MB", "SK", "NS", "NB", "PE", "NL", "YT", "NT", "NU"].includes(value.toUpperCase()),
    transform: (value: string) => value?.toUpperCase().trim(),
  },
  {
    key: "dateOfBirth",
    label: "Date de naissance",
    required: false,
    example: "1985-03-15",
    validation: (value: string) => !value || !isNaN(Date.parse(value)),
    transform: (value: string) => (value ? new Date(value).toISOString().split("T")[0] : ""),
  },
  {
    key: "loyaltyPoints",
    label: "Points de fidélité",
    required: false,
    example: "150",
    validation: (value: string) => !value || (!isNaN(Number(value)) && Number(value) >= 0),
    transform: (value: string) => (value ? String(Math.max(0, Number.parseInt(value) || 0)) : "0"),
  },
]

// Colonnes disponibles pour les services
export const SERVICE_COLUMNS: ImportColumn[] = [
  {
    key: "name",
    label: "Nom du service",
    required: true,
    example: "Consultation Premium",
    validation: (value: string) => value && value.length >= 3,
    transform: (value: string) => value?.trim(),
  },
  {
    key: "description",
    label: "Description",
    required: false,
    example: "Consultation approfondie avec suivi",
    validation: (value: string) => !value || value.length <= 500,
    transform: (value: string) => value?.trim(),
  },
  {
    key: "duration",
    label: "Durée (minutes)",
    required: true,
    example: "60",
    validation: (value: string) => !isNaN(Number(value)) && Number(value) > 0 && Number(value) <= 480,
    transform: (value: string) => String(Math.max(15, Math.min(480, Number.parseInt(value) || 60))),
  },
  {
    key: "price",
    label: "Prix (CAD)",
    required: true,
    example: "125.00",
    validation: (value: string) => !isNaN(Number(value)) && Number(value) >= 0,
    transform: (value: string) => String(Math.max(0, Number.parseFloat(value) || 0)),
  },
  {
    key: "category",
    label: "Catégorie",
    required: false,
    example: "Consultation",
    validation: (value: string) => !value || value.length >= 2,
    transform: (value: string) => value?.trim(),
  },
  {
    key: "color",
    label: "Couleur (hex)",
    required: false,
    example: "#E91E63",
    validation: (value: string) => !value || /^#[0-9A-F]{6}$/i.test(value),
    transform: (value: string) => value?.toUpperCase().trim() || "#E91E63",
  },
]

// Colonnes disponibles pour les rendez-vous
export const APPOINTMENT_COLUMNS: ImportColumn[] = [
  {
    key: "clientEmail",
    label: "Email du client",
    required: true,
    example: "client@example.com",
    validation: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    transform: (value: string) => value?.toLowerCase().trim(),
  },
  {
    key: "serviceName",
    label: "Nom du service",
    required: true,
    example: "Consultation",
    validation: (value: string) => value && value.length >= 2,
    transform: (value: string) => value?.trim(),
  },
  {
    key: "date",
    label: "Date",
    required: true,
    example: "2024-12-25",
    validation: (value: string) => !isNaN(Date.parse(value)),
    transform: (value: string) => new Date(value).toISOString().split("T")[0],
  },
  {
    key: "time",
    label: "Heure",
    required: true,
    example: "14:30",
    validation: (value: string) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value),
    transform: (value: string) => value?.trim(),
  },
  {
    key: "status",
    label: "Statut",
    required: false,
    example: "confirmed",
    validation: (value: string) =>
      !value || ["pending", "confirmed", "cancelled", "completed"].includes(value.toLowerCase()),
    transform: (value: string) => value?.toLowerCase().trim() || "pending",
  },
  {
    key: "notes",
    label: "Notes",
    required: false,
    example: "Première consultation",
    validation: (value: string) => !value || value.length <= 1000,
    transform: (value: string) => value?.trim(),
  },
]

// Parser un fichier Excel/CSV avec gestion d'erreurs avancée
export async function parseFile(file: File, onProgress?: (progress: ImportProgress) => void): Promise<any[][]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        onProgress?.({
          current: 0,
          total: 100,
          percentage: 10,
          phase: "parsing",
          message: "Lecture du fichier...",
        })

        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })

        onProgress?.({
          current: 0,
          total: 100,
          percentage: 50,
          phase: "parsing",
          message: "Analyse de la structure...",
        })

        // Prendre la première feuille
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]

        // Convertir en tableau avec gestion des cellules vides
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: "",
          blankrows: false,
        })

        onProgress?.({
          current: jsonData.length,
          total: jsonData.length,
          percentage: 100,
          phase: "parsing",
          message: `${jsonData.length} lignes analysées`,
        })

        resolve(jsonData as any[][])
      } catch (error) {
        reject(
          new Error(
            `Erreur lors de l'analyse du fichier: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
          ),
        )
      }
    }

    reader.onerror = () => {
      reject(new Error("Erreur lors de la lecture du fichier"))
    }

    reader.readAsArrayBuffer(file)
  })
}

// Détecte automatiquement les colonnes basées sur les en-têtes
// Utilise la similarité de chaînes et des mots-clés
export function detectColumns(data: any[][], columns: any[]): ImportMapping {
  if (data.length === 0) return {}

  const headers = data[0].map((h: any) => String(h).toLowerCase().trim())
  const mapping: ImportMapping = {}

  columns.forEach((column) => {
    const keywords = getColumnKeywords(column.key)
    let bestMatch = ""
    let bestScore = 0

    headers.forEach((header, index) => {
      const score = calculateSimilarity(header, keywords)
      if (score > bestScore && score > 0.3) {
        // Seuil de similarité
        bestScore = score
        bestMatch = data[0][index]
      }
    })

    if (bestMatch) {
      mapping[column.key] = bestMatch
    }
  })

  return mapping
}

// Obtient les mots-clés pour la détection automatique des colonnes
function getColumnKeywords(columnKey: string): string[] {
  const keywordMap: { [key: string]: string[] } = {
    firstName: ["prénom", "prenom", "first", "firstname", "nom_prenom", "given_name"],
    lastName: ["nom", "last", "lastname", "family", "surname", "nom_famille"],
    email: ["email", "e-mail", "courriel", "mail", "adresse_email"],
    phone: ["téléphone", "telephone", "phone", "tel", "mobile", "cellulaire"],
    address: ["adresse", "address", "rue", "street", "addr"],
    city: ["ville", "city", "municipalité", "municipality"],
    postalCode: ["code_postal", "postal", "zip", "cp", "postal_code"],
    province: ["province", "state", "région", "region", "prov"],
    name: ["nom", "name", "titre", "title", "libellé", "libelle"],
    description: ["description", "desc", "détails", "details", "notes"],
    duration: ["durée", "duree", "duration", "temps", "time", "minutes"],
    price: ["prix", "price", "coût", "cout", "tarif", "montant", "amount"],
    category: ["catégorie", "categorie", "category", "type", "groupe", "group"],
    date: ["date", "jour", "day", "when", "quand"],
    time: ["heure", "time", "hour", "horaire", "temps"],
    status: ["statut", "status", "état", "etat", "state"],
  }

  return keywordMap[columnKey] || [columnKey]
}

// Calcule la similarité entre un en-tête et des mots-clés
function calculateSimilarity(header: string, keywords: string[]): number {
  let maxScore = 0

  keywords.forEach((keyword) => {
    // Correspondance exacte
    if (header === keyword) {
      maxScore = Math.max(maxScore, 1.0)
      return
    }

    // Contient le mot-clé
    if (header.includes(keyword)) {
      maxScore = Math.max(maxScore, 0.8)
      return
    }

    // Similarité de Levenshtein simplifiée
    const distance = levenshteinDistance(header, keyword)
    const similarity = 1 - distance / Math.max(header.length, keyword.length)
    maxScore = Math.max(maxScore, similarity)
  })

  return maxScore
}

// Calcule la distance de Levenshtein entre deux chaînes
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(null))

  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
      matrix[j][i] = Math.min(matrix[j][i - 1] + 1, matrix[j - 1][i] + 1, matrix[j - 1][i - 1] + indicator)
    }
  }

  return matrix[str2.length][str1.length]
}

// Valide un numéro de téléphone québécois
// Formats acceptés: 514-555-0123, (514) 555-0123, 514.555.0123, 5145550123
function validateQuebecPhone(phone: string): boolean {
  if (!phone) return true // Optionnel

  // Regex corrigée pour les numéros québécois
  const phonePattern = /^(\+1[-.\s]?)?$$?([0-9]{3})$$?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/
  return phonePattern.test(phone.trim())
}

// Formate un numéro de téléphone québécois au format standard
function formatQuebecPhone(phone: string): string {
  if (!phone) return ""

  // Extraire seulement les chiffres
  const digits = phone.replace(/\D/g, "")

  // Si commence par 1, l'enlever (code pays)
  const cleanDigits = digits.startsWith("1") && digits.length === 11 ? digits.slice(1) : digits

  if (cleanDigits.length === 10) {
    return `${cleanDigits.slice(0, 3)}-${cleanDigits.slice(3, 6)}-${cleanDigits.slice(6)}`
  }

  return phone // Retourner tel quel si format invalide
}

// Valide un code postal canadien
// Format: A1A 1A1 ou A1A1A1
function validateCanadianPostalCode(postalCode: string): boolean {
  if (!postalCode) return true // Optionnel

  const pattern = /^[A-Za-z]\d[A-Za-z][\s-]?\d[A-Za-z]\d$/
  return pattern.test(postalCode.trim())
}

// Formate un code postal canadien au format standard A1A 1A1
function formatCanadianPostalCode(postalCode: string): string {
  if (!postalCode) return ""

  const clean = postalCode.replace(/\s|-/g, "").toUpperCase()
  if (clean.length === 6) {
    return `${clean.slice(0, 3)} ${clean.slice(3)}`
  }

  return postalCode.toUpperCase()
}

// Valide les données par lots avec optimisation des performances
export async function validateDataBatch(
  data: any[][],
  mapping: ImportMapping,
  columns: any[],
  importType: string,
  skipFirstRow: boolean,
  onProgress?: (progress: ImportProgress) => void,
): Promise<ImportResult> {
  const startIndex = skipFirstRow ? 1 : 0
  const rows = data.slice(startIndex)
  const errors: string[] = []
  const warnings: string[] = []
  let validCount = 0
  let skippedCount = 0

  const batchSize = 100 // Traiter par lots de 100
  const totalBatches = Math.ceil(rows.length / batchSize)

  for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
    const batchStart = batchIndex * batchSize
    const batchEnd = Math.min(batchStart + batchSize, rows.length)
    const batch = rows.slice(batchStart, batchEnd)

    onProgress?.({
      current: batchEnd,
      total: rows.length,
      percentage: (batchEnd / rows.length) * 100,
      phase: "validating",
      message: `Validation lot ${batchIndex + 1}/${totalBatches}...`,
    })

    for (let i = 0; i < batch.length; i++) {
      const rowIndex = batchStart + i + startIndex + 1 // +1 pour numérotation Excel
      const row = batch[i]
      let hasErrors = false

      // Vérifier les champs requis
      for (const column of columns.filter((col) => col.required)) {
        const cellValue = row[mapping[column.key]] || ""

        if (!cellValue || !column.validation(String(cellValue))) {
          errors.push(`Ligne ${rowIndex}: ${column.label} requis ou invalide`)
          hasErrors = true
        }
      }

      // Vérifier les champs optionnels
      for (const column of columns.filter((col) => !col.required)) {
        const cellValue = row[mapping[column.key]] || ""

        if (cellValue && !column.validation(String(cellValue))) {
          warnings.push(`Ligne ${rowIndex}: ${column.label} invalide (sera ignoré)`)
        }
      }

      if (!hasErrors) {
        validCount++
      } else {
        skippedCount++
      }
    }

    // Pause pour éviter de bloquer l'UI
    await new Promise((resolve) => setTimeout(resolve, 1))
  }

  return {
    success: errors.length === 0,
    imported: validCount,
    errors,
    warnings,
    skipped: skippedCount,
    duplicates: 0, // TODO: Implémenter la détection de doublons
  }
}

// Importe les données par lots avec gestion d'erreurs
export async function importDataBatch(
  validatedData: any[],
  importType: string,
  onProgress?: (progress: ImportProgress) => void,
): Promise<ImportResult> {
  const batchSize = 50
  const totalBatches = Math.ceil(validatedData.length / batchSize)
  let importedCount = 0
  const errors: string[] = []

  for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
    const batchStart = batchIndex * batchSize
    const batchEnd = Math.min(batchStart + batchSize, validatedData.length)

    onProgress?.({
      current: batchEnd,
      total: validatedData.length,
      percentage: (batchEnd / validatedData.length) * 100,
      phase: "importing",
      message: `Import lot ${batchIndex + 1}/${totalBatches}...`,
    })

    try {
      // Simuler l'import (remplacer par vraie logique)
      await new Promise((resolve) => setTimeout(resolve, 200))
      importedCount += batchEnd - batchStart
    } catch (error) {
      errors.push(`Erreur lot ${batchIndex + 1}: ${error instanceof Error ? error.message : "Erreur inconnue"}`)
    }
  }

  return {
    success: errors.length === 0,
    imported: importedCount,
    errors,
    warnings: [],
  }
}

// Importer des clients
export async function importClients(data: any[][], mapping: ImportMapping, skipFirstRow = true): Promise<ImportResult> {
  const startIndex = skipFirstRow ? 1 : 0
  const rows = data.slice(startIndex)
  const errors: string[] = []
  const warnings: string[] = []
  let importedCount = 0

  for (let i = 0; i < rows.length; i++) {
    const rowIndex = i + startIndex + 1
    const row = rows[i]

    try {
      // Extraire et transformer les données
      const clientData: any = {}
      let hasRequiredFields = true

      CLIENT_COLUMNS.forEach((column) => {
        const cellValue = row[mapping[column.key]] || ""

        if (column.required && !cellValue) {
          errors.push(`Ligne ${rowIndex}: ${column.label} requis`)
          hasRequiredFields = false
          return
        }

        if (cellValue) {
          if (!column.validation(String(cellValue))) {
            if (column.required) {
              errors.push(`Ligne ${rowIndex}: ${column.label} invalide`)
              hasRequiredFields = false
            } else {
              warnings.push(`Ligne ${rowIndex}: ${column.label} invalide, ignoré`)
            }
            return
          }

          clientData[column.key] = column.transform(String(cellValue))
        }
      })

      if (hasRequiredFields) {
        // Ici, sauvegarder en base de données
        await createClient(clientData)
        importedCount++
      }
    } catch (error) {
      errors.push(`Ligne ${rowIndex}: ${error instanceof Error ? error.message : "Erreur inconnue"}`)
    }
  }

  return {
    success: errors.length === 0,
    imported: importedCount,
    errors,
    warnings,
  }
}

// Importer des services
export async function importServices(
  data: any[][],
  mapping: ImportMapping,
  skipFirstRow = true,
): Promise<ImportResult> {
  const startIndex = skipFirstRow ? 1 : 0
  const rows = data.slice(startIndex)
  const errors: string[] = []
  const warnings: string[] = []
  let importedCount = 0

  for (let i = 0; i < rows.length; i++) {
    const rowIndex = i + startIndex + 1
    const row = rows[i]

    try {
      // Extraire et transformer les données
      const serviceData: any = {}
      let hasRequiredFields = true

      SERVICE_COLUMNS.forEach((column) => {
        const cellValue = row[mapping[column.key]] || ""

        if (column.required && !cellValue) {
          errors.push(`Ligne ${rowIndex}: ${column.label} requis`)
          hasRequiredFields = false
          return
        }

        if (cellValue) {
          if (!column.validation(String(cellValue))) {
            if (column.required) {
              errors.push(`Ligne ${rowIndex}: ${column.label} invalide`)
              hasRequiredFields = false
            } else {
              warnings.push(`Ligne ${rowIndex}: ${column.label} invalide, ignoré`)
            }
            return
          }

          serviceData[column.key] = column.transform(String(cellValue))
        }
      })

      if (hasRequiredFields) {
        // Ici, sauvegarder en base de données
        await createService(serviceData)
        importedCount++
      }
    } catch (error) {
      errors.push(`Ligne ${rowIndex}: ${error instanceof Error ? error.message : "Erreur inconnue"}`)
    }
  }

  return {
    success: errors.length === 0,
    imported: importedCount,
    errors,
    warnings,
  }
}

// Importer des rendez-vous
export async function importAppointments(
  data: any[][],
  mapping: ImportMapping,
  skipFirstRow = true,
): Promise<ImportResult> {
  const startIndex = skipFirstRow ? 1 : 0
  const rows = data.slice(startIndex)
  const errors: string[] = []
  const warnings: string[] = []
  let importedCount = 0

  for (let i = 0; i < rows.length; i++) {
    const rowIndex = i + startIndex + 1
    const row = rows[i]

    try {
      const appointmentData: any = {}
      let hasRequiredFields = true

      APPOINTMENT_COLUMNS.forEach((column) => {
        const cellValue = row[mapping[column.key]] || ""

        if (column.required && !cellValue) {
          errors.push(`Ligne ${rowIndex}: ${column.label} requis`)
          hasRequiredFields = false
          return
        }

        if (cellValue) {
          if (!column.validation(String(cellValue))) {
            if (column.required) {
              errors.push(`Ligne ${rowIndex}: ${column.label} invalide`)
              hasRequiredFields = false
            } else {
              warnings.push(`Ligne ${rowIndex}: ${column.label} invalide, ignoré`)
            }
            return
          }

          appointmentData[column.key] = column.transform(String(cellValue))
        }
      })

      if (hasRequiredFields) {
        // Vérifier que le client et le service existent
        const clients = await getClients()
        const services = await getServices()

        const client = clients.find((c) => c.email.toLowerCase() === appointmentData.clientEmail)
        const service = services.find((s) => s.name.toLowerCase() === appointmentData.serviceName.toLowerCase())

        if (!client) {
          errors.push(`Ligne ${rowIndex}: Client non trouvé pour ${appointmentData.clientEmail}`)
          continue
        }

        if (!service) {
          warnings.push(`Ligne ${rowIndex}: Service non trouvé, sera créé: ${appointmentData.serviceName}`)
        }

        // Ici, sauvegarder en base de données
        await createAppointment({ ...appointmentData, clientId: client.id, serviceId: service?.id })
        importedCount++
      }
    } catch (error) {
      errors.push(`Ligne ${rowIndex}: ${error instanceof Error ? error.message : "Erreur inconnue"}`)
    }
  }

  return {
    success: errors.length === 0,
    imported: importedCount,
    errors,
    warnings,
  }
}

// Générer un template Excel pour les clients avec exemples québécois
export function generateClientTemplate(): Blob {
  const headers = CLIENT_COLUMNS.map((col) => col.label)
  const exampleRow = CLIENT_COLUMNS.map((col) => col.example)

  // Données d'exemple québécoises
  const sampleData = [
    [
      "Jean-Marc",
      "Tremblay",
      "jean.marc@example.com",
      "514-555-0123",
      "123 rue Sainte-Catherine",
      "Montréal",
      "H2X 1Y2",
      "QC",
      "1985-03-15",
      "150",
    ],
    [
      "Marie-Claire",
      "Bouchard",
      "marie.claire@example.com",
      "418-555-0456",
      "456 Grande Allée",
      "Québec",
      "G1R 2J5",
      "QC",
      "1990-07-22",
      "200",
    ],
    [
      "Pierre-Luc",
      "Gagnon",
      "pierre.luc@example.com",
      "450-555-0789",
      "789 boulevard René-Lévesque",
      "Laval",
      "H7S 1Z7",
      "QC",
      "1988-11-08",
      "75",
    ],
  ]

  const worksheet = XLSX.utils.aoa_to_sheet([headers, exampleRow, ...sampleData])

  // Ajuster la largeur des colonnes
  const colWidths = headers.map(() => ({ wch: 20 }))
  worksheet["!cols"] = colWidths

  // Ajouter des styles (si supporté)
  const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1")
  for (let col = range.s.c; col <= range.e.c; col++) {
    const headerCell = worksheet[XLSX.utils.encode_cell({ r: 0, c: col })]
    if (headerCell) {
      headerCell.s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "E91E63" } },
      }
    }
  }

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Clients")

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
  return new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
}

// Génère un template Excel pour les services avec prix en CAD
export function generateServiceTemplate(): Blob {
  const headers = SERVICE_COLUMNS.map((col) => col.label)
  const exampleRow = SERVICE_COLUMNS.map((col) => col.example)

  const sampleData = [
    [
      "Consultation Premium",
      "Consultation approfondie avec plan de traitement",
      "90",
      "125.00",
      "Consultation",
      "#E91E63",
    ],
    ["Suivi Standard", "Séance de suivi régulière", "60", "85.00", "Suivi", "#2196F3"],
    ["Urgence", "Consultation d'urgence", "45", "150.00", "Urgence", "#FF5722"],
  ]

  const worksheet = XLSX.utils.aoa_to_sheet([headers, exampleRow, ...sampleData])

  const colWidths = [
    { wch: 25 }, // Nom
    { wch: 40 }, // Description
    { wch: 15 }, // Durée
    { wch: 15 }, // Prix
    { wch: 20 }, // Catégorie
    { wch: 15 }, // Couleur
  ]
  worksheet["!cols"] = colWidths

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Services")

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
  return new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
}

// Génère un template Excel pour les rendez-vous
export function generateAppointmentTemplate(): Blob {
  const headers = APPOINTMENT_COLUMNS.map((col) => col.label)
  const exampleRow = APPOINTMENT_COLUMNS.map((col) => col.example)

  const sampleData = [
    ["jean.marc@example.com", "Consultation Premium", "2024-12-25", "09:00", "confirmed", "Première consultation"],
    ["marie.claire@example.com", "Suivi Standard", "2024-12-26", "14:30", "pending", "Suivi mensuel"],
    ["pierre.luc@example.com", "Consultation Premium", "2024-12-27", "10:15", "confirmed", "Consultation de contrôle"],
  ]

  const worksheet = XLSX.utils.aoa_to_sheet([headers, exampleRow, ...sampleData])

  const colWidths = [
    { wch: 30 }, // Email client
    { wch: 25 }, // Service
    { wch: 15 }, // Date
    { wch: 10 }, // Heure
    { wch: 15 }, // Statut
    { wch: 30 }, // Notes
  ]
  worksheet["!cols"] = colWidths

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Rendez-vous")

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
  return new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
}
