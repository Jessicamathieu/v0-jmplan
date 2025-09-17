"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Calendar,
  Clock,
  Users,
  BarChart,
  Settings,
  LogOut,
  DollarSign,
  CheckSquare,
  Database,
  Crown,
  Zap,
  Star,
  Menu,
  X,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"

export function Headbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const navigation = [
    { name: "Tableau de bord", href: "/", icon: BarChart, premium: false },
    { name: "Calendrier", href: "/calendrier", icon: Calendar, premium: true },
    { name: "Pointeur d'heures", href: "/heures", icon: Clock, premium: true },
    { name: "Tâches", href: "/taches", icon: CheckSquare, premium: false },
    { name: "Clients", href: "/clients", icon: Users, premium: true },
    { name: "Dépenses", href: "/depenses", icon: DollarSign, premium: true },
    { name: "Données", href: "/donnees", icon: Database, premium: false },
    { name: "Paramètres", href: "/parametres", icon: Settings, premium: false },
  ]

  return (
    <>
      {/* Headbar Desktop */}
      <header className="hidden md:flex h-16 bg-gradient-to-r from-white to-gray-50/50 border-b border-gray-200/50 shadow-xl">
        <div className="flex items-center justify-between w-full px-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-secondary shadow-lg">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                JM Plan
              </h1>
              <Badge className="text-xs premium-gradient text-white border-0 px-2 py-0">Premium</Badge>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-4 py-2 text-sm rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg transform scale-105 premium-glow"
                      : "text-gray-700 hover:bg-gradient-to-r hover:from-primary/10 hover:to-secondary/10 hover:text-primary hover:shadow-md hover:transform hover:scale-102"
                  }`}
                >
                  <item.icon
                    className={`mr-2 h-4 w-4 transition-all duration-200 ${
                      isActive ? "text-white" : "text-gray-500 group-hover:text-primary"
                    }`}
                  />
                  <span className="font-medium hidden lg:block">{item.name}</span>
                  {item.premium && (
                    <div className="ml-2">
                      {isActive ? (
                        <Star className="h-3 w-3 text-white" />
                      ) : (
                        <Zap className="h-3 w-3 text-primary opacity-60 group-hover:opacity-100" />
                      )}
                    </div>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Section Premium */}
            <div className="premium-card p-3 rounded-xl">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Premium</span>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Actif</span>
                </div>
              </div>
            </div>

            {/* Déconnexion */}
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-primary hover:bg-primary/10 transition-all duration-200"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Headbar Mobile */}
      <header className="md:hidden flex h-16 bg-gradient-to-r from-white to-gray-50/50 border-b border-gray-200/50 shadow-xl">
        <div className="flex items-center justify-between w-full px-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-secondary shadow-lg">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                JM Plan
              </h1>
              <Badge className="text-xs premium-gradient text-white border-0 px-1 py-0">Premium</Badge>
            </div>
          </div>

          {/* Menu Mobile */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-primary">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-gradient-to-b from-white to-gray-50/50">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-secondary shadow-lg">
                    <Crown className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      JM Plan
                    </h1>
                    <Badge className="text-xs premium-gradient text-white border-0 px-2 py-0">Premium</Badge>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <nav className="space-y-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`group flex items-center px-4 py-3 text-sm rounded-xl transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg transform scale-105 premium-glow"
                          : "text-gray-700 hover:bg-gradient-to-r hover:from-primary/10 hover:to-secondary/10 hover:text-primary hover:shadow-md hover:transform hover:scale-102"
                      }`}
                    >
                      <item.icon
                        className={`mr-3 h-5 w-5 transition-all duration-200 ${
                          isActive ? "text-white" : "text-gray-500 group-hover:text-primary"
                        }`}
                      />
                      <span className="font-medium">{item.name}</span>
                      {item.premium && (
                        <div className="ml-auto">
                          {isActive ? (
                            <Star className="h-4 w-4 text-white" />
                          ) : (
                            <Zap className="h-4 w-4 text-primary opacity-60 group-hover:opacity-100" />
                          )}
                        </div>
                      )}
                    </Link>
                  )
                })}
              </nav>

              <div className="mt-8 space-y-4">
                {/* Section Premium */}
                <div className="premium-card p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-primary">Version Premium</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">Profitez de toutes les fonctionnalités avancées</p>
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Actif</span>
                  </div>
                </div>

                {/* Déconnexion */}
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-600 hover:text-primary hover:bg-primary/10 transition-all duration-200"
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Déconnexion
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </>
  )
}
