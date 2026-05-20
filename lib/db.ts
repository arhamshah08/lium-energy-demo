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
  pto_status: string
  capacity_mw: number | null
  capacity_mwh: number | null
  cod_date: string | null
  asset_life_years: number | null
  ppa_counterparty: string | null
  ppa_tariff_mwh: number | null
  ppa_contract_end_date: string | null
  total_capex_m: number | null
  debt_pct: number | null
  equity_pct: number | null
  annual_revenue_m: number | null
  annual_opex_m: number | null
  annual_debt_service_m: number | null
  quarterly_funding_ask_m: number | null
  gap_funding_eligible: boolean
  gap_funding_program: string | null
  asset_details: unknown
  documents: unknown
  telemetry: unknown
  created_at: string
  updated_at: string
}

export interface DbOffer {
  id: string
  project_id: string
  financier_id: string
  loan_amount_m: number
  rate_type: string
  rate_pct: number | null
  sofr_spread_pct: number | null
  tenor_years: number
  dscr_covenant: number
  security_requirements: string | null
  conditions_precedent: string | null
  expires_at: string
  status: string
  revision_notes: string | null
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
  pto_status?: string
  capacity_mw?: number | null
  capacity_mwh?: number | null
  cod_date?: string | null
  asset_life_years?: number | null
  ppa_counterparty?: string | null
  ppa_tariff_mwh?: number | null
  ppa_contract_end_date?: string | null
  total_capex_m?: number | null
  debt_pct?: number | null
  equity_pct?: number | null
  annual_revenue_m?: number | null
  annual_opex_m?: number | null
  annual_debt_service_m?: number | null
  quarterly_funding_ask_m?: number | null
  gap_funding_eligible?: boolean
  gap_funding_program?: string | null
  asset_details?: unknown
  created_at?: string
  updated_at?: string
}): Promise<DbProject> {
  const now = new Date().toISOString()
  const row = {
    ...project,
    documents: project.documents ?? [],
    pto_status: project.pto_status ?? 'PRE_PROCESSING',
    gap_funding_eligible: project.gap_funding_eligible ?? false,
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

export async function getDiscoverableProjects(): Promise<DbProject[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .in('status', [
      'COMING_SOON', 'SUBMITTED', 'ACTIVE',
      'PUBLISHED_FOR_FINANCE', 'OFFER_RECEIVED', 'FINANCING_ACCEPTED',
      'PUBLISHED_FOR_SA', 'TRANSACTING', 'TOKENISED',
    ])
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as DbProject[]
}

export async function updateProject(
  id: string,
  updates: Partial<Omit<DbProject, 'id' | 'created_at' | 'documents' | 'telemetry'>> & {
    documents?: unknown
    telemetry?: unknown
    asset_details?: unknown
  },
  userId?: string,
): Promise<DbProject | undefined> {
  const allowedKeys = [
    'status',
    'name',
    'location',
    'jurisdiction',
    'asset_type',
    'pto_status',
    'capacity_mw',
    'capacity_mwh',
    'cod_date',
    'asset_life_years',
    'ppa_counterparty',
    'ppa_tariff_mwh',
    'ppa_contract_end_date',
    'total_capex_m',
    'debt_pct',
    'equity_pct',
    'annual_revenue_m',
    'annual_opex_m',
    'annual_debt_service_m',
    'quarterly_funding_ask_m',
    'gap_funding_eligible',
    'gap_funding_program',
    'asset_details',
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

// ── Offer helpers ────────────────────────────────────────

export async function insertOffer(offer: Omit<DbOffer, 'created_at' | 'updated_at'>): Promise<DbOffer> {
  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('project_offers')
    .insert({ ...offer, created_at: now, updated_at: now })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as DbOffer
}

export async function getOffersByProjectId(projectId: string): Promise<DbOffer[]> {
  const { data, error } = await supabase
    .from('project_offers')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as DbOffer[]
}

export async function getOffersByFinancierId(financierId: string): Promise<DbOffer[]> {
  const { data, error } = await supabase
    .from('project_offers')
    .select('*')
    .eq('financier_id', financierId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as DbOffer[]
}

export async function getOfferById(id: string): Promise<DbOffer | undefined> {
  const { data, error } = await supabase
    .from('project_offers')
    .select('*')
    .eq('id', id)
    .single()
  if (error || !data) return undefined
  return data as DbOffer
}

export async function updateOffer(
  id: string,
  updates: Partial<Pick<DbOffer, 'status' | 'revision_notes' | 'loan_amount_m' | 'rate_type' | 'rate_pct' | 'sofr_spread_pct' | 'tenor_years' | 'dscr_covenant' | 'security_requirements' | 'conditions_precedent' | 'expires_at'>>,
): Promise<DbOffer | undefined> {
  const { data, error } = await supabase
    .from('project_offers')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error || !data) return undefined
  return data as DbOffer
}

export async function getOffersByDeveloperUserId(
  userId: string,
): Promise<(DbOffer & { projectName: string; projectLocation: string })[]> {
  const projects = await getProjectsByUserId(userId)
  if (projects.length === 0) return []
  const ids = projects.map(p => p.id)
  const nameMap = new Map(projects.map(p => [p.id, { name: p.name ?? '', location: p.location ?? '' }]))
  const { data, error } = await supabase
    .from('project_offers')
    .select('*')
    .in('project_id', ids)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map(o => ({
    ...(o as DbOffer),
    projectName: nameMap.get(o.project_id)?.name ?? '',
    projectLocation: nameMap.get(o.project_id)?.location ?? '',
  }))
}

export async function expireStaleOffers(projectId: string): Promise<void> {
  await supabase
    .from('project_offers')
    .update({ status: 'EXPIRED', updated_at: new Date().toISOString() })
    .eq('project_id', projectId)
    .eq('status', 'PENDING')
    .lt('expires_at', new Date().toISOString())
}

export default supabase
