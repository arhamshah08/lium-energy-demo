import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getProfileByEmail } from '@/lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-production'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'email and password are required' }, { status: 400 })
  }

  const profile = await getProfileByEmail(email)
  if (!profile) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  const valid = bcrypt.compareSync(password, profile.password_hash)
  if (!valid) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  const token = jwt.sign(
    { id: profile.id, email, role: profile.role, fullName: profile.full_name },
    JWT_SECRET,
    { expiresIn: '7d' },
  )

  return NextResponse.json({ token, user: { id: profile.id, email, role: profile.role, fullName: profile.full_name } })
}
