"use client"

import { Loader2, Crown } from "lucide-react"

interface PremiumLoadingProps {
  message?: string
  size?: "sm" | "md" | "lg"
}

export function PremiumLoading({ message = "Chargement...", size = "md" }: PremiumLoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative">
        <div className="absolute inset-0 animate-ping">
          <Crown className={`${sizeClasses[size]} text-primary opacity-75`} />
        </div>
        <Loader2 className={`${sizeClasses[size]} text-primary animate-spin`} />
      </div>
      <p className="mt-4 text-sm text-muted-foreground font-medium">{message}</p>
      <div className="mt-2 flex space-x-1">
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
        <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
      </div>
    </div>
  )
}
