import { NextRequest, NextResponse } from 'next/server'
import { getProjectById, updateProject } from '@/lib/db'
import { getUserFromHeader, dbToProject } from '@/lib/project-helpers'
import type { ApiResponse, Project, UpdatePtoBody } from '@/types'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<ApiResponse<Project>>> {
  const user = getUserFromHeader(req.headers.get('Authorization'))
  if (!user) return NextResponse.json({ ok: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
  if (user.role !== 'developer') return NextResponse.json({ ok: false, error: { code: 'FORBIDDEN', message: 'Only developers can update PTO status' } }, { status: 403 })

  const { id } = await params
  const row = await getProjectById(id)
  if (!row) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Project not found' } }, { status: 404 })

  const body: UpdatePtoBody = await req.json()
  const updated = await updateProject(id, { pto_status: body.ptoStatus, updated_at: new Date().toISOString() }, user.id)
  if (!updated) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Project not found' } }, { status: 404 })
  return NextResponse.json({ ok: true, data: dbToProject(updated) })
}
