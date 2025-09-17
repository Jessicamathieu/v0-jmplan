"use client"

import type React from "react"

import { useState, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Upload, AlertCircle, CheckCircle2, X, FileSpreadsheet, Download } from "lucide-react"
import * as XLSX from "xlsx"
import { createClient } from "@/lib/api-client"
import type { Client } from "@/types"

interface ImportClientsDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ImportClientsDialog({ isOpen, onClose, onSuccess }: ImportClientsDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [clients, setClients] = useState<Partial<Client>[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importedCount, setImportedCount] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetState = () => {
    setFile(null)
    setClients([])
    setErrors([])
    setIsProcessing(false)
    setIsImporting(false)
    setImportedCount(0)
  }

  const handleClose = () => {
    resetState()
    onClose()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setIsProcessing(true)
    setErrors([])
    setClients([])

    try {
      const data = await readExcelFile(selectedFile)
      if (data.length === 0) {
        setErrors(["Le fichier ne contient aucune donnée"])
        setIsProcessing(false)
        return
      }

      // Valider et formater les données
      const { validClients, validationErrors } = validateClients(data)
      setClients(validClients)
      setErrors(validationErrors)
    } catch (error) {
      setErrors([`Erreur lors de la lecture du fichier: ${error instanceof Error ? error.message : String(error)}`])
    } finally {
      setIsProcessing(false)
    }
  }

  const readExcelFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const data = e.target?.result
          if (!data) {
            reject(new Error("Impossible de lire le fichier"))
            return
          }

          const workbook = XLSX.read(data, { type: "binary" })
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet)

          resolve(jsonData)
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = (error) => {
        reject(error)
      }

      reader.readAsBinaryString(file)
    })
  }

  const validateClients = (data: any[]): { validClients: Partial<Client>[]; validationErrors: string[] } => {
    const validClients: Partial<Client>[] = []
    const validationErrors: string[] = []

    data.forEach((row, index) => {
      const rowNumber = index + 2 // +2 car la première ligne est l'en-tête et les tableaux commencent à 0

      // Vérifier les champs obligatoires
      if (!row.name && !row.Nom && !row["Nom du client"]) {
        validationErrors.push(`Ligne ${rowNumber}: Le nom du client est obligatoire`)
        return
      }

      // Créer un objet client avec les champs mappés
      const client: Partial<Client> = {
        name: row.name || row.Nom || row["Nom du client"] || "",
        email: row.email || row.Email || row.Courriel || "",
        phone: row.phone || row.Phone || row.Téléphone || row["Numéro de téléphone"] || "",

        // Nouveaux champs d'adresse séparés
        street: row.street || row.Street || row.Adresse || row.Rue || "",
        city: row.city || row.City || row.Ville || "",
        province: row.province || row.Province || row.État || row.State || "",
        postalCode: row.postalCode || row["Postal Code"] || row["Code postal"] || row.ZIP || "",

        // Générer l'adresse complète pour la compatibilité
        address: `${row.street || row.Street || row.Adresse || row.Rue || ""}, ${row.city || row.City || row.Ville || ""}, ${row.province || row.Province || row.État || row.State || ""} ${row.postalCode || row["Postal Code"] || row["Code postal"] || row.ZIP || ""}`,

        notes: row.notes || row.Notes || row.Commentaires || "",
      }

      // Validation de l'email
      if (client.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.email)) {
        validationErrors.push(`Ligne ${rowNumber}: Format d'email invalide (${client.email})`)
      }

      validClients.push(client)
    })

    return { validClients, validationErrors }
  }

  const handleImport = async () => {
    if (clients.length === 0) return

    setIsImporting(true)
    setImportedCount(0)

    try {
      // Importer les clients un par un
      for (const client of clients) {
        await createClient(client as Omit<Client, "id">)
        setImportedCount((prev) => prev + 1)
      }

      // Attendre un peu avant de fermer pour montrer le succès
      setTimeout(() => {
        onSuccess()
        handleClose()
      }, 1500)
    } catch (error) {
      setErrors([`Erreur lors de l'importation: ${error instanceof Error ? error.message : String(error)}`])
      setIsImporting(false)
    }
  }

  const downloadTemplate = () => {
    // Créer un modèle Excel simple avec les nouveaux champs
    const template = [
      {
        Nom: "Jean Dupont",
        Email: "jean.dupont@example.com",
        Téléphone: "514-123-4567",
        Adresse: "123 rue Principale",
        Ville: "Montréal",
        Province: "QC",
        "Code postal": "H2X 1Y2",
        Notes: "Client fidèle depuis 2020",
      },
      {
        Nom: "Marie Tremblay",
        Email: "marie.tremblay@example.com",
        Téléphone: "438-987-6543",
        Adresse: "456 avenue des Pins",
        Ville: "Québec",
        Province: "QC",
        "Code postal": "G1R 2T3",
        Notes: "Préfère les rendez-vous en matinée",
      },
    ]

    // Convertir en workbook
    const worksheet = XLSX.utils.json_to_sheet(template)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clients")

    // Télécharger le fichier
    XLSX.writeFile(workbook, "modele_import_clients.xlsx")
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importer des clients</DialogTitle>
          <DialogDescription>Importez une liste de clients à partir d'un fichier Excel (.xlsx)</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!file ? (
            <div className="flex flex-col items-center justify-center gap-4 p-6 border-2 border-dashed rounded-lg">
              <FileSpreadsheet className="w-12 h-12 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Glissez-déposez un fichier Excel ou cliquez pour sélectionner
                </p>
                <p className="text-xs text-muted-foreground mt-1">Format accepté: .xlsx</p>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isProcessing}>
                  <Upload className="mr-2 h-4 w-4" />
                  Sélectionner un fichier
                </Button>
                <Button variant="secondary" onClick={downloadTemplate}>
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger un modèle
                </Button>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".xlsx" className="hidden" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">{file.name}</span>
                  <Badge variant="outline">{(file.size / 1024).toFixed(1)} KB</Badge>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setFile(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {isProcessing ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  {errors.length > 0 && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Erreurs de validation</AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc pl-5 mt-2 text-sm">
                          {errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  {clients.length > 0 && (
                    <div className="border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nom</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Téléphone</TableHead>
                            <TableHead>Adresse</TableHead>
                            <TableHead>Ville</TableHead>
                            <TableHead>Province</TableHead>
                            <TableHead>Code postal</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {clients.map((client, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{client.name}</TableCell>
                              <TableCell>{client.email}</TableCell>
                              <TableCell>{client.phone}</TableCell>
                              <TableCell className="truncate max-w-[150px]">{client.street}</TableCell>
                              <TableCell>{client.city}</TableCell>
                              <TableCell>{client.province}</TableCell>
                              <TableCell>{client.postalCode}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {isImporting && (
                    <Alert>
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary"></div>
                        <span>
                          Importation en cours... {importedCount}/{clients.length} clients
                        </span>
                      </div>
                    </Alert>
                  )}

                  {importedCount === clients.length && importedCount > 0 && (
                    <Alert className="bg-green-50 border-green-200">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertTitle className="text-green-600">Importation réussie</AlertTitle>
                      <AlertDescription className="text-green-600">
                        {importedCount} clients ont été importés avec succès.
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button onClick={handleImport} disabled={clients.length === 0 || isProcessing || isImporting}>
            Importer {clients.length} clients
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
