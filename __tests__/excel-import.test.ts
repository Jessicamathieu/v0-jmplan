/**
 * Tests unitaires pour le module d'import Excel
 * Vérifie la validation, la transformation et l'import des données
 */

import {
  parseFile,
  detectColumns,
  validateQuebecPhone,
  formatQuebecPhone,
  validateCanadianPostalCode,
  formatCanadianPostalCode,
  CLIENT_COLUMNS,
  SERVICE_COLUMNS,
} from "@/lib/excel-import"
import { TestDataGenerator } from "@/lib/test-utils"

describe("Excel Import Module", () => {
  beforeEach(() => {
    TestDataGenerator.reset()
  })

  describe("Phone Validation", () => {
    test("validates Quebec phone numbers correctly", () => {
      expect(validateQuebecPhone("514-555-0123")).toBe(true)
      expect(validateQuebecPhone("(514) 555-0123")).toBe(true)
      expect(validateQuebecPhone("514.555.0123")).toBe(true)
      expect(validateQuebecPhone("5145550123")).toBe(true)
      expect(validateQuebecPhone("+1-514-555-0123")).toBe(true)

      // Invalid formats
      expect(validateQuebecPhone("123-456")).toBe(false)
      expect(validateQuebecPhone("abc-def-ghij")).toBe(false)
      expect(validateQuebecPhone("")).toBe(true) // Optional field
    })

    test("formats Quebec phone numbers correctly", () => {
      expect(formatQuebecPhone("5145550123")).toBe("514-555-0123")
      expect(formatQuebecPhone("(514) 555-0123")).toBe("514-555-0123")
      expect(formatQuebecPhone("514.555.0123")).toBe("514-555-0123")
      expect(formatQuebecPhone("+1-514-555-0123")).toBe("514-555-0123")
      expect(formatQuebecPhone("invalid")).toBe("invalid")
    })
  })

  describe("Postal Code Validation", () => {
    test("validates Canadian postal codes correctly", () => {
      expect(validateCanadianPostalCode("H2X 1Y2")).toBe(true)
      expect(validateCanadianPostalCode("H2X1Y2")).toBe(true)
      expect(validateCanadianPostalCode("h2x 1y2")).toBe(true)
      expect(validateCanadianPostalCode("G1R-2J5")).toBe(true)

      // Invalid formats
      expect(validateCanadianPostalCode("12345")).toBe(false)
      expect(validateCanadianPostalCode("ABC DEF")).toBe(false)
      expect(validateCanadianPostalCode("")).toBe(true) // Optional field
    })

    test("formats Canadian postal codes correctly", () => {
      expect(formatCanadianPostalCode("h2x1y2")).toBe("H2X 1Y2")
      expect(formatCanadianPostalCode("H2X-1Y2")).toBe("H2X 1Y2")
      expect(formatCanadianPostalCode("H2X 1Y2")).toBe("H2X 1Y2")
      expect(formatCanadianPostalCode("invalid")).toBe("INVALID")
    })
  })

  describe("Column Detection", () => {
    test("detects client columns correctly", () => {
      const testData = [
        ["Prénom", "Nom de famille", "Adresse email", "Téléphone", "Code postal"],
        ["Jean", "Dupont", "jean@test.com", "514-555-0123", "H2X 1Y2"],
      ]

      const mapping = detectColumns(testData, CLIENT_COLUMNS)

      expect(mapping.firstName).toBe("Prénom")
      expect(mapping.lastName).toBe("Nom de famille")
      expect(mapping.email).toBe("Adresse email")
      expect(mapping.phone).toBe("Téléphone")
      expect(mapping.postalCode).toBe("Code postal")
    })

    test("handles partial column matches", () => {
      const testData = [
        ["nom", "email", "tel"],
        ["Dupont", "jean@test.com", "514-555-0123"],
      ]

      const mapping = detectColumns(testData, CLIENT_COLUMNS)

      expect(mapping.lastName).toBe("nom")
      expect(mapping.email).toBe("email")
      expect(mapping.phone).toBe("tel")
    })
  })

  describe("File Parsing", () => {
    test("parses CSV files correctly", async () => {
      const csvFile = TestDataGenerator.generateExcelFile(
        [
          ["Prénom", "Nom", "Email"],
          ["Jean", "Dupont", "jean@test.com"],
          ["Marie", "Martin", "marie@test.com"],
        ],
        "test.csv",
      )

      const result = await parseFile(csvFile)

      expect(result).toHaveLength(3)
      expect(result[0]).toEqual(["Prénom", "Nom", "Email"])
      expect(result[1]).toEqual(["Jean", "Dupont", "jean@test.com"])
      expect(result[2]).toEqual(["Marie", "Martin", "marie@test.com"])
    })

    test("handles empty rows correctly", async () => {
      const csvFile = TestDataGenerator.generateExcelFile(
        [
          ["Prénom", "Nom"],
          ["Jean", "Dupont"],
          ["", ""], // Empty row should be filtered
          ["Marie", "Martin"],
        ],
        "test.csv",
      )

      const result = await parseFile(csvFile)

      expect(result).toHaveLength(3) // Empty row filtered out
    })
  })

  describe("Data Validation", () => {
    test("validates client data correctly", () => {
      const validClient = {
        firstName: "Jean",
        lastName: "Dupont",
        email: "jean@test.com",
        phone: "514-555-0123",
        postalCode: "H2X 1Y2",
      }

      CLIENT_COLUMNS.forEach((column) => {
        const value = validClient[column.key as keyof typeof validClient]
        if (value && column.validation) {
          expect(column.validation(value)).toBe(true)
        }
      })
    })

    test("rejects invalid client data", () => {
      const invalidClient = {
        firstName: "", // Required field empty
        lastName: "Dupont",
        email: "invalid-email", // Invalid email
        phone: "123", // Invalid phone
        postalCode: "12345", // Invalid postal code
      }

      const firstNameColumn = CLIENT_COLUMNS.find((col) => col.key === "firstName")
      const emailColumn = CLIENT_COLUMNS.find((col) => col.key === "email")
      const phoneColumn = CLIENT_COLUMNS.find((col) => col.key === "phone")
      const postalCodeColumn = CLIENT_COLUMNS.find((col) => col.key === "postalCode")

      expect(firstNameColumn?.validation?.(invalidClient.firstName)).toBe(false)
      expect(emailColumn?.validation?.(invalidClient.email)).toBe(false)
      expect(phoneColumn?.validation?.(invalidClient.phone)).toBe(false)
      expect(postalCodeColumn?.validation?.(invalidClient.postalCode)).toBe(false)
    })
  })

  describe("Data Transformation", () => {
    test("transforms client data correctly", () => {
      const rawData = {
        firstName: "  Jean  ",
        lastName: "  DUPONT  ",
        email: "  JEAN@TEST.COM  ",
        phone: "(514) 555-0123",
        postalCode: "h2x1y2",
      }

      CLIENT_COLUMNS.forEach((column) => {
        const value = rawData[column.key as keyof typeof rawData]
        if (value && column.transform) {
          const transformed = column.transform(value)

          switch (column.key) {
            case "firstName":
              expect(transformed).toBe("Jean")
              break
            case "lastName":
              expect(transformed).toBe("DUPONT")
              break
            case "email":
              expect(transformed).toBe("jean@test.com")
              break
            case "phone":
              expect(transformed).toBe("514-555-0123")
              break
            case "postalCode":
              expect(transformed).toBe("H2X 1Y2")
              break
          }
        }
      })
    })
  })

  describe("Service Validation", () => {
    test("validates service data correctly", () => {
      const validService = {
        name: "Consultation Premium",
        duration: "60",
        price: "125.00",
        color: "#E91E63",
      }

      SERVICE_COLUMNS.forEach((column) => {
        const value = validService[column.key as keyof typeof validService]
        if (value && column.validation) {
          expect(column.validation(value)).toBe(true)
        }
      })
    })

    test("rejects invalid service data", () => {
      const invalidService = {
        name: "AB", // Too short
        duration: "0", // Invalid duration
        price: "-10", // Negative price
        color: "invalid-color", // Invalid hex color
      }

      const nameColumn = SERVICE_COLUMNS.find((col) => col.key === "name")
      const durationColumn = SERVICE_COLUMNS.find((col) => col.key === "duration")
      const priceColumn = SERVICE_COLUMNS.find((col) => col.key === "price")
      const colorColumn = SERVICE_COLUMNS.find((col) => col.key === "color")

      expect(nameColumn?.validation?.(invalidService.name)).toBe(false)
      expect(durationColumn?.validation?.(invalidService.duration)).toBe(false)
      expect(priceColumn?.validation?.(invalidService.price)).toBe(false)
      expect(colorColumn?.validation?.(invalidService.color)).toBe(false)
    })
  })

  describe("Performance Tests", () => {
    test("handles large datasets efficiently", async () => {
      // Generate large dataset
      const largeData = [["Prénom", "Nom", "Email"]]
      for (let i = 0; i < 10000; i++) {
        largeData.push([`Prénom${i}`, `Nom${i}`, `test${i}@example.com`])
      }

      const startTime = performance.now()
      const csvFile = TestDataGenerator.generateExcelFile(largeData)
      const result = await parseFile(csvFile)
      const endTime = performance.now()

      expect(result).toHaveLength(10001) // Header + 10000 rows
      expect(endTime - startTime).toBeLessThan(5000) // Should complete in under 5 seconds
    })
  })

  describe("Error Handling", () => {
    test("handles corrupted files gracefully", async () => {
      const corruptedFile = new File(["invalid content"], "corrupted.xlsx", {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })

      await expect(parseFile(corruptedFile)).rejects.toThrow()
    })

    test("handles unsupported file formats", async () => {
      const unsupportedFile = new File(["content"], "test.txt", { type: "text/plain" })

      await expect(parseFile(unsupportedFile)).rejects.toThrow("Format de fichier non supporté")
    })
  })
})
