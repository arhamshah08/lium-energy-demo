import { NextRequest, NextResponse } from 'next/server'
import {
  getProjectById,
  getOfferById,
  getOffersByProjectId,
  updateOffer,
  updateProject,
} from '@/lib/db'
import { getUserFromHeader } from '@/lib/project-helpers'
import type { ApiResponse, FinancierOffer, UpdateOfferBody } from '@/types'

function dbOfferToType(row: NonNullable<Awaited<ReturnType<typeof getOfferById>>>): FinancierOffer {
  return {
    id: row.id,
    projectId: row.project_id,
    financierId: row.financier_id,
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; offerId: string }> },
): Promise<NextResponse<ApiResponse<FinancierOffer>>> {
  const user = getUserFromHeader(req.headers.get('Authorization'))
  if (!user) return NextResponse.json({ ok: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })

  const { id: projectId, offerId } = await params
  const offer = await getOfferById(offerId)
  if (!offer || offer.project_id !== projectId) {
    return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Offer not found' } }, { status: 404 })
  }

  const project = await getProjectById(projectId)
  if (!project) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Project not found' } }, { status: 404 })

  const body: UpdateOfferBody = await req.json()
  const now = new Date().toISOString()

  if (body.action === 'accept') {
    if (user.role !== 'developer') return NextResponse.json({ ok: false, error: { code: 'FORBIDDEN', message: 'Only developers can accept offers' } }, { status: 403 })
    await updateOffer(offerId, { status: 'ACCEPTED' })
    // reject all other pending offers for this project
    const allOffers = await getOffersByProjectId(projectId)
    await Promise.all(
      allOffers
        .filter(o => o.id !== offerId && ['PENDING', 'REVISION_REQUESTED'].includes(o.status))
        .map(o => updateOffer(o.id, { status: 'REJECTED' })),
    )
    await updateProject(projectId, { status: 'FINANCING_ACCEPTED', updated_at: now })
  } else if (body.action === 'reject') {
    if (user.role !== 'developer') return NextResponse.json({ ok: false, error: { code: 'FORBIDDEN', message: 'Only developers can reject offers' } }, { status: 403 })
    await updateOffer(offerId, { status: 'REJECTED' })
  } else if (body.action === 'request_revision') {
    if (user.role !== 'developer') return NextResponse.json({ ok: false, error: { code: 'FORBIDDEN', message: 'Only developers can request revisions' } }, { status: 403 })
    await updateOffer(offerId, { status: 'REVISION_REQUESTED', revision_notes: body.revisionNotes ?? '' })
  } else if (body.action === 'resubmit') {
    if (user.role !== 'financier' || offer.financier_id !== user.id) {
      return NextResponse.json({ ok: false, error: { code: 'FORBIDDEN', message: 'Only the offering financier can resubmit' } }, { status: 403 })
    }
    const t = body.updatedTerms ?? {}
    await updateOffer(offerId, {
      status: 'PENDING',
      revision_notes: null,
      ...(t.loanAmountM !== undefined && { loan_amount_m: t.loanAmountM }),
      ...(t.rateType !== undefined && { rate_type: t.rateType }),
      ...(t.ratePct !== undefined && { rate_pct: t.ratePct }),
      ...(t.sofrSpreadPct !== undefined && { sofr_spread_pct: t.sofrSpreadPct }),
      ...(t.tenorYears !== undefined && { tenor_years: t.tenorYears }),
      ...(t.dscrCovenant !== undefined && { dscr_covenant: t.dscrCovenant }),
      ...(t.securityRequirements !== undefined && { security_requirements: t.securityRequirements }),
      ...(t.conditionsPrecedent !== undefined && { conditions_precedent: t.conditionsPrecedent }),
      ...(t.expiresAt !== undefined && { expires_at: t.expiresAt }),
    })
  } else if (body.action === 'withdraw') {
    if (user.role !== 'financier' || offer.financier_id !== user.id) {
      return NextResponse.json({ ok: false, error: { code: 'FORBIDDEN', message: 'Only the submitting financier can withdraw' } }, { status: 403 })
    }
    if (offer.status === 'ACCEPTED') {
      return NextResponse.json({ ok: false, error: { code: 'INVALID_ACTION', message: 'Cannot withdraw an accepted offer' } }, { status: 400 })
    }
    await updateOffer(offerId, { status: 'WITHDRAWN' })
  } else {
    return NextResponse.json({ ok: false, error: { code: 'INVALID_ACTION', message: 'Unknown action' } }, { status: 400 })
  }

  const updated = await getOfferById(offerId)
  if (!updated) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Offer not found after update' } }, { status: 404 })
  return NextResponse.json({ ok: true, data: dbOfferToType(updated) })
}
