import { NextRequest, NextResponse } from 'next/server'
import { getProjectById, updateProject } from '@/lib/db'
import { getUserFromHeader, dbToProject } from '@/lib/project-helpers'
import type { ApiResponse, Project, ProjectStatus, TelemetryConfig } from '@/types'

export async function GET(
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
  const row = await getProjectById(id)

  if (!row) {
    return NextResponse.json(
      { ok: false, error: { code: 'NOT_FOUND', message: `Project ${id} not found` } },
      { status: 404 },
    )
  }

  return NextResponse.json({ ok: true, data: dbToProject(row) })
}

/**
 * PATCH /api/projects/[id]
 * Updates project status in the database.
 * Used by the onboarding submission flow to mark a project as TOKENISED.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<ApiResponse<Project>>> {
  const { id } = await params
  const body: { status?: ProjectStatus; telemetry?: Partial<TelemetryConfig> } = await req.json()

  const row = await getProjectById(id)
  if (!row) {
    return NextResponse.json(
      { ok: false, error: { code: 'NOT_FOUND', message: `Project ${id} not found` } },
      { status: 404 },
    )
  }

  let mergedTelemetry: unknown = undefined
  if (body.telemetry) {
    const existing = row.telemetry
      ? (typeof row.telemetry === 'string' ? JSON.parse(row.telemetry) : row.telemetry) as TelemetryConfig
      : {}
    mergedTelemetry = { ...existing, ...body.telemetry }
  }

  const updated = await updateProject(id, {
    status: body.status ?? row.status,
    ...(mergedTelemetry !== undefined ? { telemetry: mergedTelemetry } : {}),
    updated_at: new Date().toISOString(),
  })

  if (!updated) {
    return NextResponse.json(
      { ok: false, error: { code: 'NOT_FOUND', message: `Project ${id} not found` } },
      { status: 404 },
    )
  }

  return NextResponse.json({ ok: true, data: dbToProject(updated) })
}
