import { NextRequest, NextResponse } from 'next/server'
import { getUserFromHeader } from '@/lib/project-helpers'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const user = getUserFromHeader(req.headers.get('Authorization'))
  if (!user) {
    return NextResponse.json(
      { ok: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 },
    )
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, role, full_name, company_name, country, job_title, financier_type')
    .in('role', ['financier', 'securitisation_agent', 'portfolio_manager'])
    .order('role')

  if (error) {
    return NextResponse.json(
      { ok: false, error: { code: 'DB_ERROR', message: error.message } },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true, data: data ?? [] })
}
