export interface Expense {
  id: number
  description: string
  amount: number
  date: string // Date de la dépense
  clientId?: number
  clientName?: string
  serviceId?: number
  serviceName?: string
  details?: string
  receiptImage?: string
  isSyncedToQuickBooks: boolean
}
