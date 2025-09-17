"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import { AddClientDialog } from "./add-client-dialog"

interface ClientsHeaderProps {
  onSearch?: (query: string) => void
  onClientAdded?: () => void
}

export function ClientsHeader({ onSearch, onClientAdded }: ClientsHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    onSearch?.(value)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
      <div className="relative w-full sm:w-96">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un client..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 premium-border"
        />
      </div>
      <div className="flex gap-2">
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:shadow-xl"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nouveau client
        </Button>
      </div>
      <AddClientDialog isOpen={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} onSuccess={onClientAdded} />
    </div>
  )
}
