"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Trash } from "lucide-react"
import { getHoursEntries, deleteHoursEntry } from "@/lib/api-client"
import { EditHoursDialog } from "./edit-hours-dialog"
import type { HoursEntry } from "@/types/hours"

export function HoursTable() {
  const [entries, setEntries] = useState<HoursEntry[]>([])
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<HoursEntry | null>(null)

  useEffect(() => {
    const fetchEntries = async () => {
      const data = await getHoursEntries()
      setEntries(data)
    }

    fetchEntries()
  }, [])

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h${mins > 0 ? ` ${mins}m` : ""}`
  }

  const handleEditClick = (entry: HoursEntry) => {
    setSelectedEntry(entry)
    setIsEditDialogOpen(true)
  }

  const handleDeleteClick = async (entryId: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette entrée ?")) {
      await deleteHoursEntry(entryId)
      setEntries(entries.filter((entry) => entry.id !== entryId))
    }
  }

  // Calcul du total des heures
  const totalMinutes = entries.reduce((acc, entry) => acc + entry.durationMinutes, 0)

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Durée</TableHead>
              <TableHead>Facturé</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{formatDate(entry.date)}</TableCell>
                <TableCell className="font-medium">{entry.clientName}</TableCell>
                <TableCell>{entry.serviceName}</TableCell>
                <TableCell>{formatDuration(entry.durationMinutes)}</TableCell>
                <TableCell>
                  {entry.isBilled ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Facturé
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Non facturé
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleEditClick(entry)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(entry.id)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {entries.length === 0 && (
          <div className="py-24 text-center text-muted-foreground">Aucune heure enregistrée</div>
        )}
      </div>

      {entries.length > 0 && (
        <div className="bg-card rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total</span>
            <span className="font-bold text-lg">{formatDuration(totalMinutes)}</span>
          </div>
        </div>
      )}

      {selectedEntry && (
        <EditHoursDialog isOpen={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} entry={selectedEntry} />
      )}
    </div>
  )
}
