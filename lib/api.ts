import type {
  ApiResponse,
  CreateProjectBody,
  Project,
  TelemetryTestResult,
  UpdateDocumentsBody,
  UpdateTelemetryBody,
} from '@/types'

async function request<T>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(input, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    })
    const json = await res.json()
    if (!res.ok) return json as ApiResponse<T>
    return json as ApiResponse<T>
  } catch {
    return { ok: false, error: { code: 'NETWORK_ERROR', message: 'Network request failed' } }
  }
}

export const projectsApi = {
  create: (body: CreateProjectBody) =>
    request<Project>('/api/projects', { method: 'POST', body: JSON.stringify(body) }),

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
