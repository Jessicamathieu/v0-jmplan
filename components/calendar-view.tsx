"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { getAppointments } from "@/lib/api-client"
import { Card } from "@/components/ui/card"
import type { Appointment } from "@/types"

interface CalendarViewProps {
  view: string
  currentDate: Date
  onViewChange?: (view: string) => void
  onDateChange?: (date: Date) => void
}

export function CalendarView({ view, currentDate, onViewChange, onDateChange }: CalendarViewProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true)
      const data = await getAppointments()
      setAppointments(data)
      setLoading(false)
    }

    fetchAppointments()
  }, [])

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">Chargement du calendrier...</p>
      </Card>
    )
  }

  const renderView = () => {
    if (view === "week") {
      return <WeekView currentDate={currentDate} appointments={appointments} />
    }

    if (view === "month") {
      return <MonthView currentDate={currentDate} appointments={appointments} />
    }

    if (view === "day") {
      return <DayView currentDate={currentDate} appointments={appointments} />
    }

    return <WeekView currentDate={currentDate} appointments={appointments} />
  }

  return renderView()
}

function WeekView({ currentDate, appointments }: { currentDate: Date; appointments: Appointment[] }) {
  const getDaysInWeek = () => {
    const startOfWeek = new Date(currentDate)
    const day = currentDate.getDay()
    const diff = day === 0 ? 6 : day - 1
    startOfWeek.setDate(currentDate.getDate() - diff)

    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      days.push(day)
    }

    return days
  }

  const getHoursInDay = () => {
    const hours = []
    for (let i = 8; i < 20; i++) {
      hours.push(i)
    }
    return hours
  }

  const formatDayHeader = (date: Date) => {
    const weekday = new Intl.DateTimeFormat("fr-FR", {
      weekday: "short",
    }).format(date)

    const day = date.getDate()

    return { weekday, day }
  }

  const getAppointmentsForSlot = (day: Date, hour: number) => {
    return appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.date)
      return (
        appointmentDate.getDate() === day.getDate() &&
        appointmentDate.getMonth() === day.getMonth() &&
        appointmentDate.getFullYear() === day.getFullYear() &&
        appointmentDate.getHours() === hour
      )
    })
  }

  return (
    <Card className="overflow-hidden shadow-xl border-0 bg-white">
      {/* En-têtes des jours */}
      <div className="grid grid-cols-8 border-b">
        <div className="p-4 border-r bg-gradient-to-r from-primary/5 to-secondary/5"></div>
        {getDaysInWeek().map((day, index) => {
          const { weekday, day: dayNum } = formatDayHeader(day)
          const isToday = new Date().toDateString() === day.toDateString()

          return (
            <div
              key={index}
              className={cn(
                "p-4 text-center border-r transition-all duration-200",
                isToday
                  ? "bg-gradient-to-br from-primary/10 to-secondary/10"
                  : "bg-gradient-to-r from-primary/5 to-secondary/5",
              )}
            >
              <div className="font-medium text-sm text-primary uppercase tracking-wide">{weekday}</div>
              <div
                className={cn(
                  "mt-1 font-bold text-2xl transition-all duration-200",
                  isToday ? "text-primary scale-110" : "text-gray-700",
                )}
              >
                {dayNum}
              </div>
            </div>
          )
        })}
      </div>

      {/* Grille des heures */}
      <div className="overflow-y-auto max-h-[600px]">
        {getHoursInDay().map((hour, hourIndex) => (
          <div key={hourIndex} className="grid grid-cols-8 border-t">
            <div className="p-3 text-sm font-medium text-primary border-r flex items-center justify-end bg-gradient-to-r from-primary/5 to-secondary/5">
              {hour}:00
            </div>

            {getDaysInWeek().map((day, dayIndex) => {
              const slotAppointments = getAppointmentsForSlot(day, hour)
              const isToday = new Date().toDateString() === day.toDateString()

              return (
                <div
                  key={dayIndex}
                  className={cn(
                    "p-2 border-r min-h-[60px] relative cursor-pointer transition-all duration-200",
                    isToday ? "bg-primary/5" : "",
                    "hover:bg-primary/10",
                  )}
                >
                  {slotAppointments.map((appointment, index) => (
                    <div
                      key={index}
                      className="text-xs p-2 rounded-lg shadow-lg bg-gradient-to-r from-primary to-secondary text-white border-l-4 border-primary mb-1"
                    >
                      <div className="font-semibold">Client #{appointment.clientId}</div>
                      <div className="text-xs opacity-90">{appointment.duration}min</div>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </Card>
  )
}

function MonthView({ currentDate, appointments }: { currentDate: Date; appointments: Appointment[] }) {
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    const firstDayOfWeek = firstDay.getDay()
    const daysFromPrevMonth = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1

    const days = []

    // Jours du mois précédent
    const prevMonth = new Date(year, month, 0)
    const prevMonthDays = prevMonth.getDate()

    for (let i = prevMonthDays - daysFromPrevMonth + 1; i <= prevMonthDays; i++) {
      const day = new Date(year, month - 1, i)
      days.push({ day, isCurrentMonth: false })
    }

    // Jours du mois actuel
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const day = new Date(year, month, i)
      days.push({ day, isCurrentMonth: true })
    }

    // Jours du mois suivant
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      const day = new Date(year, month + 1, i)
      days.push({ day, isCurrentMonth: false })
    }

    return days
  }

  const getAppointmentsForDay = (day: Date) => {
    return appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.date)
      return (
        appointmentDate.getDate() === day.getDate() &&
        appointmentDate.getMonth() === day.getMonth() &&
        appointmentDate.getFullYear() === day.getFullYear()
      )
    })
  }

  return (
    <Card className="overflow-hidden shadow-xl border-0 bg-white">
      {/* En-têtes des jours */}
      <div className="grid grid-cols-7 border-b bg-gradient-to-r from-primary/5 to-secondary/5">
        {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day, index) => (
          <div key={index} className="p-4 text-center font-semibold text-primary uppercase tracking-wide">
            {day}
          </div>
        ))}
      </div>

      {/* Grille des jours */}
      <div className="grid grid-cols-7 auto-rows-fr">
        {getDaysInMonth().map(({ day, isCurrentMonth }, index) => {
          const isToday = new Date().toDateString() === day.toDateString()
          const dayAppointments = getAppointmentsForDay(day)

          return (
            <div
              key={index}
              className={cn(
                "min-h-[140px] p-3 border-b border-r relative cursor-pointer transition-all duration-200 hover:bg-primary/5",
                isCurrentMonth ? "bg-white" : "bg-gray-50/50 text-gray-400",
                isToday ? "bg-gradient-to-br from-primary/10 to-secondary/10 ring-2 ring-primary/20" : "",
              )}
            >
              <div className={cn("font-semibold text-right mb-2 text-lg", isToday ? "text-primary font-bold" : "")}>
                {day.getDate()}
              </div>

              <div className="space-y-1 overflow-y-auto max-h-[80px]">
                {dayAppointments.slice(0, 3).map((appointment, idx) => (
                  <div
                    key={idx}
                    className="text-xs p-2 rounded-lg truncate border-l-4 shadow-sm bg-gradient-to-r from-primary to-secondary text-white"
                  >
                    <div className="font-medium">Client #{appointment.clientId}</div>
                    <div className="truncate">{appointment.duration}min</div>
                  </div>
                ))}

                {dayAppointments.length > 3 && (
                  <div className="text-xs text-center text-primary font-medium mt-2 p-1 bg-primary/10 rounded">
                    +{dayAppointments.length - 3} autres
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

function DayView({ currentDate, appointments }: { currentDate: Date; appointments: Appointment[] }) {
  const getHoursInDay = () => {
    const hours = []
    for (let i = 8; i < 20; i++) {
      hours.push(i)
    }
    return hours
  }

  const getAppointmentsForSlot = (day: Date, hour: number) => {
    return appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.date)
      return (
        appointmentDate.getDate() === day.getDate() &&
        appointmentDate.getMonth() === day.getMonth() &&
        appointmentDate.getFullYear() === day.getFullYear() &&
        appointmentDate.getHours() === hour
      )
    })
  }

  return (
    <Card className="overflow-hidden shadow-xl border-0 bg-white">
      {/* En-tête du jour */}
      <div className="p-6 border-b bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="text-center">
          <div className="text-sm text-primary uppercase tracking-wide font-medium">
            {new Intl.DateTimeFormat("fr-FR", { weekday: "long" }).format(currentDate)}
          </div>
          <div className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mt-1">
            {currentDate.getDate()} {new Intl.DateTimeFormat("fr-FR", { month: "long" }).format(currentDate)}
          </div>
        </div>
      </div>

      {/* Grille des heures */}
      <div className="overflow-y-auto max-h-[600px]">
        {getHoursInDay().map((hour, hourIndex) => (
          <div key={hourIndex} className="flex border-t">
            <div className="p-4 text-sm font-medium text-primary border-r w-24 flex items-center justify-end bg-gradient-to-r from-primary/5 to-secondary/5">
              {hour}:00
            </div>

            <div className="flex-1 p-2 min-h-[50px] relative cursor-pointer transition-all duration-200 hover:bg-primary/10">
              {getAppointmentsForSlot(currentDate, hour).map((appointment, index) => (
                <div
                  key={index}
                  className="text-xs p-2 rounded-lg shadow-lg bg-gradient-to-r from-primary to-secondary text-white border-l-4 border-primary mb-1"
                >
                  <div className="font-semibold">Client #{appointment.clientId}</div>
                  <div className="text-xs opacity-90">{appointment.duration}min</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
