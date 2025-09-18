"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Palette,
  Layout,
  Settings,
  Bell,
  Keyboard,
  Download,
  Upload,
  RotateCcw,
  Save,
  Eye,
  Monitor,
  Smartphone,
  Tablet,
} from "lucide-react"
import { useCustomization } from "@/lib/customization-engine"

/**
 * Panneau de personnalisation avancée avec prévisualisation en temps réel
 * Permet aux utilisateurs de personnaliser complètement leur interface
 */
export function AdvancedCustomizationPanel() {
  const {
    preferences,
    updatePreferences,
    resetPreferences,
    applyTheme,
    generateTheme,
    exportPreferences,
    importPreferences,
    getPredefinedThemes,
    getAvailableShortcuts,
  } = useCustomization()

  const [activeTab, setActiveTab] = useState("theme")
  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [customColor, setCustomColor] = useState("#E91E63")

  const predefinedThemes = getPredefinedThemes()
  const availableShortcuts = getAvailableShortcuts()

  /**
   * Gère l'import de préférences depuis un fichier
   */
  const handleImportPreferences = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const preferences = JSON.parse(e.target?.result as string)
        importPreferences(preferences)
      } catch (error) {
        console.error("Erreur lors de l'import:", error)
      }
    }
    reader.readAsText(file)
  }

  /**
   * Gère l'export des préférences
   */
  const handleExportPreferences = () => {
    const data = exportPreferences()
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "jmplan-preferences.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  /**
   * Génère un thème personnalisé à partir d'une couleur
   */
  const handleGenerateCustomTheme = () => {
    const newTheme = generateTheme(customColor)
    updatePreferences("theme", newTheme)
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header avec actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Personnalisation Avancée
          </h1>
          <p className="text-muted-foreground mt-1">
            Adaptez JM Plan à vos besoins avec des options de personnalisation complètes
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sélecteur de mode de prévisualisation */}
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
            <Button
              variant={previewMode === "desktop" ? "default" : "ghost"}
              size="sm"
              onClick={() => setPreviewMode("desktop")}
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button
              variant={previewMode === "tablet" ? "default" : "ghost"}
              size="sm"
              onClick={() => setPreviewMode("tablet")}
            >
              <Tablet className="h-4 w-4" />
            </Button>
            <Button
              variant={previewMode === "mobile" ? "default" : "ghost"}
              size="sm"
              onClick={() => setPreviewMode("mobile")}
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-8" />

          <Button variant="outline" onClick={handleExportPreferences}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>

          <Button variant="outline" onClick={() => document.getElementById("import-file")?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Importer
          </Button>
          <input id="import-file" type="file" accept=".json" className="hidden" onChange={handleImportPreferences} />

          <Button variant="outline" onClick={resetPreferences}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Réinitialiser
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panneau de configuration */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="theme" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">Thème</span>
              </TabsTrigger>
              <TabsTrigger value="layout" className="flex items-center gap-2">
                <Layout className="h-4 w-4" />
                <span className="hidden sm:inline">Layout</span>
              </TabsTrigger>
              <TabsTrigger value="workflow" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Workflow</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="shortcuts" className="flex items-center gap-2">
                <Keyboard className="h-4 w-4" />
                <span className="hidden sm:inline">Raccourcis</span>
              </TabsTrigger>
            </TabsList>

            {/* Onglet Thème */}
            <TabsContent value="theme" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Thèmes Prédéfinis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(predefinedThemes).map(([name, theme]) => (
                      <Button
                        key={name}
                        variant="outline"
                        className="h-20 flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform bg-transparent"
                        onClick={() => applyTheme(name)}
                      >
                        <div
                          className="w-8 h-8 rounded-full border-2 border-white shadow-md"
                          style={{ backgroundColor: theme.primary }}
                        />
                        <span className="text-xs font-medium capitalize">{name}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Couleurs Personnalisées</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Couleur Principale</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={preferences.theme.primary}
                          onChange={(e) => updatePreferences("theme", { primary: e.target.value })}
                          className="w-16 h-10 p-1 border rounded"
                        />
                        <Input
                          value={preferences.theme.primary}
                          onChange={(e) => updatePreferences("theme", { primary: e.target.value })}
                          placeholder="#E91E63"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Couleur Secondaire</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={preferences.theme.secondary}
                          onChange={(e) => updatePreferences("theme", { secondary: e.target.value })}
                          className="w-16 h-10 p-1 border rounded"
                        />
                        <Input
                          value={preferences.theme.secondary}
                          onChange={(e) => updatePreferences("theme", { secondary: e.target.value })}
                          placeholder="#9C27B0"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Générateur de Thème</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={customColor}
                        onChange={(e) => setCustomColor(e.target.value)}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Button onClick={handleGenerateCustomTheme} className="flex-1">
                        Générer un thème harmonieux
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Génère automatiquement des couleurs harmonieuses basées sur votre couleur principale
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Layout */}
            <TabsContent value="layout" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configuration de la Mise en Page</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Position de la Sidebar</Label>
                      <Select
                        value={preferences.layout.sidebarPosition}
                        onValueChange={(value: "left" | "right") =>
                          updatePreferences("layout", { sidebarPosition: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">Gauche</SelectItem>
                          <SelectItem value="right">Droite</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Hauteur de l'En-tête</Label>
                      <div className="flex items-center gap-2">
                        <Slider
                          value={[preferences.layout.headerHeight]}
                          onValueChange={([value]) => updatePreferences("layout", { headerHeight: value })}
                          min={48}
                          max={96}
                          step={8}
                          className="flex-1"
                        />
                        <span className="text-sm font-mono w-12">{preferences.layout.headerHeight}px</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Mode Compact</Label>
                        <p className="text-sm text-muted-foreground">
                          Réduit l'espacement pour afficher plus de contenu
                        </p>
                      </div>
                      <Switch
                        checked={preferences.layout.compactMode}
                        onCheckedChange={(checked) => updatePreferences("layout", { compactMode: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Sidebar Réduite</Label>
                        <p className="text-sm text-muted-foreground">Affiche seulement les icônes dans la sidebar</p>
                      </div>
                      <Switch
                        checked={preferences.layout.sidebarCollapsed}
                        onCheckedChange={(checked) => updatePreferences("layout", { sidebarCollapsed: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Afficher le Pied de Page</Label>
                        <p className="text-sm text-muted-foreground">Affiche les informations de copyright et liens</p>
                      </div>
                      <Switch
                        checked={preferences.layout.footerVisible}
                        onCheckedChange={(checked) => updatePreferences("layout", { footerVisible: checked })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Colonnes de Grille ({preferences.layout.gridColumns})</Label>
                    <Slider
                      value={[preferences.layout.gridColumns]}
                      onValueChange={([value]) => updatePreferences("layout", { gridColumns: value })}
                      min={2}
                      max={6}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>2 colonnes</span>
                      <span>6 colonnes</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Workflow */}
            <TabsContent value="workflow" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configuration du Workflow</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Durée par Défaut (minutes)</Label>
                      <Input
                        type="number"
                        value={preferences.workflow.defaultAppointmentDuration}
                        onChange={(e) =>
                          updatePreferences("workflow", {
                            defaultAppointmentDuration: Number.parseInt(e.target.value) || 60,
                          })
                        }
                        min={15}
                        max={480}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Temps de Battement (minutes)</Label>
                      <Input
                        type="number"
                        value={preferences.workflow.bufferTime}
                        onChange={(e) =>
                          updatePreferences("workflow", {
                            bufferTime: Number.parseInt(e.target.value) || 15,
                          })
                        }
                        min={0}
                        max={60}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Confirmation Automatique</Label>
                        <p className="text-sm text-muted-foreground">
                          Confirme automatiquement les nouveaux rendez-vous
                        </p>
                      </div>
                      <Switch
                        checked={preferences.workflow.autoConfirmAppointments}
                        onCheckedChange={(checked) =>
                          updatePreferences("workflow", { autoConfirmAppointments: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Approbation Client Requise</Label>
                        <p className="text-sm text-muted-foreground">Le client doit approuver les modifications</p>
                      </div>
                      <Switch
                        checked={preferences.workflow.requireClientApproval}
                        onCheckedChange={(checked) => updatePreferences("workflow", { requireClientApproval: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Rappels Automatiques</Label>
                        <p className="text-sm text-muted-foreground">Envoie des rappels avant les rendez-vous</p>
                      </div>
                      <Switch
                        checked={preferences.workflow.sendReminders}
                        onCheckedChange={(checked) => updatePreferences("workflow", { sendReminders: checked })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Heures de Travail</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm">Début</Label>
                        <Input
                          type="time"
                          value={preferences.workflow.workingHours.start}
                          onChange={(e) =>
                            updatePreferences("workflow", {
                              workingHours: {
                                ...preferences.workflow.workingHours,
                                start: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Fin</Label>
                        <Input
                          type="time"
                          value={preferences.workflow.workingHours.end}
                          onChange={(e) =>
                            updatePreferences("workflow", {
                              workingHours: {
                                ...preferences.workflow.workingHours,
                                end: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Notifications */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Préférences de Notification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Notifications Email</Label>
                        <p className="text-sm text-muted-foreground">Recevoir les notifications par email</p>
                      </div>
                      <Switch
                        checked={preferences.notifications.email}
                        onCheckedChange={(checked) => updatePreferences("notifications", { email: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Notifications SMS</Label>
                        <p className="text-sm text-muted-foreground">Recevoir les notifications par SMS</p>
                      </div>
                      <Switch
                        checked={preferences.notifications.sms}
                        onCheckedChange={(checked) => updatePreferences("notifications", { sms: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Notifications Push</Label>
                        <p className="text-sm text-muted-foreground">Notifications dans le navigateur</p>
                      </div>
                      <Switch
                        checked={preferences.notifications.push}
                        onCheckedChange={(checked) => updatePreferences("notifications", { push: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Sons</Label>
                        <p className="text-sm text-muted-foreground">Jouer un son pour les notifications</p>
                      </div>
                      <Switch
                        checked={preferences.notifications.sound}
                        onCheckedChange={(checked) => updatePreferences("notifications", { sound: checked })}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label className="text-base">Canaux de Notification</Label>

                    {Object.entries(preferences.notifications.channels).map(([channel, enabled]) => (
                      <div key={channel} className="flex items-center justify-between">
                        <Label className="capitalize">
                          {channel === "appointments" && "Rendez-vous"}
                          {channel === "clients" && "Clients"}
                          {channel === "tasks" && "Tâches"}
                          {channel === "system" && "Système"}
                        </Label>
                        <Switch
                          checked={enabled}
                          onCheckedChange={(checked) =>
                            updatePreferences("notifications", {
                              channels: {
                                ...preferences.notifications.channels,
                                [channel]: checked,
                              },
                            })
                          }
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Raccourcis */}
            <TabsContent value="shortcuts" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Raccourcis Clavier</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(preferences.shortcuts).map(([shortcut, action]) => (
                    <div key={shortcut} className="flex items-center justify-between">
                      <div>
                        <Label>{availableShortcuts[action] || action}</Label>
                        <p className="text-sm text-muted-foreground">Action: {action}</p>
                      </div>
                      <Badge variant="outline" className="font-mono">
                        {shortcut}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Panneau de prévisualisation */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Aperçu en Temps Réel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`
                  border rounded-lg overflow-hidden transition-all duration-300
                  ${previewMode === "mobile" ? "w-full max-w-sm mx-auto" : ""}
                  ${previewMode === "tablet" ? "w-full max-w-md mx-auto" : ""}
                  ${previewMode === "desktop" ? "w-full" : ""}
                `}
                style={{
                  backgroundColor: preferences.theme.background,
                  color: preferences.theme.text,
                  borderColor: preferences.theme.border,
                }}
              >
                {/* Header de prévisualisation */}
                <div
                  className="p-3 border-b flex items-center justify-between"
                  style={{
                    backgroundColor: preferences.theme.surface,
                    borderColor: preferences.theme.border,
                    height: `${preferences.layout.headerHeight * 0.5}px`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded" style={{ backgroundColor: preferences.theme.primary }} />
                    <span className="font-semibold text-sm">JM Plan</span>
                  </div>
                  <Badge
                    className="text-xs"
                    style={{
                      backgroundColor: preferences.theme.primary,
                      color: "white",
                    }}
                  >
                    Premium
                  </Badge>
                </div>

                {/* Contenu de prévisualisation */}
                <div className="p-3 space-y-3">
                  <div
                    className="p-3 rounded border"
                    style={{
                      backgroundColor: preferences.theme.surface,
                      borderColor: preferences.theme.border,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preferences.theme.primary }} />
                      <span className="text-sm font-medium">Statistiques</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Aperçu des données</div>
                  </div>

                  <div
                    className="p-2 rounded text-center text-xs"
                    style={{
                      backgroundColor: preferences.theme.accent + "20",
                      color: preferences.theme.text,
                    }}
                  >
                    Mode: {previewMode}
                  </div>

                  {preferences.layout.compactMode && (
                    <div className="text-xs text-center text-muted-foreground">Mode compact activé</div>
                  )}
                </div>

                {/* Footer de prévisualisation */}
                {preferences.layout.footerVisible && (
                  <div
                    className="p-2 border-t text-center text-xs"
                    style={{
                      backgroundColor: preferences.theme.surface,
                      borderColor: preferences.theme.border,
                    }}
                  >
                    © 2024 JM Plan
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-2">
                <Button
                  size="sm"
                  className="w-full"
                  style={{
                    backgroundColor: preferences.theme.primary,
                    color: "white",
                  }}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder
                </Button>

                <div className="text-xs text-muted-foreground text-center">
                  Les changements sont appliqués en temps réel
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
