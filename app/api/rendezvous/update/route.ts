import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: "ID du rendez-vous requis" }, { status: 400 })
    }

    // Si on modifie la date/heure, vérifier les conflits
    if (updates.date_heure || updates.duree) {
      const existingAppointments = await DatabaseService.getRendezVous()
      const currentAppointment = existingAppointments.find((rdv) => rdv.id === Number.parseInt(id))

      if (!currentAppointment) {
        return NextResponse.json({ error: "Rendez-vous non trouvé" }, { status: 404 })
      }

      const newDateTime = updates.date_heure || currentAppointment.date_heure
      const newDuration = updates.duree || currentAppointment.duree
      const newEmployeId = updates.employe_id !== undefined ? updates.employe_id : currentAppointment.employe_id
      const newSalleId = updates.salle_id !== undefined ? updates.salle_id : currentAppointment.salle_id

      const conflictingAppointment = existingAppointments.find((rdv) => {
        if (rdv.id === Number.parseInt(id)) return false // Ignorer le RDV actuel

        const rdvStart = new Date(rdv.date_heure).getTime()
        const rdvEnd = rdvStart + rdv.duree * 60000
        const newStart = new Date(newDateTime).getTime()
        const newEnd = newStart + newDuration * 60000

        return (
          ((rdv.employe_id === newEmployeId && newEmployeId) || (rdv.salle_id === newSalleId && newSalleId)) &&
          ((newStart >= rdvStart && newStart < rdvEnd) ||
            (newEnd > rdvStart && newEnd <= rdvEnd) ||
            (newStart <= rdvStart && newEnd >= rdvEnd))
        )
      })

      if (conflictingAppointment) {
        return NextResponse.json({ error: "Créneau non disponible - conflit détecté" }, { status: 409 })
      }
    }

    const updatedRendezVous = await DatabaseService.updateRendezVous(Number.parseInt(id), updates)

    return NextResponse.json({
      success: true,
      data: updatedRendezVous,
      message: "Rendez-vous mis à jour avec succès",
    })
  } catch (error) {
    console.error("Erreur lors de la mise à jour du rendez-vous:", error)

    return NextResponse.json(
      {
        error: "Erreur interne du serveur",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}
