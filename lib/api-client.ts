import type { Client, Service, Appointment, DashboardStats } from "@/types"

// Mock data pour les clients
const mockClients: Client[] = [
  {
    id: "1",
    firstName: "Marie",
    lastName: "Dubois",
    email: "marie.dubois@email.com",
    phone: "06 12 34 56 78",
    address: "123 Rue de la Paix",
    city: "Paris",
    postalCode: "75001",
    country: "France",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    firstName: "Pierre",
    lastName: "Martin",
    email: "pierre.martin@email.com",
    phone: "06 98 76 54 32",
    address: "456 Avenue des Champs",
    city: "Lyon",
    postalCode: "69001",
    country: "France",
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20"),
  },
  {
    id: "3",
    firstName: "Sophie",
    lastName: "Bernard",
    email: "sophie.bernard@email.com",
    phone: "06 11 22 33 44",
    address: "789 Boulevard Saint-Michel",
    city: "Marseille",
    postalCode: "13001",
    country: "France",
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-02-01"),
  },
]

// Mock data pour les services
const mockServices: Service[] = [
  {
    id: "1",
    name: "Consultation",
    description: "Consultation générale",
    duration: 60,
    price: 80,
    color: "#E91E63",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    name: "Suivi",
    description: "Séance de suivi",
    duration: 45,
    price: 60,
    color: "#2743E3",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "3",
    name: "Urgence",
    description: "Consultation d'urgence",
    duration: 30,
    price: 100,
    color: "#FF5722",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
]

// Mock data pour les rendez-vous
const mockAppointments: Appointment[] = [
  {
    id: "1",
    clientId: "1",
    serviceId: "1",
    date: new Date("2024-12-20T10:00:00"),
    duration: 60,
    status: "confirmed",
    notes: "Première consultation",
    createdAt: new Date("2024-12-15"),
    updatedAt: new Date("2024-12-15"),
  },
  {
    id: "2",
    clientId: "2",
    serviceId: "2",
    date: new Date("2024-12-21T14:30:00"),
    duration: 45,
    status: "pending",
    notes: "Suivi mensuel",
    createdAt: new Date("2024-12-16"),
    updatedAt: new Date("2024-12-16"),
  },
  {
    id: "3",
    clientId: "3",
    serviceId: "1",
    date: new Date("2024-12-22T09:00:00"),
    duration: 60,
    status: "confirmed",
    notes: "Consultation de contrôle",
    createdAt: new Date("2024-12-17"),
    updatedAt: new Date("2024-12-17"),
  },
]

// Simulation d'un délai réseau
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// API Functions pour les clients
export async function getClients(): Promise<Client[]> {
  await delay(500)
  return mockClients
}

export async function createClient(clientData: Omit<Client, "id" | "createdAt" | "updatedAt">): Promise<Client> {
  await delay(800)
  const newClient: Client = {
    ...clientData,
    id: Date.now().toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  mockClients.push(newClient)
  return newClient
}

// API Functions pour les services
export async function getServices(): Promise<Service[]> {
  await delay(300)
  return mockServices
}

// API Functions pour les rendez-vous
export async function getAppointments(): Promise<Appointment[]> {
  await delay(400)
  return mockAppointments
}

export async function createAppointment(
  appointmentData: Omit<Appointment, "id" | "createdAt" | "updatedAt">,
): Promise<Appointment> {
  await delay(700)
  const newAppointment: Appointment = {
    ...appointmentData,
    id: Date.now().toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  mockAppointments.push(newAppointment)
  return newAppointment
}

// API Function pour les statistiques du dashboard
export async function getDashboardStats(): Promise<DashboardStats> {
  await delay(600)
  return {
    totalClients: mockClients.length,
    totalAppointments: mockAppointments.length,
    totalRevenue: mockAppointments.reduce((sum, apt) => {
      const service = mockServices.find((s) => s.id === apt.serviceId)
      return sum + (service?.price || 0)
    }, 0),
    pendingAppointments: mockAppointments.filter((apt) => apt.status === "pending").length,
    completedTasks: 0,
    totalExpenses: 0,
  }
}
