import { NextRequest, NextResponse } from 'next/server'
import { getOffersByDeveloperUserId } from '@/lib/db'
import { getUserFromHeader } from '@/lib/project-helpers'
import type { ApiResponse, FinancierOffer } from '@/types'

type OfferWithProject = FinancierOffer & { projectName: string; projectLocation: string }

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse<OfferWithProject[]>>> {
  const user = getUserFromHeader(req.headers.get('Authorization'))
  if (!user) return NextResponse.json({ ok: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
  if (user.role !== 'developer') return NextResponse.json({ ok: false, error: { code: 'FORBIDDEN', message: 'Developers only' } }, { status: 403 })

  const offers = await getOffersByDeveloperUserId(user.id)

  const result: OfferWithProject[] = offers.map(o => ({
    id: o.id,
    projectId: o.project_id,
    projectName: o.projectName,
    projectLocation: o.projectLocation,
    financierId: o.financier_id,
    loanAmountM: o.loan_amount_m,
    rateType: o.rate_type as FinancierOffer['rateType'],
    ratePct: o.rate_pct ?? undefined,
    sofrSpreadPct: o.sofr_spread_pct ?? undefined,
    tenorYears: o.tenor_years,
    dscrCovenant: o.dscr_covenant,
    securityRequirements: o.security_requirements ?? undefined,
    conditionsPrecedent: o.conditions_precedent ?? undefined,
    expiresAt: o.expires_at,
    status: o.status as FinancierOffer['status'],
    revisionNotes: o.revision_notes ?? undefined,
    createdAt: o.created_at,
    updatedAt: o.updated_at,
  }))

  return NextResponse.json({ ok: true, data: result })
}
