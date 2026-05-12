import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-production'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'email and password are required' }, { status: 400 })
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', data.user.id)
    .single()

  const token = jwt.sign(
    { id: data.user.id, email, role: profile?.role, fullName: profile?.full_name },
    JWT_SECRET,
    { expiresIn: '7d' },
  )

  return NextResponse.json({ token, user: { id: data.user.id, email, role: profile?.role, fullName: profile?.full_name } })
}
