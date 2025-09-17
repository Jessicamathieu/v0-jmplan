"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Play, Pause, Save, Clock, RotateCcw } from "lucide-react"
import { getClients, getServices, createHoursEntry } from "@/lib/api-client"
import type { Client } from "@/types/client"
import type { Service } from "@/types/service"

export function TimeTracker() {
  const [isRunning, setIsRunning] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [clients, setClients] = useState<Client[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [selectedClient, setSelectedClient] = useState("")
  const [selectedService, setSelectedService] = useState("")
  const [notes, setNotes] = useState("")
  const [savedSessions, setSavedSessions] = useState<
    {
      client: string
      service: string
      duration: number
      notes: string
      timestamp: Date
    }[]
  >([])

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const clientsData = await getClients()
      const servicesData = await getServices()
      setClients(clientsData)
      setServices(servicesData)
    }

    fetchData()
  }, [])

  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true)
      startTimeRef.current = Date.now() - elapsedTime
      intervalRef.current = setInterval(() => {
        setElapsedTime(Date.now() - (startTimeRef.current || 0))
      }, 10)
    }
  }

  const pauseTimer = () => {
    if (isRunning && intervalRef.current) {
      clearInterval(intervalRef.current)
      setIsRunning(false)
    }
  }

  const resetTimer = () => {
    pauseTimer()
    setElapsedTime(0)
  }

  const saveSession = async () => {
    if (!selectedClient || !selectedService) {
      alert("Veuillez sélectionner un client et un service")
      return
    }

    const durationMinutes = Math.round(elapsedTime / 60000)
    if (durationMinutes < 1) {
      alert("La durée est trop courte pour être enregistrée")
      return
    }

    // Enregistrer la session dans l'historique local
    const newSession = {
      client: clients.find((c) => c.id.toString() === selectedClient)?.name || "",
      service: services.find((s) => s.id.toString() === selectedService)?.name || "",
      duration: elapsedTime,
      notes,
      timestamp: new Date(),
    }

    setSavedSessions([newSession, ...savedSessions])

    // Enregistrer dans l'API
    try {
      await createHoursEntry({
        clientId: Number.parseInt(selectedClient),
        serviceId: Number.parseInt(selectedService),
        date: new Date().toISOString().split("T")[0],
        durationMinutes,
        isBilled: false,
        notes,
      })

      // Réinitialiser le formulaire
      resetTimer()
      setNotes("")

      // Notification de succès
      alert("Session enregistrée avec succès")
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de la session", error)
      alert("Erreur lors de l'enregistrement de la session")
    }
  }

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600000)
    const minutes = Math.floor((time % 3600000) / 60000)
    const seconds = Math.floor((time % 60000) / 1000)
    const milliseconds = Math.floor((time % 1000) / 10)

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(2, "0")}`
  }

  const formatDuration = (time: number) => {
    const hours = Math.floor(time / 3600000)
    const minutes = Math.floor((time % 3600000) / 60000)
    const seconds = Math.floor((time % 60000) / 1000)

    return `${hours}h ${minutes}m ${seconds}s`
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Chronomètre
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-6">
            <div className="text-5xl font-mono font-bold tabular-nums bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
              {formatTime(elapsedTime)}
            </div>

            <div className="flex space-x-4">
              {!isRunning ? (
                <Button onClick={startTimer} className="w-32" variant="default">
                  <Play className="mr-2 h-4 w-4" />
                  Démarrer
                </Button>
              ) : (
                <Button onClick={pauseTimer} className="w-32" variant="secondary">
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </Button>
              )}

              <Button onClick={resetTimer} variant="outline" className="w-32" disabled={elapsedTime === 0}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Réinitialiser
              </Button>
            </div>

            <div className="grid w-full gap-4 pt-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="client" className="text-right">
                  Client
                </Label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
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
                <Label htmlFor="service" className="text-right">
                  Service
                </Label>
                <Select value={selectedService} onValueChange={setSelectedService}>
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
                <Label htmlFor="notes" className="text-right">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="col-span-3"
                  placeholder="Détails sur la session..."
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={saveSession} disabled={elapsedTime === 0 || !selectedClient || !selectedService}>
            <Save className="mr-2 h-4 w-4" />
            Enregistrer la session
          </Button>
        </CardFooter>
      </Card>

      {savedSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sessions récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {savedSessions.map((session, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-md">
                  <div>
                    <div className="font-medium">{session.client}</div>
                    <div className="text-sm text-muted-foreground">{session.service}</div>
                    {session.notes && <div className="text-xs text-muted-foreground mt-1">{session.notes}</div>}
                  </div>
                  <div className="text-right">
                    <div className="font-mono">{formatDuration(session.duration)}</div>
                    <div className="text-xs text-muted-foreground">{session.timestamp.toLocaleTimeString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
