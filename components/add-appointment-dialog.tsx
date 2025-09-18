"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { DatabaseService } from "@/lib/database"
import type { Client, Service, Employe, Salle } from "@/lib/database"
import { useToast } from "@/hooks/use-toast"

interface AddAppointmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAppointmentCreated?: () => void
}

export function AddAppointmentDialog({ open, onOpenChange, onAppointmentCreated }: AddAppointmentDialogProps) {
  const [date, setDate] = useState<Date>()
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [employes, setEmployes] = useState<Employe[]>([])
  const [salles, setSalles] = useState<Salle[]>([])
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    clientId: "",
    serviceId: "",
    employeId: "",
    salleId: "",
    duration: "60",
    notes: "",
    time: "",
    prix: "",
  })

  // Charger les données au montage
  useEffect(() => {
    if (open) {
      loadData()
    }
  }, [open])

  const loadData = async () => {
    try {
      const [clientsData, servicesData, employesData, sallesData] = await Promise.all([
        DatabaseService.getClients(),
        DatabaseService.getServices(),
        DatabaseService.getEmployes(),
        DatabaseService.getSalles(),
      ])

      setClients(clientsData)
      setServices(servicesData)
      setEmployes(employesData)
      setSalles(sallesData)
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive",
      })
    }
  }

  // Mettre à jour la durée et le prix quand un service est sélectionné
  useEffect(() => {
    if (formData.serviceId) {
      const selectedService = services.find((s) => s.id.toString() === formData.serviceId)
      if (selectedService) {
        setFormData((prev) => ({
          ...prev,
          duration: selectedService.duree.toString(),
          prix: selectedService.prix.toString(),
        }))
      }
    }
  }, [formData.serviceId, services])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!date || !formData.time || !formData.clientId || !formData.serviceId) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Construire la date/heure complète
      const dateTime = new Date(date)
      const [hours, minutes] = formData.time.split(":")
      dateTime.setHours(Number.parseInt(hours), Number.parseInt(minutes), 0, 0)

      const response = await fetch("/api/rendezvous/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: Number.parseInt(formData.clientId),
          service_id: Number.parseInt(formData.serviceId),
          employe_id: formData.employeId ? Number.parseInt(formData.employeId) : null,
          salle_id: formData.salleId ? Number.parseInt(formData.salleId) : null,
          date_heure: dateTime.toISOString(),
          duree: Number.parseInt(formData.duration),
          notes: formData.notes || null,
          prix: formData.prix ? Number.parseFloat(formData.prix) : null,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de la création")
      }

      toast({
        title: "Succès",
        description: "Rendez-vous créé avec succès",
      })

      // Reset form
      setFormData({
        clientId: "",
        serviceId: "",
        employeId: "",
        salleId: "",
        duration: "60",
        notes: "",
        time: "",
        prix: "",
      })
      setDate(undefined)

      onOpenChange(false)
      onAppointmentCreated?.()
    } catch (error) {
      console.error("Erreur:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la création",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Nouveau Rendez-vous
          </DialogTitle>
          <DialogDescription>Planifiez un nouveau rendez-vous avec un client.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client">Client *</Label>
              <Select
                value={formData.clientId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, clientId: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.prenom} {client.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="service">Service *</Label>
              <Select
                value={formData.serviceId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, serviceId: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id.toString()}>
                      {service.nom} ({service.duree}min - {service.prix}$)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP", { locale: fr }) : "Sélectionner une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Heure *</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employe">Employé</Label>
              <Select
                value={formData.employeId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, employeId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un employé" />
                </SelectTrigger>
                <SelectContent>
                  {employes.map((employe) => (
                    <SelectItem key={employe.id} value={employe.id.toString()}>
                      {employe.prenom} {employe.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="salle">Salle</Label>
              <Select
                value={formData.salleId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, salleId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une salle" />
                </SelectTrigger>
                <SelectContent>
                  {salles.map((salle) => (
                    <SelectItem key={salle.id} value={salle.id.toString()}>
                      {salle.nom} (Capacité: {salle.capacite})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Durée (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="15"
                max="480"
                step="15"
                value={formData.duration}
                onChange={(e) => setFormData((prev) => ({ ...prev, duration: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prix">Prix ($)</Label>
              <Input
                id="prix"
                type="number"
                min="0"
                step="0.01"
                value={formData.prix}
                onChange={(e) => setFormData((prev) => ({ ...prev, prix: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              placeholder="Notes sur le rendez-vous..."
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-primary to-secondary" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                "Créer le RDV"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
