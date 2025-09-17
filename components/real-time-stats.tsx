"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Zap, Star } from "lucide-react"

export function RealTimeStats() {
  const [stats, setStats] = useState({
    activeUsers: 1,
    todayRevenue: 1250.0,
    weeklyGrowth: 15.3,
    satisfaction: 98.5,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        activeUsers: Math.max(1, prev.activeUsers + Math.floor(Math.random() * 3) - 1),
        todayRevenue: prev.todayRevenue + Math.random() * 50,
        weeklyGrowth: Math.max(0, prev.weeklyGrowth + Math.random() * 2 - 1),
        satisfaction: Math.min(100, Math.max(95, prev.satisfaction + Math.random() * 1 - 0.5)),
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="premium-card border-l-4 border-l-primary">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Utilisateurs actifs</p>
              <p className="text-2xl font-bold text-primary">{stats.activeUsers}</p>
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </CardContent>
      </Card>

      <Card className="premium-card border-l-4 border-l-green-500">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Revenus aujourd'hui</p>
              <p className="text-2xl font-bold text-green-600">${stats.todayRevenue.toFixed(0)}</p>
            </div>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="premium-card border-l-4 border-l-blue-500">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Croissance</p>
              <p className="text-2xl font-bold text-blue-600">+{stats.weeklyGrowth.toFixed(1)}%</p>
            </div>
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
              <Zap className="h-3 w-3 mr-1" />
              Semaine
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="premium-card border-l-4 border-l-yellow-500">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Satisfaction</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.satisfaction.toFixed(1)}%</p>
            </div>
            <Star className="h-5 w-5 text-yellow-500 fill-current" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
