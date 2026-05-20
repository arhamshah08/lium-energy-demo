import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { listPools, upsertPool } from '@/lib/token-store'
import { getUserFromHeader } from '@/lib/project-helpers'
import type { Pool, CreatePoolBody, CreatePoolRequestBody, ApiResponse } from '@/types'

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse<Pool[]>>> {
  const user = getUserFromHeader(req.headers.get('Authorization'))
  if (!user) return NextResponse.json({ ok: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, { status: 401 })
  return NextResponse.json({ ok: true, data: await listPools() })
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<Pool>>> {
  const user = getUserFromHeader(req.headers.get('Authorization'))
  if (!user) return NextResponse.json({ ok: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, { status: 401 })

  const poolId = randomUUID()

  // Portfolio manager creates a pool REQUEST (no tranches yet — SA structures them)
  if (user.role === 'portfolio_manager') {
    const body: CreatePoolRequestBody = await req.json()
    const pool: Pool = {
      id: poolId,
      name: body.name,
      arranger: 'LIUM Energy Finternet LLC',
      tokenIds: body.allocations.map(a => a.tokenId),
      projectIds: body.allocations.map(a => a.projectId),
      status: 'REQUESTED',
      requestedByPmId: user.id,
      pmAllocations: body.allocations,
      totalSizeINR: 0,
      currency: 'USD',
      tranches: [],
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

  // SA creates a fully structured pool
  const body: CreatePoolBody = await req.json()
  const pool: Pool = {
    id: poolId,
    name: body.name,
    arranger: 'LIUM Energy Finternet LLC',
    tokenIds: body.tokenIds,
    projectIds: [],
    status: 'STRUCTURING',
    totalSizeINR: body.tranches.reduce((s, t) => s + t.sizeINR, 0),
    currency: 'USD',
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
