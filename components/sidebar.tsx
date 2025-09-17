"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  Calendar,
  Users,
  Clock,
  Receipt,
  CheckSquare,
  Database,
  Settings,
  Sparkles,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Calendrier", href: "/calendrier", icon: Calendar },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Heures", href: "/heures", icon: Clock },
  { name: "Dépenses", href: "/depenses", icon: Receipt },
  { name: "Tâches", href: "/taches", icon: CheckSquare },
  { name: "Données", href: "/donnees", icon: Database },
  { name: "Paramètres", href: "/parametres", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200 shadow-lg">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-gray-200 bg-gradient-to-r from-primary to-secondary">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-8 w-8 text-white" />
          <span className="text-xl font-bold text-white">JM Plan</span>
          <Badge className="bg-white/20 text-white text-xs">Premium</Badge>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg transform scale-105"
                  : "text-gray-700 hover:bg-gradient-to-r hover:from-primary/10 hover:to-secondary/10 hover:text-primary",
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 transition-colors duration-200",
                  isActive ? "text-white" : "text-gray-500 group-hover:text-primary",
                )}
              />
              {item.name}
              {isActive && <div className="ml-auto h-2 w-2 rounded-full bg-white/80" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                <span className="text-sm font-medium text-white">JM</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Jean Martin</p>
              <p className="text-xs text-gray-500">Premium Account</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
