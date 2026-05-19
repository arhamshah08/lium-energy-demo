import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { listTokens, upsertToken } from '@/lib/token-store'
import { getUserFromHeader } from '@/lib/project-helpers'
import type { IssueTokenBody, Token, ApiResponse, LQScore, VGFMilestone } from '@/types'

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse<Token[]>>> {
  const user = getUserFromHeader(req.headers.get('Authorization'))
  if (!user) return NextResponse.json({ ok: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, { status: 401 })
  return NextResponse.json({ ok: true, data: await listTokens() })
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<Token>>> {
  const user = getUserFromHeader(req.headers.get('Authorization'))
  if (!user) return NextResponse.json({ ok: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, { status: 401 })

  const body: IssueTokenBody = await req.json()

  const defaultLQ: LQScore = {
    availability: 0,
    dscr: 0,
    verification: 0,
    penalty: 0,
    composite: 0,
    consecutiveMonths: 0,
    timestamp: new Date().toISOString(),
    gate: 'PENDING',
  }

  const defaultVGF: VGFMilestone[] = []

  const token: Token = {
    id: randomUUID(),
    projectId: body.projectId,
    tokenId: `UNITS-US-ASSET-${new Date().getFullYear()}-${randomUUID().slice(0, 6).toUpperCase()}`,
    status: 'ACTIVE',
    nominalValueINR: body.nominalValueINR,
    currency: 'USD',
    issuedTo: body.issuedTo,
    issuedAt: new Date().toISOString(),
    operations: [
      {
        id: randomUUID(),
        operation: 'ISSUE',
        timestamp: new Date().toISOString(),
        amount: body.nominalValueINR,
        recipient: body.issuedTo,
        notes: 'Initial token issuance via UNITS platform',
        txHash: `0x${randomUUID().replace(/-/g, '')}`,
        status: 'CONFIRMED',
      },
    ],
    lqScore: defaultLQ,
    vgfMilestones: defaultVGF,
    dscrProjection: [],
    totalCapexINR: body.nominalValueINR,
    debtINR: body.nominalValueINR,
    equityINR: 0,
    annualRevenueINR: 0,
    annualOpexINR: 0,
    annualDebtServiceINR: 0,
  }

  await upsertToken(token)
  return NextResponse.json({ ok: true, data: token }, { status: 201 })
}
