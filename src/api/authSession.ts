/** Persisted auth shape (localStorage) — matches BE LoginResult tokens */
export interface StoredAuthSession {
  user: { id: string; email: string; name: string; avatar?: string; amount?: number }
  accessToken: string
  refreshToken: string
  /** epoch ms */
  accessExpiresAt: number
  refreshExpiresAt: number
}

export const AUTH_STORAGE_KEY = 'reel-user-booking-auth'
