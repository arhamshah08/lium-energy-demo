'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Tranche } from '@/types'

export interface ExtendedTranche extends Tranche {
  poolName: string
  poolId: string
  poolStatus: string
  poolDSCR: number
  poolLQ: number
}

const CFG = {
  SENIOR: {
    badge:    'bg-secondary text-white',
    accent:   'text-secondary',
    bg:       'bg-secondary-container/25',
    border:   'border-secondary/20',
    bar:      'bg-secondary',
    lbar:     'border-l-secondary',
    icon:     'shield',
    risk:     'Conservative',
    target:   'Pension Funds · Insurance · DFIs',
  },
  MEZZANINE: {
    badge:    'bg-primary text-white',
    accent:   'text-primary',
    bg:       'bg-primary/5',
    border:   'border-primary/20',
    bar:      'bg-primary',
    lbar:     'border-l-primary',
    icon:     'balance',
    risk:     'Balanced',
    target:   'Credit Funds · DFIs · Sovereign Wealth',
  },
  JUNIOR: {
    badge:    'bg-tertiary text-white',
    accent:   'text-tertiary',
    bg:       'bg-tertiary/5',
    border:   'border-tertiary/20',
    bar:      'bg-tertiary',
    lbar:     'border-l-tertiary',
    icon:     'trending_up',
    risk:     'Growth',
    target:   'Alt Asset Managers · High Yield',
  },
} as const

type FilterKey = 'ALL' | 'SENIOR' | 'MEZZANINE' | 'JUNIOR'

function avg(arr: number[]) {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
}

