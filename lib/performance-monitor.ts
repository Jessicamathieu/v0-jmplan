/**
 * Moniteur de performance pour optimiser l'expérience utilisateur
 * Suit les métriques clés et fournit des insights pour l'optimisation
 */

interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  category: "loading" | "interaction" | "rendering" | "network"
}

interface PerformanceThresholds {
  loading: number
  interaction: number
  rendering: number
  network: number
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private observers: PerformanceObserver[] = []
  private thresholds: PerformanceThresholds = {
    loading: 2000, // 2s pour le chargement initial
    interaction: 100, // 100ms pour les interactions
    rendering: 16, // 16ms pour 60fps
    network: 1000, // 1s pour les requêtes réseau
  }

  constructor() {
    this.initializeObservers()
  }

  /**
   * Initialise les observateurs de performance
   */
  private initializeObservers(): void {
    if (typeof window === "undefined") return

    // Observer pour les métriques de navigation
    if ("PerformanceObserver" in window) {
      try {
        const navObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            this.recordMetric({
              name: entry.name,
              value: entry.duration,
              timestamp: Date.now(),
              category: "loading",
            })
          })
        })
        navObserver.observe({ entryTypes: ["navigation"] })
        this.observers.push(navObserver)

        // Observer pour les métriques de ressources
        const resourceObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            this.recordMetric({
              name: entry.name,
              value: entry.duration,
              timestamp: Date.now(),
              category: "network",
            })
          })
        })
        resourceObserver.observe({ entryTypes: ["resource"] })
        this.observers.push(resourceObserver)

        // Observer pour les métriques de mesure
        const measureObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            this.recordMetric({
              name: entry.name,
              value: entry.duration,
              timestamp: Date.now(),
              category: "interaction",
            })
          })
        })
        measureObserver.observe({ entryTypes: ["measure"] })
        this.observers.push(measureObserver)
      } catch (error) {
        console.warn("Performance Observer not fully supported:", error)
      }
    }
  }

  /**
   * Enregistre une métrique de performance
   */
  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric)

    // Garder seulement les 1000 dernières métriques
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000)
    }

    // Vérifier les seuils et alerter si nécessaire
    this.checkThresholds(metric)
  }

  /**
   * Mesure le temps d'exécution d'une fonction
   */
  async measureFunction<T>(
    name: string,
    fn: () => Promise<T> | T,
    category: PerformanceMetric["category"] = "interaction",
  ): Promise<T> {
    const startTime = performance.now()

    try {
      const result = await fn()
      const duration = performance.now() - startTime

      this.recordMetric({
        name,
        value: duration,
        timestamp: Date.now(),
        category,
      })

      return result
    } catch (error) {
      const duration = performance.now() - startTime

      this.recordMetric({
        name: `${name}_error`,
        value: duration,
        timestamp: Date.now(),
        category,
      })

      throw error
    }
  }

  /**
   * Mesure le temps de rendu d'un composant
   */
  measureRender(componentName: string): () => void {
    const startTime = performance.now()

    return () => {
      const duration = performance.now() - startTime
      this.recordMetric({
        name: `render_${componentName}`,
        value: duration,
        timestamp: Date.now(),
        category: "rendering",
      })
    }
  }

  /**
   * Vérifie les seuils de performance
   */
  private checkThresholds(metric: PerformanceMetric): void {
    const threshold = this.thresholds[metric.category]

    if (metric.value > threshold) {
      console.warn(`Performance warning: ${metric.name} took ${metric.value.toFixed(2)}ms (threshold: ${threshold}ms)`)

      // En production, envoyer à un service de monitoring
      if (process.env.NODE_ENV === "production") {
        this.sendToMonitoringService(metric)
      }
    }
  }

  /**
   * Envoie les métriques à un service de monitoring
   */
  private sendToMonitoringService(metric: PerformanceMetric): void {
    // Implémenter l'envoi vers un service comme DataDog, New Relic, etc.
    // fetch('/api/metrics', {
    //   method: 'POST',
    //   body: JSON.stringify(metric)
    // })
  }

  /**
   * Obtient les statistiques de performance
   */
  getStats(): {
    averages: Record<string, number>
    counts: Record<string, number>
    slowest: PerformanceMetric[]
  } {
    const averages: Record<string, number> = {}
    const counts: Record<string, number> = {}
    const categoryMetrics: Record<string, number[]> = {}

    this.metrics.forEach((metric) => {
      if (!categoryMetrics[metric.category]) {
        categoryMetrics[metric.category] = []
      }
      categoryMetrics[metric.category].push(metric.value)

      counts[metric.category] = (counts[metric.category] || 0) + 1
    })

    Object.keys(categoryMetrics).forEach((category) => {
      const values = categoryMetrics[category]
      averages[category] = values.reduce((sum, val) => sum + val, 0) / values.length
    })

    const slowest = [...this.metrics].sort((a, b) => b.value - a.value).slice(0, 10)

    return { averages, counts, slowest }
  }

  /**
   * Nettoie les observateurs
   */
  cleanup(): void {
    this.observers.forEach((observer) => observer.disconnect())
    this.observers = []
    this.metrics = []
  }

  /**
   * Obtient les métriques Web Vitals
   */
  getWebVitals(): Promise<{
    FCP: number
    LCP: number
    FID: number
    CLS: number
  }> {
    return new Promise((resolve) => {
      const vitals = {
        FCP: 0,
        LCP: 0,
        FID: 0,
        CLS: 0,
      }

      // First Contentful Paint
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        if (entries.length > 0) {
          vitals.FCP = entries[0].startTime
        }
      })
      fcpObserver.observe({ entryTypes: ["paint"] })

      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        if (entries.length > 0) {
          vitals.LCP = entries[entries.length - 1].startTime
        }
      })
      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] })

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        if (entries.length > 0) {
          vitals.FID = (entries[0] as any).processingStart - entries[0].startTime
        }
      })
      fidObserver.observe({ entryTypes: ["first-input"] })

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0
        list.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        })
        vitals.CLS = clsValue
      })
      clsObserver.observe({ entryTypes: ["layout-shift"] })

      // Résoudre après 5 secondes
      setTimeout(() => {
        fcpObserver.disconnect()
        lcpObserver.disconnect()
        fidObserver.disconnect()
        clsObserver.disconnect()
        resolve(vitals)
      }, 5000)
    })
  }
}

// Instance singleton
export const performanceMonitor = new PerformanceMonitor()

/**
 * Hook React pour mesurer les performances des composants
 */
export function usePerformanceMonitor(componentName: string) {
  const measureRender = performanceMonitor.measureRender(componentName)

  return {
    measureFunction: (name: string, fn: () => any) =>
      performanceMonitor.measureFunction(`${componentName}_${name}`, fn),
    measureRender,
    getStats: () => performanceMonitor.getStats(),
  }
}

/**
 * Décorateur pour mesurer les performances des méthodes
 */
export function measurePerformance(category: PerformanceMetric["category"] = "interaction") {
  return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const className = target.constructor.name
      const methodName = `${className}.${propertyName}`

      return performanceMonitor.measureFunction(methodName, () => method.apply(this, args), category)
    }

    return descriptor
  }
}
