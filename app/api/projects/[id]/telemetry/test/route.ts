import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getUserFromHeader } from '@/lib/project-helpers'
import type { ApiResponse, TelemetryTestResult } from '@/types'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<ApiResponse<TelemetryTestResult>>> {
  const user = getUserFromHeader(req.headers.get('Authorization'))
  if (!user) {
    return NextResponse.json(
      { ok: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 },
    )
  }

  const { id } = await params
  const { data: project, error: fetchError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !project) {
    return NextResponse.json(
      { ok: false, error: { code: 'NOT_FOUND', message: `Project ${id} not found` } },
      { status: 404 },
    )
  }

  if (!project.telemetry) {
    return NextResponse.json(
      { ok: false, error: { code: 'PRECONDITION_FAILED', message: 'Telemetry config not set' } },
      { status: 412 },
    )
  }

  await new Promise((r) => setTimeout(r, 600))

  const result: TelemetryTestResult = {
    success: true,
    latencyMs: 38 + Math.floor(Math.random() * 20),
    metrics: {
      stateOfCharge: 80 + Math.random() * 15,
      netExportMW: 1.0 + Math.random() * 0.5,
      voltageLagMs: 0.01 + Math.random() * 0.03,
      heatIndexC: 22 + Math.random() * 4,
    },
  }

  await supabase
    .from('projects')
    .update({
      status: 'SUBMITTED',
      updated_at: new Date().toISOString(),
      telemetry: { ...project.telemetry, verified: true, verifiedAt: new Date().toISOString() },
    })
    .eq('id', id)

  return NextResponse.json({ ok: true, data: result })
}
