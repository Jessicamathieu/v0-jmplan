"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  Settings,
  Users,
  Calendar,
} from "lucide-react"
import {
  parseFile,
  detectColumns,
  importClients,
  importAppointments,
  generateClientTemplate,
  generateAppointmentTemplate,
  CLIENT_COLUMNS,
  APPOINTMENT_COLUMNS,
  type ImportMapping,
  type ImportResult,
} from "@/lib/excel-import"

interface ExcelImportDialogProps {
  isOpen: boolean
  onClose: () => void
  onImportComplete?: (result: ImportResult) => void
}

export function ExcelImportDialog({ isOpen, onClose, onImportComplete }: ExcelImportDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [data, setData] = useState<any[][]>([])
  const [importType, setImportType] = useState<"clients" | "appointments">("clients")
  const [mapping, setMapping] = useState<ImportMapping>({})
  const [skipFirstRow, setSkipFirstRow] = useState(true)
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [step, setStep] = useState<"upload" | "mapping" | "preview" | "result">("upload")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentColumns = importType === "clients" ? CLIENT_COLUMNS : APPOINTMENT_COLUMNS

  const handleFileSelect = async (selectedFile: File) => {
    setLoading(true)
    setFile(selectedFile)

    try {
      const parsedData = await parseFile(selectedFile)
      setData(parsedData)

      // Détecter automatiquement les colonnes
      const detectedMapping = detectColumns(parsedData, currentColumns)
      setMapping(detectedMapping)

      setStep("mapping")
    } catch (error) {
      console.error("Erreur lors du parsing:", error)
      alert(`Erreur lors de la lecture du fichier: ${error instanceof Error ? error.message : "Erreur inconnue"}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFileSelect(selectedFile)
    }
  }

  const handleMappingChange = (columnKey: string, fileColumn: string) => {
    setMapping((prev) => ({
      ...prev,
      [columnKey]: fileColumn,
    }))
  }

  const getFileColumns = () => {
    if (data.length === 0) return []
    return data[0].map((header: any, index: number) => ({
      value: String(header),
      label: `${String(header)} (Colonne ${index + 1})`,
    }))
  }

  const getPreviewData = () => {
    if (data.length === 0) return []
    const startIndex = skipFirstRow ? 1 : 0
    return data.slice(startIndex, startIndex + 5) // Afficher 5 lignes max
  }

  const handleImport = async () => {
    if (!file || data.length === 0) return

    setImporting(true)
    setProgress(0)

    try {
      let importResult: ImportResult

      if (importType === "clients") {
        importResult = await importClients(data, mapping, skipFirstRow)
      } else {
        importResult = await importAppointments(data, mapping, skipFirstRow)
      }

      setResult(importResult)
      setStep("result")

      if (onImportComplete) {
        onImportComplete(importResult)
      }

      // Simuler le progress
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i)
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    } catch (error) {
      console.error("Erreur lors de l'import:", error)
      setResult({
        success: false,
        imported: 0,
        errors: [error instanceof Error ? error.message : "Erreur inconnue"],
        warnings: [],
      })
      setStep("result")
    } finally {
      setImporting(false)
    }
  }

  const downloadTemplate = (type: "clients" | "appointments") => {
    const blob = type === "clients" ? generateClientTemplate() : generateAppointmentTemplate()

    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `template-${type}.xlsx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const resetDialog = () => {
    setFile(null)
    setData([])
    setMapping({})
    setResult(null)
    setStep("upload")
    setProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleClose = () => {
    resetDialog()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6 text-pink-500" />✨ Importation Excel Premium
          </DialogTitle>
        </DialogHeader>

        <Tabs value={importType} onValueChange={(value) => setImportType(value as "clients" | "appointments")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="clients" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Clients
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Rendez-vous
            </TabsTrigger>
          </TabsList>

          <TabsContent value={importType} className="space-y-6">
            {step === "upload" && (
              <div className="space-y-6">
                {/* Zone de téléchargement */}
                <div
                  className="border-2 border-dashed border-pink-300 rounded-lg p-8 text-center hover:border-pink-400 transition-colors cursor-pointer bg-gradient-to-br from-pink-50 to-purple-50"
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-12 w-12 text-pink-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-pink-700 mb-2">
                    Glissez votre fichier ici ou cliquez pour sélectionner
                  </h3>
                  <p className="text-pink-600 mb-4">Formats supportés: .xlsx, .xls, .csv</p>
                  <Button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                    <Upload className="h-4 w-4 mr-2" />
                    Choisir un fichier
                  </Button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                {/* Templates */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Télécharger un template
                  </h4>
                  <p className="text-blue-600 mb-4 text-sm">
                    Utilisez nos templates pour formater correctement vos données
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadTemplate("clients")}
                      className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Template Clients
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadTemplate("appointments")}
                      className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Template Rendez-vous
                    </Button>
                  </div>
                </div>

                {loading && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
                    <span className="ml-2 text-pink-600">Analyse du fichier...</span>
                  </div>
                )}
              </div>
            )}

            {step === "mapping" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-pink-700 flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Configuration des colonnes
                  </h3>
                  <Badge variant="outline" className="border-pink-300 text-pink-700">
                    {file?.name}
                  </Badge>
                </div>

                <div className="flex items-center space-x-2 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <Checkbox
                    id="skipFirstRow"
                    checked={skipFirstRow}
                    onCheckedChange={(checked) => setSkipFirstRow(Boolean(checked))}
                  />
                  <Label htmlFor="skipFirstRow" className="text-yellow-700">
                    Ignorer la première ligne (en-têtes)
                  </Label>
                </div>

                <div className="grid gap-4">
                  {currentColumns.map((column) => (
                    <div
                      key={column.key}
                      className="grid grid-cols-3 items-center gap-4 p-4 bg-white rounded-lg border border-gray-200"
                    >
                      <div>
                        <Label className="font-medium text-gray-700">
                          {column.label}
                          {column.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <p className="text-xs text-gray-500 mt-1">{column.example}</p>
                      </div>
                      <Select
                        value={mapping[column.key] || "none"}
                        onValueChange={(value) => handleMappingChange(column.key, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une colonne" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Aucune</SelectItem>
                          {getFileColumns().map((col) => (
                            <SelectItem key={col.value} value={col.value}>
                              {col.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex items-center gap-2">
                        {mapping[column.key] && mapping[column.key] !== "none" && (
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            Mappé
                          </Badge>
                        )}
                        {column.required && !mapping[column.key] && <Badge variant="destructive">Requis</Badge>}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep("upload")} className="border-pink-300 text-pink-700">
                    Retour
                  </Button>
                  <Button
                    onClick={() => setStep("preview")}
                    disabled={
                      !currentColumns
                        .filter((col) => col.required)
                        .every((col) => mapping[col.key] && mapping[col.key] !== "none")
                    }
                    className="bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Aperçu
                  </Button>
                </div>
              </div>
            )}

            {step === "preview" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-pink-700 flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Aperçu des données
                  </h3>
                  <Badge variant="outline" className="border-green-300 text-green-700">
                    {data.length - (skipFirstRow ? 1 : 0)} lignes à importer
                  </Badge>
                </div>

                <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
                  <table className="w-full text-sm">
                    <thead className="bg-gradient-to-r from-pink-50 to-purple-50">
                      <tr>
                        {currentColumns
                          .filter((col) => mapping[col.key])
                          .map((column) => (
                            <th key={column.key} className="p-3 text-left font-medium text-pink-700 border-b">
                              {column.label}
                            </th>
                          ))}
                      </tr>
                    </thead>
                    <tbody>
                      {getPreviewData().map((row, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          {currentColumns
                            .filter((col) => mapping[col.key])
                            .map((column) => (
                              <td key={column.key} className="p-3 text-gray-700">
                                {row[mapping[column.key]] || "-"}
                              </td>
                            ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setStep("mapping")}
                    className="border-pink-300 text-pink-700"
                  >
                    Retour
                  </Button>
                  <Button
                    onClick={handleImport}
                    disabled={importing}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                  >
                    {importing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Importation...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Lancer l'importation
                      </>
                    )}
                  </Button>
                </div>

                {importing && (
                  <div className="space-y-2">
                    <Progress value={progress} className="w-full" />
                    <p className="text-center text-sm text-gray-600">Importation en cours... {progress}%</p>
                  </div>
                )}
              </div>
            )}

            {step === "result" && result && (
              <div className="space-y-6">
                <div className="text-center">
                  {result.success ? (
                    <div className="space-y-4">
                      <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                      <h3 className="text-2xl font-bold text-green-700">✨ Importation réussie !</h3>
                      <p className="text-green-600">
                        {result.imported} {importType === "clients" ? "clients" : "rendez-vous"} importé(s) avec succès
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
                      <h3 className="text-2xl font-bold text-red-700">Importation avec erreurs</h3>
                      <p className="text-red-600">
                        {result.imported} importé(s), {result.errors.length} erreur(s)
                      </p>
                    </div>
                  )}
                </div>

                {result.errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <strong>Erreurs rencontrées :</strong>
                        {result.errors.slice(0, 5).map((error, index) => (
                          <div key={index} className="text-sm">
                            • {error}
                          </div>
                        ))}
                        {result.errors.length > 5 && (
                          <div className="text-sm">... et {result.errors.length - 5} autres erreurs</div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {result.warnings.length > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <strong>Avertissements :</strong>
                        {result.warnings.map((warning, index) => (
                          <div key={index} className="text-sm">
                            • {warning}
                          </div>
                        ))}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={resetDialog}
                    variant="outline"
                    className="border-pink-300 text-pink-700 bg-transparent"
                  >
                    Nouvelle importation
                  </Button>
                  <Button onClick={handleClose} className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                    Fermer
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
