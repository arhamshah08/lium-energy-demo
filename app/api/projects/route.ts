import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { saveProject, listProjects } from '@/lib/store'
import type { CreateProjectBody, Project, ApiResponse } from '@/types'

export async function GET(): Promise<NextResponse<ApiResponse<Project[]>>> {
  return NextResponse.json({ ok: true, data: listProjects() })
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<Project>>> {
  const body: CreateProjectBody = await req.json()

  if (!body.name?.trim()) {
    return NextResponse.json(
      { ok: false, error: { code: 'VALIDATION_ERROR', message: 'Project name is required' } },
      { status: 422 },
    )
  }
  if (!body.jurisdiction) {
    return NextResponse.json(
      { ok: false, error: { code: 'VALIDATION_ERROR', message: 'Jurisdiction is required' } },
      { status: 422 },
    )
  }
  if (!body.assetType) {
    return NextResponse.json(
      { ok: false, error: { code: 'VALIDATION_ERROR', message: 'Asset type is required' } },
      { status: 422 },
    )
  }

  const now = new Date().toISOString()
  const project: Project = {
    id: randomUUID(),
    status: 'DRAFT',
    name: body.name.trim(),
    location: body.location?.trim() ?? '',
    jurisdiction: body.jurisdiction,
    assetType: body.assetType,
    createdAt: now,
    updatedAt: now,
    documents: [],
  }

  saveProject(project)
  return NextResponse.json({ ok: true, data: project }, { status: 201 })
}
