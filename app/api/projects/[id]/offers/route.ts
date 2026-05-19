import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import {
  getProjectById,
  insertOffer,
  getOffersByProjectId,
  updateProject,
  expireStaleOffers,
} from '@/lib/db'
import { getUserFromHeader, dbToProject } from '@/lib/project-helpers'
import type { ApiResponse, CreateOfferBody, FinancierOffer } from '@/types'

function dbOfferToType(row: Awaited<ReturnType<typeof getOffersByProjectId>>[number], financierName?: string, financierCompany?: string): FinancierOffer {
  return {
    id: row.id,
    projectId: row.project_id,
    financierId: row.financier_id,
    financierName,
    financierCompany,
    loanAmountM: row.loan_amount_m,
    rateType: row.rate_type as FinancierOffer['rateType'],
    ratePct: row.rate_pct ?? undefined,
    sofrSpreadPct: row.sofr_spread_pct ?? undefined,
    tenorYears: row.tenor_years,
    dscrCovenant: row.dscr_covenant,
    securityRequirements: row.security_requirements ?? undefined,
    conditionsPrecedent: row.conditions_precedent ?? undefined,
    expiresAt: row.expires_at,
    status: row.status as FinancierOffer['status'],
    revisionNotes: row.revision_notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<ApiResponse<FinancierOffer[]>>> {
  const user = getUserFromHeader(req.headers.get('Authorization'))
  if (!user) return NextResponse.json({ ok: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })

  const { id } = await params
  await expireStaleOffers(id)
  const offers = await getOffersByProjectId(id)
  return NextResponse.json({ ok: true, data: offers.map(o => dbOfferToType(o)) })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<ApiResponse<FinancierOffer>>> {
  const user = getUserFromHeader(req.headers.get('Authorization'))
  if (!user) return NextResponse.json({ ok: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
  if (user.role !== 'financier') return NextResponse.json({ ok: false, error: { code: 'FORBIDDEN', message: 'Only financiers can submit offers' } }, { status: 403 })

  const { id } = await params
  const project = await getProjectById(id)
  if (!project) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Project not found' } }, { status: 404 })

  const allowed = ['PUBLISHED_FOR_FINANCE', 'OFFER_RECEIVED']
  if (!allowed.includes(project.status)) {
    return NextResponse.json({ ok: false, error: { code: 'INVALID_STATE', message: 'Project is not open for financing offers' } }, { status: 422 })
  }

  const body: CreateOfferBody = await req.json()
  const now = new Date().toISOString()

  const offer = await insertOffer({
    id: randomUUID(),
    project_id: id,
    financier_id: user.id,
    loan_amount_m: body.loanAmountM,
    rate_type: body.rateType,
    rate_pct: body.ratePct ?? null,
    sofr_spread_pct: body.sofrSpreadPct ?? null,
    tenor_years: body.tenorYears,
    dscr_covenant: body.dscrCovenant,
    security_requirements: body.securityRequirements ?? null,
    conditions_precedent: body.conditionsPrecedent ?? null,
    expires_at: body.expiresAt,
    status: 'PENDING',
    revision_notes: null,
  })

  if (project.status === 'PUBLISHED_FOR_FINANCE') {
    await updateProject(id, { status: 'OFFER_RECEIVED', updated_at: now })
  }

  return NextResponse.json({ ok: true, data: dbOfferToType(offer) }, { status: 201 })
}
