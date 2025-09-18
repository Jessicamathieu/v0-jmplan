import { type NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"
import { DatabaseService } from "@/lib/database"
import type { RendezVousInsert } from "@/lib/database"

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { calendarId, direction = "both", timeMin, timeMax } = body

    const userId = "default_user" // À adapter selon votre système d'auth

    // Récupérer les tokens
    const tokens = await DatabaseService.getGoogleTokens(userId)
    if (!tokens) {
      return NextResponse.json({ error: "Aucun token Google trouvé. Veuillez vous reconnecter." }, { status: 401 })
    }

    // Vérifier si le token a expiré
    const now = new Date()
    const expiresAt = new Date(tokens.expires_at)

    if (now >= expiresAt && tokens.refresh_token) {
      // Rafraîchir le token
      oauth2Client.setCredentials({
        refresh_token: tokens.refresh_token,
      })

      const { credentials } = await oauth2Client.refreshAccessToken()

      // Sauvegarder le nouveau token
      await DatabaseService.saveGoogleTokens(userId, {
        access_token: credentials.access_token!,
        refresh_token: credentials.refresh_token || tokens.refresh_token,
        expires_at: new Date(credentials.expiry_date!).toISOString(),
        scope: tokens.scope,
      })

      oauth2Client.setCredentials(credentials)
    } else {
      oauth2Client.setCredentials({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      })
    }

    const calendar = google.calendar({ version: "v3", auth: oauth2Client })

    let syncedEvents = 0
    const errors: string[] = []

    // Synchronisation depuis Google Calendar vers JM Plan
    if (direction === "from_google" || direction === "both") {
      try {
        const response = await calendar.events.list({
          calendarId: calendarId || "primary",
          timeMin: timeMin || new Date().toISOString(),
          timeMax: timeMax || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 jours
          singleEvents: true,
          orderBy: "startTime",
        })

        const events = response.data.items || []

        for (const event of events) {
          if (!event.start?.dateTime || !event.end?.dateTime) continue

          try {
            // Vérifier si l'événement existe déjà
            const existingAppointments = await DatabaseService.getRendezVous()
            const existingAppointment = existingAppointments.find((rdv) => rdv.google_event_id === event.id)

            if (existingAppointment) continue // Déjà synchronisé

            // Essayer de trouver un client correspondant
            const clients = await DatabaseService.getClients()
            let clientId = clients[0]?.id // Client par défaut

            // Rechercher un client par email dans les attendees
            if (event.attendees) {
              for (const attendee of event.attendees) {
                const client = clients.find((c) => c.email === attendee.email)
                if (client) {
                  clientId = client.id
                  break
                }
              }
            }

            // Essayer de trouver un service correspondant
            const services = await DatabaseService.getServices()
            let serviceId = services[0]?.id // Service par défaut

            // Rechercher un service par nom dans le titre
            if (event.summary) {
              const service = services.find((s) => event.summary!.toLowerCase().includes(s.nom.toLowerCase()))
              if (service) {
                serviceId = service.id
              }
            }

            if (!clientId || !serviceId) continue

            // Calculer la durée
            const startTime = new Date(event.start.dateTime)
            const endTime = new Date(event.end.dateTime)
            const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))

            const rendezVousData: RendezVousInsert = {
              client_id: clientId,
              service_id: serviceId,
              date_heure: startTime.toISOString(),
              duree: duration,
              statut: "confirme",
              notes: event.description || `Importé depuis Google Calendar: ${event.summary}`,
              google_event_id: event.id,
            }

            await DatabaseService.createRendezVous(rendezVousData)
            syncedEvents++
          } catch (eventError) {
            console.error("Erreur lors de la synchronisation d'un événement:", eventError)
            errors.push(
              `Événement "${event.summary}": ${eventError instanceof Error ? eventError.message : "Erreur inconnue"}`,
            )
          }
        }
      } catch (calendarError) {
        console.error("Erreur lors de la récupération des événements Google:", calendarError)
        errors.push("Erreur lors de la récupération des événements Google Calendar")
      }
    }

    // Synchronisation depuis JM Plan vers Google Calendar
    if (direction === "to_google" || direction === "both") {
      try {
        const startDate = timeMin || new Date().toISOString()
        const endDate = timeMax || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()

        const appointments = await DatabaseService.getRendezVous(startDate, endDate)

        for (const appointment of appointments) {
          if (appointment.google_event_id) continue // Déjà synchronisé

          try {
            const startTime = new Date(appointment.date_heure)
            const endTime = new Date(startTime.getTime() + appointment.duree * 60 * 1000)

            const event = {
              summary: `${appointment.service?.nom} - ${appointment.client?.prenom} ${appointment.client?.nom}`,
              description: `Service: ${appointment.service?.nom}\nClient: ${appointment.client?.prenom} ${appointment.client?.nom}\nNotes: ${appointment.notes || "Aucune note"}`,
              start: {
                dateTime: startTime.toISOString(),
                timeZone: "America/Montreal",
              },
              end: {
                dateTime: endTime.toISOString(),
                timeZone: "America/Montreal",
              },
              attendees: appointment.client?.email
                ? [
                    {
                      email: appointment.client.email,
                      displayName: `${appointment.client.prenom} ${appointment.client.nom}`,
                    },
                  ]
                : undefined,
              reminders: {
                useDefault: false,
                overrides: [
                  { method: "email", minutes: 60 },
                  { method: "popup", minutes: 15 },
                ],
              },
            }

            const response = await calendar.events.insert({
              calendarId: calendarId || "primary",
              requestBody: event,
            })

            // Mettre à jour le RDV avec l'ID Google
            if (response.data.id) {
              await DatabaseService.updateRendezVous(appointment.id, {
                google_event_id: response.data.id,
              })
              syncedEvents++
            }
          } catch (eventError) {
            console.error("Erreur lors de la création d'un événement Google:", eventError)
            errors.push(
              `RDV ${appointment.id}: ${eventError instanceof Error ? eventError.message : "Erreur inconnue"}`,
            )
          }
        }
      } catch (appointmentError) {
        console.error("Erreur lors de la récupération des rendez-vous:", appointmentError)
        errors.push("Erreur lors de la récupération des rendez-vous")
      }
    }

    return NextResponse.json({
      success: true,
      syncedEvents,
      errors,
      message: `${syncedEvents} événements synchronisés avec succès`,
    })
  } catch (error) {
    console.error("Erreur lors de la synchronisation Google Calendar:", error)

    return NextResponse.json(
      {
        error: "Erreur interne du serveur",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}
