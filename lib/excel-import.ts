import * as XLSX from "xlsx"
import Papa from "papaparse"
import type { Client } from "@/types"
import { createClient, createAppointment, getServices, getClients } from "./api-client"

export interface ImportColumn {
  key: string
  label: string
  required: boolean
  type: "text" | "email" | "phone" | "date" | "time" | "number"
  example?: string
}

export interface ImportMapping {
  [key: string]: string // key = notre champ, value = colonne du fichier
}

export interface ImportResult {
  success: boolean
  imported: number
  errors: string[]
  warnings: string[]
}

// Colonnes disponibles pour les clients
export const CLIENT_COLUMNS: ImportColumn[] = [
  { key: "name", label: "Nom du client", required: true, type: "text", example: "Jean Dupont" },
  { key: "email", label: "Email", required: false, type: "email", example: "jean@example.com" },
  { key: "phone", label: "Téléphone", required: false, type: "phone", example: "514-123-4567" },
  { key: "street", label: "Adresse (rue)", required: false, type: "text", example: "123 rue Principale" },
  { key: "city", label: "Ville", required: false, type: "text", example: "Montréal" },
  { key: "province", label: "Province", required: false, type: "text", example: "QC" },
  { key: "postalCode", label: "Code postal", required: false, type: "text", example: "H2X 1Y2" },
  { key: "notes", label: "Notes", required: false, type: "text", example: "Client VIP" },
]

// Colonnes disponibles pour les rendez-vous
export const APPOINTMENT_COLUMNS: ImportColumn[] = [
  { key: "clientName", label: "Nom du client", required: true, type: "text", example: "Jean Dupont" },
  { key: "serviceName", label: "Service", required: true, type: "text", example: "Consultation Premium" },
  { key: "date", label: "Date", required: true, type: "date", example: "2024-01-15" },
  { key: "startTime", label: "Heure de début", required: true, type: "time", example: "09:00" },
  { key: "endTime", label: "Heure de fin", required: true, type: "time", example: "10:30" },
  { key: "notes", label: "Notes", required: false, type: "text", example: "Première consultation" },
  { key: "sendReminder", label: "Envoyer rappel", required: false, type: "text", example: "Oui/Non" },
  { key: "sendConfirmation", label: "Envoyer confirmation", required: false, type: "text", example: "Oui/Non" },
]

// Parser un fichier Excel
export async function parseExcelFile(file: File): Promise<any[][]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
        resolve(jsonData as any[][])
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => reject(new Error("Erreur lors de la lecture du fichier"))
    reader.readAsArrayBuffer(file)
  })
}

// Parser un fichier CSV
export async function parseCSVFile(file: File): Promise<any[][]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`Erreur CSV: ${results.errors[0].message}`))
        } else {
          resolve(results.data as any[][])
        }
      },
      error: (error) => reject(error),
      skipEmptyLines: true,
    })
  })
}

// Parser un fichier (Excel ou CSV)
export async function parseFile(file: File): Promise<any[][]> {
  const extension = file.name.toLowerCase().split(".").pop()

  if (extension === "xlsx" || extension === "xls") {
    return parseExcelFile(file)
  } else if (extension === "csv") {
    return parseCSVFile(file)
  } else {
    throw new Error("Format de fichier non supporté. Utilisez .xlsx, .xls ou .csv")
  }
}

// Détecter automatiquement les colonnes
export function detectColumns(data: any[][], availableColumns: ImportColumn[]): ImportMapping {
  if (data.length === 0) return {}

  const headers = data[0].map((header: any) => String(header).toLowerCase().trim())

  const mapping: ImportMapping = {}

  availableColumns.forEach((column) => {
    const possibleMatches = [column.key.toLowerCase(), column.label.toLowerCase(), ...getColumnAliases(column.key)]

    const matchIndex = headers.findIndex((header) =>
      possibleMatches.some((match) => header.includes(match) || match.includes(header)),
    )

    if (matchIndex !== -1) {
      mapping[column.key] = headers[matchIndex]
    }
  })

  return mapping
}

// Alias pour les colonnes communes
function getColumnAliases(key: string): string[] {
  const aliases: { [key: string]: string[] } = {
    name: ["nom", "client", "name", "prénom", "prenom"],
    email: ["email", "courriel", "mail", "e-mail"],
    phone: ["téléphone", "telephone", "phone", "tel", "cellulaire"],
    street: ["adresse", "rue", "street", "address"],
    city: ["ville", "city"],
    province: ["province", "état", "state", "region"],
    postalCode: ["code postal", "postal", "zip", "cp"],
    date: ["date", "jour"],
    startTime: ["début", "heure début", "start", "heure"],
    endTime: ["fin", "heure fin", "end"],
    serviceName: ["service", "prestation", "type"],
    clientName: ["client", "nom client", "customer"],
    notes: ["notes", "commentaires", "remarques"],
  }

  return aliases[key] || []
}

// Valider une ligne de données
function validateRow(row: any, mapping: ImportMapping, columns: ImportColumn[]): string[] {
  const errors: string[] = []

  columns.forEach((column) => {
    if (column.required && mapping[column.key]) {
      const value = row[mapping[column.key]]
      if (!value || String(value).trim() === "") {
        errors.push(`${column.label} est requis`)
      }
    }

    if (mapping[column.key] && row[mapping[column.key]]) {
      const value = String(row[mapping[column.key]]).trim()

      switch (column.type) {
        case "email":
          if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            errors.push(`${column.label} invalide: ${value}`)
          }
          break
        case "phone":
          if (value && !/^[\d\s\-$$$$+.]+$/.test(value)) {
            errors.push(`${column.label} invalide: ${value}`)
          }
          break
        case "date":
          if (value && isNaN(Date.parse(value))) {
            errors.push(`${column.label} invalide: ${value}`)
          }
          break
        case "time":
          if (value && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
            errors.push(`${column.label} invalide: ${value}`)
          }
          break
      }
    }
  })

  return errors
}

