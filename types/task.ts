export interface Task {
  id: number
  title: string
  description: string
  completed: boolean
  dueDate: string | null
  location: string | null
  clientId?: number
  hoursEntries?: number[] // IDs des entrées d'heures associées
  customPrice?: number
  serviceDate?: string // Date réelle du service (distincte de la date de facturation)
  details?: string // Informations complémentaires
  billingType?: "daily" | "global" // Type de facturation (par jour ou globale)
  services?: number[] // IDs des services associés à cette tâche
  billingPeriod?: {
    startDate: string
    endDate: string
  }
}
