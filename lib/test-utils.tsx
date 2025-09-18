import type React from "react"
import { expect } from "@jest/globals"
import { jest as JestFn } from "@jest/globals"
/**
 * Utilitaires de test pour assurer la fiabilité et la robustesse du code
 * Inclut des helpers pour les tests unitaires, d'intégration et e2e
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import type { ReactElement } from "react"

/**
 * Mock global pour Jest
 */
declare global {
  const jest: {
    fn: () => any
  }
}

/**
 * Configuration de test par défaut
 */
export const testConfig = {
  timeout: 10000,
  retries: 3,
  slowTestThreshold: 5000,
}

/**
 * Mock des APIs externes pour les tests
 */
export const mockAPIs = {
  googleCalendar: {
    getCalendars: JestFn.fn().mockResolvedValue([{ id: "primary", summary: "Mon Calendrier", primary: true }]),
    createEvent: JestFn.fn().mockResolvedValue({ id: "event_123" }),
    updateEvent: JestFn.fn().mockResolvedValue(true),
    deleteEvent: JestFn.fn().mockResolvedValue(true),
  },

  twilio: {
    sendSMS: JestFn.fn().mockResolvedValue({ sid: "sms_123", status: "sent" }),
  },

  quickbooks: {
    getCustomers: JestFn.fn().mockResolvedValue([]),
    createInvoice: JestFn.fn().mockResolvedValue({ id: "invoice_123" }),
  },

  maps: {
    geocode: JestFn.fn().mockResolvedValue({
      formatted_address: "123 Rue Test, Montréal, QC, Canada",
      geometry: { location: { lat: 45.5017, lng: -73.5673 } },
    }),
  },
}

/**
 * Données de test standardisées
 */
