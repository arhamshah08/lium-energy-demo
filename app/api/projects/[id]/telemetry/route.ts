import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getUserFromHeader, dbToProject } from '@/lib/project-helpers'
import type { ApiResponse, Project, UpdateTelemetryBody } from '@/types'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<ApiResponse<Project>>> {
  const user = getUserFromHeader(req.headers.get('Authorization'))
  if (!user) {
    return NextResponse.json(
      { ok: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 },
    )
  }

  const { id } = await params
  const body: UpdateTelemetryBody = await req.json()

  if (!body.apiEndpoint?.trim()) {
    return NextResponse.json(
      { ok: false, error: { code: 'VALIDATION_ERROR', message: 'API endpoint is required' } },
      { status: 422 },
    )
  }

  const telemetry = {
    connectionMethod: body.connectionMethod,
    apiEndpoint: body.apiEndpoint.trim(),
    assetIdMapping: body.assetIdMapping?.trim() ?? '',
    verified: false,
  }

  const { data, error } = await supabase
    .from('projects')
    .update({ status: 'TELEMETRY_PENDING', telemetry, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error || !data) {
    return NextResponse.json(
      { ok: false, error: { code: 'NOT_FOUND', message: `Project ${id} not found` } },
      { status: 404 },
    )
  }

  return NextResponse.json({ ok: true, data: dbToProject(data) })
}
