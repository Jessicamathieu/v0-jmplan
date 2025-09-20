export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID du rendez-vous requis" }, { status: 400 })
    }

    await DatabaseService.deleteRendezVous(Number.parseInt(id))

    return NextResponse.json({
      success: true,
      message: "Rendez-vous supprimé avec succès",
    })
  } catch (error) {
    console.error("Erreur lors de la suppression du rendez-vous:", error)

    return NextResponse.json(
      {
        error: "Erreur interne du serveur",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}
