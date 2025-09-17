export interface Appointment {
  id: number
  clientId: number
  clientName: string
  serviceId: number
  serviceName: string
  startTime: string
  endTime: string
  notes: string
  sendReminder: boolean
  sendConfirmation: boolean
}
