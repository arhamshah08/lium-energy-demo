import type {
  ApiResponse,
  CreateProjectBody,
  Project,
  TelemetryTestResult,
  UpdateDocumentsBody,
  UpdateTelemetryBody,
} from '@/types'

function getToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

async function request<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const token = getToken()
    const res = await fetch(path, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
    })
    const json = await res.json()
    if (!res.ok) return { ok: false, error: { code: 'API_ERROR', message: json.error?.message ?? json.message ?? 'Request failed' } }
    return json as ApiResponse<T>
  } catch {
    return { ok: false, error: { code: 'NETWORK_ERROR', message: 'Cannot connect to server' } }
  }
}

export const projectsApi = {
  create: (body: CreateProjectBody) =>
    request<Project>('/api/projects', { method: 'POST', body: JSON.stringify(body) }),

  list: () =>
    request<Project[]>('/api/projects'),

  get: (id: string) =>
    request<Project>(`/api/projects/${id}`),

  updateDocuments: (id: string, body: UpdateDocumentsBody) =>
    request<Project>(`/api/projects/${id}/documents`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  updateTelemetry: (id: string, body: UpdateTelemetryBody) =>
    request<Project>(`/api/projects/${id}/telemetry`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  testTelemetry: (id: string) =>
    request<TelemetryTestResult>(`/api/projects/${id}/telemetry/test`, { method: 'POST' }),
}
