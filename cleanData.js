import fs from "fs/promises"
import { createReadStream } from "fs"
import csv from "csv-parser"
import fetch from "node-fetch"
import { pipeline } from "stream/promises"
import { createWriteStream } from "fs"

// URLs des fichiers
const PRODUITS_URL =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Produits-DZmey16qFLzYQLLpZEBMWj3Xp03HPE.csv"
const SERVICES_URL =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Services-CTZv0bkzeogTTgiB32VEdOUoNMvOFf.csv"

// Chemins des fichiers locaux
const PRODUITS_FILE = "produits.csv"
const SERVICES_FILE = "services.csv"
const OUTPUT_FILE = "dataCleaned.json"

// Couleurs pour les services
const SERVICE_COLORS = ["blue", "green", "purple", "orange", "pink", "teal", "cyan", "amber", "indigo", "lime"]

// Fonction pour télécharger un fichier
async function downloadFile(url, outputPath) {
  console.log(`Téléchargement de ${url}...`)
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Erreur lors du téléchargement: ${response.statusText}`)
  }
  await pipeline(response.body, createWriteStream(outputPath))
  console.log(`Fichier téléchargé: ${outputPath}`)
}

// Fonction pour lire un fichier CSV
function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = []
    createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (error) => reject(error))
  })
}

// Fonction pour nettoyer les données des produits
function cleanProductsData(products) {
  return products
    .map((product) => {
      // Nettoyer le prix (enlever le $ et convertir en nombre)
      let price = product.Prix ? product.Prix.replace("$", "").trim() : "0"
      price = Number.parseFloat(price) || 0

      return {
        id: product.Code || `PROD-${Math.random().toString(36).substr(2, 9)}`,
        name: product["Nom du Produit"] || "Produit sans nom",
        category: product.Categorie || "Non catégorisé",
        subCategory: product["Sous-categorie"] || "",
        price: price,
        type: "product",
      }
    })
    .filter((product) => product.name !== "Produit sans nom") // Filtrer les produits sans nom
}

// Fonction pour nettoyer les données des services
function cleanServicesData(services) {
  return services
    .map((service, index) => {
      // Nettoyer le prix et la durée
      const price = service.Prix ? Number.parseFloat(service.Prix) || 0 : 0
      const duration = service["Durée (min)"] ? Number.parseInt(service["Durée (min)"]) || 0 : 0

      // Assigner une couleur au service
      const colorIndex = index % SERVICE_COLORS.length
      const color = SERVICE_COLORS[colorIndex]

      return {
        id: service["Service ID"] || `SERV-${Math.random().toString(36).substr(2, 9)}`,
        name: service["Nom du service"] || "Service sans nom",
        description: `Service de ${service["Nom du service"] || "sans nom"}`,
        category: service.Catégorie || "Non catégorisé",
        subCategory: service["Sous-catégorie"] || "",
        division: service.Division || "",
        price: price,
        duration: duration,
        color: color,
        rate: price, // Taux horaire (pour les calculs)
        type: "service",
      }
    })
    .filter((service) => service.name !== "Service sans nom") // Filtrer les services sans nom
}

// Fonction pour générer des clients fictifs
function generateMockClients() {
  const clients = [
    {
      id: 1,
      name: "Jean Dupont",
      email: "jean.dupont@example.com",
      phone: "514-123-4567",
      address: "123 rue Principale, Montréal",
      notes: "Client fidèle depuis 2020",
    },
    {
      id: 2,
      name: "Marie Tremblay",
      email: "marie.tremblay@example.com",
      phone: "438-987-6543",
      address: "456 avenue des Pins, Québec",
      notes: "Préfère les rendez-vous en matinée",
    },
    {
      id: 3,
      name: "Pierre Martin",
      email: "pierre.martin@example.com",
      phone: "514-555-1212",
      address: "789 boulevard Saint-Laurent, Laval",
      notes: "Allergique à certains produits",
    },
    {
      id: 4,
      name: "Sophie Bergeron",
      email: "sophie.bergeron@example.com",
      phone: "450-222-3333",
      address: "321 rue des Érables, Longueuil",
      notes: "",
    },
    {
      id: 5,
      name: "Michel Tremblay",
      email: "michel.tremblay@example.com",
      phone: "514-444-5555",
      address: "987 avenue du Parc, Montréal",
      notes: "Client professionnel",
    },
  ]

  return clients
}

// Fonction principale
async function main() {
  try {
    // Télécharger les fichiers
    await downloadFile(PRODUITS_URL, PRODUITS_FILE)
    await downloadFile(SERVICES_URL, SERVICES_FILE)

    // Lire les fichiers CSV
    console.log("Lecture des fichiers CSV...")
    const productsData = await readCSV(PRODUITS_FILE)
    const servicesData = await readCSV(SERVICES_FILE)

    // Nettoyer les données
    console.log("Nettoyage des données...")
    const cleanedProducts = cleanProductsData(productsData)
    const cleanedServices = cleanServicesData(servicesData)

    // Générer des clients fictifs
    console.log("Génération des clients fictifs...")
    const mockClients = generateMockClients()

    // Combiner les données
    const cleanedData = {
      products: cleanedProducts,
      services: cleanedServices,
      clients: mockClients,
      lastUpdated: new Date().toISOString(),
    }

    // Enregistrer les données nettoyées
    console.log(`Enregistrement des données dans ${OUTPUT_FILE}...`)
    await fs.writeFile(OUTPUT_FILE, JSON.stringify(cleanedData, null, 2))

    console.log(
      `Nettoyage terminé! ${cleanedProducts.length} produits, ${cleanedServices.length} services et ${mockClients.length} clients traités.`,
    )
    console.log(`Données enregistrées dans ${OUTPUT_FILE}`)

    // Supprimer les fichiers temporaires
    await fs.unlink(PRODUITS_FILE)
    await fs.unlink(SERVICES_FILE)
    console.log("Fichiers temporaires supprimés.")
  } catch (error) {
    console.error("Erreur:", error)
  }
}

main()
