import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { listPools, upsertPool } from '@/lib/token-store'
import type { Pool, CreatePoolBody, ApiResponse } from '@/types'

export async function GET(): Promise<NextResponse<ApiResponse<Pool[]>>> {
  return NextResponse.json({ ok: true, data: await listPools() })
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<Pool>>> {
  const body: CreatePoolBody = await req.json()
  const poolId = randomUUID()

  const pool: Pool = {
    id: poolId,
    name: body.name,
    arranger: 'LIUM Energy Finternet Pvt Ltd',
    tokenIds: body.tokenIds,
    projectIds: [],
    status: 'STRUCTURING',
    totalSizeINR: body.tranches.reduce((s, t) => s + t.sizeINR, 0),
    currency: 'INR',
    tranches: body.tranches.map(t => ({
      id: randomUUID(),
      poolId,
      class: t.class,
      rating: t.rating,
      sizeINR: t.sizeINR,
      coupon: t.coupon,
      tenorYears: t.tenorYears,
      status: 'OPEN',
      subscribedINR: 0,
      subscribers: [],
    })),
    qualificationGates: [],
    createdAt: new Date().toISOString(),
    overallDSCR: 0,
    overallLQ: 0,
    oc: 0,
    cashReserveINR: 0,
  }

  await upsertPool(pool)
  return NextResponse.json({ ok: true, data: pool }, { status: 201 })
}
