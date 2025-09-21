"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge, Mail, MapPin, Phone, Plus, Search, Users } from "lucide-react"
import { getClients } from "@/lib/database"
import type { Client } from "@/lib/database"

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const loadClients = async () => {
      try {
        const clientsData = await getClients()
        // Map the API response to the Client type
        const mappedClients = clientsData.map((c: any) => ({
          id: c.client_id,
          nom: c.nom,
          prenom: c.prenom ?? "",
          email: c.email ?? null,
          telephone: c.telephone ?? null,
          adresse: c.adresse ?? null,
          date_naissance: c.date_naissance ?? null,
          notes: c.notes ?? null,
          points_fidelite: c.points_fidelite ?? 0,
          actif: c.actif,
          created_at: c.created_at ?? "",
          updated_at: c.updated_at ?? "",
          firstName: c.prenom ?? "",
          lastName: c.nom ?? "",
          phone: c.telephone ?? "",
          city: c.ville ?? "",
          postalCode: c.code_postal ?? "",
        }))
        setClients(mappedClients)
      } catch (error) {
        console.error("Erreur lors du chargement des clients:", error)
      } finally {
        setLoading(false)
      }
    }

    loadClients()
  }, [])

  const filteredClients = clients.filter(
    (client) =>
      client.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.email ?? "").toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Clients
          </h1>
          <p className="text-muted-foreground mt-1">Gérez votre base de clients</p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90">
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Client
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Rechercher un client..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium">Total Clients</div>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">{clients.length}</div>
            <p className="text-xs text-muted-foreground">+2 ce mois-ci</p>
          </div>
        </Card>

        <Card>
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium">Nouveaux ce mois</div>
            <Plus className="h-4 w-4 text-secondary" />
          </div>
          <div>
            <div className="text-2xl font-bold text-secondary">2</div>
            <p className="text-xs text-muted-foreground">+100% vs mois dernier</p>
          </div>
        </Card>

        <Card>
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium">Clients Actifs</div>
            <Users className="h-4 w-4 text-green-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{clients.length}</div>
            <p className="text-xs text-muted-foreground">100% actifs</p>
          </div>
        </Card>
      </div>

      {/* Clients List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredClients.map((client) => (
          <Card key={client.id} className="hover:shadow-lg transition-shadow">
            <div>
              <div className="flex items-center justify-between">
                <div className="text-lg">
                  {client.prenom} {client.nom}
                </div>
                <span className="inline-block px-2 py-1 text-xs font-semibold border rounded border-primary text-primary bg-primary/10">Actif</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                {client.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                {client.phone}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {client.city}, {client.postalCode}
              </div>
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                  Modifier
                </Button>
                <Button size="sm" className="flex-1 bg-gradient-to-r from-primary to-secondary">
                  RDV
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucun client trouvé</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm
              ? "Aucun client ne correspond à votre recherche."
              : "Commencez par ajouter votre premier client."}
          </p>
          <Button className="bg-gradient-to-r from-primary to-secondary">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un client
          </Button>
        </div>
      )}
    </div>
  )
}
