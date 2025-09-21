export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"
import type { RendezVousInsert } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validation des données requises
    const { client_id, service_id, date_heure, duree } = body

    if (!client_id || !service_id || !date_heure || !duree) {
      return NextResponse.json(
        { error: "Données manquantes: client_id, service_id, date_heure et duree sont requis" },
        { status: 400 },
      )
    }

    // Vérifier que le créneau est disponible
    const existingAppointments = await DatabaseService.getRendezVous(
      new Date(date_heure).toISOString(),
      new Date(new Date(date_heure).getTime() + duree * 60000).toISOString(),
    )

    const conflictingAppointment = existingAppointments.find((rdv) => {
      const rdvStart = new Date(rdv.date_heure).getTime()
      const rdvEnd = rdvStart + rdv.duree * 60000
      const newStart = new Date(date_heure).getTime()
      const newEnd = newStart + duree * 60000

      return (
        ((rdv.employe_id === body.employe_id && body.employe_id) ||
          (rdv.salle_id === body.salle_id && body.salle_id)) &&
        ((newStart >= rdvStart && newStart < rdvEnd) ||
          (newEnd > rdvStart && newEnd <= rdvEnd) ||
          (newStart <= rdvStart && newEnd >= rdvEnd))
      )
    })

    if (conflictingAppointment) {
      return NextResponse.json({ error: "Créneau non disponible - conflit détecté" }, { status: 409 })
    }

    // Créer le rendez-vous
    const rendezVousData: RendezVousInsert = {
      client_id: Number.parseInt(client_id),
      service_id: Number.parseInt(service_id),
      employe_id: body.employe_id ? Number.parseInt(body.employe_id) : null,
      salle_id: body.salle_id ? Number.parseInt(body.salle_id) : null,
      date_heure,
      duree: Number.parseInt(duree),
      statut: body.statut || "confirme",
      notes: body.notes || null,
      prix: body.prix ? Number.parseFloat(body.prix) : null,
    }

    const newRendezVous = await DatabaseService.createRendezVous(rendezVousData)

    return NextResponse.json({
      success: true,
      data: newRendezVous,
      message: "Rendez-vous créé avec succès",
    })
  } catch (error) {
    console.error("Erreur lors de la création du rendez-vous:", error)

    return NextResponse.json(
      {
        error: "Erreur interne du serveur",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}