export function MarketplaceView({ tranches }: { tranches: ExtendedTranche[] }) {
  const [filter, setFilter] = useState<FilterKey>('ALL')

  const filtered = filter === 'ALL' ? tranches : tranches.filter(t => t.class === filter)
  const totalAUM   = tranches.reduce((s, t) => s + t.sizeINR, 0)
  const avgYield   = avg(tranches.map(t => t.coupon))
  const subCount   = tranches.filter(t => t.status === 'SUBSCRIBED').length

  const yieldLadder = (['SENIOR', 'MEZZANINE', 'JUNIOR'] as const).map(cls => ({
    cls,
    yield: avg(tranches.filter(t => t.class === cls).map(t => t.coupon)) || { SENIOR: 8.5, MEZZANINE: 11.0, JUNIOR: 14.0 }[cls],
    rating: { SENIOR: 'AAA', MEZZANINE: 'BBB', JUNIOR: 'BB' }[cls],
    count: tranches.filter(t => t.class === cls).length,
    cfg: CFG[cls],
  }))

  return (
    <div className="py-gutter space-y-8">

      {/* ── Hero ── */}
      <div className="relative bg-on-surface rounded-2xl overflow-hidden p-8 lg:p-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1a2744] to-[#0d1f35]" />
        <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-white/[0.03]" />
        <div className="absolute right-10 -bottom-28 w-96 h-96 rounded-full bg-white/[0.04]" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-end gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-secondary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              <span className="text-label-caps text-secondary font-bold tracking-widest">LIUM FINTERNET SECURITIES</span>
            </div>
            <h1 className="text-[36px] lg:text-[44px] font-bold text-white leading-tight mb-2">
              Clean Energy<br />Finance Marketplace
            </h1>
            <p className="text-white/60 text-body-base max-w-md">
              Institutional-grade structured securities backed by IEEE 2030.5‑verified energy assets
            </p>
          </div>

          {/* Yield ladder */}
          <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
            {yieldLadder.map(({ cls, yield: y, rating, count, cfg }) => (
              <button
                key={cls}
                onClick={() => setFilter(filter === cls ? 'ALL' : cls)}
                className={`${cfg.bg} ${cfg.border} border rounded-xl p-4 text-left backdrop-blur-sm transition-all hover:scale-105 ${filter === cls ? 'ring-2 ring-white/30 scale-105' : ''}`}
              >
                <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest mb-1.5">{cls}</p>
                <p className={`text-[28px] font-bold leading-none ${cfg.accent}`}>{y.toFixed(1)}<span className="text-[14px]">%</span></p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${cfg.badge}`}>{rating}</span>
                  <span className="text-[9px] text-white/40">{count} listed</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total AUM',    value: `$${totalAUM.toLocaleString()}M`, icon: 'payments',       accent: 'text-secondary', lbar: 'border-l-secondary' },
          { label: 'Instruments',  value: tranches.length,                   icon: 'description',    accent: 'text-primary',   lbar: 'border-l-primary'   },
          { label: 'Avg Yield',    value: `${avgYield.toFixed(1)}%`,         icon: 'trending_up',    accent: 'text-tertiary',  lbar: 'border-l-tertiary'  },
          { label: 'Subscribed',   value: `${subCount}/${tranches.length}`,  icon: 'check_circle',   accent: 'text-secondary', lbar: 'border-l-secondary' },
        ].map(({ label, value, icon, accent, lbar }) => (
          <div key={label} className={`bg-surface-container-lowest rounded-xl border border-outline-variant/60 border-l-4 ${lbar} p-5 shadow-card`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`material-symbols-outlined text-[16px] ${accent}`}>{icon}</span>
              <p className="text-label-caps text-on-surface-variant">{label}</p>
            </div>
            <p className={`text-data-point font-bold ${accent}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Filter tabs ── */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['ALL', 'SENIOR', 'MEZZANINE', 'JUNIOR'] as FilterKey[]).map(f => {
          const count = f === 'ALL' ? tranches.length : tranches.filter(t => t.class === f).length
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-label-caps font-bold transition-all ${
                filter === f
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container-lowest border border-outline-variant text-on-surface-variant hover:text-on-surface hover:border-outline'
              }`}
            >
              {f === 'ALL' ? 'All' : f} <span className="opacity-60 ml-1">{count}</span>
            </button>
          )
        })}
      </div>

      {/* ── Cards ── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-28 text-center">
          <div className="w-20 h-20 rounded-2xl bg-surface-container-high flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-[40px] text-outline">storefront</span>
          </div>
          <h2 className="text-headline-md text-on-surface mb-2">No listings yet</h2>
          <p className="text-body-base text-on-surface-variant max-w-sm mb-8">
            Securitisation agents structure pools and list tranches here for investor subscription.
          </p>
          <Link href="/securities" className="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-3 rounded-lg text-label-caps font-bold hover:opacity-90 transition-all">
            <span className="material-symbols-outlined text-[16px]">hub</span>
            Structure a Pool
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(t => {
            const cfg = CFG[t.class as keyof typeof CFG] ?? CFG.SENIOR
            const pct = t.sizeINR > 0 ? (t.subscribedINR / t.sizeINR) * 100 : 0
            const remaining = t.sizeINR - t.subscribedINR
            const isListed  = t.poolStatus === 'LISTED'
            const isFull    = t.status === 'SUBSCRIBED'

            return (
              <div
                key={t.id}
                className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all overflow-hidden flex flex-col group"
              >
                {/* Header */}
                <div className={`px-5 py-4 ${cfg.bg} border-b ${cfg.border}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`material-symbols-outlined text-[18px] ${cfg.accent}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                        {cfg.icon}
                      </span>
                      <span className="text-label-caps font-bold text-on-surface">{t.class}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${cfg.badge}`}>{t.rating}</span>
                    </div>
                    {isFull ? (
                      <span className="text-[9px] font-bold bg-outline/10 text-outline-variant px-2 py-0.5 rounded-full uppercase tracking-wide">Closed</span>
                    ) : isListed ? (
                      <span className="text-[9px] font-bold bg-secondary/10 text-secondary px-2 py-0.5 rounded-full uppercase tracking-wide">Open</span>
                    ) : (
                      <span className="text-[9px] font-bold bg-tertiary/10 text-tertiary px-2 py-0.5 rounded-full uppercase tracking-wide">Structuring</span>
                    )}
                  </div>
                  <Link href={`/securities/${t.poolId}`} className="text-[11px] text-on-surface-variant hover:text-primary transition-colors mt-1 block">
                    {t.poolName}
                  </Link>
                </div>

                {/* Yield hero number */}
                <div className="px-5 pt-5 pb-4 flex items-end justify-between border-b border-outline-variant/20">
                  <div>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wide mb-0.5">Annual Yield</p>
                    <p className={`text-[44px] font-bold leading-none ${cfg.accent}`}>
                      {t.coupon}<span className="text-[20px] font-semibold">%</span>
                    </p>
                    <p className="text-[11px] text-on-surface-variant mt-1">{cfg.risk} · {cfg.risk === 'Conservative' ? 'First-loss protected' : cfg.risk === 'Balanced' ? 'Subordinated to Senior' : 'Highest potential return'}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <div>
                      <p className="text-[10px] text-on-surface-variant">Tenor</p>
                      <p className="text-caption font-bold text-on-surface">{t.tenorYears} yr</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-on-surface-variant">Size</p>
                      <p className="text-caption font-bold text-on-surface">${t.sizeINR.toLocaleString()}M</p>
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="px-5 py-3 grid grid-cols-2 gap-x-4 gap-y-2 border-b border-outline-variant/20">
                  <div>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wide">Pool DSCR</p>
                    <p className="text-caption font-bold text-on-surface">{t.poolDSCR > 0 ? `${t.poolDSCR.toFixed(2)}x` : '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wide">LQ Score</p>
                    <p className="text-caption font-bold text-on-surface">{t.poolLQ > 0 ? t.poolLQ.toFixed(3) : '—'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wide">Target Investors</p>
                    <p className="text-[11px] text-on-surface mt-0.5">{cfg.target}</p>
                  </div>
                </div>

                {/* Subscription progress */}
                <div className="px-5 py-3 flex-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] text-on-surface-variant uppercase tracking-wide">Fill</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-on-surface-variant">{t.subscribers.length} subscriber{t.subscribers.length !== 1 ? 's' : ''}</span>
                      <span className="text-[11px] font-bold text-on-surface">{pct.toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-outline-variant/20 rounded-full overflow-hidden">
                    <div className={`h-full ${cfg.bar} rounded-full transition-all`} style={{ width: `${Math.max(pct, 2)}%` }} />
                  </div>
                  <p className="text-[10px] text-on-surface-variant mt-1.5">
                    ${remaining.toLocaleString()}M remaining · ${t.subscribedINR.toLocaleString()}M filled
                  </p>
                </div>

                {/* CTA */}
                <div className="px-5 pb-5">
                  {isFull ? (
                    <div className="flex w-full items-center justify-center gap-2 bg-surface-container border border-outline-variant/60 py-3 rounded-xl text-label-caps font-bold text-on-surface-variant">
                      <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      Fully Subscribed
                    </div>
                  ) : (
                    <Link
                      href={`/securities/${t.poolId}`}
                      className="flex w-full items-center justify-center gap-2 bg-primary text-on-primary py-3 rounded-xl text-label-caps font-bold hover:opacity-90 transition-all group-hover:shadow-md"
                    >
                      <span className="material-symbols-outlined text-[16px]">{isListed ? 'add_circle' : 'visibility'}</span>
                      {isListed ? 'Subscribe Now' : 'View Pool'}
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Disclaimer */}
      <div className="flex items-start gap-3 bg-surface-container rounded-xl p-4 border border-outline-variant/40">
        <span className="material-symbols-outlined text-outline text-[16px] shrink-0 mt-0.5">info</span>
        <p className="text-[11px] text-on-surface-variant leading-relaxed">
          All instruments are backed by IEEE 2030.5‑verified energy assets. Rating methodologies follow Moody's/S&P structured finance criteria.
          LQ data verified on-chain via UNITS oracle. This is a demo platform — not financial advice.
        </p>
      </div>
    </div>
  )
}
