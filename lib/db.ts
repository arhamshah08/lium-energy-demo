import { randomUUID } from 'crypto'
import { supabase } from './supabase'

// ── Types ────────────────────────────────────────────────

export interface DbProfile {
  id: string
  email: string
  password_hash: string
  role: string
  full_name: string
  company_name: string | null
  website: string | null
  country: string | null
  job_title: string | null
  financier_type: string | null
  registry_id: string | null
  signing_public_key: string | null
  signing_private_key: string | null
  beckn_record_id: string | null
  participants_record_id: string | null
  created_at: string
}

export interface DbProject {
  id: string
  user_id: string
  status: string
  name: string | null
  location: string | null
  jurisdiction: string | null
  asset_type: string | null
  documents: unknown // JSONB from Supabase
  telemetry: unknown // JSONB from Supabase
  created_at: string
  updated_at: string
}

// ── Profile helpers ──────────────────────────────────────

export async function insertProfile(
  profile: Omit<DbProfile, 'id' | 'created_at'> & { id?: string },
): Promise<DbProfile> {
  const id = profile.id ?? randomUUID()
  const { data, error } = await supabase
    .from('profiles')
    .insert({ ...profile, id })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as DbProfile
}

export async function getProfileById(id: string): Promise<DbProfile | undefined> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return undefined
  return data as DbProfile
}

export async function getProfileByEmail(email: string): Promise<DbProfile | undefined> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single()

  if (error || !data) return undefined
  return data as DbProfile
}

// ── Project helpers ──────────────────────────────────────

export async function insertProject(project: {
  id: string
  user_id: string
  status: string
  name: string
  location: string
  jurisdiction: string
  asset_type: string
  documents?: unknown[]
  created_at?: string
  updated_at?: string
}): Promise<DbProject> {
  const now = new Date().toISOString()
  const row = {
    ...project,
    documents: project.documents ?? [],
    created_at: project.created_at ?? now,
    updated_at: project.updated_at ?? now,
  }

  const { data, error } = await supabase.from('projects').insert(row).select().single()
  if (error) throw new Error(error.message)
  return data as DbProject
}

export async function getProjectById(id: string): Promise<DbProject | undefined> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return undefined
  return data as DbProject
}

export async function getProjectsByUserId(userId: string): Promise<DbProject[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as DbProject[]
}

export async function getProjectsByStatus(status: string): Promise<DbProject[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as DbProject[]
}

export async function updateProject(
  id: string,
  updates: Partial<Omit<DbProject, 'id' | 'created_at' | 'documents' | 'telemetry'>> & {
    documents?: unknown
    telemetry?: unknown
  },
  userId?: string,
): Promise<DbProject | undefined> {
  const allowedKeys = [
    'status',
    'name',
    'location',
    'jurisdiction',
    'asset_type',
    'documents',
    'telemetry',
    'updated_at',
  ] as const
  const keys = Object.keys(updates).filter((k) =>
    allowedKeys.includes(k as typeof allowedKeys[number]),
  ) as Array<typeof allowedKeys[number]>

  if (keys.length === 0) {
    return getProjectById(id)
  }

  const updateData: Record<string, unknown> = {}
  for (const k of keys) {
    updateData[k] = updates[k as keyof typeof updates]
  }

  let query = supabase.from('projects').update(updateData).eq('id', id)
  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data, error } = await query.select()
  if (error) throw new Error(error.message)
  if (!data || data.length === 0) return undefined

  return data[0] as DbProject
}

export default supabase
