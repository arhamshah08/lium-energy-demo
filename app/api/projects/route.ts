import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { supabase } from '@/lib/supabase'
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

  let query = supabase.from('projects').select('*')
  if (user.role === 'financier') {
    query = query.eq('status', 'SUBMITTED')
  } else {
    query = query.eq('user_id', user.id)
  }

  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) {
    return NextResponse.json(
      { ok: false, error: { code: 'DB_ERROR', message: error.message } },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true, data: (data ?? []).map(dbToProject) })
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

  const { data, error } = await supabase
    .from('projects')
    .insert({
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
    .select()
    .single()

  if (error) {
    return NextResponse.json(
      { ok: false, error: { code: 'DB_ERROR', message: error.message } },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true, data: dbToProject(data) }, { status: 201 })
}
