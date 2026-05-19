import { NextRequest, NextResponse } from 'next/server'
import { getProjectById, updateProject } from '@/lib/db'
import type { ApiResponse } from '@/types'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<ApiResponse<{ status: string }>>> {
  const { id } = await params
  const project = await getProjectById(id)
  if (!project) {
    return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Project not found' } }, { status: 404 })
  }

  await updateProject(id, {
    status: 'SUBMITTED',
    updated_at: new Date().toISOString(),
    telemetry: project.telemetry
      ? { ...(typeof project.telemetry === 'string' ? JSON.parse(project.telemetry) : project.telemetry), verified: true, verifiedAt: new Date().toISOString() }
      : { connectionMethod: 'DIRECT_API', apiEndpoint: 'https://kwh.com', assetIdMapping: 'Bess-1', verified: true, verifiedAt: new Date().toISOString() },
  })

  return NextResponse.json({ ok: true, data: { status: 'SUBMITTED' } })
}
