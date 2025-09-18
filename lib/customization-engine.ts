"use client"

import React from "react"

/**
 * Moteur de personnalisation pour adapter l'interface aux besoins des utilisateurs
 * Permet la customisation des thèmes, layouts, workflows et préférences
 */

interface ThemeConfig {
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  text: string
  border: string
  success: string
  warning: string
  error: string
  info: string
}

interface LayoutConfig {
  sidebarPosition: "left" | "right"
  sidebarCollapsed: boolean
  headerHeight: number
  footerVisible: boolean
  compactMode: boolean
  gridColumns: number
}

interface WorkflowConfig {
  defaultAppointmentDuration: number
  autoConfirmAppointments: boolean
  requireClientApproval: boolean
  sendReminders: boolean
  reminderTiming: number[] // en minutes avant le RDV
  workingHours: {
    start: string
    end: string
    days: number[] // 0-6, dimanche à samedi
  }
  bufferTime: number // temps entre les RDV
}

interface NotificationConfig {
  email: boolean
  sms: boolean
  push: boolean
  sound: boolean
  vibration: boolean
  channels: {
    appointments: boolean
    clients: boolean
    tasks: boolean
    system: boolean
  }
}

interface UserPreferences {
  theme: ThemeConfig
  layout: LayoutConfig
  workflow: WorkflowConfig
  notifications: NotificationConfig
  language: string
  timezone: string
  dateFormat: string
  timeFormat: "12h" | "24h"
  currency: string
  shortcuts: Record<string, string>
}

/**
 * Gestionnaire de personnalisation avec sauvegarde locale et cloud
 */
class CustomizationEngine {
  private preferences: UserPreferences
  private listeners: Set<(preferences: UserPreferences) => void> = new Set()
  private storageKey = "jmplan_user_preferences"

  constructor() {
    this.preferences = this.getDefaultPreferences()
    this.loadPreferences()
  }

  /**
   * Obtient les préférences par défaut
   */
  private getDefaultPreferences(): UserPreferences {
    return {
      theme: {
        primary: "#E91E63",
        secondary: "#9C27B0",
        accent: "#FF4081",
        background: "#FAFAFA",
        surface: "#FFFFFF",
        text: "#212121",
        border: "#E0E0E0",
        success: "#4CAF50",
        warning: "#FF9800",
        error: "#F44336",
        info: "#2196F3",
      },
      layout: {
        sidebarPosition: "left",
        sidebarCollapsed: false,
        headerHeight: 64,
        footerVisible: true,
        compactMode: false,
        gridColumns: 3,
      },
      workflow: {
        defaultAppointmentDuration: 60,
        autoConfirmAppointments: false,
        requireClientApproval: true,
        sendReminders: true,
        reminderTiming: [1440, 60], // 24h et 1h avant
        workingHours: {
          start: "09:00",
          end: "17:00",
          days: [1, 2, 3, 4, 5], // Lundi à vendredi
        },
        bufferTime: 15,
      },
      notifications: {
        email: true,
        sms: false,
        push: true,
        sound: true,
        vibration: false,
        channels: {
          appointments: true,
          clients: true,
          tasks: true,
          system: false,
        },
      },
      language: "fr",
      timezone: "America/Montreal",
      dateFormat: "DD/MM/YYYY",
      timeFormat: "24h",
      currency: "CAD",
      shortcuts: {
        "ctrl+n": "new_client",
        "ctrl+a": "new_appointment",
        "ctrl+t": "new_task",
        "ctrl+/": "search",
      },
    }
  }

