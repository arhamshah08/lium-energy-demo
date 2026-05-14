import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { getToken, upsertToken } from '@/lib/token-store'
import type { Token, TokenOperationBody, TokenOperationRecord, ApiResponse } from '@/types'

export async function POST(
  req: NextRequest,
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

  const body: TokenOperationBody = await req.json()

  // Status transitions
  let newStatus = token.status
  if (body.operation === 'LOCK')    newStatus = 'LOCKED'
  if (body.operation === 'UNLOCK')  newStatus = 'ACTIVE'
  if (body.operation === 'PLEDGE')  newStatus = 'PLEDGED'
  if (body.operation === 'REDEEM')  newStatus = 'REDEEMED'
  if (body.operation === 'BURN')    newStatus = 'BURNED'

  const opRecord: TokenOperationRecord = {
    id: randomUUID(),
    operation: body.operation,
    timestamp: new Date().toISOString(),
    amount: body.amount,
    recipient: body.recipient,
    notes: body.notes,
    txHash: `0x${randomUUID().replace(/-/g, '')}`,
    status: 'CONFIRMED',
  }

  const updated: Token = {
    ...token,
    status: newStatus,
    operations: [opRecord, ...token.operations],
  }

  await upsertToken(updated)
  return NextResponse.json({ ok: true, data: updated })
}
