import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-production'

const DEV_ACTORS: Record<string, { id: string; email: string; fullName: string; role: string }> = {
  developer: {
    id: 'dev-seed-pd-001',
    email: 'priya@embosselectric.com',
    fullName: 'Priya Nair',
    role: 'developer',
  },
  financier: {
    id: 'dev-seed-fn-001',
    email: 'james@greencapital.com',
    fullName: 'James Okafor',
    role: 'financier',
  },
  securitisation_agent: {
    id: 'dev-seed-sa-001',
    email: 'chen@pacificsec.com',
    fullName: 'Chen Wei',
    role: 'securitisation_agent',
  },
  portfolio_manager: {
    id: 'dev-seed-pm-001',
    email: 'sara@meridian.com',
    fullName: 'Sara Lindqvist',
    role: 'portfolio_manager',
  },
  investor: {
    id: 'dev-seed-inv-001',
    email: 'marcus@personal.com',
    fullName: 'Marcus Bell',
    role: 'investor',
  },
}

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  const { role } = await req.json()
  const actor = DEV_ACTORS[role]

  if (!actor) {
    return NextResponse.json(
      { error: `Unknown role: ${role}. Valid: ${Object.keys(DEV_ACTORS).join(', ')}` },
      { status: 400 },
    )
  }

  const token = jwt.sign(
    { id: actor.id, email: actor.email, role: actor.role, fullName: actor.fullName },
    JWT_SECRET,
    { expiresIn: '7d' },
  )

  return NextResponse.json({ token, user: actor })
}
