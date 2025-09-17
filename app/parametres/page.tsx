"use client"

import { CardDescription } from "@/components/ui/card"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { User, Bell, Database, Shield, Download, Upload, Trash2, Settings, Star } from "lucide-react"

export default function ParametresPage() {
  const [settings, setSettings] = useState({
    // Profil
    companyName: "JM Plan",
    ownerName: "Jean-Marc",
    email: "contact@jmplan.com",
    phone: "514-123-4567",
    address: "123 rue Principale, Montréal, QC H2X 1Y2",

    // Notifications
    emailNotifications: true,
    smsNotifications: true,
    appointmentReminders: true,
    taskDeadlines: true,
    clientUpdates: false,

    // Apparence
    theme: "system",
    language: "fr",
    dateFormat: "dd/mm/yyyy",
    timeFormat: "24h",
    currency: "CAD",

    // Calendrier
    workingHours: {
      start: "08:00",
      end: "18:00",
    },
    workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    defaultAppointmentDuration: 60,
    bufferTime: 15,

    // Facturation
    taxRate: 15,
    invoicePrefix: "INV-",
    paymentTerms: 30,
    autoInvoicing: false,

    // Sécurité
    twoFactorAuth: false,
    sessionTimeout: 30,
    dataBackup: true,

    // Intégrations
    quickbooksConnected: false,
    googleCalendarSync: false,
    smsProvider: "twilio",
  })

  const [activeTab, setActiveTab] = useState("profile")
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSave = () => {
    // Simuler la sauvegarde
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleNestedSettingChange = (parent: string, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof typeof prev],
        [key]: value,
      },
    }))
  }

  const exportData = () => {
    // Simuler l'export des données
    const data = {
      clients: [],
      appointments: [],
      tasks: [],
      expenses: [],
      settings: settings,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `jmplan-backup-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-secondary">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Paramètres
            </h1>
            <Badge className="bg-gradient-to-r from-primary to-secondary text-white">Premium</Badge>
          </div>
          <p className="text-gray-600">Configurez votre application selon vos besoins</p>
        </div>

        {/* Coming Soon */}
        <Card className="border-0 shadow-lg bg-white">
          <CardContent className="p-12 text-center">
            <Settings className="h-16 w-16 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Paramètres avancés</h3>
            <p className="text-gray-600 mb-6">Interface de configuration complète avec toutes les options premium.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="p-4 bg-primary/5 rounded-lg">
                <User className="h-8 w-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold text-primary">Profil utilisateur</h4>
                <p className="text-sm text-gray-600">Gestion du compte et préférences</p>
              </div>
              <div className="p-4 bg-secondary/5 rounded-lg">
                <Bell className="h-8 w-8 text-secondary mx-auto mb-2" />
                <h4 className="font-semibold text-secondary">Notifications</h4>
                <p className="text-sm text-gray-600">Configuration des alertes</p>
              </div>
              <div className="p-4 bg-green-500/5 rounded-lg">
                <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-green-600">Sécurité</h4>
                <p className="text-sm text-gray-600">Paramètres de sécurité avancés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 mt-12">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-3 premium-card">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profil</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Sécurité</span>
            </TabsTrigger>
          </TabsList>

          {/* Onglet Profil */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="premium-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Informations de l'entreprise
                </CardTitle>
                <CardDescription>Gérez les informations de base de votre entreprise</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Nom de l'entreprise</Label>
                    <Input
                      id="companyName"
                      value={settings.companyName}
                      onChange={(e) => handleSettingChange("companyName", e.target.value)}
                      className="premium-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownerName">Nom du propriétaire</Label>
                    <Input
                      id="ownerName"
                      value={settings.ownerName}
                      onChange={(e) => handleSettingChange("ownerName", e.target.value)}
                      className="premium-border"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={settings.email}
                      onChange={(e) => handleSettingChange("email", e.target.value)}
                      className="premium-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      value={settings.phone}
                      onChange={(e) => handleSettingChange("phone", e.target.value)}
                      className="premium-border"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adresse complète</Label>
                  <Input
                    id="address"
                    value={settings.address}
                    onChange={(e) => handleSettingChange("address", e.target.value)}
                    className="premium-border"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="premium-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Préférences de notification
                </CardTitle>
                <CardDescription>Choisissez comment vous souhaitez être notifié</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Notifications par email</Label>
                    <p className="text-sm text-muted-foreground">Recevez des notifications par email</p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Notifications SMS</Label>
                    <p className="text-sm text-muted-foreground">Recevez des notifications par SMS</p>
                  </div>
                  <Switch
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) => handleSettingChange("smsNotifications", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Rappels de rendez-vous</Label>
                    <p className="text-sm text-muted-foreground">Rappels automatiques avant les rendez-vous</p>
                  </div>
                  <Switch
                    checked={settings.appointmentReminders}
                    onCheckedChange={(checked) => handleSettingChange("appointmentReminders", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Échéances des tâches</Label>
                    <p className="text-sm text-muted-foreground">Notifications pour les tâches à échéance</p>
                  </div>
                  <Switch
                    checked={settings.taskDeadlines}
                    onCheckedChange={(checked) => handleSettingChange("taskDeadlines", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Mises à jour clients</Label>
                    <p className="text-sm text-muted-foreground">Notifications lors de nouveaux clients</p>
                  </div>
                  <Switch
                    checked={settings.clientUpdates}
                    onCheckedChange={(checked) => handleSettingChange("clientUpdates", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Sécurité */}
          <TabsContent value="security" className="space-y-6">
            <Card className="premium-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Sécurité et sauvegarde
                </CardTitle>
                <CardDescription>Protégez vos données et configurez les sauvegardes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Authentification à deux facteurs</Label>
                    <p className="text-sm text-muted-foreground">Sécurité renforcée pour votre compte</p>
                  </div>
                  <Switch
                    checked={settings.twoFactorAuth}
                    onCheckedChange={(checked) => handleSettingChange("twoFactorAuth", checked)}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Délai d'expiration de session (minutes)</Label>
                  <Input
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => handleSettingChange("sessionTimeout", Number.parseInt(e.target.value))}
                    className="premium-border"
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Sauvegarde automatique</Label>
                    <p className="text-sm text-muted-foreground">Sauvegarde quotidienne de vos données</p>
                  </div>
                  <Switch
                    checked={settings.dataBackup}
                    onCheckedChange={(checked) => handleSettingChange("dataBackup", checked)}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label className="text-base">Gestion des données</Label>
                  <div className="flex gap-4">
                    <Button onClick={exportData} className="premium-button">
                      <Download className="h-4 w-4 mr-2" />
                      Exporter les données
                    </Button>
                    <Button variant="outline" className="premium-border bg-transparent">
                      <Upload className="h-4 w-4 mr-2" />
                      Importer les données
                    </Button>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer toutes les données
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="premium-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  Intégrations
                </CardTitle>
                <CardDescription>Connectez vos services externes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">QuickBooks</Label>
                    <p className="text-sm text-muted-foreground">Synchronisation comptable</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={settings.quickbooksConnected ? "default" : "secondary"}>
                      {settings.quickbooksConnected ? "Connecté" : "Déconnecté"}
                    </Badge>
                    <Button
                      size="sm"
                      variant={settings.quickbooksConnected ? "destructive" : "default"}
                      className={!settings.quickbooksConnected ? "premium-button" : ""}
                      onClick={() => handleSettingChange("quickbooksConnected", !settings.quickbooksConnected)}
                    >
                      {settings.quickbooksConnected ? "Déconnecter" : "Connecter"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end pt-6">
          <Button onClick={handleSave} className="premium-button px-8">
            <Star className="h-4 w-4 mr-2" />
            Sauvegarder les paramètres
          </Button>
        </div>
      </div>
    </div>
  )
}
