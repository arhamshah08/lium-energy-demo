'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/auth/auth-context'
import type { Pool, Project } from '@/types'

const STATUS_LABEL: Record<Pool['status'], { label: string; cls: string }> = {
  STRUCTURING: { label: 'Structuring',   cls: 'bg-outline-variant/30 text-on-surface-variant' },
  RATED:       { label: 'Rated',         cls: 'bg-tertiary/10 text-tertiary' },
  LISTED:      { label: 'Listed',        cls: 'bg-secondary/10 text-secondary' },
  CLOSED:      { label: 'Closed',        cls: 'bg-primary/10 text-primary' },
  REDEEMED:    { label: 'Redeemed',      cls: 'bg-outline-variant/30 text-on-surface-variant' },
  REQUESTED:   { label: 'Requested',     cls: 'bg-tertiary/10 text-tertiary' },
  PM_APPROVED: { label: 'PM Approved',   cls: 'bg-secondary/10 text-secondary' },
}

const TRANCHE_COLORS: Record<string, string> = {
  SENIOR: 'bg-secondary', MEZZANINE: 'bg-primary', JUNIOR: 'bg-tertiary', EQUITY: 'bg-outline',
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function SecuritiesPage() {
  const { token, user } = useAuth()
  const [tab, setTab] = useState<'overview' | 'pools'>('overview')
  const [pools, setPools] = useState<Pool[]>([])
  const [pipeline, setPipeline] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    if (!token) return
    Promise.all([
      fetch('/api/securities', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/projects', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([poolsRes, projectsRes]) => {
      if (poolsRes.ok) setPools(poolsRes.data ?? [])
      if (projectsRes.ok) {
        const all: Project[] = projectsRes.data ?? []
        setPipeline(all.filter(p => p.status === 'PUBLISHED_FOR_SA' || p.status === 'TRANSACTING'))
      }
    }).finally(() => setLoading(false))
  }, [token])

  useEffect(() => { load() }, [load])

  const totalAUM       = pools.reduce((s, p) => s + p.totalSizeINR, 0)
  const listed         = pools.filter(p => p.status === 'LISTED').length
  const structuring    = pools.filter(p => p.status === 'STRUCTURING').length
  const avgDSCR        = pools.length ? (pools.reduce((s, p) => s + p.overallDSCR, 0) / pools.length).toFixed(2) : '—'
  const availableForSA = pipeline.filter(p => p.status === 'PUBLISHED_FOR_SA').length
  const inProgress     = pipeline.filter(p => p.status === 'TRANSACTING').length

  const TABS = [
    { id: 'overview' as const, label: 'Command Center', icon: 'dashboard' },
    { id: 'pools'    as const, label: 'Pools',          icon: 'hub' },
  ]

  return (
    <div className="py-gutter space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-display-lg text-on-surface">Securities</h1>
          <p className="text-body-base text-on-surface-variant mt-1">
            Asset-backed deal flow, structured pools, and live performance
          </p>
        </div>
        <Link
          href="/securities/new"
          className="inline-flex items-center gap-2 bg-secondary text-on-secondary px-6 py-3 rounded-lg text-label-caps font-bold hover:opacity-90 transition-all shadow-sm shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Pool
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-outline-variant/40">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-2 px-5 py-2.5 text-label-caps font-bold border-b-2 -mb-px transition-all ${
              tab === t.id
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab === 'overview' && (
        <div className="space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: 'Ready to Securitise', value: availableForSA, icon: 'pending_actions',   border: 'border-l-secondary',       iconColor: 'text-secondary', href: '/projects' },
              { label: 'Being Structured',     value: inProgress,    icon: 'construction',      border: 'border-l-tertiary',        iconColor: 'text-tertiary',  href: '/projects' },
              { label: 'Active Pools',         value: listed,        icon: 'storefront',        border: 'border-l-primary',         iconColor: 'text-primary',   href: null },
              { label: 'Pools in Progress',    value: structuring,   icon: 'hub',               border: 'border-l-outline-variant', iconColor: 'text-on-surface-variant', href: null },
              { label: 'Total AUM ($M)',       value: `$${totalAUM.toLocaleString()}`, icon: 'payments', border: 'border-l-secondary', iconColor: 'text-secondary', href: null },
              { label: 'Avg DSCR',             value: avgDSCR !== '—' ? `${avgDSCR}x` : '—', icon: 'waterfall_chart', border: 'border-l-tertiary', iconColor: 'text-tertiary', href: null },
            ].map(({ label, value, icon, border, iconColor, href }) => {
              const inner = (
                <div className={`bg-surface-container-lowest rounded-xl border border-outline-variant/60 border-l-4 ${border} p-5 shadow-card h-full`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`material-symbols-outlined text-[18px] ${iconColor}`}>{icon}</span>
                    <p className="text-label-caps text-on-surface-variant">{label}</p>
                  </div>
                  <p className={`text-data-point font-bold text-on-surface ${href ? 'group-hover:text-primary transition-colors' : ''}`}>{value}</p>
                  {href && <p className="text-[10px] text-secondary mt-1">View pipeline →</p>}
                </div>
              )
              return href ? (
                <Link key={label} href={href} className="group block">{inner}</Link>
              ) : (
                <div key={label}>{inner}</div>
              )
            })}
          </div>

          {/* Asset pipeline preview */}
          {pipeline.length > 0 && (
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 shadow-card overflow-hidden">
              <div className="px-6 pt-5 pb-4 border-b border-outline-variant/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary text-[20px]">pending_actions</span>
                  <h2 className="text-label-caps font-bold text-on-surface tracking-widest">Asset Pipeline</h2>
                </div>
                <Link href="/projects" className="text-[10px] font-bold text-secondary uppercase tracking-wide hover:underline">
                  View all →
                </Link>
              </div>
              <div className="divide-y divide-outline-variant/20">
                {pipeline.slice(0, 5).map(project => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="flex items-center gap-4 px-6 py-3.5 hover:bg-surface-container/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-on-surface truncate">{project.name}</p>
                      <p className="text-[11px] text-on-surface-variant">{project.assetType.replace(/_/g, ' ')} · {project.location}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {project.financials?.totalCapexM != null && (
                        <span className="text-[11px] font-semibold text-on-surface">${project.financials.totalCapexM}M</span>
                      )}
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                        project.status === 'PUBLISHED_FOR_SA'
                          ? 'bg-secondary/10 text-secondary'
                          : 'bg-primary/10 text-primary'
                      }`}>
                        {project.status === 'PUBLISHED_FOR_SA' ? 'Available' : 'In Progress'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Pool performance strip (only if there are pools) */}
          {pools.length > 0 && (
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 shadow-card overflow-hidden">
              <div className="px-6 pt-5 pb-4 border-b border-outline-variant/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[20px]">hub</span>
                  <h2 className="text-label-caps font-bold text-on-surface tracking-widest">Pool Performance</h2>
                </div>
                <button onClick={() => setTab('pools')} className="text-[10px] font-bold text-primary uppercase tracking-wide hover:underline">
                  All pools →
                </button>
              </div>
              <div className="divide-y divide-outline-variant/20">
                {pools.slice(0, 3).map(pool => {
                  const totalSub = pool.tranches.reduce((s, t) => s + t.subscribedINR, 0)
                  const subPct = pool.totalSizeINR > 0 ? Math.round((totalSub / pool.totalSizeINR) * 100) : 0
                  const { label, cls } = STATUS_LABEL[pool.status]
                  return (
                    <Link key={pool.id} href={`/securities/${pool.id}`} className="flex items-center gap-4 px-6 py-3.5 hover:bg-surface-container/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-on-surface truncate">{pool.name}</p>
                        <p className="text-[11px] text-on-surface-variant">
                          {pool.tokenIds.length} asset{pool.tokenIds.length !== 1 ? 's' : ''} · Created {fmtDate(pool.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right hidden sm:block">
                          <p className="text-[12px] font-bold text-on-surface">${pool.totalSizeINR.toLocaleString()}M</p>
                          <p className="text-[10px] text-on-surface-variant">{subPct}% subscribed</p>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${cls}`}>{label}</span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {!loading && pools.length === 0 && pipeline.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[32px] text-outline">hub</span>
              </div>
              <h2 className="text-headline-md text-on-surface mb-2">No activity yet</h2>
              <p className="text-body-base text-on-surface-variant max-w-sm mb-6">
                Once developers publish assets for securitisation, they'll appear here. You can then structure them into pools.
              </p>
              <Link href="/projects" className="inline-flex items-center gap-2 bg-secondary text-on-secondary px-6 py-2.5 rounded-lg text-label-caps font-bold hover:opacity-90 transition-all">
                <span className="material-symbols-outlined text-[16px]">search</span>
                View Asset Pipeline
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ── POOLS TAB ── */}
      {tab === 'pools' && (
        <div className="space-y-5">
          {pools.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[32px] text-outline">hub</span>
              </div>
              <h2 className="text-headline-md text-on-surface mb-2">No pools structured yet</h2>
              <p className="text-body-base text-on-surface-variant max-w-sm mb-6">
                Pick assets from the Command Center pipeline and click New Pool to create your first.
              </p>
              <Link href="/securities/new" className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-2.5 rounded-lg text-label-caps font-bold hover:opacity-90 transition-all">
                <span className="material-symbols-outlined text-[16px]">add</span>
                Structure First Pool
              </Link>
            </div>
          ) : (
            pools.map(pool => {
              const totalSubscribed = pool.tranches.reduce((s, t) => s + t.subscribedINR, 0)
              const subscriptionPct = pool.totalSizeINR > 0 ? Math.round((totalSubscribed / pool.totalSizeINR) * 100) : 0
              const { label, cls } = STATUS_LABEL[pool.status]
              return (
                <Link
                  key={pool.id}
                  href={`/securities/${pool.id}`}
                  className="block bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all overflow-hidden"
                >
                  <div className="flex items-start gap-5 p-6 pb-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[24px] text-secondary">hub</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-bold text-on-surface text-headline-md">{pool.name}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cls}`}>{label}</span>
                      </div>
                      <p className="text-caption text-on-surface-variant">
                        {pool.tokenIds.length} asset{pool.tokenIds.length !== 1 ? 's' : ''} · {pool.tranches.length} tranches · {pool.arranger}
                      </p>
                      <p className="text-[10px] text-on-surface-variant/60 mt-0.5">
                        Created {fmtDate(pool.createdAt)}{pool.ratingAgency ? ` · Rated by ${pool.ratingAgency}` : ' · Unrated'}
                      </p>
                    </div>
                    <div className="text-right shrink-0 hidden md:block">
                      <p className="text-data-point font-bold text-on-surface">${pool.totalSizeINR.toLocaleString()}M</p>
                      <p className="text-label-caps text-on-surface-variant">POOL SIZE</p>
                    </div>
                  </div>

                  {/* Tranche bar */}
                  {pool.tranches.length > 0 && (
                    <div className="px-6 pb-2">
                      <div className="flex h-5 rounded-lg overflow-hidden gap-px">
                        {pool.tranches.map(t => (
                          <div
                            key={t.id}
                            className={`${TRANCHE_COLORS[t.class] ?? 'bg-outline'} flex items-center justify-center`}
                            style={{ width: `${(t.sizeINR / pool.totalSizeINR) * 100}%` }}
                            title={`${t.class} — $${t.sizeINR}M @ ${t.coupon}% — ${t.rating}`}
                          >
                            <span className="text-[9px] font-bold text-white">{t.rating}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between mt-1 px-0.5">
                        {pool.tranches.map(t => (
                          <span key={t.id} className="text-[9px] text-on-surface-variant">{t.class.charAt(0) + t.class.slice(1).toLowerCase()}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bottom metrics */}
                  <div className="px-6 pb-5 pt-3 flex items-center gap-6 flex-wrap border-t border-outline-variant/20 mt-2">
                    {[
                      { label: 'DSCR',        value: `${pool.overallDSCR.toFixed(2)}x` },
                      { label: 'LQ Score',    value: pool.overallLQ.toFixed(3) },
                      { label: 'OC',          value: `${pool.oc}%` },
                      { label: 'Subscribed',  value: `${subscriptionPct}%` },
                      { label: 'Tranches',    value: pool.tranches.length },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-data-point font-bold text-on-surface text-[16px]">{value}</p>
                        <p className="text-label-caps text-on-surface-variant">{label}</p>
                      </div>
                    ))}
                  </div>
                </Link>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
