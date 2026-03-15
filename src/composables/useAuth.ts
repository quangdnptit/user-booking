import { ref, computed, onMounted } from 'vue'
import type { User } from '../types'
import { api } from '../api/client'
import { clearAuthSession, tryRefreshFromCookie, redirectToLogin } from '../api/http'
import type { StoredAuthSession } from '../api/authSession'
import { AUTH_STORAGE_KEY } from '../api/authSession'
import { store } from '../store'

const isLoading = ref(true)

function loadStored() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return
    const data = JSON.parse(raw) as StoredAuthSession | { user: User; token?: string }
    const user = 'user' in data ? data.user : null
    if (user && user.id && user.email) {
      store.commit('auth/SET_USER', {
        id: user.id,
        email: user.email,
        name: user.name ?? user.email,
        avatar: user.avatar,
        walletAmount: (user as { amount?: number }).amount ?? (user as User).walletAmount,
      })
    }
  } catch {
    // ignore
  }
}

function saveStored() {
  const user = store.state.auth.user
  if (!user) {
    clearAuthSession()
    return
  }
  try {
    const payload: StoredAuthSession = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        amount: user.walletAmount,
      },
    }
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // ignore
  }
}

export function useAuth() {
  onMounted(() => {
    loadStored()
    if (isLoading.value) isLoading.value = false
  })

  const user = computed(() => store.state.auth.user)
  const isAuthenticated = computed(() => !!store.state.auth.user)

  async function login(email: string, password: string) {
    const res = await api.login({ email, password })
    store.dispatch('auth/setSession', {
      accessToken: res.accessToken,
      expiresInSec: res.expiresInSec,
      user: res.user,
    })
    saveStored()
  }

  async function register(fullName: string, email: string, password: string) {
    const { session } = await api.register({
      full_name: fullName,
      email,
      password,
    })
    if (session) {
      store.dispatch('auth/setSession', {
        accessToken: session.accessToken,
        expiresInSec: session.expiresInSec,
        user: session.user,
      })
      saveStored()
    }
    return { loggedIn: !!session }
  }

  async function logout() {
    await api.logout()
    clearAuthSession()
    redirectToLogin()
  }

  return {
    user,
    isLoading: computed(() => isLoading.value),
    isAuthenticated,
    login,
    register,
    logout,
  }
}

export async function initAuth() {
  loadStored()
  if (store.state.auth.user) {
    const ok = await tryRefreshFromCookie()
    if (!ok) clearAuthSession()
    // Router guard will redirect to login on next navigation when not authenticated
  }
  isLoading.value = false
}

export function getAuthUser(): User | null {
  return store.state.auth.user
}
