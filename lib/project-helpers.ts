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

// Maps Supabase snake_case row → camelCase Project type
export function dbToProject(row: Record<string, unknown>): Project {
  return {
    id: row.id as string,
    status: row.status as Project['status'],
    name: row.name as string,
    location: (row.location as string) ?? '',
    jurisdiction: row.jurisdiction as Project['jurisdiction'],
    assetType: row.asset_type as Project['assetType'],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    documents: (row.documents as Project['documents']) ?? [],
    telemetry: row.telemetry as Project['telemetry'] | undefined,
  }
}
