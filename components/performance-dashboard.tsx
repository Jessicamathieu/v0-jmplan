"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, Zap, Clock, TrendingUp, AlertTriangle, CheckCircle, BarChart3, Gauge, RefreshCw } from "lucide-react"
import { performanceMonitor, usePerformanceMonitor } from "@/lib/performance-monitor"

/**
 * Dashboard de performance pour surveiller les métriques en temps réel
 * Affiche les Web Vitals, temps de réponse, et statistiques d'utilisation
 */
export function PerformanceDashboard() {
  const [stats, setStats] = useState(performanceMonitor.getStats())
  const [webVitals, setWebVitals] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { measureFunction } = usePerformanceMonitor("PerformanceDashboard")

  useEffect(() => {
    loadPerformanceData()

    // Actualiser toutes les 30 secondes
    const interval = setInterval(loadPerformanceData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadPerformanceData = async () => {
    setIsLoading(true)

    try {
      await measureFunction("load_performance_data", async () => {
        const currentStats = performanceMonitor.getStats()
        setStats(currentStats)

        // Charger les Web Vitals
        const vitals = await performanceMonitor.getWebVitals()
        setWebVitals(vitals)
      })
    } catch (error) {
      console.error("Erreur lors du chargement des données de performance:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getPerformanceScore = () => {
    if (!webVitals) return 0

    let score = 100

    // Pénalités basées sur les seuils Web Vitals
    if (webVitals.FCP > 1800) score -= 20
    if (webVitals.LCP > 2500) score -= 25
    if (webVitals.FID > 100) score -= 25
    if (webVitals.CLS > 0.1) score -= 30

    return Math.max(0, score)
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { variant: "default" as const, text: "Excellent", color: "bg-green-500" }
    if (score >= 70) return { variant: "secondary" as const, text: "Bon", color: "bg-yellow-500" }
    return { variant: "destructive" as const, text: "À améliorer", color: "bg-red-500" }
  }

  const performanceScore = getPerformanceScore()
  const scoreBadge = getScoreBadge(performanceScore)

  return (
    <div className="space-y-6">
      {/* Header avec score global */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary">Performance Dashboard</h2>
          <p className="text-muted-foreground">Surveillance en temps réel des performances</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className={`text-3xl font-bold ${getScoreColor(performanceScore)}`}>{performanceScore}</div>
            <Badge variant={scoreBadge.variant} className="mt-1">
              {scoreBadge.text}
            </Badge>
          </div>

          <Button variant="outline" onClick={loadPerformanceData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="vitals">Web Vitals</TabsTrigger>
          <TabsTrigger value="metrics">Métriques</TabsTrigger>
          <TabsTrigger value="slowest">Plus lents</TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Temps de Chargement</CardTitle>
                <Clock className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.averages.loading?.toFixed(0) || 0}ms</div>
                <p className="text-xs text-muted-foreground">Moyenne sur {stats.counts.loading || 0} mesures</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Interactions</CardTitle>
                <Zap className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.averages.interaction?.toFixed(0) || 0}ms</div>
                <p className="text-xs text-muted-foreground">Moyenne sur {stats.counts.interaction || 0} mesures</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rendu</CardTitle>
                <Activity className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{stats.averages.rendering?.toFixed(1) || 0}ms</div>
                <p className="text-xs text-muted-foreground">Moyenne sur {stats.counts.rendering || 0} mesures</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Réseau</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.averages.network?.toFixed(0) || 0}ms</div>
                <p className="text-xs text-muted-foreground">Moyenne sur {stats.counts.network || 0} mesures</p>
              </CardContent>
            </Card>
          </div>

          {/* Graphique de performance */}
          <Card>
            <CardHeader>
              <CardTitle>Tendances de Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Chargement</span>
                    <span>{stats.averages.loading?.toFixed(0) || 0}ms</span>
                  </div>
                  <Progress value={Math.min((stats.averages.loading || 0) / 30, 100)} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Interactions</span>
                    <span>{stats.averages.interaction?.toFixed(0) || 0}ms</span>
                  </div>
                  <Progress value={Math.min((stats.averages.interaction || 0) / 5, 100)} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Réseau</span>
                    <span>{stats.averages.network?.toFixed(0) || 0}ms</span>
                  </div>
                  <Progress value={Math.min((stats.averages.network || 0) / 20, 100)} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Web Vitals */}
        <TabsContent value="vitals" className="space-y-4">
          {webVitals ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">First Contentful Paint</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{webVitals.FCP.toFixed(0)}ms</div>
                    {webVitals.FCP <= 1800 ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Seuil: ≤ 1.8s</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Largest Contentful Paint</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{webVitals.LCP.toFixed(0)}ms</div>
                    {webVitals.LCP <= 2500 ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Seuil: ≤ 2.5s</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">First Input Delay</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{webVitals.FID.toFixed(0)}ms</div>
                    {webVitals.FID <= 100 ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Seuil: ≤ 100ms</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Cumulative Layout Shift</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{webVitals.CLS.toFixed(3)}</div>
                    {webVitals.CLS <= 0.1 ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Seuil: ≤ 0.1</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Gauge className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Chargement des Web Vitals...</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Métriques détaillées */}
        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Répartition par Catégorie
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.counts).map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="capitalize">{category}</span>
                      <Badge variant="outline">{count} mesures</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Temps Moyens
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.averages).map(([category, average]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="capitalize">{category}</span>
                      <span className="font-mono text-sm">{average?.toFixed(2) || 0}ms</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Opérations les plus lentes */}
        <TabsContent value="slowest" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Opérations les Plus Lentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.slowest.slice(0, 10).map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <div className="font-medium">{metric.name}</div>
                      <div className="text-sm text-muted-foreground capitalize">{metric.category}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm font-bold">{metric.value.toFixed(2)}ms</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(metric.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}

                {stats.slowest.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4" />
                    <p>Aucune opération lente détectée</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
