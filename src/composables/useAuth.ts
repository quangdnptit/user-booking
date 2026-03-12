import { ref, computed, onMounted } from 'vue'
import type { User } from '../types'
import { api } from '../api/client'
import { setAuthToken } from '../api/http'

const AUTH_KEY = 'reel-user-booking-auth'

const user = ref<User | null>(null)
const token = ref<string | null>(null)
const isLoading = ref(true)

function loadStored() {
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    if (!raw) return
    const { user: u, token: t } = JSON.parse(raw) as { user: User; token: string }
    if (u && t) {
      user.value = u
      token.value = t
      setAuthToken(t)
    }
  } catch {
    // ignore
  }
}

function saveStored() {
  if (user.value && token.value) {
    localStorage.setItem(AUTH_KEY, JSON.stringify({ user: user.value, token: token.value }))
  } else {
    localStorage.removeItem(AUTH_KEY)
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
    token.value = res.token
    saveStored()
  }

  async function logout() {
    await api.logout()
    user.value = null
    token.value = null
    saveStored()
  }

  return {
    user: computed(() => user.value),
    isLoading: computed(() => isLoading.value),
    isAuthenticated,
    login,
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
