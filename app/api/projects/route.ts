import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { getProjectsByUserId, getProjectsByStatus, insertProject } from '@/lib/db'
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

  const rows = (user.role === 'financier' || user.role === 'securitisation_agent')
    ? await getProjectsByStatus('SUBMITTED')
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

  const row = await insertProject({
    id: randomUUID(),
    user_id: user.id,
    status: 'DRAFT',
    name,
    location: body.location?.trim() ?? '',
    jurisdiction,
    asset_type: assetType,
    documents: [],
    created_at: now,
    updated_at: now,
  })

  return NextResponse.json({ ok: true, data: dbToProject(row) }, { status: 201 })
}
