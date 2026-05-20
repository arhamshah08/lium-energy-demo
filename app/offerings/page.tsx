'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/auth/auth-context'
import { cn } from '@/lib/utils'
import type { Pool } from '@/types'

const TRANCHE_COLORS: Record<string, string> = {
  SENIOR: 'bg-secondary', MEZZANINE: 'bg-primary', JUNIOR: 'bg-tertiary', EQUITY: 'bg-error',
}

const TRANCHE_ACCENT: Record<string, string> = {
  SENIOR: 'text-secondary bg-secondary/10', MEZZANINE: 'text-primary bg-primary/10',
  JUNIOR: 'text-tertiary bg-tertiary/10', EQUITY: 'text-error bg-error/10',
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function OfferingsPage() {
  const { user, token } = useAuth()
  const [pools, setPools] = useState<Pool[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token || !user) return
    fetch('/api/pools', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(json => {
        if (!json.ok) return
        const all: Pool[] = json.data ?? []
        setPools(all.filter(p => p.requestedByPmId === user.id && p.status === 'LISTED'))
      })
      .finally(() => setLoading(false))
  }, [token, user])

  const totalAUM        = pools.reduce((s, p) => s + p.totalSizeINR, 0)
  const totalSubscribed = pools.reduce((s, p) => s + p.tranches.reduce((ts, t) => ts + t.subscribedINR, 0), 0)
  const fillRate        = totalAUM > 0 ? Math.round((totalSubscribed / totalAUM) * 100) : 0
  const totalInvestors  = pools.reduce((s, p) => s + p.tranches.reduce((ts, t) => ts + t.subscribers.length, 0), 0)

  if (loading) {
    return (
      <div className="py-gutter flex items-center justify-center py-24">
        <span className="material-symbols-outlined text-[32px] text-on-surface-variant animate-spin">progress_activity</span>
      </div>
    )
  }

  return (
    <div className="py-gutter space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-display-lg text-on-surface">My Offerings</h1>
          <p className="text-body-base text-on-surface-variant mt-1">
            Live pools published to investors — subscription activity and tranche fill rates
          </p>
        </div>
        <Link
          href="/pool-requests"
          className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-lg text-label-caps font-bold hover:opacity-90 transition-all shadow-sm shrink-0"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          New Pool Request
        </Link>
      </div>

      {/* KPI strip */}
      {pools.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Active Offerings', value: pools.length,                      icon: 'deployed_code', accent: 'text-primary' },
            { label: 'Total AUM ($M)',   value: `$${totalAUM.toLocaleString()}`,    icon: 'payments',      accent: 'text-secondary' },
            { label: 'Fill Rate',        value: `${fillRate}%`,                     icon: 'show_chart',    accent: 'text-tertiary' },
            { label: 'Total Investors',  value: totalInvestors,                     icon: 'groups',        accent: 'text-secondary' },
          ].map(({ label, value, icon, accent }) => (
            <div key={label} className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 p-5 shadow-card">
              <div className="flex items-center gap-2 mb-2">
                <span className={`material-symbols-outlined text-[18px] ${accent}`}>{icon}</span>
                <p className="text-label-caps text-on-surface-variant">{label}</p>
              </div>
              <p className={`text-data-point font-bold ${accent}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Pool cards */}
      {pools.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-[32px] text-outline">deployed_code</span>
          </div>
          <h2 className="text-headline-md text-on-surface mb-2">No live offerings yet</h2>
          <p className="text-body-base text-on-surface-variant max-w-sm mb-6">
            Request a pool structure from the securitisation agent, then publish it here for investors to subscribe.
          </p>
          <Link
            href="/pool-requests"
            className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-2.5 rounded-lg text-label-caps font-bold hover:opacity-90 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Request Your First Pool
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {pools.map(pool => {
            const sub    = pool.tranches.reduce((s, t) => s + t.subscribedINR, 0)
            const fillPct = pool.totalSizeINR > 0 ? (sub / pool.totalSizeINR) * 100 : 0
            const investors = pool.tranches.reduce((s, t) => s + t.subscribers.length, 0)
            const yieldRange = pool.tranches.length > 0
              ? `${Math.min(...pool.tranches.map(t => t.coupon)).toFixed(1)}–${Math.max(...pool.tranches.map(t => t.coupon)).toFixed(1)}%`
              : '—'

            return (
              <div key={pool.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-card overflow-hidden">
                {/* Pool header */}
                <div className="flex items-start gap-5 p-6 pb-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[24px] text-secondary">deployed_code</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-bold text-on-surface text-headline-md">{pool.name}</h3>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide bg-secondary/10 text-secondary">
                        Live
                      </span>
                    </div>
                    <p className="text-caption text-on-surface-variant">
                      {pool.tranches.length} tranche{pool.tranches.length !== 1 ? 's' : ''} · {pool.tokenIds.length} asset{pool.tokenIds.length !== 1 ? 's' : ''} · Listed {fmtDate(pool.listedAt ?? pool.createdAt)}
                    </p>
                  </div>
                  <div className="text-right shrink-0 hidden md:block">
                    <p className="text-data-point font-bold text-on-surface">${pool.totalSizeINR.toLocaleString()}M</p>
                    <p className="text-label-caps text-on-surface-variant">POOL SIZE</p>
                  </div>
                </div>

                {/* Tranche waterfall bar */}
                {pool.tranches.length > 0 && (
                  <div className="px-6 pb-3">
                    <div className="flex h-4 rounded-lg overflow-hidden gap-px">
                      {pool.tranches.map(t => (
                        <div
                          key={t.id}
                          className={`${TRANCHE_COLORS[t.class] ?? 'bg-outline'} flex items-center justify-center`}
                          style={{ width: `${(t.sizeINR / pool.totalSizeINR) * 100}%` }}
                          title={`${t.class} · ${t.rating} · $${t.sizeINR}M @ ${t.coupon}%`}
                        >
                          <span className="text-[8px] font-bold text-white hidden sm:block">{t.rating}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Subscription fill bar */}
                <div className="px-6 pb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Subscription Fill</p>
                    <p className="text-[10px] font-bold text-on-surface">{fillPct.toFixed(1)}% · ${sub.toLocaleString()}M of ${pool.totalSizeINR.toLocaleString()}M</p>
                  </div>
                  <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div
                      className="h-full bg-secondary rounded-full transition-all"
                      style={{ width: `${Math.min(fillPct, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Metrics row */}
                <div className="px-6 pb-5 pt-3 border-t border-outline-variant/20 flex items-center gap-6 flex-wrap">
                  {[
                    { label: 'Yield Range', value: yieldRange },
                    { label: 'Investors',   value: investors },
                    { label: 'DSCR',        value: pool.overallDSCR > 0 ? `${pool.overallDSCR.toFixed(2)}x` : '—' },
                    { label: 'OC',          value: pool.oc > 0 ? `${pool.oc}%` : '—' },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-[14px] font-bold text-on-surface">{value}</p>
                      <p className="text-label-caps text-on-surface-variant">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Per-tranche subscriber breakdown */}
                {pool.tranches.some(t => t.subscribers.length > 0) && (
                  <div className="border-t border-outline-variant/20 px-6 py-4 space-y-3">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-3">Tranche Subscriptions</p>
                    {pool.tranches.map(t => {
                      const tFill = t.sizeINR > 0 ? (t.subscribedINR / t.sizeINR) * 100 : 0
                      return (
                        <div key={t.id}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase', TRANCHE_ACCENT[t.class] ?? 'text-on-surface-variant bg-surface-container')}>{t.class}</span>
                            <span className="text-[10px] text-on-surface-variant">{t.rating} · ${t.sizeINR.toLocaleString()}M · {t.coupon}%</span>
                            <span className="ml-auto text-[10px] font-bold text-on-surface">{tFill.toFixed(1)}%</span>
                          </div>
                          <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                            <div
                              className={`h-full ${TRANCHE_COLORS[t.class] ?? 'bg-outline'} rounded-full transition-all`}
                              style={{ width: `${Math.min(tFill, 100)}%` }}
                            />
                          </div>
                          {t.subscribers.length > 0 && (
                            <div className="mt-1.5 flex flex-wrap gap-1.5">
                              {t.subscribers.map(s => (
                                <span key={s.id} className="text-[9px] bg-surface-container px-2 py-0.5 rounded-full text-on-surface-variant">
                                  {s.investorType.replace(/_/g, ' ')} · ${s.amountINR.toLocaleString()}M
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
