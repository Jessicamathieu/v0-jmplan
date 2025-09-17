"use client"

import { useState } from "react"
import { CalendarHeader } from "@/components/calendar-header"
import { CalendarView } from "@/components/calendar-view"
import type { CalendarView as CalendarViewType } from "@/types"

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<CalendarViewType>("week")

  return (
    <div className="flex-1 space-y-6 p-6">
      <CalendarHeader currentDate={currentDate} view={view} onDateChange={setCurrentDate} onViewChange={setView} />

      <CalendarView view={view} currentDate={currentDate} onViewChange={setView} onDateChange={setCurrentDate} />
    </div>
  )
}
