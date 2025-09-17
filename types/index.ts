// Types pour les clients
export interface Client {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  postalCode: string
  country: string
  createdAt: Date
  updatedAt: Date
}

// Types pour les services
export interface Service {
  id: string
  name: string
  description: string
  duration: number // en minutes
  price: number
  color: string
  createdAt: Date
  updatedAt: Date
}

// Types pour les rendez-vous
export interface Appointment {
  id: string
  clientId: string
  serviceId: string
  date: Date
  duration: number
  status: "pending" | "confirmed" | "completed" | "cancelled"
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// Types pour les dépenses
export interface Expense {
  id: string
  title: string
  amount: number
  category: string
  date: Date
  description?: string
  receipt?: string | null
  createdAt: Date
  updatedAt: Date
}

// Types pour les heures travaillées
export interface HoursEntry {
  id: string
  date: Date
  startTime: string
  endTime: string
  breakDuration: number // en minutes
  description?: string
  clientId?: string | null
  createdAt: Date
  updatedAt: Date
}

// Types pour les tâches
export interface Task {
  id: string
  title: string
  description?: string
  status: "pending" | "in-progress" | "completed" | "cancelled"
  priority: "low" | "medium" | "high"
  dueDate?: Date
  clientId?: string | null
  createdAt: Date
  updatedAt: Date
}

// Types pour les statistiques du dashboard
export interface DashboardStats {
  totalClients: number
  totalAppointments: number
  totalRevenue: number
  pendingAppointments: number
  completedTasks: number
  totalExpenses: number
}

// Types pour les vues du calendrier
export type CalendarView = "month" | "week" | "day"

// Types pour les données d'import Excel
export interface ImportData {
  clients?: Partial<Client>[]
  services?: Partial<Service>[]
  appointments?: Partial<Appointment>[]
}
