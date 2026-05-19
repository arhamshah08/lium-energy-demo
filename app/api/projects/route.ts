import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { getProjectsByUserId, getDiscoverableProjects, insertProject } from '@/lib/db'
import { getUserFromHeader, dbToProject } from '@/lib/project-helpers'
import type { CreateProjectBody, Project, ApiResponse } from '@/types'

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse<Project[]>>> {
  const user = getUserFromHeader(req.headers.get('Authorization'))
  if (!user) {
    return NextResponse.json(
      { ok: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 },
    )
  }

  const isDiscovery = ['financier', 'securitisation_agent', 'portfolio_manager', 'investor'].includes(user.role)
  const rows = isDiscovery
    ? await getDiscoverableProjects()
    : await getProjectsByUserId(user.id)

  return NextResponse.json({ ok: true, data: rows.map(dbToProject) })
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<Project>>> {
  const user = getUserFromHeader(req.headers.get('Authorization'))
  if (!user) {
    return NextResponse.json(
      { ok: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 },
    )
  }

  const body: CreateProjectBody = await req.json()
  const name = body.name?.trim() || 'Unnamed Project'
  const jurisdiction = body.jurisdiction || 'ERCOT'
  const assetType = body.assetType || 'BESS'
  const now = new Date().toISOString()
  const f = body.financials ?? {}

  const row = await insertProject({
    id: randomUUID(),
    user_id: user.id,
    status: 'DRAFT',
    name,
    location: body.location?.trim() ?? '',
    jurisdiction,
    asset_type: assetType,
    documents: [],
    pto_status: 'PRE_PROCESSING',
    capacity_mw: f.capacityMW ?? null,
    capacity_mwh: f.capacityMWh ?? null,
    cod_date: f.codDate ?? null,
    asset_life_years: f.assetLifeYears ?? null,
    ppa_counterparty: f.ppaCounterparty ?? null,
    ppa_tariff_mwh: f.ppaTariffMwh ?? null,
    ppa_contract_end_date: f.ppaContractEndDate ?? null,
    total_capex_m: f.totalCapexM ?? null,
    debt_pct: f.debtPct ?? null,
    equity_pct: f.equityPct ?? null,
    annual_revenue_m: f.annualRevenueM ?? null,
    annual_opex_m: f.annualOpexM ?? null,
    annual_debt_service_m: f.annualDebtServiceM ?? null,
    gap_funding_eligible: f.gapFundingEligible ?? false,
    gap_funding_program: f.gapFundingProgram ?? null,
    asset_details: f.assetDetails ?? null,
    created_at: now,
    updated_at: now,
  })

  return NextResponse.json({ ok: true, data: dbToProject(row) }, { status: 201 })
}
