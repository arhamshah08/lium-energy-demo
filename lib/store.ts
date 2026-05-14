import type { Project } from '@/types'
import { supabase } from './supabase'
import { getProjectById, updateProject, insertProject, type DbProject } from './db'

function dbToProject(row: DbProject): Project {
  return {
    id: row.id,
    status: row.status as Project['status'],
    name: row.name ?? '',
    location: row.location ?? '',
    jurisdiction: (row.jurisdiction as Project['jurisdiction']) ?? 'ERCOT',
    assetType: (row.asset_type as Project['assetType']) ?? 'BESS',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    documents: row.documents
      ? (typeof row.documents === 'string'
          ? JSON.parse(row.documents)
          : row.documents) as Project['documents']
      : [],
    telemetry: row.telemetry
      ? (typeof row.telemetry === 'string'
          ? JSON.parse(row.telemetry)
          : row.telemetry) as Project['telemetry']
      : undefined,
  }
}

export async function getProject(id: string): Promise<Project | undefined> {
  const row = await getProjectById(id)
  if (!row) return undefined
  return dbToProject(row)
}

export async function saveProject(project: Project): Promise<Project> {
  const existing = await getProjectById(project.id)
  if (existing) {
    await updateProject(project.id, {
      status: project.status,
      name: project.name,
      location: project.location,
      jurisdiction: project.jurisdiction,
      asset_type: project.assetType,
      documents: project.documents,
      telemetry: project.telemetry,
      updated_at: project.updatedAt,
    })
  } else {
    await insertProject({
      id: project.id,
      user_id: 'system',
      status: project.status,
      name: project.name,
      location: project.location,
      jurisdiction: project.jurisdiction,
      asset_type: project.assetType,
      documents: project.documents,
      created_at: project.createdAt,
      updated_at: project.updatedAt,
    })
  }
  return project
}

export async function listProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  const rows = (data ?? []) as DbProject[]
  return rows.map(dbToProject)
}
