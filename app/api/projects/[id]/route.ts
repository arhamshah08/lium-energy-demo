import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getUserFromHeader, dbToProject } from '@/lib/project-helpers'
import type { ApiResponse, Project } from '@/types'

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
  const { data, error } = await supabase.from('projects').select('*').eq('id', id).single()

  if (error || !data) {
    return NextResponse.json(
      { ok: false, error: { code: 'NOT_FOUND', message: `Project ${id} not found` } },
      { status: 404 },
    )
  }

  return NextResponse.json({ ok: true, data: dbToProject(data) })
}
