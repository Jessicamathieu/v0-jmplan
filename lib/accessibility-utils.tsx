"use client"

import React from "react"

/**
 * Utilitaires d'accessibilité pour améliorer l'expérience utilisateur
 * Inclut la navigation clavier, les lecteurs d'écran, et les contrastes
 */

/**
 * Gestionnaire de focus pour la navigation clavier
 */
export class FocusManager {
  private focusableSelectors = [
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "a[href]",
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(", ")

  /**
   * Obtient tous les éléments focusables dans un conteneur
   */
  getFocusableElements(container: HTMLElement): HTMLElement[] {
    return Array.from(container.querySelectorAll(this.focusableSelectors))
  }

  /**
   * Piège le focus dans un conteneur (utile pour les modales)
   */
  trapFocus(container: HTMLElement): () => void {
    const focusableElements = this.getFocusableElements(container)
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement?.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement?.focus()
        }
      }
    }

    container.addEventListener("keydown", handleKeyDown)

    // Focus le premier élément
    firstElement?.focus()

    // Retourne une fonction de nettoyage
    return () => {
      container.removeEventListener("keydown", handleKeyDown)
    }
  }

  /**
   * Restaure le focus sur l'élément précédent
   */
  restoreFocus(previousElement: HTMLElement | null) {
    if (previousElement && document.contains(previousElement)) {
      previousElement.focus()
    }
  }

  /**
   * Gère la navigation par flèches dans une liste
   */
  handleArrowNavigation(container: HTMLElement, orientation: "horizontal" | "vertical" = "vertical"): () => void {
    const handleKeyDown = (event: KeyboardEvent) => {
      const focusableElements = this.getFocusableElements(container)
      const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement)

      if (currentIndex === -1) return

      let nextIndex = currentIndex

      switch (event.key) {
        case "ArrowDown":
          if (orientation === "vertical") {
            event.preventDefault()
            nextIndex = (currentIndex + 1) % focusableElements.length
          }
          break
        case "ArrowUp":
          if (orientation === "vertical") {
            event.preventDefault()
            nextIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1
          }
          break
        case "ArrowRight":
          if (orientation === "horizontal") {
            event.preventDefault()
            nextIndex = (currentIndex + 1) % focusableElements.length
          }
          break
        case "ArrowLeft":
          if (orientation === "horizontal") {
            event.preventDefault()
            nextIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1
          }
          break
        case "Home":
          event.preventDefault()
          nextIndex = 0
          break
        case "End":
          event.preventDefault()
          nextIndex = focusableElements.length - 1
          break
      }

      if (nextIndex !== currentIndex) {
        focusableElements[nextIndex]?.focus()
      }
    }

    container.addEventListener("keydown", handleKeyDown)

    return () => {
      container.removeEventListener("keydown", handleKeyDown)
    }
  }
}

/**
 * Gestionnaire d'annonces pour les lecteurs d'écran
 */
export class ScreenReaderAnnouncer {
  private liveRegion: HTMLElement | null = null

  constructor() {
    this.createLiveRegion()
  }

  /**
   * Crée une région live pour les annonces
   */
  private createLiveRegion() {
    if (typeof document === "undefined") return

    this.liveRegion = document.createElement("div")
    this.liveRegion.setAttribute("aria-live", "polite")
    this.liveRegion.setAttribute("aria-atomic", "true")
    this.liveRegion.className = "sr-only"
    this.liveRegion.style.cssText = `
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    `

    document.body.appendChild(this.liveRegion)
  }

  /**
   * Annonce un message aux lecteurs d'écran
   */
  announce(message: string, priority: "polite" | "assertive" = "polite") {
    if (!this.liveRegion) return

    this.liveRegion.setAttribute("aria-live", priority)
    this.liveRegion.textContent = message

    // Nettoyer après 1 seconde
    setTimeout(() => {
      if (this.liveRegion) {
        this.liveRegion.textContent = ""
      }
    }, 1000)
  }

  /**
   * Annonce le changement de page
   */
  announcePageChange(pageTitle: string) {
    this.announce(`Navigué vers ${pageTitle}`, "assertive")
  }

  /**
   * Annonce une action réussie
   */
  announceSuccess(message: string) {
    this.announce(`Succès: ${message}`, "polite")
  }

  /**
   * Annonce une erreur
   */
  announceError(message: string) {
    this.announce(`Erreur: ${message}`, "assertive")
  }

  /**
   * Nettoie les ressources
   */
  cleanup() {
    if (this.liveRegion && document.body.contains(this.liveRegion)) {
      document.body.removeChild(this.liveRegion)
    }
  }
}

/**
 * Utilitaires de contraste et couleurs
 */
export class ColorContrastUtils {
  /**
   * Calcule le ratio de contraste entre deux couleurs
   */
  calculateContrastRatio(color1: string, color2: string): number {
    const luminance1 = this.getLuminance(color1)
    const luminance2 = this.getLuminance(color2)

    const lighter = Math.max(luminance1, luminance2)
    const darker = Math.min(luminance1, luminance2)

    return (lighter + 0.05) / (darker + 0.05)
  }

