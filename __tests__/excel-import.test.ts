import { describe, it, expect, beforeEach, jest } from "@jest/globals"
import { parseFile, detectColumns, importClients, CLIENT_COLUMNS } from "@/lib/excel-import"

// Mock des dépendances
jest.mock("@/lib/database", () => ({
  DatabaseService: {
    batchInsertClients: jest.fn(),
    batchInsertServices: jest.fn(),
  },
}))

describe("Excel Import", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("parseFile", () => {
    it("should parse CSV file correctly", async () => {
      const csvContent = "nom,prenom,email\nDupont,Marie,marie@test.com\nMartin,Jean,jean@test.com"
      const file = new File([csvContent], "test.csv", { type: "text/csv" })

      const result = await parseFile(file)

      expect(result).toHaveLength(3) // Header + 2 data rows
      expect(result[0]).toEqual(["nom", "prenom", "email"])
      expect(result[1]).toEqual(["Dupont", "Marie", "marie@test.com"])
      expect(result[2]).toEqual(["Martin", "Jean", "jean@test.com"])
    })

    it("should handle empty CSV file", async () => {
      const file = new File([""], "empty.csv", { type: "text/csv" })

      await expect(parseFile(file)).rejects.toThrow("Fichier vide ou invalide")
    })

    it("should handle invalid file format", async () => {
      const file = new File(["invalid content"], "test.txt", { type: "text/plain" })

      await expect(parseFile(file)).rejects.toThrow("Format de fichier non supporté")
    })
  })

  describe("detectColumns", () => {
    it("should detect columns correctly", () => {
      const data = [
        ["Nom", "Prénom", "Email", "Téléphone"],
        ["Dupont", "Marie", "marie@test.com", "514-555-0001"],
      ]

      const mapping = detectColumns(data, CLIENT_COLUMNS)

      expect(mapping.nom).toBe("Nom")
      expect(mapping.prenom).toBe("Prénom")
      expect(mapping.email).toBe("Email")
      expect(mapping.telephone).toBe("Téléphone")
    })

    it("should handle case insensitive detection", () => {
      const data = [
        ["NOM", "PRENOM", "EMAIL"],
        ["Dupont", "Marie", "marie@test.com"],
      ]

      const mapping = detectColumns(data, CLIENT_COLUMNS)

      expect(mapping.nom).toBe("NOM")
      expect(mapping.prenom).toBe("PRENOM")
      expect(mapping.email).toBe("EMAIL")
    })

    it("should handle partial column detection", () => {
      const data = [
        ["Nom Client", "Prénom Client"],
        ["Dupont", "Marie"],
      ]

      const mapping = detectColumns(data, CLIENT_COLUMNS)

      expect(mapping.nom).toBe("Nom Client")
      expect(mapping.prenom).toBe("Prénom Client")
      expect(mapping.email).toBeUndefined()
    })
  })

  describe("importClients", () => {
    it("should import clients successfully", async () => {
      const data = [
        ["nom", "prenom", "email"],
        ["Dupont", "Marie", "marie@test.com"],
        ["Martin", "Jean", "jean@test.com"],
      ]

      const mapping = {
        nom: "nom",
        prenom: "prenom",
        email: "email",
      }

      const mockInsert = jest.fn().mockResolvedValue([
        { id: 1, nom: "Dupont", prenom: "Marie", email: "marie@test.com" },
        { id: 2, nom: "Martin", prenom: "Jean", email: "jean@test.com" },
      ])

      const { DatabaseService } = await import("@/lib/database")
      ;(DatabaseService.batchInsertClients as jest.Mock).mockImplementation(mockInsert)

      const result = await importClients(data, mapping, true)

      expect(result.success).toBe(true)
      expect(result.imported).toBe(2)
      expect(result.errors).toHaveLength(0)
      expect(mockInsert).toHaveBeenCalledWith([
        { nom: "Dupont", prenom: "Marie", email: "marie@test.com" },
        { nom: "Martin", prenom: "Jean", email: "jean@test.com" },
      ])
    })

    it("should validate required fields", async () => {
      const data = [
        ["nom", "prenom", "email"],
        ["", "Marie", "marie@test.com"], // Nom manquant
        ["Martin", "", "jean@test.com"], // Prénom manquant
      ]

      const mapping = {
        nom: "nom",
        prenom: "prenom",
        email: "email",
      }

      const result = await importClients(data, mapping, true)

      expect(result.success).toBe(false)
      expect(result.imported).toBe(0)
      expect(result.errors).toContain("Ligne 2: Nom requis")
      expect(result.errors).toContain("Ligne 3: Prénom requis")
    })

    it("should validate email format", async () => {
      const data = [
        ["nom", "prenom", "email"],
        ["Dupont", "Marie", "invalid-email"],
      ]

      const mapping = {
        nom: "nom",
        prenom: "prenom",
        email: "email",
      }

      const mockInsert = jest.fn().mockResolvedValue([{ id: 1, nom: "Dupont", prenom: "Marie", email: null }])

      const { DatabaseService } = await import("@/lib/database")
      ;(DatabaseService.batchInsertClients as jest.Mock).mockImplementation(mockInsert)

      const result = await importClients(data, mapping, true)

      expect(result.success).toBe(true)
      expect(result.warnings).toContain("Ligne 2: Email invalide (invalid-email)")
    })

    it("should handle database errors", async () => {
      const data = [
        ["nom", "prenom"],
        ["Dupont", "Marie"],
      ]

      const mapping = {
        nom: "nom",
        prenom: "prenom",
      }

      const mockInsert = jest.fn().mockRejectedValue(new Error("Database error"))

      const { DatabaseService } = await import("@/lib/database")
      ;(DatabaseService.batchInsertClients as jest.Mock).mockImplementation(mockInsert)

      await expect(importClients(data, mapping, true)).rejects.toThrow("Database error")
    })
  })
})
