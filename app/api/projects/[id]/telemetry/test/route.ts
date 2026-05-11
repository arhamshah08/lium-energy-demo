import { NextRequest, NextResponse } from 'next/server'
import { getProject, saveProject } from '@/lib/store'
import type { ApiResponse, TelemetryTestResult } from '@/types'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<ApiResponse<TelemetryTestResult>>> {
  const { id } = await params
  const project = getProject(id)

  if (!project) {
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

  // Simulate handshake latency
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

  saveProject({
    ...project,
    status: 'SUBMITTED',
    updatedAt: new Date().toISOString(),
    telemetry: { ...project.telemetry, verified: true, verifiedAt: new Date().toISOString() },
  })

  return NextResponse.json({ ok: true, data: result })
}
