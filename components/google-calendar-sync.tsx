"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  Calendar,
  CheckCircle,
  AlertCircle,
  Send as Sync,
  ExternalLink,
  Settings,
  Clock,
  Users,
  Zap,
  Shield,
} from "lucide-react"
import { googleCalendarService, type GoogleCalendarEvent } from "@/lib/google-calendar"
import { getAppointments, type Appointment } from "@/lib/api-client"

interface GoogleCalendar {
  id: string
  summary: string
  description?: string
  primary?: boolean
  accessRole: string
}

export default function GoogleCalendarSync() {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [calendars, setCalendars] = useState<GoogleCalendar[]>([])
  const [selectedCalendar, setSelectedCalendar] = useState<string>("")
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle")
  const [syncProgress, setSyncProgress] = useState(0)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [autoSync, setAutoSync] = useState(false)
  const [syncDirection, setSyncDirection] = useState<"both" | "to_google" | "from_google">("both")
  const [message, setMessage] = useState<string>("")

  // Vérifier l'état de connexion au chargement
  useEffect(() => {
    checkConnectionStatus()
  }, [])

  const checkConnectionStatus = async () => {
    setIsLoading(true)
    try {
      const connected = await googleCalendarService.loadSavedTokens()
      setIsConnected(connected)

      if (connected) {
        await loadCalendars()
        const savedCalendar = localStorage.getItem("selected_google_calendar")
        if (savedCalendar) {
          setSelectedCalendar(savedCalendar)
        }

        const savedAutoSync = localStorage.getItem("google_calendar_auto_sync")
        setAutoSync(savedAutoSync === "true")

        const savedSyncDirection = localStorage.getItem("google_calendar_sync_direction")
        if (savedSyncDirection) {
          setSyncDirection(savedSyncDirection as any)
        }

        const savedLastSync = localStorage.getItem("google_calendar_last_sync")
        if (savedLastSync) {
          setLastSync(new Date(savedLastSync))
        }
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de la connexion:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadCalendars = async () => {
    try {
      const calendarList = await googleCalendarService.getCalendars()
      setCalendars(calendarList)
    } catch (error) {
      console.error("Erreur lors du chargement des calendriers:", error)
      setMessage("Erreur lors du chargement des calendriers")
    }
  }

  const handleConnect = () => {
    const authUrl = googleCalendarService.getAuthUrl()
    window.open(authUrl, "_blank", "width=500,height=600")

    // Écouter le message de retour de la fenêtre d'authentification
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return

      if (event.data.type === "GOOGLE_AUTH_SUCCESS") {
        handleAuthSuccess(event.data.code)
        window.removeEventListener("message", handleMessage)
      }
    }

    window.addEventListener("message", handleMessage)
  }

  const handleAuthSuccess = async (code: string) => {
    setIsLoading(true)
    try {
      const success = await googleCalendarService.exchangeCodeForTokens(code)
      if (success) {
        setIsConnected(true)
        await loadCalendars()
        setMessage("Connexion réussie à Google Calendar !")
      } else {
        setMessage("Erreur lors de la connexion")
      }
    } catch (error) {
      console.error("Erreur lors de l'authentification:", error)
      setMessage("Erreur lors de l'authentification")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnect = () => {
    googleCalendarService.clearTokens()
    setIsConnected(false)
    setCalendars([])
    setSelectedCalendar("")
    localStorage.removeItem("selected_google_calendar")
    localStorage.removeItem("google_calendar_auto_sync")
    localStorage.removeItem("google_calendar_sync_direction")
    localStorage.removeItem("google_calendar_last_sync")
    setMessage("Déconnexion réussie")
  }

  const handleCalendarSelect = (calendarId: string) => {
    setSelectedCalendar(calendarId)
    localStorage.setItem("selected_google_calendar", calendarId)
  }

  const handleAutoSyncToggle = (enabled: boolean) => {
    setAutoSync(enabled)
    localStorage.setItem("google_calendar_auto_sync", enabled.toString())
  }

  const handleSyncDirectionChange = (direction: string) => {
    setSyncDirection(direction as any)
    localStorage.setItem("google_calendar_sync_direction", direction)
  }

  const convertAppointmentToGoogleEvent = (appointment: Appointment): GoogleCalendarEvent => {
    return {
      summary: `${appointment.serviceName} - ${appointment.clientName}`,
      description: `Service: ${appointment.serviceName}\nClient: ${appointment.clientName}\nNotes: ${appointment.notes}`,
      start: {
        dateTime: appointment.startTime,
        timeZone: "America/Montreal",
      },
      end: {
        dateTime: appointment.endTime,
        timeZone: "America/Montreal",
      },
      attendees: [
        {
          email: "contact@jmplan.com",
          displayName: "JM Plan",
        },
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 60 },
          { method: "popup", minutes: 15 },
        ],
      },
    }
  }

  const performSync = async () => {
    if (!selectedCalendar) {
      setMessage("Veuillez sélectionner un calendrier")
      return
    }

    setSyncStatus("syncing")
    setSyncProgress(0)
    setMessage("Synchronisation en cours...")

    try {
      const appointments = await getAppointments()
      const totalSteps = appointments.length
      let completedSteps = 0

      if (syncDirection === "to_google" || syncDirection === "both") {
        // Synchroniser vers Google Calendar
        for (const appointment of appointments) {
          const googleEvent = convertAppointmentToGoogleEvent(appointment)
          await googleCalendarService.createEvent(selectedCalendar, googleEvent)

          completedSteps++
          setSyncProgress((completedSteps / totalSteps) * 100)

          // Petite pause pour éviter les limites de taux
          await new Promise((resolve) => setTimeout(resolve, 100))
        }
      }

      if (syncDirection === "from_google" || syncDirection === "both") {
        // Synchroniser depuis Google Calendar
        const timeMin = new Date()
        timeMin.setMonth(timeMin.getMonth() - 1) // Derniers 30 jours

        const timeMax = new Date()
        timeMax.setMonth(timeMax.getMonth() + 3) // Prochains 3 mois

        const googleEvents = await googleCalendarService.syncEventsFromGoogle(
          selectedCalendar,
          timeMin.toISOString(),
          timeMax.toISOString(),
        )

        // Ici, vous pourriez traiter les événements Google et les convertir en rendez-vous
        console.log("Événements Google Calendar récupérés:", googleEvents.length)
      }

      setSyncStatus("success")
      setLastSync(new Date())
      localStorage.setItem("google_calendar_last_sync", new Date().toISOString())
      setMessage(`Synchronisation réussie ! ${completedSteps} éléments synchronisés.`)
    } catch (error) {
      console.error("Erreur lors de la synchronisation:", error)
      setSyncStatus("error")
      setMessage("Erreur lors de la synchronisation")
    } finally {
      setSyncProgress(100)
      setTimeout(() => {
        setSyncStatus("idle")
        setSyncProgress(0)
      }, 2000)
    }
  }

  return (
    <div className="space-y-6">
      {/* État de connexion */}
      <Card className="premium-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Synchronisation Google Calendar
            {isConnected && (
              <Badge className="premium-gradient text-white border-0">
                <CheckCircle className="h-3 w-3 mr-1" />
                Connecté
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Synchronisez vos rendez-vous avec Google Calendar pour une gestion centralisée
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isConnected ? (
            <div className="text-center py-8">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Connectez votre Google Calendar</h3>
              <p className="text-muted-foreground mb-6">
                Synchronisez automatiquement vos rendez-vous avec Google Calendar
              </p>
              <Button onClick={handleConnect} disabled={isLoading} className="premium-button">
                {isLoading ? (
                  <>
                    <Sync className="h-4 w-4 mr-2 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Se connecter à Google
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Sélection du calendrier */}
              <div className="space-y-2">
                <Label>Calendrier de destination</Label>
                <Select value={selectedCalendar} onValueChange={handleCalendarSelect}>
                  <SelectTrigger className="premium-border">
                    <SelectValue placeholder="Sélectionnez un calendrier" />
                  </SelectTrigger>
                  <SelectContent>
                    {calendars.map((calendar) => (
                      <SelectItem key={calendar.id} value={calendar.id}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${calendar.primary ? "bg-primary" : "bg-muted"}`} />
                          {calendar.summary}
                          {calendar.primary && <Badge variant="secondary">Principal</Badge>}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Options de synchronisation */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Options de synchronisation
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Direction de synchronisation</Label>
                    <Select value={syncDirection} onValueChange={handleSyncDirectionChange}>
                      <SelectTrigger className="premium-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="both">Bidirectionnelle</SelectItem>
                        <SelectItem value="to_google">Vers Google Calendar</SelectItem>
                        <SelectItem value="from_google">Depuis Google Calendar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Synchronisation automatique</Label>
                      <p className="text-sm text-muted-foreground">Sync toutes les heures</p>
                    </div>
                    <Switch checked={autoSync} onCheckedChange={handleAutoSyncToggle} />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Synchronisation manuelle */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Synchronisation manuelle</h4>
                    {lastSync && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Dernière sync: {lastSync.toLocaleString("fr-CA")}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={performSync}
                    disabled={syncStatus === "syncing" || !selectedCalendar}
                    className="premium-button"
                  >
                    {syncStatus === "syncing" ? (
                      <>
                        <Sync className="h-4 w-4 mr-2 animate-spin" />
                        Synchronisation...
                      </>
                    ) : (
                      <>
                        <Sync className="h-4 w-4 mr-2" />
                        Synchroniser maintenant
                      </>
                    )}
                  </Button>
                </div>

                {syncStatus === "syncing" && (
                  <div className="space-y-2">
                    <Progress value={syncProgress} className="w-full" />
                    <p className="text-sm text-muted-foreground text-center">{Math.round(syncProgress)}% terminé</p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Actions */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  Connexion sécurisée via OAuth 2.0
                </div>
                <Button variant="outline" onClick={handleDisconnect}>
                  Déconnecter
                </Button>
              </div>
            </div>
          )}

          {/* Messages */}
          {message && (
            <Alert
              className={`${syncStatus === "error" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}
            >
              {syncStatus === "error" ? (
                <AlertCircle className="h-4 w-4 text-red-600" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
              <AlertDescription className={syncStatus === "error" ? "text-red-600" : "text-green-600"}>
                {message}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Statistiques de synchronisation */}
      {isConnected && (
        <Card className="premium-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Statistiques de synchronisation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10">
                <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-primary">{calendars.length}</div>
                <div className="text-sm text-muted-foreground">Calendriers disponibles</div>
              </div>

              <div className="text-center p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">{syncStatus === "success" ? "✓" : "-"}</div>
                <div className="text-sm text-muted-foreground">Dernière synchronisation</div>
              </div>

              <div className="text-center p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
                <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">{autoSync ? "Auto" : "Manuel"}</div>
                <div className="text-sm text-muted-foreground">Mode de synchronisation</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
