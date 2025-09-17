import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  if (error) {
    return NextResponse.redirect(new URL(`/parametres?error=${error}`, request.url))
  }

  if (code) {
    // Créer une page de callback qui ferme la fenêtre et envoie le code au parent
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentification Google Calendar</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #E91E63, #FF6EC7);
              color: white;
            }
            .container {
              text-align: center;
              padding: 2rem;
              border-radius: 1rem;
              background: rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(10px);
            }
            .spinner {
              width: 40px;
              height: 40px;
              border: 4px solid rgba(255, 255, 255, 0.3);
              border-top: 4px solid white;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin: 0 auto 1rem;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="spinner"></div>
            <h2>Authentification réussie !</h2>
            <p>Fermeture de la fenêtre...</p>
          </div>
          <script>
            // Envoyer le code au parent et fermer la fenêtre
            if (window.opener) {
              window.opener.postMessage({
                type: 'GOOGLE_AUTH_SUCCESS',
                code: '${code}'
              }, window.location.origin);
              window.close();
            } else {
              // Fallback si pas de fenêtre parent
              window.location.href = '/parametres?google_auth=success';
            }
          </script>
        </body>
      </html>
    `

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
      },
    })
  }

  return NextResponse.redirect(new URL("/parametres", request.url))
}
