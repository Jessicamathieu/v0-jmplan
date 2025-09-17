"use client"

import type { ReactNode } from "react"
import { Badge } from "@/components/ui/badge"
import { Crown } from "lucide-react"

interface PageHeaderProps {
  title: string
  description?: string
  icon?: ReactNode
  premium?: boolean
  children?: ReactNode
}

export function PageHeader({ title, description, icon, premium = false, children }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 mb-2">
          {icon && (
            <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-secondary shadow-lg">
              <div className="text-white">{icon}</div>
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {title}
            </h1>
            {description && <p className="text-muted-foreground mt-1">{description}</p>}
          </div>
          {premium && (
            <Badge className="premium-gradient text-white border-0 shadow-lg">
              <Crown className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          )}
        </div>
        {children && <div className="flex items-center gap-2">{children}</div>}
      </div>
    </div>
  )
}
