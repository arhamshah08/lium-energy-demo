import { NextRequest, NextResponse } from 'next/server'
import { getProjectById, updateProject } from '@/lib/db'
import { getUserFromHeader, dbToProject } from '@/lib/project-helpers'
import type { ApiResponse, Project, PublishProjectBody } from '@/types'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<ApiResponse<Project>>> {
  const user = getUserFromHeader(req.headers.get('Authorization'))
  if (!user) return NextResponse.json({ ok: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
  if (user.role !== 'developer') return NextResponse.json({ ok: false, error: { code: 'FORBIDDEN', message: 'Only developers can publish projects' } }, { status: 403 })

  const { id } = await params
  const row = await getProjectById(id)
  if (!row) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Project not found' } }, { status: 404 })

  const body: PublishProjectBody = await req.json()
  const now = new Date().toISOString()

  if (body.target === 'finance') {
    const alreadyPublished = ['PUBLISHED_FOR_FINANCE', 'OFFER_RECEIVED', 'FINANCING_ACCEPTED', 'PUBLISHED_FOR_SA', 'TRANSACTING', 'TOKENISED']
    if (alreadyPublished.includes(row.status)) {
      return NextResponse.json({ ok: false, error: { code: 'INVALID_STATE', message: 'Project is already published or financed' } }, { status: 422 })
    }
    // Auto-verify telemetry if not yet submitted so any project can be published in one click
    if (!['SUBMITTED', 'ACTIVE'].includes(row.status)) {
      const existing = row.telemetry
        ? (typeof row.telemetry === 'string' ? JSON.parse(row.telemetry) : row.telemetry)
        : {}
      await updateProject(id, {
        status: 'SUBMITTED',
        telemetry: { connectionMethod: 'DIRECT_API', apiEndpoint: 'https://kwh.io', assetIdMapping: 'Asset-1', ...existing, verified: true, verifiedAt: now },
        updated_at: now,
      })
    }
    const updated = await updateProject(id, { status: 'PUBLISHED_FOR_FINANCE', updated_at: now }, user.id)
    if (!updated) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Project not found' } }, { status: 404 })
    return NextResponse.json({ ok: true, data: dbToProject(updated) })
  }

  if (body.target === 'sa') {
    if (row.status !== 'FINANCING_ACCEPTED') {
      return NextResponse.json({ ok: false, error: { code: 'INVALID_STATE', message: 'Financing must be accepted before publishing to securitisation agent' } }, { status: 422 })
    }
    if (row.pto_status !== 'APPROVED') {
      return NextResponse.json({ ok: false, error: { code: 'PTO_REQUIRED', message: 'Permit to Operate must be approved before securitisation' } }, { status: 422 })
    }
    const updated = await updateProject(id, { status: 'PUBLISHED_FOR_SA', updated_at: now }, user.id)
    if (!updated) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Project not found' } }, { status: 404 })
    return NextResponse.json({ ok: true, data: dbToProject(updated) })
  }

  return NextResponse.json({ ok: false, error: { code: 'INVALID_TARGET', message: 'target must be finance or sa' } }, { status: 400 })
}