export const testData = {
  clients: [
    {
      id: "1",
      firstName: "Jean",
      lastName: "Dupont",
      email: "jean.dupont@test.com",
      phone: "514-555-0123",
      address: "123 Rue Test",
      city: "Montréal",
      postalCode: "H2X 1Y2",
      province: "QC",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
    {
      id: "2",
      firstName: "Marie",
      lastName: "Martin",
      email: "marie.martin@test.com",
      phone: "418-555-0456",
      address: "456 Avenue Test",
      city: "Québec",
      postalCode: "G1R 2J5",
      province: "QC",
      createdAt: new Date("2024-01-02"),
      updatedAt: new Date("2024-01-02"),
    },
  ],

  services: [
    {
      id: "1",
      name: "Consultation",
      description: "Consultation standard",
      duration: 60,
      price: 100,
      color: "#E91E63",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
  ],

  appointments: [
    {
      id: "1",
      clientId: "1",
      serviceId: "1",
      date: new Date("2024-12-25T10:00:00"),
      duration: 60,
      status: "confirmed" as const,
      notes: "Test appointment",
      createdAt: new Date("2024-12-20"),
      updatedAt: new Date("2024-12-20"),
    },
  ],
}

/**
 * Wrapper de rendu avec providers de test
 */
export function renderWithProviders(ui: ReactElement, options = {}) {
  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return <div data-testid="test-wrapper">{children}</div>
  }

  return render(ui, { wrapper: AllTheProviders, ...options })
}

/**
 * Utilitaires pour les tests d'interaction
 */
export const userInteractions = {
  /**
   * Simule la saisie dans un champ
   */
  async typeInField(fieldName: string, value: string) {
    const field = screen.getByLabelText(new RegExp(fieldName, "i"))
    fireEvent.change(field, { target: { value } })
    await waitFor(() => expect(field).toHaveValue(value))
  },

  /**
   * Simule un clic sur un bouton
   */
  async clickButton(buttonText: string) {
    const button = screen.getByRole("button", { name: new RegExp(buttonText, "i") })
    fireEvent.click(button)
    await waitFor(() => expect(button).toHaveBeenCalled())
  },

  /**
   * Simule la sélection dans un dropdown
   */
  async selectOption(selectName: string, optionText: string) {
    const select = screen.getByLabelText(new RegExp(selectName, "i"))
    fireEvent.change(select, { target: { value: optionText } })
    await waitFor(() => expect(select).toHaveValue(optionText))
  },

  /**
   * Simule l'upload d'un fichier
   */
  async uploadFile(inputName: string, file: File) {
    const input = screen.getByLabelText(new RegExp(inputName, "i"))
    fireEvent.change(input, { target: { files: [file] } })
    await waitFor(() => expect(input.files).toHaveLength(1))
  },
}

/**
 * Assertions personnalisées pour les tests
 */
export const customAssertions = {
  /**
   * Vérifie qu'un élément est visible et accessible
   */
  toBeAccessible: (element: HTMLElement) => {
    expect(element).toBeInTheDocument()
    expect(element).toBeVisible()
    expect(element).not.toHaveAttribute("aria-hidden", "true")
  },

  /**
   * Vérifie qu'un formulaire est valide
   */
  toBeValidForm: (form: HTMLFormElement) => {
    expect(form).toBeInTheDocument()
    expect(form.checkValidity()).toBe(true)
  },

  /**
   * Vérifie qu'une notification est affichée
   */
  toShowNotification: async (message: string, type: "success" | "error" | "warning" | "info" = "info") => {
    await waitFor(() => {
      const notification = screen.getByText(message)
      expect(notification).toBeInTheDocument()
      expect(notification.closest('[role="alert"]')).toHaveClass(`notification-${type}`)
    })
  },

  /**
   * Vérifie qu'un tableau contient les bonnes données
   */
  toHaveTableData: (table: HTMLElement, expectedData: any[][]) => {
    const rows = table.querySelectorAll("tbody tr")
    expect(rows).toHaveLength(expectedData.length)

    expectedData.forEach((rowData, rowIndex) => {
      const cells = rows[rowIndex].querySelectorAll("td")
      rowData.forEach((cellData, cellIndex) => {
        expect(cells[cellIndex]).toHaveTextContent(cellData.toString())
      })
    })
  },
}

/**
 * Générateur de données de test
 */
export class TestDataGenerator {
  private static counter = 0

  /**
   * Génère un client de test
   */
  static generateClient(overrides: Partial<(typeof testData.clients)[0]> = {}) {
    this.counter++
    return {
      id: `client_${this.counter}`,
      firstName: `Prénom${this.counter}`,
      lastName: `Nom${this.counter}`,
      email: `test${this.counter}@example.com`,
      phone: `514-555-${String(this.counter).padStart(4, "0")}`,
      address: `${this.counter} Rue Test`,
      city: "Montréal",
      postalCode: "H2X 1Y2",
      province: "QC",
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    }
  }

  /**
   * Génère un service de test
   */
  static generateService(overrides: Partial<(typeof testData.services)[0]> = {}) {
    this.counter++
    return {
      id: `service_${this.counter}`,
      name: `Service ${this.counter}`,
      description: `Description du service ${this.counter}`,
      duration: 60,
      price: 100 + this.counter * 10,
      color: "#E91E63",
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    }
  }

  /**
   * Génère un rendez-vous de test
   */
  static generateAppointment(overrides: Partial<(typeof testData.appointments)[0]> = {}) {
    this.counter++
    const date = new Date()
    date.setDate(date.getDate() + this.counter)

    return {
      id: `appointment_${this.counter}`,
      clientId: "1",
      serviceId: "1",
      date,
      duration: 60,
      status: "confirmed" as const,
      notes: `Notes du rendez-vous ${this.counter}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    }
  }

  /**
   * Génère un fichier Excel de test
   */
  static generateExcelFile(data: any[][], filename = "test.xlsx"): File {
    const csvContent = data.map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    return new File([blob], filename, { type: "text/csv" })
  }

  /**
   * Réinitialise le compteur
   */
  static reset() {
    this.counter = 0
  }
}

/**
 * Utilitaires pour les tests de performance
 */
export class PerformanceTestUtils {
  /**
   * Mesure le temps de rendu d'un composant
   */
  static async measureRenderTime(component: ReactElement): Promise<number> {
    const startTime = performance.now()
    renderWithProviders(component)
    await waitFor(() => screen.getByTestId("test-wrapper"))
    return performance.now() - startTime
  }

  /**
   * Teste la performance d'une fonction
   */
  static async measureFunctionPerformance<T>(
    fn: () => Promise<T> | T,
    iterations = 100,
  ): Promise<{ average: number; min: number; max: number; total: number }> {
    const times: number[] = []

    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now()
      await fn()
      times.push(performance.now() - startTime)
    }

    return {
      average: times.reduce((sum, time) => sum + time, 0) / times.length,
      min: Math.min(...times),
      max: Math.max(...times),
      total: times.reduce((sum, time) => sum + time, 0),
    }
  }

  /**
   * Vérifie que le temps de réponse est acceptable
   */
  static expectPerformance(actualTime: number, maxTime: number, operation: string) {
    if (actualTime > maxTime) {
      console.warn(`Performance warning: ${operation} took ${actualTime.toFixed(2)}ms (max: ${maxTime}ms)`)
    }
    expect(actualTime).toBeLessThan(maxTime * 1.5) // 50% de marge
  }
}

/**
 * Utilitaires pour les tests d'accessibilité
 */
export class AccessibilityTestUtils {
  /**
   * Vérifie l'accessibilité d'un élément
   */
  static checkAccessibility(element: HTMLElement) {
    // Vérifier les attributs ARIA
    const hasAriaLabel = element.hasAttribute("aria-label") || element.hasAttribute("aria-labelledby")
    const hasRole = element.hasAttribute("role")

    if (element.tagName === "BUTTON" || element.tagName === "INPUT") {
      expect(hasAriaLabel || element.textContent).toBeTruthy()
    }

    // Vérifier le contraste (simulation basique)
    const styles = window.getComputedStyle(element)
    const backgroundColor = styles.backgroundColor
    const color = styles.color

    // En production, utiliser une vraie librairie de contraste
    expect(backgroundColor).not.toBe(color)
  }

  /**
   * Vérifie la navigation au clavier
   */
  static async testKeyboardNavigation(container: HTMLElement) {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )

    expect(focusableElements.length).toBeGreaterThan(0)

    // Simuler la navigation Tab
    for (let i = 0; i < focusableElements.length; i++) {
      fireEvent.keyDown(document.activeElement || document.body, { key: "Tab" })
      await waitFor(() => {
        expect(document.activeElement).toBe(focusableElements[i])
      })
    }
  }
}

/**
 * Suite de tests d'intégration pour l'import Excel
 */
export class ExcelImportTestSuite {
  /**
   * Teste l'import complet de clients
   */
  static async testClientImport() {
    const testFile = TestDataGenerator.generateExcelFile([
      ["Prénom", "Nom", "Email", "Téléphone"],
      ["Jean", "Dupont", "jean@test.com", "514-555-0123"],
      ["Marie", "Martin", "marie@test.com", "418-555-0456"],
    ])

    // Simuler l'upload
    const input = screen.getByLabelText(/fichier/i)
    await userInteractions.uploadFile("fichier", testFile)

    // Vérifier le mapping automatique
    await waitFor(() => {
      expect(screen.getByText("Configuration des colonnes")).toBeInTheDocument()
    })

    // Continuer l'import
    await userInteractions.clickButton("Valider")
    await userInteractions.clickButton("Importer")

    // Vérifier le succès
    await customAssertions.toShowNotification("Importation réussie", "success")
  }

  /**
   * Teste la gestion des erreurs d'import
   */
  static async testImportErrors() {
    const invalidFile = TestDataGenerator.generateExcelFile([
      ["Prénom", "Email"],
      ["Jean", "email-invalide"], // Email invalide
      ["", "marie@test.com"], // Prénom manquant
    ])

    await userInteractions.uploadFile("fichier", invalidFile)
    await userInteractions.clickButton("Valider")

    // Vérifier les erreurs
    await waitFor(() => {
      expect(screen.getByText(/erreurs détectées/i)).toBeInTheDocument()
    })
  }
}

/**
 * Configuration Jest personnalisée
 */
export const jestConfig = {
  setupFilesAfterEnv: ["<rootDir>/src/lib/test-setup.ts"],
  testEnvironment: "jsdom",
  moduleNameMapping: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/**/*.d.ts", "!src/**/*.stories.{ts,tsx}", "!src/**/*.test.{ts,tsx}"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testTimeout: testConfig.timeout,
}

// Export des utilitaires principaux
export { render }
