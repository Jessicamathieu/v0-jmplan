import { NextResponse } from "next/server"

// Données simulées pour l'API
const mockData = {
  clients: [
    {
      id: 1,
      name: "Jean Dupont",
      email: "jean.dupont@example.com",
      phone: "514-123-4567",
      address: "123 rue Principale, Montréal, QC H2X 1Y2",
      street: "123 rue Principale",
      city: "Montréal",
      province: "QC",
      postalCode: "H2X 1Y2",
      notes: "Client VIP depuis 2020. Préfère les rendez-vous en matinée.",
    },
    {
      id: 2,
      name: "Marie Tremblay",
      email: "marie.tremblay@example.com",
      phone: "438-987-6543",
      address: "456 avenue des Pins, Québec, QC G1R 2T3",
      street: "456 avenue des Pins",
      city: "Québec",
      province: "QC",
      postalCode: "G1R 2T3",
      notes: "Allergique aux parfums. Toujours ponctuelle.",
    },
  ],
  services: [
    {
      id: 1,
      name: "Consultation Premium",
      description: "Consultation approfondie avec analyse complète",
      rate: 150,
      price: 150,
      duration: 90,
      color: "pink",
      category: "Consultation",
      type: "service",
    },
    {
      id: 2,
      name: "Développement Web",
      description: "Développement d'applications web sur mesure",
      rate: 120,
      price: 120,
      duration: 60,
      color: "purple",
      category: "Développement",
      type: "service",
    },
  ],
  appointments: [],
  tasks: [],
  expenses: [],
  hoursEntries: [],
}

export async function GET() {
  try {
    return NextResponse.json(mockData, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("Erreur API /api/data:", error)
    return NextResponse.json({ error: "Erreur lors du chargement des données" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Simuler la sauvegarde des données
    console.log("Données reçues pour sauvegarde:", body)

    return NextResponse.json({ success: true, message: "Données sauvegardées avec succès" }, { status: 200 })
  } catch (error) {
    console.error("Erreur lors de la sauvegarde:", error)
    return NextResponse.json({ error: "Erreur lors de la sauvegarde des données" }, { status: 500 })
  }
}
