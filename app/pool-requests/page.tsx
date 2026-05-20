'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/components/auth/auth-context'
import { cn } from '@/lib/utils'
import type { Pool, Token, Project, TrancheClass, TrancheRating, PmAllocation } from '@/types'

// ─── Shared helpers ───────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  REQUESTED:  'bg-tertiary/10 text-tertiary',
  PM_APPROVED: 'bg-secondary/10 text-secondary',
  LISTED:     'bg-secondary/20 text-secondary',
  STRUCTURING: 'bg-primary/10 text-primary',
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn('text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider', STATUS_COLORS[status] ?? 'bg-outline-variant/30 text-on-surface-variant')}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ─── Tranche input row types ──────────────────────────────────────────────────

type TrancheInput = {
  key: string
  class: TrancheClass
  rating: TrancheRating
  sizeINR: string
  coupon: string
  tenorYears: string
}

const TRANCHE_CLASSES: TrancheClass[] = ['SENIOR', 'MEZZANINE', 'JUNIOR', 'EQUITY']
const TRANCHE_RATINGS: TrancheRating[] = ['AAA', 'AA+', 'AA', 'A+', 'A', 'BBB', 'BB', 'B', 'NR']

const SELECT_CLS = 'bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-[12px] text-on-surface focus:outline-none focus:ring-1 focus:ring-primary'
const INPUT_CLS  = 'bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-[12px] text-on-surface w-full focus:outline-none focus:ring-1 focus:ring-primary'

// ─── SA view ─────────────────────────────────────────────────────────────────

