import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { getPool, upsertPool } from '@/lib/token-store'
import type { Pool, SubscribeTrancheBody, ApiResponse } from '@/types'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; trancheId: string }> },
): Promise<NextResponse<ApiResponse<Pool>>> {
  const { id, trancheId } = await params
  const pool = await getPool(id)
  if (!pool) {
    return NextResponse.json(
      { ok: false, error: { code: 'NOT_FOUND', message: 'Pool not found' } },
      { status: 404 },
    )
  }

  const body: SubscribeTrancheBody = await req.json()

  const updated: Pool = {
    ...pool,
    tranches: pool.tranches.map(t => {
      if (t.id !== trancheId) return t
      const newSubscribed = t.subscribedINR + body.amountINR
      return {
        ...t,
        subscribedINR: newSubscribed,
        status: newSubscribed >= t.sizeINR ? 'SUBSCRIBED' : t.status,
        subscribers: [
          ...t.subscribers,
          {
            id: randomUUID(),
            investorType: body.investorType,
            amountINR: body.amountINR,
            subscribedAt: new Date().toISOString(),
          },
        ],
      }
    }),
  }

  await upsertPool(updated)
  return NextResponse.json({ ok: true, data: updated })
}
