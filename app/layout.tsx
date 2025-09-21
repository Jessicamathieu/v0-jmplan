import type React from "react"
import type { Metadata } from "next"
// import { Inter } from "next/font/google" // Temporarily disabled due to network restrictions in build environment
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Sidebar } from "@/components/sidebar"
import { Toaster } from "@/components/ui/toaster"

// const inter = Inter({ subsets: ["latin"] }) // Restore when Google Fonts access is available

export const metadata: Metadata = {
  title: "JM Plan - Gestion de Planning",
  description: "Application de gestion de planning professionnel",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="">{/* inter.className - restore when Google Fonts available */}
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 overflow-auto">{children}</main>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
