"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getDashboardStats } from "@/lib/api-client"
import type { DashboardStats } from "@/types"
import { Users, Calendar, DollarSign, Clock, CheckCircle, Receipt, TrendingUp, Activity } from "lucide-react"

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats()
        setStats(data)
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Erreur lors du chargement des données</p>
      </div>
    )
  }

  const statCards = [
    {
      title: "Total Clients",
      value: stats?.totalClients ?? 0,
      icon: Users,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: "Rendez-vous",
      value: stats?.totalAppointments ?? 0,
      icon: Calendar,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      title: "Revenus",
      value: `${stats?.totalRevenue ?? 0}€`,
      icon: DollarSign,
      color: "from-primary to-secondary",
      bgColor: "bg-pink-50",
      textColor: "text-primary",
    },
    {
      title: "En Attente",
      value: stats?.pendingAppointments ?? 0,
      icon: Clock,
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600",
    },
    {
      title: "Tâches Terminées",
      value: stats?.completedTasks ?? 0,
      icon: CheckCircle,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      title: "Dépenses",
      value: `${stats?.totalExpenses ?? 0}€`,
      icon: Receipt,
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      textColor: "text-red-600",
    },
  ]

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Bienvenue dans votre espace de gestion JM Plan</p>
        </div>
        <Badge className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-2">
          <Activity className="h-4 w-4 mr-2" />
          Premium
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat, index) => (
          <Card
            key={index}
            className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.textColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className={`flex items-center text-sm ${stat.textColor}`}>
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +12%
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Par rapport au mois dernier</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-primary" />
              Prochains Rendez-vous
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Marie Dubois</p>
                  <p className="text-sm text-gray-500">Consultation - 10:00</p>
                </div>
                <Badge variant="outline">Confirmé</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Pierre Martin</p>
                  <p className="text-sm text-gray-500">Suivi - 14:30</p>
                </div>
                <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                  En attente
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-primary" />
              Tâches Récentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Préparer rapport mensuel</p>
                  <p className="text-sm text-gray-500">Échéance: 25 Dec</p>
                </div>
                <Badge className="bg-red-100 text-red-600">Haute</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Appeler Marie Dubois</p>
                  <p className="text-sm text-gray-500">Terminé</p>
                </div>
                <Badge className="bg-green-100 text-green-600">Terminé</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