  /**
   * Calcule la luminance d'une couleur
   */
  private getLuminance(color: string): number {
    const rgb = this.hexToRgb(color)
    if (!rgb) return 0

    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })

    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }

  /**
   * Convertit hex en RGB
   */
  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: Number.parseInt(result[1], 16),
          g: Number.parseInt(result[2], 16),
          b: Number.parseInt(result[3], 16),
        }
      : null
  }

  /**
   * Vérifie si le contraste respecte les standards WCAG
   */
  meetsWCAGStandards(
    foreground: string,
    background: string,
    level: "AA" | "AAA" = "AA",
    size: "normal" | "large" = "normal",
  ): boolean {
    const ratio = this.calculateContrastRatio(foreground, background)

    if (level === "AAA") {
      return size === "large" ? ratio >= 4.5 : ratio >= 7
    } else {
      return size === "large" ? ratio >= 3 : ratio >= 4.5
    }
  }

  /**
   * Suggère une couleur avec un meilleur contraste
   */
  suggestBetterContrast(foreground: string, background: string, targetRatio = 4.5): string {
    const backgroundLuminance = this.getLuminance(background)
    const foregroundRgb = this.hexToRgb(foreground)

    if (!foregroundRgb) return foreground

    // Essayer d'assombrir ou d'éclaircir la couleur de premier plan
    let bestColor = foreground
    let bestRatio = this.calculateContrastRatio(foreground, background)

    for (let factor = 0.1; factor <= 1; factor += 0.1) {
      // Assombrir
      const darkerColor = this.adjustBrightness(foreground, -factor)
      const darkerRatio = this.calculateContrastRatio(darkerColor, background)

      if (darkerRatio > bestRatio && darkerRatio >= targetRatio) {
        bestColor = darkerColor
        bestRatio = darkerRatio
      }

      // Éclaircir
      const lighterColor = this.adjustBrightness(foreground, factor)
      const lighterRatio = this.calculateContrastRatio(lighterColor, background)

      if (lighterRatio > bestRatio && lighterRatio >= targetRatio) {
        bestColor = lighterColor
        bestRatio = lighterRatio
      }
    }

    return bestColor
  }

  /**
   * Ajuste la luminosité d'une couleur
   */
  private adjustBrightness(hex: string, factor: number): string {
    const rgb = this.hexToRgb(hex)
    if (!rgb) return hex

    const adjust = (value: number) => {
      if (factor > 0) {
        // Éclaircir
        return Math.min(255, value + (255 - value) * factor)
      } else {
        // Assombrir
        return Math.max(0, value * (1 + factor))
      }
    }

    const newR = Math.round(adjust(rgb.r))
    const newG = Math.round(adjust(rgb.g))
    const newB = Math.round(adjust(rgb.b))

    return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`
  }
}

/**
 * Hook React pour l'accessibilité
 */
export function useAccessibility() {
  const focusManager = new FocusManager()
  const announcer = new ScreenReaderAnnouncer()
  const colorUtils = new ColorContrastUtils()

  return {
    // Gestion du focus
    trapFocus: focusManager.trapFocus.bind(focusManager),
    restoreFocus: focusManager.restoreFocus.bind(focusManager),
    handleArrowNavigation: focusManager.handleArrowNavigation.bind(focusManager),
    getFocusableElements: focusManager.getFocusableElements.bind(focusManager),

    // Annonces pour lecteurs d'écran
    announce: announcer.announce.bind(announcer),
    announcePageChange: announcer.announcePageChange.bind(announcer),
    announceSuccess: announcer.announceSuccess.bind(announcer),
    announceError: announcer.announceError.bind(announcer),

    // Utilitaires de contraste
    calculateContrastRatio: colorUtils.calculateContrastRatio.bind(colorUtils),
    meetsWCAGStandards: colorUtils.meetsWCAGStandards.bind(colorUtils),
    suggestBetterContrast: colorUtils.suggestBetterContrast.bind(colorUtils),

    // Nettoyage
    cleanup: () => {
      announcer.cleanup()
    },
  }
}

/**
 * Composant wrapper pour l'accessibilité
 */
export function AccessibleContainer({
  children,
  trapFocus = false,
  announceOnMount,
  ariaLabel,
  role,
  ...props
}: {
  children: React.ReactNode
  trapFocus?: boolean
  announceOnMount?: string
  ariaLabel?: string
  role?: string
  [key: string]: any
}) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const { trapFocus: trapFocusFn, announce } = useAccessibility()

  React.useEffect(() => {
    if (announceOnMount) {
      announce(announceOnMount)
    }

    if (trapFocus && containerRef.current) {
      const cleanup = trapFocusFn(containerRef.current)
      return cleanup
    }
  }, [trapFocus, announceOnMount, trapFocusFn, announce])

  return (
    <div ref={containerRef} aria-label={ariaLabel} role={role} {...props}>
      {children}
    </div>
  )
}

// Instances globales
export const focusManager = new FocusManager()
export const screenReaderAnnouncer = new ScreenReaderAnnouncer()
export const colorContrastUtils = new ColorContrastUtils()
