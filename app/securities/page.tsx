import Link from 'next/link'
import { listPools } from '@/lib/token-store'
import type { Pool } from '@/types'

export const dynamic = 'force-dynamic'

const POOL_STATUS_COLORS: Record<Pool['status'], string> = {
  STRUCTURING: 'bg-outline/10 text-outline',
  RATED:       'bg-tertiary/10 text-tertiary',
  LISTED:      'bg-secondary/10 text-secondary',
  CLOSED:      'bg-primary/10 text-primary',
  REDEEMED:    'bg-outline/10 text-outline',
}

const TRANCHE_COLORS: Record<string, string> = {
  SENIOR:    'bg-secondary',
  MEZZANINE: 'bg-primary',
  JUNIOR:    'bg-tertiary',
  EQUITY:    'bg-outline',
}

export default async function SecuritiesPage() {
  const pools = await listPools()

  const totalAUM     = pools.reduce((s, p) => s + p.totalSizeINR, 0)
  const listed       = pools.filter(p => p.status === 'LISTED').length
  const totalTranches = pools.reduce((s, p) => s + p.tranches.length, 0)
  const avgDSCR      = pools.length ? (pools.reduce((s, p) => s + p.overallDSCR, 0) / pools.length) : 0

  return (
    <div className="py-gutter space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-display-lg text-on-surface">Securities Pools</h1>
          <p className="text-body-base text-on-surface-variant mt-1">
            Structured energy asset-backed securities — tranched and rated
          </p>
        </div>
        <Link
          href="/securities/new"
          className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-lg text-label-caps font-bold hover:opacity-90 transition-all shadow-sm shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Pool
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Pools',     value: pools.length,             icon: 'hub',          accent: '' },
          { label: 'AUM (₹ Mn)',     value: `${totalAUM.toLocaleString()}`, icon: 'payments',    accent: 'text-secondary' },
          { label: 'Listed',          value: listed,                   icon: 'storefront',   accent: 'text-secondary' },
          { label: 'Avg DSCR',        value: `${avgDSCR.toFixed(2)}x`, icon: 'waterfall_chart', accent: 'text-primary' },
        ].map(({ label, value, icon, accent }) => (
          <div key={label} className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 p-5 shadow-card">
            <div className="flex items-center gap-2 mb-2">
              <span className={`material-symbols-outlined text-[18px] ${accent || 'text-on-surface-variant'}`}>{icon}</span>
              <p className="text-label-caps text-on-surface-variant">{label}</p>
            </div>
            <p className={`text-data-point font-bold ${accent || 'text-on-surface'}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Pools */}
      {pools.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-2xl bg-surface-container-high flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-[40px] text-outline">hub</span>
          </div>
          <h2 className="text-headline-md text-on-surface mb-2">No pools structured yet</h2>
          <p className="text-body-base text-on-surface-variant max-w-sm mb-8">
            Issue tokens from submitted assets, then structure them into a securitisation pool.
          </p>
          <Link
            href="/securities/new"
            className="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-3 rounded-lg text-label-caps font-bold hover:opacity-90 transition-all"
          >
            Create First Pool
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {pools.map(pool => {
            const totalSubscribed = pool.tranches.reduce((s, t) => s + t.subscribedINR, 0)
            const subscriptionPct = pool.totalSizeINR > 0 ? (totalSubscribed / pool.totalSizeINR) * 100 : 0

            return (
              <Link
                key={pool.id}
                href={`/securities/${pool.id}`}
                className="block bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all overflow-hidden"
              >
                {/* Top row */}
                <div className="flex items-start gap-5 p-6 pb-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[24px] text-secondary">hub</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-bold text-on-surface text-headline-md">{pool.name}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${POOL_STATUS_COLORS[pool.status]}`}>
                        {pool.status}
                      </span>
                    </div>
                    <p className="text-caption text-on-surface-variant">
                      {pool.arranger} · {pool.ratingAgency ?? 'Unrated'} · {pool.tokenIds.length} asset{pool.tokenIds.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right shrink-0 hidden md:block">
                    <p className="text-data-point font-bold text-on-surface">₹{pool.totalSizeINR.toLocaleString()} Mn</p>
                    <p className="text-label-caps text-on-surface-variant">POOL SIZE</p>
                  </div>
                  <span className="material-symbols-outlined text-outline text-[20px] shrink-0">chevron_right</span>
                </div>

                {/* Tranche bar */}
                <div className="px-6 pb-2">
                  <div className="flex h-6 rounded-lg overflow-hidden">
                    {pool.tranches.map(t => (
                      <div
                        key={t.id}
                        className={`${TRANCHE_COLORS[t.class] ?? 'bg-outline'} flex items-center justify-center`}
                        style={{ width: `${(t.sizeINR / pool.totalSizeINR) * 100}%` }}
                        title={`${t.class} ₹${t.sizeINR} Mn @ ${t.coupon}%`}
                      >
                        <span className="text-[9px] font-bold text-white">{t.rating}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom metrics */}
                <div className="px-6 pb-5 pt-3 flex items-center gap-6 flex-wrap border-t border-outline-variant/20 mt-3">
                  {[
                    { label: 'DSCR',         value: `${pool.overallDSCR.toFixed(2)}x` },
                    { label: 'LQ',           value: pool.overallLQ.toFixed(3) },
                    { label: 'OC',           value: `${pool.oc}%` },
                    { label: 'Subscribed',   value: `${subscriptionPct.toFixed(0)}%` },
                    { label: 'Tranches',     value: pool.tranches.length },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-data-point font-bold text-on-surface text-[16px]">{value}</p>
                      <p className="text-label-caps text-on-surface-variant">{label}</p>
                    </div>
                  ))}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
