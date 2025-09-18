/**
 * Intégrations API tierces pour enrichir les fonctionnalités
 * Inclut Google Calendar, QuickBooks, Twilio SMS, et services de géolocalisation
 */

import { performanceMonitor } from "./performance-monitor"

/**
 * Configuration des intégrations API
 */
interface APIConfig {
  google: {
    clientId: string
    clientSecret: string
    redirectUri: string
  }
  quickbooks: {
    clientId: string
    clientSecret: string
    sandbox: boolean
  }
  twilio: {
    accountSid: string
    authToken: string
    phoneNumber: string
  }
  maps: {
    googleMapsKey: string
  }
}

/**
 * Gestionnaire d'intégrations API avec cache et retry logic
 */
class APIIntegrationManager {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  private config: APIConfig
  private retryAttempts = 3
  private retryDelay = 1000

  constructor(config: APIConfig) {
    this.config = config
  }

  /**
   * Effectue une requête avec cache, retry et monitoring
   */
  private async makeRequest<T>(
    key: string,
    requestFn: () => Promise<T>,
    ttl = 300000, // 5 minutes par défaut
  ): Promise<T> {
    // Vérifier le cache
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data
    }

    // Effectuer la requête avec monitoring
    const result = await performanceMonitor.measureFunction(
      `api_${key}`,
      async () => {
        let lastError: Error | null = null

        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
          try {
            const data = await requestFn()

            // Mettre en cache
            this.cache.set(key, {
              data,
              timestamp: Date.now(),
              ttl,
            })

            return data
          } catch (error) {
            lastError = error as Error

            if (attempt < this.retryAttempts) {
              await new Promise((resolve) => setTimeout(resolve, this.retryDelay * attempt))
            }
          }
        }

        throw lastError
      },
      "network",
    )

    return result
  }

  /**
   * Intégration Google Calendar
   */
  async syncGoogleCalendar(accessToken: string, calendarId: string) {
    return this.makeRequest(`google_calendar_${calendarId}`, async () => {
      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Google Calendar API error: ${response.statusText}`)
      }

      return response.json()
    })
  }

  /**
   * Créer un événement Google Calendar
   */
  async createGoogleCalendarEvent(
    accessToken: string,
    calendarId: string,
    event: {
      summary: string
      description?: string
      start: { dateTime: string; timeZone: string }
      end: { dateTime: string; timeZone: string }
      attendees?: Array<{ email: string }>
    },
  ) {
    return performanceMonitor.measureFunction(
      "google_calendar_create_event",
      async () => {
        const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event),
        })

        if (!response.ok) {
          throw new Error(`Failed to create calendar event: ${response.statusText}`)
        }

        return response.json()
      },
      "network",
    )
  }

  /**
   * Intégration QuickBooks pour la comptabilité
   */
  async syncQuickBooksCustomers(accessToken: string, companyId: string) {
    return this.makeRequest(`quickbooks_customers_${companyId}`, async () => {
      const baseUrl = this.config.quickbooks.sandbox
        ? "https://sandbox-quickbooks.api.intuit.com"
        : "https://quickbooks.api.intuit.com"

      const response = await fetch(`${baseUrl}/v3/company/${companyId}/customers`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`QuickBooks API error: ${response.statusText}`)
      }

      return response.json()
    })
  }

  /**
   * Créer une facture QuickBooks
   */
  async createQuickBooksInvoice(
    accessToken: string,
    companyId: string,
    invoice: {
      customerId: string
      items: Array<{
        description: string
        amount: number
        quantity: number
      }>
    },
  ) {
    return performanceMonitor.measureFunction(
      "quickbooks_create_invoice",
      async () => {
        const baseUrl = this.config.quickbooks.sandbox
          ? "https://sandbox-quickbooks.api.intuit.com"
          : "https://quickbooks.api.intuit.com"

        const invoiceData = {
          Line: invoice.items.map((item, index) => ({
            Id: index + 1,
            LineNum: index + 1,
            Amount: item.amount * item.quantity,
            DetailType: "SalesItemLineDetail",
            SalesItemLineDetail: {
              ItemRef: {
                value: "1", // ID de l'item par défaut
                name: item.description,
              },
              Qty: item.quantity,
              UnitPrice: item.amount,
            },
          })),
          CustomerRef: {
            value: invoice.customerId,
          },
        }

        const response = await fetch(`${baseUrl}/v3/company/${companyId}/invoice`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(invoiceData),
        })

        if (!response.ok) {
          throw new Error(`Failed to create QuickBooks invoice: ${response.statusText}`)
        }

        return response.json()
      },
      "network",
    )
  }

  /**
   * Envoi de SMS via Twilio
   */
  async sendSMS(to: string, message: string) {
    return performanceMonitor.measureFunction(
      "twilio_send_sms",
      async () => {
        const auth = btoa(`${this.config.twilio.accountSid}:${this.config.twilio.authToken}`)

        const response = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${this.config.twilio.accountSid}/Messages.json`,
          {
            method: "POST",
            headers: {
              Authorization: `Basic ${auth}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              To: to,
              From: this.config.twilio.phoneNumber,
              Body: message,
            }),
          },
        )

        if (!response.ok) {
          throw new Error(`Twilio SMS error: ${response.statusText}`)
        }

        return response.json()
      },
      "network",
    )
  }

  /**
   * Géocodage d'adresses avec Google Maps
   */
  async geocodeAddress(address: string) {
    return this.makeRequest(
      `geocode_${encodeURIComponent(address)}`,
      async () => {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${this.config.maps.googleMapsKey}`,
        )

        if (!response.ok) {
          throw new Error(`Geocoding error: ${response.statusText}`)
        }

        const data = await response.json()

        if (data.status !== "OK") {
          throw new Error(`Geocoding failed: ${data.status}`)
        }

        return data.results[0]
      },
      600000, // Cache 10 minutes pour les adresses
    )
  }

  /**
   * Calcul de distance entre deux points
   */
  async calculateDistance(origin: string, destination: string) {
    return this.makeRequest(
      `distance_${encodeURIComponent(origin)}_${encodeURIComponent(destination)}`,
      async () => {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${this.config.maps.googleMapsKey}`,
        )

        if (!response.ok) {
          throw new Error(`Distance calculation error: ${response.statusText}`)
        }

        const data = await response.json()

        if (data.status !== "OK") {
          throw new Error(`Distance calculation failed: ${data.status}`)
        }

        return data.rows[0].elements[0]
      },
      3600000, // Cache 1 heure pour les distances
    )
  }

  /**
   * Validation d'adresse canadienne
   */
  async validateCanadianAddress(address: {
    street: string
    city: string
    province: string
    postalCode: string
  }) {
    return this.makeRequest(
      `validate_address_${JSON.stringify(address)}`,
      async () => {
        // Utiliser l'API de Postes Canada ou un service similaire
        const fullAddress = `${address.street}, ${address.city}, ${address.province} ${address.postalCode}, Canada`

        const geocodeResult = await this.geocodeAddress(fullAddress)

        // Vérifier que l'adresse est au Canada
        const isCanadian = geocodeResult.address_components.some(
          (component: any) => component.types.includes("country") && component.short_name === "CA",
        )

        if (!isCanadian) {
          throw new Error("Address is not in Canada")
        }

        return {
          isValid: true,
          formatted: geocodeResult.formatted_address,
          coordinates: geocodeResult.geometry.location,
          components: geocodeResult.address_components,
        }
      },
      86400000, // Cache 24 heures pour les validations d'adresse
    )
  }

  /**
   * Envoi de rappels automatiques
   */
  async sendAppointmentReminder(
    clientPhone: string,
    appointmentDetails: {
      date: string
      time: string
      service: string
      location: string
    },
  ) {
    const message = `Rappel: Vous avez un rendez-vous ${appointmentDetails.service} le ${appointmentDetails.date} à ${appointmentDetails.time} chez ${appointmentDetails.location}. Pour annuler, répondez STOP.`

    return this.sendSMS(clientPhone, message)
  }

  /**
   * Synchronisation des contacts avec le carnet d'adresses
   */
  async syncContacts(accessToken: string) {
    return this.makeRequest(
      "google_contacts",
      async () => {
        const response = await fetch(
          "https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        )

        if (!response.ok) {
          throw new Error(`Google Contacts API error: ${response.statusText}`)
        }

        return response.json()
      },
      1800000, // Cache 30 minutes
    )
  }

  /**
   * Nettoyage du cache
   */
  clearCache(pattern?: string) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key)
        }
      }
    } else {
      this.cache.clear()
    }
  }

  /**
   * Statistiques du cache
   */
  getCacheStats() {
    const now = Date.now()
    let validEntries = 0
    let expiredEntries = 0

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp < entry.ttl) {
        validEntries++
      } else {
        expiredEntries++
      }
    }

    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries,
      hitRate: validEntries / (validEntries + expiredEntries) || 0,
    }
  }
}

// Configuration par défaut (à remplacer par les vraies clés en production)
const defaultConfig: APIConfig = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    redirectUri: process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/auth/google/callback",
  },
  quickbooks: {
    clientId: process.env.QUICKBOOKS_CLIENT_ID || "",
    clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET || "",
    sandbox: process.env.NODE_ENV !== "production",
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || "",
    authToken: process.env.TWILIO_AUTH_TOKEN || "",
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || "",
  },
  maps: {
    googleMapsKey: process.env.GOOGLE_MAPS_API_KEY || "",
  },
}

// Instance singleton
export const apiIntegrations = new APIIntegrationManager(defaultConfig)

/**
 * Hook React pour les intégrations API
 */
export function useAPIIntegrations() {
  return {
    syncGoogleCalendar: apiIntegrations.syncGoogleCalendar.bind(apiIntegrations),
    createCalendarEvent: apiIntegrations.createGoogleCalendarEvent.bind(apiIntegrations),
    sendSMS: apiIntegrations.sendSMS.bind(apiIntegrations),
    geocodeAddress: apiIntegrations.geocodeAddress.bind(apiIntegrations),
    validateAddress: apiIntegrations.validateCanadianAddress.bind(apiIntegrations),
    sendReminder: apiIntegrations.sendAppointmentReminder.bind(apiIntegrations),
    clearCache: apiIntegrations.clearCache.bind(apiIntegrations),
    getCacheStats: apiIntegrations.getCacheStats.bind(apiIntegrations),
  }
}
