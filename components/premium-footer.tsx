"use client"

import { Badge } from "@/components/ui/badge"
import { Crown, Heart, Zap } from "lucide-react"

export function PremiumFooter() {
  return (
    <footer className="mt-12 border-t border-gray-200/50 bg-gradient-to-r from-primary/5 to-secondary/5">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-secondary">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-primary">JM Plan Premium</h3>
              <p className="text-xs text-muted-foreground">Gestion d'entreprise nouvelle génération</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Badge className="premium-gradient text-white border-0">
              <Zap className="h-3 w-3 mr-1" />
              Version 2.0.0
            </Badge>

            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>Fait avec</span>
              <Heart className="h-4 w-4 text-red-500 fill-current animate-pulse" />
              <span>par l'équipe JM Plan</span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200/50 text-center">
          <p className="text-xs text-muted-foreground">
            © 2024 JM Plan Premium. Tous droits réservés.
            <span className="ml-2 text-primary font-medium">Propulsé par l'intelligence artificielle</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
