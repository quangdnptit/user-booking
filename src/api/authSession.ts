/** Persisted auth: user only (access token in Vuex, refresh token in HttpOnly cookie). */
export interface StoredAuthSession {
  user: { id: string; email: string; name: string; avatar?: string; amount?: number }
}

export const AUTH_STORAGE_KEY = 'reel-user-booking-auth'
