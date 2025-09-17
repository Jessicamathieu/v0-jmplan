"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import type { Expense } from "@/types/expense"

interface ViewReceiptDialogProps {
  isOpen: boolean
  onClose: () => void
  expense: Expense
}

export function ViewReceiptDialog({ isOpen, onClose, expense }: ViewReceiptDialogProps) {
  const handleDownload = () => {
    if (!expense.receiptImage) return

    // Créer un lien temporaire pour télécharger l'image
    const link = document.createElement("a")
    link.href = expense.receiptImage
    link.download = `recu-${expense.id}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Reçu de dépense</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center">
          {expense.receiptImage ? (
            <div className="max-h-[500px] overflow-auto border rounded-md p-2">
              <img
                src={expense.receiptImage || "/placeholder.svg"}
                alt="Reçu de dépense"
                className="object-contain max-w-full"
              />
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">Aucune image de reçu disponible</div>
          )}

          <div className="mt-4 w-full">
            <h3 className="font-medium mb-2">Détails de la dépense</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="font-medium">Description:</div>
              <div>{expense.description}</div>

              <div className="font-medium">Montant:</div>
              <div>{new Intl.NumberFormat("fr-CA", { style: "currency", currency: "CAD" }).format(expense.amount)}</div>

              <div className="font-medium">Date:</div>
              <div>{new Date(expense.date).toLocaleDateString("fr-FR")}</div>

              {expense.clientName && (
                <>
                  <div className="font-medium">Client:</div>
                  <div>{expense.clientName}</div>
                </>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          {expense.receiptImage && (
            <Button onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Télécharger
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
