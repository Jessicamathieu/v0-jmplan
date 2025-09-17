"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, FileSpreadsheet, Filter } from "lucide-react"
import { AddExpenseDialog } from "./add-expense-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ExpensesHeader() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [filterType, setFilterType] = useState<"all" | "client" | "service" | "date">("all")

  const exportToQuickbooks = () => {
    // Simulation d'export vers QuickBooks
    alert("Export vers QuickBooks effectué avec succès")
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
      <div className="flex items-center gap-2 flex-1">
        <div className="relative w-full max-w-md">
          <Input
            placeholder="Rechercher une dépense..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filtrer par</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => setFilterType("all")}>Toutes les dépenses</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType("client")}>Client</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType("service")}>Service</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType("date")}>Date</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={exportToQuickbooks}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Exporter vers QuickBooks
        </Button>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle dépense
        </Button>
      </div>
      <AddExpenseDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
    </div>
  )
}
