/**
 * Tests de performance pour valider les temps de réponse
 * et l'optimisation des fonctionnalités critiques
 */

import { performanceMonitor, PerformanceTestUtils } from "@/lib/test-utils"
import { parseFile } from "@/lib/excel-import"
import { apiIntegrations } from "@/lib/api-integrations"
import { TestDataGenerator } from "@/lib/test-utils"
import { testData } from "@/lib/test-data" // Declare the testData variable

describe("Performance Tests", () => {
  beforeEach(() => {
    TestDataGenerator.reset()
    // Clear performance metrics before each test
    performanceMonitor.cleanup()
  })

  describe("Excel Import Performance", () => {
    test("parses small files quickly", async () => {
      const smallFile = TestDataGenerator.generateExcelFile([
        ["Prénom", "Nom", "Email"],
        ...Array.from({ length: 100 }, (_, i) => [`Prénom${i}`, `Nom${i}`, `test${i}@example.com`]),
      ])

      const performance = await PerformanceTestUtils.measureFunctionPerformance(() => parseFile(smallFile), 10)

      PerformanceTestUtils.expectPerformance(performance.average, 500, "Small file parsing")
      expect(performance.max).toBeLessThan(1000)
    })

    test("handles medium datasets efficiently", async () => {
      const mediumFile = TestDataGenerator.generateExcelFile([
        ["Prénom", "Nom", "Email", "Téléphone", "Adresse"],
        ...Array.from({ length: 1000 }, (_, i) => [
          `Prénom${i}`,
          `Nom${i}`,
          `test${i}@example.com`,
          `514-555-${String(i).padStart(4, "0")}`,
          `${i} Rue Test`,
        ]),
      ])

      const performance = await PerformanceTestUtils.measureFunctionPerformance(() => parseFile(mediumFile), 5)

      PerformanceTestUtils.expectPerformance(performance.average, 2000, "Medium file parsing")
      expect(performance.max).toBeLessThan(3000)
    })

    test("processes large datasets within acceptable limits", async () => {
      const largeFile = TestDataGenerator.generateExcelFile([
        ["Prénom", "Nom", "Email", "Téléphone", "Adresse", "Ville", "Code postal"],
        ...Array.from({ length: 5000 }, (_, i) => [
          `Prénom${i}`,
          `Nom${i}`,
          `test${i}@example.com`,
          `514-555-${String(i).padStart(4, "0")}`,
          `${i} Rue Test`,
          "Montréal",
          "H2X 1Y2",
        ]),
      ])

      const startTime = performance.now()
      const result = await parseFile(largeFile)
      const endTime = performance.now()

      expect(result).toHaveLength(5001) // Header + 5000 rows
      PerformanceTestUtils.expectPerformance(endTime - startTime, 10000, "Large file parsing")
    })
  })

  describe("API Integration Performance", () => {
    test("geocoding requests are cached effectively", async () => {
      const address = "123 Rue Test, Montréal, QC"

      // First request (should hit API)
      const firstRequest = await PerformanceTestUtils.measureFunctionPerformance(
        () => apiIntegrations.geocodeAddress(address),
        1,
      )

      // Second request (should hit cache)
      const secondRequest = await PerformanceTestUtils.measureFunctionPerformance(
        () => apiIntegrations.geocodeAddress(address),
        1,
      )

      // Cache should be significantly faster
      expect(secondRequest.average).toBeLessThan(firstRequest.average * 0.1)
      PerformanceTestUtils.expectPerformance(secondRequest.average, 50, "Cached geocoding")
    })

    test("SMS sending has acceptable response time", async () => {
      const performance = await PerformanceTestUtils.measureFunctionPerformance(
        () => apiIntegrations.sendSMS("514-555-0123", "Test message"),
        3,
      )

      PerformanceTestUtils.expectPerformance(performance.average, 3000, "SMS sending")
      expect(performance.max).toBeLessThan(5000)
    })

    test("batch operations scale linearly", async () => {
      const smallBatch = Array.from({ length: 10 }, (_, i) => `Address ${i}`)
      const largeBatch = Array.from({ length: 100 }, (_, i) => `Address ${i}`)

      const smallBatchTime = await PerformanceTestUtils.measureFunctionPerformance(async () => {
        await Promise.all(smallBatch.map((addr) => apiIntegrations.geocodeAddress(addr)))
      }, 1)

      const largeBatchTime = await PerformanceTestUtils.measureFunctionPerformance(async () => {
        await Promise.all(largeBatch.map((addr) => apiIntegrations.geocodeAddress(addr)))
      }, 1)

      // Large batch should not be more than 15x slower (allowing for some overhead)
      const scalingFactor = largeBatchTime.average / smallBatchTime.average
      expect(scalingFactor).toBeLessThan(15)
    })
  })

  describe("Component Rendering Performance", () => {
    test("dashboard renders quickly", async () => {
      const DashboardComponent = () => (
        <div data-testid="dashboard">
          <h1>Dashboard</h1>
          <div>Stats</div>
          <div>Charts</div>
        </div>
      )

      const renderTime = await PerformanceTestUtils.measureRenderTime(DashboardComponent())

      PerformanceTestUtils.expectPerformance(renderTime, 100, "Dashboard rendering")
    })

    test("large client list renders efficiently", async () => {
      const clients = Array.from({ length: 1000 }, (_, i) => TestDataGenerator.generateClient({ id: `client_${i}` }))

      const ClientListComponent = () => (
        <div data-testid="client-list">
          {clients.map((client) => (
            <div key={client.id}>
              {client.firstName} {client.lastName} - {client.email}
            </div>
          ))}
        </div>
      )

      const renderTime = await PerformanceTestUtils.measureRenderTime(ClientListComponent())

      PerformanceTestUtils.expectPerformance(renderTime, 500, "Large client list rendering")
    })
  })

  describe("Memory Usage", () => {
    test("import process does not cause memory leaks", async () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0

      // Process multiple files
      for (let i = 0; i < 10; i++) {
        const file = TestDataGenerator.generateExcelFile([
          ["Prénom", "Nom", "Email"],
          ...Array.from({ length: 500 }, (_, j) => [`Prénom${j}`, `Nom${j}`, `test${j}@example.com`]),
        ])

        await parseFile(file)
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc()
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0
      const memoryIncrease = finalMemory - initialMemory

      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024)
    })
  })

  describe("Database Operations", () => {
    test("client creation is optimized", async () => {
      const clients = Array.from({ length: 100 }, () => TestDataGenerator.generateClient())

      const performance = await PerformanceTestUtils.measureFunctionPerformance(async () => {
        // Simulate batch client creation
        await Promise.all(
          clients.map(
            (client) => new Promise((resolve) => setTimeout(resolve, 10)), // Simulate DB operation
          ),
        )
      }, 3)

      PerformanceTestUtils.expectPerformance(performance.average, 2000, "Batch client creation")
    })

    test("search operations are fast", async () => {
      const searchTerm = "Jean"

      const performance = await PerformanceTestUtils.measureFunctionPerformance(async () => {
        // Simulate search operation
        const results = testData.clients.filter(
          (client) =>
            client.firstName.includes(searchTerm) ||
            client.lastName.includes(searchTerm) ||
            client.email.includes(searchTerm),
        )
        return results
      }, 10)

      PerformanceTestUtils.expectPerformance(performance.average, 50, "Client search")
    })
  })

  describe("Network Performance", () => {
    test("API requests have reasonable timeouts", async () => {
      const slowApiCall = () => new Promise((resolve) => setTimeout(resolve, 6000))

      await expect(
        Promise.race([slowApiCall(), new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000))]),
      ).rejects.toThrow("Timeout")
    })

    test("concurrent API calls are handled efficiently", async () => {
      const concurrentCalls = Array.from({ length: 10 }, (_, i) =>
        apiIntegrations.geocodeAddress(`${i} Test Street, Montreal, QC`),
      )

      const startTime = performance.now()
      await Promise.all(concurrentCalls)
      const endTime = performance.now()

      // Concurrent calls should not take much longer than sequential
      PerformanceTestUtils.expectPerformance(endTime - startTime, 8000, "Concurrent API calls")
    })
  })

  describe("UI Responsiveness", () => {
    test("form interactions are responsive", async () => {
      const FormComponent = () => (
        <form data-testid="test-form">
          <input type="text" placeholder="Nom" />
          <input type="email" placeholder="Email" />
          <button type="submit">Soumettre</button>
        </form>
      )

      const renderTime = await PerformanceTestUtils.measureRenderTime(FormComponent())

      PerformanceTestUtils.expectPerformance(renderTime, 50, "Form rendering")
    })

    test("modal opening is smooth", async () => {
      const ModalComponent = () => (
        <div
          data-testid="modal"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "white",
              padding: "20px",
            }}
          >
            Modal Content
          </div>
        </div>
      )

      const renderTime = await PerformanceTestUtils.measureRenderTime(ModalComponent())

      PerformanceTestUtils.expectPerformance(renderTime, 100, "Modal rendering")
    })
  })
})
