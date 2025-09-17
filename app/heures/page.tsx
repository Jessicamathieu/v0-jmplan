"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, TrendingUp, Calendar, DollarSign } from "lucide-react"

export default function HeuresPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-secondary">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Pointeur d'heures
            </h1>
            <Badge className="bg-gradient-to-r from-primary to-secondary text-white">Premium</Badge>
          </div>
          <p className="text-gray-600">Suivez votre temps de travail avec précision</p>
        </div>

        {/* Coming Soon */}
        <Card className="border-0 shadow-lg bg-white">
          <CardContent className="p-12 text-center">
            <Clock className="h-16 w-16 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Bientôt disponible</h3>
            <p className="text-gray-600 mb-6">
              Le pointeur d'heures premium arrive bientôt avec toutes les fonctionnalités avancées.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="p-4 bg-primary/5 rounded-lg">
                <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold text-primary">Suivi automatique</h4>
                <p className="text-sm text-gray-600">Enregistrement automatique du temps</p>
              </div>
              <div className="p-4 bg-secondary/5 rounded-lg">
                <Calendar className="h-8 w-8 text-secondary mx-auto mb-2" />
                <h4 className="font-semibold text-secondary">Rapports détaillés</h4>
                <p className="text-sm text-gray-600">Analyses complètes par période</p>
              </div>
              <div className="p-4 bg-green-500/5 rounded-lg">
                <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-green-600">Facturation intégrée</h4>
                <p className="text-sm text-gray-600">Calcul automatique des revenus</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
