import { NextRequest, NextResponse } from 'next/server'
import { getToken } from '@/lib/token-store'
import type { Token, ApiResponse } from '@/types'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<ApiResponse<Token>>> {
  const { id } = await params
  const token = await getToken(id)
  if (!token) {
    return NextResponse.json(
      { ok: false, error: { code: 'NOT_FOUND', message: 'Token not found' } },
      { status: 404 },
    )
  }
  return NextResponse.json({ ok: true, data: token })
}
