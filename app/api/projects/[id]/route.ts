import { NextRequest, NextResponse } from 'next/server'
import { getProject } from '@/lib/store'
import type { ApiResponse, Project } from '@/types'

export async function GET(
  _req: NextRequest,
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

  return NextResponse.json({ ok: true, data: project })
}
