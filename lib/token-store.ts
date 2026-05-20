/**
 * Token + pool store backed by Supabase.
 */

import { supabase } from './supabase'
import type {
  Token, Pool, Tranche, QualificationGate,
  LQScore, VGFMilestone, DSCRYear,
  TokenOperationRecord, TrancheSubscriber,
} from '@/types'

// ─────────────────────────────────────────
//  TOKEN ACCESSORS
// ─────────────────────────────────────────

export async function listTokens(): Promise<Token[]> {
  try {
    const { data, error } = await supabase
      .from('tokens')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return []
    return (data ?? []).map((row) => row.data as Token)
  } catch {
    return []
  }
}

export async function getToken(id: string): Promise<Token | undefined> {
  const { data, error } = await supabase
    .from('tokens')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return undefined
  return data.data as Token
}

export async function getTokenByProjectId(projectId: string): Promise<Token | undefined> {
  const { data, error } = await supabase
    .from('tokens')
    .select('*')
    .eq('project_id', projectId)
    .single()

  if (error || !data) return undefined
  return data.data as Token
}

export async function upsertToken(token: Token): Promise<void> {
  const { error } = await supabase.from('tokens').upsert({
    id: token.id,
    project_id: token.projectId,
    data: token as unknown as Record<string, unknown>,
    created_at: token.issuedAt,
  })

  if (error) throw new Error(error.message)
}

// ─────────────────────────────────────────
//  POOL ACCESSORS
// ─────────────────────────────────────────

export async function listPools(): Promise<Pool[]> {
  try {
    const { data, error } = await supabase
      .from('pools')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return []
    return (data ?? []).map((row) => row.data as Pool)
  } catch {
    return []
  }
}

export async function getPool(id: string): Promise<Pool | undefined> {
  const { data, error } = await supabase
    .from('pools')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return undefined
  return data.data as Pool
}

export async function upsertPool(pool: Pool): Promise<void> {
  const { error } = await supabase.from('pools').upsert({
    id: pool.id,
    data: pool as unknown as Record<string, unknown>,
    created_at: pool.createdAt,
  })

  if (error) throw new Error(error.message)
}

// ─────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────

export function computeLQ(
  availability: number,
  dscr: number,
  verification: number,
  penalty: number,
): number {
  return (availability * 0.40 + dscr * 0.35 + verification * 0.25) * (1 - penalty)
}

export async function getPoolStats() {
  const all = await listPools()
  const totalAUM = all.reduce((s, p) => s + p.totalSizeINR, 0)
  const listed = all.filter((p) => p.status === 'LISTED').length
  const tokens = all.reduce((s, p) => s + p.tokenIds.length, 0)
  return { totalPools: all.length, totalAUM, listed, tokens }
}
