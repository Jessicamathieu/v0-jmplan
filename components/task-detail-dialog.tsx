"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { getClients, getHoursEntries, getServices, updateTask, getClientById, getServiceById } from "@/lib/api-client"
import type { Task } from "@/types/task"
import type { Client } from "@/types/client"
import type { HoursEntry } from "@/types/hours"
import type { Service } from "@/types/service"

interface TaskDetailDialogProps {
  isOpen: boolean
  onClose: () => void
  task: Task
}

export function TaskDetailDialog({ isOpen, onClose, task }: TaskDetailDialogProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [hoursEntries, setHoursEntries] = useState<HoursEntry[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [selectedEntries, setSelectedEntries] = useState<number[]>([])
  const [selectedServices, setSelectedServices] = useState<number[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [selectedServicesDetails, setSelectedServicesDetails] = useState<Service[]>([])
  const [formData, setFormData] = useState({
    id: 0,
    title: "",
    description: "",
    completed: false,
    dueDate: "",
    location: "",
    clientId: "",
    customPrice: "",
    serviceDate: "",
    details: "",
    billingType: "global",
    billingStartDate: "",
    billingEndDate: "",
  })

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        const clientsData = await getClients()
        const entriesData = await getHoursEntries()
        const servicesData = await getServices()
        setClients(clientsData)
        setHoursEntries(entriesData)
        setServices(servicesData)
      }

      fetchData()

      if (task) {
        setFormData({
          id: task.id,
          title: task.title,
          description: task.description,
          completed: task.completed,
          dueDate: task.dueDate || "",
          location: task.location || "",
          clientId: task.clientId?.toString() || "",
          customPrice: task.customPrice?.toString() || "",
          serviceDate: task.serviceDate || "",
          details: task.details || "",
          billingType: task.billingType || "global",
          billingStartDate: task.billingPeriod?.startDate || "",
          billingEndDate: task.billingPeriod?.endDate || "",
        })

        setSelectedEntries(task.hoursEntries || [])
        setSelectedServices(task.services || [])

        // Charger les détails du client sélectionné
        if (task.clientId) {
          getClientById(task.clientId).then((client) => {
            setSelectedClient(client || null)
          })
        }

        // Charger les détails des services sélectionnés
        if (task.services && task.services.length > 0) {
          const loadServiceDetails = async () => {
            const serviceDetails = await Promise.all(task.services.map((serviceId) => getServiceById(serviceId)))
            setSelectedServicesDetails(serviceDetails.filter(Boolean) as Service[])
          }
          loadServiceDetails()
        }
      }
    }
  }, [isOpen, task])

  const handleChange = (field: string, value: string | boolean) => {
    setFormData({
      ...formData,
      [field]: value,
    })
  }

  const handleClientChange = async (clientId: string) => {
    handleChange("clientId", clientId)

    // Charger les détails du client sélectionné
    if (clientId) {
      const client = await getClientById(clientId)
      setSelectedClient(client || null)

      // Si le client a une adresse, mettre à jour l'emplacement
      if (client && client.address && !formData.location) {
        handleChange("location", client.address)
      }
    } else {
      setSelectedClient(null)
    }
  }

  const toggleEntrySelection = (entryId: number) => {
    if (selectedEntries.includes(entryId)) {
      setSelectedEntries(selectedEntries.filter((id) => id !== entryId))
    } else {
      setSelectedEntries([...selectedEntries, entryId])
    }
  }

  const toggleServiceSelection = async (serviceId: number) => {
    let newSelectedServices: number[]

    if (selectedServices.includes(serviceId)) {
      newSelectedServices = selectedServices.filter((id) => id !== serviceId)
      setSelectedServices(newSelectedServices)
      setSelectedServicesDetails(selectedServicesDetails.filter((service) => service.id !== serviceId))
    } else {
      newSelectedServices = [...selectedServices, serviceId]
      setSelectedServices(newSelectedServices)

      // Ajouter les détails du service
      const service = await getServiceById(serviceId)
      if (service) {
        setSelectedServicesDetails([...selectedServicesDetails, service])
      }
    }
  }

  const calculateTotalHours = () => {
    const selectedHoursEntries = hoursEntries.filter((entry) => selectedEntries.includes(entry.id))
    const totalMinutes = selectedHoursEntries.reduce((acc, entry) => acc + entry.durationMinutes, 0)
    return totalMinutes / 60
  }

  const calculateTotalAmount = () => {
    if (formData.customPrice) {
      return Number.parseFloat(formData.customPrice)
    }

    // Calculer le montant basé sur les heures et les services sélectionnés
    let total = 0

    // Ajouter le montant des heures
    const selectedHoursEntries = hoursEntries.filter((entry) => selectedEntries.includes(entry.id))
    total += selectedHoursEntries.reduce((acc, entry) => {
      // Trouver le service correspondant
      const service = services.find((s) => s.id === entry.serviceId)
      const rate = service ? service.rate : 0
      return acc + (rate * entry.durationMinutes) / 60
    }, 0)

    // Ajouter le montant des services sélectionnés (si pas déjà comptés dans les heures)
    // Ici, nous supposons que les services sélectionnés sont des services additionnels
    total += selectedServicesDetails.reduce((acc, service) => {
      return acc + service.price
    }, 0)

    return total
  }

  const handleSubmit = async () => {
    try {
      const updatedTask = {
        id: formData.id,
        title: formData.title,
        description: formData.description,
        completed: formData.completed,
        dueDate: formData.dueDate || null,
        location: formData.location || null,
        clientId: formData.clientId ? Number.parseInt(formData.clientId) : undefined,
        hoursEntries: selectedEntries,
        services: selectedServices,
        customPrice: formData.customPrice ? Number.parseFloat(formData.customPrice) : undefined,
        serviceDate: formData.serviceDate || undefined,
        details: formData.details || undefined,
        billingType: formData.billingType as "daily" | "global",
        billingPeriod: {
          startDate: formData.billingStartDate,
          endDate: formData.billingEndDate,
        },
      }

      await updateTask(updatedTask)
      onClose()
      // Refresh the task list
      window.location.reload()
    } catch (error) {
      console.error("Erreur lors de la modification de la tâche", error)
    }
  }

  // Filtrer les entrées d'heures par client sélectionné
  const filteredHoursEntries = formData.clientId
    ? hoursEntries.filter((entry) => entry.clientId.toString() === formData.clientId)
    : hoursEntries

  // Grouper les entrées d'heures par date pour la facturation quotidienne
  const entriesByDate = filteredHoursEntries.reduce(
    (acc, entry) => {
      if (!acc[entry.date]) {
        acc[entry.date] = []
      }
      acc[entry.date].push(entry)
      return acc
    },
    {} as Record<string, HoursEntry[]>,
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Détails de la tâche</DialogTitle>
          <DialogDescription>
            Gérez les détails de la tâche, associez des heures et configurez la facturation
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="mt-4">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="details">Détails</TabsTrigger>
            <TabsTrigger value="hours">Heures & Services</TabsTrigger>
            <TabsTrigger value="billing">Facturation</TabsTrigger>
          </TabsList>

          {/* Onglet Détails */}
          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="title">
                Titre
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                className="col-span-3"
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
              <Label className="text-right" htmlFor="client">
                Client
              </Label>
              <Select value={formData.clientId} onValueChange={handleClientChange}>
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

            {selectedClient && (
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-right text-sm text-muted-foreground">Contact</div>
                <div className="col-span-3 text-sm">
                  <div>{selectedClient.phone}</div>
                  <div>{selectedClient.email}</div>
                  {selectedClient.notes && <div className="mt-1 text-muted-foreground">{selectedClient.notes}</div>}
                </div>
              </div>
            )}

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
              <Label className="text-right" htmlFor="serviceDate">
                Date du service
              </Label>
              <Input
                id="serviceDate"
                type="date"
                value={formData.serviceDate}
                onChange={(e) => handleChange("serviceDate", e.target.value)}
                className="col-span-3"
              />
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
          </TabsContent>

          {/* Onglet Heures & Services */}
          <TabsContent value="hours" className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <Label className="text-right pt-2">Services associés</Label>
              <div className="col-span-3 flex flex-wrap gap-2">
                {services.map((service) => (
                  <Badge
                    key={service.id}
                    variant={selectedServices.includes(service.id) ? "default" : "outline"}
                    className="cursor-pointer px-3 py-1"
                    style={{
                      backgroundColor: selectedServices.includes(service.id)
                        ? `var(--${service.color || "blue"}-500)`
                        : "transparent",
                      color: selectedServices.includes(service.id) ? "white" : "inherit",
                    }}
                    onClick={() => toggleServiceSelection(service.id)}
                  >
                    {service.name} - {service.price}$/h
                  </Badge>
                ))}
              </div>
            </div>

            {selectedServicesDetails.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                <Label className="text-right pt-2">Détails des services</Label>
                <div className="col-span-3">
                  <div className="space-y-2">
                    {selectedServicesDetails.map((service) => (
                      <div key={service.id} className="p-2 border rounded-md">
                        <div className="font-medium">{service.name}</div>
                        {service.description && (
                          <div className="text-sm text-muted-foreground">{service.description}</div>
                        )}
                        <div className="mt-1 flex items-center gap-2 text-sm">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: `var(--${service.color || "blue"}-500)` }}
                          ></div>
                          <span>
                            {service.duration} min - {service.price}$
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-4 gap-4">
              <Label className="text-right pt-2">Heures associées</Label>
              <div className="col-span-3">
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Durée</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredHoursEntries.length > 0 ? (
                        filteredHoursEntries.map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedEntries.includes(entry.id)}
                                onCheckedChange={() => toggleEntrySelection(entry.id)}
                              />
                            </TableCell>
                            <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                            <TableCell>{entry.clientName}</TableCell>
                            <TableCell>{entry.serviceName}</TableCell>
                            <TableCell>
                              {Math.floor(entry.durationMinutes / 60)}h
                              {entry.durationMinutes % 60 > 0 ? ` ${entry.durationMinutes % 60}m` : ""}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                            {formData.clientId
                              ? "Aucune heure enregistrée pour ce client"
                              : "Sélectionnez un client pour voir les heures disponibles"}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                <div className="mt-4 flex justify-between">
                  <div>
                    <span className="text-sm font-medium">Total des heures: </span>
                    <span className="font-bold">{calculateTotalHours().toFixed(2)}h</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Montant calculé: </span>
                    <span className="font-bold">${calculateTotalAmount().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Onglet Facturation */}
          <TabsContent value="billing" className="space-y-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Type de facturation</Label>
              <RadioGroup
                className="col-span-3"
                value={formData.billingType}
                onValueChange={(value) => handleChange("billingType", value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="global" id="global" />
                  <Label htmlFor="global">Facturation globale</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="daily" id="daily" />
                  <Label htmlFor="daily">Facturation par jour</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="customPrice">
                Prix personnalisé
              </Label>
              <Input
                id="customPrice"
                type="number"
                value={formData.customPrice}
                onChange={(e) => handleChange("customPrice", e.target.value)}
                className="col-span-3"
                placeholder="Laisser vide pour calculer automatiquement"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Période de facturation</Label>
              <div className="col-span-3 grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="billingStartDate" className="text-xs">
                    Date de début
                  </Label>
                  <Input
                    id="billingStartDate"
                    type="date"
                    value={formData.billingStartDate}
                    onChange={(e) => handleChange("billingStartDate", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="billingEndDate" className="text-xs">
                    Date de fin
                  </Label>
                  <Input
                    id="billingEndDate"
                    type="date"
                    value={formData.billingEndDate}
                    onChange={(e) => handleChange("billingEndDate", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {formData.billingType === "daily" && (
              <div className="grid grid-cols-4 gap-4">
                <Label className="text-right pt-2">Aperçu par jour</Label>
                <div className="col-span-3">
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Heures</TableHead>
                          <TableHead>Montant</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(entriesByDate).map(([date, entries]) => {
                          const totalMinutes = entries.reduce((acc, entry) => acc + entry.durationMinutes, 0)
                          const totalHours = totalMinutes / 60

                          const totalAmount = entries.reduce((acc, entry) => {
                            const service = services.find((s) => s.id === entry.serviceId)
                            const rate = service ? service.rate : 0
                            return acc + (rate * entry.durationMinutes) / 60
                          }, 0)

                          return (
                            <TableRow key={date}>
                              <TableCell>{new Date(date).toLocaleDateString()}</TableCell>
                              <TableCell>{totalHours.toFixed(2)}h</TableCell>
                              <TableCell>${totalAmount.toFixed(2)}</TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-4 gap-4 mt-6">
              <div className="text-right pt-2">Résumé</div>
              <div className="col-span-3 bg-muted p-4 rounded-md">
                <div className="flex justify-between mb-2">
                  <span>Total des heures:</span>
                  <span className="font-bold">{calculateTotalHours().toFixed(2)}h</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Montant calculé:</span>
                  <span className="font-bold">${calculateTotalAmount().toFixed(2)}</span>
                </div>
                {formData.customPrice && (
                  <div className="flex justify-between pt-2 border-t">
                    <span>Prix personnalisé:</span>
                    <span className="font-bold text-primary">
                      ${Number.parseFloat(formData.customPrice).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSubmit}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
