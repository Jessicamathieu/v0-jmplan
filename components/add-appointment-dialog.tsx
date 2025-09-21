"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
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
import { DatabaseService, type Client, type Service, type Employe, type Salle } from "@/lib/database"
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
    duration: "",
    notes: "",
    time: "",
    prix: "",
  })

  // Charger les données
  useEffect(() => {
    if (!open) return
    Promise.all([
      DatabaseService.getClients(),
      DatabaseService.getServices(),
      DatabaseService.getEmployes(),
      DatabaseService.getSalles(),
    ])
      .then(([c, s, e, sa]) => {
        setClients(c)
        setServices(s)
        setEmployes(e)
        setSalles(sa)
      })
      .catch((error) => {
        console.error("Erreur chargement données:", error)
        toast({ title: "Erreur", description: "Impossible de charger les données", variant: "destructive" })
      })
  }, [open, toast])

  // Auto-remplir durée/prix/salle selon service
  useEffect(() => {
    if (!formData.serviceId) return
    const selected = services.find((s) => s.id.toString() === formData.serviceId)
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        duration: selected.dureeminutes?.toString() || prev.duration,
        prix: selected.prix?.toString() || prev.prix,
        salleId: selected.salle_id?.toString() || prev.salleId,
      }))
    }
  }, [formData.serviceId, services])

  // Génération des créneaux de 15 minutes
  const timeSlots = Array.from({ length: 24 * 4 }, (_, i) => {
    const h = Math.floor(i / 4).toString().padStart(2, "0")
    const m = ((i % 4) * 15).toString().padStart(2, "0")
    return `${h}:${m}`
  })

  // Soumission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!date || !formData.time || !formData.clientId || !formData.serviceId) {
      return toast({ title: "Erreur", description: "Veuillez remplir tous les champs requis", variant: "destructive" })
    }

    setLoading(true)
    try {
      const dateTime = new Date(date)
      const [h, m] = formData.time.split(":")
      dateTime.setHours(Number(h), Number(m), 0, 0)

      const response = await fetch("/api/rendezvous/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: Number(formData.clientId),
          service_id: Number(formData.serviceId),
          employe_id: formData.employeId ? Number(formData.employeId) : null,
          salle_id: formData.salleId ? Number(formData.salleId) : null,
          date_heure: dateTime.toISOString(),
          duree: Number(formData.duration),
          notes: formData.notes || null,
          prix: formData.prix ? Number(formData.prix) : null,
        }),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Erreur création RDV")

      toast({ title: "Succès", description: "Rendez-vous créé avec succès ✅" })
      setFormData({ clientId: "", serviceId: "", employeId: "", salleId: "", duration: "", notes: "", time: "", prix: "" })
      setDate(undefined)
      onOpenChange(false)
      onAppointmentCreated?.()
    } catch (error) {
      console.error(error)
      toast({ title: "Erreur", description: error instanceof Error ? error.message : "Erreur création RDV", variant: "destructive" })
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
          {/* Client + Service */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Client *</Label>
              <Select value={formData.clientId} onValueChange={(v) => setFormData((p) => ({ ...p, clientId: v }))}>
                <SelectTrigger><SelectValue placeholder="Choisir un client" /></SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}> {c.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Service *</Label>
              <Select value={formData.serviceId} onValueChange={(v) => setFormData((p) => ({ ...p, serviceId: v }))}>
                <SelectTrigger><SelectValue placeholder="Choisir un service" /></SelectTrigger>
                <SelectContent>
                  {services.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()}>{s.description}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date + Heure */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start", !date && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP", { locale: fr }) : "Sélectionner une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar mode="single" locale={fr} selected={date} onSelect={setDate} disabled={(d) => d < new Date()} />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Heure *</Label>
              <Select value={formData.time} onValueChange={(v) => setFormData((p) => ({ ...p, time: v }))}>
                <SelectTrigger><SelectValue placeholder="Choisir une heure" /></SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Employé + Salle */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Employé</Label>
              <Select value={formData.employeId} onValueChange={(v) => setFormData((p) => ({ ...p, employeId: v }))}>
                <SelectTrigger><SelectValue placeholder="Choisir un employé" /></SelectTrigger>
                <SelectContent>
                  {employes.map((e) => (
                    <SelectItem key={e.id} value={e.id.toString()}>{e.prenom} {e.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Salle</Label>
              <Select value={formData.salleId} onValueChange={(v) => setFormData((p) => ({ ...p, salleId: v }))}>
                <SelectTrigger><SelectValue placeholder="Choisir une salle" /></SelectTrigger>
                <SelectContent>
                  {salles.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()}>{s.description}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Durée + Prix */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Durée (min)</Label>
              <Input type="number" value={formData.duration} readOnly />
            </div>
            <div>
              <Label>Prix ($)</Label>
              <Input type="number" step="0.01" value={formData.prix} readOnly />
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label>Notes</Label>
            <Textarea value={formData.notes} onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))} rows={3} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Annuler</Button>
            <Button type="submit" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Création...</> : "Créer le RDV"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
