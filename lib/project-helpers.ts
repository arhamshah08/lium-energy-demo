import jwt from 'jsonwebtoken'
import type { Project } from '@/types'

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-production'

export function getUserFromHeader(authHeader: string | null): { id: string; role: string } | null {
  if (!authHeader?.startsWith('Bearer ')) return null
  try {
    const token = authHeader.slice(7)
    const payload = jwt.verify(token, JWT_SECRET) as { id: string; role: string }
    return payload
  } catch {
    return null
  }
}

function parseJson<T>(value: unknown): T | undefined {
  if (value === undefined || value === null) return undefined
  if (typeof value === 'string') {
    try { return JSON.parse(value) as T } catch { return undefined }
  }
  return value as T
}

// Maps DB snake_case row → camelCase Project type
export function dbToProject(row: Record<string, unknown> | object): Project {
  const r = row as Record<string, unknown>
  return {
    id: r.id as string,
    status: r.status as Project['status'],
    name: r.name as string,
    location: (r.location as string) ?? '',
    jurisdiction: r.jurisdiction as Project['jurisdiction'],
    assetType: r.asset_type as Project['assetType'],
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
    documents: parseJson<Project['documents']>(r.documents) ?? [],
    telemetry: parseJson<Project['telemetry']>(r.telemetry),
  }
}
