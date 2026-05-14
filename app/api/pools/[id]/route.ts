import { NextRequest, NextResponse } from 'next/server'
import { getPool, upsertPool } from '@/lib/token-store'
import type { Pool, ApiResponse } from '@/types'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<ApiResponse<Pool>>> {
  const { id } = await params
  const pool = await getPool(id)
  if (!pool) {
    return NextResponse.json(
      { ok: false, error: { code: 'NOT_FOUND', message: 'Pool not found' } },
      { status: 404 },
    )
  }
  return NextResponse.json({ ok: true, data: pool })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<ApiResponse<Pool>>> {
  const { id } = await params
  const pool = await getPool(id)
  if (!pool) {
    return NextResponse.json(
      { ok: false, error: { code: 'NOT_FOUND', message: 'Pool not found' } },
      { status: 404 },
    )
  }

  const body = await req.json()
  const updated = { ...pool, ...body, updatedAt: new Date().toISOString() }
  await upsertPool(updated)
  return NextResponse.json({ ok: true, data: updated })
}
