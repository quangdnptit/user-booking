import { store } from '../store'
import { useToast } from '../composables/useToast'
import { AUTH_STORAGE_KEY } from './authSession'
import router from '../router'

export const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8888').replace(
  /\/$/,
  ''
)
const BASE_URL = API_BASE

function getAccessToken(): string | null {
  return store.state.auth.accessToken
}

function getAccessExpiresAt(): number {
  return store.state.auth.accessExpiresAt
}

/** Legacy single-token setter (e.g. tests) */
export function setAuthToken(token: string | null) {
  store.commit('auth/SET_ACCESS_TOKEN', token)
}

export function getAuthToken(): string | null {
  return getAccessToken()
}

/** Clear Vuex auth state and persisted user (no refresh token in JS). */
export function clearAuthSession() {
  store.dispatch('auth/clearSession')
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY)
  } catch {
    // ignore
  }
}

/** Redirect to login with current path as redirect query (skip if already on login/register). */
export function redirectToLogin() {
  try {
    const current = router.currentRoute?.value?.fullPath ?? window.location.pathname
    if (current === '/login' || current === '/register') return
    router.push({ path: '/login', query: { redirect: current } })
  } catch {
    window.location.href = '/login'
  }
}

/** Clear session and redirect to login (use when token is invalid / not found). */
function clearAuthAndRedirectToLogin() {
  clearAuthSession()
  redirectToLogin()
}

let refreshInFlight: Promise<boolean> | null = null

/**
 * POST /api/v1/auth/refresh with credentials: 'include' (HttpOnly cookie).
 * No body; backend reads refresh token from cookie.
 * On success commits new access token (and optional user) to Vuex.
 */
async function refreshAccessToken(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })
    const body = (await res.json().catch(() => ({}))) as Record<string, unknown>
    if (!res.ok) return false

    const access = String(
      body.access_token ?? body.AccessToken ?? body.accessToken ?? ''
    )
    const expIn = Number(body.expires_in ?? body.ExpiresIn ?? 3600)
    if (!access) return false

    store.commit('auth/SET_ACCESS_TOKEN', access)
    store.commit(
      'auth/SET_ACCESS_EXPIRES_AT',
      Date.now() + expIn * 1000
    )
    const userId = body.UserID ?? body.user_id ?? body.userId
    const email = body.Email ?? body.email
    const fullName = body.FullName ?? body.full_name
    if (userId && (email || fullName)) {
      store.commit('auth/SET_USER', {
        id: String(userId),
        email: String(email ?? ''),
        name: String(fullName ?? email ?? ''),
        avatar: body.Avatar != null ? String(body.Avatar) : body.avatar != null ? String(body.avatar) : undefined,
        walletAmount: body.Amount != null ? Number(body.Amount) : body.amount != null ? Number(body.amount) : undefined,
      })
    }
    return true
  } catch {
    return false
  }
}

/** Call on app init when user may be restored from localStorage; refresh uses HttpOnly cookie. */
export async function tryRefreshFromCookie(): Promise<boolean> {
  return refreshAccessToken()
}

/** Before any authenticated request: refresh access token if near expiry (cookie-based). */
async function ensureAccessTokenValid(): Promise<void> {
  const token = getAccessToken()
  if (!token) return
  const skew = 60_000
  if (Date.now() < getAccessExpiresAt() - skew) return
  if (refreshInFlight) {
    await refreshInFlight
    return
  }
  refreshInFlight = refreshAccessToken()
  try {
    await refreshInFlight
  } finally {
    refreshInFlight = null
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { params?: Record<string, string> } = {},
  retriedAfterRefresh = false
): Promise<T> {
  await ensureAccessTokenValid()

  const { params, ...init } = options
  let url = `${BASE_URL}${path}`
  if (params && Object.keys(params).length > 0) {
    const search = new URLSearchParams(params).toString()
    url += (url.includes('?') ? '&' : '?') + search
  }
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...((init.headers as Record<string, string>) ?? {}),
  }
  const accessToken = getAccessToken()
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }
  const res = await fetch(url, { ...init, headers })
  let body: unknown
  const ct = res.headers.get('content-type')
  if (ct?.includes('application/json')) {
    try {
      body = await res.json()
    } catch {
      body = await res.text()
    }
  } else {
    body = await res.text()
  }

  if (res.status === 401 && !retriedAfterRefresh) {
    const ok = await refreshAccessToken()
    if (ok) return request<T>(path, options, true)
    clearAuthAndRedirectToLogin()
  }

  if (!res.ok) {
    if (res.status === 401) clearAuthAndRedirectToLogin()
    const message =
      typeof body === 'object' && body !== null && 'message' in body
        ? String((body as { message: unknown }).message)
        : typeof body === 'string'
          ? body
          : `Request failed with status ${res.status}`
    const { showError } = useToast()
    showError(message)
    throw new ApiError(message, res.status, body)
  }
  return body as T
}

export const http = {
  get: <T>(path: string, options?: RequestInit & { params?: Record<string, string> }) =>
    request<T>(path, { ...options, method: 'GET' }),

  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),

  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),

  delete: (path: string) => request<void>(path, { method: 'DELETE' }),
}

/** For fetch() outside http — booking, seats, etc. */
export async function authorizedFetch(
  url: string,
  init: RequestInit = {}
): Promise<Response> {
  await ensureAccessTokenValid()
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  const token = getAccessToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  let res = await fetch(url, { ...init, headers })
  if (res.status === 401) {
    const ok = await refreshAccessToken()
    if (ok) {
      headers.set('Authorization', `Bearer ${getAccessToken()}`)
      res = await fetch(url, { ...init, headers })
    } else {
      clearAuthAndRedirectToLogin()
    }
  }
  return res
}