function SAView({ authToken }: { authToken: string }) {
  const [pools, setPools] = useState<Pool[]>([])
  const [loading, setLoading] = useState(true)
  const [structuringId, setStructuringId] = useState<string | null>(null)
  const [tranches, setTranches] = useState<TrancheInput[]>([])
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(() => {
    fetch('/api/pools', { headers: { Authorization: `Bearer ${authToken}` } })
      .then(r => r.json())
      .then(json => { if (json.ok) setPools(json.data ?? []) })
      .finally(() => setLoading(false))
  }, [authToken])

  useEffect(() => { load() }, [load])

  const requested = pools.filter(p => p.status === 'REQUESTED')
  const processed = pools.filter(p => ['PM_APPROVED', 'LISTED', 'STRUCTURING'].includes(p.status))

  function startStructuring(poolId: string) {
    setStructuringId(poolId)
    setTranches([{ key: crypto.randomUUID(), class: 'SENIOR', rating: 'AAA', sizeINR: '', coupon: '', tenorYears: '' }])
  }

  function addTranche() {
    setTranches(prev => [...prev, { key: crypto.randomUUID(), class: 'JUNIOR', rating: 'BB', sizeINR: '', coupon: '', tenorYears: '' }])
  }

  function removeTranche(key: string) {
    setTranches(prev => prev.filter(t => t.key !== key))
  }

  function updateTranche(key: string, field: keyof Omit<TrancheInput, 'key'>, value: string) {
    setTranches(prev => prev.map(t => t.key === key ? { ...t, [field]: value } : t))
  }

  async function approvePool(pool: Pool) {
    const built = tranches.map(t => ({
      id: crypto.randomUUID(),
      poolId: pool.id,
      class: t.class,
      rating: t.rating,
      sizeINR: parseFloat(t.sizeINR) || 0,
      coupon: parseFloat(t.coupon) || 0,
      tenorYears: parseFloat(t.tenorYears) || 0,
      status: 'OPEN' as const,
      subscribedINR: 0,
      subscribers: [],
    }))
    const totalSizeINR = built.reduce((s, t) => s + t.sizeINR, 0)

    setSubmitting(true)
    await fetch(`/api/pools/${pool.id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'PM_APPROVED', tranches: built, totalSizeINR }),
    })
    setStructuringId(null)
    setSubmitting(false)
    load()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="material-symbols-outlined text-[32px] text-on-surface-variant animate-spin">progress_activity</span>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Incoming requests */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-[18px] text-tertiary">swap_horiz</span>
          <h2 className="text-label-caps font-bold text-on-surface tracking-widest">INCOMING POOL REQUESTS</h2>
          {requested.length > 0 && (
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-tertiary text-on-tertiary text-[10px] font-bold">{requested.length}</span>
          )}
        </div>

        {requested.length === 0 ? (
          <div className="flex items-center gap-3 px-5 py-4 bg-surface-container rounded-xl border border-outline-variant/40">
            <span className="material-symbols-outlined text-outline text-[20px]">inbox</span>
            <p className="text-caption text-on-surface-variant">No pool requests yet. Portfolio managers submit requests from the Pool Requests page.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requested.map(pool => (
              <div key={pool.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-card overflow-hidden">
                {/* Pool header */}
                <div className="flex items-start gap-4 p-5 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-tertiary text-[20px]">workspaces</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <h3 className="font-bold text-on-surface">{pool.name}</h3>
                      <StatusBadge status={pool.status} />
                    </div>
                    <p className="text-[11px] text-on-surface-variant">
                      Requested {fmtDate(pool.createdAt)} · {pool.pmAllocations?.length ?? 0} asset{pool.pmAllocations?.length !== 1 ? 's' : ''} in composition
                    </p>
                  </div>
                  {structuringId !== pool.id && (
                    <button
                      onClick={() => startStructuring(pool.id)}
                      className="inline-flex items-center gap-1.5 bg-secondary text-on-secondary px-4 py-2 rounded-lg text-[11px] font-bold hover:opacity-90 transition-all shrink-0"
                    >
                      <span className="material-symbols-outlined text-[14px]">hub</span>
                      Structure &amp; Approve
                    </button>
                  )}
                </div>

                {/* PM allocations */}
                {pool.pmAllocations && pool.pmAllocations.length > 0 && (
                  <div className="px-5 pb-4">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">PM Requested Allocations</p>
                    <div className="space-y-1.5">
                      {pool.pmAllocations.map((alloc, i) => (
                        <div key={i} className="flex items-center gap-3 bg-surface-container rounded-lg px-3 py-2">
                          <span className="material-symbols-outlined text-primary text-[14px]">token</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-semibold text-on-surface truncate">{alloc.projectName}</p>
                            <p className="text-[10px] text-on-surface-variant font-mono">{alloc.tokenId.slice(0, 24)}…</p>
                          </div>
                          <span className="text-[11px] font-bold text-primary shrink-0">{alloc.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Structuring form */}
                {structuringId === pool.id && (
                  <div className="border-t border-outline-variant/40 bg-surface-container/30 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-bold text-on-surface uppercase tracking-wider">Define Tranches</p>
                      <button onClick={addTranche} className="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:opacity-80">
                        <span className="material-symbols-outlined text-[13px]">add</span>
                        Add Tranche
                      </button>
                    </div>

                    <div className="space-y-3">
                      {tranches.map((t, idx) => (
                        <div key={t.key} className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 p-4">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-[10px] font-bold text-on-surface-variant uppercase">Tranche {idx + 1}</p>
                            {tranches.length > 1 && (
                              <button onClick={() => removeTranche(t.key)} className="text-error text-[10px] font-bold hover:opacity-80">
                                Remove
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            <div>
                              <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-1">Class</label>
                              <select value={t.class} onChange={e => updateTranche(t.key, 'class', e.target.value)} className={SELECT_CLS}>
                                {TRANCHE_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-1">Rating</label>
                              <select value={t.rating} onChange={e => updateTranche(t.key, 'rating', e.target.value)} className={SELECT_CLS}>
                                {TRANCHE_RATINGS.map(r => <option key={r} value={r}>{r}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-1">Size ($M)</label>
                              <input type="number" min="0" placeholder="e.g. 50" value={t.sizeINR} onChange={e => updateTranche(t.key, 'sizeINR', e.target.value)} className={INPUT_CLS} />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-1">Coupon (%)</label>
                              <input type="number" min="0" step="0.1" placeholder="e.g. 7.5" value={t.coupon} onChange={e => updateTranche(t.key, 'coupon', e.target.value)} className={INPUT_CLS} />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-1">Tenor (yrs)</label>
                              <input type="number" min="0" placeholder="e.g. 5" value={t.tenorYears} onChange={e => updateTranche(t.key, 'tenorYears', e.target.value)} className={INPUT_CLS} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <button
                        onClick={() => approvePool(pool)}
                        disabled={submitting || tranches.some(t => !t.sizeINR || !t.coupon || !t.tenorYears)}
                        className="inline-flex items-center gap-2 bg-secondary text-on-secondary px-6 py-2.5 rounded-lg text-label-caps font-bold hover:opacity-90 transition-all disabled:opacity-40"
                      >
                        {submitting ? 'Approving…' : 'Approve & Send to PM'}
                      </button>
                      <button
                        onClick={() => setStructuringId(null)}
                        className="text-[11px] text-on-surface-variant hover:text-on-surface transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Processed pools */}
      {processed.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">history</span>
            <h2 className="text-label-caps font-bold text-on-surface tracking-widest">PROCESSED POOLS</h2>
          </div>
          <div className="space-y-2">
            {processed.map(pool => (
              <div key={pool.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 flex items-center gap-4 px-5 py-3.5 shadow-card">
                <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-secondary text-[16px]">hub</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-caption font-bold text-on-surface truncate">{pool.name}</p>
                  <p className="text-[10px] text-on-surface-variant">
                    {pool.tranches.length} tranche{pool.tranches.length !== 1 ? 's' : ''} · ${pool.totalSizeINR.toLocaleString()}M · {fmtDate(pool.createdAt)}
                  </p>
                </div>
                <StatusBadge status={pool.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── PM view ──────────────────────────────────────────────────────────────────

function PMView({ authToken, userId }: { authToken: string; userId: string }) {
  const [pools, setPools] = useState<Pool[]>([])
  const [tokens, setTokens] = useState<Token[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [poolName, setPoolName] = useState('')
  const [selections, setSelections] = useState<Record<string, { selected: boolean; pct: string }>>({})
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(() => {
    if (!authToken) return
    Promise.all([
      fetch('/api/pools',    { headers: { Authorization: `Bearer ${authToken}` } }).then(r => r.json()),
      fetch('/api/tokens',   { headers: { Authorization: `Bearer ${authToken}` } }).then(r => r.json()),
      fetch('/api/projects', { headers: { Authorization: `Bearer ${authToken}` } }).then(r => r.json()),
    ]).then(([poolsRes, tokensRes, projRes]) => {
      if (poolsRes.ok)  setPools(poolsRes.data ?? [])
      if (tokensRes.ok) setTokens((tokensRes.data ?? []).filter((t: Token) => t.status === 'ACTIVE'))
      if (projRes.ok)   setProjects(projRes.data ?? [])
    }).finally(() => setLoading(false))
  }, [authToken])

  useEffect(() => { load() }, [load])

  const myPools     = pools.filter(p => p.requestedByPmId === userId)
  const pending     = myPools.filter(p => p.status === 'REQUESTED')
  const approved    = myPools.filter(p => p.status === 'PM_APPROVED')
  const published   = myPools.filter(p => p.status === 'LISTED')

  function projectName(projectId: string) {
    return projects.find(p => p.id === projectId)?.name ?? projectId
  }

  function toggleToken(tokenId: string) {
    setSelections(prev => ({
      ...prev,
      [tokenId]: { ...prev[tokenId], selected: !prev[tokenId]?.selected, pct: prev[tokenId]?.pct ?? '' },
    }))
  }

  function setPct(tokenId: string, pct: string) {
    setSelections(prev => ({
      ...prev,
      [tokenId]: { ...prev[tokenId], pct },
    }))
  }

  const selectedTokens = tokens.filter(t => selections[t.id]?.selected)
  const totalPct = selectedTokens.reduce((s, t) => s + (parseFloat(selections[t.id]?.pct) || 0), 0)
  const canSubmit = poolName.trim() && selectedTokens.length > 0 && Math.abs(totalPct - 100) < 0.01

  async function submitRequest() {
    if (!canSubmit) return
    setSubmitting(true)

    const allocations: PmAllocation[] = selectedTokens.map(tok => ({
      tokenId:     tok.tokenId,
      projectId:   tok.projectId,
      projectName: projectName(tok.projectId),
      pct:         parseFloat(selections[tok.id].pct),
    }))

    await fetch('/api/pools', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: poolName, allocations }),
    })

    setPoolName('')
    setSelections({})
    setShowForm(false)
    setSubmitting(false)
    load()
  }

  async function publishPool(poolId: string) {
    await fetch(`/api/pools/${poolId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'LISTED', listedAt: new Date().toISOString() }),
    })
    load()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="material-symbols-outlined text-[32px] text-on-surface-variant animate-spin">progress_activity</span>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* New pool request form */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center gap-3 border-2 border-dashed border-outline-variant/60 rounded-2xl px-6 py-5 text-on-surface-variant hover:border-primary hover:text-primary transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <span className="material-symbols-outlined text-[20px]">add</span>
          </div>
          <div className="text-left">
            <p className="text-caption font-bold">New Pool Request</p>
            <p className="text-[10px]">Select assets and request a pool structure from the securitisation agent</p>
          </div>
        </button>
      ) : (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-label-caps font-bold text-on-surface tracking-widest">NEW POOL REQUEST</h3>
            <button onClick={() => setShowForm(false)} className="material-symbols-outlined text-on-surface-variant hover:text-on-surface text-[20px]">close</button>
          </div>

          {/* Pool name */}
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1.5">Pool Name</label>
            <input
              type="text"
              placeholder="e.g. BESS Portfolio Q3 2026"
              value={poolName}
              onChange={e => setPoolName(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-2.5 text-[13px] text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Token selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase">Select Assets</label>
              {selectedTokens.length > 0 && (
                <span className={cn('text-[10px] font-bold', Math.abs(totalPct - 100) < 0.01 ? 'text-secondary' : totalPct > 100 ? 'text-error' : 'text-tertiary')}>
                  Total: {totalPct.toFixed(1)}% {Math.abs(totalPct - 100) < 0.01 ? '✓' : '(must equal 100%)'}
                </span>
              )}
            </div>

            {tokens.length === 0 ? (
              <div className="flex items-center gap-3 px-4 py-3 bg-surface-container rounded-xl border border-outline-variant/40">
                <span className="material-symbols-outlined text-outline text-[18px]">token</span>
                <p className="text-[11px] text-on-surface-variant">No active tokens yet. Securitisation agent must tokenise assets first.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tokens.map(tok => {
                  const sel = selections[tok.id]
                  return (
                    <div key={tok.id} className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl border transition-all',
                      sel?.selected
                        ? 'bg-primary/5 border-primary/30'
                        : 'bg-surface-container border-outline-variant/40 hover:border-outline-variant',
                    )}>
                      <input
                        type="checkbox"
                        checked={!!sel?.selected}
                        onChange={() => toggleToken(tok.id)}
                        className="w-4 h-4 accent-primary shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-on-surface truncate">{projectName(tok.projectId)}</p>
                        <p className="text-[10px] text-on-surface-variant font-mono">{tok.tokenId} · ${tok.nominalValueINR.toLocaleString()}M</p>
                      </div>
                      {sel?.selected && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="1"
                            placeholder="0"
                            value={sel.pct}
                            onChange={e => setPct(tok.id, e.target.value)}
                            className="w-16 bg-surface-container-lowest border border-outline-variant rounded-lg px-2 py-1 text-[11px] text-center focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                          <span className="text-[10px] text-on-surface-variant">%</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={submitRequest}
              disabled={!canSubmit || submitting}
              className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-2.5 rounded-lg text-label-caps font-bold hover:opacity-90 transition-all disabled:opacity-40"
            >
              {submitting ? 'Submitting…' : 'Submit Request to SA'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="text-[11px] text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Approved — ready to publish */}
      {approved.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[18px] text-secondary">check_circle</span>
            <h2 className="text-label-caps font-bold text-on-surface tracking-widest">APPROVED — READY TO PUBLISH</h2>
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-secondary text-on-secondary text-[10px] font-bold">{approved.length}</span>
          </div>
          <div className="space-y-3">
            {approved.map(pool => (
              <div key={pool.id} className="bg-surface-container-lowest rounded-xl border border-secondary/30 shadow-card overflow-hidden">
                <div className="flex items-center gap-4 px-5 py-4">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-secondary text-[20px]">hub</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-caption font-bold text-on-surface truncate">{pool.name}</p>
                    <p className="text-[10px] text-on-surface-variant">
                      {pool.tranches.length} tranche{pool.tranches.length !== 1 ? 's' : ''} · ${pool.totalSizeINR.toLocaleString()}M structured by SA
                    </p>
                  </div>
                  <button
                    onClick={() => publishPool(pool.id)}
                    className="inline-flex items-center gap-1.5 bg-secondary text-on-secondary px-4 py-2 rounded-lg text-[11px] font-bold hover:opacity-90 transition-all shrink-0"
                  >
                    <span className="material-symbols-outlined text-[14px]">publish</span>
                    Publish to Investors
                  </button>
                </div>

                {/* Tranche preview */}
                {pool.tranches.length > 0 && (
                  <div className="px-5 pb-4 border-t border-outline-variant/20 pt-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {pool.tranches.map(t => (
                        <div key={t.id} className="bg-surface-container rounded-lg px-3 py-2">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-secondary/10 text-secondary uppercase">{t.class}</span>
                            <span className="text-[9px] text-on-surface-variant">{t.rating}</span>
                          </div>
                          <p className="text-[11px] font-bold text-on-surface">${t.sizeINR.toLocaleString()}M</p>
                          <p className="text-[9px] text-on-surface-variant">{t.coupon}% · {t.tenorYears}yr</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Waiting for SA */}
      {pending.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[18px] text-tertiary">hourglass_empty</span>
            <h2 className="text-label-caps font-bold text-on-surface tracking-widest">WAITING FOR SA</h2>
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-tertiary text-on-tertiary text-[10px] font-bold">{pending.length}</span>
          </div>
          <div className="space-y-2">
            {pending.map(pool => (
              <div key={pool.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 flex items-center gap-4 px-5 py-3.5">
                <div className="w-8 h-8 rounded-lg bg-tertiary/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-tertiary text-[16px]">pending</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-caption font-bold text-on-surface truncate">{pool.name}</p>
                  <p className="text-[10px] text-on-surface-variant">
                    {pool.pmAllocations?.length ?? 0} assets · Requested {fmtDate(pool.createdAt)}
                  </p>
                </div>
                <StatusBadge status="REQUESTED" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Published */}
      {published.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[18px] text-secondary">deployed_code</span>
            <h2 className="text-label-caps font-bold text-on-surface tracking-widest">PUBLISHED TO INVESTORS</h2>
          </div>
          <div className="space-y-2">
            {published.map(pool => {
              const totalSub = pool.tranches.reduce((s, t) => s + t.subscribedINR, 0)
              const fillPct  = pool.totalSizeINR > 0 ? Math.round((totalSub / pool.totalSizeINR) * 100) : 0
              return (
                <div key={pool.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 flex items-center gap-4 px-5 py-3.5 shadow-card">
                  <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-secondary text-[16px]">deployed_code</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-caption font-bold text-on-surface truncate">{pool.name}</p>
                    <p className="text-[10px] text-on-surface-variant">${pool.totalSizeINR.toLocaleString()}M · {fillPct}% subscribed</p>
                  </div>
                  <StatusBadge status="LISTED" />
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {myPools.length === 0 && !showForm && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-[32px] text-outline">workspaces</span>
          </div>
          <h2 className="text-headline-md text-on-surface mb-2">No pool requests yet</h2>
          <p className="text-body-base text-on-surface-variant max-w-sm">
            Select tokenised assets from the SA and submit your first pool composition request.
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Page shell ───────────────────────────────────────────────────────────────

export default function PoolRequestsPage() {
  const { user, token } = useAuth()
  const role = user?.role

  return (
    <div className="py-gutter space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-display-lg text-on-surface">Pool Requests</h1>
        <p className="text-body-base text-on-surface-variant mt-1">
          {role === 'securitisation_agent'
            ? 'Review pool composition requests from portfolio managers, structure tranches, and approve.'
            : 'Request pool structures from the securitisation agent, then publish to investors once approved.'}
        </p>
      </div>

      {/* Role-specific view */}
      {!token || !user ? (
        <div className="flex items-center justify-center py-24">
          <span className="material-symbols-outlined text-[32px] text-on-surface-variant animate-spin">progress_activity</span>
        </div>
      ) : role === 'securitisation_agent' ? (
        <SAView authToken={token} />
      ) : role === 'portfolio_manager' ? (
        <PMView authToken={token} userId={user.id} />
      ) : (
        <div className="flex items-center gap-3 px-5 py-4 bg-surface-container rounded-xl border border-outline-variant/40">
          <span className="material-symbols-outlined text-outline text-[20px]">lock</span>
          <p className="text-caption text-on-surface-variant">This page is for securitisation agents and portfolio managers.</p>
        </div>
      )}
    </div>
  )
}
