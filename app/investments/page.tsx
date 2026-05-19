'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/auth/auth-context'
import type { Pool, Tranche, TrancheSubscriber } from '@/types'

interface MyPosition {
  pool: Pool
  tranche: Tranche
  subscription: TrancheSubscriber
}

const CLASS_CFG = {
  SENIOR:    { accent: 'text-secondary', bg: 'bg-secondary/10', bar: 'bg-secondary', icon: 'shield',      border: 'border-l-secondary' },
  MEZZANINE: { accent: 'text-primary',   bg: 'bg-primary/10',   bar: 'bg-primary',   icon: 'balance',     border: 'border-l-primary' },
  JUNIOR:    { accent: 'text-tertiary',  bg: 'bg-tertiary/10',  bar: 'bg-tertiary',  icon: 'trending_up', border: 'border-l-tertiary' },
  EQUITY:    { accent: 'text-error',     bg: 'bg-error/10',     bar: 'bg-error',     icon: 'bolt',        border: 'border-l-error' },
} as const

export default function InvestmentsPage() {
  const { user, token } = useAuth()
  const [positions, setPositions] = useState<MyPosition[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token || !user) return
    fetch('/api/pools', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(json => {
        if (!json.ok) return
        const pools: Pool[] = json.data
        const found: MyPosition[] = []
        for (const pool of pools) {
          for (const tranche of pool.tranches) {
            for (const sub of tranche.subscribers) {
              if (sub.investorId === user.id) {
                found.push({ pool, tranche, subscription: sub })
              }
            }
          }
        }
        setPositions(found)
      })
      .finally(() => setLoading(false))
  }, [token, user])

  const totalInvested = positions.reduce((s, p) => s + p.subscription.amountINR, 0)
  const weightedYield = positions.length > 0
    ? positions.reduce((s, p) => s + p.tranche.coupon * p.subscription.amountINR, 0) / totalInvested
    : 0
  const activePools = new Set(positions.map(p => p.pool.id)).size

  if (loading) {
    return (
      <div className="py-gutter space-y-8">
        <div className="h-10 w-56 bg-surface-container-high rounded-lg animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 p-5 h-24 animate-pulse" />
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 p-6 h-32 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="py-gutter space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-display-lg text-on-surface">My Investments</h1>
          <p className="text-body-base text-on-surface-variant mt-1">
            Your subscriptions across all LIUM structured securities
          </p>
        </div>
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-lg text-label-caps font-bold hover:opacity-90 transition-all shadow-sm shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">storefront</span>
          Browse Marketplace
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Invested',    value: `$${totalInvested.toLocaleString()}M`,  icon: 'savings',       border: 'border-l-secondary', accent: 'text-secondary' },
          { label: 'Avg Yield',         value: `${weightedYield.toFixed(1)}%`,          icon: 'trending_up',   border: 'border-l-primary',   accent: 'text-primary' },
          { label: 'Active Pools',      value: activePools,                              icon: 'hub',           border: 'border-l-tertiary',  accent: 'text-tertiary' },
          { label: 'Positions',         value: positions.length,                         icon: 'description',   border: 'border-l-outline-variant', accent: 'text-on-surface' },
        ].map(({ label, value, icon, border, accent }) => (
          <div key={label} className={`bg-surface-container-lowest rounded-xl border border-outline-variant/60 border-l-4 ${border} p-5 shadow-card`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`material-symbols-outlined text-[18px] ${accent}`}>{icon}</span>
              <p className="text-label-caps text-on-surface-variant">{label}</p>
            </div>
            <p className={`text-data-point font-bold ${accent}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Positions */}
      {positions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-2xl bg-surface-container-high flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-[40px] text-outline">savings</span>
          </div>
          <h2 className="text-headline-md text-on-surface mb-2">No investments yet</h2>
          <p className="text-body-base text-on-surface-variant max-w-sm mb-8">
            Subscribe to tranches in the marketplace to start building your clean energy portfolio.
          </p>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-3 rounded-lg text-label-caps font-bold hover:opacity-90 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">storefront</span>
            Go to Marketplace
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {positions.map(({ pool, tranche, subscription }) => {
            const cfg = CLASS_CFG[tranche.class as keyof typeof CLASS_CFG] ?? CLASS_CFG.SENIOR
            const pct = tranche.sizeINR > 0 ? (tranche.subscribedINR / tranche.sizeINR) * 100 : 0
            const myShare = tranche.sizeINR > 0 ? (subscription.amountINR / tranche.sizeINR) * 100 : 0
            const annualIncome = subscription.amountINR * (tranche.coupon / 100)
            return (
              <div
                key={subscription.id}
                className={`bg-surface-container-lowest rounded-xl border border-outline-variant/60 border-l-4 ${cfg.border} shadow-card overflow-hidden`}
              >
                <div className="px-6 py-4 flex items-center justify-between gap-4 border-b border-outline-variant/30">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
                      <span className={`material-symbols-outlined text-[18px] ${cfg.accent}`}>{cfg.icon}</span>
                    </div>
                    <div>
                      <p className="text-caption font-bold text-on-surface">
                        {tranche.class} Tranche
                        {tranche.rating && (
                          <span className={`ml-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.accent}`}>{tranche.rating}</span>
                        )}
                      </p>
                      <Link href={`/securities/${pool.id}`} className="text-[11px] text-on-surface-variant hover:text-primary transition-colors">
                        {pool.name}
                      </Link>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-caption font-bold text-on-surface">${subscription.amountINR.toLocaleString()}M</p>
                    <p className="text-[10px] text-on-surface-variant">
                      {new Date(subscription.subscribedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wide mb-0.5">Annual Yield</p>
                    <p className={`text-caption font-bold ${cfg.accent}`}>{tranche.coupon}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wide mb-0.5">Est. Annual Income</p>
                    <p className="text-caption font-bold text-on-surface">${annualIncome.toFixed(2)}M</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wide mb-0.5">Tenor</p>
                    <p className="text-caption font-bold text-on-surface">{tranche.tenorYears} yr</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wide mb-0.5">My Share</p>
                    <p className="text-caption font-bold text-on-surface">{myShare.toFixed(1)}% of tranche</p>
                  </div>
                </div>

                {/* Tranche fill bar */}
                <div className="px-6 pb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] text-on-surface-variant">Tranche fill</span>
                    <span className="text-[10px] font-bold text-on-surface">{pct.toFixed(0)}% · {tranche.subscribers.length} subscribers</span>
                  </div>
                  <div className="h-1.5 bg-outline-variant/20 rounded-full overflow-hidden">
                    <div className={`h-full ${cfg.bar} rounded-full`} style={{ width: `${Math.max(pct, 2)}%` }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
