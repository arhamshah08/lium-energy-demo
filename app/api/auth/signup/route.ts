import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-production'

const VALID_ROLES = ['developer', 'financier', 'securitisation_agent', 'portfolio_manager', 'investor']

export async function POST(req: NextRequest) {
  const {
    email, password, role, fullName,
    companyName, website, country, jobTitle, financierType,
  } = await req.json()

  if (!email || !password || !role || !fullName) {
    return NextResponse.json(
      { error: 'email, password, role, and fullName are required' },
      { status: 400 },
    )
  }

  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const profile: Record<string, unknown> = {
    id: data.user!.id,
    email,
    role,
    full_name: fullName,
    company_name: companyName ?? null,
    website: website ?? null,
    country: country ?? null,
    job_title: jobTitle ?? null,
    financier_type: financierType ?? null,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: profileError } = await supabase.from('profiles').insert(profile as any)
  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 400 })

  const token = jwt.sign(
    { id: data.user!.id, email, role, fullName },
    JWT_SECRET,
    { expiresIn: '7d' },
  )
  return NextResponse.json(
    { token, user: { id: data.user!.id, email, role, fullName } },
    { status: 201 },
  )
}