// Importer des clients
export async function importClients(data: any[][], mapping: ImportMapping, skipFirstRow = true): Promise<ImportResult> {
  const result: ImportResult = {
    success: true,
    imported: 0,
    errors: [],
    warnings: [],
  }

  const rows = skipFirstRow ? data.slice(1) : data

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rowNumber = i + (skipFirstRow ? 2 : 1)

    try {
      // Valider la ligne
      const validationErrors = validateRow(row, mapping, CLIENT_COLUMNS)
      if (validationErrors.length > 0) {
        result.errors.push(`Ligne ${rowNumber}: ${validationErrors.join(", ")}`)
        continue
      }

      // Créer l'objet client
      const client: Omit<Client, "id"> = {
        name: row[mapping.name] || "",
        email: row[mapping.email] || "",
        phone: row[mapping.phone] || "",
        street: row[mapping.street] || "",
        city: row[mapping.city] || "",
        province: row[mapping.province] || "",
        postalCode: row[mapping.postalCode] || "",
        address: "", // Sera généré automatiquement
        notes: row[mapping.notes] || "",
      }

      // Générer l'adresse complète
      const addressParts = [client.street, client.city, client.province, client.postalCode].filter(
        (part) => part && part.trim(),
      )
      client.address = addressParts.join(", ")

      // Créer le client
      await createClient(client)
      result.imported++
    } catch (error) {
      result.errors.push(`Ligne ${rowNumber}: ${error instanceof Error ? error.message : "Erreur inconnue"}`)
    }
  }

  result.success = result.errors.length === 0
  return result
}

// Importer des rendez-vous
export async function importAppointments(
  data: any[][],
  mapping: ImportMapping,
  skipFirstRow = true,
): Promise<ImportResult> {
  const result: ImportResult = {
    success: true,
    imported: 0,
    errors: [],
    warnings: [],
  }

  // Charger les clients et services existants
  const [clients, services] = await Promise.all([getClients(), getServices()])

  const rows = skipFirstRow ? data.slice(1) : data

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rowNumber = i + (skipFirstRow ? 2 : 1)

    try {
      // Valider la ligne
      const validationErrors = validateRow(row, mapping, APPOINTMENT_COLUMNS)
      if (validationErrors.length > 0) {
        result.errors.push(`Ligne ${rowNumber}: ${validationErrors.join(", ")}`)
        continue
      }

      // Trouver le client
      const clientName = row[mapping.clientName]
      const client = clients.find(
        (c) =>
          c.name.toLowerCase().includes(clientName.toLowerCase()) ||
          clientName.toLowerCase().includes(c.name.toLowerCase()),
      )

      if (!client) {
        result.errors.push(`Ligne ${rowNumber}: Client "${clientName}" non trouvé`)
        continue
      }

      // Trouver le service
      const serviceName = row[mapping.serviceName]
      const service = services.find(
        (s) =>
          s.name.toLowerCase().includes(serviceName.toLowerCase()) ||
          serviceName.toLowerCase().includes(s.name.toLowerCase()),
      )

      if (!service) {
        result.errors.push(`Ligne ${rowNumber}: Service "${serviceName}" non trouvé`)
        continue
      }

      // Créer les dates
      const date = row[mapping.date]
      const startTime = row[mapping.startTime]
      const endTime = row[mapping.endTime]

      const startDateTime = new Date(`${date}T${startTime}`)
      const endDateTime = new Date(`${date}T${endTime}`)

      if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
        result.errors.push(`Ligne ${rowNumber}: Date ou heure invalide`)
        continue
      }

      // Créer l'objet rendez-vous
      const appointment = {
        clientId: client.id,
        serviceId: service.id,
        startTime: startDateTime,
        endTime: endDateTime,
        notes: row[mapping.notes] || "",
        sendReminder: ["oui", "yes", "1", "true"].includes(String(row[mapping.sendReminder] || "").toLowerCase()),
        sendConfirmation: ["oui", "yes", "1", "true"].includes(
          String(row[mapping.sendConfirmation] || "").toLowerCase(),
        ),
      }

      // Créer le rendez-vous
      await createAppointment(appointment)
      result.imported++
    } catch (error) {
      result.errors.push(`Ligne ${rowNumber}: ${error instanceof Error ? error.message : "Erreur inconnue"}`)
    }
  }

  result.success = result.errors.length === 0
  return result
}

// Générer un template Excel pour les clients
export function generateClientTemplate(): Blob {
  const headers = CLIENT_COLUMNS.map((col) => col.label)
  const examples = CLIENT_COLUMNS.map((col) => col.example || "")

  const ws = XLSX.utils.aoa_to_sheet([headers, examples])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Clients")

  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" })
  return new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
}

// Générer un template Excel pour les rendez-vous
export function generateAppointmentTemplate(): Blob {
  const headers = APPOINTMENT_COLUMNS.map((col) => col.label)
  const examples = APPOINTMENT_COLUMNS.map((col) => col.example || "")

  const ws = XLSX.utils.aoa_to_sheet([headers, examples])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Rendez-vous")

  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" })
  return new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
}