  /**
   * Charge les préférences depuis le stockage local
   */
  private loadPreferences(): void {
    if (typeof window === "undefined") return

    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        const parsed = JSON.parse(stored)
        this.preferences = { ...this.preferences, ...parsed }
        this.applyTheme()
        this.notifyListeners()
      }
    } catch (error) {
      console.warn("Failed to load user preferences:", error)
    }
  }

  /**
   * Sauvegarde les préférences dans le stockage local
   */
  private savePreferences(): void {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.preferences))
    } catch (error) {
      console.warn("Failed to save user preferences:", error)
    }
  }

  /**
   * Applique le thème à l'interface
   */
  private applyTheme(): void {
    if (typeof document === "undefined") return

    const root = document.documentElement
    const theme = this.preferences.theme

    // Appliquer les variables CSS
    root.style.setProperty("--color-primary", theme.primary)
    root.style.setProperty("--color-secondary", theme.secondary)
    root.style.setProperty("--color-accent", theme.accent)
    root.style.setProperty("--color-background", theme.background)
    root.style.setProperty("--color-surface", theme.surface)
    root.style.setProperty("--color-text", theme.text)
    root.style.setProperty("--color-border", theme.border)
    root.style.setProperty("--color-success", theme.success)
    root.style.setProperty("--color-warning", theme.warning)
    root.style.setProperty("--color-error", theme.error)
    root.style.setProperty("--color-info", theme.info)

    // Appliquer les préférences de layout
    root.style.setProperty("--header-height", `${this.preferences.layout.headerHeight}px`)
    root.style.setProperty("--grid-columns", this.preferences.layout.gridColumns.toString())

    // Mode compact
    if (this.preferences.layout.compactMode) {
      root.classList.add("compact-mode")
    } else {
      root.classList.remove("compact-mode")
    }
  }

  /**
   * Notifie les listeners des changements
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.preferences))
  }

  /**
   * Obtient les préférences actuelles
   */
  getPreferences(): UserPreferences {
    return { ...this.preferences }
  }

  /**
   * Met à jour une section des préférences
   */
  updatePreferences<K extends keyof UserPreferences>(section: K, updates: Partial<UserPreferences[K]>): void {
    this.preferences[section] = { ...this.preferences[section], ...updates }
    this.savePreferences()

    if (section === "theme" || section === "layout") {
      this.applyTheme()
    }

    this.notifyListeners()
  }

  /**
   * Réinitialise les préférences aux valeurs par défaut
   */
  resetPreferences(): void {
    this.preferences = this.getDefaultPreferences()
    this.savePreferences()
    this.applyTheme()
    this.notifyListeners()
  }

  /**
   * Importe des préférences depuis un fichier
   */
  importPreferences(preferences: Partial<UserPreferences>): void {
    this.preferences = { ...this.preferences, ...preferences }
    this.savePreferences()
    this.applyTheme()
    this.notifyListeners()
  }

  /**
   * Exporte les préférences vers un fichier
   */
  exportPreferences(): string {
    return JSON.stringify(this.preferences, null, 2)
  }

  /**
   * Ajoute un listener pour les changements de préférences
   */
  addListener(listener: (preferences: UserPreferences) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /**
   * Obtient les thèmes prédéfinis
   */
  getPredefinedThemes(): Record<string, ThemeConfig> {
    return {
      default: {
        primary: "#E91E63",
        secondary: "#9C27B0",
        accent: "#FF4081",
        background: "#FAFAFA",
        surface: "#FFFFFF",
        text: "#212121",
        border: "#E0E0E0",
        success: "#4CAF50",
        warning: "#FF9800",
        error: "#F44336",
        info: "#2196F3",
      },
      dark: {
        primary: "#E91E63",
        secondary: "#9C27B0",
        accent: "#FF4081",
        background: "#121212",
        surface: "#1E1E1E",
        text: "#FFFFFF",
        border: "#333333",
        success: "#4CAF50",
        warning: "#FF9800",
        error: "#F44336",
        info: "#2196F3",
      },
      blue: {
        primary: "#2196F3",
        secondary: "#3F51B5",
        accent: "#03DAC6",
        background: "#FAFAFA",
        surface: "#FFFFFF",
        text: "#212121",
        border: "#E0E0E0",
        success: "#4CAF50",
        warning: "#FF9800",
        error: "#F44336",
        info: "#2196F3",
      },
      green: {
        primary: "#4CAF50",
        secondary: "#8BC34A",
        accent: "#CDDC39",
        background: "#FAFAFA",
        surface: "#FFFFFF",
        text: "#212121",
        border: "#E0E0E0",
        success: "#4CAF50",
        warning: "#FF9800",
        error: "#F44336",
        info: "#2196F3",
      },
    }
  }

  /**
   * Applique un thème prédéfini
   */
  applyPredefinedTheme(themeName: string): void {
    const themes = this.getPredefinedThemes()
    const theme = themes[themeName]

    if (theme) {
      this.updatePreferences("theme", theme)
    }
  }

  /**
   * Génère un thème personnalisé basé sur une couleur principale
   */
  generateThemeFromColor(primaryColor: string): ThemeConfig {
    // Algorithme simple pour générer des couleurs harmonieuses
    const hsl = this.hexToHsl(primaryColor)

    return {
      primary: primaryColor,
      secondary: this.hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l),
      accent: this.hslToHex((hsl.h + 60) % 360, hsl.s, Math.min(hsl.l + 10, 90)),
      background: "#FAFAFA",
      surface: "#FFFFFF",
      text: "#212121",
      border: "#E0E0E0",
      success: "#4CAF50",
      warning: "#FF9800",
      error: "#F44336",
      info: "#2196F3",
    }
  }

  /**
   * Convertit une couleur hex en HSL
   */
  private hexToHsl(hex: string): { h: number; s: number; l: number } {
    const r = Number.parseInt(hex.slice(1, 3), 16) / 255
    const g = Number.parseInt(hex.slice(3, 5), 16) / 255
    const b = Number.parseInt(hex.slice(5, 7), 16) / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    let s = 0
    const l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0)
          break
        case g:
          h = (b - r) / d + 2
          break
        case b:
          h = (r - g) / d + 4
          break
      }
      h /= 6
    }

    return { h: h * 360, s: s * 100, l: l * 100 }
  }

  /**
   * Convertit HSL en hex
   */
  private hslToHex(h: number, s: number, l: number): string {
    h /= 360
    s /= 100
    l /= 100

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    let r, g, b

    if (s === 0) {
      r = g = b = l
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      r = hue2rgb(p, q, h + 1 / 3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1 / 3)
    }

    const toHex = (c: number) => {
      const hex = Math.round(c * 255).toString(16)
      return hex.length === 1 ? "0" + hex : hex
    }

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
  }

  /**
   * Valide les heures de travail
   */
  validateWorkingHours(start: string, end: string): boolean {
    const startTime = new Date(`2000-01-01T${start}:00`)
    const endTime = new Date(`2000-01-01T${end}:00`)
    return startTime < endTime
  }

  /**
   * Obtient les raccourcis clavier disponibles
   */
  getAvailableShortcuts(): Record<string, string> {
    return {
      new_client: "Nouveau client",
      new_appointment: "Nouveau rendez-vous",
      new_task: "Nouvelle tâche",
      search: "Rechercher",
      save: "Sauvegarder",
      export: "Exporter",
      import: "Importer",
      settings: "Paramètres",
      help: "Aide",
    }
  }

  /**
   * Synchronise les préférences avec le cloud (si connecté)
   */
  async syncWithCloud(userId: string): Promise<void> {
    try {
      // Envoyer les préférences au serveur
      const response = await fetch("/api/user/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userId}`,
        },
        body: JSON.stringify(this.preferences),
      })

      if (!response.ok) {
        throw new Error("Failed to sync preferences")
      }

      console.log("Preferences synced successfully")
    } catch (error) {
      console.warn("Failed to sync preferences with cloud:", error)
    }
  }

  /**
   * Charge les préférences depuis le cloud
   */
  async loadFromCloud(userId: string): Promise<void> {
    try {
      const response = await fetch(`/api/user/preferences?userId=${userId}`)

      if (response.ok) {
        const cloudPreferences = await response.json()
        this.importPreferences(cloudPreferences)
        console.log("Preferences loaded from cloud")
      }
    } catch (error) {
      console.warn("Failed to load preferences from cloud:", error)
    }
  }
}

// Instance singleton
export const customizationEngine = new CustomizationEngine()

/**
 * Hook React pour la personnalisation
 */
export function useCustomization() {
  const [preferences, setPreferences] = React.useState(customizationEngine.getPreferences())

  React.useEffect(() => {
    const unsubscribe = customizationEngine.addListener(setPreferences)
    return unsubscribe
  }, [])

  return {
    preferences,
    updatePreferences: customizationEngine.updatePreferences.bind(customizationEngine),
    resetPreferences: customizationEngine.resetPreferences.bind(customizationEngine),
    applyTheme: customizationEngine.applyPredefinedTheme.bind(customizationEngine),
    generateTheme: customizationEngine.generateThemeFromColor.bind(customizationEngine),
    exportPreferences: customizationEngine.exportPreferences.bind(customizationEngine),
    importPreferences: customizationEngine.importPreferences.bind(customizationEngine),
    getPredefinedThemes: customizationEngine.getPredefinedThemes.bind(customizationEngine),
    getAvailableShortcuts: customizationEngine.getAvailableShortcuts.bind(customizationEngine),
  }
}
