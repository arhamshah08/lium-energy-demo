import { NextRequest, NextResponse } from 'next/server'
import { getProject, saveProject } from '@/lib/store'
import type { ApiResponse, Project, UpdateDocumentsBody } from '@/types'

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

  const body: UpdateDocumentsBody = await req.json()
  if (!body.documents?.length) {
    return NextResponse.json(
      { ok: false, error: { code: 'VALIDATION_ERROR', message: 'At least one document is required' } },
      { status: 422 },
    )
  }

  const now = new Date().toISOString()
  const updated: Project = {
    ...project,
    status: 'DOCUMENTS_PENDING',
    updatedAt: now,
    documents: body.documents.map((d) => ({ ...d, uploadedAt: now })),
  }

  saveProject(updated)
  return NextResponse.json({ ok: true, data: updated })
}
