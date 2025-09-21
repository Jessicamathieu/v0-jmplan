import type React from "react"
import type { Metadata } from "next"
copilot/vscode1758422801650
import { Inter } from "next/font/google" // Temporarily disabled due to network restrictions in build environment
main
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Sidebar } from "@/components/sidebar"
import { Toaster } from "@/components/ui/toaster"

copilot/vscode1758422801650
const inter = Inter({ subsets: ["latin"] }) // Restore when Google Fonts access is available

main
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
copilot/vscode1758422801650
      <body className="">{/* inter.className - restore when Google Fonts available */}
      <body className="font-sans antialiased">
main
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
