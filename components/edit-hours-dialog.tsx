"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { getClients, getServices, updateHoursEntry } from "@/lib/api-client"
import type { Client } from "@/types/client"
import type { Service } from "@/types/service"
import type { HoursEntry } from "@/types/hours"

interface EditHoursDialogProps {
  isOpen: boolean
  onClose: () => void
  entry: HoursEntry
}

export function EditHoursDialog({ isOpen, onClose, entry }: EditHoursDialogProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [formData, setFormData] = useState({
    id: 0,
    clientId: "",
    serviceId: "",
    date: "",
    hours: "1",
    minutes: "0",
    isBilled: false,
    notes: "",
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

      if (entry) {
        const hours = Math.floor(entry.durationMinutes / 60)
        const minutes = entry.durationMinutes % 60

        setFormData({
          id: entry.id,
          clientId: entry.clientId.toString(),
          serviceId: entry.serviceId.toString(),
          date: entry.date,
          hours: hours.toString(),
          minutes: minutes.toString(),
          isBilled: entry.isBilled,
          notes: entry.notes,
        })
      }
    }
  }, [isOpen, entry])

  const handleChange = (field: string, value: string | boolean) => {
    setFormData({
      ...formData,
      [field]: value,
    })
  }

  const handleSubmit = async () => {
    try {
      const durationMinutes = Number.parseInt(formData.hours) * 60 + Number.parseInt(formData.minutes)

      await updateHoursEntry({
        id: formData.id,
        clientId: Number.parseInt(formData.clientId),
        serviceId: Number.parseInt(formData.serviceId),
        date: formData.date,
        durationMinutes,
        isBilled: formData.isBilled,
        notes: formData.notes,
      })

      onClose()
      // Refresh the entries list
      window.location.reload()
    } catch (error) {
      console.error("Erreur lors de la modification de l'entrée d'heures", error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifier les heures</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right" htmlFor="client">
              Client
            </Label>
            <Select value={formData.clientId} onValueChange={(value) => handleChange("clientId", value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Sélectionner un client" />
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
                <SelectValue placeholder="Sélectionner un service" />
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
            <Label className="text-right" htmlFor="date">
              Date
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
            <Label className="text-right">Durée</Label>
            <div className="col-span-3 flex items-center gap-2">
              <Input
                id="hours"
                type="number"
                min="0"
                value={formData.hours}
                onChange={(e) => handleChange("hours", e.target.value)}
                className="w-20"
              />
              <span>h</span>
              <Input
                id="minutes"
                type="number"
                min="0"
                max="59"
                value={formData.minutes}
                onChange={(e) => handleChange("minutes", e.target.value)}
                className="w-20"
              />
              <span>min</span>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="text-right">Facturation</div>
            <div className="col-span-3 flex items-center space-x-2">
              <Checkbox
                id="isBilled"
                checked={formData.isBilled}
                onCheckedChange={(checked) => handleChange("isBilled", Boolean(checked))}
              />
              <label
                htmlFor="isBilled"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Marquer comme facturé
              </label>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right" htmlFor="notes">
              Notes
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              className="col-span-3"
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
