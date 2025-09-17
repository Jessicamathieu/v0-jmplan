"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Trash, MapPin, Phone, Mail, User } from "lucide-react"
import { getClients, deleteClient } from "@/lib/api-client"
import { EditClientDialog } from "./edit-client-dialog"
import type { Client } from "@/types"

export function ClientsList() {
  const [clients, setClients] = useState<Client[]>([])
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true)
      try {
        const data = await getClients()
        setClients(data)
      } catch (error) {
        console.error("Erreur lors du chargement des clients:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchClients()
  }, [])

  const handleEditClick = (client: Client) => {
    setSelectedClient(client)
    setIsEditDialogOpen(true)
  }

  const handleDeleteClick = async (clientId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) {
      try {
        await deleteClient(clientId)
        setClients(clients.filter((client) => client.id !== clientId))
      } catch (error) {
        console.error("Erreur lors de la suppression:", error)
        alert("Erreur lors de la suppression du client")
      }
    }
  }

  const openMap = (address: string) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, "_blank")
  }

  if (loading) {
    return (
      <div className="bg-card rounded-lg shadow-sm p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Chargement des clients...</p>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-lg shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Adresse</TableHead>
            <TableHead>Points fidélité</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">
                      {client.prenom} {client.nom}
                    </div>
                    {client.date_naissance && (
                      <div className="text-sm text-muted-foreground">
                        Né(e) le {new Date(client.date_naissance).toLocaleDateString("fr-CA")}
                      </div>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center">
                    <Phone className="h-3 w-3 mr-2" />
                    <span className="text-sm">{client.telephone}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-3 w-3 mr-2" />
                    <span className="text-sm">{client.email}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <MapPin
                    className="h-4 w-4 mr-2 text-muted-foreground cursor-pointer hover:text-primary"
                    onClick={() => openMap(client.adresse)}
                  />
                  <span className="text-sm">{client.adresse}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{client.points_fidelite}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">pts</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => handleEditClick(client)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(client.id)}>
                  <Trash className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {clients.length === 0 && (
        <div className="py-24 text-center text-muted-foreground">
          <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Aucun client trouvé</p>
        </div>
      )}
      {selectedClient && (
        <EditClientDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          client={selectedClient}
          onSuccess={() => {
            // Recharger la liste
            getClients().then(setClients)
          }}
        />
      )}
    </div>
  )
}
