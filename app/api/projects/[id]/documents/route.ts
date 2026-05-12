import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getUserFromHeader, dbToProject } from '@/lib/project-helpers'
import type { ApiResponse, Project, UpdateDocumentsBody } from '@/types'

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
  const body: UpdateDocumentsBody = await req.json()

  if (!body.documents?.length) {
    return NextResponse.json(
      { ok: false, error: { code: 'VALIDATION_ERROR', message: 'At least one document is required' } },
      { status: 422 },
    )
  }

  const now = new Date().toISOString()
  const documents = body.documents.map((d) => ({ ...d, uploadedAt: now }))

  const { data, error } = await supabase
    .from('projects')
    .update({ status: 'DOCUMENTS_PENDING', documents, updated_at: now })
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
