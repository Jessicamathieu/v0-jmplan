"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getUpcomingAppointments } from "@/lib/api-client"
import type { Appointment } from "@/types/appointment"

export function UpcomingAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])

  useEffect(() => {
    const fetchAppointments = async () => {
      const data = await getUpcomingAppointments()
      setAppointments(data)
    }

    fetchAppointments()
  }, [])

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    const dateFormat = new Intl.DateTimeFormat("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }).format(date)

    const timeFormat = new Intl.DateTimeFormat("fr-FR", {
      hour: "numeric",
      minute: "numeric",
    }).format(date)

    return `${dateFormat}, ${timeFormat}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prochains rendez-vous</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {appointments.length > 0 ? (
            appointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center border-b pb-4 last:border-0 last:pb-0">
                <div
                  className="w-2 h-10 rounded-full mr-4"
                  style={{
                    backgroundColor:
                      appointment.serviceId === 1 ? "#3b82f6" : appointment.serviceId === 2 ? "#22c55e" : "#a855f7",
                  }}
                />
                <div className="flex-1">
                  <h4 className="text-sm font-medium">{appointment.clientName}</h4>
                  <p className="text-sm text-muted-foreground">{appointment.serviceName}</p>
                </div>
                <div className="text-sm text-muted-foreground">{formatDateTime(appointment.startTime)}</div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground">Aucun rendez-vous à venir</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
