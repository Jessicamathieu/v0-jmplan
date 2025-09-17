"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash, Eye } from "lucide-react"
import { getExpenses, deleteExpense } from "@/lib/api-client"
import { EditExpenseDialog } from "./edit-expense-dialog"
import { ViewReceiptDialog } from "./view-receipt-dialog"
import type { Expense } from "@/types/expense"

export function ExpensesTable() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewReceiptDialogOpen, setIsViewReceiptDialogOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)

  useEffect(() => {
    const fetchExpenses = async () => {
      const data = await getExpenses()
      setExpenses(data)
    }

    fetchExpenses()
  }, [])

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("fr-CA", {
      style: "currency",
      currency: "CAD",
    }).format(amount)
  }

  const handleEditClick = (expense: Expense) => {
    setSelectedExpense(expense)
    setIsEditDialogOpen(true)
  }

  const handleViewReceiptClick = (expense: Expense) => {
    setSelectedExpense(expense)
    setIsViewReceiptDialogOpen(true)
  }

  const handleDeleteClick = async (expenseId: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette dépense ?")) {
      await deleteExpense(expenseId)
      setExpenses(expenses.filter((expense) => expense.id !== expenseId))
    }
  }

  // Calcul du total des dépenses
  const totalAmount = expenses.reduce((acc, expense) => acc + expense.amount, 0)

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Client/Service</TableHead>
              <TableHead>Synchronisé</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>{formatDate(expense.date)}</TableCell>
                <TableCell className="font-medium">{expense.description}</TableCell>
                <TableCell>{formatAmount(expense.amount)}</TableCell>
                <TableCell>
                  {expense.clientName && (
                    <Badge variant="outline" className="mr-2">
                      {expense.clientName}
                    </Badge>
                  )}
                  {expense.serviceName && (
                    <Badge variant="outline" className="bg-primary/10">
                      {expense.serviceName}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {expense.isSyncedToQuickBooks ? (
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      Synchronisé
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                      En attente
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {expense.receiptImage && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewReceiptClick(expense)}
                      title="Voir le reçu"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => handleEditClick(expense)} title="Modifier">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(expense.id)} title="Supprimer">
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {expenses.length === 0 && (
          <div className="py-24 text-center text-muted-foreground">Aucune dépense enregistrée</div>
        )}
      </div>

      {expenses.length > 0 && (
        <div className="bg-card rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total des dépenses</span>
            <span className="font-bold text-lg">{formatAmount(totalAmount)}</span>
          </div>
        </div>
      )}

      {selectedExpense && (
        <>
          <EditExpenseDialog
            isOpen={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            expense={selectedExpense}
          />
          <ViewReceiptDialog
            isOpen={isViewReceiptDialogOpen}
            onClose={() => setIsViewReceiptDialogOpen(false)}
            expense={selectedExpense}
          />
        </>
      )}
    </div>
  )
}
