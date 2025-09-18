import { type NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"
import { DatabaseService } from "@/lib/database"

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const error = searchParams.get("error")

    if (error) {
      return NextResponse.redirect(new URL(`/parametres?google_error=${encodeURIComponent(error)}`, request.url))
    }

    if (!code) {
      return NextResponse.redirect(new URL("/parametres?google_error=no_code", request.url))
    }

    // Échanger le code contre des tokens
    const { tokens } = await oauth2Client.getToken(code)

    if (!tokens.access_token) {
      throw new Error("Aucun access token reçu")
    }

    // Calculer la date d'expiration
    const expiresAt = new Date()
    if (tokens.expiry_date) {
      expiresAt.setTime(tokens.expiry_date)
    } else {
      expiresAt.setTime(Date.now() + 3600 * 1000) // 1 heure par défaut
    }

    // Sauvegarder les tokens en base
    const userId = "default_user" // À adapter selon votre système d'auth
    await DatabaseService.saveGoogleTokens(userId, {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || undefined,
      expires_at: expiresAt.toISOString(),
      scope: tokens.scope || "https://www.googleapis.com/auth/calendar",
    })

    // Rediriger vers la page de paramètres avec succès
    return NextResponse.redirect(new URL("/parametres?google_success=true", request.url))
  } catch (error) {
    console.error("Erreur lors du callback Google:", error)

    return NextResponse.redirect(new URL(`/parametres?google_error=${encodeURIComponent("auth_failed")}`, request.url))
  }
}
