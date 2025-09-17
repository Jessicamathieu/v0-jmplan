"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { getClients, createTask } from "@/lib/api-client"
import type { Client } from "@/types/client"

interface AddTaskDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function AddTaskDialog({ isOpen, onClose }: AddTaskDialogProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: new Date().toISOString().split("T")[0],
    location: "",
    clientId: "",
    details: "",
    completed: false,
  })

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        const clientsData = await getClients()
        setClients(clientsData)
      }

      fetchData()
    }
  }, [isOpen])

  const handleChange = (field: string, value: string | boolean) => {
    setFormData({
      ...formData,
      [field]: value,
    })
  }

  const handleClientChange = (clientId: string) => {
    handleChange("clientId", clientId)

    // Auto-remplir l'adresse si un client est sélectionné
    if (clientId) {
      const selectedClient = clients.find((c) => c.id.toString() === clientId)
      if (selectedClient) {
        handleChange("location", selectedClient.address)
      }
    }
  }

  const handleSubmit = async () => {
    try {
      if (!formData.title) {
        alert("Veuillez saisir un titre pour la tâche")
        return
      }

      await createTask({
        title: formData.title,
        description: formData.description,
        dueDate: formData.dueDate || null,
        location: formData.location || null,
        clientId: formData.clientId ? Number.parseInt(formData.clientId) : undefined,
        details: formData.details || undefined,
        completed: formData.completed,
      })

      onClose()
      // Refresh the tasks list
      window.location.reload()
    } catch (error) {
      console.error("Erreur lors de la création de la tâche", error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nouvelle tâche</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right" htmlFor="title">
              Titre *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className="col-span-3"
              required
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right" htmlFor="description">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right" htmlFor="dueDate">
              Date d'échéance
            </Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleChange("dueDate", e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right" htmlFor="client">
              Client
            </Label>
            <Select value={formData.clientId} onValueChange={handleClientChange}>
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
            <Label className="text-right" htmlFor="location">
              Emplacement
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleChange("location", e.target.value)}
              className="col-span-3"
              placeholder="Adresse ou lieu"
            />
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

          <div className="grid grid-cols-4 items-center gap-4">
            <div className="text-right">Statut</div>
            <div className="col-span-3 flex items-center space-x-2">
              <Checkbox
                id="completed"
                checked={formData.completed}
                onCheckedChange={(checked) => handleChange("completed", Boolean(checked))}
              />
              <label
                htmlFor="completed"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Marquer comme terminée
              </label>
            </div>
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
