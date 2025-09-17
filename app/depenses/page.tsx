"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreditCard, TrendingDown, Receipt, PieChart } from "lucide-react"

export default function DepensesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-secondary">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Dépenses
            </h1>
            <Badge className="bg-gradient-to-r from-primary to-secondary text-white">Premium</Badge>
          </div>
          <p className="text-gray-600">Gérez vos dépenses professionnelles efficacement</p>
        </div>

        {/* Coming Soon */}
        <Card className="border-0 shadow-lg bg-white">
          <CardContent className="p-12 text-center">
            <CreditCard className="h-16 w-16 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Module en développement</h3>
            <p className="text-gray-600 mb-6">
              Le gestionnaire de dépenses premium arrive bientôt avec des fonctionnalités avancées.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="p-4 bg-primary/5 rounded-lg">
                <Receipt className="h-8 w-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold text-primary">Scan de reçus</h4>
                <p className="text-sm text-gray-600">OCR automatique des factures</p>
              </div>
              <div className="p-4 bg-secondary/5 rounded-lg">
                <PieChart className="h-8 w-8 text-secondary mx-auto mb-2" />
                <h4 className="font-semibold text-secondary">Catégorisation</h4>
                <p className="text-sm text-gray-600">Classification intelligente</p>
              </div>
              <div className="p-4 bg-green-500/5 rounded-lg">
                <TrendingDown className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-green-600">Rapports fiscaux</h4>
                <p className="text-sm text-gray-600">Export comptable automatique</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
