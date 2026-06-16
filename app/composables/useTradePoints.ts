export const useTradePoints = () => {
  const token = useState<string | null>('authToken', () => null)
  const userPoints = ref(0)
  const isLoading = ref(false)
  const error = ref('')

  /**
   * Fetcht die aktuellen Punkte des Benutzers
   */
  async function fetchUserPoints() {
    if (!token.value) return

    isLoading.value = true
    error.value = ''

    try {
      const res = await $fetch<{ points: number }>('/api/users/points', {
        headers: { Authorization: `Bearer ${token.value}` }
      })
      userPoints.value = res.points
    } catch (e: any) {
      error.value = e.data?.statusMessage || 'Fehler beim Laden der Punkte'
      console.error('Error fetching points:', error.value)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Completed a trade and returns the awarded points
   */
  async function completeTrade(data: {
    itemTitle: string
    itemDescription?: string
    partnerLogin: string
    partnerId: string
  }) {
    if (!token.value) throw new Error('Not authenticated')

    isLoading.value = true
    error.value = ''

    try {
      const res = await $fetch<{
        success: boolean
        message?: string
        pointsAwarded: number
      }>('/api/trades/complete', {
        method: 'POST',
        body: data,
        headers: { Authorization: `Bearer ${token.value}` }
      })

      if (res.success) {
        // Punkte aktualisieren
        await fetchUserPoints()
        return res.pointsAwarded
      } else {
        throw new Error(res.message || 'Trade completion failed')
      }
    } catch (e: any) {
      error.value = e.data?.statusMessage || e.message || 'Fehler beim Tausch'
      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Speichert das Glücksrad-Ergebnis
   */
  async function saveSpinResult(data: {
    multiplier: number
    pointsBefore: number
    pointsAfter: number
  }) {
    if (!token.value) throw new Error('Not authenticated')

    try {
      const res = await $fetch<{ success: boolean; newBalance: number }>(
        '/api/trades/spin-result',
        {
          method: 'POST',
          body: data,
          headers: { Authorization: `Bearer ${token.value}` }
        }
      )

      if (res.success) {
        userPoints.value = res.newBalance
      }
      return res
    } catch (e: any) {
      console.error('Error saving spin result:', e)
      throw e
    }
  }

  return {
    userPoints: readonly(userPoints),
    isLoading: readonly(isLoading),
    error: readonly(error),
    fetchUserPoints,
    completeTrade,
    saveSpinResult
  }
}
