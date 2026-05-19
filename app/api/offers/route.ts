import { NextRequest, NextResponse } from 'next/server'
import { getOffersByFinancierId, getProjectById, expireStaleOffers } from '@/lib/db'
import { getUserFromHeader } from '@/lib/project-helpers'
import type { ApiResponse, FinancierOffer } from '@/types'

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse<(FinancierOffer & { projectName: string; projectLocation: string })[]>>> {
  const user = getUserFromHeader(req.headers.get('Authorization'))
  if (!user) return NextResponse.json({ ok: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
  if (user.role !== 'financier') return NextResponse.json({ ok: false, error: { code: 'FORBIDDEN', message: 'Financiers only' } }, { status: 403 })

  const offers = await getOffersByFinancierId(user.id)

  const enriched = await Promise.all(
    offers.map(async o => {
      await expireStaleOffers(o.project_id)
      const proj = await getProjectById(o.project_id)
      return {
        id: o.id,
        projectId: o.project_id,
        projectName: proj?.name ?? o.project_id,
        projectLocation: proj?.location ?? '',
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
      }
    }),
  )

  return NextResponse.json({ ok: true, data: enriched })
}
