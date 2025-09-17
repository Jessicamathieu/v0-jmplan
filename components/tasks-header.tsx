"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Filter, Calendar } from "lucide-react"
import { AddTaskDialog } from "./add-task-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function TasksHeader() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [filterType, setFilterType] = useState<"all" | "today" | "upcoming" | "completed">("all")

  const syncWithCalendar = () => {
    // Simulation de synchronisation avec le calendrier
    alert("Synchronisation avec le calendrier effectuée avec succès")
    window.location.reload()
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
      <div className="flex items-center gap-2 flex-1">
        <div className="relative w-full max-w-md">
          <Input
            placeholder="Rechercher une tâche..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filtrer par</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => setFilterType("all")}>Toutes les tâches</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType("today")}>Aujourd'hui</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType("upcoming")}>À venir</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType("completed")}>Terminées</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={syncWithCalendar}>
          <Calendar className="mr-2 h-4 w-4" />
          Synchroniser avec le calendrier
        </Button>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle tâche
        </Button>
      </div>
      <AddTaskDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
    </div>
  )
}
