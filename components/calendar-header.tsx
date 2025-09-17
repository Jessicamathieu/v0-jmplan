"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { AddAppointmentDialog } from "./add-appointment-dialog"
import { useState } from "react"

interface CalendarHeaderProps {
  currentDate: Date
  view: string
  onDateChange: (date: Date) => void
  onViewChange: (view: string) => void
}

export function CalendarHeader({ currentDate, view, onDateChange, onViewChange }: CalendarHeaderProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)

    if (view === "month") {
      newDate.setMonth(currentDate.getMonth() + (direction === "next" ? 1 : -1))
    } else if (view === "week") {
      newDate.setDate(currentDate.getDate() + (direction === "next" ? 7 : -7))
    } else if (view === "day") {
      newDate.setDate(currentDate.getDate() + (direction === "next" ? 1 : -1))
    }

    onDateChange(newDate)
  }

  const formatDateHeader = () => {
    if (view === "month") {
      return new Intl.DateTimeFormat("fr-FR", {
        month: "long",
        year: "numeric",
      }).format(currentDate)
    } else if (view === "week") {
      const startOfWeek = new Date(currentDate)
      const day = currentDate.getDay()
      const diff = day === 0 ? 6 : day - 1
      startOfWeek.setDate(currentDate.getDate() - diff)

      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)

      return `${startOfWeek.getDate()} - ${endOfWeek.getDate()} ${new Intl.DateTimeFormat("fr-FR", {
        month: "long",
        year: "numeric",
      }).format(currentDate)}`
    } else {
      return new Intl.DateTimeFormat("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(currentDate)
    }
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={() => navigateDate("prev")} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {formatDateHeader()}
          </h1>

          <Button variant="outline" size="icon" onClick={() => navigateDate("next")} className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Button variant="outline" onClick={() => onDateChange(new Date())} className="text-sm">
          Aujourd'hui
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex rounded-lg border p-1">
          <Button
            variant={view === "day" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewChange("day")}
            className="text-xs"
          >
            Jour
          </Button>
          <Button
            variant={view === "week" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewChange("week")}
            className="text-xs"
          >
            Semaine
          </Button>
          <Button
            variant={view === "month" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewChange("month")}
            className="text-xs"
          >
            Mois
          </Button>
        </div>

        <Button onClick={() => setShowAddDialog(true)} className="bg-gradient-to-r from-primary to-secondary">
          <Plus className="h-4 w-4 mr-2" />
          Nouveau RDV
        </Button>
      </div>

      <AddAppointmentDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
    </div>
  )
}
