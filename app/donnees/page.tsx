"use client"

import { importExcel, importCSV, exportExcel, exportCSV } from "@/lib/excel"
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Download, BarChart3, Upload, Database } from "lucide-react" // ⚠️ j’ai retiré Database car il n’existe plus


interface Product {
  id: string
  name: string
  category: string
  subCategory: string
  price: number
  type: "product"
}

interface Service {
  id: string
  name: string
  category: string
  subCategory: string
  division: string
  price: number
  duration: number
  type: "service"
}

interface CleanedData {
  products: Product[]
  services: Service[]
  lastUpdated: string
}

export default function DonneesPage() {
  const [data, setData] = useState<CleanedData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("products")
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [filteredServices, setFilteredServices] = useState<Service[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/data")
        const jsonData = await response.json()
        setData(jsonData)
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error)
        setData({
          products: [
            {
              id: "PROD1",
              name: "Super Sérum Premium",
              category: "Soins",
              subCategory: "Visage",
              price: 109,
              type: "product",
            },
            {
              id: "PROD2",
              name: "Crème Hydratante Luxe",
              category: "Soins",
              subCategory: "Corps",
              price: 45,
              type: "product",
            },
          ],
          services: [
            {
              id: "SERV1",
              name: "Massage Relaxant Premium",
              category: "Bien-être",
              subCategory: "Massage",
              division: "Spa",
              price: 85,
              duration: 60,
              type: "service",
            },
            {
              id: "SERV2",
              name: "Soin du Visage Deluxe",
              category: "Esthétique",
              subCategory: "Visage",
              division: "Beauté",
              price: 120,
              duration: 90,
              type: "service",
            },
          ],
          lastUpdated: new Date().toISOString(),
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (!data) return

    const query = searchQuery.toLowerCase()

    if (query === "") {
      setFilteredProducts(data.products)
      setFilteredServices(data.services)
      return
    }

    setFilteredProducts(
      data.products.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query) ||
          product.subCategory.toLowerCase().includes(query),
      ),
    )

    setFilteredServices(
      data.services.filter(
        (service) =>
          service.name.toLowerCase().includes(query) ||
          service.category.toLowerCase().includes(query) ||
          service.subCategory.toLowerCase().includes(query) ||
          service.division.toLowerCase().includes(query),
      ),
    )
  }, [searchQuery, data])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-CA", { style: "currency", currency: "CAD" }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-CA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const exportToCSV = (type: "products" | "services") => {
    if (!data) return

    const items = type === "products" ? data.products : data.services

    const headers =
      type === "products"
        ? ["ID", "Nom", "Catégorie", "Sous-catégorie", "Prix"]
        : ["ID", "Nom", "Catégorie", "Sous-catégorie", "Division", "Prix", "Durée (min)"]

    let csvContent = headers.join(",") + "\n"

    items.forEach((item) => {
      let row =
        type === "products"
          ? [item.id, item.name, item.category, item.subCategory, item.price]
          : [
              item.id,
              item.name,
              item.category,
              item.subCategory,
              (item as Service).division,
              item.price,
              (item as Service).duration,
            ]

      row = row.map((field) => {
        if (typeof field === "string" && field.includes(",")) {
          return `"${field}"`
        }
        return String(field)
      })

      csvContent += row.join(",") + "\n"
    })

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `${type}_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-secondary">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Données
            </h1>
            <Badge className="bg-gradient-to-r from-primary to-secondary text-white">Premium</Badge>
          </div>
          <p className="text-gray-600">Centre de données et analytics avancés</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-secondary">
              <Database className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Données
            </h1>
            <Badge className="bg-gradient-to-r from-primary to-secondary text-white">Premium</Badge>
          </div>
          <p className="text-gray-600">Centre de données et analytics avancés</p>
        </div>

        {/* Coming Soon */}
        <Card className="border-0 shadow-lg bg-white mb-8">
          <CardContent className="p-12 text-center">
            <BarChart3 className="h-16 w-16 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Analytics Premium</h3>
            <p className="text-gray-600 mb-6">
              Centre de données complet avec analytics avancés et rapports détaillés.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="p-4 bg-primary/5 rounded-lg">
                <BarChart3 className="h-8 w-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold text-primary">Tableaux de bord</h4>
                <p className="text-sm text-gray-600">Visualisations interactives</p>
              </div>
              <div className="p-4 bg-secondary/5 rounded-lg">
                <Download className="h-8 w-8 text-secondary mx-auto mb-2" />
                <h4 className="font-semibold text-secondary">Export de données</h4>
                <p className="text-sm text-gray-600">Formats multiples disponibles</p>
              </div>
              <div className="p-4 bg-green-500/5 rounded-lg">
                <Upload className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-green-600">Import en masse</h4>
                <p className="text-sm text-gray-600">Synchronisation automatique</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="products" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 premium-card">
            <TabsTrigger
              value="products"
              className="data-[state=active]:premium-gradient data-[state=active]:text-white"
            >
              Produits {data?.products.length ? `(${data.products.length})` : ""}
            </TabsTrigger>
            <TabsTrigger
              value="services"
              className="data-[state=active]:premium-gradient data-[state=active]:text-white"
            >
              Services {data?.services.length ? `(${data.services.length})` : ""}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-6">
            <Card className="premium-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-primary">Liste des produits</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => exportCSV(filteredProducts, "produits.csv")}>CSV</Button>
                  <Button variant="outline" size="sm" onClick={() => exportExcel(filteredProducts, "produits.xlsx")}>Excel</Button>
                  <input type="file" accept=".csv" onChange={(e) => e.target.files && importCSV(e.target.files[0]).then(console.log)} />
                  <input type="file" accept=".xlsx" onChange={(e) => e.target.files && importExcel(e.target.files[0]).then(console.log)} />
                </div>
                <Button variant="outline" size="sm" onClick={() => exportToCSV("products")} className="premium-button">
                  <Download className="mr-2 h-4 w-4" />
                  Exporter CSV
                </Button>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border premium-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Nom du produit</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead>Sous-catégorie</TableHead>
                        <TableHead className="text-right">Prix</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                          <TableRow key={product.id} className="hover:bg-primary/5">
                            <TableCell className="font-medium text-primary">{product.id}</TableCell>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="premium-border">
                                {product.category}
                              </Badge>
                            </TableCell>
                            <TableCell>{product.subCategory}</TableCell>
                            <TableCell className="text-right font-semibold text-primary">
                              {formatPrice(product.price)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            Aucun produit trouvé.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="mt-6">
            <Card className="premium-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-primary">Liste des services</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => exportCSV(filteredServices, "services.csv")}>CSV</Button>
                  <Button variant="outline" size="sm" onClick={() => exportExcel(filteredServices, "services.xlsx")}>Excel</Button>
                  <input type="file" accept=".csv" onChange={(e) => e.target.files && importCSV(e.target.files[0]).then(console.log)} />
                  <input type="file" accept=".xlsx" onChange={(e) => e.target.files && importExcel(e.target.files[0]).then(console.log)} />
                </div>
                <Button variant="outline" size="sm" onClick={() => exportToCSV("services")} className="premium-button">
                  <Download className="mr-2 h-4 w-4" />
                  Exporter CSV
                </Button>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border premium-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Nom du service</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead>Division</TableHead>
                        <TableHead>Durée</TableHead>
                        <TableHead className="text-right">Prix</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredServices.length > 0 ? (
                        filteredServices.map((service) => (
                          <TableRow key={service.id} className="hover:bg-primary/5">
                            <TableCell className="font-medium text-primary">{service.id}</TableCell>
                            <TableCell className="font-medium">{service.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="premium-border">
                                {service.category}
                              </Badge>
                            </TableCell>
                            <TableCell>{service.division}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="bg-primary/10 text-primary">
                                {service.duration} min
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-semibold text-primary">
                              {formatPrice(service.price)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            Aucun service trouvé.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
