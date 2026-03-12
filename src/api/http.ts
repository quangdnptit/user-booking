import { useToast } from '../composables/useToast'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

let authToken: string | null = null

export function setAuthToken(token: string | null) {
  authToken = token
}

export function getAuthToken(): string | null {
  return authToken
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
  options: RequestInit & { params?: Record<string, string> } = {}
): Promise<T> {
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
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
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
  if (!res.ok) {
    if (res.status === 401) setAuthToken(null)
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
