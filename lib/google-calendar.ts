import { google } from "googleapis"

// Configuration Google Calendar API
const GOOGLE_CALENDAR_CONFIG = {
  clientId: "1087206683038-gpda075ptjgg0ks6dggmlubc0sokio7u.apps.googleusercontent.com",
  clientSecret: "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",
  redirectUri: "http://localhost:3000/auth/google/callback",
  serviceAccountEmail: "babine-book@babine-book.iam.gserviceaccount.com",
  scopes: ["https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/calendar.events"],
}

// Interface pour les événements Google Calendar
export interface GoogleCalendarEvent {
  id?: string
  summary: string
  description?: string
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  attendees?: Array<{
    email: string
    displayName?: string
  }>
  reminders?: {
    useDefault: boolean
    overrides?: Array<{
      method: "email" | "popup"
      minutes: number
    }>
  }
}

// Classe pour gérer l'intégration Google Calendar
export class GoogleCalendarService {
  private oauth2Client: any
  private calendar: any
  private isAuthenticated = false

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      GOOGLE_CALENDAR_CONFIG.clientId,
      GOOGLE_CALENDAR_CONFIG.clientSecret,
      GOOGLE_CALENDAR_CONFIG.redirectUri,
    )

    this.calendar = google.calendar({ version: "v3", auth: this.oauth2Client })
  }

  // Générer l'URL d'authentification
  getAuthUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: GOOGLE_CALENDAR_CONFIG.scopes,
      prompt: "consent",
    })
  }

  // Échanger le code d'autorisation contre des tokens
  async exchangeCodeForTokens(code: string): Promise<boolean> {
    try {
      const { tokens } = await this.oauth2Client.getAccessToken(code)
      this.oauth2Client.setCredentials(tokens)

      // Sauvegarder les tokens (dans une vraie app, utiliser une base de données sécurisée)
      if (typeof window !== "undefined") {
        localStorage.setItem("google_calendar_tokens", JSON.stringify(tokens))
      }

      this.isAuthenticated = true
      return true
    } catch (error) {
      console.error("Erreur lors de l'échange du code:", error)
      return false
    }
  }

  // Charger les tokens sauvegardés
  async loadSavedTokens(): Promise<boolean> {
    try {
      if (typeof window === "undefined") return false

      const savedTokens = localStorage.getItem("google_calendar_tokens")
      if (!savedTokens) return false

      const tokens = JSON.parse(savedTokens)
      this.oauth2Client.setCredentials(tokens)

      // Vérifier si les tokens sont encore valides
      await this.calendar.calendarList.list()
      this.isAuthenticated = true
      return true
    } catch (error) {
      console.error("Tokens invalides ou expirés:", error)
      this.clearTokens()
      return false
    }
  }

  // Supprimer les tokens
  clearTokens(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("google_calendar_tokens")
    }
    this.isAuthenticated = false
  }

  // Vérifier l'état d'authentification
  isAuth(): boolean {
    return this.isAuthenticated
  }

  // Obtenir la liste des calendriers
  async getCalendars(): Promise<any[]> {
    try {
      if (!this.isAuthenticated) {
        throw new Error("Non authentifié")
      }

      const response = await this.calendar.calendarList.list()
      return response.data.items || []
    } catch (error) {
      console.error("Erreur lors de la récupération des calendriers:", error)
      return []
    }
  }

  // Créer un événement dans Google Calendar
  async createEvent(calendarId: string, event: GoogleCalendarEvent): Promise<string | null> {
    try {
      if (!this.isAuthenticated) {
        throw new Error("Non authentifié")
      }

      const response = await this.calendar.events.insert({
        calendarId: calendarId,
        resource: event,
      })

      return response.data.id
    } catch (error) {
      console.error("Erreur lors de la création de l'événement:", error)
      return null
    }
  }

  // Mettre à jour un événement
  async updateEvent(calendarId: string, eventId: string, event: GoogleCalendarEvent): Promise<boolean> {
    try {
      if (!this.isAuthenticated) {
        throw new Error("Non authentifié")
      }

      await this.calendar.events.update({
        calendarId: calendarId,
        eventId: eventId,
        resource: event,
      })

      return true
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'événement:", error)
      return false
    }
  }

  // Supprimer un événement
  async deleteEvent(calendarId: string, eventId: string): Promise<boolean> {
    try {
      if (!this.isAuthenticated) {
        throw new Error("Non authentifié")
      }

      await this.calendar.events.delete({
        calendarId: calendarId,
        eventId: eventId,
      })

      return true
    } catch (error) {
      console.error("Erreur lors de la suppression de l'événement:", error)
      return false
    }
  }

  // Synchroniser les événements depuis Google Calendar
  async syncEventsFromGoogle(calendarId: string, timeMin?: string, timeMax?: string): Promise<any[]> {
    try {
      if (!this.isAuthenticated) {
        throw new Error("Non authentifié")
      }

      const response = await this.calendar.events.list({
        calendarId: calendarId,
        timeMin: timeMin || new Date().toISOString(),
        timeMax: timeMax,
        singleEvents: true,
        orderBy: "startTime",
      })

      return response.data.items || []
    } catch (error) {
      console.error("Erreur lors de la synchronisation:", error)
      return []
    }
  }
}

// Instance singleton du service
export const googleCalendarService = new GoogleCalendarService()
