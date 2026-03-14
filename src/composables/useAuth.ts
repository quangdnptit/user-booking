import { ref, computed, onMounted } from 'vue'
import type { User } from '../types'
import { api } from '../api/client'
import { setAuthSession, clearAuthSession } from '../api/http'
import type { StoredAuthSession } from '../api/authSession'
import { AUTH_STORAGE_KEY } from '../api/authSession'

const user = ref<User | null>(null)
const isLoading = ref(true)

function loadStored() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return
    const data = JSON.parse(raw) as
      | StoredAuthSession
      | { user: User; token: string }

    if ('accessToken' in data && 'refreshToken' in data && data.accessToken && data.refreshToken) {
      user.value = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        avatar: data.user.avatar,
        walletAmount: data.user.amount,
      }
      if (Date.now() >= data.refreshExpiresAt) {
        clearAuthSession()
        user.value = null
        return
      }
      setAuthSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresInSec: Math.max(1, Math.floor((data.accessExpiresAt - Date.now()) / 1000)),
        refreshExpiresInSec: Math.max(1, Math.floor((data.refreshExpiresAt - Date.now()) / 1000)),
      })
      return
    }

    const legacy = data as { user: User; token: string }
    if (legacy.user && legacy.token) {
      user.value = legacy.user
      setAuthSession({
        accessToken: legacy.token,
        refreshToken: legacy.token,
        expiresInSec: 86400,
        refreshExpiresInSec: 86400 * 30,
      })
    }
  } catch {
    // ignore
  }
}

function saveStored() {
  if (!user.value) {
    clearAuthSession()
    return
  }
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (raw) {
      const data = JSON.parse(raw) as StoredAuthSession
      if (data.accessToken && data.refreshToken) {
        localStorage.setItem(
          AUTH_STORAGE_KEY,
          JSON.stringify({
            ...data,
            user: {
              id: user.value.id,
              email: user.value.email,
              name: user.value.name,
              avatar: user.value.avatar,
              amount: user.value.walletAmount,
            },
          })
        )
        return
      }
    }
  } catch {
    // fall through
  }
}

export function useAuth() {
  onMounted(() => {
    loadStored()
    if (isLoading.value) isLoading.value = false
  })

  const isAuthenticated = computed(() => !!user.value)

  async function login(email: string, password: string) {
    const res = await api.login({ email, password })
    user.value = res.user
    saveStored()
  }

  async function register(fullName: string, email: string, password: string) {
    const { session } = await api.register({
      full_name: fullName,
      email,
      password,
    })
    if (session) {
      user.value = session.user
      saveStored()
    }
    return { loggedIn: !!session }
  }

  async function logout() {
    await api.logout()
    user.value = null
    clearAuthSession()
  }

  return {
    user: computed(() => user.value),
    isLoading: computed(() => isLoading.value),
    isAuthenticated,
    login,
    register,
    logout,
  }
}

export function initAuth() {
  loadStored()
  isLoading.value = false
}

export function getAuthUser(): User | null {
  return user.value
}
