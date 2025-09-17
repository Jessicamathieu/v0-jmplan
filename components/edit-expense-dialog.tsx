"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getClients, getServices, updateExpense } from "@/lib/api-client"
import type { Client } from "@/types/client"
import type { Service } from "@/types/service"
import type { Expense } from "@/types/expense"

interface EditExpenseDialogProps {
  isOpen: boolean
  onClose: () => void
  expense: Expense
}

export function EditExpenseDialog({ isOpen, onClose, expense }: EditExpenseDialogProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [formData, setFormData] = useState({
    id: 0,
    description: "",
    amount: "",
    date: "",
    clientId: "",
    serviceId: "",
    details: "",
    receiptImage: "",
    isSyncedToQuickBooks: false,
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

      if (expense) {
        setFormData({
          id: expense.id,
          description: expense.description,
          amount: expense.amount.toString(),
          date: expense.date,
          clientId: expense.clientId?.toString() || "",
          serviceId: expense.serviceId?.toString() || "",
          details: expense.details || "",
          receiptImage: expense.receiptImage || "",
          isSyncedToQuickBooks: expense.isSyncedToQuickBooks,
        })
      }
    }
  }, [isOpen, expense])

  const handleChange = (field: string, value: string | boolean) => {
    setFormData({
      ...formData,
      [field]: value,
    })
  }

  const handleSubmit = async () => {
    try {
      if (!formData.description || !formData.amount) {
        alert("Veuillez remplir tous les champs obligatoires")
        return
      }

      await updateExpense({
        id: formData.id,
        description: formData.description,
        amount: Number.parseFloat(formData.amount),
        date: formData.date,
        clientId: formData.clientId ? Number.parseInt(formData.clientId) : undefined,
        serviceId: formData.serviceId ? Number.parseInt(formData.serviceId) : undefined,
        details: formData.details,
        receiptImage: formData.receiptImage || undefined,
        isSyncedToQuickBooks: formData.isSyncedToQuickBooks,
      })

      onClose()
      // Refresh the expenses list
      window.location.reload()
    } catch (error) {
      console.error("Erreur lors de la modification de la dépense", error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifier la dépense</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
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
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSubmit}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
