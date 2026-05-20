import type { Project } from '@/types'
import { supabase } from './supabase'
import { getProjectById as getDbProjectById, updateProject, insertProject, type DbProject } from './db'

function dbToProject(row: DbProject): Project {
  const financials: Project['financials'] = {
    capacityMW: row.capacity_mw ?? undefined,
    capacityMWh: row.capacity_mwh ?? undefined,
    codDate: row.cod_date ?? undefined,
    assetLifeYears: row.asset_life_years ?? undefined,
    ppaCounterparty: row.ppa_counterparty ?? undefined,
    ppaTariffMwh: row.ppa_tariff_mwh ?? undefined,
    ppaContractEndDate: row.ppa_contract_end_date ?? undefined,
    totalCapexM: row.total_capex_m ?? undefined,
    debtPct: row.debt_pct ?? undefined,
    equityPct: row.equity_pct ?? undefined,
    annualRevenueM: row.annual_revenue_m ?? undefined,
    annualOpexM: row.annual_opex_m ?? undefined,
    annualDebtServiceM: row.annual_debt_service_m ?? undefined,
    quarterlyFundingAskM: row.quarterly_funding_ask_m ?? undefined,
    gapFundingEligible: row.gap_funding_eligible,
    gapFundingProgram: row.gap_funding_program ?? undefined,
    assetDetails: row.asset_details
      ? (typeof row.asset_details === 'string' ? JSON.parse(row.asset_details) : row.asset_details) as Record<string, unknown>
      : undefined,
  }
  const hasFinancials = Object.values(financials).some(v => v !== undefined && v !== false)

  return {
    id: row.id,
    status: row.status as Project['status'],
    name: row.name ?? '',
    location: row.location ?? '',
    jurisdiction: (row.jurisdiction as Project['jurisdiction']) ?? 'ERCOT',
    assetType: (row.asset_type as Project['assetType']) ?? 'BESS',
    ptoStatus: (row.pto_status as Project['ptoStatus']) ?? 'PRE_PROCESSING',
    financials: hasFinancials ? financials : undefined,
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

export async function getProjectById(id: string): Promise<Project | undefined> {
  const row = await getDbProjectById(id)
  if (!row) return undefined
  return dbToProject(row)
}

export async function saveProject(project: Project): Promise<Project> {
  const existing = await getDbProjectById(project.id)
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

export async function getProjectsByStatus(status: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return ((data ?? []) as DbProject[]).map(dbToProject)
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
