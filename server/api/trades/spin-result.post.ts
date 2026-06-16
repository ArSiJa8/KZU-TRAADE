import type { H3Event } from 'h3'

interface SpinRequest {
  multiplier: number
  pointsBefore: number
  pointsAfter: number
}

interface SpinResponse {
  success: boolean
  newBalance: number
  message?: string
}

export default defineEventHandler(async (event: H3Event): Promise<SpinResponse> => {
  try {
    // Authentifizierung prüfen
    const user = await requireAuth(event)
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentifizierung erforderlich'
      })
    }

    // Request Body validieren
    const body = await readBody<SpinRequest>(event)

    if (typeof body.multiplier !== 'number' || typeof body.pointsAfter !== 'number') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Ungültige Anfrage'
      })
    }

    // TODO: Implementiere die Datenbanklogik
    // 1. Benutzer-Punkte aktualisieren
    // 2. Spin-Historie speichern
    // 3. Validiere Multiplikatoren (0, 1, 2)

    const newBalance = body.pointsAfter

    console.log(`Spin result: ${user.login} - Multiplier: ${body.multiplier}x, New Balance: ${newBalance}`)

    return {
      success: true,
      newBalance,
      message: 'Spin-Ergebnis gespeichert'
    }
  } catch (error: any) {
    console.error('Spin result error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Fehler beim Speichern des Spin-Ergebnisses'
    })
  }
})

// Helper: Authentifizierung (anpassen nach deinem Auth-System)
async function requireAuth(event: H3Event) {
  const token = getCookie(event, 'token')
  if (!token) {
    return null
  }
  // TODO: Token validieren und Benutzer abrufen
  return { login: 'user', id: '123' }
}
