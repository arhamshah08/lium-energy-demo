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
  const financials: Project['financials'] = {
    capacityMW: r.capacity_mw as number | undefined,
    capacityMWh: r.capacity_mwh as number | undefined,
    codDate: r.cod_date as string | undefined,
    assetLifeYears: r.asset_life_years as number | undefined,
    ppaCounterparty: r.ppa_counterparty as string | undefined,
    ppaTariffMwh: r.ppa_tariff_mwh as number | undefined,
    ppaContractEndDate: r.ppa_contract_end_date as string | undefined,
    totalCapexM: r.total_capex_m as number | undefined,
    debtPct: r.debt_pct as number | undefined,
    equityPct: r.equity_pct as number | undefined,
    annualRevenueM: r.annual_revenue_m as number | undefined,
    annualOpexM: r.annual_opex_m as number | undefined,
    annualDebtServiceM: r.annual_debt_service_m as number | undefined,
    quarterlyFundingAskM: r.quarterly_funding_ask_m as number | undefined,
    gapFundingEligible: (r.gap_funding_eligible as boolean) ?? false,
    gapFundingProgram: r.gap_funding_program as string | undefined,
    ...(() => {
      const ad = parseJson<Record<string, unknown>>(r.asset_details)
      return {
        assetDetails: ad,
        assetMake: ad?.make as string | undefined,
        assetModel: ad?.model as string | undefined,
        assetUnitCount: ad?.unitCount as number | undefined,
        constructionStartDate: ad?.constructionStartDate as string | undefined,
        ptoDate: ad?.ptoDate as string | undefined,
        fundingSchedule: ad?.fundingSchedule as import('@/types').FundingScheduleRow[] | undefined,
      }
    })(),
  }
  const hasFinancials = Object.values(financials).some(v => v !== undefined && v !== false)

  return {
    id: r.id as string,
    status: r.status as Project['status'],
    name: r.name as string,
    location: (r.location as string) ?? '',
    jurisdiction: r.jurisdiction as Project['jurisdiction'],
    assetType: r.asset_type as Project['assetType'],
    ptoStatus: ((r.pto_status as string) ?? 'PRE_PROCESSING') as Project['ptoStatus'],
    financials: hasFinancials ? financials : undefined,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
    documents: parseJson<Project['documents']>(r.documents) ?? [],
    telemetry: parseJson<Project['telemetry']>(r.telemetry),
  }
}
