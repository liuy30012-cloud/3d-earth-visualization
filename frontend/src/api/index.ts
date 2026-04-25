const API_BASE = 'http://localhost:8080/api'

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  const token = localStorage.getItem('token')
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T | undefined> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...getHeaders(), ...(options.headers as Record<string, string>) },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `HTTP ${res.status}`)
  }
  const text = await res.text()
  return text ? JSON.parse(text) : undefined
}

// Auth
export function login(phone: string | undefined, email: string | undefined, password: string) {
  return apiFetch<{ token: string; userId: number; phone: string; email: string; nickname: string; avatar: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ phone, email, password }),
  })
}

export function register(phone: string | undefined, email: string | undefined, password: string, code?: string) {
  return apiFetch<{ token: string; userId: number; phone: string; email: string; nickname: string; avatar: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ phone, email, password, code }),
  })
}

export function sendSmsCode(phone: string) {
  return apiFetch<string>(`/auth/sms/send?phone=${encodeURIComponent(phone)}`, { method: 'POST' })
}

export function sendEmailCode(email: string) {
  return apiFetch<string>(`/auth/email/send?email=${encodeURIComponent(email)}`, { method: 'POST' })
}

// Data Points
export interface DataPoint {
  id: number
  userId: number
  name: string
  latitude: number
  longitude: number
  country: string
  type: string
}

export function getDataPoints() {
  return apiFetch<DataPoint[]>('/data-points')
}

export function createDataPoint(data: { name: string; latitude: number; longitude: number; country: string; type?: string }) {
  return apiFetch<DataPoint>('/data-points', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateDataPoint(id: number, data: { name?: string; latitude?: number; longitude?: number; country?: string; type?: string }) {
  return apiFetch<DataPoint>(`/data-points/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteDataPoint(id: number) {
  return apiFetch<void>(`/data-points/${id}`, { method: 'DELETE' })
}
