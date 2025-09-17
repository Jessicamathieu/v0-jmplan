"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, FileSpreadsheet } from "lucide-react"
import { AddHoursDialog } from "./add-hours-dialog"

export function HoursHeader() {
  const [timeRange, setTimeRange] = useState("week")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const getWeekNumber = (date: Date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
  }

  const currentWeek = getWeekNumber(new Date())
  const currentMonth = new Date().toLocaleString("fr-FR", { month: "long" })

  const getTimeRangeText = () => {
    if (timeRange === "week") {
      return `Semaine ${currentWeek}`
    } else if (timeRange === "month") {
      return `${currentMonth} ${new Date().getFullYear()}`
    } else {
      return `${new Date().getFullYear()}`
    }
  }

  const exportToQuickbooks = () => {
    // Simulation d'export vers QuickBooks
    alert("Export vers QuickBooks effectué avec succès")
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
      <div className="flex items-center gap-4">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Période" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Semaine</SelectItem>
            <SelectItem value="month">Mois</SelectItem>
            <SelectItem value="year">Année</SelectItem>
          </SelectContent>
        </Select>
        <span className="font-medium">{getTimeRangeText()}</span>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={exportToQuickbooks}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Exporter vers QuickBooks
        </Button>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter des heures
        </Button>
      </div>
      <AddHoursDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
    </div>
  )
}
