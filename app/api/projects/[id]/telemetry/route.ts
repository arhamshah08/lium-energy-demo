import { NextRequest, NextResponse } from 'next/server'
import { getProject, saveProject } from '@/lib/store'
import type { ApiResponse, Project, UpdateTelemetryBody } from '@/types'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<ApiResponse<Project>>> {
  const { id } = await params
  const project = getProject(id)

  if (!project) {
    return NextResponse.json(
      { ok: false, error: { code: 'NOT_FOUND', message: `Project ${id} not found` } },
      { status: 404 },
    )
  }

  const body: UpdateTelemetryBody = await req.json()
  if (!body.apiEndpoint?.trim()) {
    return NextResponse.json(
      { ok: false, error: { code: 'VALIDATION_ERROR', message: 'API endpoint is required' } },
      { status: 422 },
    )
  }

  const updated: Project = {
    ...project,
    status: 'TELEMETRY_PENDING',
    updatedAt: new Date().toISOString(),
    telemetry: {
      connectionMethod: body.connectionMethod,
      apiEndpoint: body.apiEndpoint.trim(),
      assetIdMapping: body.assetIdMapping?.trim() ?? '',
      verified: false,
    },
  }

  saveProject(updated)
  return NextResponse.json({ ok: true, data: updated })
}
