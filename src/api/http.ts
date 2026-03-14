import { useToast } from '../composables/useToast'
import type { StoredAuthSession } from './authSession'
import { AUTH_STORAGE_KEY } from './authSession'

export const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8888').replace(
  /\/$/,
  ''
)
const BASE_URL = API_BASE

let accessToken: string | null = null
let refreshToken: string | null = null
let accessExpiresAt = 0
let refreshExpiresAt = 0

/** Legacy single-token setter (e.g. tests) */
export function setAuthToken(token: string | null) {
  accessToken = token
  if (!token) {
    refreshToken = null
    accessExpiresAt = 0
    refreshExpiresAt = 0
  }
}

export function getAuthToken(): string | null {
  return accessToken
}

export function setAuthSession(session: {
  accessToken: string
  refreshToken: string
  expiresInSec: number
  refreshExpiresInSec: number
}) {
  accessToken = session.accessToken
  refreshToken = session.refreshToken
  accessExpiresAt = Date.now() + session.expiresInSec * 1000
  refreshExpiresAt = Date.now() + session.refreshExpiresInSec * 1000
}

export function clearAuthSession() {
  accessToken = null
  refreshToken = null
  accessExpiresAt = 0
  refreshExpiresAt = 0
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY)
  } catch {
    // ignore
  }
}

function persistSession(user: StoredAuthSession['user']) {
  if (!accessToken || !refreshToken) return
  const payload: StoredAuthSession = {
    user,
    accessToken,
    refreshToken,
    accessExpiresAt,
    refreshExpiresAt,
  }
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // ignore
  }
}

/** Call after login / register / refresh so localStorage stays in sync */
export function persistAuthSession(user: StoredAuthSession['user']) {
  persistSession(user)
}

let refreshInFlight: Promise<boolean> | null = null

/**
 * POST /api/v1/auth/refresh — { refresh_token }
 * Returns new access (+ optional rotated refresh) like login.
 */
async function refreshAccessToken(): Promise<boolean> {
  if (!refreshToken) return false
  if (Date.now() >= refreshExpiresAt) {
    clearAuthSession()
    return false
  }
  try {
    const res = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
    const body = (await res.json().catch(() => ({}))) as Record<string, unknown>
    if (!res.ok) return false

    const access = String(
      body.access_token ?? body.AccessToken ?? body.accessToken ?? ''
    )
    const nextRefresh = String(
      body.refresh_token ?? body.RefreshToken ?? refreshToken
    )
    const expIn = Number(body.expires_in ?? body.ExpiresIn ?? 3600)
    const refExpIn = Number(
      body.refresh_expires_in ?? body.RefreshExpiresIn ?? 7 * 24 * 3600
    )
    if (!access) return false

    accessToken = access
    refreshToken = nextRefresh
    accessExpiresAt = Date.now() + expIn * 1000
    refreshExpiresAt = Date.now() + refExpIn * 1000

    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY)
      if (raw) {
        const prev = JSON.parse(raw) as StoredAuthSession
        persistSession(prev.user)
      }
    } catch {
      // ignore
    }
    return true
  } catch {
    return false
  }
}

/** Before any authenticated request */
async function ensureAccessTokenValid(): Promise<void> {
  if (!accessToken) return
  if (!refreshToken) return
  const skew = 60_000
  if (Date.now() < accessExpiresAt - skew) return
  if (Date.now() >= refreshExpiresAt) {
    clearAuthSession()
    return
  }
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

  if (res.status === 401 && refreshToken && !retriedAfterRefresh) {
    const ok = await refreshAccessToken()
    if (ok) return request<T>(path, options, true)
    clearAuthSession()
  }

  if (!res.ok) {
    if (res.status === 401) clearAuthSession()
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
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)
  let res = await fetch(url, { ...init, headers })
  if (res.status === 401 && refreshToken) {
    const ok = await refreshAccessToken()
    if (ok) {
      headers.set('Authorization', `Bearer ${accessToken}`)
      res = await fetch(url, { ...init, headers })
    }
  }
  return res
}
