"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Keyboard, Command } from "lucide-react"

export function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "?" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === "Escape") {
        setIsOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const shortcuts = [
    { key: "Ctrl + ?", description: "Afficher les raccourcis clavier" },
    { key: "Ctrl + N", description: "Nouveau client" },
    { key: "Ctrl + Shift + N", description: "Nouveau rendez-vous" },
    { key: "Ctrl + K", description: "Recherche rapide" },
    { key: "Ctrl + S", description: "Sauvegarder" },
    { key: "Ctrl + D", description: "Tableau de bord" },
    { key: "Ctrl + C", description: "Calendrier" },
    { key: "Ctrl + H", description: "Pointeur d'heures" },
    { key: "Ctrl + T", description: "Tâches" },
    { key: "Escape", description: "Fermer les dialogues" },
  ]

  return (
    <>
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="p-3 rounded-full bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
          title="Raccourcis clavier (Ctrl + ?)"
        >
          <Keyboard className="h-5 w-5" />
        </button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px] premium-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <Command className="h-5 w-5" />
              Raccourcis clavier
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-primary/5">
                <span className="text-sm">{shortcut.description}</span>
                <Badge variant="outline" className="premium-border font-mono text-xs">
                  {shortcut.key}
                </Badge>
              </div>
            ))}
          </div>

          <div className="mt-6 p-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
            <p className="text-xs text-center text-muted-foreground">
              💡 <strong>Astuce Premium :</strong> Utilisez ces raccourcis pour une navigation ultra-rapide !
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
