"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Camera, Upload, Loader2 } from "lucide-react"
import { getClients, getServices, createExpense, extractReceiptInfo } from "@/lib/api-client"
import type { Client } from "@/types/client"
import type { Service } from "@/types/service"

interface AddExpenseDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function AddExpenseDialog({ isOpen, onClose }: AddExpenseDialogProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [activeTab, setActiveTab] = useState("manual")
  const [isProcessing, setIsProcessing] = useState(false)
  const [receiptImage, setReceiptImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    clientId: "",
    serviceId: "",
    details: "",
  })

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        const clientsData = await getClients()
        const servicesData = await getServices()
        setClients(clientsData)
        setServices(servicesData)
      }

      fetchData()
    }
  }, [isOpen])

  const handleChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Afficher l'image sélectionnée
    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setReceiptImage(event.target.result as string)
      }
    }
    reader.readAsDataURL(file)

    // Simuler l'extraction OCR
    setIsProcessing(true)
    try {
      const extractedData = await extractReceiptInfo(file)

      // Mettre à jour le formulaire avec les données extraites
      setFormData({
        ...formData,
        description: extractedData.description || formData.description,
        amount: extractedData.amount?.toString() || formData.amount,
        date: extractedData.date || formData.date,
      })

      // Passer à l'onglet manuel pour vérification
      setActiveTab("manual")
    } catch (error) {
      console.error("Erreur lors de l'extraction des informations du reçu", error)
      alert("Impossible d'extraire les informations du reçu. Veuillez saisir les détails manuellement.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCameraCapture = () => {
    // Simuler la capture de caméra en ouvrant le sélecteur de fichier
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleSubmit = async () => {
    try {
      if (!formData.description || !formData.amount) {
        alert("Veuillez remplir tous les champs obligatoires")
        return
      }

      await createExpense({
        description: formData.description,
        amount: Number.parseFloat(formData.amount),
        date: formData.date,
        clientId: formData.clientId ? Number.parseInt(formData.clientId) : undefined,
        serviceId: formData.serviceId ? Number.parseInt(formData.serviceId) : undefined,
        details: formData.details,
        receiptImage: receiptImage || undefined,
        isSyncedToQuickBooks: false,
      })

      onClose()
      // Refresh the expenses list
      window.location.reload()
    } catch (error) {
      console.error("Erreur lors de la création de la dépense", error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nouvelle dépense</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scan">Scanner un reçu</TabsTrigger>
            <TabsTrigger value="manual">Saisie manuelle</TabsTrigger>
          </TabsList>

          <TabsContent value="scan" className="py-4">
            <div className="flex flex-col items-center justify-center gap-4">
              <div
                className={`border-2 border-dashed rounded-lg p-8 w-full flex flex-col items-center justify-center ${
                  receiptImage ? "border-primary" : "border-muted"
                }`}
              >
                {receiptImage ? (
                  <div className="relative w-full max-h-64 overflow-hidden">
                    <img src={receiptImage || "/placeholder.svg"} alt="Reçu" className="object-contain w-full h-full" />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setReceiptImage(null)}
                    >
                      Supprimer
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Glissez-déposez un fichier ou cliquez pour sélectionner
                    </p>
                  </div>
                )}
                <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileChange} className="hidden" />
              </div>

              <div className="flex gap-4 w-full">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Importer une image
                    </>
                  )}
                </Button>
                <Button variant="outline" className="flex-1" onClick={handleCameraCapture} disabled={isProcessing}>
                  <Camera className="mr-2 h-4 w-4" />
                  Prendre une photo
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="manual" className="py-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right" htmlFor="description">
                  Description *
                </Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right" htmlFor="amount">
                  Montant *
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => handleChange("amount", e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right" htmlFor="date">
                  Date de la dépense
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right" htmlFor="client">
                  Client
                </Label>
                <Select value={formData.clientId} onValueChange={(value) => handleChange("clientId", value)}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Sélectionner un client (optionnel)" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right" htmlFor="service">
                  Service
                </Label>
                <Select value={formData.serviceId} onValueChange={(value) => handleChange("serviceId", value)}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Sélectionner un service (optionnel)" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id.toString()}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right" htmlFor="details">
                  Détails
                </Label>
                <Textarea
                  id="details"
                  value={formData.details}
                  onChange={(e) => handleChange("details", e.target.value)}
                  className="col-span-3"
                  placeholder="Informations complémentaires..."
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isProcessing}>
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
