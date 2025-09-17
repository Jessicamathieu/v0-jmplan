export interface HoursEntry {
  id: number
  clientId: number
  clientName: string
  serviceId: number
  serviceName: string
  date: string
  durationMinutes: number
  isBilled: boolean
  notes: string
}
